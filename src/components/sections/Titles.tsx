"use client";

/* ---------------------------------------------------------------------------
   Titles — three giant heavy-caps lines under the hero, alternating outline
   and solid, each with the offset accent shadow. While you scroll past, each
   line is scrubbed sideways by half the width of the page (left, right,
   left). Static for reduced
   motion. The hero's down arrow scrolls here, so the section keeps
   id="titles".

   Props:
     lines?  TitleLine[] (default: src/content/titles.ts). Anything with
             { text, style } works; `direction` is optional
             and alternates left/right when left out.
   --------------------------------------------------------------------------- */

import { Fragment, useRef, type CSSProperties } from "react";
import { gsap, useGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { titles, titlesLabel, type TitleLine } from "@/content/titles";
import styles from "./Titles.module.css";

export type TitlesProps = {
  lines?: TitleLine[];
};

/** Words kept whole, so "Co-Founder" and "Mathematics–CS" never break at the
    hyphen or dash; a line only wraps between words. */
function words(text: string) {
  return text.split(/\s+/).map((word, i) => (
    <Fragment key={i}>
      {i > 0 ? " " : null}
      <span className={styles.word}>{word}</span>
    </Fragment>
  ));
}

/** Longest run that cannot wrap, in characters: sizes the lines on phones. */
function longestRun(lines: TitleLine[]): number {
  let max = 1;
  for (const line of lines) {
    for (const word of line.text.split(/\s+/)) max = Math.max(max, word.length);
  }
  return max;
}

export default function Titles({ lines = titles }: TitlesProps) {
  const rootRef = useRef<HTMLElement>(null);

  useGsap(
    () => {
      const root = rootRef.current;
      if (!root || prefersReducedMotion()) return;
      const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-title-line]"));
      for (const row of rows) {
        const sign = row.dataset.direction === "right" ? 1 : -1;
        gsap.to(row, {
          x: () => (sign * row.offsetWidth) / 2,
          ease: "power1.inOut",
          scrollTrigger: {
            trigger: row,
            start: "top-=10% center-=20%",
            end: "bottom center-=20%",
            scrub: true,
            invalidateOnRefresh: true,
          },
        });
      }
    },
    [lines],
    rootRef,
  );

  const style = { "--fit-chars": longestRun(lines) } as CSSProperties;

  return (
    <section
      ref={rootRef}
      id="titles"
      className={styles.root}
      aria-labelledby="titles-heading"
      style={style}
    >
      <h2 id="titles-heading" className="sr-only">
        {titlesLabel}
      </h2>
      <ul role="list" className={styles.list}>
        {lines.map((line, i) => {
          const direction = line.direction ?? (i % 2 === 0 ? "left" : "right");
          return (
            <li
              key={`${i}-${line.text}`}
              className={styles.row}
              data-title-line=""
              data-direction={direction}
            >
              <span
                className={line.style === "stroke" ? `${styles.text} ${styles.stroke}` : styles.text}
              >
                {words(line.text)}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
