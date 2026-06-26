/**
 * ABOUT — a short bio + a photo of you + a few quick facts.
 *
 * EDIT THE TEXT directly in this file (it's prose, so it lives here rather
 * than in a config file). Replace the photo by dropping an image at
 * /public/images/me.jpg (or change the src below).
 */
import Section from "@/components/Section";
import SmartImage from "@/components/SmartImage";

// Your portrait. Drop a file at /public/images/me.jpg and set this to
// "/images/me.jpg". Leave it "" to show a placeholder for now.
const PORTRAIT_SRC = "";

export default function About() {
  return (
    <Section id="about" index="01" title="About">
      <div className="grid items-start gap-10 md:grid-cols-[1.4fr_1fr]">
        {/* ---- Bio text — edit freely ---- */}
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

          {/* Quick facts row */}
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

        {/* ---- Photo of you ---- */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-xs overflow-hidden rounded-2xl border border-border">
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
