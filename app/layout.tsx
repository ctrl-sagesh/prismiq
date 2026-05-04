import type { Metadata } from "next";
import { Geist } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prismiq | Understand Anything Instantly",
  description: "Paste any YouTube link, website, PDF or image. Get instant summaries, study notes, Q&A and more powered by AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#07070f] text-white antialiased">
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
