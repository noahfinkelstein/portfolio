/* ---------------------------------------------------------------------------
   SkillChips — the "Tools" list: a wrapped row of small chips, each the
   brand-coloured logo (18px) and the name. Used under the Experience
   section on the home page and on /experience. Server component, no motion.
   In print the chips become plain text separated by commas.

   Props:
     skills  ResolvedSkill[] from getResolvedSkills() in src/lib/icons.ts
             (server-only; resolve in the page and pass down)
     label   the list's accessible name (default "Tools")
   A logo whose brand colour is near black (Next.js, Vercel, three.js) is
   drawn in the text colour on the dark themes and in its own colour on Paper.
   --------------------------------------------------------------------------- */

import type { CSSProperties } from "react";
import type { ResolvedSkill } from "@/lib/icons";
import styles from "./SkillChips.module.css";

export type SkillChipsProps = {
  skills: ResolvedSkill[];
  label?: string;
};

export default function SkillChips({ skills, label = "Tools" }: SkillChipsProps) {
  return (
    <ul role="list" className={styles.chips} aria-label={label}>
      {skills.map((skill) => (
        <li
          key={skill.slug}
          className={styles.chip}
          data-dark-brand={skill.darkBrand && !skill.color ? "" : undefined}
          style={{ "--brand": skill.color ?? skill.hex } as CSSProperties}
        >
          <svg className={styles.logo} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
            <path d={skill.path} fill="currentColor" />
          </svg>
          <span className={styles.name}>{skill.name}</span>
        </li>
      ))}
    </ul>
  );
}
