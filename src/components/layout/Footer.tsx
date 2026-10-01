/* ---------------------------------------------------------------------------
   Footer — the signature line (RGB-split on hover) and a source link.
   Under 900px, where the left bar is hidden, it also shows the social icons
   and the email. No props; reads src/content/site.ts.
   --------------------------------------------------------------------------- */

import { getSocialLinks, site } from "@/content/site";
import { getIcon } from "@/lib/icons";
import SocialIcon from "./SocialIcon";
import styles from "./Footer.module.css";

export default function Footer() {
  const links = getSocialLinks();
  return (
    <footer className={styles.root} data-print-hide>
      <ul className={styles.social} role="list">
        {links.map((link) => (
          <li key={link.href}>
            <a
              className={styles.icon}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              title={link.label}
            >
              <SocialIcon path={getIcon(link.icon).path} size={22} />
            </a>
          </li>
        ))}
      </ul>
      <a className={styles.email} href={`mailto:${site.email}`}>
        {site.email}
      </a>
      <p className={styles.signature}>
        <span className={styles.split}>Designed &amp; built by {site.name}</span>
      </p>
      <p className={styles.credit}>
        <a href={site.credit.href} target="_blank" rel="noopener noreferrer">
          {site.credit.text}
        </a>
      </p>
    </footer>
  );
}
