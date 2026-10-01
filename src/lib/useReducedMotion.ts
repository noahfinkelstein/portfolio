/* ---------------------------------------------------------------------------
   Reduced motion.

     const reduced = useReducedMotion();   // React; false during SSR
     prefersReducedMotion()                // anywhere on the client

   With reduced motion on, the site shows no scramble, no loader, a static
   torus, no marquee autoplay and no physics toss. CSS transitions and
   animations are also cut globally in globals.css.
   --------------------------------------------------------------------------- */

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia(QUERY).matches;
}

function subscribe(callback: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, prefersReducedMotion, () => false);
}
