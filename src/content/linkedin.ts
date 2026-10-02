/* ---------------------------------------------------------------------------
   LINKEDIN — your LinkedIn posts, shown on the Writing page (/blog) next to
   blog posts.

   The posts are cached in src/content/linkedin-posts.json so the site never
   calls LinkedIn at build or view time. Each entry:

     {
       "url":   "https://www.linkedin.com/posts/...-activity-7234567890123456789-abcd",
       "id":    "7234567890123456789",        // the number in the post's URN
       "date":  "2026-08-30",                 // ISO date, YYYY-MM-DD
       "text":  "The post text.",
       "image": "/linkedin/7234567890123456789.jpg"   // optional
     }

   Optional: "urn": "share" or "ugcPost" when `id` is not an activity id
   (posts imported from a LinkedIn data export can be). It picks the right
   embed URL. Leave it out for activity ids (the usual case).

   The easy way to add one (fetches the text, date and image for you):

     npm run linkedin -- add https://www.linkedin.com/posts/...
     npm run linkedin -- import ~/Downloads/Basic_LinkedInDataExport/Shares.csv

   See scripts/linkedin.mjs for every option. Hand-written entries work too;
   entries missing a url, id, date or text are skipped.
   --------------------------------------------------------------------------- */

import raw from "./linkedin-posts.json";

export type LinkedInUrnKind = "activity" | "share" | "ugcPost";

export type LinkedInPost = {
  url: string;
  id: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  text: string;
  /** Preview image: a local path under /linkedin/ (preferred) or a URL. */
  image?: string;
  /** Which URN `id` belongs to. Default "activity". */
  urn?: LinkedInUrnKind;
};

const URN_KINDS: readonly LinkedInUrnKind[] = ["activity", "share", "ugcPost"];

function isPost(value: unknown): value is LinkedInPost {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.url === "string" &&
    typeof v.id === "string" &&
    /^\d+$/.test(v.id) &&
    typeof v.date === "string" &&
    typeof v.text === "string" &&
    v.text.trim() !== "" &&
    (v.image === undefined || typeof v.image === "string") &&
    (v.urn === undefined || URN_KINDS.includes(v.urn as LinkedInUrnKind))
  );
}

/** Validated posts, newest first. */
export function loadLinkedInPosts(data: unknown = raw): LinkedInPost[] {
  if (!Array.isArray(data)) return [];
  return data
    .filter(isPost)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export const linkedinPosts: LinkedInPost[] = loadLinkedInPosts();

/**
 * Official embed URL for a post (the Writing page's "Show embed" button loads
 * it in an iframe on demand).
 */
export function linkedinEmbedUrl(post: Pick<LinkedInPost, "id" | "urn">): string {
  return `https://www.linkedin.com/embed/feed/update/urn:li:${post.urn ?? "activity"}:${post.id}`;
}

/**
 * Split a post's text into a short headline and the rest, for cards: the
 * first sentence of the first paragraph (if it is short enough) becomes the
 * headline, and the body continues after it, so the two never repeat.
 */
export function splitLinkedInText(text: string, maxHeadline = 110): { headline: string; body: string } {
  const clean = text.replace(/\r\n?/g, "\n").trim();
  const firstPara = clean.split(/\n\s*\n/)[0] ?? "";
  const firstLine = firstPara.split("\n")[0]?.trim() ?? "";
  // First sentence: up to . ! ? (or …) followed by a space or the end.
  const sentence = /^(.+?[.!?…]+)(?=\s|$)/.exec(firstLine)?.[1] ?? firstLine;

  if (sentence.length > 0 && sentence.length <= maxHeadline) {
    const body = clean.slice(clean.indexOf(sentence) + sentence.length).trim();
    return { headline: sentence, body };
  }

  // One long run-on sentence: cut at a word boundary and continue the body
  // from the same place.
  const cut = firstLine.slice(0, maxHeadline);
  const at = cut.lastIndexOf(" ") > maxHeadline / 2 ? cut.lastIndexOf(" ") : cut.length;
  return {
    headline: `${firstLine.slice(0, at).trim()}…`,
    body: `…${clean.slice(clean.indexOf(firstLine) + at).trim()}`,
  };
}
