import type { Metadata } from "next";
import PageTitle from "@/components/layout/PageTitle";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  description: "That address does not exist on noahfinkelstein.com.",
  // The layout's canonical ("./") would resolve to /_not-found here.
  alternates: { canonical: null },
};

export default function NotFound() {
  return (
    <div className={styles.root}>
      <p className={styles.code} aria-hidden="true">
        404
      </p>
      <PageTitle title="Page not found" size="lg" lede="That address does not exist." />
      <p className={styles.home}>
        {/* A plain <a>, not next/link: this root not-found boundary is part of
            every route's tree, and a client Link here pulled the home page's
            chunk group (GSAP, ScrollTrigger) into /blog and /experience. */}
        <a href="/">← Back to the home page</a>
      </p>
    </div>
  );
}
