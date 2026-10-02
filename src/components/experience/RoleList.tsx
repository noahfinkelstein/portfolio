/* ---------------------------------------------------------------------------
   RoleList — the roles from src/content/experience.ts as rows with the date
   in the margin column: [ date | role, org, bullets ]. Used by the home
   page's Experience section (first bullet only) and by /experience (every
   bullet). Server component, no motion.

   Props:
     roles  Role[] from src/content/experience.ts
     full   true renders every bullet as a list and the role's tools under
            them; false (default) renders the first bullet as one paragraph
   A role whose `role` is listed in home.currently and whose date ends with
   "–" is dated "<date> now" (e.g. "Apr 2026 – now"); there is no badge.
   --------------------------------------------------------------------------- */

import type { Role } from "@/content/experience";
import { home } from "@/content/home";
import styles from "./RoleList.module.css";

export type RoleListProps = {
  roles: Role[];
  full?: boolean;
};

const current = new Set(home.currently);

/** The date column text: an open-ended date of a current role reads "… now". */
export function displayDate(role: Pick<Role, "date" | "role">): string {
  const date = role.date.trim();
  if (current.has(role.role) && date.endsWith("–")) return `${date} now`;
  return date;
}

export default function RoleList({ roles, full = false }: RoleListProps) {
  return (
    <ol role="list" className={styles.list}>
      {roles.map((role) => (
        <li key={role.role + role.date} className={styles.row}>
          <p className={`mono ${styles.date}`}>{displayDate(role)}</p>
          <div className={styles.body}>
            <h3 className={styles.role}>{role.role}</h3>
            <p className={styles.org}>
              {role.orgHref ? (
                <a href={role.orgHref} target="_blank" rel="noopener noreferrer">
                  {role.org}
                </a>
              ) : (
                <span>{role.org}</span>
              )}
              {role.place ? <span className={styles.place}>{role.place}</span> : null}
            </p>
            {full ? (
              <ul className={styles.bullets}>
                {role.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            ) : role.bullets[0] ? (
              <p className={styles.summary}>{role.bullets[0]}</p>
            ) : null}
            {full && role.stack && role.stack.length > 0 ? (
              <ul role="list" className={`mono ${styles.stack}`} aria-label={`Tools used as ${role.role}`}>
                {role.stack.map((tool) => (
                  <li key={tool}>{tool}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
