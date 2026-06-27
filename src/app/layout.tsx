/**
 * ============================================================================
 *  ROOT LAYOUT  —  wraps every page on the site.
 * ============================================================================
 *
 * Next.js App Router requires a root layout at src/app/layout.tsx. Everything
 * rendered by any page (home, blog, gallery) is injected as `children` inside
 * the <body> tag below.
 *
 * This file is responsible for three global concerns:
 *   1. Loading fonts (next/font → CSS variables used by Tailwind)
 *   2. Injecting theme colors as CSS variables (from theme.config.ts)
 *   3. Setting site-wide SEO metadata (title, description, OpenGraph)
 *
 * You rarely edit the JSX structure here — fonts and theme are the main knobs.
 */

import type { Metadata } from "next";
import "./globals.css";

// --- FONTS ------------------------------------------------------------------
// Fonts are loaded here with next/font (zero layout shift, self-hosted).
//
// HOW TO CHANGE A FONT:
//   1. Pick any font from https://fonts.google.com
//   2. Change the import name below (e.g. swap `Sora` for `Space_Grotesk`).
//   3. Update the call + `variable` stays the same so nothing else breaks.
//   4. (optional) update the names in theme.config.ts so your notes match.
//
// The `variable` of each font becomes a CSS variable (--font-sans, etc.) that
// Tailwind's font-sans / font-display / font-mono classes read (tailwind.config.ts).
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { site } from "@/config/site.config";
import { theme, themeToCssVariables } from "@/config/theme.config";

// Body font — used for paragraphs, nav links, most UI text.
const fontSans = Inter({
  subsets: ["latin"], // only load Latin glyphs (smaller download)
  variable: "--font-sans", // exposed as CSS var on <html>
  display: "swap", // show fallback text immediately, swap when font loads
});
// Display font — hero headline, section titles, project names.
const fontDisplay = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
// Monospace — eyebrows, dates, tags, code snippets.
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// --- SEO / browser tab ------------------------------------------------------
// `metadata` is a Next.js convention — these values populate <title>, <meta>,
// and OpenGraph tags without you writing raw HTML. Values come from site.config.
export const metadata: Metadata = {
  metadataBase: new URL(site.url), // base URL for relative OG image paths
  title: {
    default: `${site.name} — ${site.role}`, // home page tab title
    template: `%s · ${site.name}`, // other pages: "Blog · Noah Finkelstein"
  },
  description: site.description,
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // the page component (page.tsx, blog/page.tsx, etc.)
}) {
  return (
    <html
      lang="en"
      // Attach all three font CSS variables to <html> so every descendant can use them.
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <head>
        {/* themeToCssVariables() returns a string like ":root{ --color-bg: ... }".
            dangerouslySetInnerHTML is the standard way to inject raw CSS in React.
            This is what makes editing theme.config.ts instantly re-skin the site. */}
        <style
          dangerouslySetInnerHTML={{ __html: themeToCssVariables(theme) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
