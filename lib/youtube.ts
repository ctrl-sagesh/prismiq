import { Innertube } from "youtubei.js";

// ─── Video ID extraction ─────────────────────────────────────────────────────

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

// ─── HTML entity decoding ─────────────────────────────────────────────────────

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)));
}

// ─── Innertube singleton ──────────────────────────────────────────────────────

let innertubeClient: Innertube | null = null;

async function getInnertube(): Promise<Innertube> {
  if (innertubeClient) return innertubeClient;
  // Keep player retrieval enabled — that's where caption_tracks come from
  innertubeClient = await Innertube.create({
    generate_session_locally: true,
  });
  return innertubeClient;
}

// ─── Caption track types ──────────────────────────────────────────────────────

interface CaptionTrack {
  base_url?: string;
  baseUrl?: string;
  language_code?: string;
  languageCode?: string;
  kind?: string;
  vss_id?: string;
  name?: { text?: string };
}

// Pick the best English caption track:
//   1. Manual English captions (no `kind=asr`)
//   2. Auto-generated English (kind=asr)
//   3. Any English variant (en-US, en-GB, etc.)
//   4. First available track of any language
function pickBestTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (!tracks || tracks.length === 0) return null;

  const isEnglish = (t: CaptionTrack) => {
    const code = (t.language_code || t.languageCode || "").toLowerCase();
    const vss = (t.vss_id || "").toLowerCase();
    return code === "en" || code.startsWith("en") || vss.includes(".en");
  };

  // 1. Manual English captions (preferred)
  const manualEn = tracks.find((t) => isEnglish(t) && t.kind !== "asr");
  if (manualEn) return manualEn;

  // 2. Auto-generated English captions
  const autoEn = tracks.find((t) => isEnglish(t));
  if (autoEn) return autoEn;

  // 3. Fallback to first track
  return tracks[0];
}

// ─── Caption XML parser ───────────────────────────────────────────────────────

function parseCaptionXml(xml: string): string {
  if (!xml) return "";
  const tags = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
  if (!tags || tags.length === 0) return "";
  return tags
    .map((tag) => {
      const inner = tag.replace(/<text[^>]*>/, "").replace(/<\/text>/, "");
      // Captions can contain <br>, <i>, etc. Strip them.
      const stripped = inner.replace(/<[^>]+>/g, "");
      return decodeHtmlEntities(stripped).trim();
    })
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
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

// ─── Main export ──────────────────────────────────────────────────────────────

interface BasicInfo {
  title?: string;
  author?: string;
  channel?: { name?: string };
  duration?: number;
  is_live?: boolean;
  is_upcoming?: boolean;
  is_private?: boolean;
  is_unlisted?: boolean;
}

export async function getYoutubeTranscript(url: string, maxMinutes?: number): Promise<string> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error(
      "Could not extract a video ID from this URL. Make sure it's a valid YouTube link."
    );
  }

  let yt: Innertube;
  try {
    yt = await getInnertube();
  } catch (err) {
    console.error("[youtube] Innertube init failed:", err);
    throw new Error("Could not connect to YouTube. Please try again in a moment.");
  }

  // Fetch video info
  let info;
  try {
    info = await yt.getInfo(videoId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/private/i.test(msg)) {
      throw new Error("This video is private and cannot be accessed.");
    }
    if (/unavailable/i.test(msg)) {
      throw new Error("This video is unavailable. It may have been deleted or restricted in your region.");
    }
    if (/age|sign[- ]?in/i.test(msg)) {
      throw new Error("This video is age-restricted and cannot be summarized.");
    }
    console.error("[youtube] getInfo failed:", msg);
    throw new Error("Could not read this video. It may be private, age-restricted, or unavailable.");
  }

  const basic = info.basic_info as BasicInfo;
  const title  = basic?.title ?? "";
  const author = basic?.author ?? basic?.channel?.name ?? "";
  const durationSecs = basic?.duration ?? 0;

  if (!title) {
    throw new Error(
      "Could not read this video. It may be private, age-restricted, or unavailable in your region."
    );
  }

  // Block live / upcoming streams
  if (basic?.is_live) {
    throw new Error(
      `"${title}" is a live stream. Live videos cannot be summarized while broadcasting. Try again after the stream ends.`
    );
  }
  if (basic?.is_upcoming) {
    throw new Error(
      `"${title}" is an upcoming stream that hasn't started yet. Come back when it's live or after it ends.`
    );
  }

  // Enforce per-plan video length
  if (maxMinutes && durationSecs > 0 && durationSecs > maxMinutes * 60) {
    const videoMins = Math.round(durationSecs / 60);
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

  // ── Get caption tracks from video info ────────────────────────────────────
  const captionTracks = (info.captions?.caption_tracks ?? []) as CaptionTrack[];
  if (captionTracks.length === 0) {
    throw new Error(
      `"${title}" has no captions or subtitles. Prismiq needs captions to summarize a video. ` +
      `Look for a video that shows the CC button on YouTube's player.`
    );
  }

  // ── Pick best track and fetch its XML ─────────────────────────────────────
  const track = pickBestTrack(captionTracks);
  const baseTrackUrl = track?.base_url || track?.baseUrl;
  if (!track || !baseTrackUrl) {
    throw new Error(
      `Could not find a usable caption track for "${title}". Try a video with English captions.`
    );
  }

  // If the picked track isn't English, try to fetch English translation first;
  // fall back to the original language if translation isn't available.
  const code = (track.language_code || track.languageCode || "").toLowerCase();
  const isEnglishTrack = code === "en" || code.startsWith("en");

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.youtube.com/",
  };

  let xml = "";
  const urlsToTry: string[] = [];

  if (!isEnglishTrack) {
    const sep = baseTrackUrl.includes("?") ? "&" : "?";
    urlsToTry.push(`${baseTrackUrl}${sep}tlang=en`);
  }
  urlsToTry.push(baseTrackUrl);

  for (const u of urlsToTry) {
    try {
      const xmlRes = await fetch(u, { headers });
      if (!xmlRes.ok) continue;
      const text = await xmlRes.text();
      if (text && text.includes("<text")) {
        xml = text;
        break;
      }
    } catch {
      // try the next URL
    }
  }

  if (!xml) {
    console.error("[youtube] all caption URLs failed for", videoId);
    throw new Error(
      `Could not download the transcript for "${title}". YouTube may be temporarily blocking the request. Try again in a moment.`
    );
  }

  const transcriptText = parseCaptionXml(xml);
  if (!transcriptText || transcriptText.length < 50) {
    throw new Error(
      `Got an empty transcript for "${title}". The caption file may be malformed. Try a different video.`
    );
  }

  // ── Success ───────────────────────────────────────────────────────────────
  const header =
    [`Video: "${title}"`, author ? `Channel: ${author}` : ""]
      .filter(Boolean)
      .join("\n") + "\n\nTranscript:\n";

  return header + smartSampleTranscript(transcriptText);
}
