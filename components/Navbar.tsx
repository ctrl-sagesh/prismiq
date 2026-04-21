'use client';

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#07070f]/80 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">P</div>
        <span className="font-bold text-lg text-white">Prismiq</span>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/upgrade" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
        <Link href="/upgrade" className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
          Upgrade
        </Link>
      </div>
    </nav>
  );
}
