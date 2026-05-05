'use client';

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#07070f]/80 backdrop-blur-md">
      <Link href="/" className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/30 ring-1 ring-white/10">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 2.5H9C10.933 2.5 12.5 4.067 12.5 6C12.5 7.933 10.933 9.5 9 9.5H3V2.5Z" fill="white" fillOpacity="0.95"/>
            <path d="M3 9.5V13.5" stroke="white" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="font-bold text-lg text-white tracking-tight">Prismiq</span>
      </Link>

      <div className="flex items-center gap-3">
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
              <span className="text-sm text-white/70 hidden sm:block">{session.user.name?.split(" ")[0]}</span>
            </Link>
            <button onClick={() => signOut()} className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Sign out
            </button>
          </div>
        ) : (
          <button onClick={() => signIn("google")} className="text-sm text-white/60 hover:text-white transition-colors">
            Sign in
          </button>
        )}
      </div>
    </nav>
  );
}
