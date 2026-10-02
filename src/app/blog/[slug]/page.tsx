/* ---------------------------------------------------------------------------
   BLOG POST — "/blog/<slug>"

   Renders one Markdown file from content/blog/: a header with the date line
   (and tags) in the mono, the title and the summary, then the prose at
   reading width, and a plain link back to all writing. Every post is built
   at build time; an unknown slug is a static 404 (dynamicParams = false).
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getPost, getPostSlugs } from "@/lib/blog";
import { formatDate } from "@/lib/format";
import styles from "./post.module.css";

/** Only the slugs from generateStaticParams exist; anything else is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

// In Next 15 route params arrive as a Promise, so both functions await them.
type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.summary };
}

export default async function PostPage({ params }: { params: Params }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className={`container ${styles.article}`}>
      <header className={styles.header}>
        <div className={`mono ${styles.meta}`}>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {post.tags.length > 0 ? (
            <ul role="list" className={styles.tags} aria-label="Tags">
              {post.tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          ) : null}
        </div>
        <h1 className={styles.title}>{post.title}</h1>
        {post.summary ? <p className={styles.summary}>{post.summary}</p> : null}
      </header>
      <div className={styles.prose}>
        <MDXRemote source={post.content} />
      </div>
      <p className={styles.back}>
        <Link href="/blog">All writing</Link>
      </p>
    </article>
  );
}
