/* ---------------------------------------------------------------------------
   Hero — the first screen: the name, the lede under it, the contact links,
   and the figure ("Fig. 1": the torus knot).

   Server component. Every word comes from home.hero in src/content/home.ts
   and site in src/content/site.ts.
   --------------------------------------------------------------------------- */

import { home } from "@/content/home";
import { getSocialLinks, site } from "@/content/site";
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
  const { hero } = home;
  return (
    <section className={`container ${styles.hero}`} aria-labelledby="hero-name">
      <div className={styles.text}>
        <h1 id="hero-name" className={styles.name}>
          {site.name}
        </h1>
        <p className={styles.lede}>
          <Lede text={hero.lede} links={hero.ledeLinks} />
        </p>
        <ul className={styles.links} role="list">
          <li>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          {getSocialLinks().map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <figure className={styles.figure}>
        <div className={styles.canvas} aria-hidden="true" />
        <figcaption className={styles.caption}>{hero.figureCaption}</figcaption>
      </figure>
    </section>
  );
}
