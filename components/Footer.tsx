import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/[0.06] bg-[#07070f]/80 mt-auto">
      <div className="max-w-4xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-white/20 text-xs">© {new Date().getFullYear()} Prismiq. All rights reserved.</p>
        <div className="flex items-center gap-5 text-xs text-white/30">
          <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white/60 transition-colors">Terms of Service</Link>
          <a href="mailto:shopatmine01@gmail.com" className="hover:text-white/60 transition-colors">Contact</a>
          <Link href="/upgrade" className="hover:text-white/60 transition-colors">Pricing</Link>
        </div>
      </div>
    </footer>
  );
}
