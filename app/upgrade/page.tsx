import Navbar from "@/components/Navbar";
import Link from "next/link";

const features = [
  { free: "3 scans total", pro: "Unlimited scans" },
  { free: "Links & YouTube", pro: "Links, YouTube, PDFs, images" },
  { free: "Summarize & Notes", pro: "All modes: Summarize, Notes, Q&A, Search" },
  { free: "No export", pro: "Export as Markdown" },
  { free: "Standard speed", pro: "Priority AI processing" },
];

export default function UpgradePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center px-4 pt-28 pb-20 min-h-screen">
        <div className="text-center mb-12 max-w-xl">
          <h1 className="text-4xl font-bold text-white mb-4">
            Simple,{" "}
            <span style={{ background: "linear-gradient(to right, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              honest
            </span>{" "}
            pricing
          </h1>
          <p className="text-white/50">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          {/* Free */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-lg font-bold text-white mb-1">Free</h2>
            <p className="text-3xl font-bold text-white mb-1">$0</p>
            <p className="text-white/40 text-sm mb-6">Forever free</p>
            <div className="space-y-3 mb-6">
              {features.map((f) => (
                <div key={f.free} className="flex items-center gap-2 text-sm text-white/60">
                  <span className="text-white/30">•</span> {f.free}
                </div>
              ))}
            </div>
            <Link href="/" className="block w-full py-2.5 rounded-xl border border-white/20 text-white/60 text-sm text-center hover:bg-white/5 transition-colors">
              Get started free
            </Link>
          </div>

          {/* Pro */}
          <div className="rounded-2xl border border-violet-500/40 bg-violet-500/10 p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-semibold">
              Most popular
            </div>
            <h2 className="text-lg font-bold text-white mb-1">Pro</h2>
            <p className="text-3xl font-bold text-white mb-1">$9<span className="text-base font-normal text-white/40">/month</span></p>
            <p className="text-white/40 text-sm mb-6">Cancel anytime</p>
            <div className="space-y-3 mb-6">
              {features.map((f) => (
                <div key={f.pro} className="flex items-center gap-2 text-sm text-violet-200">
                  <span className="text-violet-400">✓</span> {f.pro}
                </div>
              ))}
            </div>
            <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              Coming soon
            </button>
          </div>
        </div>

        <p className="mt-8 text-white/30 text-xs text-center max-w-sm">
          Stripe payments coming soon. For early access, contact us at{" "}
          <a href="mailto:hello@prismiq.app" className="text-violet-400 hover:underline">hello@prismiq.app</a>
        </p>
      </main>
    </>
  );
}
