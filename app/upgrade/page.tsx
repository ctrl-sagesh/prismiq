import Navbar from "@/components/Navbar";
import Link from "next/link";

const CHECKOUT = {
  starter: "https://prismiq.lemonsqueezy.com/checkout/buy/4ab47c49-588f-4cff-8751-744d0097764e",
  pro: "https://prismiq.lemonsqueezy.com/checkout/buy/4c620875-f1a5-4b0d-a61c-f0f6c1a51c77",
  unlimited: "https://prismiq.lemonsqueezy.com/checkout/buy/c9a3a007-85d6-4bff-ae0d-fb0fa6406778",
};

const plans = [
  {
    name: "Starter",
    price: "$3.99",
    period: "/month",
    tagline: "Good for light, regular use",
    scans: "25 scans / month",
    features: ["Links, PDFs, images and YouTube", "Summarize and Key Notes", "Q&A generation", "Search inside content", "Download as Markdown"],
    cta: "Get Starter",
    href: CHECKOUT.starter,
    highlight: false,
  },
  {
    name: "Pro",
    price: "$8.99",
    period: "/month",
    tagline: "Built for students and researchers",
    scans: "100 scans / month",
    features: ["Everything in Starter", "Faster AI responses", "Longer documents and videos", "Early access to new features", "Email support"],
    cta: "Get Pro",
    href: CHECKOUT.pro,
    highlight: true,
  },
  {
    name: "Unlimited",
    price: "$15.99",
    period: "/month",
    tagline: "For heavy users and teams",
    scans: "Unlimited scans",
    features: ["Everything in Pro", "No scan limits ever", "Bulk content processing", "Highest priority processing", "Priority support"],
    cta: "Get Unlimited",
    href: CHECKOUT.unlimited,
    highlight: false,
  },
];

export default function UpgradePage() {
  return (
    <>
      <Navbar />

      {/* Background glow orbs */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-[550px] h-[550px]" style={{ background: "radial-gradient(circle at 20% 20%, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
        <div className="absolute top-0 right-0 w-[450px] h-[450px]" style={{ background: "radial-gradient(circle at 80% 15%, rgba(236,72,153,0.10) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[380px] h-[380px]" style={{ background: "radial-gradient(circle at 50% 85%, rgba(192,38,211,0.07) 0%, transparent 70%)" }} />
      </div>

      <main className="relative z-10 flex flex-col items-center px-4 pt-28 pb-20 min-h-screen">
        <div className="relative text-center mb-4 max-w-xl">

          {/* Floating plan feature chips */}
          <div className="hidden lg:block">
            <div className="absolute -left-40 top-4 animate-float">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">
                ✓ No credit card
              </div>
            </div>
            <div className="absolute -left-36 top-16 animate-float-rev">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">
                ⚡ Cancel anytime
              </div>
            </div>
            <div className="absolute -right-36 top-4 animate-float-slow">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">
                🔒 Secure checkout
              </div>
            </div>
            <div className="absolute -right-32 top-16 animate-float">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/40 backdrop-blur-sm whitespace-nowrap">
                💳 PayPal accepted
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs mb-4">
            Simple pricing
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            Pick a plan that{" "}
            <span style={{ background: "linear-gradient(to right, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              fits you
            </span>
          </h1>
          <p className="text-white/50">Start free. No card needed. Cancel anytime.</p>
        </div>{/* end relative hero */}

        {/* Free tier reminder */}
        <div className="flex items-center gap-3 mb-10 px-4 py-2.5 rounded-full border border-white/10 bg-white/5 text-sm text-white/50">
          <span className="text-green-400">✓</span>
          2 free scans, no account needed. Sign in with Google for 2 more.
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

              <a href={plan.href} target="_blank" rel="noopener noreferrer"
                className={`block w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-opacity ${plan.highlight ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:opacity-90" : "border border-white/20 text-white/60 hover:bg-white/5"}`}>
                {plan.cta}
              </a>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="w-full max-w-xl space-y-3">
          <h3 className="text-white font-semibold text-center mb-5">Common questions</h3>
          {[
            { q: "Do I need a card for the free plan?", a: "No card needed at all. You get 2 free scans just by visiting, and 2 more when you sign in with Google." },
            { q: "Can I cancel anytime?", a: "Yes, cancel with one click from your account. No questions asked, no hidden fees." },
            { q: "What counts as one scan?", a: "Processing any link, video, PDF, or image once counts as one scan." },
            { q: "What payment methods are accepted?", a: "We accept all major credit cards and PayPal via a secure checkout." },
          ].map((faq) => (
            <div key={faq.q} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <p className="text-white/80 text-sm font-medium mb-1">{faq.q}</p>
              <p className="text-white/40 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>

        <p className="mt-10 text-white/30 text-xs text-center">
          Questions? Contact us at{" "}
          <a href="mailto:shopatmine01@gmail.com" className="text-violet-400 hover:underline">shopatmine01@gmail.com</a>
        </p>
      </main>
    </>
  );
}
