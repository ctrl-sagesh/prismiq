import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { processWithClaude, processImageWithClaude, Action } from "@/lib/claude";
import { scrapeUrl } from "@/lib/scraper";
import { getYoutubeTranscript } from "@/lib/youtube";
import { parsePdf } from "@/lib/pdfParser";
import { checkAndIncrementScan, PLAN_VIDEO_LIMITS, Plan } from "@/lib/supabase";
import { SummarizeMode } from "@/lib/claude";

export const maxDuration = 120;

const ANON_LIMIT = 2;

function isYoutubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function isUserError(message: string) {
  return message.includes("caption") || message.includes("transcript")
    || message.includes("live stream") || message.includes("upcoming")
    || message.includes("private") || message.includes("age-restricted")
    || message.includes("Could not read") || message.includes("Could not extract")
    || message.includes("minutes long") || message.includes("plan supports up to");
}

async function extractContent(formData: FormData, maxVideoMinutes: number): Promise<{ content: string; isImage: boolean; base64?: string; mediaType?: string }> {
  const inputType = formData.get("inputType") as string;

  if (inputType === "url") {
    const url = formData.get("url") as string;
    const content = isYoutubeUrl(url)
      ? await getYoutubeTranscript(url, maxVideoMinutes)
      : await scrapeUrl(url);
    return { content, isImage: false };
  }

  if (inputType === "file") {
    const file = formData.get("file") as File;

    const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_FILE_BYTES) {
      throw new Error("File is too large. Maximum size is 5 MB.");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.type === "application/pdf") {
      const text = await parsePdf(buffer);
      return { content: text, isImage: false };
    }

    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
      const base64 = buffer.toString("base64");
      return { content: "", isImage: true, base64, mediaType: file.type };
    }

    if (file.type.startsWith("image/")) {
      throw new Error("Unsupported image format. Please use JPEG, PNG, GIF, or WebP.");
    }

    const text = buffer.toString("utf-8").slice(0, 15000);
    return { content: text, isImage: false };
  }

  throw new Error("Invalid input type");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  const cookieStore = await cookies();

  if (session?.user?.email) {
    const { allowed, scansLeft, resetAt, plan } = await checkAndIncrementScan(session.user.email);
    if (!allowed) {
      return NextResponse.json({ error: "upgrade_required", resetAt }, { status: 429 });
    }

    try {
      const formData = await req.formData();
      const action = formData.get("action") as Action;
      const searchQuery = formData.get("searchQuery") as string | undefined;
      const summarizeMode = (formData.get("summarizeMode") as SummarizeMode) || "detailed";

      const maxVideoMinutes = PLAN_VIDEO_LIMITS[plan as Plan] ?? PLAN_VIDEO_LIMITS["free"];
      const { content, isImage, base64, mediaType } = await extractContent(formData, maxVideoMinutes);

      let result = "";
      if (isImage && base64 && mediaType) {
        result = await processImageWithClaude(base64, mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp", action, searchQuery || undefined, summarizeMode);
      } else {
        result = await processWithClaude(content, action, searchQuery || undefined, summarizeMode);
      }

      // Return extractedContent (text only) for chat follow-ups
      return NextResponse.json({
        result,
        isSignedIn: true,
        scansLeft,
        extractedContent: isImage ? null : content.slice(0, 12000),
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      return NextResponse.json({ error: message }, { status: isUserError(message) ? 400 : 500 });
    }

  } else {
    const anonScans = parseInt(cookieStore.get("prismiq_scans")?.value || "0", 10);
    if (anonScans >= ANON_LIMIT) {
      return NextResponse.json({ error: "signin_required" }, { status: 429 });
    }

    try {
      const formData = await req.formData();
      const action = formData.get("action") as Action;
      const searchQuery = formData.get("searchQuery") as string | undefined;
      const summarizeMode = (formData.get("summarizeMode") as SummarizeMode) || "detailed";

      const { content, isImage, base64, mediaType } = await extractContent(formData, PLAN_VIDEO_LIMITS["free"]);

      let result = "";
      if (isImage && base64 && mediaType) {
        result = await processImageWithClaude(base64, mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp", action, searchQuery || undefined, summarizeMode);
      } else {
        result = await processWithClaude(content, action, searchQuery || undefined, summarizeMode);
      }

      const scansLeft = ANON_LIMIT - anonScans - 1;
      const response = NextResponse.json({
        result,
        isSignedIn: false,
        scansLeft,
        extractedContent: isImage ? null : content.slice(0, 12000),
      });
      response.cookies.set("prismiq_scans", String(anonScans + 1), {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
      });
      return response;

    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      return NextResponse.json({ error: message }, { status: isUserError(message) ? 400 : 500 });
    }
  }
}
