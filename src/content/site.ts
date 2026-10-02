/* ---------------------------------------------------------------------------
   SITE — who you are, where you link, what's in the running head, and the
   themes.

   This is the first file to open. Everything here shows up on every page.
   Colours themselves live in src/app/globals.css (one block per theme); the
   list below only names the themes.
   --------------------------------------------------------------------------- */

/* --- Themes ---------------------------------------------------------------- */

export type ThemeId = "paper" | "night";

export type ThemeMeta = {
  id: ThemeId;
  /** The word on the running head's button when it offers this theme. */
  label: string;
  dark: boolean;
};

/**
 * The two themes. Paper is the default (and what the page shows without
 * JavaScript); a first-time visitor whose system asks for dark gets night.
 * The running head's button switches between them. Each id needs a matching
 * block in src/app/globals.css.
 */
export const themes: readonly ThemeMeta[] = [
  { id: "paper", label: "Light", dark: false },
  { id: "night", label: "Dark", dark: true },
];

export const defaultTheme: ThemeId = "paper";

/** Used on a first visit when the system prefers a dark colour scheme. */
export const darkTheme: ThemeId = "night";

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === "string" && themes.some((t) => t.id === value);
}

/* --- Site ------------------------------------------------------------------ */

export type NavItem = {
  label: string;
  /** A route or a route plus #anchor. */
  href: string;
  /** Path prefix that marks this item as the current page (defaults to href). */
  activePath?: string;
};

export type SocialLink = { label: string; href: string };

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
   * The running head's links, in order, after the wordmark (which links
   * home). "Writing" is dropped automatically while there are no posts (see
   * getNav). The email lives in the hero and the footer, not here.
   */
  nav: [
    { label: "Work", href: "/#work", activePath: "/projects" },
    { label: "Writing", href: "/blog" },
    { label: "CV", href: "/cv" },
  ] as readonly NavItem[],

  /**
   * Profiles: the hero, the footer and the CV.
   * Set href to "" to hide one without deleting it.
   */
  links: [
    { label: "GitHub", href: "https://github.com/noahfinkelstein" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/noah-finkelstein" },
  ] as readonly SocialLink[],
} as const;

/** The running head's links as rendered: Writing only when there is something to read. */
export function getNav(options: { hasWriting?: boolean } = {}): NavItem[] {
  return site.nav.filter((item) => item.href !== "/blog" || options.hasWriting !== false);
}

/** Profiles that are switched on. */
export function getSocialLinks(): SocialLink[] {
  return site.links.filter((l) => l.href);
}
