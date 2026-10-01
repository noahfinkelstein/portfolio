"use client";

/* ---------------------------------------------------------------------------
   Theme switcher: four swatches in a radio group (Night, Cyan, Terminal,
   Paper). Native radio inputs, so Tab reaches the group and the arrow keys
   move between themes, and screen readers announce "Night, radio, 1 of 4".

   Props:
     variant  "compact" (nav bar: swatches only, labels on hover/for SR)
              "full"    (mobile menu: swatches with visible labels)
     className  extra class on the fieldset
   --------------------------------------------------------------------------- */

import { useEffect, useId, useState } from "react";
import { useTheme } from "@/lib/theme";
import styles from "./ThemeSwitcher.module.css";

export type ThemeSwitcherProps = {
  variant?: "compact" | "full";
  className?: string;
};

export default function ThemeSwitcher({ variant = "compact", className }: ThemeSwitcherProps) {
  const { theme, setTheme, themes } = useTheme();
  const name = useId();
  // The server cannot know the saved theme, so its HTML checks the default.
  // Show the "selected" ring only once hydrated, so a visitor on Paper never
  // sees Night marked as selected while the page loads.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <fieldset
      className={[styles.group, styles[variant], className].filter(Boolean).join(" ")}
      data-ready={ready || undefined}
    >
      <legend className="sr-only">Color theme</legend>
      {themes.map((t) => (
        <label key={t.id} className={styles.option} title={t.label}>
          <input
            type="radio"
            name={name}
            value={t.id}
            checked={theme === t.id}
            onChange={() => setTheme(t.id)}
            className={styles.input}
          />
          <span
            className={styles.swatch}
            aria-hidden="true"
            style={
              {
                "--swatch-bg": t.swatch.bg,
                "--swatch-accent": t.swatch.accent,
              } as React.CSSProperties
            }
          />
          <span className={variant === "full" ? styles.label : "sr-only"}>{t.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
