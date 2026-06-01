'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import Image from "next/image";

type Plan = "free" | "starter" | "pro" | "unlimited";

interface AccountData {
  name: string;
  email: string;
  image?: string;
  plan: Plan;
  scansUsed: number;
  limit: number;
  resetAt?: string;
}

const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
  unlimited: "Unlimited",
};

const PLAN_COLORS: Record<Plan, string> = {
  free: "border-white/20 text-white/50",
  starter: "border-violet-500/40 text-violet-300",
  pro: "border-pink-500/40 text-pink-300",
  unlimited: "border-amber-500/40 text-amber-300",
};

function useCountdown(resetAt?: string) {
  const [t, setT] = useState("");
  useEffect(() => {
    if (!resetAt) return;
    const tick = () => {
      const diff = new Date(resetAt).getTime() - Date.now();
      if (diff <= 0) { setT("Resetting..."); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setT(`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetAt]);
  return t;
}

export default function AccountPage() {
  const router = useRouter();
  const [data, setData] = useState<AccountData | null>(null);
  const [loading, setLoading] = useState(true);
  const countdown = useCountdown(data?.resetAt);

  useEffect(() => {
    fetch("/api/account")
      .then(r => {
        if (r.status === 401) { router.push("/"); return null; }
        return r.json();
      })
      .then(d => { if (d) setData(d); })
      .finally(() => setLoading(false));
  }, [router]);

  const pct = data ? Math.min(100, Math.round((data.scansUsed / data.limit) * 100)) : 0;

  return (
    <>
      <Navbar />

      {/* Background orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[500px] h-[500px]" style={{ background: "radial-gradient(circle at 20% 20%, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px]" style={{ background: "radial-gradient(circle at 80% 80%, rgba(236,72,153,0.10) 0%, transparent 70%)" }} />
      </div>

      <main className="relative z-10 flex flex-col items-center px-4 pt-28 pb-20 min-h-screen">
        <div className="w-full max-w-lg">

          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-6 h-6 rounded-full border-2 border-white/20 border-t-violet-500 animate-spin" />
            </div>
          ) : !data ? (
            <p className="text-white/40 text-center">Could not load account data.</p>
          ) : (
            <>
              {/* Profile */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-8">
                <div className="flex items-center gap-3 sm:gap-4">
                  {data.image ? (
                    <Image src={data.image} alt="avatar" width={48} height={48} className="rounded-full border-2 border-white/15" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl font-bold">
                      {data.name?.[0] ?? "?"}
                    </div>
                  )}
                  <div>
                    <p className="text-white font-semibold text-base sm:text-lg leading-tight">{data.name}</p>
                    <p className="text-white/40 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-none">{data.email}</p>
                  </div>
                </div>
                <div className={`sm:ml-auto px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wide ${PLAN_COLORS[data.plan]}`}>
                  {PLAN_LABELS[data.plan]}
                </div>
              </div>

              {/* Scan usage card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white font-semibold text-sm">Scan usage</p>
                  <p className="text-white/40 text-xs">
                    resets every 24 hours
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-white/10 mb-3 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      background: pct >= 100
                        ? "linear-gradient(to right, #ef4444, #dc2626)"
                        : "linear-gradient(to right, #7c3aed, #ec4899)",
                    }}
                  />
                </div>

                <div className="flex items-end justify-between">
                  <p className="text-white/60 text-sm">
                    <span className="text-white font-bold text-xl">{data.scansUsed}</span>
                    <span className="text-white/30"> / {data.limit === 999999 ? "∞" : data.limit} scans used</span>
                  </p>
                  {data.limit !== 999999 && data.scansUsed < data.limit && (
                    <p className="text-green-400 text-xs font-medium">{data.limit - data.scansUsed} remaining</p>
                  )}
                </div>

                {/* Countdown or next reset */}
                {countdown && (
                  <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
                    <p className="text-white/30 text-xs">
                      {data.scansUsed >= data.limit ? "Scans reset in" : "Next reset in"}
                    </p>
                    <p className="font-bold tabular-nums text-sm"
                      style={{ background: "linear-gradient(to right, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                      {countdown}
                    </p>
                  </div>
                )}
              </div>

              {/* Plan actions */}
              {data.plan === "free" ? (
                <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 mb-4">
                  <p className="text-white font-semibold text-sm mb-1">Upgrade for more scans</p>
                  <p className="text-white/40 text-xs mb-4">Get 5, 20 or unlimited scans per day. Cancel anytime.</p>
                  <Link href="/upgrade"
                    className="inline-block px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                    See plans
                  </Link>
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 mb-4">
                  <p className="text-white font-semibold text-sm mb-1">Manage subscription</p>
                  <p className="text-white/40 text-xs mb-4">
                    To cancel, change plan, or get a refund, email us and we will handle it within 24 hours.
                  </p>
                  <a href="mailto:shopatmine01@gmail.com?subject=Subscription%20Management"
                    className="inline-block px-5 py-2.5 rounded-xl border border-white/20 text-white/70 text-sm font-medium hover:bg-white/5 transition-colors">
                    Contact support
                  </a>
                </div>
              )}

              {/* Back to app */}
              <div className="text-center mt-2">
                <Link href="/" className="text-xs text-white/25 hover:text-white/50 transition-colors">
                  Back to Prismiq
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
