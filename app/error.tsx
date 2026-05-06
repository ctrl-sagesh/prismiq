'use client';

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-[#07070f]">
      <p className="text-6xl mb-6">⚠️</p>
      <h1 className="text-3xl font-bold text-white mb-3">Something went wrong</h1>
      <p className="text-white/40 mb-8 max-w-sm">An unexpected error occurred. This has been logged and we&apos;ll look into it.</p>
      <div className="flex gap-3">
        <button onClick={reset}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity">
          Try again
        </button>
        <Link href="/"
          className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:bg-white/5 transition-colors">
          Go home
        </Link>
      </div>
    </main>
  );
}
