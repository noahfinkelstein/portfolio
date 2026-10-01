/* ---------------------------------------------------------------------------
   Latest — "Latest" on the home page: cards
   for blog posts, LinkedIn posts and press, newest first.

   Server component: it resolves the LinkedIn mark from src/lib/icons.ts and
   hands plain data to the client row. Import it from server components only
   (pages, other server components).

   Behaviour (see LatestRow.tsx):
     - fewer than 4 real items, reduced motion, or cards that already fit:
       a static row (centered, or swipe/drag to scroll on small screens)
     - 4+ items that overflow: a marquee (one set per 20 s, linear, pausing on
       hover/focus/drag, draggable, offscreen- and hidden-tab-aware)
     - fewer than LATEST_MIN_ITEMS items: the section is not rendered at
       all (one card alone in a wide row reads as a mistake; the Writing
       page still lists everything). It appears by itself once there are
       enough, e.g. after `npm run linkedin -- add <url>`.
     - slides up on ScrollTrigger; the header slides out of its mask

   Props:
     items   FeedItem[] from getFeed() in src/lib/feed.ts (the page passes it)
     title?  section header text (default: home.sections.latest)
     id?     section id (default "latest"; the heading gets "<id>-heading")
     minItems?  show the section only from this many items (default
                LATEST_MIN_ITEMS)
   --------------------------------------------------------------------------- */

import { home } from "@/content/home";
import type { FeedItem } from "@/lib/feed";
import { getIcon } from "@/lib/icons";
import SectionHeader from "./SectionHeader";
import LatestRow from "./LatestRow";
import styles from "./Latest.module.css";

/** Fewest items the home page's "Latest" row is shown with. */
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
  const linkedinIcon = items.some((item) => item.kind === "linkedin") ? getIcon("linkedin").path : undefined;

  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-heading`}>
      <SectionHeader text={title} id={`${id}-heading`} />
      <LatestRow items={items} linkedinIcon={linkedinIcon} />
    </section>
  );
}
