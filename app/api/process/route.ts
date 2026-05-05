import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { processWithClaude, processImageWithClaude, Action } from "@/lib/claude";
import { scrapeUrl } from "@/lib/scraper";
import { getYoutubeTranscript } from "@/lib/youtube";
import { parsePdf } from "@/lib/pdfParser";
import { checkUserCanScan, incrementUserScans } from "@/lib/supabase";
import { SummarizeMode } from "@/lib/claude";

export const maxDuration = 60;

const ANON_LIMIT = 2;

function isYoutubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const cookieStore = await cookies();

  if (session?.user?.email) {
    // Signed-in user: check DB scan limit
    const { allowed, scansLeft, resetAt } = await checkUserCanScan(session.user.email);
    if (!allowed) {
      return NextResponse.json({ error: "upgrade_required", resetAt }, { status: 429 });
    }

    try {
      const formData = await req.formData();
      const action = formData.get("action") as Action;
      const searchQuery = formData.get("searchQuery") as string | undefined;
      const summarizeMode = (formData.get("summarizeMode") as SummarizeMode) || "detailed";
      const inputType = formData.get("inputType") as string;
      let result = "";

      if (inputType === "url") {
        const url = formData.get("url") as string;
        const content = isYoutubeUrl(url) ? await getYoutubeTranscript(url) : await scrapeUrl(url);
        result = await processWithClaude(content, action, searchQuery || undefined, summarizeMode);
      } else if (inputType === "file") {
        const file = formData.get("file") as File;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (file.type === "application/pdf") {
          const text = await parsePdf(buffer);
          result = await processWithClaude(text, action, searchQuery || undefined, summarizeMode);
        } else if (file.type.startsWith("image/")) {
          const base64 = buffer.toString("base64");
          const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
          result = await processImageWithClaude(base64, mediaType, action, searchQuery || undefined, summarizeMode);
        } else {
          const text = buffer.toString("utf-8").slice(0, 15000);
          result = await processWithClaude(text, action, searchQuery || undefined, summarizeMode);
        }
      } else {
        return NextResponse.json({ error: "Invalid input type" }, { status: 400 });
      }

      await incrementUserScans(session.user.email);
      return NextResponse.json({ result, isSignedIn: true, scansLeft: scansLeft - 1 });

    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      if (message.includes("caption") || message.includes("transcript") || message.includes("No transcript")) {
        return NextResponse.json({ error: message }, { status: 400 });
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

  } else {
    // Anonymous user: cookie-based limit
    const anonScans = parseInt(cookieStore.get("prismiq_scans")?.value || "0", 10);
    if (anonScans >= ANON_LIMIT) {
      return NextResponse.json({ error: "signin_required" }, { status: 429 });
    }

    try {
      const formData = await req.formData();
      const action = formData.get("action") as Action;
      const searchQuery = formData.get("searchQuery") as string | undefined;
      const summarizeMode = (formData.get("summarizeMode") as SummarizeMode) || "detailed";
      const inputType = formData.get("inputType") as string;
      let result = "";

      if (inputType === "url") {
        const url = formData.get("url") as string;
        const content = isYoutubeUrl(url) ? await getYoutubeTranscript(url) : await scrapeUrl(url);
        result = await processWithClaude(content, action, searchQuery || undefined, summarizeMode);
      } else if (inputType === "file") {
        const file = formData.get("file") as File;
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        if (file.type === "application/pdf") {
          const text = await parsePdf(buffer);
          result = await processWithClaude(text, action, searchQuery || undefined, summarizeMode);
        } else if (file.type.startsWith("image/")) {
          const base64 = buffer.toString("base64");
          const mediaType = file.type as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
          result = await processImageWithClaude(base64, mediaType, action, searchQuery || undefined, summarizeMode);
        } else {
          const text = buffer.toString("utf-8").slice(0, 15000);
          result = await processWithClaude(text, action, searchQuery || undefined, summarizeMode);
        }
      } else {
        return NextResponse.json({ error: "Invalid input type" }, { status: 400 });
      }

      const scansLeft = ANON_LIMIT - anonScans - 1;
      const response = NextResponse.json({ result, isSignedIn: false, scansLeft });
      response.cookies.set("prismiq_scans", String(anonScans + 1), {
        maxAge: 60 * 60 * 24 * 30, httpOnly: true, path: "/",
      });
      return response;

    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      if (message.includes("caption") || message.includes("transcript") || message.includes("No transcript")) {
        return NextResponse.json({ error: message }, { status: 400 });
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }
}
