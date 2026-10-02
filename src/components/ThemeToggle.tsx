"use client";

/* ---------------------------------------------------------------------------
   Theme toggle: one text button at the end of the running head. It reads
   "Dark" on paper and "Light" on night, and switches to the theme it names.
   The words are the themes' labels in src/content/site.ts.

   Both words are in the server HTML and CSS shows the one that fits the
   current html[data-theme], so the label is right before React hydrates
   (no flicker for a visitor on night). The hidden word is display: none, so
   the accessible name is just the visible one: "Switch to dark theme" or
   "Switch to light theme". Hidden entirely when scripts do not run
   (html[data-js] is set by the inline head script), since it could not work.

   Props: className  extra class on the button.
   --------------------------------------------------------------------------- */

import { darkTheme, defaultTheme } from "@/content/site";
import { getThemeMeta, toggleTheme } from "@/lib/theme";
import styles from "./ThemeToggle.module.css";

export type ThemeToggleProps = {
  className?: string;
};

const toDark = getThemeMeta(darkTheme).label;
const toLight = getThemeMeta(defaultTheme).label;

export default function ThemeToggle({ className }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className={[styles.toggle, className].filter(Boolean).join(" ")}
      onClick={toggleTheme}
    >
      <span className={styles.toDark}>
        <span className="sr-only">Switch to </span>
        {toDark}
        <span className="sr-only"> theme</span>
      </span>
      <span className={styles.toLight}>
        <span className="sr-only">Switch to </span>
        {toLight}
        <span className="sr-only"> theme</span>
      </span>
    </button>
  );
}
