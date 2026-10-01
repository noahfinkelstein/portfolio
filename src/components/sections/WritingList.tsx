"use client";

/* ---------------------------------------------------------------------------
   WritingList — the Writing page (/blog): blog posts and LinkedIn posts in
   one list, newest first, grouped by year.

   Each entry: a 16:9 picture (the post's image or the typographic FeedTile),
   the date and a kind badge, the title in heavy caps, an excerpt, and
   actions. Blog posts link to the post. LinkedIn posts link to the original
   and have a "Show embed" button that loads LinkedIn's official embed in an
   iframe only when asked (nothing is requested from linkedin.com before).

   A filter (All / Blog / LinkedIn) appears once both kinds exist. Without
   JavaScript the full list still renders.

   Props:
     items         FeedItem[] (the page passes getFeed({kinds:["blog","linkedin"]}))
     linkedinIcon? 24×24 path for the LinkedIn mark
   --------------------------------------------------------------------------- */

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import type { FeedItem, FeedKind } from "@/lib/feed";
import { formatDate } from "@/lib/format";
import { feedDisplay } from "./feedText";
import FeedTile from "./FeedTile";
import KindBadge from "./KindBadge";
import styles from "./WritingList.module.css";

export type WritingListProps = {
  items: FeedItem[];
  linkedinIcon?: string;
};

type Filter = "all" | FeedKind;

const FILTER_LABELS: Record<FeedKind, string> = { blog: "Blog", linkedin: "LinkedIn", press: "Press" };

/**
 * Height for LinkedIn's embed iframe, which cannot size itself: the embed
 * shows the whole post text (about 55 characters a line at 504px, 21px
 * lines) between a ~110px header and a ~80px footer, plus the image.
 */
function embedHeight(item: FeedItem): number {
  const lines = item.excerpt
    .split("\n")
    .reduce((n, line) => n + Math.max(1, Math.ceil(line.length / 55)), 0);
  const height = 190 + lines * 21 + (item.image ? 400 : 0);
  return Math.max(280, Math.min(1200, height));
}

export default function WritingList({ items, linkedinIcon }: WritingListProps) {
  const [filter, setFilter] = useState<Filter>("all");

  const counts = useMemo(() => {
    const c: Partial<Record<FeedKind, number>> = {};
    for (const item of items) c[item.kind] = (c[item.kind] ?? 0) + 1;
    return c;
  }, [items]);
  const kinds = (Object.keys(counts) as FeedKind[]).sort();
  const showFilter = kinds.length > 1;

  const groups = useMemo(() => {
    const visible = filter === "all" ? items : items.filter((item) => item.kind === filter);
    const byYear = new Map<string, FeedItem[]>();
    for (const item of visible) {
      const year = item.date ? item.date.slice(0, 4) : "Undated";
      const list = byYear.get(year);
      if (list) list.push(item);
      else byYear.set(year, [item]);
    }
    return Array.from(byYear.entries());
  }, [items, filter]);

  if (items.length === 0) {
    return <p className={styles.empty}>Nothing here yet.</p>;
  }

  return (
    <div className={styles.root}>
      {showFilter ? (
        <div className={styles.filters} role="group" aria-label="Show">
          {(["all", ...kinds] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              className={styles.filter}
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
            >
              {f === "all" ? "All" : FILTER_LABELS[f]}
              <span className={styles.count}>{f === "all" ? items.length : counts[f]}</span>
            </button>
          ))}
        </div>
      ) : null}

      {groups.map(([year, list]) => (
        <section key={year} className={styles.year} aria-labelledby={`year-${year}`}>
          <h2 id={`year-${year}`} className={styles.yearHeading}>
            <span className={styles.yearText}>{year}</span>
            <span className={styles.yearRule} aria-hidden="true" />
          </h2>
          <ol role="list" className={styles.list}>
            {list.map((item) => (
              <Entry key={item.key} item={item} linkedinIcon={linkedinIcon} />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}

function Entry({ item, linkedinIcon }: { item: FeedItem; linkedinIcon?: string }) {
  const { title, description, label } = feedDisplay(item);
  const icon = item.kind === "linkedin" ? linkedinIcon : undefined;
  const [embed, setEmbed] = useState(false);
  const frameId = useId();

  const titleLink = item.external ? (
    <a href={item.href} target="_blank" rel="noopener noreferrer">
      {title}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  ) : (
    <Link href={item.href}>{title}</Link>
  );

  return (
    <li className={styles.entry} data-card="">
      <article className={styles.card}>
        <div className={styles.thumb}>
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={styles.img} src={item.image} alt="" loading="lazy" decoding="async" />
          ) : (
            <FeedTile text={title} label={label} icon={icon} />
          )}
        </div>

        <div className={styles.content}>
          <p className={styles.meta}>
            {item.date ? <time dateTime={item.date}>{formatDate(item.date)}</time> : null}
            <KindBadge kind={item.kind} label={label} icon={icon} />
          </p>
          <h3 className={styles.title}>{titleLink}</h3>
          {description ? <p className={styles.excerpt}>{description}</p> : null}
          {item.kind === "blog" && item.tags.length > 0 ? (
            <ul role="list" className={styles.tags} aria-label="Tags">
              {item.tags.map((tag) => (
                <li key={tag}>#{tag}</li>
              ))}
            </ul>
          ) : null}

          <div className={styles.actions}>
            {item.kind === "linkedin" ? (
              <>
                <a className={styles.action} href={item.href} target="_blank" rel="noopener noreferrer">
                  View on LinkedIn
                  <span aria-hidden="true" className={styles.arrow}>
                    ↗
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
                <button
                  type="button"
                  className={`${styles.action} ${styles.ghost}`}
                  aria-expanded={embed}
                  aria-controls={frameId}
                  title="Loads the post from linkedin.com"
                  onClick={() => setEmbed((v) => !v)}
                >
                  {embed ? "Hide embed" : "Show embed"}
                  <span aria-hidden="true" className={`${styles.chev} ${embed ? styles.chevOpen : ""}`}>
                    ▾
                  </span>
                </button>
              </>
            ) : item.external ? (
              <a className={styles.action} href={item.href} target="_blank" rel="noopener noreferrer">
                Read it
                <span aria-hidden="true" className={styles.arrow}>
                  ↗
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <Link className={styles.action} href={item.href}>
                Read the post
                <span aria-hidden="true" className={styles.arrow}>
                  →
                </span>
              </Link>
            )}
          </div>

          {item.kind === "linkedin" ? (
            <div id={frameId} className={styles.embed} hidden={!embed}>
              {embed ? (
                <iframe
                  className={styles.frame}
                  src={item.embedUrl}
                  title={`LinkedIn post: ${title}`}
                  width={504}
                  height={embedHeight(item)}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              ) : null}
            </div>
          ) : null}
        </div>
      </article>
    </li>
  );
}
