import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Plan = "free" | "starter" | "pro" | "unlimited";

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 4,       // per 24-hour window
  starter: 25,   // per month
  pro: 100,      // per month
  unlimited: 999999,
};

export async function getOrCreateUser(email: string, name?: string, image?: string) {
  const { data, error } = await supabase
    .from("users")
    .upsert({ email, name, image }, { onConflict: "email", ignoreDuplicates: false })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserByEmail(email: string) {
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();
  return data;
}

export async function incrementUserScans(email: string) {
  const user = await getUserByEmail(email);
  if (!user) return;

  const plan: Plan = user.plan || "free";
  const isMonthlyPlan = plan !== "free";

  if (isMonthlyPlan) {
    // Reset monthly scans if it's been 30+ days
    const resetAt = new Date(user.scans_reset_at);
    const daysSinceReset = (Date.now() - resetAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReset >= 30) {
      await supabase
        .from("users")
        .update({ scans_used: 1, scans_reset_at: new Date().toISOString() })
        .eq("email", email);
      return;
    }
  }

  // For free plan: set period_start when the first scan of this 24h window happens
  const updates: Record<string, unknown> = { scans_used: (user.scans_used || 0) + 1 };
  if (!isMonthlyPlan && !user.period_start) {
    updates.period_start = new Date().toISOString();
  }

  await supabase.from("users").update(updates).eq("email", email);
}

export async function checkUserCanScan(
  email: string
): Promise<{ allowed: boolean; scansLeft: number; resetAt?: string }> {
  const user = await getUserByEmail(email);
  if (!user) return { allowed: false, scansLeft: 0 };

  const plan: Plan = user.plan || "free";
  const limit = PLAN_LIMITS[plan];
  const isFreePlan = plan === "free";

  let scansUsed = user.scans_used || 0;

  if (isFreePlan) {
    // 24-hour window: check if the current period has expired
    if (user.period_start) {
      const periodStart = new Date(user.period_start);
      const hoursSincePeriod = (Date.now() - periodStart.getTime()) / (1000 * 60 * 60);
      if (hoursSincePeriod >= 24) {
        // Period expired — reset so this scan is allowed
        await supabase
          .from("users")
          .update({ scans_used: 0, period_start: null })
          .eq("email", email);
        scansUsed = 0;
      }
    }
  } else {
    // Monthly reset for paid plans
    const resetAt = new Date(user.scans_reset_at);
    const daysSinceReset = (Date.now() - resetAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReset >= 30) scansUsed = 0;
  }

  const scansLeft = Math.max(0, limit - scansUsed);

  // If free user is out of scans and still within the 24h window, return when they reset
  if (isFreePlan && scansLeft === 0 && user.period_start) {
    const periodStart = new Date(user.period_start);
    const hoursSincePeriod = (Date.now() - periodStart.getTime()) / (1000 * 60 * 60);
    if (hoursSincePeriod < 24) {
      const resetAt = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000).toISOString();
      return { allowed: false, scansLeft: 0, resetAt };
    }
  }

  return { allowed: scansLeft > 0, scansLeft };
}
