import type { Metadata } from "next";
import { Fraunces, Instrument_Sans, Noto_Serif_Devanagari } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SmoothScroll } from "@/components/smooth-scroll";
import { Providers } from "@/components/providers";
import { CustomCursor } from "@/components/cursor";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin"],
  display: "swap",
});

const notoDevanagari = Noto_Serif_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Yatra Setu — Yatra bane seva",
    template: "%s · Yatra Setu",
  },
  description:
    "Discover India, restore the places you love, and earn rewards that make your next journey lighter on the land. Yatra bane seva — let the journey become service.",
  keywords: ["India travel", "restoration events", "responsible tourism", "Yatra Setu", "travel rewards"],
  openGraph: {
    title: "Yatra Setu — Yatra bane seva",
    description:
      "Travel farther. Leave something better behind. Discover, restore, get rewarded.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${instrument.variable} ${notoDevanagari.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <CustomCursor />
        <Providers>
          <SmoothScroll>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}