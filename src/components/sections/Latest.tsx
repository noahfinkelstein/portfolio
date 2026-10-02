/* ---------------------------------------------------------------------------
   Latest — "Latest" on the home page: blog posts, LinkedIn posts and press
   in one static list, newest first. Each row (FeedRow) is the date in the
   margin column, the title as a link, and a one-line excerpt that says in
   words where the item lives when it is not here ("On LinkedIn", the
   outlet). Nothing moves, nothing loads from elsewhere.

   Server component. Fewer than LATEST_MIN_ITEMS items and the section is not
   rendered at all (one row alone reads as a mistake; the Writing page still
   lists everything). It appears by itself once there are enough, e.g. after
   `npm run linkedin -- add <url>`.

   Props:
     items      FeedItem[] from getFeed() in src/lib/feed.ts (the page passes it)
     title?     section heading (default: home.sections.latest)
     id?        section id (default "latest"; the heading gets "<id>-heading")
     minItems?  show the section only from this many items (default
                LATEST_MIN_ITEMS)
   --------------------------------------------------------------------------- */

import { home } from "@/content/home";
import type { FeedItem } from "@/lib/feed";
import SectionHeader from "./SectionHeader";
import FeedRow from "./FeedRow";
import styles from "./Latest.module.css";

/** Fewest items the home page's "Latest" list is shown with. */
export const LATEST_MIN_ITEMS = 3;

export type LatestProps = {
  items: FeedItem[];
  title?: string;
  id?: string;
  minItems?: number;
};

export default function Latest({
  items,
  title = home.sections.latest,
  id = "latest",
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
