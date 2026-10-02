/* ---------------------------------------------------------------------------
   TagList — a project's stack as a plain wrapped list in the mono (the .mono
   utility): --text-xs, --fg-muted, 0.75rem gaps. No pills, no colours,
   nothing on hover.

   Props:
     tags        the names, in order
     label?      accessible name for the list (default "Built with")
     className?  extra class on the <ul>
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
    <ul
      role="list"
      aria-label={label}
      className={["mono", styles.tags, className].filter(Boolean).join(" ")}
    >
      {tags.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
    </ul>
  );
}
