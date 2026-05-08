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

// Max YouTube video length allowed per plan (in minutes)
export const PLAN_VIDEO_LIMITS: Record<Plan, number> = {
  free: 20,       // 20 minutes
  starter: 45,    // 45 minutes
  pro: 180,       // 3 hours
  unlimited: 9999, // effectively no limit
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

// Combined check + increment in one DB round-trip to minimize race window.
// Returns allowed=false if limit is already hit; increments immediately when allowed.
export async function checkAndIncrementScan(
  email: string
): Promise<{ allowed: boolean; scansLeft: number; resetAt?: string; plan: Plan }> {
  const user = await getUserByEmail(email);
  if (!user) return { allowed: false, scansLeft: 0, plan: "free" };

  const plan: Plan = user.plan || "free";
  const limit = PLAN_LIMITS[plan];
  let scansUsed = user.scans_used || 0;
  let periodStart = user.period_start ? new Date(user.period_start) : null;

  // Reset expired 24h window
  if (periodStart) {
    const hoursSince = (Date.now() - periodStart.getTime()) / (1000 * 60 * 60);
    if (hoursSince >= 24) {
      scansUsed = 0;
      periodStart = null;
    }
  }

  if (scansUsed >= limit) {
    // Start the clock if it wasn't running yet (legacy users)
    if (!periodStart) {
      const now = new Date();
      await supabase.from("users").update({ period_start: now.toISOString() }).eq("email", email);
      periodStart = now;
    }
    const resetAt = new Date(periodStart.getTime() + 24 * 60 * 60 * 1000).toISOString();
    return { allowed: false, scansLeft: 0, resetAt, plan };
  }

  // Allowed — increment immediately (single update call)
  const now = new Date();
  const updates: Record<string, unknown> = {
    scans_used: scansUsed + 1,
  };
  if (!periodStart) updates.period_start = now.toISOString();
  if (scansUsed === 0) updates.period_start = now.toISOString(); // fresh window

  await supabase.from("users").update(updates).eq("email", email);

  const scansLeft = Math.max(0, limit - scansUsed - 1);
  return { allowed: true, scansLeft, plan };
}

/** @deprecated Use checkAndIncrementScan instead */
export async function checkUserCanScan(
  email: string
): Promise<{ allowed: boolean; scansLeft: number; resetAt?: string; plan: Plan }> {
  return checkAndIncrementScan(email);
}

/** @deprecated No-op — increment now happens inside checkAndIncrementScan */
export async function incrementUserScans(_email: string) {
  // Intentionally empty — scan increment moved into checkAndIncrementScan
}
