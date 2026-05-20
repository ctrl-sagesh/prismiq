import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { chatWithContent, ChatMessage } from "@/lib/claude";
import { rateLimit, getClientIp, isOriginAllowed } from "@/lib/rateLimit";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // CSRF defense
  if (!isOriginAllowed(req)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Per-IP rate limit: 30 chat messages / 60s
  const ip = getClientIp(req);
  const rl = await rateLimit(`chat:${ip}`, 30, 60);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "You're sending messages too fast. Try again in a moment." },
      { status: 429 }
    );
  }

  // Must be signed in or have anon scan history to use chat
  const session = await auth();
  const cookieStore = await cookies();
  const anonScans = parseInt(cookieStore.get("prismiq_scans")?.value || "0", 10);

  if (!session?.user?.email && anonScans === 0) {
    return NextResponse.json({ error: "Please scan a source first to use chat." }, { status: 401 });
  }

  try {
    const { content, question, history } = await req.json() as {
      content: string;
      question: string;
      history: ChatMessage[];
    };

    if (!content || !question) {
      return NextResponse.json({ error: "Missing content or question." }, { status: 400 });
    }

    const MAX_MSG_CHARS = 2000;
    const safeHistory = (history || [])
      .slice(-6)
      .map((m) => ({ ...m, content: m.content.slice(0, MAX_MSG_CHARS) }));

    const answer = await chatWithContent(
      content.slice(0, 12000),
      question.slice(0, 1000),
      safeHistory
    );

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
