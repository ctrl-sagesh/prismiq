import type { Metadata } from "next";
import { Geist } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";
import Footer from "@/components/Footer";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prismiq: Summarize YouTube, PDFs and Websites Instantly",
  description: "Paste any YouTube video, website, PDF or image and get a clear summary, study notes or Q&A in seconds. Free to try, no account needed.",
  openGraph: {
    title: "Prismiq: Summarize Anything Instantly",
    description: "Paste a YouTube video, website, PDF or image. Get a clear summary, study notes or Q&A in seconds.",
    url: "https://prismiqai.vercel.app",
    siteName: "Prismiq",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prismiq: Summarize Anything Instantly",
    description: "Paste a YouTube video, website, PDF or image. Get a clear summary, study notes or Q&A in seconds.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#07070f] text-white antialiased">
        <SessionWrapper>{children}</SessionWrapper>
        <Footer />
      </body>
    </html>
  );
}
