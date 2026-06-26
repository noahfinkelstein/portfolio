import type { Config } from "tailwindcss";

/**
 * Tailwind configuration.
 *
 * You generally DON'T edit colors here — colors live in
 * `src/config/theme.config.ts` and are injected as CSS variables (see
 * src/app/layout.tsx). This file just maps friendly Tailwind class names
 * (e.g. `bg-bg`, `text-accent`) onto those CSS variables.
 *
 * Result: in your components you write `className="bg-bg text-accent"`, and
 * changing the actual hex value happens in ONE place (theme.config.ts).
 */
const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Each reads a CSS variable (channels) from theme.config.ts. The
        // `<alpha-value>` placeholder lets you use opacity helpers like
        // `bg-bg/70`, `text-accent/40`, `border-border/60`.
        bg: "rgb(var(--color-bg) / <alpha-value>)", // page background
        "bg-soft": "rgb(var(--color-bg-soft) / <alpha-value>)", // cards / raised surfaces
        "bg-softer": "rgb(var(--color-bg-softer) / <alpha-value>)", // hover / chips
        fg: "rgb(var(--color-fg) / <alpha-value>)", // primary text
        "fg-muted": "rgb(var(--color-fg-muted) / <alpha-value>)", // secondary text
        accent: "rgb(var(--color-accent) / <alpha-value>)", // the one signature color
        border: "rgb(var(--color-border) / <alpha-value>)", // hairline borders
      },
      fontFamily: {
        // These map to fonts loaded with next/font in src/app/layout.tsx.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        // The site's content column width. Change once to reflow everything.
        content: "var(--content-width)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease forwards",
      },
    },
  },
  plugins: [
    // Adds nice default typography for blog/MDX content (the `prose` classes).
    require("@tailwindcss/typography"),
  ],
};

export default config;
