import type { Config } from "tailwindcss";

/**
 * ============================================================================
 *  TAILWIND CONFIG  —  maps design tokens to CSS variables.
 * ============================================================================
 *
 * Tailwind scans the `content` paths below and only generates CSS for classes
 * you actually use in components (tree-shaking unused utilities).
 *
 * You generally DON'T edit colors here — colors live in theme.config.ts and
 * are injected as CSS variables in layout.tsx. This file maps friendly class
 * names (bg-bg, text-accent) onto those variables.
 *
 * FLOW: theme.config.ts → layout.tsx <style> → :root vars → this file → components
 */
const config: Config = {
  // Files Tailwind scans for class names (add paths if you create new folders)
  content: [
    "./src/app/**/*.{ts,tsx,mdx}",
    "./src/components/**/*.{ts,tsx}",
    "./content/**/*.{md,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Each token reads space-separated RGB channels from a CSS variable.
        // The <alpha-value> placeholder enables opacity modifiers like bg-bg/70.
        bg: "rgb(var(--color-bg) / <alpha-value>)", // page background
        "bg-soft": "rgb(var(--color-bg-soft) / <alpha-value>)", // cards
        "bg-softer": "rgb(var(--color-bg-softer) / <alpha-value>)", // chips, hovers
        fg: "rgb(var(--color-fg) / <alpha-value>)", // primary text
        "fg-muted": "rgb(var(--color-fg-muted) / <alpha-value>)", // secondary text
        accent: "rgb(var(--color-accent) / <alpha-value>)", // signature violet
        border: "rgb(var(--color-border) / <alpha-value>)", // hairline borders
      },
      fontFamily: {
        // These reference CSS variables set by next/font in layout.tsx.
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      maxWidth: {
        // max-w-content → var(--content-width) from theme.config.ts contentWidth
        content: "var(--content-width)",
      },
      keyframes: {
        // Used by animate-fade-up (optional utility; Framer Motion is used more often)
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
    // @tailwindcss/typography adds `prose` classes for blog MDX content styling
    require("@tailwindcss/typography"),
  ],
};

export default config;
