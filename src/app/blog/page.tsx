/**
 * ============================================================================
 *  BLOG INDEX  —  /blog lists all posts, newest first.
 * ============================================================================
 *
 * Server Component — reads posts at build/request time via lib/blog.ts.
 * Posts live as .mdx files in /content/blog/.
 */

import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getAllPosts, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on code, math, physics, and whatever I'm thinking about.",
};

export default function BlogIndex() {
  const posts = getAllPosts();

  return (
    <>
      <Nav />
      <main className="container-col py-16">
        <p className="eyebrow">Writing</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Blog
        </h1>
        <p className="mt-4 max-w-xl text-fg-muted">
          Notes on things I&apos;m building, learning, and thinking about.
        </p>

        {/* Divided list — each row is a Link to /blog/[slug] */}
        <div className="mt-12 divide-y divide-border border-t border-border">
          {posts.length === 0 && (
            <p className="py-10 text-fg-muted">
              No posts yet — add an <code>.mdx</code> file in{" "}
              <code>/content/blog</code>.
            </p>
          )}

          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group flex flex-col gap-2 py-7 transition-colors sm:flex-row sm:items-baseline sm:justify-between"
            >
              <div className="max-w-2xl">
                <h2 className="font-display text-xl font-semibold transition-colors group-hover:text-accent">
                  {post.title}
                </h2>
                {post.summary && (
                  <p className="mt-1.5 text-fg-muted">{post.summary}</p>
                )}
                {post.tags.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {post.tags.map((t) => (
                      <li
                        key={t}
                        className="rounded-full bg-bg-softer px-2.5 py-0.5 font-mono text-[11px] text-fg-muted"
                      >
                        #{t}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <time className="shrink-0 font-mono text-xs text-fg-muted">
                {formatDate(post.date)}
              </time>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
