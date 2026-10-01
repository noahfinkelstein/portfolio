"use client";

/* ---------------------------------------------------------------------------
   ScrambledText — text that "decodes" in, character by character.

   How it works:
     - every character gets a random start frame and an end frame (0–40 each
       in "auto" mode); before `start` it shows its old character, between
       `start` and `end` a random scramble character (re-rolled with a 28%
       chance per frame, drawn in the dud colour), after `end` the real one;
     - it is done when every character has passed its end frame.
   One change: frames are counted at 60 per second of real time, so the
   effect runs at the same speed on a 120 Hz screen.

   Markup: the real text sits in an .sr-only span (what screen readers and
   crawlers read); the animated glyphs live in an aria-hidden span. A third
   aria-hidden span holds the plain text and is only shown with reduced
   motion or without JavaScript (see the CSS module and Hero's <noscript>).

   Props:
     text            the final text
     mode            "auto" (default) | "duration" | "percentage"
                     | "wait-for-animation"
                     All but the last start when the element scrolls to
                     100px above the bottom of the viewport (once).
                     "wait-for-animation" starts when `animate` turns true.
     animate         trigger for "wait-for-animation"
     delay           ms to wait after the trigger (default 0)
     duration        "duration" mode: total length in ms (default 2000)
     percentage      "percentage" mode: share of characters that resolve;
                     the rest keep scrambling (default 100)
     scrambleChars   the scramble alphabet
     onComplete      called once the text has fully resolved
     className       on the wrapper span

   Reduced motion: no scramble; the text is final from the first paint and
   onComplete fires as soon as the trigger does.
   --------------------------------------------------------------------------- */

import { useCallback, useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import styles from "./ScrambledText.module.css";

export type ScrambleMode = "auto" | "duration" | "percentage" | "wait-for-animation";

export type ScrambledTextProps = {
  text: string;
  mode?: ScrambleMode;
  animate?: boolean;
  delay?: number;
  duration?: number;
  percentage?: number;
  scrambleChars?: string;
  onComplete?: () => void;
  className?: string;
};

export const SCRAMBLE_CHARS = "!<>-_\\/[]{}—=+*^?#________";

const FRAME_MS = 1000 / 60;

type QueueItem = { from: string; to: string; start: number; end: number; char?: string };

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * The scrambled state the server renders. Deterministic (no Math.random) so
 * hydration matches; spaces are kept so the line breaks where it will.
 */
function initialScramble(text: string, chars: string): string {
  let out = "";
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    out += ch === " " ? " " : chars[(i * 7 + text.charCodeAt(i) * 3) % chars.length];
  }
  return out;
}

function randomScramble(text: string, chars: string): string {
  let out = "";
  for (const ch of text) out += ch === " " ? " " : chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function ScrambledText({
  text,
  mode = "auto",
  animate = false,
  delay = 0,
  duration = 2000,
  percentage = 100,
  scrambleChars = SCRAMBLE_CHARS,
  onComplete,
  className,
}: ScrambledTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const animRef = useRef<HTMLSpanElement>(null);

  // Animation state lives in refs: the frame loop writes the DOM directly.
  const frameRequest = useRef(0);
  const timeoutId = useRef(0);
  const hasAnimated = useRef(false);
  const completed = useRef(false);
  const firstText = useRef(true);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Latest option values for callbacks that outlive a render.
  const opts = useRef({ text, mode, delay, duration, percentage, scrambleChars });
  opts.current = { text, mode, delay, duration, percentage, scrambleChars };

  const complete = useCallback(() => {
    if (completed.current) return;
    completed.current = true;
    onCompleteRef.current?.();
  }, []);

  const setText = useCallback(
    (newText: string) => {
      const el = animRef.current;
      if (!el) return;
      const { mode: m, duration: dur, percentage: pct, scrambleChars: chars } = opts.current;
      const oldText = el.textContent ?? "";
      const length = Math.max(oldText.length, newText.length);
      const queue: QueueItem[] = [];

      if (m === "duration") {
        const totalFrames = Math.floor((dur / 1000) * 60);
        const maxStart = Math.floor(totalFrames * 0.3);
        const minDuration = Math.floor(totalFrames * 0.3);
        const maxDuration = Math.floor(totalFrames * 0.7);
        for (let i = 0; i < length; i++) {
          const start = Math.floor(Math.random() * maxStart);
          const end = start + minDuration + Math.floor(Math.random() * (maxDuration - minDuration));
          queue.push({ from: oldText[i] || "", to: newText[i] || "", start, end });
        }
      } else if (m === "percentage") {
        const charsToReveal = Math.floor((pct / 100) * length);
        for (let i = 0; i < length; i++) {
          const from = oldText[i] || "";
          const to = newText[i] || "";
          if (i < charsToReveal) {
            const start = Math.floor(Math.random() * 40);
            queue.push({ from, to, start, end: start + Math.floor(Math.random() * 40) });
          } else {
            queue.push({ from, to, start: 0, end: Infinity });
          }
        }
      } else {
        for (let i = 0; i < length; i++) {
          const start = Math.floor(Math.random() * 40);
          queue.push({
            from: oldText[i] || "",
            to: newText[i] || "",
            start,
            end: start + Math.floor(Math.random() * 40),
          });
        }
      }

      const render = (frame: number): boolean => {
        let output = "";
        let done = 0;
        for (const item of queue) {
          if (frame >= item.end) {
            done++;
            output += escapeHtml(item.to);
          } else if (frame >= item.start) {
            if (!item.char || Math.random() < 0.28) {
              item.char = chars[Math.floor(Math.random() * chars.length)];
            }
            output += `<span class="${styles.dud}">${escapeHtml(item.char)}</span>`;
          } else {
            output += escapeHtml(item.from);
          }
        }
        el.innerHTML = output;
        return done === queue.length;
      };

      cancelAnimationFrame(frameRequest.current);
      if (render(0)) {
        complete();
        return;
      }
      let startTs = 0;
      let lastFrame = 0;
      const tick = (now: number) => {
        if (!startTs) startTs = now - FRAME_MS; // the first tick is frame 1
        const frame = Math.floor((now - startTs) / FRAME_MS);
        if (frame !== lastFrame) {
          lastFrame = frame;
          if (render(frame)) {
            complete();
            return;
          }
        }
        frameRequest.current = requestAnimationFrame(tick);
      };
      frameRequest.current = requestAnimationFrame(tick);
    },
    [complete],
  );

  const startAnimation = useCallback(() => {
    if (!animRef.current || hasAnimated.current) return;
    hasAnimated.current = true;
    const { text: target, delay: wait } = opts.current;
    if (prefersReducedMotion()) {
      animRef.current.textContent = target;
      complete();
      return;
    }
    window.clearTimeout(timeoutId.current);
    timeoutId.current = window.setTimeout(() => setText(target), wait);
  }, [complete, setText]);

  // (Re)arm whenever the text changes.
  useEffect(() => {
    const el = animRef.current;
    const root = rootRef.current;
    if (!el || !root) return;
    hasAnimated.current = false;
    completed.current = false;

    if (prefersReducedMotion()) {
      el.textContent = text;
    } else if (!firstText.current) {
      el.textContent = randomScramble(text, opts.current.scrambleChars);
    }
    firstText.current = false;

    if (mode === "wait-for-animation") return;

    // In-view trigger: element top 100px above the bottom of the viewport.
    if (typeof IntersectionObserver === "undefined") {
      startAnimation();
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          observer.disconnect();
          startAnimation();
        }
      },
      { rootMargin: "0px 0px -100px 0px" },
    );
    observer.observe(root);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mode is fixed per instance
  }, [text, startAnimation]);

  // "wait-for-animation": start when `animate` turns true.
  useEffect(() => {
    if (mode === "wait-for-animation" && animate) startAnimation();
  }, [mode, animate, text, startAnimation]);

  // Stop everything on unmount; the next mount (StrictMode) starts clean.
  useEffect(
    () => () => {
      cancelAnimationFrame(frameRequest.current);
      window.clearTimeout(timeoutId.current);
      hasAnimated.current = false;
    },
    [],
  );

  return (
    <span ref={rootRef} className={[styles.root, className].filter(Boolean).join(" ")}>
      <span className="sr-only">{text}</span>
      <span ref={animRef} className={styles.anim} aria-hidden="true" data-scramble-anim="">
        {initialScramble(text, scrambleChars)}
      </span>
      <span className={styles.static} aria-hidden="true" data-scramble-static="">
        {text}
      </span>
    </span>
  );
}
