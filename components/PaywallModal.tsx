'use client';

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";
const CHECKOUT = {
  starter: "https://prismiq.lemonsqueezy.com/checkout/buy/4ab47c49-588f-4cff-8751-744d0097764e",
  pro: "https://prismiq.lemonsqueezy.com/checkout/buy/4c620875-f1a5-4b0d-a61c-f0f6c1a51c77",
  unlimited: "https://prismiq.lemonsqueezy.com/checkout/buy/c9a3a007-85d6-4bff-ae0d-fb0fa6406778",
};

type ModalType = "signin_required" | "upgrade_required";

function useCountdown(resetAt?: string) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!resetAt) return;

    function tick() {
      const diff = new Date(resetAt!).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("00:00:00");
        return;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resetAt]);

  return timeLeft;
}

export default function PaywallModal({
  type,
  onClose,
  resetAt,
}: {
  type: ModalType;
  onClose: () => void;
  resetAt?: string;
}) {
  const timeLeft = useCountdown(resetAt);

  if (type === "signin_required") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0e0e1a] p-7 text-center shadow-2xl">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-2xl">🎁</div>
          <h2 className="text-xl font-bold text-white mb-2">You have used your 2 free scans</h2>
          <p className="text-white/50 text-sm mb-6 leading-relaxed">
            Create a free account to get <span className="text-violet-400 font-semibold">2 more free scans</span> — no card needed.
          </p>

          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white text-gray-800 font-semibold text-sm hover:bg-gray-100 transition-colors mb-3"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <button onClick={onClose} className="text-xs text-white/30 hover:text-white/50 transition-colors">
            Maybe later
          </button>
        </div>
      </div>
    );
  }

  // upgrade_required
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e0e1a] p-7 shadow-2xl">
        <div className="text-center mb-5">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl">⚡</div>
          <h2 className="text-xl font-bold text-white mb-1">You have used all your free scans</h2>
          <p className="text-white/50 text-sm">Upgrade to keep going, or wait for your free scans to reset.</p>

          {/* 24-hour countdown */}
          {timeLeft && (
            <div className="mt-4 inline-flex flex-col items-center gap-1 px-5 py-3 rounded-2xl border border-violet-500/20 bg-violet-500/8">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Free scans reset in</p>
              <p className="text-3xl font-bold tabular-nums" style={{ background: "linear-gradient(to right, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {timeLeft}
              </p>
              <p className="text-white/25 text-[10px]">hr : min : sec</p>
            </div>
          )}
        </div>

        {/* Plan rows — compact, no bullet clutter */}
        <div className="space-y-2.5 mb-5">
          {/* Starter */}
          <a href={CHECKOUT.starter} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07] transition-all group">
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm font-semibold">Starter</p>
              <p className="text-violet-300/70 text-xs mt-0.5">25 scans / month</p>
            </div>
            <p className="text-white font-bold text-base shrink-0">$3.99<span className="text-xs font-normal text-white/40"> /mo</span></p>
            <span className="text-white/30 group-hover:text-white/60 transition-colors text-sm">→</span>
          </a>

          {/* Pro */}
          <a href={CHECKOUT.pro} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-violet-500/50 bg-violet-500/10 hover:bg-violet-500/15 transition-all group relative">
            <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-bold">
              MOST POPULAR
            </div>
            <div className="flex-1 min-w-0 mt-0.5">
              <p className="text-violet-200 text-sm font-semibold">Pro</p>
              <p className="text-violet-300/70 text-xs mt-0.5">100 scans / month</p>
            </div>
            <p className="text-white font-bold text-base shrink-0">$8.99<span className="text-xs font-normal text-white/40">/mo</span></p>
            <span className="text-violet-300 group-hover:text-violet-100 transition-colors text-sm">→</span>
          </a>

          {/* Unlimited */}
          <a href={CHECKOUT.unlimited} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07] transition-all group">
            <div className="flex-1 min-w-0">
              <p className="text-white/70 text-sm font-semibold">Unlimited</p>
              <p className="text-violet-300/70 text-xs mt-0.5">Unlimited scans</p>
            </div>
            <p className="text-white font-bold text-base shrink-0">$15.99<span className="text-xs font-normal text-white/40">/mo</span></p>
            <span className="text-white/30 group-hover:text-white/60 transition-colors text-sm">→</span>
          </a>
        </div>

        <div className="flex items-center justify-between">
          <a href="/upgrade" className="text-xs text-violet-400/60 hover:text-violet-400 transition-colors">
            See full plan details →
          </a>
          <button onClick={onClose} className="text-xs text-white/30 hover:text-white/50 transition-colors">
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
