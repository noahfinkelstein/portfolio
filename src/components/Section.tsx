"use client";

/**
 * A reusable section wrapper used by every home-page section.
 * It provides: an anchor `id` (for nav links), a numbered "eyebrow" label,
 * a title, and a fade-up-on-scroll animation via Framer Motion.
 *
 * Usage:
 *   <Section id="projects" index="02" title="Projects">...children...</Section>
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Section({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string; // e.g. "01" — shown in the eyebrow
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className="container-col scroll-mt-24 py-20 sm:py-28">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
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
