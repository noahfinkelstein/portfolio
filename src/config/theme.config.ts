/**
 * ============================================================================
 *  THEME  —  the #1 file to edit to change how the site LOOKS.
 * ============================================================================
 *
 * Controls: colors (hex), content width, font name notes.
 * Change a value here → save → entire site updates.
 *
 * COLOR PIPELINE (end-to-end):
 *   1. You edit hex strings below (e.g. accent: "#7c5cff")
 *   2. themeToCssVariables() converts each to "r g b" channels
 *   3. layout.tsx injects :root { --color-accent: 124 92 255; ... }
 *   4. tailwind.config.ts maps bg-bg → rgb(var(--color-bg) / <alpha-value>)
 *   5. Components use classes like bg-bg, text-accent, border-border
 *
 * Opacity modifiers (bg-bg/70, text-accent/40) work because channels omit "rgb()".
 */

export const theme = {
  /**
   * COLORS — plain hex. `accent` is your signature color (links, buttons,
   * hero backgrounds, highlights). Change accent first when re-skinning.
   */
  colors: {
    bg: "#0a0a0f", // page background (near-black)
    bgSoft: "#13131c", // cards, panels (.card class)
    bgSofter: "#1c1c2a", // chips, hover states, tag backgrounds
    fg: "#f5f5fa", // primary body text (near-white)
    fgMuted: "#9a9ab0", // secondary text, captions, nav links
    accent: "#7c5cff", // ★ signature violet — try #22d3ee (cyan) or #a3e635 (lime)
    border: "#26263a", // hairline borders between sections/cards
  },

  /**
   * FONTS — human-readable notes only. Actual font loading happens in
   * layout.tsx via next/font. To swap fonts, edit layout.tsx imports.
   */
  fonts: {
    sans: "Inter", // body text, UI
    display: "Sora", // hero headline, section titles
    mono: "JetBrains Mono", // eyebrows, dates, tags, code
  },

  /**
   * LAYOUT — max width of .container-col (Nav, sections, Footer, blog pages).
   * Flows: here → --content-width CSS var → max-w-content in Tailwind.
   */
  contentWidth: "1400px",
} as const;

/**
 * Converts hex color to space-separated RGB channels for CSS variables.
 * Supports #rgb shorthand and #rrggbb full form.
 * Example: "#7c5cff" → "124 92 255"
 */
function hexToChannels(hex: string): string {
  const h = hex.replace("#", "").trim();
  const full =
    h.length === 3
      ? h.split("").map((c) => c + c).join("") // #abc → aabbcc
      : h.padEnd(6, "0").slice(0, 6);
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `${r} ${g} ${b}`;
}

/**
 * Builds the :root CSS block injected in layout.tsx <head>.
 * Called once at render — you don't use this directly in components.
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
 *  COLOR PRESETS — copy a block over `colors` above to re-skin quickly.
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
