import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type Plan = "free" | "starter" | "pro" | "unlimited";

export const PLAN_LIMITS: Record<Plan, number> = {
  free: 4,       // total lifetime scans (not monthly)
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

  // Reset monthly scans if it's been 30+ days
  if (isMonthlyPlan) {
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

  await supabase
    .from("users")
    .update({ scans_used: (user.scans_used || 0) + 1 })
    .eq("email", email);
}

export async function checkUserCanScan(email: string): Promise<{ allowed: boolean; scansLeft: number }> {
  const user = await getUserByEmail(email);
  if (!user) return { allowed: false, scansLeft: 0 };

  const plan: Plan = user.plan || "free";
  const limit = PLAN_LIMITS[plan];
  const isMonthlyPlan = plan !== "free";

  let scansUsed = user.scans_used || 0;

  // Reset monthly counter if 30+ days passed
  if (isMonthlyPlan) {
    const resetAt = new Date(user.scans_reset_at);
    const daysSinceReset = (Date.now() - resetAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceReset >= 30) scansUsed = 0;
  }

  const scansLeft = Math.max(0, limit - scansUsed);
  return { allowed: scansLeft > 0, scansLeft };
}
