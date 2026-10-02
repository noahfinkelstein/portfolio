/* ---------------------------------------------------------------------------
   FeedRow — one row of a feed list (Latest on the home page, the year groups
   on the Writing page): the date in the margin column, the title as a link,
   then one line that says where the item lives when it is not here ("On
   LinkedIn", the outlet) and the start of its description. External items
   open in a new tab and say so to screen readers.

   Server component, no motion. The styles live in Latest.module.css so both
   lists look the same.

   Props:
     item  FeedItem from src/lib/feed.ts
   --------------------------------------------------------------------------- */

import Link from "next/link";
import type { FeedItem } from "@/lib/feed";
import { formatDate } from "@/lib/format";
import { feedRowText } from "./feedText";
import styles from "./Latest.module.css";

export type FeedRowProps = {
  item: FeedItem;
};

export default function FeedRow({ item }: FeedRowProps) {
  const { title, source, excerpt } = feedRowText(item);

  return (
    <li className={styles.row}>
      <p className={`mono ${styles.date}`}>
        {item.date ? <time dateTime={item.date}>{formatDate(item.date)}</time> : null}
      </p>
      <div className={styles.body}>
        <h3 className={styles.title}>
          {item.external ? (
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {title}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <Link href={item.href}>{title}</Link>
          )}
        </h3>
        {source || excerpt ? (
          <p className={styles.excerpt}>
            {source ? <span className={styles.source}>{source}.</span> : null}
            {source && excerpt ? " " : null}
            {excerpt}
          </p>
        ) : null}
      </div>
    </li>
  );
}
