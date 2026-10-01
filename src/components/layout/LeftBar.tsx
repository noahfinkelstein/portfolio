/* ---------------------------------------------------------------------------
   LeftBar — fixed to the bottom-left on wide screens: the email set
   vertically, a rule, the social icons, and a rule down to the bottom edge.
   Hidden under 900px (the footer shows the same links there). No props;
   reads src/content/site.ts. Server component (icons resolve at build).
   --------------------------------------------------------------------------- */

import { getSocialLinks, site } from "@/content/site";
import { getIcon } from "@/lib/icons";
import SocialIcon from "./SocialIcon";
import styles from "./LeftBar.module.css";

export default function LeftBar() {
  const links = getSocialLinks();
  return (
    <aside className={styles.root} aria-label="Email and profiles" data-print-hide>
      <a className={styles.email} href={`mailto:${site.email}`}>
        {site.email}
      </a>
      <span className={styles.rule} aria-hidden="true" />
      <ul className={styles.icons} role="list">
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
      <span className={styles.tail} aria-hidden="true" />
    </aside>
  );
}
