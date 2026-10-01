/* ---------------------------------------------------------------------------
   FeedCard — one card in "Latest": a 16:9
   picture (the item's image, or the typographic FeedTile), the title in
   heavy caps (two lines at most), the date in the accent color with a kind
   badge, and a four-line description. Hover or keyboard focus lifts it, adds
   an accent glow and zooms the picture.

   The whole card is clickable through the title link (a stretched ::after),
   so the link's accessible name stays just the title.

   Props:
     item          FeedItem (from src/lib/feed.ts; plain data)
     linkedinIcon? 24×24 path for the LinkedIn mark
     headingLevel? "h3" (default) or "h2"
   --------------------------------------------------------------------------- */

import Link from "next/link";
import type { FeedItem } from "@/lib/feed";
import { formatDate } from "@/lib/format";
import { feedDisplay } from "./feedText";
import FeedTile from "./FeedTile";
import KindBadge from "./KindBadge";
import styles from "./FeedCard.module.css";

export type FeedCardProps = {
  item: FeedItem;
  linkedinIcon?: string;
  headingLevel?: "h2" | "h3";
};

export default function FeedCard({ item, linkedinIcon, headingLevel = "h3" }: FeedCardProps) {
  const Heading = headingLevel;
  const { title, description, label } = feedDisplay(item);
  const icon = item.kind === "linkedin" ? linkedinIcon : undefined;

  const linkContent = (
    <>
      {title}
      {item.external ? <span className="sr-only"> (opens in a new tab)</span> : null}
    </>
  );

  return (
    <article className={styles.card} data-card="">
      <div className={styles.media}>
        {item.image ? (
          // A plain <img>: LinkedIn thumbnails and press images can be remote,
          // and next/image would need every host allow-listed.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={styles.img}
            src={item.image}
            alt=""
            loading="lazy"
            decoding="async"
            draggable={false}
          />
        ) : (
          <FeedTile text={title} label={label} icon={icon} />
        )}
      </div>
      <div className={styles.body}>
        <div className={styles.header}>
          <Heading className={styles.title}>
            {item.external ? (
              <a className={styles.link} href={item.href} target="_blank" rel="noopener noreferrer" draggable={false}>
                {linkContent}
              </a>
            ) : (
              <Link className={styles.link} href={item.href} draggable={false}>
                {linkContent}
              </Link>
            )}
          </Heading>
          <p className={styles.meta}>
            {item.date ? <time dateTime={item.date}>{formatDate(item.date)}</time> : null}
            <KindBadge kind={item.kind} label={label} icon={icon} />
            {item.external ? (
              <svg className={styles.out} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M5 3h8v8M13 3 3 13" fill="none" stroke="currentColor" strokeWidth="1.6" />
              </svg>
            ) : null}
          </p>
        </div>
        {description ? <p className={styles.desc}>{description}</p> : null}
      </div>
    </article>
  );
}
