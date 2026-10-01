/* ---------------------------------------------------------------------------
   PageSelect — the pulsing arrow at the bottom of a page that leads to the
   next one ("Projects →" on home) or back ("← Home" on /projects).

   Props (give one or both):
     forward  { href, label }   arrow points right, label before it
     back     { href, label }   arrow points left, label after it
   --------------------------------------------------------------------------- */

import Link from "next/link";
import styles from "./PageSelect.module.css";

export type PageSelectTarget = { href: string; label: string };

export type PageSelectProps = {
  forward?: PageSelectTarget;
  back?: PageSelectTarget;
};

function Arrow({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className={styles.arrow}
      viewBox="0 0 48 48"
      width="40"
      height="40"
      aria-hidden="true"
      focusable="false"
      style={direction === "left" ? { transform: "scaleX(-1)" } : undefined}
    >
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" strokeWidth="3" />
      <path
        d="M14 24h19M26 16l8 8-8 8"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PageSelect({ forward, back }: PageSelectProps) {
  if (!forward && !back) return null;
  return (
    <nav className={styles.root} aria-label="Page navigation" data-print-hide>
      {back ? (
        <Link href={back.href} className={styles.button}>
          <Arrow direction="left" />
          <span className={styles.label}>{back.label}</span>
        </Link>
      ) : null}
      {forward ? (
        <Link href={forward.href} className={styles.button}>
          <span className={styles.label}>{forward.label}</span>
          <Arrow direction="right" />
        </Link>
      ) : null}
    </nav>
  );
}
