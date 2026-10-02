"use client";

/* ---------------------------------------------------------------------------
   TorusField — the hero figure's three.js trefoil, drawn as an ink figure on
   a canvas that fills the host box this component renders. In flow: not
   fixed, not portalled.

   Loaded by HeroFigure.tsx with next/dynamic({ ssr: false }): this file and
   three.js arrive after the page is interactive, so the hero text and the
   static SVG knot are painted first and the canvas fades in over them.

   Props:
     className        class for the host <div> (fills the figure box)
     canvasClassName  class for the <canvas> the scene creates
     onReady          the first visible frame has been drawn: the owner can
                      fade its fallback out
     onLost           the WebGL context was lost or could not be created:
                      the owner should show its fallback again

   Behaviour:
     - Sized to its host with a ResizeObserver (window resize as a fallback).
     - The loop runs only while the host is near the viewport and the tab is
       visible (useActive); reduced motion draws one static frame, redrawn
       on theme change and resize.
     - Theme changes re-tint it live (onThemeChange; it reads --scene-wire).
     - The knot leans toward the pointer only while the pointer is over this
       host: pointermove on the host gives a position normalised to -1…1
       about the host's centre, pointerleave sets it back to 0, 0 and the
       knot eases upright. Touch never steers it.
     - No WebGL: the scene constructor throws, nothing is drawn and onLost
       fires, so the SVG fallback stays.
   --------------------------------------------------------------------------- */

import { useEffect, useRef } from "react";
import { onThemeChange, readThemeTokens } from "@/lib/theme";
import { useActive } from "@/lib/useInView";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { TorusScene } from "./torusScene";

export type TorusFieldProps = {
  className?: string;
  canvasClassName?: string;
  onReady?: () => void;
  onLost?: () => void;
};

export default function TorusField({ className, canvasClassName, onReady, onLost }: TorusFieldProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<TorusScene | null>(null);
  const active = useActive(hostRef, { rootMargin: "120px 0px" });
  const activeRef = useRef(active);
  activeRef.current = active;
  const readyRef = useRef(onReady);
  readyRef.current = onReady;
  const lostRef = useRef(onLost);
  lostRef.current = onLost;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let scene: TorusScene;
    try {
      scene = new TorusScene(host, {
        tokens: readThemeTokens(),
        reducedMotion: prefersReducedMotion(),
        canvasClassName,
        onReady: () => readyRef.current?.(),
        onLost: () => lostRef.current?.(),
      });
    } catch {
      // No WebGL: the figure keeps its static SVG.
      lostRef.current?.();
      return;
    }
    sceneRef.current = scene;
    scene.setActive(activeRef.current);

    /* Size: follow the host box. */
    let resizeFrame = 0;
    const measure = () => {
      cancelAnimationFrame(resizeFrame);
      resizeFrame = requestAnimationFrame(() => {
        const rect = host.getBoundingClientRect();
        scene.resize(rect.width, rect.height);
      });
    };
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      observer.observe(host);
    } else {
      window.addEventListener("resize", measure);
    }

    /* Pointer lean, scoped to the figure. Touch should not steer it. */
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      scene.setPointer(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        ((event.clientY - rect.top) / rect.height) * 2 - 1,
      );
    };
    const onPointerLeave = () => scene.setPointer(0, 0);
    host.addEventListener("pointermove", onPointerMove, { passive: true });
    host.addEventListener("pointerleave", onPointerLeave);

    const offTheme = onThemeChange(({ tokens }) => scene.setTheme(tokens));

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => scene.setReducedMotion(motion.matches);
    motion.addEventListener("change", onMotion);

    scene.prepare().catch(() => lostRef.current?.());

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
      host.removeEventListener("pointermove", onPointerMove);
      host.removeEventListener("pointerleave", onPointerLeave);
      motion.removeEventListener("change", onMotion);
      cancelAnimationFrame(resizeFrame);
      offTheme();
      scene.dispose();
      sceneRef.current = null;
    };
  }, [canvasClassName]);

  useEffect(() => {
    sceneRef.current?.setActive(active);
  }, [active]);

  return <div ref={hostRef} className={className} aria-hidden="true" data-print-hide="" />;
}
