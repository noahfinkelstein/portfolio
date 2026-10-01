"use client";

/* ---------------------------------------------------------------------------
   SectionHeader — the label at the top of every home page section
   (Selected Projects, Latest, About Me, Experience).

   Heavy caps at 7vmin with an offset accent shadow, and a hairline running
   from the end of the word to the right edge of the column. When the header
   reaches the middle of the screen it slides out of a mask (up from below by
   default). Static for reduced motion, and fully visible without JavaScript.

   Props:
     text        the label, written normally (CSS sets it in capitals)
     id?         id for the heading element (for aria-labelledby)
     as?         heading element, default "h2"
     direction?  where it slides in from: "N" (default, up from below), "S"
                 (down from above), "E" (from the left), "W" (from the right)
     className?  extra class on the outer wrapper (it already sets the
                 content width, the side gutter and the space below)
   --------------------------------------------------------------------------- */

import { useRef } from "react";
import { gsap, useGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./SectionHeader.module.css";

export type SectionHeaderProps = {
  text: string;
  id?: string;
  as?: "h2" | "h3";
  direction?: "N" | "S" | "E" | "W";
  className?: string;
};

const FROM: Record<NonNullable<SectionHeaderProps["direction"]>, gsap.TweenVars> = {
  N: { yPercent: 100 },
  S: { yPercent: -100 },
  E: { xPercent: -100 },
  W: { xPercent: 100 },
};

export default function SectionHeader({
  text,
  id,
  as = "h2",
  direction = "N",
  className,
}: SectionHeaderProps) {
  const Tag = as;
  const rootRef = useRef<HTMLDivElement>(null);
  const slideRef = useRef<HTMLSpanElement>(null);

  useGsap(
    () => {
      const root = rootRef.current;
      const slide = slideRef.current;
      if (!root || !slide || prefersReducedMotion()) return;
      gsap.from(slide, {
        ...FROM[direction],
        duration: 0.5,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: root,
          // clamp(): still fires when the page cannot scroll far enough for
          // the header to reach the middle (a header near the bottom).
          start: "clamp(top center)",
          toggleActions: "play none none none",
        },
      });
    },
    [direction],
    rootRef,
  );

  return (
    <div ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
      <Tag id={id} className={styles.heading}>
        <span ref={slideRef} className={styles.slide}>
          <span className={styles.text}>{text}</span>
          <span className={styles.rule} aria-hidden="true" />
        </span>
      </Tag>
    </div>
  );
}
