"use client";

/* ---------------------------------------------------------------------------
   Loader — the full-screen intro overlay.

   "N O A H  F I N K E L S T E I N" in the display face, every letter shown
   as an underscore and revealed left to right as the hero's 3D scene reports
   init progress (src/lib/loader.ts), then a fade out (GSAP autoAlpha).

   Props:
     text?: string   the name to reveal (default: site.name)

   Contract (see src/lib/loader.ts):
     - The overlay carries `data-loader-overlay` and aria-hidden="true". It is
       an overlay only: the page is in the DOM behind it the whole time.
     - Skipped entirely (renders nothing, markLoaderDone() right away) when
       shouldSkipLoader() or isLoaderDone(): reduced motion, or it already
       played this session. The <head> script hides it before first paint in
       those cases, so it never flashes.
     - The reveal follows the reported progress but never faster than
       MIN_REVEAL_MS for the whole name, so every letter is seen. It finishes
       at progress 1 or LOADER_MAX_MS (1.4 s from mount, fade included),
       whichever comes first.
     - When finished: rememberLoaderShown() at the start of the fade,
       markLoaderDone() when it has faded (the hero text starts then).
     - While it is up, wheel / touch / keyboard scrolling is blocked (blocking
       the events instead of hiding html overflow avoids the scrollbar popping back and shifting the page). Everything
       is restored when it finishes or unmounts.
     - Failsafe: the server-rendered overlay fades itself out with a CSS
       animation 2.2 s after it appears (Loader.module.css), so a page whose
       scripts fail or arrive late is never left covered. When the script
       runs in time it cancels that animation and drives the fade itself;
       when it arrives after the failsafe has started, it just finishes.
   --------------------------------------------------------------------------- */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { site } from "@/content/site";
import { gsap } from "@/lib/gsap";
import {
  LOADER_MAX_MS,
  getProgress,
  isLoaderDone,
  markLoaderDone,
  rememberLoaderShown,
  shouldSkipLoader,
} from "@/lib/loader";
import styles from "./Loader.module.css";

export type LoaderProps = {
  text?: string;
};

/** The whole name never reveals faster than this (ms). */
const MIN_REVEAL_MS = 600;
/** Pause on the complete name before fading (ms). */
const HOLD_MS = 80;
/** Fade out (ms). Inside the 1.4 s cap the time goes to a slower fade
    rather than the hold. */
const FADE_MS = 650;

const SCROLL_KEYS = new Set([
  " ",
  "PageDown",
  "PageUp",
  "ArrowDown",
  "ArrowUp",
  "Home",
  "End",
]);

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Loader({ text = site.name }: LoaderProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useIsomorphicLayoutEffect(() => {
    if (shouldSkipLoader() || isLoaderDone()) {
      markLoaderDone();
      setGone(true);
      return;
    }
    const overlay = overlayRef.current;
    if (!overlay) return;

    // The CSS failsafe already started fading it (scripts arrived late):
    // let it finish, and do not block scrolling.
    if (parseFloat(getComputedStyle(overlay).opacity) < 1) {
      rememberLoaderShown();
      markLoaderDone();
      setGone(true);
      return;
    }
    // From here the script drives the fade.
    overlay.style.animation = "none";

    const slots = Array.from(overlay.querySelectorAll<HTMLElement>("[data-slot]"));

    /* Block scrolling while the overlay is up. */
    const block = (event: Event) => event.preventDefault();
    const blockKeys = (event: KeyboardEvent) => {
      if (SCROLL_KEYS.has(event.key)) event.preventDefault();
    };
    window.addEventListener("wheel", block, { passive: false });
    window.addEventListener("touchmove", block, { passive: false });
    window.addEventListener("keydown", blockKeys);
    const unblock = () => {
      window.removeEventListener("wheel", block);
      window.removeEventListener("touchmove", block);
      window.removeEventListener("keydown", blockKeys);
    };

    const start = performance.now();
    const forceAt = LOADER_MAX_MS - FADE_MS - HOLD_MS;
    let last = start;
    let shown = 0;
    let revealed = 0;
    let fullAt = 0;
    let raf = 0;
    let tween: gsap.core.Tween | null = null;
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      unblock();
      markLoaderDone();
      setGone(true);
    };

    const tick = (now: number) => {
      const elapsed = now - start;
      const dt = now - last;
      last = now;

      // Chase the reported progress at a capped speed; force it at the cap.
      shown = Math.min(getProgress(), shown + dt / MIN_REVEAL_MS);
      if (elapsed >= forceAt) shown = 1;

      const count = shown >= 1 ? slots.length : Math.floor(shown * slots.length);
      for (; revealed < count; revealed++) slots[revealed].setAttribute("data-on", "");

      if (shown >= 1 && !fullAt) fullAt = now;
      if (fullAt && now - fullAt >= HOLD_MS) {
        rememberLoaderShown();
        tween = gsap.to(overlay, {
          autoAlpha: 0,
          duration: FADE_MS / 1000,
          ease: "power1.out",
          onComplete: finish,
        });
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      tween?.kill();
      unblock();
      // A StrictMode re-run starts from scratch; a real unmount is not done
      // yet, so the hero's fallback timer takes over.
      if (!finished) {
        gsap.set(overlay, { clearProps: "opacity,visibility" });
        overlay.style.animation = "";
        for (const slot of slots) slot.removeAttribute("data-on");
      }
    };
  }, []);

  if (gone) return null;

  // Capitals.
  const words = text.toUpperCase().split(/\s+/).filter(Boolean);

  return (
    <div ref={overlayRef} className={styles.overlay} data-loader-overlay="" aria-hidden="true">
      <p className={styles.name}>
        {words.map((word, w) => (
          <span key={`${word}-${w}`} className={styles.word}>
            {Array.from(word).map((ch, c) => (
              <span key={c} className={styles.slot} data-slot="">
                <span className={styles.ch}>{ch}</span>
                <span className={styles.us}>_</span>
              </span>
            ))}
          </span>
        ))}
      </p>
    </div>
  );
}
