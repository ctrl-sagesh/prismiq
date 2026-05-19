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

// ─── VTT parser (Invidious returns WebVTT) ────────────────────────────────────

function parseVtt(vtt: string): string {
  if (!vtt) return "";
  const lines = vtt.split(/\r?\n/);
  const out: string[] = [];
  for (const lineRaw of lines) {
    const line = lineRaw.trim();
    if (!line) continue;
    if (line.startsWith("WEBVTT")) continue;
    if (line.startsWith("NOTE")) continue;
    if (/^\d+$/.test(line)) continue;            // cue number
    if (line.includes("-->")) continue;          // timestamp
    if (line.startsWith("Kind:") || line.startsWith("Language:")) continue;
    // Real caption text
    out.push(decodeHtmlEntities(line.replace(/<[^>]+>/g, "")));
  }
  return out.join(" ").replace(/\s+/g, " ").trim();
}

// ─── XML parser (YouTube timedtext returns XML) ───────────────────────────────

function parseCaptionXml(xml: string): string {
  if (!xml) return "";
  const tags = xml.match(/<text[^>]*>([\s\S]*?)<\/text>/g);
  if (!tags || tags.length === 0) return "";
  return tags
    .map((tag) => {
      const inner = tag.replace(/<text[^>]*>/, "").replace(/<\/text>/, "");
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

// ─── Layer 0: Supadata transcript API (paid, most reliable) ──────────────────
// Set SUPADATA_API_KEY env var to enable. Free tier gives 100 transcripts/month.

interface SupadataResponse {
  content?: string | Array<{ text?: string }>;
  lang?: string;
  availableLangs?: string[];
  error?: string;
  message?: string;
  title?: string;
}

async function fetchViaSupadata(videoId: string): Promise<{
  title: string;
  author: string;
  durationSecs: number;
  isLive: boolean;
  isUpcoming: boolean;
  transcript: string;
} | null> {
  const key = process.env.SUPADATA_API_KEY;
  if (!key) return null;

  try {
    console.log("[youtube] Trying Supadata...");
    const res = await fetchTimeout(
      `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true&lang=en`,
      15000,
      {
        headers: {
          "x-api-key": key,
          Accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.error(`[youtube] Supadata ${res.status}: ${txt.slice(0, 300)}`);
      return null;
    }

    const data = (await res.json()) as SupadataResponse;
    if (data.error || data.message) {
      console.error(`[youtube] Supadata error: ${data.error || data.message}`);
      return null;
    }

    let transcript = "";
    if (typeof data.content === "string") {
      transcript = data.content;
    } else if (Array.isArray(data.content)) {
      transcript = data.content.map((c) => c.text ?? "").filter(Boolean).join(" ");
    }
    transcript = transcript.replace(/\s+/g, " ").trim();

    if (transcript.length > 100) {
      console.log(`[youtube] Supadata succeeded — ${transcript.length} chars`);
      // Supadata doesn't always return title/author — fill via oEmbed
      const oembed = await fetchOEmbed(videoId);
      return {
        title: data.title ?? oembed.title ?? `Video ${videoId}`,
        author: oembed.author_name ?? "",
        durationSecs: 0,
        isLive: false,
        isUpcoming: false,
        transcript,
      };
    }
    console.log("[youtube] Supadata returned empty transcript");
    return null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[youtube] Supadata threw: ${msg}`);
    return null;
  }
}

// ─── Layer 1a: Piped public API ───────────────────────────────────────────────
// Piped is an open-source YouTube proxy. Many instances exist publicly.

const PIPED_INSTANCES = [
  "https://pipedapi.kavin.rocks",
  "https://api.piped.yt",
  "https://pipedapi.r4fo.com",
  "https://pipedapi.adminforge.de",
  "https://pipedapi.tokhmi.xyz",
  "https://api.piped.private.coffee",
  "https://pipedapi.smnz.de",
];

// ─── Layer 1b: Invidious public mirrors ───────────────────────────────────────

const INVIDIOUS_INSTANCES = [
  "https://invidious.nerdvpn.de",
  "https://yewtu.be",
  "https://invidious.privacyredirect.com",
  "https://inv.nadeko.net",
  "https://invidious.fdn.fr",
  "https://invidious.private.coffee",
  "https://iv.melmac.space",
];

interface InvidiousCaption {
  label?: string;
  language_code?: string;
  languageCode?: string;
  url?: string;
}

interface InvidiousVideo {
  title?: string;
  author?: string;
  lengthSeconds?: number;
  captions?: InvidiousCaption[];
  liveNow?: boolean;
  isUpcoming?: boolean;
  isFamilyFriendly?: boolean;
  error?: string;
}

interface PipedSubtitle {
  url?: string;
  mimeType?: string;
  name?: string;
  code?: string;
  autoGenerated?: boolean;
}

interface PipedStreams {
  title?: string;
  uploader?: string;
  duration?: number;
  livestream?: boolean;
  subtitles?: PipedSubtitle[];
  error?: string;
  message?: string;
}

async function fetchTimeout(url: string, ms = 7000, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchViaPiped(videoId: string): Promise<{
  title: string;
  author: string;
  durationSecs: number;
  isLive: boolean;
  isUpcoming: boolean;
  transcript: string;
} | null> {
  for (const instance of PIPED_INSTANCES) {
    try {
      console.log(`[youtube] Trying Piped: ${instance}`);
      const res = await fetchTimeout(`${instance}/streams/${videoId}`, 8000);
      if (!res.ok) {
        console.log(`[youtube] ${instance} returned ${res.status}`);
        continue;
      }
      const data = (await res.json()) as PipedStreams;
      if (data.error || data.message) {
        console.log(`[youtube] ${instance} error: ${data.error || data.message}`);
        continue;
      }

      const title = data.title ?? "";
      const author = data.uploader ?? "";
      const duration = data.duration ?? 0;
      const isLive = !!data.livestream;

      const subs = data.subtitles ?? [];
      if (subs.length === 0) {
        // Got metadata but no captions
        return { title, author, durationSecs: duration, isLive, isUpcoming: false, transcript: "" };
      }

      // Prefer manual English, then auto English, then any English, then any
      const isEn = (s: PipedSubtitle) => (s.code || "").toLowerCase().startsWith("en");
      const sub =
        subs.find((s) => isEn(s) && !s.autoGenerated) ||
        subs.find((s) => isEn(s)) ||
        subs[0];
      if (!sub?.url) continue;

      console.log(`[youtube] Fetching Piped caption: ${sub.url.slice(0, 100)}...`);
      const capRes = await fetchTimeout(sub.url, 10000);
      if (!capRes.ok) {
        console.log(`[youtube] Piped caption returned ${capRes.status}`);
        continue;
      }
      const body = await capRes.text();
      const transcript = body.trim().startsWith("<?xml")
        ? parseCaptionXml(body)
        : parseVtt(body);

      if (transcript && transcript.length > 100) {
        console.log(`[youtube] Piped ${instance} succeeded — ${transcript.length} chars`);
        return { title, author, durationSecs: duration, isLive, isUpcoming: false, transcript };
      }
      console.log(`[youtube] Piped ${instance} got empty transcript`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`[youtube] Piped ${instance} threw: ${msg}`);
      continue;
    }
  }
  return null;
}

async function fetchViaInvidious(videoId: string): Promise<{
  title: string;
  author: string;
  durationSecs: number;
  isLive: boolean;
  isUpcoming: boolean;
  transcript: string;
} | null> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      console.log(`[youtube] Trying Invidious: ${instance}`);
      const videoRes = await fetchTimeout(
        `${instance}/api/v1/videos/${videoId}?fields=title,author,lengthSeconds,captions,liveNow,isUpcoming`,
        7000
      );
      if (!videoRes.ok) {
        console.log(`[youtube] ${instance} returned ${videoRes.status}`);
        continue;
      }
      const video = (await videoRes.json()) as InvidiousVideo;
      if (video.error) {
        console.log(`[youtube] ${instance} error: ${video.error}`);
        continue;
      }

      const title  = video.title  ?? "";
      const author = video.author ?? "";
      const duration = video.lengthSeconds ?? 0;
      const isLive = !!video.liveNow;
      const isUpcoming = !!video.isUpcoming;

      const captions = video.captions ?? [];
      if (captions.length === 0) {
        // Video info worked but no captions
        return {
          title,
          author,
          durationSecs: duration,
          isLive,
          isUpcoming,
          transcript: "",
        };
      }

      // Prefer English
      const en =
        captions.find((c) => (c.language_code || c.languageCode) === "en") ||
        captions.find((c) => (c.language_code || c.languageCode)?.startsWith("en")) ||
        captions[0];
      if (!en?.url) continue;

      const capUrl = en.url.startsWith("http") ? en.url : `${instance}${en.url}`;
      console.log(`[youtube] Fetching captions: ${capUrl.slice(0, 100)}...`);
      const capRes = await fetchTimeout(capUrl, 10000);
      if (!capRes.ok) {
        console.log(`[youtube] caption fetch ${capRes.status}`);
        continue;
      }
      const body = await capRes.text();
      const transcript = body.trim().startsWith("<?xml")
        ? parseCaptionXml(body)
        : parseVtt(body);

      if (transcript && transcript.length > 100) {
        console.log(`[youtube] ${instance} succeeded — ${transcript.length} chars`);
        return {
          title,
          author,
          durationSecs: duration,
          isLive,
          isUpcoming,
          transcript,
        };
      }
      console.log(`[youtube] ${instance} returned empty transcript`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`[youtube] ${instance} threw: ${msg}`);
      continue;
    }
  }
  return null;
}

// ─── Layer 2: youtubei.js fallback (Innertube API) ───────────────────────────

interface CaptionTrack {
  base_url?: string;
  baseUrl?: string;
  language_code?: string;
  languageCode?: string;
  kind?: string;
  vss_id?: string;
}

interface BasicInfo {
  title?: string;
  author?: string;
  channel?: { name?: string };
  duration?: number;
  is_live?: boolean;
  is_upcoming?: boolean;
}

let innertubeClient: Innertube | null = null;
async function getInnertube(): Promise<Innertube> {
  if (innertubeClient) return innertubeClient;
  innertubeClient = await Innertube.create({ generate_session_locally: true });
  return innertubeClient;
}

function pickBestTrack(tracks: CaptionTrack[]): CaptionTrack | null {
  if (!tracks || tracks.length === 0) return null;
  const isEnglish = (t: CaptionTrack) => {
    const code = (t.language_code || t.languageCode || "").toLowerCase();
    return code === "en" || code.startsWith("en");
  };
  return (
    tracks.find((t) => isEnglish(t) && t.kind !== "asr") ||
    tracks.find((t) => isEnglish(t)) ||
    tracks[0]
  );
}

async function fetchViaInnertube(videoId: string): Promise<{
  title: string;
  author: string;
  durationSecs: number;
  isLive: boolean;
  isUpcoming: boolean;
  transcript: string;
} | null> {
  try {
    console.log("[youtube] Trying Innertube...");
    const yt = await getInnertube();
    const info = await yt.getInfo(videoId);
    const basic = info.basic_info as BasicInfo;
    const title  = basic?.title ?? "";
    const author = basic?.author ?? basic?.channel?.name ?? "";
    const duration = basic?.duration ?? 0;
    const isLive = !!basic?.is_live;
    const isUpcoming = !!basic?.is_upcoming;

    const captionTracks = (info.captions?.caption_tracks ?? []) as CaptionTrack[];
    if (captionTracks.length === 0) {
      return { title, author, durationSecs: duration, isLive, isUpcoming, transcript: "" };
    }

    const track = pickBestTrack(captionTracks);
    const baseTrackUrl = track?.base_url || track?.baseUrl;
    if (!track || !baseTrackUrl) {
      return { title, author, durationSecs: duration, isLive, isUpcoming, transcript: "" };
    }

    const code = (track.language_code || track.languageCode || "").toLowerCase();
    const isEnglishTrack = code === "en" || code.startsWith("en");

    const headers = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Referer: "https://www.youtube.com/",
    };

    const urls: string[] = [];
    if (!isEnglishTrack) {
      const sep = baseTrackUrl.includes("?") ? "&" : "?";
      urls.push(`${baseTrackUrl}${sep}tlang=en`);
    }
    urls.push(baseTrackUrl);

    let xml = "";
    for (const u of urls) {
      try {
        const res = await fetchTimeout(u, 10000, { headers });
        if (!res.ok) continue;
        const text = await res.text();
        if (text.includes("<text")) { xml = text; break; }
      } catch { /* try next */ }
    }
    const transcript = parseCaptionXml(xml);
    console.log(`[youtube] Innertube transcript length: ${transcript.length}`);
    return { title, author, durationSecs: duration, isLive, isUpcoming, transcript };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[youtube] Innertube failed:", msg);
    return null;
  }
}

// ─── Layer 3: oEmbed for at-minimum title/author ─────────────────────────────

interface OEmbed { title?: string; author_name?: string }
async function fetchOEmbed(videoId: string): Promise<OEmbed> {
  try {
    const res = await fetchTimeout(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`,
      5000
    );
    if (!res.ok) return {};
    return (await res.json()) as OEmbed;
  } catch {
    return {};
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function getYoutubeTranscript(url: string, maxMinutes?: number): Promise<string> {
  const videoId = extractVideoId(url);
  if (!videoId) {
    throw new Error(
      "Could not extract a video ID from this URL. Make sure it's a valid YouTube link."
    );
  }

  console.log(`[youtube] Processing video ${videoId}`);

  // Layer 0: Paid transcript API (most reliable, used if SUPADATA_API_KEY set)
  let result = await fetchViaSupadata(videoId);

  // Layer 1: Piped public proxies
  if (!result) {
    console.log("[youtube] Supadata not used / failed, trying Piped...");
    result = await fetchViaPiped(videoId);
  }

  // Layer 2: Invidious mirrors
  if (!result) {
    console.log("[youtube] Piped failed, trying Invidious...");
    result = await fetchViaInvidious(videoId);
  }

  // Layer 3: youtubei.js direct (works locally, often fails on Vercel)
  if (!result) {
    console.log("[youtube] Invidious failed, trying Innertube direct...");
    result = await fetchViaInnertube(videoId);
  }

  // Last resort: oEmbed at least gives us the title
  if (!result) {
    console.log("[youtube] All caption sources failed");
    const oembed = await fetchOEmbed(videoId);
    if (!oembed.title) {
      throw new Error(
        "Could not connect to YouTube right now. Our servers may be temporarily blocked. " +
        "Please try again in a few minutes."
      );
    }
    throw new Error(
      `Could not fetch transcript for "${oembed.title}". YouTube is temporarily blocking our servers from this video. ` +
      `Please try again in a few minutes, or try a different video.`
    );
  }

  const { title, author, durationSecs, isLive, isUpcoming, transcript } = result;

  if (!title) {
    throw new Error(
      "Could not read this video. It may be private, age-restricted, or unavailable in your region."
    );
  }

  if (isLive) {
    throw new Error(
      `"${title}" is a live stream. Live videos cannot be summarized while broadcasting. Try again after the stream ends.`
    );
  }
  if (isUpcoming) {
    throw new Error(
      `"${title}" is an upcoming stream that hasn't started yet. Come back when it's live or after it ends.`
    );
  }

  // Enforce per-plan length limit
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

  if (!transcript || transcript.length < 50) {
    throw new Error(
      `"${title}" has no captions or subtitles available. Prismiq needs captions to summarize a video. ` +
      `Look for videos with the CC button on YouTube's player.`
    );
  }

  const header =
    [`Video: "${title}"`, author ? `Channel: ${author}` : ""]
      .filter(Boolean)
      .join("\n") + "\n\nTranscript:\n";

  return header + smartSampleTranscript(transcript);
}
