/* ---------------------------------------------------------------------------
   SITE — who you are, where you link, what's in the nav, and the themes.

   This is the first file to open. Everything here shows up on every page.
   Colours themselves live in src/app/globals.css (one block per theme); the
   list below only names the themes and gives the switcher its swatches.
   --------------------------------------------------------------------------- */

/* --- Themes ---------------------------------------------------------------- */

export type ThemeId = "night" | "cyan" | "terminal" | "paper";

export type ThemeMeta = {
  id: ThemeId;
  label: string;
  /** Two colours for the switcher's swatch. Keep in sync with globals.css. */
  swatch: { bg: string; accent: string };
  dark: boolean;
};

/**
 * The themes in the switcher, in order. To add one: add a block here, add an
 * `html[data-theme="<id>"]` block with every token in src/app/globals.css,
 * and add the id to the ThemeId type above.
 */
export const themes: readonly ThemeMeta[] = [
  { id: "night", label: "Night", swatch: { bg: "#0a0f1e", accent: "#e2b23f" }, dark: true },
  { id: "cyan", label: "Cyan", swatch: { bg: "#06141a", accent: "#3fc8c1" }, dark: true },
  { id: "terminal", label: "Terminal", swatch: { bg: "#0a0f0a", accent: "#35c466" }, dark: true },
  { id: "paper", label: "Paper", swatch: { bg: "#fbfaf7", accent: "#7a2233" }, dark: false },
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
   * the PDF at public/resume.pdf and set `enabled: true`; a "Résumé" link then
   * appears in the nav before Contact.
   */
  resume: { enabled: false, label: "Résumé", href: "/resume.pdf" },

  /**
   * Top navigation, in order. `href` is a route, a route plus #anchor, or a
   * mailto: link. The wordmark links home; "Writing" is dropped automatically
   * while there are no posts; Contact is added from `email` (see getNav).
   */
  nav: [
    { label: "About", href: "/#about" },
    { label: "Projects", href: "/projects" },
    { label: "Writing", href: "/blog" },
    { label: "Experience", href: "/experience" },
  ] as readonly NavItem[],

  /**
   * Profiles: the hero, the footer and the contact block.
   * Set href to "" to hide one without deleting it.
   */
  links: [
    { label: "GitHub", href: "https://github.com/noahfinkelstein", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/noah-finkelstein", icon: "linkedin" },
  ] as readonly SocialLink[],

  themes,
  defaultTheme,
} as const;

/**
 * The nav as rendered: the items above (minus Writing when there is nothing
 * to read), then Résumé (if on), then Contact.
 */
export function getNav(options: { hasWriting?: boolean } = {}): NavItem[] {
  const items: NavItem[] = site.nav.filter((item) => item.href !== "/blog" || options.hasWriting !== false);
  if (site.resume.enabled) items.push({ label: site.resume.label, href: site.resume.href });
  items.push({ label: "Contact", href: `mailto:${site.email}` });
  return items;
}

/** Profiles that are switched on. */
export function getSocialLinks(): SocialLink[] {
  return site.links.filter((l) => l.href);
}
