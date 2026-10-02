/* ---------------------------------------------------------------------------
   CV — "/cv", the curriculum vitae, styled to print.

   PageTitle "Curriculum vitae" with the contact line (name, email, place)
   and the print button, then the sections:
     Research and work  every role, all bullets (RoleList rows)
     Education          the same margin-column rows
     Technical          one row per category: the label in the mono margin
                        column, the tools as one plain sentence
     Press              interviews and articles; only when there are any
   Server component, no motion, no icons.

   Data: src/content/experience.ts (roles, education), src/content/home.ts
   (`currently` marks ongoing roles), src/content/skills.ts (Technical),
   src/content/press.ts through getFeed (Press).

   Print (Cmd-P): black on white. The running head, the footer and the theme
   button are hidden (they carry data-print-hide), the name becomes the
   headline, the rows tighten and the course lists run on as plain text.
   Nothing a CV needs is hidden.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import PageTitle from "@/components/layout/PageTitle";
import PrintButton from "@/components/experience/PrintButton";
import RoleList from "@/components/experience/RoleList";
import { experience, education } from "@/content/experience";
import { site } from "@/content/site";
import { skills } from "@/content/skills";
import { getFeed } from "@/lib/feed";
import { formatDate } from "@/lib/format";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Curriculum vitae",
  description: "Research, work, education and technical skills: Noah Finkelstein, Brown University.",
};

/** "A", "A and B", "A, B and C", ending with a full stop. */
function sentence(items: string[]): string {
  if (items.length === 0) return "";
  const list = items.length === 1 ? items[0] : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
  return `${list}.`;
}

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

export default function CvPage() {
  const press = getFeed({ kinds: ["press"] });

  return (
    <div className={styles.cv}>
      <PageTitle title="Curriculum vitae" size="lg">
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
        <section className={styles.section} aria-labelledby="research-and-work">
          <h2 id="research-and-work" className={styles.heading}>
            Research and work
          </h2>
          <RoleList roles={experience} />
        </section>

        <section className={styles.section} aria-labelledby="education">
          <h2 id="education" className={styles.heading}>
            Education
          </h2>
          <ol role="list" className={styles.rows}>
            {education.map((school) => (
              <li key={school.school} className={styles.row}>
                <p className={`mono ${styles.date}`}>{school.date}</p>
                <div className={styles.body}>
                  <h3 className={styles.title}>{school.school}</h3>
                  <p className={styles.degree}>{school.degree}</p>
                  {school.note ? <p className={styles.note}>{school.note}</p> : null}
                  {school.coursework ? <Listing label="Coursework" items={school.coursework} /> : null}
                  {school.activities ? <Listing label="Activities" items={school.activities} /> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.section} aria-labelledby="technical">
          <h2 id="technical" className={styles.heading}>
            Technical
          </h2>
          <dl className={styles.rows}>
            {skills.map((category) => (
              <div key={category.label} className={`${styles.row} ${styles.compact}`}>
                <dt className={`mono ${styles.date}`}>{category.label}</dt>
                <dd className={`${styles.body} ${styles.items}`}>{sentence(category.items)}</dd>
              </div>
            ))}
          </dl>
        </section>

        {press.length > 0 ? (
          <section className={styles.section} aria-labelledby="press">
            <h2 id="press" className={styles.heading}>
              Press
            </h2>
            <ol role="list" className={styles.rows}>
              {press.map((item) => (
                <li key={item.key} className={styles.row}>
                  <p className={`mono ${styles.date}`}>
                    {item.date ? <time dateTime={item.date}>{formatDate(item.date)}</time> : null}
                  </p>
                  <div className={styles.body}>
                    <h3 className={styles.title}>
                      <a href={item.href} target="_blank" rel="noopener noreferrer">
                        {item.title}
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    </h3>
                    {item.kind === "press" && item.source ? <p className={styles.outlet}>{item.source}</p> : null}
                    {item.excerpt ? <p className={styles.note}>{item.excerpt}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
      </div>
    </div>
  );
}
