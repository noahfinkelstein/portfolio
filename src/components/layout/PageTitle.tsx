/* ---------------------------------------------------------------------------
   PageTitle — the big heavy-caps <h1> with the offset accent shadow at the
   top of an inner page (Projects, Writing, Experience, 404). Adds the space
   the fixed navbar needs above it.

   Props:
     title     the heading text (set in caps by CSS; write it normally)
     lede      optional line under it, in the serif
     size      "xl" (10vmin) or
               "lg" (smaller, for text-heavy pages). Default "xl".
     children  optional extra content under the lede
   --------------------------------------------------------------------------- */

import styles from "./PageTitle.module.css";

export type PageTitleProps = {
  title: string;
  lede?: React.ReactNode;
  size?: "xl" | "lg";
  children?: React.ReactNode;
};

export default function PageTitle({ title, lede, size = "xl", children }: PageTitleProps) {
  return (
    <header className={styles.root}>
      <h1 className={[styles.title, styles[size]].join(" ")}>{title}</h1>
      {lede ? <p className={styles.lede}>{lede}</p> : null}
      {children}
    </header>
  );
}
