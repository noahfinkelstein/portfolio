/* ---------------------------------------------------------------------------
   WritingList — the list on the Writing page (/blog): blog posts and
   LinkedIn posts, newest first, grouped by year. Each year is a heading
   over rows of [date | title link + summary] (FeedRow, the same rows as
   the "Writing" section on the home page). LinkedIn posts link to the original; nothing
   is ever requested from linkedin.com.

   Server component: no state, no JavaScript needed to read it. With no
   items it renders the one line "Nothing here yet." (the nav already hides
   "Writing" then).

   Props:
     items  FeedItem[] (the page passes getFeed({ kinds: ["blog", "linkedin"] }))
   --------------------------------------------------------------------------- */

import type { FeedItem } from "@/lib/feed";
import FeedRow from "./FeedRow";
import styles from "./WritingList.module.css";

export type WritingListProps = {
  items: FeedItem[];
};

/** Items grouped by the year of their date, in the order given. */
function groupByYear(items: FeedItem[]): [string, FeedItem[]][] {
  const byYear = new Map<string, FeedItem[]>();
  for (const item of items) {
    const year = item.date ? item.date.slice(0, 4) : "Undated";
    const list = byYear.get(year);
    if (list) list.push(item);
    else byYear.set(year, [item]);
  }
  return Array.from(byYear.entries());
}

export default function WritingList({ items }: WritingListProps) {
  if (items.length === 0) {
    return <p className={styles.empty}>Nothing here yet.</p>;
  }

  return (
    <div className={styles.root}>
      {groupByYear(items).map(([year, list]) => (
        <section key={year} className={styles.year} aria-labelledby={`year-${year}`}>
          <h2 id={`year-${year}`} className={styles.yearHeading}>
            {year}
          </h2>
          <ol role="list" className={styles.list}>
            {list.map((item) => (
              <FeedRow key={item.key} item={item} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
