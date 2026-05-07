import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Plan = "free" | "starter" | "pro" | "unlimited";

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 4,        // per 24-hour window
  starter: 5,     // per 24-hour window
  pro: 20,        // per 24-hour window
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

  // All plans: set period_start on first scan of the 24h window
  const updates: Record<string, unknown> = { scans_used: (user.scans_used || 0) + 1 };
  if (!user.period_start) {
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
  const scansUsed = user.scans_used || 0;

  // All plans use the same 24-hour rolling window via period_start
  if (user.period_start) {
    const periodStart = new Date(user.period_start);
    const hoursSince = (Date.now() - periodStart.getTime()) / (1000 * 60 * 60);

    if (hoursSince >= 24) {
      // 24h window expired — reset fully regardless of how many scans were left
      await supabase.from("users").update({ scans_used: 0, period_start: null }).eq("email", email);
      return { allowed: true, scansLeft: limit };
    }

    // Still within window
    const scansLeft = Math.max(0, limit - scansUsed);
    if (scansLeft === 0) {
      const resetAt = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000).toISOString();
      return { allowed: false, scansLeft: 0, resetAt };
    }
    return { allowed: true, scansLeft };

  } else {
    // No active window yet
    if (scansUsed >= limit) {
      // Start the 24h clock now (handles legacy users)
      const now = new Date();
      await supabase.from("users").update({ period_start: now.toISOString() }).eq("email", email);
      const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      return { allowed: false, scansLeft: 0, resetAt };
    }
    return { allowed: true, scansLeft: limit - scansUsed };
  }
}
