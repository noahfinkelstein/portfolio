/* ---------------------------------------------------------------------------
   Wraps every page: fonts, theme colors, and the metadata search engines read.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import { Newsreader, IBM_Plex_Mono } from "next/font/google";
import { site, theme, themeVars } from "@/content/site";
import "./globals.css";

/* Everything you read is set in Newsreader. To try another face, swap the
   import name above and here — pick any family from fonts.google.com. */
const serif = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  // next/font has no fallback metrics for Newsreader, so skip the generated
  // fallback face; globals.css already names Georgia as the stand-in.
  adjustFontFallback: false,
});

/* Used only for dates and technology lines, where figures need to line up. */
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: site.name,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  // "./" resolves against metadataBase per page, so every page gets a
  // canonical URL on the bare domain (www redirects there on Vercel).
  alternates: { canonical: "./" },
  // Only the shared parts. Leaving title/description/url out lets each page's
  // own metadata reach its OG tags instead of inheriting the home page's.
  // og:image comes from src/app/opengraph-image.png automatically.
  openGraph: {
    siteName: site.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${serif.variable} ${mono.variable}`}>
      <head>
        <style dangerouslySetInnerHTML={{ __html: themeVars(theme) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
