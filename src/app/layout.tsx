/* ---------------------------------------------------------------------------
   Wraps every page: fonts, the no-flash theme script, the site chrome
   (navbar, left bar, footer) and the metadata search engines read.

   FONTS (all SIL Open Font License)
     --font-display  BBH Sans Hegarty — hero name, loader, logo. Self-hosted
                     from ./fonts because next/font/google does not list it.
     --font-sans     Montserrat (variable 100–900) — UI text, and the heavy
                     caps face: globals.css sets --font-caps to it at 900.
     --font-serif    Fenix — body copy and subtitles.
     --font-mono     JetBrains Mono — dates and tags where figures align.
     --font-caps-outline  Montserrat Black with its overlapping contours
                     merged (scripts/outline-font.py), for the outline
                     (-webkit-text-stroke) titles only: stroking the stock
                     font draws the seams inside A, E, H, R… Not preloaded;
                     only pages that show outline text download it.
   --------------------------------------------------------------------------- */

import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Fenix, JetBrains_Mono, Montserrat } from "next/font/google";
import { defaultTheme, getSocialLinks, site } from "@/content/site";
import { home } from "@/content/home";
import { themeInitScript } from "@/lib/theme-script";
import { ThemeProvider } from "@/lib/theme";
import Navbar from "@/components/layout/Navbar";
import LeftBar from "@/components/layout/LeftBar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const display = localFont({
  src: "./fonts/BBHSansHegarty-Regular.woff2",
  weight: "400",
  style: "normal",
  variable: "--font-display",
  display: "swap",
  fallback: ["Arial Black", "Arial", "sans-serif"],
});

const capsOutline = localFont({
  src: "./fonts/MontserratBlack-Outline.woff2",
  weight: "900",
  style: "normal",
  variable: "--font-caps-outline",
  display: "swap",
  preload: false,
  fallback: ["Arial Black", "Arial", "sans-serif"],
});

const sans = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Fenix({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
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
  // Only the shared parts, so each page's own title/description reach its OG
  // tags. og:image comes from src/app/opengraph-image.png automatically.
  openGraph: {
    siteName: site.name,
    type: "website",
  },
};

export const viewport: Viewport = {
  colorScheme: "dark light",
};

/* Without JavaScript the intro loader could never fade, so never show it. */
const noScriptStyles = "<style>[data-loader-overlay]{display:none!important}</style>";

/*
  Structured data (schema.org Person) so search engines can tie the name,
  the domain and the profiles together. Built from site.ts and home.ts, so
  it never goes stale on its own. Serialised with "<" escaped: it is placed
  inside a <script>, where a literal "</script>" in the data would end it.
*/
const personJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  image: `${site.url}/opengraph-image.png`,
  jobTitle: home.hero.roles.map((r) => r.title).join(", "),
  affiliation: { "@type": "CollegeOrUniversity", name: "Brown University", url: "https://www.brown.edu" },
  homeLocation: { "@type": "Place", name: site.location },
  sameAs: getSocialLinks().map((l) => l.href),
}).replace(/</g, "\\u003c");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-theme={defaultTheme}
      // Tells Next to turn smooth scrolling off during route changes.
      data-scroll-behavior="smooth"
      className={`${display.variable} ${capsOutline.variable} ${sans.variable} ${serif.variable} ${mono.variable}`}
      // The head script rewrites data-theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <noscript dangerouslySetInnerHTML={{ __html: noScriptStyles }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd }} />
      </head>
      <body>
        <ThemeProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Navbar />
          <LeftBar />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
