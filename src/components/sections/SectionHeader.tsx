/* ---------------------------------------------------------------------------
   SectionHeader — the heading at the top of every home page section
   (Projects, Latest, About, Experience): a sentence-case serif h2 above a
   hairline. Server component, no motion.

   Props:
     text        the heading
     id?         id for the heading element (for aria-labelledby)
     as?         heading element, default "h2"
     className?  extra class on the wrapper (it already sets the content
                 width, the side gutter and the space below)
   --------------------------------------------------------------------------- */

import styles from "./SectionHeader.module.css";

export type SectionHeaderProps = {
  text: string;
  id?: string;
  as?: "h2" | "h3";
  className?: string;
};

export default function SectionHeader({ text, id, as = "h2", className }: SectionHeaderProps) {
  const Tag = as;
  return (
    <div className={["container", styles.root, className].filter(Boolean).join(" ")}>
      <Tag id={id} className={styles.heading}>
        {text}
      </Tag>
    </div>
  );
}
