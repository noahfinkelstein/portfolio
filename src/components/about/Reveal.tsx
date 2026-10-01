"use client";

/* ---------------------------------------------------------------------------
   Reveal — slides its content in from one side when it scrolls into view,
   used by About and the journey (gsap + ScrollTrigger, play once,
   "top center", power1.inOut).

     <Reveal from="right">…</Reveal>                 slides its own width
     <Reveal from="left" distance={0.5} mobile={50}> half its width, 50px ≤900px

   The content is server-rendered and always in the DOM; only transform and
   opacity are animated. Reduced motion: nothing moves.
   Used by About (text column) and Experience (the journey box).
   --------------------------------------------------------------------------- */

import { useRef } from "react";
import { gsap, useGsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

export type RevealProps = {
  from: "left" | "right";
  /** Travel as a fraction of the element's width (default 1). */
  distance?: number;
  /** Travel in px at ≤900px wide (default 50). */
  mobile?: number;
  /** ScrollTrigger start (default "top center"). */
  start?: string;
  /** Element whose position starts the reveal (default: this one). */
  triggerSelector?: string;
  /** Children marked data-reveal-item fade up in sequence after the slide. */
  stagger?: boolean;
  className?: string;
  children: React.ReactNode;
};

export default function Reveal({
  from,
  distance = 1,
  mobile = 50,
  start = "top center",
  triggerSelector,
  stagger = false,
  className,
  children,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGsap(
    () => {
      const el = ref.current;
      if (!el || prefersReducedMotion()) return;
      const trigger = (triggerSelector && el.closest(triggerSelector)) || el;
      const sign = from === "right" ? 1 : -1;
      const isMobile = window.innerWidth <= 900;
      const x = sign * (isMobile ? mobile : el.offsetWidth * distance);

      const tl = gsap.timeline({
        scrollTrigger: { trigger, start, toggleActions: "play none none none" },
      });
      tl.from(el, { x, opacity: 0, duration: 0.9, ease: "power1.inOut" });
      if (stagger) {
        const items = el.querySelectorAll("[data-reveal-item]");
        if (items.length) {
          tl.from(
            items,
            { y: 18, opacity: 0, duration: 0.5, ease: "power2.out", stagger: 0.07 },
            "-=0.35",
          );
        }
      }
    },
    [from, distance, mobile, start, triggerSelector, stagger],
    ref,
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
