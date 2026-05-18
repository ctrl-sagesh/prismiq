import { YoutubeTranscript } from "youtube-transcript";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
    /youtube\.com\/live\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /(?:m\.)?youtube\.com\/watch\?.*v=([^&\n?#]+)/,
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
    isLive?: boolean;
    isLiveContent?: boolean;
    isUpcoming?: boolean;
  };
  captions?: {
    playerCaptionsTracklistRenderer?: {
      captionTracks?: CaptionTrack[];
    };
  };
}

// ─── YouTube oEmbed (always works, gives title/author) ────────────────────────

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

// ─── Layer 1: youtube-transcript library (Innertube API) ─────────────────────
// Most reliable. Uses YouTube's internal transcript API endpoint.

async function fetchTranscriptViaLibrary(videoId: string): Promise<string | null> {
  try {
    const items = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    if (!items || items.length === 0) return null;
    const text = items.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim();
    return text.length > 100 ? text : null;
  } catch {
    // Try without language filter (picks whatever is available)
    try {
      const items = await YoutubeTranscript.fetchTranscript(videoId);
      if (!items || items.length === 0) return null;
      const text = items.map((i) => i.text).join(" ").replace(/\s+/g, " ").trim();
      return text.length > 100 ? text : null;
    } catch {
      return null;
    }
  }
}

// ─── Layer 2: Watch-page HTML scraping (fallback) ────────────────────────────
// Less reliable from data-center IPs but acts as backup.

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

function extractPlayerResponse(html: string): PlayerResponse | null {
  return extractJson(
    html,
    "ytInitialPlayerResponse = ",
    "ytInitialPlayerResponse=",
    "var ytInitialPlayerResponse = ",
    "var ytInitialPlayerResponse="
  ) as PlayerResponse | null;
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

async function fetchTranscriptViaHtmlScrape(
  videoId: string,
  html: string
): Promise<string | null> {
  if (!html) return null;
  const playerResponse = extractPlayerResponse(html);
  const captionTracks =
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  if (!captionTracks || captionTracks.length === 0) return null;

  const track =
    captionTracks.find((t) => t.languageCode === "en") ||
    captionTracks.find((t) => t.languageCode?.startsWith("en")) ||
    captionTracks[0];

  if (!track?.baseUrl) return null;

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
    return transcript.length > 100 ? transcript : null;
  } catch {
    return null;
  }
}

// ─── Smart sampling for long transcripts ─────────────────────────────────────

export function smartSampleTranscript(transcript: string, maxChars = 80000): string {
  if (transcript.length <= maxChars) return transcript;
  const startLen = Math.floor(maxChars * 0.35);
  const midLen   = Math.floor(maxChars * 0.30);
  const endLen   = maxChars - startLen - midLen;
  const start    = transcript.slice(0, startLen);
  const midOff   = Math.floor(transcript.length / 2) - Math.floor(midLen / 2);
  const middle   = transcript.slice(midOff, midOff + midLen);
  const end      = transcript.slice(transcript.length - endLen);
  return (
    start +
    "\n\n[... middle of video ...]\n\n" +
    middle +
    "\n\n[... later in video ...]\n\n" +
    end
  );
}

// ─── Video-type guard ────────────────────────────────────────────────────────

function getVideoTypeError(playerResponse: PlayerResponse | null, title: string): string | null {
  if (!playerResponse?.videoDetails) return null;
  const vd = playerResponse.videoDetails;
  if (vd.isLive) {
    return `"${title}" is a live stream. Live videos cannot be summarized while broadcasting. Try again after the stream ends.`;
  }
  if (vd.isUpcoming) {
    return `"${title}" is an upcoming stream that hasn't started yet. Come back when it's live or after it ends.`;
  }
  return null;
}

function extractDurationFromHtml(html: string): number {
  const playerResponse = extractPlayerResponse(html);
  return parseInt(playerResponse?.videoDetails?.lengthSeconds ?? "0", 10);
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function getYoutubeTranscript(url: string, maxMinutes?: number): Promise<string> {
  const videoId = extractVideoId(url);
  if (!videoId)
    throw new Error(
      "Could not extract a video ID from this URL. Make sure it's a valid YouTube link."
    );

  // Run oEmbed + watch page in parallel — oEmbed is the reliable source of title/author
  const [oembed, html] = await Promise.all([
    fetchOEmbed(videoId),
    fetchWatchPage(videoId),
  ]);

  const title  = oembed.title ?? "";
  const author = oembed.author_name ?? "";

  if (!title) {
    throw new Error(
      "Could not read this video. It may be private, age-restricted, or unavailable in your region."
    );
  }

  // Guard against unsupported video types (live, upcoming)
  const playerResponse = html ? extractPlayerResponse(html) : null;
  const typeError = getVideoTypeError(playerResponse, title);
  if (typeError) throw new Error(typeError);

  // Enforce per-plan video length limit
  if (maxMinutes && html) {
    const rawSecs = extractDurationFromHtml(html);
    if (rawSecs > 0 && rawSecs > maxMinutes * 60) {
      const videoMins = Math.round(rawSecs / 60);
      const upgradeHint =
        maxMinutes <= 20
          ? "Upgrade to Starter (45 min) or Pro (3 hours) for longer videos."
          : maxMinutes <= 45
          ? "Upgrade to Pro for videos up to 3 hours."
          : "Upgrade to Unlimited for videos of any length.";
      throw new Error(
        `This video is ${videoMins} minutes long but your plan supports up to ${maxMinutes} minutes. ${upgradeHint}`
      );
    }
  }

  // ── Layer 1: youtube-transcript library (most reliable) ──────────────────
  const transcriptViaLib = await fetchTranscriptViaLibrary(videoId);
  if (transcriptViaLib) {
    const header = [
      `Video: "${title}"`,
      author ? `Channel: ${author}` : "",
    ]
      .filter(Boolean)
      .join("\n") + "\n\nTranscript:\n";
    return header + smartSampleTranscript(transcriptViaLib);
  }

  // ── Layer 2: HTML scrape caption tracks ──────────────────────────────────
  if (html) {
    const transcriptViaHtml = await fetchTranscriptViaHtmlScrape(videoId, html);
    if (transcriptViaHtml) {
      const header = [
        `Video: "${title}"`,
        author ? `Channel: ${author}` : "",
      ]
        .filter(Boolean)
        .join("\n") + "\n\nTranscript:\n";
      return header + smartSampleTranscript(transcriptViaHtml);
    }
  }

  // ── Layer 3: No transcript available — tell user clearly ─────────────────
  throw new Error(
    `Could not extract a transcript for "${title}". This video may not have captions or subtitles enabled. ` +
    `Try a different video, or use a video that has CC (closed captions) available.`
  );
}
