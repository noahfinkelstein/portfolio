"use client";

/**
 * ============================================================================
 *  HERO  —  the first viewport visitors see.
 * ============================================================================
 *
 * LAYERS (stacked with z-index):
 *   z-0  → HeroBackground (3D object / physics / particles — see HeroBackground.tsx)
 *   z-10 → text, buttons, scroll cue (this file)
 *
 * CONTENT SOURCES:
 *   site.role, site.name, site.heroTagline, site.heroRotatingWords → site.config.ts
 *
 * ANIMATIONS:
 *   Framer Motion fades each block in on load. The rotating "I do ___" line
 *   uses AnimatePresence to cross-fade between words every 2.2 seconds.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { site } from "@/config/site.config";
import HeroBackground from "@/components/HeroBackground";
import { Icon } from "@/components/icons";

export default function Hero() {
  const words = site.heroRotatingWords;
  const [i, setI] = useState(0); // index of the currently displayed rotating word

  // Cycle through heroRotatingWords every 2.2s
  useEffect(() => {
    if (words.length <= 1) return; // nothing to rotate
    const t = setInterval(() => setI((p) => (p + 1) % words.length), 2200);
    return () => clearInterval(t); // cleanup on unmount
  }, [words.length]);

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden">
      {/* Full-bleed animated background — switch type in HeroBackground.tsx */}
      <HeroBackground />

      {/* Foreground — container-col aligns text with nav and sections below */}
      <div className="container-col relative z-10">
        <motion.p
          className="eyebrow mb-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {site.role}
        </motion.p>

        <motion.h1
          className="font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
        >
          Hi, I&apos;m {site.name.split(" ")[0]}.
        </motion.h1>

        {/* "I do [rotating word]" — min-w-[12ch] prevents layout jump between words */}
        <div className="mt-4 flex items-center gap-3 text-2xl sm:text-3xl">
          <span className="text-fg-muted">I do</span>
          <span className="relative inline-block min-w-[12ch] font-display font-semibold text-accent">
            <AnimatePresence mode="wait">
              {/* key={words[i]} forces AnimatePresence to run exit + enter animations */}
              <motion.span
                key={words[i]}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="inline-block"
              >
                {words[i]}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <motion.p
          className="mt-7 max-w-2xl text-lg leading-relaxed text-fg-muted"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {site.heroTagline}
        </motion.p>

        {/* Primary CTA (accent fill) + secondary CTA (outline) */}
        <motion.div
          className="mt-9 flex flex-wrap items-center gap-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
        >
          <Link
            href="/#projects"
            className="rounded-full bg-accent px-6 py-3 font-medium text-bg transition-transform hover:scale-[1.03]"
          >
            See my work
          </Link>
          <Link
            href="/#contact"
            className="rounded-full border border-border px-6 py-3 font-medium text-fg transition-colors hover:bg-bg-soft"
          >
            Get in touch
          </Link>
        </motion.div>
      </div>

      {/* Bouncing down-arrow — links to #about (first section after hero) */}
      <a
        href="/#about"
        aria-label="Scroll to about"
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-fg-muted"
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          className="block"
        >
          <Icon name="arrowDown" />
        </motion.span>
      </a>
    </section>
  );
}
