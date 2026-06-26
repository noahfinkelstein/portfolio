/**
 * SINGLE BLOG POST (/blog/[slug]) — renders one MDX file as a page.
 *
 * MDX = Markdown + the ability to use React components inside your posts.
 * The `prose` classes (from @tailwindcss/typography) style the article text.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPost, getPostSlugs, formatDate } from "@/lib/blog";

// Pre-generate a static page for every post at build time (fast + SEO-friendly).
export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

// Per-post browser tab title + description.
export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const post = getPost(params.slug);
  if (!post) return {};
  return { title: post.title, description: post.summary };
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <>
      <Nav />
      <main className="container-col max-w-3xl py-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="font-mono text-sm text-fg-muted hover:text-accent"
        >
          ← all posts
        </Link>

        {/* Post header */}
        <header className="mt-6">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {post.title}
          </h1>
          <div className="mt-3 flex items-center gap-3 font-mono text-xs text-fg-muted">
            <time>{formatDate(post.date)}</time>
            {post.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        </header>

        {/* Post body — `prose` styles the Markdown; `prose-invert` makes it
            readable on the dark theme. The `prose-a:text-accent` etc. tie the
            article styling to your theme color. */}
        <article className="prose prose-invert mt-10 max-w-none prose-headings:font-display prose-a:text-accent prose-code:text-accent prose-code:before:content-none prose-code:after:content-none">
          <MDXRemote source={post.content} />
        </article>
      </main>
      <Footer />
    </>
  );
}
