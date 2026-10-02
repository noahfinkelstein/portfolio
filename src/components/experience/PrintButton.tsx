"use client";

/* ---------------------------------------------------------------------------
   PrintButton — "Print / save as PDF" on /cv. A small bordered
   button that calls window.print(); hidden in print (data-print-hide) and
   when scripts do not run (it could not work).
   Client component only for the click handler.

   Props:
     label  the button text (default "Print / save as PDF")
   --------------------------------------------------------------------------- */

import styles from "./PrintButton.module.css";

export type PrintButtonProps = {
  label?: string;
};

export default function PrintButton({ label = "Print / save as PDF" }: PrintButtonProps) {
  return (
    <button type="button" className={styles.button} onClick={() => window.print()} data-print-hide>
      {label}
    </button>
  );
}
