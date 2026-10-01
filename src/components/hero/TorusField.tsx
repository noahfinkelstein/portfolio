"use client";

/* ---------------------------------------------------------------------------
   TorusField — the hero's three.js torus-knot field, and the small docked
   knot that follows the page once you scroll past the hero.

   Loaded by Hero.tsx with next/dynamic({ ssr: false }): this file and
   three.js arrive after the page is interactive, so the hero text is the
   first thing painted and the canvas fades in on top of the glow behind it.

   Props:
     trackRef   the hero <section>. Scroll progress runs 0 → 1 as its top
                moves from the top of the viewport to 80 % of its height
                above it; at 1 the knot is docked.

   Behaviour:
     - Reports loader progress: 0.45 (module loaded), 0.7 (scene built),
       0.9 (shaders compiled), 1 (first frame). Reports 1 on any failure,
       so the loader never waits on a missing GPU.
     - The canvas (created by the scene, portalled to <body>) is fixed and
       click-through. In the hero it sits behind the hero text (z-index 1;
       Hero's text is z-index 2); docked, it sits above the page (z 31) over
       a round "Back to top" button (z 30) that scrolls to the top.
     - The docked knot fades out while the site footer is on screen, so it
       never covers the footer's links on phones; the loop stops then.
     - Paused in a hidden tab. Reduced motion: single static frames, and the
       knot jumps to the dock instead of travelling there.
     - Theme changes re-tint it live (onThemeChange).
   --------------------------------------------------------------------------- */

import { useEffect, useRef, useState, type RefObject } from "react";
import { createPortal } from "react-dom";
import { scrollToTarget } from "@/lib/gsap";
import { reportProgress } from "@/lib/loader";
import { onThemeChange, readThemeTokens } from "@/lib/theme";
import { usePageVisible } from "@/lib/useInView";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { TorusScene, type DockRect } from "./torusScene";
import styles from "./TorusField.module.css";

export type TorusFieldProps = {
  trackRef: RefObject<HTMLElement | null>;
};

/** Share of the hero's height scrolled when the knot reaches the dock. */
const DOCK_AT = 0.8;

declare global {
  interface Window {
    /** Dev/measurement hook: the live scene (set only outside production). */
    __torusScene?: TorusScene;
  }
}

export default function TorusField({ trackRef }: TorusFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TorusScene | null>(null);
  const [dock, setDock] = useState<DockRect | null>(null);
  const [overFooter, setOverFooter] = useState(false);
  const pageVisible = usePageVisible();
  const pageVisibleRef = useRef(pageVisible);
  pageVisibleRef.current = pageVisible;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    reportProgress(0.45);

    let scene: TorusScene;
    try {
      scene = new TorusScene(host, {
        tokens: readThemeTokens(),
        reducedMotion: prefersReducedMotion(),
        canvasClassName: styles.canvas,
        onModeChange: (mode, rect) => setDock(mode === "dock" ? rect : null),
      });
    } catch {
      // No WebGL: the hero is complete without the canvas.
      reportProgress(1);
      return;
    }
    sceneRef.current = scene;
    if (process.env.NODE_ENV !== "production") window.__torusScene = scene;
    reportProgress(0.7);

    let cancelled = false;
    scene.setPageVisible(pageVisibleRef.current);

    /* Scroll → dock progress. */
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      scene.setScrollProgress(-rect.top / Math.max(1, rect.height * DOCK_AT));
    };
    measure();

    let resizeFrame = 0;
    const onResize = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        scene.resize();
        measure();
      });
    };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === "mouse") scene.setPointer(event.clientX, event.clientY);
    };
    window.addEventListener("scroll", measure, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("pointermove", onPointer, { passive: true });
    const offTheme = onThemeChange(({ tokens }) => scene.setTheme(tokens));

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => scene.setReducedMotion(motion.matches);
    motion.addEventListener("change", onMotion);

    /* Fade the dock out over the footer. */
    let footerObserver: IntersectionObserver | null = null;
    const footer = document.querySelector("footer");
    if (footer && typeof IntersectionObserver !== "undefined") {
      footerObserver = new IntersectionObserver((entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        scene.setHidden(entry.isIntersecting);
        setOverFooter(entry.isIntersecting);
      });
      footerObserver.observe(footer);
    }

    scene
      .prepare()
      .then(() => {
        if (!cancelled) reportProgress(1);
      })
      .catch(() => reportProgress(1));

    return () => {
      cancelled = true;
      window.removeEventListener("scroll", measure);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
      motion.removeEventListener("change", onMotion);
      cancelAnimationFrame(resizeFrame);
      offTheme();
      footerObserver?.disconnect();
      scene.dispose();
      sceneRef.current = null;
      if (window.__torusScene === scene) delete window.__torusScene;
      setDock(null);
    };
  }, [trackRef]);

  useEffect(() => {
    sceneRef.current?.setPageVisible(pageVisible);
  }, [pageVisible]);

  const backToTop = () => {
    scrollToTarget(0, { offset: 0 });
    // Leave keyboard focus at the top of the page, not on a vanishing button.
    document.getElementById("main")?.focus({ preventScroll: true });
  };

  return createPortal(
    <div ref={hostRef} className={styles.host} data-print-hide="">
      <button
        type="button"
        className={[styles.dock, overFooter ? styles.away : ""].filter(Boolean).join(" ")}
        hidden={!dock}
        onClick={backToTop}
        aria-label="Back to top"
        title="Back to top"
        style={dock ? { left: dock.x, top: dock.y, width: dock.size, height: dock.size } : undefined}
      />
    </div>,
    document.body,
  );
}
