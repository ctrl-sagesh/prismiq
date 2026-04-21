'use client';

import { signIn } from "next-auth/react";
import Link from "next/link";

type ModalType = "signin_required" | "upgrade_required";

export default function PaywallModal({ type, onClose }: { type: ModalType; onClose: () => void }) {
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
        <div className="text-center mb-6">
          <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xl">⚡</div>
          <h2 className="text-xl font-bold text-white mb-1">You have used all your free scans</h2>
          <p className="text-white/50 text-sm">Choose a plan to keep going</p>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {/* Starter */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-white/60 text-xs font-medium mb-1">Starter</p>
            <p className="text-2xl font-bold text-white">$3<span className="text-sm font-normal text-white/40">/mo</span></p>
            <p className="text-violet-300 text-xs mt-1 mb-3">25 scans/month</p>
            <div className="space-y-1.5 text-left mb-4">
              {["All input types", "Summarize & Notes", "Q&A & Search", "Download notes"].map(f => (
                <p key={f} className="text-xs text-white/50 flex gap-1.5"><span className="text-violet-400">✓</span>{f}</p>
              ))}
            </div>
            <Link href="/upgrade" onClick={onClose} className="block w-full py-2 rounded-lg border border-white/20 text-white/70 text-xs hover:bg-white/5 transition-colors">
              Get Starter
            </Link>
          </div>

          {/* Pro - highlighted */}
          <div className="rounded-xl border border-violet-500/50 bg-violet-500/10 p-4 text-center relative">
            <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[10px] font-bold whitespace-nowrap">
              POPULAR
            </div>
            <p className="text-violet-300 text-xs font-medium mb-1">Pro</p>
            <p className="text-2xl font-bold text-white">$8<span className="text-sm font-normal text-white/40">/mo</span></p>
            <p className="text-violet-300 text-xs mt-1 mb-3">100 scans/month</p>
            <div className="space-y-1.5 text-left mb-4">
              {["Everything in Starter", "Priority processing", "Longer documents", "Early new features"].map(f => (
                <p key={f} className="text-xs text-violet-200 flex gap-1.5"><span className="text-violet-400">✓</span>{f}</p>
              ))}
            </div>
            <Link href="/upgrade" onClick={onClose} className="block w-full py-2 rounded-lg bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-semibold hover:opacity-90 transition-opacity">
              Get Pro
            </Link>
          </div>

          {/* Unlimited */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-white/60 text-xs font-medium mb-1">Unlimited</p>
            <p className="text-2xl font-bold text-white">$15<span className="text-sm font-normal text-white/40">/mo</span></p>
            <p className="text-violet-300 text-xs mt-1 mb-3">Unlimited scans</p>
            <div className="space-y-1.5 text-left mb-4">
              {["Everything in Pro", "Unlimited scans", "Bulk processing", "Priority support"].map(f => (
                <p key={f} className="text-xs text-white/50 flex gap-1.5"><span className="text-violet-400">✓</span>{f}</p>
              ))}
            </div>
            <Link href="/upgrade" onClick={onClose} className="block w-full py-2 rounded-lg border border-white/20 text-white/70 text-xs hover:bg-white/5 transition-colors">
              Get Unlimited
            </Link>
          </div>
        </div>

        <button onClick={onClose} className="w-full text-xs text-white/30 hover:text-white/50 transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  );
}
