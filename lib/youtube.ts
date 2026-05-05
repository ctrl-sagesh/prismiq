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

// Fetch YouTube watch page with consent cookies to bypass GDPR modal
async function fetchWatchPage(videoId: string): Promise<string> {
  const res = await fetch(
    `https://www.youtube.com/watch?v=${videoId}&hl=en`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        Cookie:
          "CONSENT=YES+cb.20210328-17-p0.en+FX+294; SOCS=CAESEwgDEgk4OTI4NDM3NDEYASAB",
        "Cache-Control": "no-cache",
      },
    }
  );
  if (!res.ok) throw new Error(`YouTube returned HTTP ${res.status}`);
  return res.text();
}

function extractJson(html: string, marker: string): Record<string, unknown> | null {
  const idx = html.indexOf(marker);
  if (idx === -1) return null;
  const start = idx + marker.length;
  let depth = 0, end = start;
  for (let i = start; i < html.length; i++) {
    if (html[i] === "{") depth++;
    else if (html[i] === "}") {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  if (end <= start) return null;
  try {
    return JSON.parse(html.slice(start, end)) as Record<string, unknown>;
  } catch {
    return null;
  }
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

// Extract chapters from ytInitialData (they live in the video description engagementPanels)
function extractChapters(initialData: Record<string, unknown>): string {
  try {
    const str = JSON.stringify(initialData);
    // Chapters appear in macroMarkersListItemRenderer
    const matches = str.match(/"title":\{"simpleText":"([^"]+)"\},"timeDescriptionText":\{"simpleText":"(\d+:\d+)"\}/g);
    if (!matches || matches.length === 0) return "";
    return matches
      .map((m) => {
        const title = m.match(/"title":\{"simpleText":"([^"]+)"\}/)?.[1] || "";
        const time = m.match(/"timeDescriptionText":\{"simpleText":"([^"]+)"\}/)?.[1] || "";
        return `${time} — ${title}`;
      })
      .join("\n");
  } catch {
    return "";
  }
}

export async function getYoutubeTranscript(url: string): Promise<string> {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("Could not extract YouTube video ID from URL");

  const html = await fetchWatchPage(videoId);

  const playerResponse = extractJson(html, "ytInitialPlayerResponse = ") as PlayerResponse | null;
  const initialData = extractJson(html, "var ytInitialData = ");

  if (!playerResponse) {
    throw new Error("Could not parse YouTube page. Try a different video.");
  }

  const title = playerResponse.videoDetails?.title ?? "Unknown title";
  const description = playerResponse.videoDetails?.shortDescription ?? "";
  const author = playerResponse.videoDetails?.author ?? "";
  const durationSecs = parseInt(playerResponse.videoDetails?.lengthSeconds ?? "0", 10);
  const duration = durationSecs > 0
    ? `${Math.floor(durationSecs / 60)}:${String(durationSecs % 60).padStart(2, "0")}`
    : "";

  // ── Try to get actual transcript ──────────────────────────────────────────
  const captionTracks =
    playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;

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
          // Got a real transcript — use it
          return transcript.slice(0, 15000);
        }
      } catch {
        // Caption fetch failed — fall through to description
      }
    }
  }

  // ── Fallback: title + description + chapters ──────────────────────────────
  // YouTube blocks server-side timedtext access from cloud IPs, so we use
  // the video's description and chapter list as content for AI to work with.
  if (!description || description.length < 30) {
    throw new Error(
      "No captions or description found for this video. Try a video with subtitles or a detailed description."
    );
  }

  const chapters = initialData ? extractChapters(initialData) : "";

  const parts: string[] = [
    `Video: "${title}"`,
    author ? `By: ${author}` : "",
    duration ? `Duration: ${duration}` : "",
    "",
    "Description:",
    description,
  ];

  if (chapters) {
    parts.push("", "Chapters:", chapters);
  }

  const content = parts.filter((p) => p !== undefined).join("\n").trim();
  return content.slice(0, 15000);
}
