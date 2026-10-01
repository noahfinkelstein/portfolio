/* ---------------------------------------------------------------------------
   GSAP, registered once, client side.

     import { gsap, ScrollTrigger, useGsap, scrollToTarget } from "@/lib/gsap";

     useGsap(() => {
       gsap.from(".title", { y: 40, scrollTrigger: { trigger: ".title", start: "top 80%" } });
     }, [], rootRef);

   useGsap runs inside gsap.context(scope): every tween and ScrollTrigger made
   in the callback is reverted on unmount / deps change (safe in StrictMode and
   across client navigations). Return a function from the callback for any
   extra cleanup. Selector strings are scoped to `scope`.

   Only import this from client components ("use client").
   --------------------------------------------------------------------------- */

import { useEffect, useLayoutEffect, type DependencyList, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

export { gsap, ScrollTrigger, ScrollToPlugin };

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export function useGsap(
  setup: (context: gsap.Context) => void | (() => void),
  deps: DependencyList = [],
  scope?: RefObject<Element | null>,
): void {
  useIsomorphicLayoutEffect(() => {
    const context = gsap.context((self) => setup(self), scope?.current ?? undefined);
    return () => context.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls deps
  }, deps);
}

/** Fixed navbar height in px, so scrolled-to targets are not hidden under it. */
export const NAV_OFFSET = 80;

/**
 * Smooth-scroll the window to an element, selector or y position. Instant for
 * reduced motion. Leaves room for the fixed navbar.
 *
 * globals.css sets `html { scroll-behavior: smooth }`. ScrollToPlugin only
 * turns native smooth scrolling off for element targets, not `window`, so
 * each window.scrollTo() the tween makes would start a native smooth scroll,
 * lag the tween by more than the 7px autoKill threshold on the first frame
 * and kill it. So html is switched to `auto` for the length of the tween.
 * A user scroll mid-tween still cancels it (autoKill).
 */
export function scrollToTarget(
  target: string | Element | number,
  { duration = 0.8, offset = NAV_OFFSET }: { duration?: number; offset?: number } = {},
): void {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  const restore = () => {
    html.style.scrollBehavior = previous;
  };
  gsap.to(window, {
    duration: prefersReducedMotion() ? 0 : duration,
    ease: "power2.inOut",
    overwrite: "auto",
    scrollTo: { y: target, offsetY: offset, autoKill: true, onAutoKill: restore },
    onComplete: restore,
    onInterrupt: restore,
  });
}
