/* ---------------------------------------------------------------------------
   Footer — a short colophon at the foot of every page, inside the text
   measure under a 1px rule:

     line 1  how to reach me: the email address, GitHub, LinkedIn (plain
             links, no icons)
     line 2  small italic: where I am, and what the page is set in and built
             with

   No props; reads src/content/site.ts.
   --------------------------------------------------------------------------- */

import { getSocialLinks, site } from "@/content/site";
import styles from "./Footer.module.css";

export default function Footer() {
  const links = getSocialLinks();
  return (
    <footer className="container" data-print-hide>
      <div className={styles.colophon}>
        <ul className={styles.links} role="list">
          <li>
            <a href={`mailto:${site.email}`}>{site.email}</a>
          </li>
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                {link.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.note}>
          <span>{site.location}.</span>
          <span>Set in STIX Two Text and JetBrains Mono. Built with Next.js.</span>
        </p>
      </div>
    </footer>
  );
}
