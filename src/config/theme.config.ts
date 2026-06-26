/**
 * ============================================================================
 *  THEME  —  the #1 file to edit to change how the site LOOKS.
 * ============================================================================
 *
 * Everything visual that isn't layout lives here: colors, the accent color,
 * the content width, and notes on which fonts are used. Change a value, save,
 * and the whole site updates.
 *
 * ►► You edit plain HEX colors below (like "#7c5cff"). ◄◄
 *
 * HOW IT WORKS (you don't need to understand this to use it):
 *  - Each hex color is converted to "r g b" channels and injected as a CSS
 *    variable (--color-bg, etc.) in src/app/layout.tsx.
 *  - Tailwind reads them as rgb(var(--color-bg) / <alpha>) so opacity helpers
 *    like `bg-bg/70` or `text-accent/40` work everywhere.
 */

export const theme = {
  /**
   * COLORS — all plain hex strings. Pick any colors you like.
   * The only "special" one is `accent`: your signature color, used for links,
   * highlights, buttons, and the particle network. Change it first.
   */
  colors: {
    bg: "#0a0a0f", //  page background (near-black)
    bgSoft: "#13131c", //  cards, panels
    bgSofter: "#1c1c2a", //  hover backgrounds
    fg: "#f5f5fa", //  main text (near-white)
    fgMuted: "#9a9ab0", //  secondary text
    accent: "#7c5cff", //  ★ signature color (violet). Try #22d3ee (cyan) or #a3e635 (lime)
    border: "#26263a", //  hairline borders
  },

  /**
   * FONTS — the actual font files are loaded in src/app/layout.tsx using
   * next/font (Google Fonts). To change a font:
   *   1. Open src/app/layout.tsx
   *   2. Follow the clearly-commented instructions there (swap the import).
   * This block is just a human-readable note of what's currently in use.
   */
  fonts: {
    sans: "Inter", //  body text
    display: "Sora", //  big headings / hero
    mono: "JetBrains Mono", //  code, labels, terminal bits
  },

  /**
   * LAYOUT
   */
  contentWidth: "1100px", // max width of the centered content column
} as const;

/** Convert "#7c5cff" (or "#abc") into "124 92 255" (space-separated channels). */
function hexToChannels(hex: string): string {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h.split("").map((c) => c + c).join("")
      : h.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Turns the theme above into a CSS variables string (injected in layout.tsx).
 * Colors are emitted as channels so Tailwind's `/opacity` helpers work.
 * You usually never call this yourself.
 */
export function themeToCssVariables(t: typeof theme): string {
  const c = t.colors;
  return `:root{
    --color-bg:${hexToChannels(c.bg)};
    --color-bg-soft:${hexToChannels(c.bgSoft)};
    --color-bg-softer:${hexToChannels(c.bgSofter)};
    --color-fg:${hexToChannels(c.fg)};
    --color-fg-muted:${hexToChannels(c.fgMuted)};
    --color-accent:${hexToChannels(c.accent)};
    --color-border:${hexToChannels(c.border)};
    --content-width:${t.contentWidth};
  }`;
}

/* ===========================================================================
 *  PRESETS — copy one of these over the `colors` block above to re-skin fast.
 * ===========================================================================
 *
 * // Light & minimal:
 * bg:"#fbfbf9", bgSoft:"#ffffff", bgSofter:"#f0f0ec", fg:"#16161a",
 * fgMuted:"#5b5b66", accent:"#2563eb", border:"#e5e5df"
 *
 * // Terminal / hacker:
 * bg:"#0b0f0b", bgSoft:"#0f140f", bgSofter:"#16201a", fg:"#d6ffd9",
 * fgMuted:"#6f9a72", accent:"#22c55e", border:"#1c2a1f"
 *
 * // Cyan tech:
 * bg:"#070b12", bgSoft:"#0d1420", bgSofter:"#16202e", fg:"#eaf4ff",
 * fgMuted:"#8aa0b8", accent:"#22d3ee", border:"#1b2738"
 */
