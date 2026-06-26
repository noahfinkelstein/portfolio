/**
 * EDUCATION section — your schools, coursework, and honors.
 * Edit the data in src/config/education.ts.
 */
import Section from "@/components/Section";
import { education } from "@/config/education";

export default function Education() {
  return (
    <Section id="education" index="04" title="Education">
      <div className="space-y-6">
        {education.map((s) => (
          <article key={s.school} className="card p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <h3 className="font-display text-lg font-semibold">{s.school}</h3>
              <span className="font-mono text-xs text-fg-muted">{s.date}</span>
            </div>

            <p className="mt-1 text-accent">{s.degree}</p>

            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-fg-muted">
              {s.gpa && <span>GPA: {s.gpa}</span>}
            </div>

            {s.note && <p className="mt-3 text-sm text-fg-muted">{s.note}</p>}

            {/* Relevant coursework chips */}
            {s.coursework && s.coursework.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-fg-muted">
                  Relevant coursework
                </p>
                <ul className="flex flex-wrap gap-2">
                  {s.coursework.map((c) => (
                    <li
                      key={c}
                      className="rounded-full bg-bg-softer px-2.5 py-1 font-mono text-[11px] text-fg-muted"
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Honors chips */}
            {s.honors && s.honors.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-fg-muted">
                  Honors
                </p>
                <ul className="flex flex-wrap gap-2">
                  {s.honors.map((h) => (
                    <li
                      key={h}
                      className="rounded-full border border-accent/40 px-2.5 py-1 font-mono text-[11px] text-accent"
                    >
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
    </Section>
  );
}
