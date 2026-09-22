/* ---------------------------------------------------------------------------
   /sitemap.xml — every page in the nav plus every published post.
   Nothing to maintain: it reads site.ts and content/blog/ at build time.
   --------------------------------------------------------------------------- */

import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getAllPosts } from "@/lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = site.nav.map((item) => ({
    url: item.href === "/" ? site.url : `${site.url}${item.href}`,
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : undefined,
  }));

  return [...pages, ...posts];
}
