/* ---------------------------------------------------------------------------
   Experience — the home page's "Experience" (journey and skills).

   A SectionHeader, then two columns (stacked ≤900px):
     left   the bordered "My Journey." box: every role in experience.ts as a
            compact timeline (dates, role, org, first bullet; roles listed in
            home.currently get a "Now" marker), education, and a "Full CV →"
            link to the printable /experience. The border stays put and the
            contents slide in from the left inside it, then the entries fade
            up one by one.
     right  SkillsPhysics: the matter-js box of skill chips, sticky beside the
            timeline on wide screens.

   Props:
     skills  ResolvedSkill[] — the page passes getResolvedSkills() from
             src/lib/icons.ts (server-only).
   Contract: renders <section id="experience">.
   --------------------------------------------------------------------------- */

import Link from "next/link";
import { experience, education } from "@/content/experience";
import { home } from "@/content/home";
import type { ResolvedSkill } from "@/lib/icons";
import SectionHeader from "@/components/sections/SectionHeader";
import Reveal from "@/components/about/Reveal";
import SkillsPhysics from "./SkillsPhysics";
import styles from "./Experience.module.css";

export type ExperienceProps = {
  skills: ResolvedSkill[];
};

export default function Experience({ skills }: ExperienceProps) {
  const current = new Set(home.currently);

  return (
    <section
      id="experience"
      className={styles.section}
      aria-labelledby="experience-heading"
    >
      <SectionHeader text={home.sections.experience} id="experience-heading" />
      <div className={`container ${styles.grid}`} data-experience-grid>
        <div className={styles.journey}>
          <Reveal
            from="left"
            distance={0.5}
            mobile={50}
            triggerSelector="[data-experience-grid]"
            stagger
          >
            <h3 className={styles.title}>My Journey.</h3>

            <ol role="list" className={styles.timeline}>
              {experience.map((role) => {
                const isNow = current.has(role.role);
                return (
                  <li
                    key={role.role + role.date}
                    className={[styles.item, isNow ? styles.now : ""].join(" ")}
                    data-reveal-item
                  >
                    <p className={styles.date}>
                      {role.date}
                      {isNow ? (
                        <span className={styles.nowTag}>Now</span>
                      ) : null}
                    </p>
                    <h4 className={styles.role}>{role.role}</h4>
                    <p className={styles.org}>
                      {role.orgHref ? (
                        <a
                          href={role.orgHref}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {role.org}
                        </a>
                      ) : (
                        role.org
                      )}
                    </p>
                    {role.bullets[0] ? (
                      <p className={styles.summary}>{role.bullets[0]}</p>
                    ) : null}
                  </li>
                );
              })}
            </ol>

            <div className={styles.education} data-reveal-item>
              <h4 className={styles.label}>Education</h4>
              {education.map((school) => (
                <div key={school.school} className={styles.school}>
                  <p className={styles.date}>{school.date}</p>
                  <p className={styles.role}>{school.school}</p>
                  <p className={styles.org}>{school.degree}</p>
                  {school.note ? (
                    <p className={styles.summary}>{school.note}</p>
                  ) : null}
                </div>
              ))}
            </div>

            <Link href="/experience" className={styles.cv} data-reveal-item>
              Full CV{" "}
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </Link>
          </Reveal>
        </div>

        <div className={styles.skills}>
          <SkillsPhysics skills={skills} />
        </div>
      </div>
    </section>
  );
}
