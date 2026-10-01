"use client";

/* ---------------------------------------------------------------------------
   CardReveal — the <article> wrapper of a ProjectCard. It only adds motion:
   when the card first scrolls into view, the media column slides in from its
   own side and the text blocks rise in, staggered (CSS transitions in
   ProjectCard.module.css, driven by data-reveal-state).

   No animation library: an IntersectionObserver flips one attribute, so
   /projects does not ship GSAP for an entrance effect.

   The card is server-rendered fully visible, so crawlers, no-JS visitors and
   reduced-motion visitors get it as is. Cards already on screen when the page
   loads are left alone (no hide-then-show flicker); only cards below the
   fold are hidden and then revealed.

   Children mark what moves: data-reveal="media" and data-reveal="text".
   --------------------------------------------------------------------------- */

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

export type CardRevealProps = {
  className?: string;
  labelledBy?: string;
  children: React.ReactNode;
};

export default function CardReveal({ className, labelledBy, children }: CardRevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") return;
    // Already (nearly) visible at load: leave it be.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    el.dataset.revealState = "pending";
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.dataset.revealState = "in";
          observer.disconnect();
        }
      },
      // Fire when the card's top passes ~82% of the viewport height.
      { rootMargin: "0px 0px -18% 0px" },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      delete el.dataset.revealState;
    };
  }, []);

  return (
    <article ref={ref} className={className} aria-labelledby={labelledBy} data-project-card="">
      {children}
    </article>
  );
}
