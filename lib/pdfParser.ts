export async function parsePdf(buffer: Buffer): Promise<string> {
  const { extractText } = await import("unpdf");
  const uint8 = new Uint8Array(buffer);
  const { text } = await extractText(uint8, { mergePages: true });
  return (text || "").replace(/\s+/g, " ").trim().slice(0, 15000);
}
