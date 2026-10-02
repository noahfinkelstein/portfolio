/* ---------------------------------------------------------------------------
   FEED — blog posts, LinkedIn posts and press merged into one list, newest
   first, filtered by kind. The home page's "Writing" section asks for blog
   posts, the Writing page (/blog) for blog and LinkedIn posts, and the CV's
   "Press" section for press. Press items come from src/content/press.ts:
   the outlet becomes `source`, the note the excerpt.

   SERVER ONLY (it reads content/blog/ from disk). Call it in a server
   component and pass the result down: every FeedItem is plain serializable
   data, so it can cross into a client component as a prop.
   --------------------------------------------------------------------------- */

import "server-only";
import { getAllPosts } from "@/lib/blog";
import { linkedinPosts, linkedinEmbedUrl, splitLinkedInText } from "@/content/linkedin";
import { press } from "@/content/press";

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
};

export type FeedItem =
  | (FeedBase & { kind: "blog"; slug: string; tags: string[] })
  | (FeedBase & { kind: "linkedin"; id: string; embedUrl: string })
  | (FeedBase & { kind: "press"; source: string });

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
        embedUrl: linkedinEmbedUrl(post),
      });
    }
  }

  if (kinds.has("press")) {
    for (const item of press) {
      items.push({
        kind: "press",
        key: `press:${item.url}`,
        date: item.date,
        title: item.title,
        excerpt: item.note ?? "",
        href: item.url,
        external: true,
        source: item.outlet,
      });
    }
  }

  items.sort((a, b) => (b.date || "0").localeCompare(a.date || "0") || a.key.localeCompare(b.key));
  return options.limit ? items.slice(0, options.limit) : items;
}
