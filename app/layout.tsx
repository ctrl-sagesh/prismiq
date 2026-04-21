import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prismiq — Understand Anything Instantly",
  description: "Upload any link, PDF, image, or YouTube video and get instant summaries, notes, and Q&A powered by AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#07070f] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
