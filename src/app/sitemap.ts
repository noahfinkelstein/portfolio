/* ---------------------------------------------------------------------------
   /sitemap.xml — the site's pages plus every published post.
   Nothing to maintain: posts are read from content/blog/ at build time.
   /blog is listed only while there are posts, the same rule that shows
   "Writing" in the running head (layout.tsx).
   --------------------------------------------------------------------------- */

import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getAllPosts, getPostSlugs } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const hasWriting = getPostSlugs().length > 0;
  const pages = ["/", "/projects", ...(hasWriting ? ["/blog"] : []), "/cv"];
  const pageEntries = pages.map((href) => ({
    url: href === "/" ? site.url : `${site.url}${href}`,
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : undefined,
  }));

  return [...pageEntries, ...posts];
}
