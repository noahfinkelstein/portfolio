/* ---------------------------------------------------------------------------
   WRITING — "/blog"

   Blog posts (content/blog/*.mdx) and LinkedIn posts
   (src/content/linkedin-posts.json) in one list, newest first, grouped by
   year. Add a post file or a LinkedIn entry (npm run linkedin -- add <url>)
   and it shows up here. The list itself is src/components/sections/WritingList.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import PageTitle from "@/components/layout/PageTitle";
import WritingList from "@/components/sections/WritingList";
import { getFeed } from "@/lib/feed";
import { getIcon } from "@/lib/icons";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Writing",
  description: "Writing on mathematics, machine learning, and things I built — blog and LinkedIn posts.",
};

export default function WritingPage() {
  const items = getFeed({ kinds: ["blog", "linkedin"] });
  const hasLinkedIn = items.some((item) => item.kind === "linkedin");
  const linkedinIcon = hasLinkedIn ? getIcon("linkedin").path : undefined;

  return (
    <>
      {/* The LinkedIn half of the lede appears with the first LinkedIn post. */}
      <PageTitle title="Writing" lede={hasLinkedIn ? "Blog posts, and what I post on LinkedIn." : "Blog posts."} />
      <div className={styles.wrap}>
        <WritingList items={items} linkedinIcon={linkedinIcon} />
      </div>
    </>
  );
}
