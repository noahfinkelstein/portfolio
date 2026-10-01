/* ---------------------------------------------------------------------------
   FEATURED — press and features about you (an article, an interview, a talk).
   They join blog posts and LinkedIn posts in the home page's "Latest" row.

   Adding one is one block:

     {
       title: "What the piece was called",
       date: "2026-05-01",                        // ISO date, YYYY-MM-DD
       description: "One or two sentences on what it covered.",
       href: "https://the-outlet.com/the-piece",
       image: "/images/featured/the-piece.jpg",   // optional, 16:9 works best
       source: "WPRI 12",                          // optional outlet name
     },

   Only real, published items. Nothing here is shown until you add it.
   (Pending: the WPRI Channel 12 interview — add it once the title, date and
   link are confirmed. A still is at public/images/photos/interview.jpg.)
   --------------------------------------------------------------------------- */

export type FeaturedItem = {
  title: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  description: string;
  href: string;
  image?: string;
  source?: string;
};

export const featured: FeaturedItem[] = [];
