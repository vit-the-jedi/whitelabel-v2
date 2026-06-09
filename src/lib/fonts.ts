/**
 * Font registry — all Google Fonts used across brand configs, statically
 * imported so Next.js can self-host and optimize them at build time.
 *
 * To add a new font:
 *  1. Import it here from "next/font/google"
 *  2. Add it to the fontMap with the exact name used in DefaultConfig.theme.googleFont
 */

import { Nunito_Sans, Inter } from "next/font/google";

const nunitoSans = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-primary",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-primary",
});

type FontEntry = { className: string; variable: string };

export const fontMap: Record<string, FontEntry> = {
  "Nunito Sans": nunitoSans,
  Inter: inter,
};

export const defaultFont: FontEntry = nunitoSans;

export function getFontForConfig(googleFont?: string): FontEntry {
  if (googleFont && fontMap[googleFont]) {
    return fontMap[googleFont];
  }
  return defaultFont;
}
