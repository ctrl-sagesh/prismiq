import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { processWithClaude, processImageWithClaude, Action } from "@/lib/claude";
import { scrapeUrl } from "@/lib/scraper";
import { getYoutubeTranscript } from "@/lib/youtube";
import { parsePdf } from "@/lib/pdfParser";
import { checkAndIncrementScan, PLAN_VIDEO_LIMITS, Plan } from "@/lib/supabase";
import { SummarizeMode } from "@/lib/claude";
import { rateLimit, getClientIp, isOriginAllowed } from "@/lib/rateLimit";

export const runtime = "nodejs";
export const maxDuration = 120;

const ANON_LIMIT = 2;

function isYoutubeUrl(url: string) {
  return /youtube\.com|youtu\.be/.test(url);
}

function isUserError(message: string) {
  return (
    message.includes("caption") ||
    message.includes("transcript") ||
    message.includes("subtitles") ||
    message.includes("live stream") ||
    message.includes("upcoming") ||
    message.includes("private") ||
    message.includes("age-restricted") ||
    message.includes("Could not read") ||
    message.includes("Could not extract") ||
    message.includes("minutes long") ||
    message.includes("plan supports up to") ||
    message.includes("valid YouTube link") ||
    message.includes("File is too large") ||
    message.includes("Unsupported image format")
  );
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
  // ─── CSRF: block cross-origin browsers ──────────────────────────────────
  if (!isOriginAllowed(req)) {
    console.warn("[process] CSRF blocked origin:", req.headers.get("origin"));
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ─── IP rate limit: 15 requests / 60s per IP (anti-abuse) ───────────────
  const ip = getClientIp(req);
  const rl = await rateLimit(`process:${ip}`, 15, 60);
  if (!rl.allowed) {
    console.warn("[process] rate limit hit for IP", ip);
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again in a minute." },
      { status: 429 }
    );
  }

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

      console.log(`[AUDIT] scan email=${session.user.email} plan=${plan} action=${action} isImage=${isImage} scansLeft=${scansLeft}`);

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
      console.log(`[AUDIT] anon-scan ip=${ip} action=${action} isImage=${isImage} scansLeft=${scansLeft}`);
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
