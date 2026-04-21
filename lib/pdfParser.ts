import { PDFParse } from "pdf-parse";

export async function parsePdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  const text = result.text.replace(/\s+/g, " ").trim();
  return text.slice(0, 15000);
}
