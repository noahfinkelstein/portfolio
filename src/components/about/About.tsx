/* ---------------------------------------------------------------------------
   About — the "About" section on the home page.

   A SectionHeader, then two columns from 800px (stacked on phones): the
   portrait in a 3:4 frame with its caption under it, and the intro
   paragraphs beside it, left aligned at a reading width. Server component,
   no motion.

   Props: none. Reads home.about and home.portrait (src/content/home.ts); the
   portrait crop comes from portrait.position.
   Contract: renders <section id="about"> (the nav's About link targets it).
   --------------------------------------------------------------------------- */

import Image from "next/image";
import { home } from "@/content/home";
import SectionHeader from "@/components/sections/SectionHeader";
import styles from "./About.module.css";

export default function About() {
  const { about, portrait } = home;
  return (
    <section id="about" className={styles.section} aria-labelledby="about-heading">
      <SectionHeader text={home.sections.about} id="about-heading" />
      <div className={`container ${styles.grid}`}>
        <figure className={styles.figure}>
          <div className={styles.frame}>
            <Image
              className={styles.photo}
              src={portrait.src}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              sizes="16rem"
              style={{ objectPosition: portrait.position }}
            />
          </div>
          <figcaption className={styles.caption}>{portrait.caption}</figcaption>
        </figure>
        <div className={styles.text}>
          {about.intro.map((paragraph) => (
            <p key={paragraph.slice(0, 32)} className={styles.para}>
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
