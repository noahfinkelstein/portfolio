/* ---------------------------------------------------------------------------
   SITE — who you are, where you link, what's in the nav, and the six colors.

   This is the first file to open. Everything here shows up on every page.
   --------------------------------------------------------------------------- */

export const site = {
  name: "Noah Finkelstein",

  /** Browser tab + Google result + link previews. Keep it factual. */
  description:
    "Noah Finkelstein — Brown University undergraduate in mathematics–computer " +
    "science and physics. Machine learning research, biostatistics, and " +
    "CourseTrees.",

  /** Your real domain. Used for canonical URLs and link previews. */
  url: "https://noahfinkelstein.com",

  email: "noah_finkelstein@brown.edu",

  /* Where you are, shown in the contact block on the home page. */
  location: "Providence, Rhode Island",

  /**
   * Top navigation, in order. Delete a line to remove the page from the nav.
   * `href` must match a folder under src/app/.
   */
  nav: [
    { label: "Home", href: "/" },
    { label: "Experience", href: "/experience" },
    { label: "Projects", href: "/projects" },
    { label: "Photos", href: "/photos" },
    { label: "Blog", href: "/blog" },
  ],

  /**
   * Links in the contact block and the footer.
   * Set href to "" to hide one without deleting it.
   */
  links: [
    { label: "GitHub", href: "https://github.com/noahfinkelstein" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/noah-finkelstein" },
    { label: "CV", href: "/resume.pdf" },
  ],
} as const;

/* ---------------------------------------------------------------------------
   THEME — every color and measurement on the site.

   These become CSS variables in layout.tsx, so changing a value here changes
   it everywhere. Three things do not follow along if you change `accent`:
   `accentDark` below (pick a shade darker by hand), the favicon
   src/app/icon.svg, and the link-preview card scripts/og-card.html, which
   both have the accent baked in as a literal.
   --------------------------------------------------------------------------- */

export const theme = {
  /** Page background. */
  paper: "#ffffff",

  /** Body text. Near-black; pure #000 is harsh on a white page. */
  ink: "#16161a",

  /** Dates, captions, and anything secondary. */
  muted: "#6e6e76",

  /** The one hairline rule, under the site header. */
  rule: "#e4e2dd",

  /**
   * Links and the current-page marker. The only color on the site, so it
   * carries some weight — this oxblood nods at Brown without shouting.
   * Try "#2a4b8d" (ink blue) or "#1f5c4c" (deep green) instead.
   */
  accent: "#7a2233",

  /** Accent on hover — a shade darker. */
  accentDark: "#5a161f",

  /** Reading column. ~60 characters at 18px, which is the comfortable range. */
  measure: "44rem",

  /** Width of the date column running down the left of every list. */
  gutter: "7.5rem",
} as const;

export function themeVars(t: typeof theme): string {
  return `:root{
  --paper:${t.paper};
  --ink:${t.ink};
  --muted:${t.muted};
  --rule:${t.rule};
  --accent:${t.accent};
  --accent-dark:${t.accentDark};
  --measure:${t.measure};
  --gutter:${t.gutter};
}`;
}
