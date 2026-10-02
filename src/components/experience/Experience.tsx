/* ---------------------------------------------------------------------------
   Experience — the "Experience" section on the home page.

   A SectionHeader, then every role in src/content/experience.ts as a
   RoleList row (date in the margin column, role, org, first bullet), a
   "Tools" sub-heading with the SkillChips, and a plain "Full CV" link to
   /experience, the printable CV. Server component, no motion.

   Props:
     skills  ResolvedSkill[] — the page passes getResolvedSkills() from
             src/lib/icons.ts (server-only).
   Contract: renders <section id="experience">.
   --------------------------------------------------------------------------- */

import Link from "next/link";
import { experience } from "@/content/experience";
import { home } from "@/content/home";
import type { ResolvedSkill } from "@/lib/icons";
import SectionHeader from "@/components/sections/SectionHeader";
import RoleList from "./RoleList";
import SkillChips from "./SkillChips";
import styles from "./Experience.module.css";

export type ExperienceProps = {
  skills: ResolvedSkill[];
};

export default function Experience({ skills }: ExperienceProps) {
  return (
    <section id="experience" className={styles.section} aria-labelledby="experience-heading">
      <SectionHeader text={home.sections.experience} id="experience-heading" />
      <div className="container">
        <RoleList roles={experience} />

        <h3 className={styles.subheading}>Tools</h3>
        <SkillChips skills={skills} />

        <p className={styles.cv}>
          <Link href="/experience">Full CV</Link>
        </p>
      </div>
    </section>
  );
}
