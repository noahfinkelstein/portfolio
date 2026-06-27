"use client";

/**
 * ============================================================================
 *  SECTION  —  reusable wrapper for every home-page section.
 * ============================================================================
 *
 * Provides consistent structure across About, Projects, Experience, etc.:
 *   - `id`          → anchor target for nav hash links (/#projects)
 *   - eyebrow       → "02 / Projects" label (uses .eyebrow from globals.css)
 *   - title         → large section heading
 *   - fade-up animation when scrolled into view (Framer Motion)
 *
 * Usage:
 *   <Section id="projects" index="02" title="Projects">
 *     ...your section content...
 *   </Section>
 *
 * "use client" required for Framer Motion's whileInView animation hooks.
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Section({
  id,
  index,
  title,
  children,
}: {
  id: string; // HTML id attribute — must match nav href after # (e.g. "projects")
  index: string; // two-digit section number shown in eyebrow (e.g. "01")
  title: string; // section name — shown in eyebrow and h2
  children: ReactNode; // section body (grids, cards, timelines, etc.)
}) {
  return (
    <section
      id={id}
      className="container-col scroll-mt-24 py-24 sm:py-32"
      // scroll-mt-24 offsets scroll position so title isn't under sticky nav
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }} // start invisible, slightly below
        whileInView={{ opacity: 1, y: 0 }} // animate when entering viewport
        viewport={{ once: true, margin: "-80px" }} // trigger slightly before fully visible; animate once
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-10">
          <p className="eyebrow">
            {index} / {title}
          </p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h2>
        </div>
        {children}
      </motion.div>
    </section>
  );
}
