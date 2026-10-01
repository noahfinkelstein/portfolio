"use client";

/* ---------------------------------------------------------------------------
   Popup — a masked slide-in. The content waits, invisible and shifted one
   full length out of its mask, and slides into place when `show` turns true.

   Props:
     show        trigger (false → true plays it once)
     direction   where it travels toward: "N" rises from below (default),
                 "S" drops from above, "E" enters from the left, "W" from
                 the right
     duration    seconds (default 0.5)
     as          element for the mask: "div" (default) | "span" | "li"
     className   on the mask; innerClassName on the moving element

   Reduced motion or no JavaScript: the content is simply there (CSS).
   --------------------------------------------------------------------------- */

import { useCallback, useEffect, useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./Popup.module.css";

export type PopupDirection = "N" | "S" | "E" | "W";

export type PopupProps = {
  show: boolean;
  direction?: PopupDirection;
  duration?: number;
  as?: "div" | "span" | "li";
  className?: string;
  innerClassName?: string;
  children: ReactNode;
};

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/* 110% rather than 100% so the mask's padding (room for focus rings and
   descenders) does not show a sliver before the slide. */
function offsetFor(direction: PopupDirection) {
  return {
    xPercent: direction === "W" ? 110 : direction === "E" ? -110 : 0,
    yPercent: direction === "N" ? 110 : direction === "S" ? -110 : 0,
  };
}

export default function Popup({
  show,
  direction = "N",
  duration = 0.5,
  as: Tag = "div",
  className,
  innerClassName,
  children,
}: PopupProps) {
  const innerRef = useRef<HTMLElement | null>(null);
  const setInner = useCallback((node: HTMLElement | null) => {
    innerRef.current = node;
  }, []);
  const shown = useRef(false);

  // Park the content outside the mask before the first paint after hydration.
  useIsomorphicLayoutEffect(() => {
    const el = innerRef.current;
    if (!el || shown.current || prefersReducedMotion()) return;
    gsap.set(el, offsetFor(direction));
  }, [direction]);

  useEffect(() => {
    const el = innerRef.current;
    if (!el || !show || shown.current) return;
    shown.current = true;
    if (prefersReducedMotion()) {
      gsap.set(el, { xPercent: 0, yPercent: 0, autoAlpha: 1 });
      return;
    }
    gsap.set(el, { autoAlpha: 1 });
    const tween = gsap.to(el, { xPercent: 0, yPercent: 0, duration, ease: "power1.inOut" });
    return () => {
      tween.progress(1).kill();
    };
  }, [show, duration]);

  const InnerTag = Tag === "span" ? "span" : "div";

  return (
    <Tag className={[styles.mask, className].filter(Boolean).join(" ")}>
      <InnerTag
        ref={setInner}
        className={[styles.inner, innerClassName].filter(Boolean).join(" ")}
        data-popup-inner=""
      >
        {children}
      </InnerTag>
    </Tag>
  );
}
