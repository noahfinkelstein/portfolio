/* ---------------------------------------------------------------------------
   What a feed item shows on a card: title, description, kind label.
   Client-safe (no Node APIs), shared by the Latest cards and the Writing list.
   --------------------------------------------------------------------------- */

import type { FeedItem } from "@/lib/feed";
import { splitLinkedInText } from "@/content/linkedin";

export type FeedDisplay = {
  title: string;
  description: string;
  /** "Blog", "LinkedIn", or the outlet's name for press. */
  label: string;
};

export function feedDisplay(item: FeedItem): FeedDisplay {
  if (item.kind === "linkedin") {
    // Headline = the post's first sentence; the description continues after
    // it, so the two never repeat each other.
    const { headline, body } = splitLinkedInText(item.excerpt);
    return { title: headline, description: body, label: "LinkedIn" };
  }
  if (item.kind === "press") {
    return { title: item.title, description: item.excerpt, label: item.source || "Press" };
  }
  return { title: item.title, description: item.excerpt, label: "Blog" };
}
