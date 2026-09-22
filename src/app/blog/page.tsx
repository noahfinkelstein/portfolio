/* ---------------------------------------------------------------------------
   BLOG INDEX  —  "/blog"
   Posts are Markdown files in content/blog/. Add one and it shows up here.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import Link from "next/link";
import Page from "@/components/Page";
import Record from "@/components/Record";
import { getAllPosts, formatDate } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing on mathematics, machine learning, and things I built.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <Page title="Blog" current="/blog">
      {posts.length === 0 ? (
        <p>Nothing here yet.</p>
      ) : (
        posts.map((post) => (
          <Record key={post.slug} date={formatDate(post.date)}>
            <h2 className="record__title">
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </h2>
            {post.summary ? <p>{post.summary}</p> : null}
          </Record>
        ))
      )}
    </Page>
  );
}
