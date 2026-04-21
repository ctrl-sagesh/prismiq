'use client';

import Link from "next/link";

export default function PaywallModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-violet-500/30 bg-[#0e0e1a] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-2xl">
          🔒
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Free limit reached</h2>
        <p className="text-white/60 mb-6 text-sm leading-relaxed">
          You have used all 3 free scans. Upgrade to Prismiq Pro for unlimited scans, all file types, and priority processing.
        </p>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6 text-left space-y-2">
          {["Unlimited scans", "All file types (PDF, images, videos)", "YouTube & website links", "Export notes as PDF/Markdown", "Priority AI processing"].map((f) => (
            <div key={f} className="flex items-center gap-2 text-sm text-white/80">
              <span className="text-violet-400">✓</span> {f}
            </div>
          ))}
        </div>

        <Link
          href="/upgrade"
          className="block w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity mb-3"
        >
          Upgrade — $9/month
        </Link>
        <button onClick={onClose} className="text-sm text-white/40 hover:text-white/60 transition-colors">
          Maybe later
        </button>
      </div>
    </div>
  );
}
