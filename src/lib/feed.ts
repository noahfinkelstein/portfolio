/* ---------------------------------------------------------------------------
   FEED — blog posts, LinkedIn posts and press merged into one list, newest
   first. Used by "Latest" on the home page and by the Writing page (/blog).

   SERVER ONLY (it reads content/blog/ from disk). Call it in a server
   component and pass the result down: every FeedItem is plain serializable
   data, so it can cross into a client component as a prop.
   --------------------------------------------------------------------------- */

import "server-only";
import { getAllPosts } from "@/lib/blog";
import { linkedinPosts, linkedinEmbedUrl, splitLinkedInText } from "@/content/linkedin";
import { featured } from "@/content/featured";

type FeedBase = {
  /** Stable key: "blog:<slug>", "linkedin:<id>", "press:<href>". */
  key: string;
  /** ISO date, YYYY-MM-DD (may be "" if unknown; those sort last). */
  date: string;
  title: string;
  /** One or two sentences; for LinkedIn, the post text (clamp it in CSS). */
  excerpt: string;
  href: string;
  /** Internal link (Next <Link>) vs external (opens in a new tab). */
  external: boolean;
  image?: string;
};

export type FeedItem =
  | (FeedBase & { kind: "blog"; slug: string; tags: string[] })
  | (FeedBase & { kind: "linkedin"; id: string; embedUrl: string })
  | (FeedBase & { kind: "press"; source?: string });

export type FeedKind = FeedItem["kind"];

export function getFeed(options: { kinds?: FeedKind[]; limit?: number } = {}): FeedItem[] {
  const kinds = new Set<FeedKind>(options.kinds ?? ["blog", "linkedin", "press"]);
  const items: FeedItem[] = [];

  if (kinds.has("blog")) {
    for (const post of getAllPosts()) {
      items.push({
        kind: "blog",
        key: `blog:${post.slug}`,
        slug: post.slug,
        date: post.date,
        title: post.title,
        excerpt: post.summary,
        href: `/blog/${post.slug}`,
        external: false,
        tags: post.tags,
      });
    }
  }

  if (kinds.has("linkedin")) {
    for (const post of linkedinPosts) {
      items.push({
        kind: "linkedin",
        key: `linkedin:${post.id}`,
        id: post.id,
        date: post.date,
        title: splitLinkedInText(post.text).headline,
        excerpt: post.text,
        href: post.url,
        external: true,
        image: post.image,
        embedUrl: linkedinEmbedUrl(post),
      });
    }
  }

  if (kinds.has("press")) {
    for (const item of featured) {
      items.push({
        kind: "press",
        key: `press:${item.href}`,
        date: item.date,
        title: item.title,
        excerpt: item.description,
        href: item.href,
        external: true,
        image: item.image,
        source: item.source,
      });
    }
  }

  items.sort((a, b) => (b.date || "0").localeCompare(a.date || "0") || a.key.localeCompare(b.key));
  return options.limit ? items.slice(0, options.limit) : items;
}
