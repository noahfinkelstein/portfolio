/* ---------------------------------------------------------------------------
   TagList — the project's stack as pills. Colours cycle through the six
   theme tag hues (--tag-1 … --tag-6): a solid border, the hue at 15% behind,
   and the matching --tag-N-text, which passes 4.5:1 in every theme. Pills
   lift a little on hover.
   --------------------------------------------------------------------------- */

import styles from "./TagList.module.css";

export type TagListProps = {
  tags: string[];
  /** Accessible name for the list. */
  label?: string;
  className?: string;
};

export default function TagList({ tags, label = "Built with", className }: TagListProps) {
  return (
    <ul role="list" aria-label={label} className={[styles.tags, className].filter(Boolean).join(" ")}>
      {tags.map((tag) => (
        <li key={tag} className={styles.tag}>
          {tag}
        </li>
      ))}
    </ul>
  );
}
