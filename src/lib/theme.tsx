"use client";

/* ---------------------------------------------------------------------------
   THEME — the runtime side of the theme system.

   Two themes, paper and night (src/content/site.ts). Colours are CSS custom
   properties in src/app/globals.css: paper on :root, night on
   `html[data-theme="night"]`. This file switches between them and lets
   canvas code (three.js) read the resolved values.

   API (plain functions; the theme toggle and the hero canvas use them):
     readThemeTokens()                    → ThemeTokens for the current theme
     toggleTheme()                        → paper ⇄ night, saved
     setTheme(id, { persist? })           → a specific theme
     getCurrentTheme(), getThemeMeta(id)  → the theme on <html>, its entry
     const off = onThemeChange(({ theme, tokens }) => { ... });   off() to stop
       (it is a window CustomEvent "themechange"; detail = ThemeChangeDetail)
   ThemeProvider (mounted once in the root layout) keeps tabs in sync.

   Until a visitor picks a theme, ThemeProvider follows the system's
   prefers-color-scheme as it changes; a pick is saved and wins from then on.

   Tokens read here must be authored as plain hex or a number in globals.css —
   getComputedStyle returns a custom property's text, so color-mix() would
   come back unresolved.
   --------------------------------------------------------------------------- */

import { useEffect } from "react";
import { darkTheme, defaultTheme, isThemeId, themes, type ThemeId, type ThemeMeta } from "@/content/site";
import { THEME_STORAGE_KEY } from "@/lib/theme-script";

export { THEME_STORAGE_KEY };
export const THEME_EVENT = "themechange";

export type ThemeTokens = {
  theme: ThemeId;
  isDark: boolean;
  bg: string;
  bg2: string;
  bg3: string;
  fg: string;
  fgMuted: string;
  accent: string;
  /** Accent that passes 4.5:1 as text on --bg and --bg-2. */
  accentText: string;
  border: string;
  /** The hero knot's ink. */
  sceneWire: string;
};

export type ThemeChangeDetail = { theme: ThemeId; tokens: ThemeTokens };

declare global {
  interface WindowEventMap {
    themechange: CustomEvent<ThemeChangeDetail>;
  }
}

/* --- Reading ---------------------------------------------------------------- */

/** The theme on <html> right now (the default on the server). */
export function getCurrentTheme(): ThemeId {
  if (typeof document === "undefined") return defaultTheme;
  const attr = document.documentElement.getAttribute("data-theme");
  return isThemeId(attr) ? attr : defaultTheme;
}

export function getThemeMeta(id: ThemeId): ThemeMeta {
  return themes.find((t) => t.id === id) ?? themes[0];
}

/** Resolved token values for the current theme. Client only. */
export function readThemeTokens(): ThemeTokens {
  const theme = getCurrentTheme();
  const style = getComputedStyle(document.documentElement);
  const v = (name: string) => style.getPropertyValue(name).trim();
  return {
    theme,
    isDark: getThemeMeta(theme).dark,
    bg: v("--bg"),
    bg2: v("--bg-2"),
    bg3: v("--bg-3"),
    fg: v("--fg"),
    fgMuted: v("--fg-muted"),
    accent: v("--accent"),
    accentText: v("--accent-text"),
    border: v("--border"),
    sceneWire: v("--scene-wire"),
  };
}

/** Subscribe to theme changes outside React. Returns an unsubscribe function. */
export function onThemeChange(callback: (detail: ThemeChangeDetail) => void): () => void {
  const handler = (event: CustomEvent<ThemeChangeDetail>) => callback(event.detail);
  window.addEventListener(THEME_EVENT, handler);
  return () => window.removeEventListener(THEME_EVENT, handler);
}

/* --- Writing ---------------------------------------------------------------- */

let switchTimer: number | undefined;

/**
 * Apply a theme: sets html[data-theme], saves it, and dispatches "themechange".
 * `persist: false` skips localStorage (used when syncing from another tab).
 */
export function setTheme(id: ThemeId, options: { persist?: boolean } = {}): void {
  const root = document.documentElement;
  if (root.getAttribute("data-theme") === id) return;

  // A short color crossfade (globals.css), skipped for reduced motion.
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.setAttribute("data-theme-switching", "");
    window.clearTimeout(switchTimer);
    switchTimer = window.setTimeout(() => root.removeAttribute("data-theme-switching"), 450);
  }

  root.setAttribute("data-theme", id);
  if (options.persist !== false) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {
      /* private mode: the choice lasts for this page view only */
    }
  }
  const detail: ThemeChangeDetail = { theme: id, tokens: readThemeTokens() };
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail }));
}

/** Switch paper ⇄ night (whichever is not showing) and save the choice. */
export function toggleTheme(): void {
  setTheme(getThemeMeta(getCurrentTheme()).dark ? defaultTheme : darkTheme);
}

/* --- React ------------------------------------------------------------------ */

function hasSavedTheme(): boolean {
  try {
    return isThemeId(localStorage.getItem(THEME_STORAGE_KEY));
  } catch {
    return false;
  }
}

/**
 * Mounted once in the root layout. Keeps tabs in sync (switching the theme in
 * one tab switches it in the others) and, until the visitor has picked a
 * theme, follows the system's light/dark setting when it changes.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isThemeId(event.newValue)) {
        setTheme(event.newValue, { persist: false });
      }
    };
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const onScheme = () => {
      if (!hasSavedTheme()) setTheme(mql.matches ? darkTheme : defaultTheme, { persist: false });
    };
    window.addEventListener("storage", onStorage);
    mql.addEventListener("change", onScheme);
    return () => {
      window.removeEventListener("storage", onStorage);
      mql.removeEventListener("change", onScheme);
    };
  }, []);

  return <>{children}</>;
}
