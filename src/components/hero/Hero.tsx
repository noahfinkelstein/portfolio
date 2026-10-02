/* ---------------------------------------------------------------------------
   Hero — the front matter of the home page, set like the first page of a
   short paper: the name, the lede, the two intro paragraphs, a line of
   links (email, profiles, CV), a small portrait ("Fig. 2") and, beside the
   text on wide screens, the trefoil knot ("Fig. 1"). Stacked on phones, with
   the knot after the text.

   Server component. Every word comes from home (hero, about, portrait) in
   src/content/home.ts and site in src/content/site.ts. The knot's box holds
   HeroFigure: the static SVG knot in the server HTML, and the three.js
   canvas (loaded on the client, after the page is interactive) fading in
   over it.
   --------------------------------------------------------------------------- */

import Image from "next/image";
import Link from "next/link";
import { home } from "@/content/home";
import { getSocialLinks, site } from "@/content/site";
import HeroFigure from "./HeroFigure";
import TorusKnotSvg from "./TorusKnotSvg";
import styles from "./Hero.module.css";

/** The lede with the words in home.hero.ledeLinks turned into links. */
function Lede({ text, links }: { text: string; links: Record<string, string> }) {
  const words = Object.keys(links);
  if (words.length === 0) return <>{text}</>;
  const pattern = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`);
  return (
    <>
      {text.split(pattern).map((part, i) =>
        links[part] ? (
          <a key={i} href={links[part]}>
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function Hero() {
  const { hero, about, portrait } = home;
  return (
    <section className={`container ${styles.hero}`} aria-labelledby="hero-name">
      <div className={styles.text}>
        <h1 id="hero-name" className={styles.name}>
          {site.name}
        </h1>
        <p className={styles.lede}>
          <Lede text={hero.lede} links={hero.ledeLinks} />
        </p>
        {about.intro.map((paragraph) => (
          <p key={paragraph.slice(0, 32)} className={styles.para}>
            {paragraph}
          </p>
        ))}
        <ul className={styles.links} role="list">
          <li>
            <a href={`mailto:${site.email}`}>Email</a>
          </li>
          {getSocialLinks().map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
          <li>
            <Link href="/cv">CV</Link>
          </li>
        </ul>
        <figure className={styles.portrait}>
          <div className={styles.portraitFrame}>
            <Image
              className={styles.portraitPhoto}
              src={portrait.src}
              alt={portrait.alt}
              width={portrait.width}
              height={portrait.height}
              sizes="9rem"
              style={{ objectPosition: portrait.position }}
            />
          </div>
          <figcaption className={styles.caption}>Fig. 2. {portrait.caption}</figcaption>
        </figure>
      </div>
      <figure className={styles.figure}>
        <div className={styles.canvas} aria-hidden="true">
          <HeroFigure fallback={<TorusKnotSvg className={styles.fallbackSvg} />} />
        </div>
        <figcaption className={styles.caption}>{hero.figureCaption}</figcaption>
      </figure>
    </section>
  );
}
