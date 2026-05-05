import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserByEmail, PLAN_LIMITS, Plan } from "@/lib/supabase";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const user = await getUserByEmail(session.user.email);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const plan: Plan = user.plan || "free";
  const limit = PLAN_LIMITS[plan];
  const scansUsed = user.scans_used || 0;

  // For free users: compute resetAt from period_start
  let resetAt: string | null = null;
  if (plan === "free" && user.period_start) {
    const periodStart = new Date(user.period_start);
    const hoursSince = (Date.now() - periodStart.getTime()) / (1000 * 60 * 60);
    if (hoursSince < 24) {
      resetAt = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000).toISOString();
    }
  }
  // For paid users: reset is monthly
  if (plan !== "free" && user.scans_reset_at) {
    resetAt = new Date(new Date(user.scans_reset_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  return NextResponse.json({
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    plan,
    scansUsed,
    limit,
    resetAt,
  });
}
