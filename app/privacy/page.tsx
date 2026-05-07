import Navbar from "@/components/Navbar";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy - Prismiq",
  description: "How Prismiq collects, uses and protects your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-8">
          <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">← Back to Prismiq</Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-white/30 text-sm mb-10">Last updated: May 2025</p>

        <div className="space-y-8 text-white/60 text-sm leading-relaxed">

          <section>
            <h2 className="text-white font-semibold text-base mb-3">1. What we collect</h2>
            <p>When you sign in with Google, we receive your name, email address, and profile picture. We store these to manage your account and track your scan usage. We do not collect payment card details — all payments are processed securely by Gumroad.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">2. How we use your data</h2>
            <ul className="space-y-2 list-none">
              {[
                "To create and manage your Prismiq account",
                "To track your scan usage and enforce plan limits",
                "To activate paid plans when a subscription is confirmed",
                "To respond to support requests",
              ].map(item => (
                <li key={item} className="flex gap-2"><span className="text-violet-400 shrink-0">·</span>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">3. Content you submit</h2>
            <p>URLs, files, and images you paste or upload are sent to our AI provider (Anthropic) for processing and are not stored by Prismiq after your session ends. We do not use your submitted content to train AI models.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">4. Cookies and sessions</h2>
            <p>We use a session cookie to keep you signed in and a cookie to track anonymous scan usage. We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">5. Third-party services</h2>
            <ul className="space-y-2 list-none">
              {[
                "Google OAuth — for sign-in only. We do not access your Google Drive, Gmail, or any other Google data.",
                "Supabase — stores your account data (name, email, plan, scan count) in a secure database.",
                "Gumroad — processes payments. Your payment details go directly to Gumroad, never to us.",
                "Anthropic — processes the content you submit to generate summaries. Subject to Anthropic's privacy policy.",
              ].map(item => (
                <li key={item} className="flex gap-2"><span className="text-violet-400 shrink-0">·</span>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">6. Data retention</h2>
            <p>Your account data (name, email, plan, scan count) is retained as long as your account exists. You can request deletion at any time by emailing us — we will remove your data within 7 days.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">7. Your rights</h2>
            <p>You have the right to access, correct, or delete your personal data. To exercise any of these rights, email us at the address below.</p>
          </section>

          <section>
            <h2 className="text-white font-semibold text-base mb-3">8. Contact</h2>
            <p>Questions about this policy? Email us at <a href="mailto:shopatmine01@gmail.com" className="text-violet-400 hover:underline">shopatmine01@gmail.com</a>.</p>
          </section>

        </div>
      </main>
    </>
  );
}
