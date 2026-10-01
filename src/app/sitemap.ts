/* ---------------------------------------------------------------------------
   /sitemap.xml — the site's pages plus every published post.
   Nothing to maintain: posts are read from content/blog/ at build time.
   --------------------------------------------------------------------------- */

import type { MetadataRoute } from "next";
import { site } from "@/content/site";
import { getAllPosts } from "@/lib/blog";

const pages = ["/", "/projects", "/blog", "/experience"];

export default function sitemap(): MetadataRoute.Sitemap {
  const pageEntries = pages.map((href) => ({
    url: href === "/" ? site.url : `${site.url}${href}`,
  }));

  const posts = getAllPosts().map((post) => ({
    url: `${site.url}/blog/${post.slug}`,
    lastModified: post.date ? new Date(post.date) : undefined,
  }));

  return [...pageEntries, ...posts];
}
