/* ---------------------------------------------------------------------------
   About — "About Me" on the home page.

   A SectionHeader, then one bordered box (2px, the text colour): the rounded
   portrait beside a text column with home.about.name set large in the display
   face, the one-liner, and the intro paragraphs verbatim (Montserrat,
   justified on wide screens). The text column slides in from the right when
   it reaches the middle of the screen; the portrait eases in with it.

   Props: none. Reads home.about and home.portrait (src/content/home.ts); the
   portrait crop comes from portrait.position.
   Contract: renders <section id="about"> (the nav's About link targets it).
   --------------------------------------------------------------------------- */

import Image from "next/image";
import { home } from "@/content/home";
import SectionHeader from "@/components/sections/SectionHeader";
import Reveal from "./Reveal";
import styles from "./About.module.css";

export default function About() {
  const { about, portrait } = home;
  return (
    <section id="about" className={styles.section} aria-labelledby="about-heading">
      <SectionHeader text={home.sections.about} id="about-heading" />
      <div className="container">
        <article className={styles.box} data-about-box>
          <Reveal from="left" distance={0.25} mobile={30} triggerSelector="[data-about-box]" className={styles.photoCol}>
            <Image
              className={styles.photo}
              src={portrait.src}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              sizes="(max-width: 800px) calc(100vw - 4rem), 420px"
              style={{ objectPosition: portrait.position }}
            />
          </Reveal>
          <Reveal from="right" triggerSelector="[data-about-box]" className={styles.text}>
            {about.intro.map((paragraph) => (
              <p key={paragraph.slice(0, 32)} className={styles.para}>
                {paragraph}
              </p>
            ))}
          </Reveal>
        </article>
      </div>
    </section>
  );
}
