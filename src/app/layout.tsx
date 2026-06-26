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
// The `variable` of each font becomes a CSS variable that Tailwind's
// font-sans / font-display / font-mono classes use (see tailwind.config.ts).
import { Inter, Sora, JetBrains_Mono } from "next/font/google";
import { site } from "@/config/site.config";
import { theme, themeToCssVariables } from "@/config/theme.config";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const fontDisplay = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// --- SEO / browser tab ------------------------------------------------------
export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s · ${site.name}`,
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
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${fontSans.variable} ${fontDisplay.variable} ${fontMono.variable}`}
    >
      <head>
        {/* Inject the color theme as CSS variables. This is what makes
            editing theme.config.ts instantly re-skin the whole site. */}
        <style
          dangerouslySetInnerHTML={{ __html: themeToCssVariables(theme) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
