/* ---------------------------------------------------------------------------
   EXPERIENCE  —  "/experience"
   Data lives in src/content/experience.ts. This page prints cleanly, so it
   doubles as a CV.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import Page from "@/components/Page";
import Record, { Section } from "@/components/Record";
import { experience, education } from "@/content/experience";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Research, work, and education — Noah Finkelstein, Brown University.",
};

export default function ExperiencePage() {
  return (
    <Page title="Experience" current="/experience">
      <Section title="Research and work">
        {experience.map((role) => (
          <Record key={role.role + role.date} date={role.date}>
            <h3 className="record__title">{role.role}</h3>
            <p className="record__meta">
              {role.orgHref ? (
                <a href={role.orgHref}>{role.org}</a>
              ) : (
                role.org
              )}
              {role.place ? <em>{`, ${role.place}`}</em> : null}
            </p>
            <ul>
              {role.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {role.stack ? (
              <p className="stack">{role.stack.join("  ·  ")}</p>
            ) : null}
          </Record>
        ))}
      </Section>

      <Section title="Education">
        {education.map((school) => (
          <Record key={school.school} date={school.date}>
            <h3 className="record__title">{school.school}</h3>
            <p className="record__meta">{school.degree}</p>
            {school.note ? <p>{school.note}</p> : null}
            {school.coursework ? (
              <p className="listing">
                <span className="listing__label">Coursework</span>
                {school.coursework.join(", ")}.
              </p>
            ) : null}
            {school.activities ? (
              <p className="listing">
                <span className="listing__label">Activities</span>
                {school.activities.join(", ")}.
              </p>
            ) : null}
          </Record>
        ))}
      </Section>
    </Page>
  );
}
