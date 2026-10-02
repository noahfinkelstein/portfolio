/* ---------------------------------------------------------------------------
   Wraps every page: fonts, the no-flash theme script, the site chrome
   (the running head and the colophon footer) and the metadata search
   engines read. The page is paper (the default theme) until the head script
   says otherwise.

   FONTS (SIL Open Font License, self-hosted at build time by next/font)
     --font-serif  STIX Two Text — the typeface of mathematics journals.
                   Display, body and UI, in one family (regular, medium,
                   italic).
     --font-mono   JetBrains Mono — dates, years, data and code, where
                   figures should align.
   --------------------------------------------------------------------------- */

import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, STIX_Two_Text } from "next/font/google";
import { defaultTheme, getSocialLinks, site } from "@/content/site";
import { home } from "@/content/home";
import { getPostSlugs } from "@/lib/blog";
import { themeInitScript } from "@/lib/theme-script";
import { ThemeProvider } from "@/lib/theme";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "./globals.css";

const serif = STIX_Two_Text({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
  fallback: ["Menlo", "monospace"],
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
  colorScheme: "light dark",
};

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
  jobTitle: home.currently.join(", "),
  affiliation: { "@type": "CollegeOrUniversity", name: "Brown University", url: "https://www.brown.edu" },
  homeLocation: { "@type": "Place", name: site.location },
  sameAs: getSocialLinks().map((l) => l.href),
}).replace(/</g, "\\u003c");

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // "Writing" only shows in the running head once there is something to read.
  const hasWriting = getPostSlugs().length > 0;

  return (
    <html
      lang="en"
      data-theme={defaultTheme}
      // Tells Next to turn smooth scrolling off during route changes.
      data-scroll-behavior="smooth"
      className={`${serif.variable} ${mono.variable}`}
      // The head script rewrites data-theme before React hydrates.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd }} />
      </head>
      <body>
        <ThemeProvider>
          <a className="skip-link" href="#main">
            Skip to content
          </a>
          <Navbar hasWriting={hasWriting} />
          <main id="main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
