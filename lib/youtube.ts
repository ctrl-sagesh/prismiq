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

function stripXmlTags(xml: string): string {
  return xml.replace(/<[^>]+>/g, "");
}

async function fetchWithBrowserHeaders(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      "Accept-Language": "en-US,en;q=0.9",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

export async function getYoutubeTranscript(url: string): Promise<string> {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error("Could not extract YouTube video ID from URL");

  // Fetch the YouTube watch page
  const pageHtml = await fetchWithBrowserHeaders(
    `https://www.youtube.com/watch?v=${videoId}&hl=en`
  );

  // Extract ytInitialPlayerResponse JSON from the page
  // We find the start of the JSON object and then use a bracket-counting extractor
  const marker = "ytInitialPlayerResponse = ";
  const markerIdx = pageHtml.indexOf(marker);
  if (markerIdx === -1) {
    throw new Error("No transcript available. Could not parse YouTube page.");
  }
  const jsonStart = markerIdx + marker.length;

  // Walk forward counting braces to find the matching closing }
  let depth = 0;
  let jsonEnd = jsonStart;
  for (let i = jsonStart; i < pageHtml.length; i++) {
    if (pageHtml[i] === "{") depth++;
    else if (pageHtml[i] === "}") {
      depth--;
      if (depth === 0) { jsonEnd = i + 1; break; }
    }
  }
  if (jsonEnd <= jsonStart) {
    throw new Error("No transcript available. Could not parse YouTube page.");
  }
  const rawJson = pageHtml.slice(jsonStart, jsonEnd);

  let playerResponse: Record<string, unknown>;
  try {
    playerResponse = JSON.parse(rawJson);
  } catch {
    throw new Error("No transcript available. Failed to parse YouTube player data.");
  }

  // Navigate to the captions tracks
  const captions =
    (playerResponse as { captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: Array<{ languageCode: string; baseUrl: string; name?: { simpleText?: string } }> } } })
      ?.captions
      ?.playerCaptionsTracklistRenderer
      ?.captionTracks;

  if (!captions || captions.length === 0) {
    throw new Error(
      "No captions found for this video. Try a video with subtitles or closed captions enabled."
    );
  }

  // Prefer English captions; fall back to first available
  const englishTrack =
    captions.find((t) => t.languageCode === "en") ||
    captions.find((t) => t.languageCode?.startsWith("en")) ||
    captions[0];

  if (!englishTrack?.baseUrl) {
    throw new Error("No usable caption track found for this video.");
  }

  // Fetch the caption XML (timedtext endpoint)
  const captionXml = await fetchWithBrowserHeaders(englishTrack.baseUrl);

  // Parse <text> elements from the XML
  const textMatches = captionXml.match(/<text[^>]*>([^<]*)<\/text>/g);
  if (!textMatches || textMatches.length === 0) {
    throw new Error("Caption track was empty. Please try a different video.");
  }

  const transcript = textMatches
    .map((tag) => {
      const inner = tag.replace(/<text[^>]*>/, "").replace(/<\/text>/, "");
      return decodeHtmlEntities(stripXmlTags(inner)).trim();
    })
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();

  if (!transcript) {
    throw new Error("Transcript was empty after parsing.");
  }

  return transcript.slice(0, 15000);
}
