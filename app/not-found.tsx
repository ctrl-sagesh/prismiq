import Link from "next/link";
import Navbar from "@/components/Navbar";

export const metadata = { title: "Page not found — Prismiq" };

export default function NotFound() {
  return (
    <>
      <Navbar />
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px]"
          style={{ background: "radial-gradient(circle at 50% 30%, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
      </div>
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <p className="text-7xl mb-6">🔍</p>
        <h1 className="text-4xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-white/40 text-lg mb-8 max-w-sm">
          This page doesn&apos;t exist or was moved. Head back and keep summarizing.
        </p>
        <Link href="/"
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity">
          Back to Prismiq
        </Link>
      </main>
    </>
  );
}
