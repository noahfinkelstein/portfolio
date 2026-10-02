/* ---------------------------------------------------------------------------
   Reduced motion.

     const reduced = useReducedMotion();   // React; false during SSR
     prefersReducedMotion()                // anywhere on the client

   With reduced motion on, the hero's torus knot is one static frame and
   the project videos stay on their posters. CSS transitions and animations
   are also cut globally in globals.css.
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
