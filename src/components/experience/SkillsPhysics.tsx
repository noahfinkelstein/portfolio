"use client";

/* ---------------------------------------------------------------------------
   SkillsPhysics — the box of skill chips on the right of the Experience
   section (a matter-js physics box).

   - The server renders every skill as a plain list of chips (logo + name).
     That list is the content: it shows as a static grid without JS and for
     reduced motion, and stays in the DOM as a screen-reader list otherwise.
   - About 600px before the box scrolls into view, matter-js is imported
     (its own chunk) and the chips move onto a canvas, stacked at the top.
   - When the box enters the viewport they fall; once a third of it is
     visible they get a random toss. Chips can be dragged with a mouse or a
     finger (a swipe on empty space still scrolls the page).
   - The loop runs only while the box is on screen and the tab is visible,
     and stops by itself once every chip has settled.
   - Chips re-tint live when the theme changes.

   Props:
     skills   ResolvedSkill[] from getResolvedSkills() (server-only lib)
     label    accessible name for the list (default "Skills and tools")
   --------------------------------------------------------------------------- */

import { useEffect, useRef, useState } from "react";
import type { ResolvedSkill } from "@/lib/icons";
import { onThemeChange, readThemeTokens, useTheme } from "@/lib/theme";
import { useInView, usePageVisible } from "@/lib/useInView";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { logoColor } from "./color";
import type { SkillsSim } from "./skillsSim";
import styles from "./SkillsPhysics.module.css";

export type SkillsPhysicsProps = {
  skills: ResolvedSkill[];
  label?: string;
};

type Mode = "static" | "physics";

/** The resolved Montserrat family from next/font (e.g. "'__Montserrat_1a2b', …"). */
function resolveFontFamily(el: Element): string {
  const v = getComputedStyle(el).getPropertyValue("--font-sans").trim();
  return v || "Montserrat, Arial, sans-serif";
}

export default function SkillsPhysics({ skills, label = "Skills and tools" }: SkillsPhysicsProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const simRef = useRef<SkillsSim | null>(null);
  const tossedRef = useRef(false);
  const [mode, setMode] = useState<Mode>("static");

  const reduced = useReducedMotion();
  const near = useInView(boxRef, { rootMargin: "600px 0px", once: true });
  const onScreen = useInView(boxRef);
  const tossVisible = useInView(boxRef, { threshold: 0.33, once: true });
  const pageVisible = usePageVisible();
  const { tokens } = useTheme();

  /* Load matter-js and build the world once the box is near the viewport. */
  useEffect(() => {
    if (!near || reduced) return;
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;

    let cancelled = false;
    let sim: SkillsSim | null = null;

    (async () => {
      try {
        const fontFamily = resolveFontFamily(box);
        const [{ default: Matter }, { createSkillsSim }] = await Promise.all([
          import("matter-js"),
          import("./skillsSim"),
          document.fonts?.load(`700 15px ${fontFamily}`).catch(() => undefined),
        ]);
        if (cancelled) return;
        sim = createSkillsSim({
          Matter,
          canvas,
          box,
          skills,
          tokens: readThemeTokens(),
          fontFamily,
        });
        simRef.current = sim;
        setMode("physics");
      } catch {
        // No canvas / import failed: the static list stays.
      }
    })();

    return () => {
      cancelled = true;
      sim?.destroy();
      simRef.current = null;
      tossedRef.current = false;
      setMode("static");
    };
  }, [near, reduced, skills]);

  /* Run only while visible. */
  useEffect(() => {
    simRef.current?.setRunning(mode === "physics" && onScreen && pageVisible);
  }, [mode, onScreen, pageVisible]);

  /* The toss, once, when a third of the box is in view. */
  useEffect(() => {
    if (mode !== "physics" || !tossVisible || tossedRef.current) return;
    tossedRef.current = true;
    simRef.current?.toss();
  }, [mode, tossVisible]);

  /* Re-tint on theme change. */
  useEffect(() => {
    if (mode !== "physics") return;
    return onThemeChange(({ tokens: next }) => simRef.current?.setTokens(next));
  }, [mode]);

  const physics = mode === "physics";

  return (
    <div className={styles.root}>
      <h3 className="sr-only">{label}</h3>
      <div
        ref={boxRef}
        className={[styles.box, physics ? styles.live : ""].join(" ")}
        data-skills-physics={mode}
      >
        <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
        <ul role="list" aria-label={label} className={physics ? "sr-only" : styles.grid}>
          {skills.map((s) => (
            <li key={s.slug} className={styles.chip}>
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                <path
                  d={s.path}
                  fill={
                    tokens
                      ? logoColor(s, { surface: tokens.bg3, fg: tokens.fg, isDark: tokens.isDark })
                      : s.color ?? (s.darkBrand ? "currentColor" : s.hex)
                  }
                />
              </svg>
              <span>{s.name}</span>
            </li>
          ))}
        </ul>
      </div>
      {physics ? (
        <p className={styles.hint} data-print-hide>
          <span>Drag them around.</span>
          <button
            type="button"
            className={styles.toss}
            onClick={() => simRef.current?.toss()}
          >
            Toss again
          </button>
        </p>
      ) : null}
    </div>
  );
}
