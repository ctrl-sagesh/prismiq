'use client';

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-[#07070f]/80 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30 ring-1 ring-white/10">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 2.5H9C10.933 2.5 12.5 4.067 12.5 6C12.5 7.933 10.933 9.5 9 9.5H3V2.5Z" fill="white" fillOpacity="0.95"/>
              <path d="M3 9.5V13.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-base sm:text-lg text-white tracking-tight">Prismiq</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-3">
          <Link href="/how-it-works" className="text-sm text-white/60 hover:text-white transition-colors">How it works</Link>
          <Link href="/upgrade" className="text-sm text-white/60 hover:text-white transition-colors">Pricing</Link>
          <Link href="/upgrade" className="px-4 py-2 rounded-full bg-gradient-to-r from-violet-600 to-pink-600 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
            Upgrade
          </Link>
          {session?.user ? (
            <div className="flex items-center gap-3">
              <Link href="/account" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {session.user.image && (
                  <Image src={session.user.image} alt="avatar" width={30} height={30} className="rounded-full border border-white/20" />
                )}
                <span className="text-sm text-white/70">{session.user.name?.split(" ")[0]}</span>
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-xs text-white/40 hover:text-white/60 transition-colors cursor-pointer">
                Sign out
              </button>
            </div>
          ) : (
            <button onClick={() => signIn("google", { callbackUrl: "/" })} className="text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
              Sign in
            </button>
          )}
        </div>

        {/* Mobile: avatar/sign-in + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          {session?.user ? (
            <Link href="/account">
              {session.user.image ? (
                <Image src={session.user.image} alt="avatar" width={28} height={28} className="rounded-full border border-white/20" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                  {session.user.name?.[0] ?? "?"}
                </div>
              )}
            </Link>
          ) : (
            <button onClick={() => signIn("google", { callbackUrl: "/" })} className="text-xs text-white/60 hover:text-white transition-colors cursor-pointer">
              Sign in
            </button>
          )}
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-white/60">
              {menuOpen ? (
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-white/10 bg-[#07070f]/95 backdrop-blur-md px-4 py-3 space-y-3">
          <Link href="/how-it-works" onClick={() => setMenuOpen(false)} className="block text-sm text-white/60 hover:text-white transition-colors py-1">How it works</Link>
          <Link href="/upgrade" onClick={() => setMenuOpen(false)} className="block text-sm text-white/60 hover:text-white transition-colors py-1">Pricing</Link>
          <Link href="/upgrade" onClick={() => setMenuOpen(false)} className="block w-full text-center py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 text-sm font-semibold text-white">
            Upgrade
          </Link>
          {session?.user && (
            <button onClick={() => { signOut({ callbackUrl: "/" }); setMenuOpen(false); }} className="block w-full text-left text-sm text-white/40 hover:text-white/60 transition-colors py-1 cursor-pointer">
              Sign out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
