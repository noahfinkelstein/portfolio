/* ---------------------------------------------------------------------------
   BLOG POST  —  "/blog/<slug>"
   Renders one Markdown file from content/blog/.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import Page from "@/components/Page";
import { getPost, getPostSlugs, formatDate } from "@/lib/blog";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

// In Next 15 route params arrive as a Promise, so both functions await them.
type Params = Promise<{ slug: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
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
    <Page current="/blog">
      <article>
        <h1 className="page-title page-title--tight">{post.title}</h1>
        <p className="page-lede">
          {formatDate(post.date)}
          {post.tags.length > 0 ? ` · ${post.tags.join(", ")}` : null}
        </p>
        <div className="prose">
          <MDXRemote source={post.content} />
        </div>
      </article>
      <p className="section__more section__more--flush">
        <Link href="/blog">← All posts</Link>
      </p>
    </Page>
  );
}
