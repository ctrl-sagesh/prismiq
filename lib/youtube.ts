export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

interface OEmbedResponse {
  title?: string;
  author_name?: string;
}

interface CaptionTrack {
  languageCode: string;
  baseUrl: string;
}

interface PlayerResponse {
  videoDetails?: {
    title?: string;
    shortDescription?: string;
    lengthSeconds?: string;
    author?: string;
  };
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrack[];
    };
  };
}

// YouTube's official public oEmbed API — works from any IP, no auth needed.
// Returns title + author reliably even when watch page scraping fails.
async function fetchOEmbed(videoId: string): Promise<OEmbedResponse> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    );
    if (!res.ok) return {};
    return res.json() as Promise<OEmbedResponse>;
  } catch {
    return {};
  }
}

// Fetch watch page with consent cookies — used to get description + captions.
// May fail or return minimal content from Vercel IPs; always used as best-effort.
async function fetchWatchPage(videoId: string): Promise<string> {
  try {
    const res = await fetch(
      `https://www.youtube.com/watch?v=${videoId}&hl=en`,
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "en-US,en;q=0.9",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          Cookie:
            "CONSENT=YES+cb.20210328-17-p0.en+FX+294; SOCS=CAESEwgDEgk4OTI4NDM3NDEYASAB",
          "Cache-Control": "no-cache",
        },
      }
    );
    if (!res.ok) return "";
    return res.text();
  } catch {
    return "";
  }
}

function extractJson(html: string, ...markers: string[]): Record<string, unknown> | null {
  for (const marker of markers) {
    const idx = html.indexOf(marker);
    if (idx === -1) continue;
    const start = idx + marker.length;
    let jsonStart = start;
    while (jsonStart < html.length && html[jsonStart] !== "{") jsonStart++;
    if (jsonStart >= html.length) continue;
    let depth = 0, end = jsonStart;
    for (let i = jsonStart; i < html.length; i++) {
      if (html[i] === "{") depth++;
      else if (html[i] === "}") {
        depth--;
        if (depth === 0) { end = i + 1; break; }
      }
    }
    if (end <= jsonStart) continue;
    try {
      return JSON.parse(html.slice(jsonStart, end)) as Record<string, unknown>;
    } catch {
      continue;
    }
  }
  return null;
}

function extractDescriptionFromHtml(html: string): string {
  if (!html) return "";

  // Try JSON player response first
  const playerResponse = extractJson(
    html,
    "ytInitialPlayerResponse = ",
    "ytInitialPlayerResponse=",
    "var ytInitialPlayerResponse = ",
    "var ytInitialPlayerResponse="
  ) as PlayerResponse | null;

  if (playerResponse?.videoDetails?.shortDescription) {
    return playerResponse.videoDetails.shortDescription;
  }

  // Fall back to meta description tag
  const metaMatch =
    html.match(/<meta name="description" content="([^"]+)"/) ||
    html.match(/<meta property="og:description" content="([^"]+)"/);
  return decodeHtmlEntities(metaMatch?.[1] ?? "");
}

function extractDurationFromHtml(html: string): string {
  if (!html) return "";
  const playerResponse = extractJson(
    html,
    "ytInitialPlayerResponse = ",
    "ytInitialPlayerResponse=",
    "var ytInitialPlayerResponse = "
  ) as PlayerResponse | null;
  const secs = parseInt(playerResponse?.videoDetails?.lengthSeconds ?? "0", 10);
  if (!secs) return "";
  return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
}

function parseCaptionXml(xml: string): string {
  const tags = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
  if (!tags || tags.length === 0) return "";
  return tags
    .map((tag) =>
      decodeHtmlEntities(
        tag.replace(/<text[^>]*>/, "").replace(/<\/text>/, "").replace(/<[^>]+>/g, "")
      ).trim()
    )
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getYoutubeTranscript(url: string): Promise<string> {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("Could not extract YouTube video ID from URL");

  // Run oEmbed (guaranteed) and watch page fetch (best-effort) in parallel
  const [oembed, html] = await Promise.all([
    fetchOEmbed(videoId),
    fetchWatchPage(videoId),
  ]);

  const title = oembed.title ?? "";
  const author = oembed.author_name ?? "";

  if (!title) {
    throw new Error(
      "Could not read this video. It may be private, age-restricted, or unavailable in your region."
    );
  }

  // Try caption transcript from the watch page HTML
  if (html) {
    const playerResponse = extractJson(
      html,
      "ytInitialPlayerResponse = ",
      "ytInitialPlayerResponse=",
      "var ytInitialPlayerResponse = "
    ) as PlayerResponse | null;

    const captionTracks =
      playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;

    if (captionTracks && captionTracks.length > 0) {
      const track =
        captionTracks.find((t) => t.languageCode === "en") ||
        captionTracks.find((t) => t.languageCode?.startsWith("en")) ||
        captionTracks[0];

      if (track?.baseUrl) {
        try {
          const xmlRes = await fetch(track.baseUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
              "Accept-Language": "en-US,en;q=0.9",
              Referer: "https://www.youtube.com/",
              Cookie:
                "CONSENT=YES+cb.20210328-17-p0.en+FX+294; SOCS=CAESEwgDEgk4OTI4NDM3NDEYASAB",
            },
          });
          const xml = await xmlRes.text();
          const transcript = parseCaptionXml(xml);
          if (transcript && transcript.length > 100) {
            return transcript.slice(0, 15000);
          }
        } catch {
          // Fall through to description fallback
        }
      }
    }
  }

  // Fallback: use title + description + duration for AI to work with
  const description = extractDescriptionFromHtml(html);
  const duration = extractDurationFromHtml(html);

  const parts = [
    `Video: "${title}"`,
    author ? `Channel: ${author}` : "",
    duration ? `Duration: ${duration}` : "",
    description ? `\nDescription:\n${description}` : "",
  ].filter(Boolean).join("\n");

  return parts.slice(0, 15000);
}
