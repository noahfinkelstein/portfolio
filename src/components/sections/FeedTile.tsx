/* ---------------------------------------------------------------------------
   FeedTile — the 16:9 picture for a feed item that has no image of its own
   (most blog and LinkedIn text posts). Typographic, never a fake screenshot:
   the item's title set three times in heavy caps, outline / solid / outline,
   echoing the Titles section, over an accent-tinted gradient with a faint
   grid and grain. The rows drift apart when the card is hovered.

   Decorative (aria-hidden): the card's real title is right below it.

   Props:
     text   the words to set (the card title)
     label  small kind label in the corner ("Blog", "LinkedIn", …)
     icon?  24×24 SVG path shown before the label
   --------------------------------------------------------------------------- */

import styles from "./FeedTile.module.css";

export default function FeedTile({ text, label, icon }: { text: string; label: string; icon?: string }) {
  const words = text.replace(/[\s….!?]+$/u, "");
  const row = `${words} · ${words} · ${words}`;
  return (
    <div className={styles.tile} aria-hidden="true">
      <span className={styles.label}>
        {icon ? (
          <svg className={styles.icon} viewBox="0 0 24 24" focusable="false">
            <path d={icon} fill="currentColor" />
          </svg>
        ) : null}
        {label}
      </span>
      <div className={styles.rows}>
        <span className={`${styles.row} ${styles.r1} ${styles.stroke}`}>{row}</span>
        <span className={`${styles.row} ${styles.r2}`}>{row}</span>
        <span className={`${styles.row} ${styles.r3} ${styles.stroke}`}>{row}</span>
      </div>
    </div>
  );
}
