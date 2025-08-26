import type { Metadata } from "next";
import localFont from "next/font/local";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

import { ReactLenis } from '@/lib/lenis'
import Navbar from "@/components/Navbar";

const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/Satoshi-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/Satoshi-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Verbatim - Real-Time AI Transcription",
  description: "Capture every word with Verbatim. Real-time AI transcription with flexible formatting, instant export, and seamless sharing.",
  keywords: ["transcription", "speech-to-text"],
  authors: [{ name: "Radi Adil" }],
  metadataBase: new URL("https://verbatim-pi.vercel.app"),

  openGraph: {
    title: "Verbatim - Real-Time AI Transcription",
    description:
      "Capture every word with Verbatim. Real-time AI transcription with flexible formatting, instant export, and seamless sharing.",
    url: "https://verbatim-pi.vercel.app",
    siteName: "Verbatim",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Verbatim - Real-Time AI Transcription"
      }
    ],
    locale: "en_US",
    type: "website"
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <ReactLenis root>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${satoshi.variable} ${inter.variable} antialiased`}
        >
          <Navbar />
          {children}
        </body>
      </ReactLenis>
    </html>
  );
}
