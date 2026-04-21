import * as cheerio from "cheerio";

export async function scrapeUrl(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Failed to fetch URL: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  $("script, style, nav, footer, header, aside, iframe, noscript, [aria-hidden='true']").remove();

  const title = $("title").text().trim();
  const metaDesc = $("meta[name='description']").attr("content") || "";

  const selectors = ["article", "main", ".content", ".post", ".article", "#content", "#main"];
  let bodyText = "";

  for (const sel of selectors) {
    const el = $(sel);
    if (el.length && el.text().trim().length > 200) {
      bodyText = el.text();
      break;
    }
  }

  if (!bodyText) bodyText = $("body").text();

  const cleaned = bodyText.replace(/\s+/g, " ").trim().slice(0, 15000);

  return `Title: ${title}\nDescription: ${metaDesc}\n\n${cleaned}`;
}
