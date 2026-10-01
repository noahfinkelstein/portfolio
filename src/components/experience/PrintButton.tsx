"use client";

/* PrintButton — "Print / save as PDF" on /experience. Hidden in print. */

import styles from "./PrintButton.module.css";

export default function PrintButton({ label = "Print / save as PDF" }: { label?: string }) {
  return (
    <button type="button" className={styles.button} onClick={() => window.print()} data-print-hide>
      <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
        <path
          d="M7 3h10v5H7zM5 9h14a2 2 0 0 1 2 2v6h-4v4H7v-4H3v-6a2 2 0 0 1 2-2zm4 7v3h6v-3z"
          fill="currentColor"
        />
      </svg>
      {label}
    </button>
  );
}
