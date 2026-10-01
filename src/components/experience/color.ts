/* ---------------------------------------------------------------------------
   Colour helpers for the skill logos (client-safe, no DOM).

   A logo keeps its brand colour when it is visible enough on the chip behind
   it (3:1, the WCAG contrast for graphics). When it is not — C++ blue on a
   dark chip, React cyan on a white one — it is blended toward the theme's
   text colour one step at a time until it is, so it keeps its hue as long as
   it can. Dark brand marks (Next.js, Vercel, three.js, Tidyverse) use the
   text colour on dark themes, as src/lib/icons.ts suggests.
   --------------------------------------------------------------------------- */

import type { ResolvedSkill } from "@/lib/icons";

type RGB = [number, number, number];

function parseHex(hex: string): RGB | null {
  let n = hex.trim().replace("#", "");
  if (n.length === 3) n = n.replace(/(.)/g, "$1$1");
  if (!/^[0-9a-f]{6}$/i.test(n)) return null;
  return [0, 2, 4].map((i) => parseInt(n.slice(i, i + 2), 16)) as RGB;
}

function toHex([r, g, b]: RGB): string {
  return "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}

function luminance([r, g, b]: RGB): number {
  const ch = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

export function contrast(a: string, b: string): number {
  const ra = parseHex(a);
  const rb = parseHex(b);
  if (!ra || !rb) return 21;
  const la = luminance(ra);
  const lb = luminance(rb);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Blend `a` toward `b` by t (0 = a, 1 = b). Hex in, hex out. */
export function mix(a: string, b: string, t: number): string {
  const ra = parseHex(a);
  const rb = parseHex(b);
  if (!ra || !rb) return a;
  return toHex([0, 1, 2].map((i) => ra[i] + (rb[i] - ra[i]) * t) as RGB);
}

export type LogoPalette = {
  /** The chip (or page) colour the logo sits on. */
  surface: string;
  /** Theme text colour. */
  fg: string;
  isDark: boolean;
};

/** The colour to draw a skill's logo in, on `surface`. */
export function logoColor(skill: Pick<ResolvedSkill, "color" | "hex" | "darkBrand">, p: LogoPalette): string {
  const base = skill.color ?? (skill.darkBrand && p.isDark ? p.fg : skill.hex);
  if (contrast(base, p.surface) >= 3) return base;
  for (let t = 0.15; t < 1; t += 0.15) {
    const c = mix(base, p.fg, t);
    if (contrast(c, p.surface) >= 3) return c;
  }
  return p.fg;
}
