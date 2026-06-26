/**
 * ============================================================================
 *  BLOG ENGINE  —  reads your Markdown posts from /content/blog
 * ============================================================================
 *
 * You should rarely need to touch this. To WRITE a post, just add a new
 * `.mdx` file in /content/blog (see the example posts there). This file is
 * the plumbing that turns those files into pages.
 *
 * Each post is an `.mdx` file with "frontmatter" at the top:
 *
 *   ---
 *   title: My First Post
 *   date: 2026-06-25
 *   summary: A one-line description shown in the post list.
 *   tags: [life, code]
 *   ---
 *
 *   Your post content here, in Markdown...
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

// Folder where your posts live.
const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string; // derived from the filename (my-post.mdx -> "my-post")
  title: string;
  date: string; // ISO string, e.g. "2026-06-25"
  summary: string;
  tags: string[];
};

export type Post = PostMeta & {
  content: string; // raw MDX body (rendered on the post page)
};

/** Returns the slugs of all posts (used to pre-generate pages). */
export function getPostSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs
    .readdirSync(BLOG_DIR)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.mdx?$/, ""));
}

/** Reads one post (frontmatter + content) by slug. */
export function getPost(slug: string): Post | null {
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`);
  const mdPath = path.join(BLOG_DIR, `${slug}.md`);
  const file = fs.existsSync(mdxPath) ? mdxPath : mdPath;
  if (!fs.existsSync(file)) return null;

  const raw = fs.readFileSync(file, "utf8");
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

/** Returns all posts, newest first — used for the blog index. */
export function getAllPosts(): PostMeta[] {
  return getPostSlugs()
    .map((slug) => {
      const post = getPost(slug)!;
      // Drop the heavy `content` field for the list view.
      const { content, ...meta } = post;
      void content;
      return meta;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** Formats an ISO date like "2026-06-25" into "Jun 25, 2026". */
export function formatDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
