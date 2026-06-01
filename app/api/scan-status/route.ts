import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/auth";
import { checkUserCanScan } from "@/lib/supabase";

const ANON_LIMIT = 2;

export async function GET() {
  const session = await auth();

  if (session?.user?.email) {
    const { scansLeft, resetAt } = await checkUserCanScan(session.user.email);
    return NextResponse.json({ signedIn: true, scansLeft, resetAt });
  }

  // Anonymous user — read cookie to show remaining scans
  const cookieStore = await cookies();
  const anonScans = parseInt(cookieStore.get("prismiq_scans")?.value || "0", 10);
  const anonScansLeft = Math.max(0, ANON_LIMIT - anonScans);

  return NextResponse.json({ signedIn: false, anonScansLeft });
}
