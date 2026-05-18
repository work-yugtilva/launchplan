import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "LaunchPlan.dev — Discover Startup Ideas Worth Building",
  description:
    "Pre-researched, PM-validated startup ideas with real market signals, community proof, and AI-powered analysis. Built for product managers and founders.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://launchplan.dev"),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${instrumentSerif.variable}`}>
      <body>{children}</body>
    </html>
  );
}