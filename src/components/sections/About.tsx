/**
 * ============================================================================
 *  ABOUT SECTION  —  bio text, quick facts, and portrait.
 * ============================================================================
 *
 * Unlike most content (which lives in config/*.ts), the bio prose is edited
 * directly here because it's long-form writing, not structured data.
 *
 * PORTRAIT: set PORTRAIT_SRC to "/images/me.jpg" after dropping a file in
 * /public/images/. Empty string → SmartImage shows a gradient placeholder.
 *
 * LAYOUT: two-column grid on md+ (1.4fr text : 1fr photo). Single column on mobile.
 */

import Section from "@/components/Section";
import SmartImage from "@/components/SmartImage";

// Path under /public — "" means placeholder until you add a real photo
const PORTRAIT_SRC = "";

export default function About() {
  return (
    <Section id="about" index="01" title="About">
      <div className="grid items-start gap-10 md:grid-cols-[1.4fr_1fr]">
        {/* Bio paragraphs — edit the text below freely */}
        <div className="space-y-5 text-lg leading-relaxed text-fg-muted">
          <p>
            Hi there! I&apos;m Noah, a rising junior at{" "}
            <span className="text-fg">Brown University</span> studying a
            combination of Computer Science, Math, and Physics (on the
            Astrophysics track). I&apos;m a machine-learning enthusiast and
            full-stack developer who loves building cool things — from
            robust, scalable software to dubiously sturdy IKEA bookshelves.
          </p>
          <p>
            Right now I&apos;m doing biostatistics research with the{" "}
            <span className="text-fg">MGH Biostatistics group</span> on the
            RECOVER Initiative (studying Long COVID), and I co-founded{" "}
            <span className="text-fg">CourseTrees</span>, a tool that turns
            college course catalogs into interactive, explorable graphs.
          </p>
          <p>
            Outside of class you&apos;ll find me{" "}
            <span className="text-fg">reading</span>, doing{" "}
            <span className="text-fg">astrophotography</span>, and playing{" "}
            <span className="text-fg">chess</span>. Don&apos;t hesitate to
            reach out if you&apos;d like to chat!
          </p>

          {/* Quick facts as pill chips — add/remove strings in the array */}
          <ul className="flex flex-wrap gap-2 pt-2">
            {["Greater Boston", "Math-CS + Astrophysics", "Brown ’28", "He/Him"].map(
              (fact) => (
                <li
                  key={fact}
                  className="rounded-full border border-border bg-bg-soft px-3 py-1 font-mono text-xs text-fg"
                >
                  {fact}
                </li>
              )
            )}
          </ul>
        </div>

        {/* Portrait — aspect-[4/5] portrait ratio, object-cover crops to fill */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-2xl border border-border">
          <SmartImage
            src={PORTRAIT_SRC}
            alt="Portrait of Noah Finkelstein"
            fill
            sizes="(max-width: 768px) 80vw, 320px"
            className="h-full w-full object-cover"
            placeholderLabel="add /images/me.jpg"
          />
        </div>
      </div>
    </Section>
  );
}
