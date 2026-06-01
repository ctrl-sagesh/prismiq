'use client';

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("prismiq_cookie_ok")) setVisible(true);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem("prismiq_cookie_ok", "1");
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
      <div className="max-w-2xl mx-auto pointer-events-auto flex items-center gap-4 px-5 py-3.5 rounded-2xl border border-white/10 bg-[#0e0e1a]/95 backdrop-blur-md shadow-2xl">
        <p className="text-white/50 text-xs flex-1 leading-relaxed">
          We use cookies to remember your free scan count.{" "}
          <Link href="/privacy" className="text-violet-400 hover:underline">Learn more</Link>.
        </p>
        <button onClick={dismiss}
          className="shrink-0 px-4 py-1.5 rounded-lg bg-violet-600 text-white text-xs font-semibold hover:bg-violet-500 transition-colors cursor-pointer">
          Got it
        </button>
      </div>
    </div>
  );
}
