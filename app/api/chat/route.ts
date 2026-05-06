import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { chatWithContent, ChatMessage } from "@/lib/claude";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
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

    const answer = await chatWithContent(
      content.slice(0, 12000),
      question,
      (history || []).slice(-6) // keep last 3 exchanges
    );

    return NextResponse.json({ answer });
  } catch {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
