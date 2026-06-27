/**
 * ============================================================================
 *  BLOG ENGINE  —  reads Markdown/MDX posts from /content/blog
 * ============================================================================
 *
 * You rarely edit this file. To WRITE a post, add a .mdx file in /content/blog.
 *
 * PIPELINE:
 *   1. getPostSlugs()     — list filenames → slugs
 *   2. getPost(slug)      — read file, parse frontmatter with gray-matter
 *   3. getAllPosts()      — all metadata, sorted newest first (blog index)
 *   4. formatDate()       — pretty-print ISO dates for display
 *
 * FRONTMATTER EXAMPLE (top of each .mdx file):
 *   ---
 *   title: My Post
 *   date: 2026-06-25
 *   summary: One-line teaser for the index page.
 *   tags: [code, math]
 *   ---
 */

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Absolute path to content/blog relative to project root
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string; // filename without extension (my-post.mdx → "my-post")
  title: string;
  date: string; // ISO date string from frontmatter
  summary: string;
  tags: string[];
};

export type Post = PostMeta & {
  content: string; // raw MDX body — rendered by MDXRemote on the post page
};

/** Returns slugs for all posts — used by generateStaticParams() for static builds */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

/** Load one post by slug — returns null if file doesn't exist */
export function getPost(slug: string): Post | null {
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const file = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
  // gray-matter splits YAML frontmatter from Markdown body
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ? String(data.date) : "",
    summary: data.summary ?? "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    content,
  };
}

/** All post metadata (no heavy content field), newest first */
export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => {
      const post = getPost(slug)!;
      const { content, ...meta } = post;
      void content; // discard body for list view
      return meta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // descending by date
}

/** "2026-06-25" → "Jun 25, 2026" */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso; // return raw string if unparseable
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
