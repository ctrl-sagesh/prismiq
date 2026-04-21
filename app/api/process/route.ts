import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { processWithClaude, processImageWithClaude, Action } from "@/lib/claude";
import { scrapeUrl } from "@/lib/scraper";
import { getYoutubeTranscript } from "@/lib/youtube";
import { parsePdf } from "@/lib/pdfParser";

const FREE_LIMIT = 3;

function isYoutubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

export async function POST(req: NextRequest) {
  // Check usage limit
  const cookieStore = await cookies();
  const scanCount = parseInt(cookieStore.get("prismiq_scans")?.value || "0", 10);

  if (scanCount >= FREE_LIMIT) {
    return NextResponse.json({ error: "limit_reached" }, { status: 429 });
  }

  try {
    const formData = await req.formData();
    const action = formData.get("action") as Action;
    const searchQuery = formData.get("searchQuery") as string | undefined;
    const inputType = formData.get("inputType") as string;

    let result = "";

    if (inputType === "url") {
      const url = formData.get("url") as string;
      let content: string;

      if (isYoutubeUrl(url)) {
        content = await getYoutubeTranscript(url);
      } else {
        content = await scrapeUrl(url);
      }

      result = await processWithClaude(content, action, searchQuery || undefined);

    } else if (inputType === "file") {
      const file = formData.get("file") as File;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (file.type === "application/pdf") {
        const text = await parsePdf(buffer);
        result = await processWithClaude(text, action, searchQuery || undefined);

      } else if (file.type.startsWith("image/")) {
        const base64 = buffer.toString("base64");
        const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
        result = await processImageWithClaude(base64, mediaType, action, searchQuery || undefined);

      } else {
        const text = buffer.toString("utf-8").slice(0, 15000);
        result = await processWithClaude(text, action, searchQuery || undefined);
      }
    } else {
      return NextResponse.json({ error: "Invalid input type" }, { status: 400 });
    }

    // Increment scan count
    const newCount = scanCount + 1;
    const response = NextResponse.json({ result, scansUsed: newCount, scansLeft: FREE_LIMIT - newCount });
    response.cookies.set("prismiq_scans", String(newCount), {
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
      path: "/",
    });

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
