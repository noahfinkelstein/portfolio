/* ---------------------------------------------------------------------------
   NOT FOUND — the 404 page for every route: the title, one line, and a
   plain link home. Left aligned like every other page; no big number.
   --------------------------------------------------------------------------- */

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
      <PageTitle title="Page not found" lede="That address does not exist." />
      <div className="container">
        <p className={styles.home}>
          {/* A plain <a>, not next/link: this root not-found boundary is part of
              every route's tree, and a client Link here pulled the home page's
              chunk group (three.js) into /blog and /cv. */}
          <a href="/">Back to the home page</a>
        </p>
      </div>
    </div>
  );
}
