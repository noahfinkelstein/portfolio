/* ---------------------------------------------------------------------------
   feedText — what a feed item says in a list row: the title, where it lives
   said in words ("On LinkedIn", the press outlet; nothing for a blog post),
   and a one-line excerpt. Shared by Latest (the home page's "Writing") and
   WritingList (/blog) through FeedRow. Plain functions, no Node APIs.
   --------------------------------------------------------------------------- */

import type { FeedItem } from "@/lib/feed";
import { splitLinkedInText } from "@/content/linkedin";

export type FeedRowText = {
  title: string;
  /** Where the item lives, in words, or "" for a blog post. */
  source: string;
  /** The first line of the description, cut at a word (see oneLine). */
  excerpt: string;
};

/** Longest excerpt a row carries; CSS keeps it to one visual line. */
export const EXCERPT_MAX = 160;

/** The first non-empty line of `text`, cut at a word boundary with an ellipsis. */
export function oneLine(text: string, max = EXCERPT_MAX): string {
  const line =
    text
      .replace(/\r\n?/g, "\n")
      .split("\n")
      .map((l) => l.trim())
      .find((l) => l.length > 0) ?? "";
  if (line.length <= max) return line;
  const cut = line.slice(0, max);
  const at = cut.lastIndexOf(" ");
  return `${cut.slice(0, at > max / 2 ? at : max).trimEnd()}…`;
}

export function feedRowText(item: FeedItem): FeedRowText {
  if (item.kind === "linkedin") {
    // The title is the post's first sentence (set in src/lib/feed.ts); the
    // excerpt continues after it, so the two never repeat each other.
    const { body } = splitLinkedInText(item.excerpt);
    return { title: item.title, source: "On LinkedIn", excerpt: oneLine(body) };
  }
  if (item.kind === "press") {
    return { title: item.title, source: item.source, excerpt: oneLine(item.excerpt) };
  }
  return { title: item.title, source: "", excerpt: oneLine(item.excerpt) };
}
