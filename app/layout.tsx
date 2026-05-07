import type { Metadata } from "next";
import { Geist } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Prismiq: Summarize YouTube, PDFs and Websites Instantly",
  description: "Paste any YouTube video, website, PDF or image and get a clear summary, study notes or Q&A in seconds. Free to try, no account needed.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Prismiq: Summarize Anything Instantly",
    description: "Paste a YouTube video, website, PDF or image. Get a clear summary, study notes or Q&A in seconds.",
    url: "https://prismiqai.vercel.app",
    siteName: "Prismiq",
    type: "website",
    images: [{ url: "https://prismiqai.vercel.app/og.png", width: 1200, height: 630, alt: "Prismiq" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prismiq: Summarize Anything Instantly",
    description: "Paste a YouTube video, website, PDF or image. Get a clear summary, study notes or Q&A in seconds.",
    images: ["https://prismiqai.vercel.app/og.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#07070f] text-white antialiased">
        <SessionWrapper>{children}</SessionWrapper>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
