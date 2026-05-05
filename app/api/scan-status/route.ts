import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { checkUserCanScan } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ signedIn: false });
  }
  const { scansLeft, resetAt } = await checkUserCanScan(session.user.email);
  return NextResponse.json({ signedIn: true, scansLeft, resetAt });
}
