import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { processWithClaude, processImageWithClaude, Action } from "@/lib/claude";
import { scrapeUrl } from "@/lib/scraper";
import { getYoutubeTranscript } from "@/lib/youtube";
import { parsePdf } from "@/lib/pdfParser";

export const maxDuration = 60;

const ANON_LIMIT = 2;       // scans before requiring sign-in
const USER_LIMIT = 2;       // extra scans after signing in (before upgrade)

function isYoutubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const cookieStore = await cookies();

  if (session?.user) {
    // Signed-in user: check their personal scan count
    const userScans = parseInt(cookieStore.get("prismiq_user_scans")?.value || "0", 10);
    if (userScans >= USER_LIMIT) {
      return NextResponse.json({ error: "upgrade_required" }, { status: 429 });
    }
  } else {
    // Anonymous user: check anon scan count
    const anonScans = parseInt(cookieStore.get("prismiq_scans")?.value || "0", 10);
    if (anonScans >= ANON_LIMIT) {
      return NextResponse.json({ error: "signin_required" }, { status: 429 });
    }
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

    // Increment appropriate counter
    const response = NextResponse.json({
      result,
      isSignedIn: !!session?.user,
      scansLeft: session?.user
        ? USER_LIMIT - (parseInt(cookieStore.get("prismiq_user_scans")?.value || "0", 10) + 1)
        : ANON_LIMIT - (parseInt(cookieStore.get("prismiq_scans")?.value || "0", 10) + 1),
    });

    if (session?.user) {
      const cur = parseInt(cookieStore.get("prismiq_user_scans")?.value || "0", 10);
      response.cookies.set("prismiq_user_scans", String(cur + 1), { maxAge: 60 * 60 * 24 * 30, httpOnly: true, path: "/" });
    } else {
      const cur = parseInt(cookieStore.get("prismiq_scans")?.value || "0", 10);
      response.cookies.set("prismiq_scans", String(cur + 1), { maxAge: 60 * 60 * 24 * 30, httpOnly: true, path: "/" });
    }

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Something went wrong";
    if (message.includes("transcript") || message.includes("No transcript")) {
      return NextResponse.json({ error: "This video has no captions available. Try an educational video, tutorial, or lecture instead." }, { status: 400 });
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
