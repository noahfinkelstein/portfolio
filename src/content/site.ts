/* ---------------------------------------------------------------------------
   SITE — who you are, where you link, what's in the nav, and the themes.

   This is the first file to open. Everything here shows up on every page.
   Colors themselves live in src/app/globals.css (one block per theme); the
   list below only names the themes and gives the switcher its swatches.
   --------------------------------------------------------------------------- */

/* --- Themes ---------------------------------------------------------------- */

export type ThemeId = "night" | "cyan" | "terminal" | "paper";

export type ThemeMeta = {
  id: ThemeId;
  label: string;
  /** Two colors for the switcher's swatch. Keep in sync with globals.css. */
  swatch: { bg: string; accent: string };
  dark: boolean;
};

/**
 * The themes in the switcher, in order. To add one: add a block here, add an
 * `html[data-theme="<id>"]` block with every token in src/app/globals.css,
 * and add the id to the ThemeId type above.
 */
export const themes: readonly ThemeMeta[] = [
  { id: "night", label: "Night", swatch: { bg: "#0a0a0f", accent: "#7c5cff" }, dark: true },
  { id: "cyan", label: "Cyan", swatch: { bg: "#070b12", accent: "#22d3ee" }, dark: true },
  { id: "terminal", label: "Terminal", swatch: { bg: "#0b0f0b", accent: "#22c55e" }, dark: true },
  { id: "paper", label: "Paper", swatch: { bg: "#fbfbf9", accent: "#2563eb" }, dark: false },
];

export const defaultTheme: ThemeId = "night";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && themes.some((t) => t.id === value);
}

/* --- Site ------------------------------------------------------------------ */

export type NavItem = { label: string; href: string };
export type SocialLink = { label: string; href: string; /** simple-icons slug or a custom icon in src/lib/icons.ts */ icon: string };

export const site = {
  name: "Noah Finkelstein",

  /** The logo in the nav (set in the display face). */
  initials: "NF",

  /** Browser tab + Google result + link previews. Keep it factual. */
  description:
    "Noah Finkelstein — Brown University undergraduate in mathematics–computer " +
    "science and physics. Machine learning research, biostatistics, and " +
    "CourseTrees.",

  /** Your real domain. Used for canonical URLs and link previews. */
  url: "https://noahfinkelstein.com",

  email: "noah_finkelstein@brown.edu",

  location: "Providence, Rhode Island",

  /**
   * Résumé link. Off: no résumé is published right now. To turn it on, put
   * the PDF at public/resume.pdf and set `enabled: true`; a "Resume" link then
   * appears in the nav before Contact.
   */
  resume: { enabled: false, label: "Resume", href: "/resume.pdf" },

  /**
   * Top navigation, in order. `href` is a route, a route plus #anchor, or a
   * mailto: link. Contact is added from `email` automatically (see getNav).
   */
  nav: [
    { label: "Home", href: "/" },
    { label: "About", href: "/#about" },
    { label: "Projects", href: "/projects" },
    { label: "Writing", href: "/blog" },
  ] as readonly NavItem[],

  /**
   * Social links: the left bar, the footer on phones, and the contact block.
   * Set href to "" to hide one without deleting it.
   */
  links: [
    { label: "GitHub", href: "https://github.com/noahfinkelstein", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/noah-finkelstein", icon: "linkedin" },
  ] as readonly SocialLink[],


  themes,
  defaultTheme,
} as const;

/** The nav as rendered: the items above, then Resume (if on), then Contact. */
export function getNav(): NavItem[] {
  const items: NavItem[] = [...site.nav];
  if (site.resume.enabled) items.push({ label: site.resume.label, href: site.resume.href });
  items.push({ label: "Contact", href: `mailto:${site.email}` });
  return items;
}

/** Social links that are switched on. */
export function getSocialLinks(): SocialLink[] {
  return site.links.filter((l) => l.href);
}
