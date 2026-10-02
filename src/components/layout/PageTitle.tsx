/* ---------------------------------------------------------------------------
   PageTitle — the <h1> at the top of an inner page (Projects, Writing,
   Experience, 404), left aligned, with room above it for the fixed navbar.

   Props:
     title     the heading text
     lede      optional line under it
     size      "xl" (default) or "lg" (a step smaller, for text-heavy pages)
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
    <header className={`container ${styles.root}`}>
      <h1 className={[styles.title, styles[size]].join(" ")}>{title}</h1>
      {lede ? <p className={styles.lede}>{lede}</p> : null}
      {children}
    </header>
  );
}
