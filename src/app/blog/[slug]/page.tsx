/**
 * ============================================================================
 *  SINGLE BLOG POST  —  /blog/[slug] renders one MDX file as a page.
 * ============================================================================
 *
 * Dynamic route: [slug] matches the filename in /content/blog (without .mdx).
 * Example: content/blog/on-problem-solving.mdx → /blog/on-problem-solving
 *
 * MDX = Markdown + optional React components in post body.
 * `prose` classes (from @tailwindcss/typography) style the article text.
 */

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { getPost, getPostSlugs, formatDate } from "@/lib/blog";

/** Pre-build static HTML for every post at build time (fast + SEO-friendly) */
export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

/** Per-post <title> and meta description from frontmatter */
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
  if (!post) notFound(); // triggers Next.js 404 page

  return (
    <>
      <Nav />
      {/* max-w-3xl narrows article text for comfortable reading width */}
      <main className="container-col max-w-3xl py-16">
        <Link
          href="/blog"
          className="font-mono text-sm text-fg-muted hover:text-accent"
        >
          ← all posts
        </Link>

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

        {/* prose-invert = light text on dark bg; prose-headings:font-display ties
            headings to your display font; accent colors on links and code */}
        <article className="prose prose-invert mt-10 max-w-none prose-headings:font-display prose-a:text-accent prose-code:text-accent prose-code:before:content-none prose-code:after:content-none">
          <MDXRemote source={post.content} />
        </article>
      </main>
      <Footer />
    </>
  );
}
