import { supabase } from "./supabase";

/**
 * Per-IP sliding-window rate limiter backed by Supabase.
 *
 * Requires this table (one-time SQL migration, see deploy steps):
 *   create table if not exists rate_limits (
 *     key text primary key,
 *     count int not null default 0,
 *     window_start timestamptz not null default now()
 *   );
 *
 * If the table doesn't exist yet, this fails open (allows the request)
 * so the site never breaks on a missing migration.
 */

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt?: string;
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const now = new Date();
  try {
    const { data, error } = await supabase
      .from("rate_limits")
      .select("count, window_start")
      .eq("key", key)
      .single();

    // Table missing or other unexpected error → fail open
    if (error && error.code !== "PGRST116" /* no rows */) {
      console.warn("[rateLimit] DB error, failing open:", error.message);
      return { allowed: true, remaining: limit };
    }

    let count = 0;
    let windowStart = now;

    if (data) {
      const wStart = new Date(data.window_start);
      const ageSec = (now.getTime() - wStart.getTime()) / 1000;
      if (ageSec < windowSeconds) {
        count = data.count || 0;
        windowStart = wStart;
      }
    }

    if (count >= limit) {
      const resetAt = new Date(windowStart.getTime() + windowSeconds * 1000).toISOString();
      return { allowed: false, remaining: 0, resetAt };
    }

    // Increment (upsert)
    await supabase.from("rate_limits").upsert(
      {
        key,
        count: count + 1,
        window_start: windowStart.toISOString(),
      },
      { onConflict: "key" }
    );

    return { allowed: true, remaining: Math.max(0, limit - count - 1) };
  } catch (err) {
    console.warn("[rateLimit] unexpected:", err);
    return { allowed: true, remaining: limit }; // fail open
  }
}

/**
 * Extracts the client IP from common Vercel headers, falling back to a
 * stable placeholder so anonymous abuse still has a key.
 */
export function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return (
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

/**
 * Verifies the request originates from our own domain (basic CSRF defense).
 * Allows same-origin or no Origin (server-to-server). Blocks other origins.
 */
export function isOriginAllowed(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // no origin = not a browser CSRF vector

  const allowed = [
    "https://prismiqai.vercel.app",
    "http://localhost:3000",
  ];

  // Also allow any *.vercel.app preview deploys for this project
  if (origin.endsWith(".vercel.app") && origin.includes("prismiq")) return true;

  return allowed.includes(origin);
}
