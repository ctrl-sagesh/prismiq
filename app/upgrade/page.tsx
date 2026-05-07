'use client';

import Navbar from "@/components/Navbar";
import { useState } from "react";

const CHECKOUT = {
  starter: "https://itssazzzz.gumroad.com/l/tsamb",
  pro: "https://itssazzzz.gumroad.com/l/sfrolm",
  unlimited: "https://itssazzzz.gumroad.com/l/qbxck",
};

const plans = [
  {
    key: "starter",
    name: "Starter",
    price: "$3.99",
    period: "/mo",
    tagline: "Perfect for casual learners",
    badge: null,
    scans: "5 scans / day",
    color: "from-slate-500/20 to-slate-600/10",
    border: "border-white/10",
    glow: "",
    features: [
      "YouTube, websites, PDFs & images",
      "Summarize & Key Notes",
      "Q&A generation",
      "Flashcards & Quiz mode",
      "Download results",
    ],
    cta: "Get Starter",
    ctaClass: "border border-white/20 text-white hover:bg-white/10",
    href: CHECKOUT.starter,
    highlight: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: "$8.99",
    period: "/mo",
    tagline: "Built for students & researchers",
    badge: "MOST POPULAR",
    scans: "20 scans / day",
    color: "from-violet-600/20 to-pink-600/10",
    border: "border-violet-500/40",
    glow: "shadow-[0_0_60px_-10px_rgba(139,92,246,0.4)]",
    features: [
      "Everything in Starter",
      "Glossary generation",
      "AI Chat with your content",
      "Longer docs & videos",
      "Priority processing",
    ],
    cta: "Get Pro",
    ctaClass: "bg-gradient-to-r from-violet-600 to-pink-600 text-white hover:opacity-90",
    href: CHECKOUT.pro,
    highlight: true,
  },
  {
    key: "unlimited",
    name: "Unlimited",
    price: "$15.99",
    period: "/mo",
    tagline: "For power users & teams",
    badge: null,
    scans: "Unlimited scans",
    color: "from-amber-500/10 to-orange-500/5",
    border: "border-amber-500/20",
    glow: "",
    features: [
      "Everything in Pro",
      "No scan limits, ever",
      "Bulk processing",
      "Highest priority queue",
      "Priority support",
    ],
    cta: "Get Unlimited",
    ctaClass: "border border-amber-500/40 text-amber-300 hover:bg-amber-500/10",
    href: CHECKOUT.unlimited,
    highlight: false,
  },
];

const faqs = [
  { q: "Do I need a card for the free plan?", a: "No card needed. You get free scans just by visiting, and more when you sign in with Google." },
  { q: "Can I cancel anytime?", a: "Yes — cancel in one click, no questions asked, no hidden fees." },
  { q: "What counts as one scan?", a: "Processing any link, YouTube video, PDF, or image once = one scan." },
  { q: "What payment methods are accepted?", a: "All major credit cards and PayPal via Gumroad's secure checkout." },
  { q: "When do my scans reset?", a: "Free plan resets every 24 hours. Paid plans reset daily at the start of your billing period." },
];

export default function UpgradePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      <Navbar />

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(139,92,246,0.35) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.3) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)" }} />
        {/* Grid overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
      </div>

      <main className="relative z-10 flex flex-col items-center px-4 pt-28 pb-24 min-h-screen">

        {/* Hero */}
        <div className="text-center mb-14 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs mb-5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Simple, transparent pricing
          </div>
          <h1 className="text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
            Unlock your{" "}
            <span className="relative inline-block">
              <span style={{ background: "linear-gradient(135deg, #a78bfa, #f472b6, #fb923c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                full potential
              </span>
              <span className="absolute -bottom-1 left-0 right-0 h-px bg-gradient-to-r from-violet-500/0 via-violet-500/50 to-violet-500/0" />
            </span>
          </h1>
          <p className="text-white/50 text-lg">Start free. Upgrade when you need more. Cancel anytime.</p>

          {/* Trust row */}
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-white/30">
            <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> No card for free</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Cancel anytime</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> Secure via Gumroad</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span className="flex items-center gap-1.5"><span className="text-green-400">✓</span> PayPal accepted</span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-4xl mb-16 items-start">
          {plans.map((plan) => (
            <div
              key={plan.key}
              className={`relative rounded-3xl border bg-gradient-to-b p-7 flex flex-col transition-all duration-300 hover:-translate-y-1 ${plan.color} ${plan.border} ${plan.glow} ${plan.highlight ? "md:-translate-y-3 scale-[1.02]" : ""}`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-white text-[11px] font-bold tracking-wider shadow-lg shadow-violet-500/30">
                  {plan.badge}
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`font-bold text-lg ${plan.highlight ? "text-white" : "text-white/80"}`}>{plan.name}</h2>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${plan.highlight ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-white/40"}`}>
                    {plan.scans}
                  </span>
                </div>

                <div className="flex items-end gap-1.5 mb-1">
                  <span className="text-4xl font-bold text-white tracking-tight">{plan.price}</span>
                  <span className="text-white/30 mb-1.5 text-sm">{plan.period}</span>
                </div>
                <p className="text-white/40 text-sm">{plan.tagline}</p>
              </div>

              {/* Divider */}
              <div className={`h-px mb-5 ${plan.highlight ? "bg-violet-500/20" : "bg-white/5"}`} />

              {/* Features */}
              <ul className="space-y-3 mb-7 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${plan.highlight ? "bg-violet-500/30 text-violet-300" : "bg-white/5 text-white/40"}`}>✓</span>
                    <span className={plan.highlight ? "text-white/80" : "text-white/50"}>{f}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href={plan.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full py-3 rounded-xl text-sm font-semibold text-center transition-all duration-200 ${plan.ctaClass}`}
              >
                {plan.cta} →
              </a>
            </div>
          ))}
        </div>

        {/* Feature comparison table */}
        <div className="w-full max-w-4xl mb-16">
          <h3 className="text-white font-semibold text-center text-lg mb-6">Full feature comparison</h3>
          <div className="rounded-2xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-6 py-4 text-white/40 font-medium">Feature</th>
                  <th className="text-center px-4 py-4 text-white/60 font-medium">Free</th>
                  <th className="text-center px-4 py-4 text-violet-300 font-medium">Starter</th>
                  <th className="text-center px-4 py-4 text-white font-semibold relative">
                    <span className="text-transparent bg-clip-text" style={{ background: "linear-gradient(to right, #a78bfa, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Pro</span>
                  </th>
                  <th className="text-center px-4 py-4 text-amber-300 font-medium">Unlimited</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Daily scans", "4", "5", "20", "∞"],
                  ["YouTube summarization", "✓", "✓", "✓", "✓"],
                  ["Websites & PDFs", "✓", "✓", "✓", "✓"],
                  ["Image analysis", "✓", "✓", "✓", "✓"],
                  ["Study Notes & Q&A", "✓", "✓", "✓", "✓"],
                  ["Flashcards & Quiz", "—", "✓", "✓", "✓"],
                  ["Glossary generation", "—", "—", "✓", "✓"],
                  ["AI Chat with content", "—", "—", "✓", "✓"],
                  ["Download results", "✓", "✓", "✓", "✓"],
                  ["Priority processing", "—", "—", "✓", "✓"],
                  ["Priority support", "—", "—", "—", "✓"],
                ].map(([feature, free, starter, pro, unlimited], i) => (
                  <tr key={feature} className={`border-b border-white/5 ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                    <td className="px-6 py-3.5 text-white/60">{feature}</td>
                    {[free, starter, pro, unlimited].map((val, j) => (
                      <td key={j} className="text-center px-4 py-3.5">
                        {val === "✓" ? (
                          <span className={`inline-block w-5 h-5 rounded-full text-[11px] leading-5 ${j === 2 ? "bg-violet-500/20 text-violet-300" : "bg-white/5 text-white/40"}`}>✓</span>
                        ) : val === "—" ? (
                          <span className="text-white/15">—</span>
                        ) : (
                          <span className={`font-semibold ${j === 2 ? "text-violet-300" : j === 3 ? "text-amber-300" : "text-white/50"}`}>{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="w-full max-w-2xl mb-12">
          <h3 className="text-white font-semibold text-center text-lg mb-6">Common questions</h3>
          <div className="space-y-2">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="text-white/80 text-sm font-medium">{faq.q}</span>
                  <span className={`text-white/30 text-lg transition-transform duration-200 ${openFaq === i ? "rotate-45" : ""}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4">
                    <p className="text-white/40 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-white/20 text-sm mb-1">
            Questions? Reach us at{" "}
            <a href="mailto:shopatmine01@gmail.com" className="text-violet-400 hover:underline">shopatmine01@gmail.com</a>
          </p>
          <p className="text-white/10 text-xs">Payments processed securely by Gumroad · 30-day money-back guarantee</p>
        </div>
      </main>
    </>
  );
}
