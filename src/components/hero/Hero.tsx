"use client";

/* ---------------------------------------------------------------------------
   Hero — the first screen (100svh).

   Props: none. Every word comes from home.hero in src/content/home.ts.

   Layers:
     TorusField   three.js torus-knot field, fixed behind the text (z 1),
                  loaded after hydration (next/dynamic, ssr: false); it
                  docks to the bottom-right corner as you scroll.
     .content     the text (z 2), all of it in the server HTML.

   Sequence (starts when the intro loader finishes: useLoaderDone()):
     1. "Hello, I am Noah" (the page's only <h1>) scrambles in;
        the degree scrambles in after 500 ms, "@ Brown University" after
        1000 ms.
     2. When "@ Brown University" resolves: the role line slides in from the
        left, then the three words pop up at 600 ms intervals, then the
        bouncing arrow fades in (1 s). The arrow scrolls to #titles.
   Reduced motion: everything is in place from the first paint.
   No JavaScript: the <noscript> rules below show the plain text.

   Contract: reports reportProgress(0.1) on mount; TorusField reports the
   rest up to 1 (and 1 on failure or without WebGL).
   --------------------------------------------------------------------------- */

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { home } from "@/content/home";
import { gsap, scrollToTarget } from "@/lib/gsap";
import { reportProgress, useLoaderDone } from "@/lib/loader";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import ScrambledText from "./ScrambledText";
import Popup from "./Popup";
import styles from "./Hero.module.css";

function TorusFallback() {
  useEffect(() => {
    reportProgress(1);
  }, []);
  return null;
}

const TorusField = dynamic(
  () => import("./TorusField").catch(() => ({ default: TorusFallback })),
  { ssr: false },
);

/** Delay between the pop-ups after the degree line resolves (ms). */
const STEP_MS = 600;

/* Without JavaScript nothing animates, so show the finished state. */
const noScriptStyles =
  "<style>[data-scramble-anim]{display:none!important}[data-scramble-static]{display:inline!important}" +
  "[data-popup-inner]{opacity:1!important;visibility:visible!important;transform:none!important}" +
  "[data-hero-arrow]{opacity:1!important;visibility:visible!important}</style>";

export default function Hero() {
  const { hero } = home;
  const sectionRef = useRef<HTMLElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);
  const loaderDone = useLoaderDone();
  // 0: waiting · 1: role line · 2–4: words · 5: arrow
  const [stage, setStage] = useState(0);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    reportProgress(0.1);
  }, []);

  useEffect(
    () => () => {
      timers.current.forEach((id) => window.clearTimeout(id));
      timers.current = [];
    },
    [],
  );

  const onDegreeResolved = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
    const step = prefersReducedMotion() ? 0 : STEP_MS;
    setStage(1);
    for (let s = 2; s <= 5; s++) {
      timers.current.push(window.setTimeout(() => setStage(s), step * (s - 1)));
    }
  }, []);

  // The arrow fades in last.
  useEffect(() => {
    const arrow = arrowRef.current;
    if (!arrow || stage < 5) return;
    const tween = gsap.to(arrow, {
      autoAlpha: 1,
      duration: prefersReducedMotion() ? 0 : 1,
      ease: "power1.out",
    });
    return () => {
      tween.progress(1).kill();
    };
  }, [stage]);

  const [lead, ...rest] = hero.roles;

  return (
    <section ref={sectionRef} id="hero" className={styles.hero} aria-labelledby="hero-title">
      <noscript dangerouslySetInnerHTML={{ __html: noScriptStyles }} />
      <TorusField trackRef={sectionRef} />

      <header className={styles.content}>
        <h1 id="hero-title" className={styles.greeting}>
          <ScrambledText text={hero.greeting} mode="wait-for-animation" animate={loaderDone} />
        </h1>

        <p className={styles.degree}>
          <ScrambledText text={hero.degree} mode="wait-for-animation" animate={loaderDone} delay={500} />
          <ScrambledText
            text={hero.highlight}
            className={styles.highlight}
            mode="wait-for-animation"
            animate={loaderDone}
            delay={1000}
            onComplete={onDegreeResolved}
          />
        </p>

        {lead ? (
          <Popup show={stage >= 1} direction="E" className={styles.rolesMask}>
            <p className={styles.roles}>
              <span className={styles.lead}>
                {lead.title} <span className={styles.at}>@</span>{" "}
                {lead.href ? (
                  <a className={styles.org} href={lead.href} target="_blank" rel="noopener noreferrer">
                    {lead.org}
                  </a>
                ) : (
                  <span className={styles.at}>{lead.org}</span>
                )}
                {rest.length > 0 ? <span className={styles.secondary}>,</span> : null}
              </span>
              {rest.map((role, i) => (
                <span key={`${role.title}-${role.org}`}>
                  {" "}
                  <span className={styles.secondary}>
                    {role.title} @{" "}
                    {role.href ? (
                      <a className={styles.secondaryOrg} href={role.href} target="_blank" rel="noopener noreferrer">
                        {role.org}
                      </a>
                    ) : (
                      role.org
                    )}
                    {i < rest.length - 1 ? "," : null}
                  </span>
                </span>
              ))}
            </p>
          </Popup>
        ) : null}

        <ul className={styles.words} role="list" aria-label="What I spend my time on">
          {hero.words.map((word, i) => (
            <Popup key={word} as="li" show={stage >= 2 + i} className={styles.word}>
              {word}
            </Popup>
          ))}
        </ul>
      </header>

      <div ref={arrowRef} className={styles.arrow} data-hero-arrow="">
        <a
          href="#titles"
          className={styles.arrowButton}
          onClick={(event) => {
            event.preventDefault();
            scrollToTarget("#titles");
          }}
          aria-label="Scroll down to the next section"
        >
          <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
            <circle cx="24" cy="24" r="21.5" fill="none" stroke="currentColor" strokeWidth="3" />
            <path
              d="M24 13.5v19M16 25l8 8 8-8"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </a>
      </div>
    </section>
  );
}
