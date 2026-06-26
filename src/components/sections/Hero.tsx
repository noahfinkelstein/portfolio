"use client";

/**
 * HERO — the first thing visitors see.
 *  - Big name + tagline (from site.config.ts)
 *  - A word that rotates through site.heroRotatingWords
 *  - The ParticleNetwork animated background
 *  - A scroll-down cue
 *
 * To swap the background animation, replace <ParticleNetwork/> below.
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { site } from "@/config/site.config";
import HeroBackground from "@/components/HeroBackground";
import { Icon } from "@/components/icons";

export default function Hero() {
  // Cycle the rotating word every 2.2s.
  const words = site.heroRotatingWords;
  const [i, setI] = useState(0);
  useEffect(() => {
    if (words.length <= 1) return;
    const t = setInterval(() => setI((p) => (p + 1) % words.length), 2200);
    return () => clearInterval(t);
  }, [words.length]);

  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden">
      {/* Animated background — choose between 3D object / physics sim /
          particles in src/components/HeroBackground.tsx. */}
      <HeroBackground />

      {/* Foreground content (z-10 keeps it above the canvas). */}
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

        {/* Rotating role line */}
        <div className="mt-4 flex items-center gap-3 text-2xl sm:text-3xl">
          <span className="text-fg-muted">I do</span>
          <span className="relative inline-block min-w-[12ch] font-display font-semibold text-accent">
            <AnimatePresence mode="wait">
              <motion.span
                key={words[i]}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
                className="inline-block"
              >
                {words[i]}
              </motion.span>
            </AnimatePresence>
          </span>
        </div>

        <motion.p
          className="mt-7 max-w-xl text-lg leading-relaxed text-fg-muted"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {site.heroTagline}
        </motion.p>

        {/* Call-to-action buttons */}
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

      {/* Scroll cue */}
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
