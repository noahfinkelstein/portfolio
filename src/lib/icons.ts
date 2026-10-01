/* ---------------------------------------------------------------------------
   ICONS — brand logos from Simple Icons (CC0), resolved on the server.

   SERVER ONLY. This imports the whole Simple Icons set (~3,500 logos) to look
   slugs up by name, so it must never reach a client bundle; `server-only`
   makes the build fail if a client component imports it. Resolve icons in a
   server component (a page, the layout, or a server wrapper) and pass the
   small `ResolvedIcon` objects down as props.
   --------------------------------------------------------------------------- */

import "server-only";
import * as simpleIcons from "simple-icons";
import { skills, type Skill } from "@/content/skills";

export type ResolvedIcon = {
  slug: string;
  title: string;
  /** Brand color, "#rrggbb". */
  hex: string;
  /** SVG path data for a 24×24 viewBox. */
  path: string;
};

export type ResolvedSkill = ResolvedIcon & {
  name: string;
  /** `color` from skills.ts if set, else null (renderer picks brand or theme fg). */
  color: string | null;
  /** True when the brand color is too dark to read on a dark theme. */
  darkBrand: boolean;
};

/* Icons Simple Icons does not carry (LinkedIn asked to be removed). Drawn for
   this site; 24×24 viewBox. */
const customIcons: Record<string, ResolvedIcon> = {
  linkedin: {
    slug: "linkedin",
    title: "LinkedIn",
    hex: "#0A66C2",
    path:
      "M2.5 8.5h4v13h-4zM4.5 2.25a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5z" +
      "M9 8.5h3.8v1.8h.06c.53-1 1.83-2.06 3.76-2.06 4.02 0 4.76 2.65 4.76 6.09V21.5h-4v-6.3c0-1.5-.03-3.44-2.1-3.44-2.1 0-2.42 1.64-2.42 3.33v6.41H9z",
  },
};

type SimpleIcon = { title: string; slug: string; hex: string; path: string };

let bySlug: Map<string, SimpleIcon> | null = null;

function iconIndex(): Map<string, SimpleIcon> {
  if (!bySlug) {
    bySlug = new Map();
    for (const value of Object.values(simpleIcons) as unknown[]) {
      if (value && typeof value === "object" && "slug" in value && "path" in value) {
        const icon = value as SimpleIcon;
        bySlug.set(icon.slug, icon);
      }
    }
  }
  return bySlug;
}

/** Look up one icon by slug. Throws on an unknown slug so typos fail the build. */
export function getIcon(slug: string): ResolvedIcon {
  const custom = customIcons[slug];
  if (custom) return custom;
  const icon = iconIndex().get(slug);
  if (!icon) {
    throw new Error(
      `Unknown icon slug "${slug}". Check https://simpleicons.org for the right slug.`,
    );
  }
  return { slug: icon.slug, title: icon.title, hex: `#${icon.hex}`, path: icon.path };
}

function relativeLuminance(hex: string): number {
  const n = hex.replace("#", "");
  const channel = (i: number) => {
    const c = parseInt(n.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

export function resolveSkill(skill: Skill): ResolvedSkill {
  const icon = getIcon(skill.icon);
  return {
    ...icon,
    name: skill.name,
    color: skill.color ?? null,
    darkBrand: relativeLuminance(icon.hex) < 0.05,
  };
}

/** Every skill in src/content/skills.ts, with its logo resolved. */
export function getResolvedSkills(): ResolvedSkill[] {
  return skills.map(resolveSkill);
}
