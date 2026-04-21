import Navbar from "@/components/Navbar";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$3",
    period: "/month",
    tagline: "Perfect for occasional use",
    scans: "25 scans / month",
    features: ["All input types (links, PDFs, images)", "Summarize & Key Notes", "Q&A generation", "Search inside content", "Download as Markdown"],
    cta: "Get Starter",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$8",
    period: "/month",
    tagline: "Best for students & researchers",
    scans: "100 scans / month",
    features: ["Everything in Starter", "Priority AI processing", "Longer documents & videos", "Early access to new features", "Email support"],
    cta: "Get Pro",
    highlight: true,
  },
  {
    name: "Unlimited",
    price: "$15",
    period: "/month",
    tagline: "For power users & teams",
    scans: "Unlimited scans",
    features: ["Everything in Pro", "Truly unlimited scans", "Bulk content processing", "Highest priority processing", "Priority support"],
    cta: "Get Unlimited",
    highlight: false,
  },
];

export default function UpgradePage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col items-center px-4 pt-28 pb-20 min-h-screen">
        <div className="text-center mb-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs mb-4">
            Simple pricing
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Pick a plan that{" "}
            <span style={{ background: "linear-gradient(to right, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              fits you
            </span>
          </h1>
          <p className="text-white/50">Start free. Upgrade anytime. Cancel anytime.</p>
        </div>

        {/* Free tier reminder */}
        <div className="flex items-center gap-3 mb-10 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm text-white/50">
          <span className="text-green-400">✓</span>
          2 free scans without account · 2 more after signing in with Google
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl mb-12">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border p-6 flex flex-col relative ${plan.highlight ? "border-violet-500/50 bg-violet-500/10" : "border-white/10 bg-white/[0.04]"}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white text-xs font-bold">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-4">
                <h2 className={`font-bold text-base mb-0.5 ${plan.highlight ? "text-violet-300" : "text-white/70"}`}>{plan.name}</h2>
                <div className="flex items-end gap-1 mb-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/40 text-sm mb-1">{plan.period}</span>
                </div>
                <p className="text-xs text-white/40">{plan.tagline}</p>
                <div className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-medium inline-block ${plan.highlight ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-white/50"}`}>
                  {plan.scans}
                </div>
              </div>

              <div className="space-y-2.5 mb-6 flex-1">
                {plan.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <span className="text-violet-400 mt-0.5 shrink-0">✓</span>
                    <span className={plan.highlight ? "text-violet-100" : "text-white/60"}>{f}</span>
                  </div>
                ))}
              </div>

              <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-opacity ${plan.highlight ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:opacity-90" : "border border-white/20 text-white/60 hover:bg-white/5"}`}>
                {plan.cta} — Coming Soon
              </button>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="w-full max-w-xl space-y-3">
          <h3 className="text-white font-semibold text-center mb-5">Common questions</h3>
          {[
            { q: "Do I need a card for the free plan?", a: "No. 2 free scans require nothing. Sign in with Google for 2 more — still no card." },
            { q: "Can I cancel anytime?", a: "Yes, cancel with one click. No questions asked, no hidden fees." },
            { q: "What counts as one scan?", a: "Each time you process a link, video, file, or image counts as one scan." },
            { q: "When will payments be available?", a: "Stripe payments are coming very soon. Join early to get notified." },
          ].map((faq) => (
            <div key={faq.q} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-white/80 text-sm font-medium mb-1">{faq.q}</p>
              <p className="text-white/40 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-white/30 text-xs text-center">
          Questions? Contact us at{" "}
          <a href="mailto:hello@prismiq.app" className="text-violet-400 hover:underline">hello@prismiq.app</a>
        </p>
      </main>
    </>
  );
}
