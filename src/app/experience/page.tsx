/* ---------------------------------------------------------------------------
   EXPERIENCE — "/experience", the printable CV.

   PageTitle "Experience" with the contact line (name, email, place) and the
   print button, then three sections: "Research and work" (every role, all
   bullets, as RoleList rows), "Education" (the same margin-column rows),
   and "Tools" (SkillChips). Server component, no motion.

   Data: src/content/experience.ts (roles, education), src/content/home.ts
   (`currently` marks ongoing roles), src/content/skills.ts (Tools).

   Print (Cmd-P): black on white with no chrome. The name becomes the
   headline, the rows tighten, and the chips and the course lists become
   plain text separated by commas. Nothing a CV needs is hidden.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import PageTitle from "@/components/layout/PageTitle";
import PrintButton from "@/components/experience/PrintButton";
import RoleList from "@/components/experience/RoleList";
import SkillChips from "@/components/experience/SkillChips";
import { experience, education } from "@/content/experience";
import { site } from "@/content/site";
import { getResolvedSkills } from "@/lib/icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Experience",
  description: "Research, work, and education — Noah Finkelstein, Brown University.",
};

/** A labelled, comma-less wrapped list (coursework, activities). */
function Listing({ label, items }: { label: string; items: string[] }) {
  return (
    <div className={styles.listing}>
      <p className={styles.label}>{label}</p>
      <ul role="list" className={styles.inline} aria-label={label}>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ExperiencePage() {
  const skills = getResolvedSkills();

  return (
    <div className={styles.cv}>
      <PageTitle title="Experience" size="lg">
        {/* The contact line lives here (not in PageTitle's `lede`) so print can
            set the name as the CV's headline. */}
        <p className={styles.contact}>
          <span className={styles.name}>{site.name}</span>
          <a href={`mailto:${site.email}`}>{site.email}</a>
          <span>{site.location}</span>
        </p>
        <div className={styles.actions}>
          <PrintButton />
        </div>
      </PageTitle>

      <div className={`container ${styles.wrap}`}>
        <section className={styles.section} aria-labelledby="work">
          <h2 id="work" className={styles.heading}>
            Research and work
          </h2>
          <RoleList roles={experience} full />
        </section>

        <section className={styles.section} aria-labelledby="education">
          <h2 id="education" className={styles.heading}>
            Education
          </h2>
          <ol role="list" className={styles.schools}>
            {education.map((school) => (
              <li key={school.school} className={styles.row}>
                <p className={`mono ${styles.date}`}>{school.date}</p>
                <div className={styles.body}>
                  <h3 className={styles.school}>{school.school}</h3>
                  <p className={styles.degree}>{school.degree}</p>
                  {school.note ? <p className={styles.note}>{school.note}</p> : null}
                  {school.coursework ? <Listing label="Coursework" items={school.coursework} /> : null}
                  {school.activities ? <Listing label="Activities" items={school.activities} /> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="tools">
          <h2 id="tools" className={styles.heading}>
            Tools
          </h2>
          <SkillChips skills={skills} />
        </section>
      </div>
    </div>
  );
}
