/* ---------------------------------------------------------------------------
   Visibility hooks, for pausing expensive things nobody can see.

     const ref = useRef<HTMLDivElement>(null);
     const inView = useInView(ref, { rootMargin: "200px 0px" });
     const pageVisible = usePageVisible();      // false in a hidden tab
     const active = useActive(ref);             // inView && pageVisible

   Use `useActive` to start/stop a three.js or matter-js loop, and
   `useInView(ref, { once: true })` for play-once reveals.
   --------------------------------------------------------------------------- */

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

export type InViewOptions = {
  /** IntersectionObserver rootMargin, e.g. "200px 0px" to start early. */
  rootMargin?: string;
  threshold?: number | number[];
  /** Stay true after the first time the element is seen. */
  once?: boolean;
  /** Value before the observer reports (and during SSR). Default false. */
  initial?: boolean;
};

export function useInView(
  ref: RefObject<Element | null>,
  { rootMargin = "0px", threshold = 0, once = false, initial = false }: InViewOptions = {},
): boolean {
  const [inView, setInView] = useState(initial);
  const thresholdKey = Array.isArray(threshold) ? threshold.join(",") : String(threshold);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin, threshold },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- thresholdKey stands in for threshold
  }, [ref, rootMargin, thresholdKey, once]);

  return inView;
}

function subscribeVisibility(callback: () => void): () => void {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

/** False while the tab is hidden. */
export function usePageVisible(): boolean {
  return useSyncExternalStore(
    subscribeVisibility,
    () => document.visibilityState !== "hidden",
    () => true,
  );
}

/** In the viewport and the tab is visible: the condition for running a loop. */
export function useActive(ref: RefObject<Element | null>, options?: InViewOptions): boolean {
  const inView = useInView(ref, options);
  const visible = usePageVisible();
  return inView && visible;
}
