/* ---------------------------------------------------------------------------
   Footer — the name, how to reach me, and where I am. No props; reads
   src/content/site.ts.
   --------------------------------------------------------------------------- */

import { getSocialLinks, site } from "@/content/site";
import styles from "./Footer.module.css";

export default function Footer() {
  const links = getSocialLinks();
  return (
    <footer className={`container ${styles.root}`} data-print-hide>
      <p className={styles.name}>{site.name}</p>
      <ul className={styles.links} role="list">
        <li>
          <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          </li>
        ))}
      </ul>
      <p className={styles.place}>{site.location}</p>
    </footer>
  );
}
