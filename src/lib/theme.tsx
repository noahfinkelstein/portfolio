"use client";

/* ---------------------------------------------------------------------------
   THEME — the runtime side of the theme system.

   Colors are CSS custom properties in src/app/globals.css, one block per
   `html[data-theme="<id>"]`. This file switches between them and lets canvas
   code (three.js, matter-js) read the resolved values.

   React:
     const { theme, setTheme, themes, meta, tokens } = useTheme();
       tokens is null during SSR and the first client render, then the
       resolved ThemeTokens; it updates whenever the theme changes.

   Anything else (a render loop, a class):
     readThemeTokens()                    → ThemeTokens for the current theme
     const off = onThemeChange(({ theme, tokens }) => { ... });   off() to stop
       (it is a window CustomEvent "themechange"; detail = ThemeChangeDetail)

   Tokens read here must be authored as plain hex or a number in globals.css —
   getComputedStyle returns a custom property's text, so color-mix() would
   come back unresolved.
   --------------------------------------------------------------------------- */

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { defaultTheme, isThemeId, themes, type ThemeId, type ThemeMeta } from "@/content/site";
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
  link: string;
  accent: string;
  /** Accent that passes 4.5:1 as text on --bg and --bg-2. */
  accentText: string;
  /** Offset-shadow color behind big titles. */
  accent2: string;
  highlight: string;
  border: string;
  /** 3D scene colors (hero torus field). */
  scenePoint: string;
  sceneLine: string;
  sceneRing: string;
  sceneWire: string;
  /** Overall canvas opacity, 0–1. */
  sceneOpacity: number;
  /** Tag pill base colors 1–6 (border; background is 15% of it). */
  tags: string[];
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
  const opacity = parseFloat(v("--scene-opacity"));
  return {
    theme,
    isDark: getThemeMeta(theme).dark,
    bg: v("--bg"),
    bg2: v("--bg-2"),
    bg3: v("--bg-3"),
    fg: v("--fg"),
    fgMuted: v("--fg-muted"),
    link: v("--link"),
    accent: v("--accent"),
    accentText: v("--accent-text"),
    accent2: v("--accent-2"),
    highlight: v("--highlight"),
    border: v("--border"),
    scenePoint: v("--scene-point"),
    sceneLine: v("--scene-line"),
    sceneRing: v("--scene-ring"),
    sceneWire: v("--scene-wire"),
    sceneOpacity: Number.isFinite(opacity) ? opacity : 0.6,
    tags: [1, 2, 3, 4, 5, 6].map((i) => v(`--tag-${i}`)),
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

/* --- React ------------------------------------------------------------------ */

function subscribe(callback: () => void): () => void {
  window.addEventListener(THEME_EVENT, callback);
  return () => window.removeEventListener(THEME_EVENT, callback);
}

export function useTheme(): {
  theme: ThemeId;
  setTheme: (id: ThemeId) => void;
  themes: readonly ThemeMeta[];
  meta: ThemeMeta;
  tokens: ThemeTokens | null;
} {
  const theme = useSyncExternalStore(subscribe, getCurrentTheme, () => defaultTheme);
  const [tokens, setTokens] = useState<ThemeTokens | null>(null);

  useEffect(() => {
    setTokens(readThemeTokens());
  }, [theme]);

  const set = useCallback((id: ThemeId) => setTheme(id), []);
  return { theme, setTheme: set, themes, meta: getThemeMeta(theme), tokens };
}

/**
 * Mounted once in the root layout. Keeps tabs in sync: switching the theme in
 * one tab switches it in the others.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isThemeId(event.newValue)) {
        setTheme(event.newValue, { persist: false });
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return <>{children}</>;
}
