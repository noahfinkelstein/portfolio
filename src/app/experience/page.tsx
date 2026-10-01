/* ---------------------------------------------------------------------------
   EXPERIENCE — "/experience", the printable CV.

   Data: src/content/experience.ts (roles, education), src/content/home.ts
   (`currently` marks ongoing roles), src/content/skills.ts (Tools).

   On screen it matches the home page's journey: a timeline rail with a node
   per role, cards with the accent edge, tools as coloured pills. In print
   (Cmd-P) it becomes a plain black-on-white CV: no nav, footer, rail, cards
   or colour, tools as text.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import PageTitle from "@/components/layout/PageTitle";
import PrintButton from "@/components/experience/PrintButton";
import { experience, education } from "@/content/experience";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { getResolvedSkills } from "@/lib/icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Experience",
  description: "Research, work, and education — Noah Finkelstein, Brown University.",
};

/** A tool keeps the same pill colour everywhere on the page (1–6). */
function tagIndex(name: string): number {
  let h = 0;
  for (const ch of name.toLowerCase()) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return (h % 6) + 1;
}

function Pills({ items, label }: { items: string[]; label: string }) {
  return (
    <ul role="list" className={styles.pills} aria-label={label}>
      {items.map((item) => (
        <li key={item} className={styles.pill} data-tag={tagIndex(item)}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function ExperiencePage() {
  const current = new Set(home.currently);
  const skills = getResolvedSkills();

  return (
    <div className={styles.cv}>
      <PageTitle title="Experience" size="lg">
        {/* The contact line lives here (not in PageTitle's `lede`) so print can
            set the name as the CV's headline, flush left with everything else. */}
        <p className={styles.contact}>
          <span className={styles.name}>{site.name}</span>
          <span className={styles.nameSep}> · </span>
          <a href={`mailto:${site.email}`}>{site.email}</a> · {site.location}
        </p>
        <div className={styles.actions}>
          <PrintButton />
        </div>
      </PageTitle>

      <div className={styles.wrap}>
        <section className={styles.section} aria-labelledby="work">
          <h2 id="work" className={styles.heading}>
            Research and work
          </h2>
          <ol role="list" className={styles.timeline}>
            {experience.map((role) => {
              const isNow = current.has(role.role);
              return (
                <li key={role.role + role.date} className={[styles.record, isNow ? styles.now : ""].join(" ")}>
                  <p className={styles.date}>
                    <span>{role.date}</span>
                    {isNow ? <span className={styles.nowTag}>Now</span> : null}
                  </p>
                  <article className={styles.card}>
                    <h3 className={styles.title}>{role.role}</h3>
                    <p className={styles.org}>
                      {role.orgHref ? <a href={role.orgHref}>{role.org}</a> : role.org}
                      {role.place ? <span className={styles.place}>, {role.place}</span> : null}
                    </p>
                    <ul className={styles.bullets}>
                      {role.bullets.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    {role.stack ? <Pills items={role.stack} label={`Tools used as ${role.role}`} /> : null}
                  </article>
                </li>
              );
            })}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="education">
          <h2 id="education" className={styles.heading}>
            Education
          </h2>
          <ol role="list" className={styles.timeline}>
            {education.map((school) => (
              <li key={school.school} className={styles.record}>
                <p className={styles.date}>
                  <span>{school.date}</span>
                </p>
                <article className={styles.card}>
                  <h3 className={styles.title}>{school.school}</h3>
                  <p className={styles.org}>{school.degree}</p>
                  {school.note ? <p className={styles.note}>{school.note}</p> : null}
                  {school.coursework ? (
                    <div className={styles.listing}>
                      <h4 className={styles.label}>Coursework</h4>
                      <ul role="list" className={styles.inline}>
                        {school.coursework.map((c) => (
                          <li key={c}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {school.activities ? (
                    <div className={styles.listing}>
                      <h4 className={styles.label}>Activities</h4>
                      <ul role="list" className={styles.inline}>
                        {school.activities.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </article>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="tools">
          <h2 id="tools" className={styles.heading}>
            Tools
          </h2>
          <ul role="list" className={styles.tools}>
            {skills.map((s) => (
              <li key={s.slug} className={styles.tool}>
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
                  <path d={s.path} fill="currentColor" />
                </svg>
                <span>{s.name}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
