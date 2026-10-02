/* ---------------------------------------------------------------------------
   Latest — a feed list as a home-page section: a SectionHeader over rows,
   newest first. The home page uses it for "Writing" and passes blog posts
   only. Each row (FeedRow) is the date in the margin column, the title as a
   link, and a one-line excerpt that says in words where the item lives when
   it is not here ("On LinkedIn", the outlet). Nothing moves, nothing loads
   from elsewhere.

   Server component. With fewer than `minItems` items (or none) the section
   is not rendered at all; the Writing page (/blog) still lists everything.

   Props:
     items      FeedItem[] from getFeed() in src/lib/feed.ts (the page passes it)
     title?     section heading (default "Writing")
     id?        section id (default "writing"; the heading gets "<id>-heading")
     minItems?  show the section only from this many items (default
                LATEST_MIN_ITEMS)
   --------------------------------------------------------------------------- */

import type { FeedItem } from "@/lib/feed";
import SectionHeader from "./SectionHeader";
import FeedRow from "./FeedRow";
import styles from "./Latest.module.css";

/** Fewest items the section is shown with when the page does not say. */
export const LATEST_MIN_ITEMS = 3;

export type LatestProps = {
  items: FeedItem[];
  title?: string;
  id?: string;
  minItems?: number;
};

export default function Latest({
  items,
  title = "Writing",
  id = "writing",
  minItems = LATEST_MIN_ITEMS,
}: LatestProps) {
  if (items.length === 0 || items.length < minItems) return null;

  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-heading`}>
      <SectionHeader text={title} id={`${id}-heading`} />
      <div className="container">
        <ol role="list" className={styles.list}>
          {items.map((item) => (
            <FeedRow key={item.key} item={item} />
          ))}
        </ol>
      </div>
    </section>
  );
}
