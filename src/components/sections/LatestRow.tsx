"use client";

/* ---------------------------------------------------------------------------
   LatestRow — the row of FeedCards under the "Latest" header.

   Two modes:
     static   the default, and always for fewer than MIN_MARQUEE items, for
              reduced motion, or when the cards fit on screen anyway. One set
              of cards, centered when it fits, otherwise a scroll-snapping
              row you can swipe, scroll or drag.
     marquee  4+ real items that overflow the screen, motion allowed. The set
              is followed by an inert, aria-hidden copy and the row scrolls
              itself at one full set per SECONDS_PER_SET (20 s, or
              longer for big sets so the speed stays readable). It
              pauses on hover, on keyboard focus, while you drag or swipe it,
              when it is offscreen and in a hidden tab, and it wraps seamlessly
              both ways.

   The server always renders the static set (no duplicate markup for crawlers
   or no-JS readers); the copy is added after hydration.

   The row slides up out of a mask when it reaches the middle of the screen.
   Static for reduced motion.
   --------------------------------------------------------------------------- */

import { useEffect, useRef, useState } from "react";
import type { FeedItem } from "@/lib/feed";
import { gsap, useGsap } from "@/lib/gsap";
import { prefersReducedMotion, useReducedMotion } from "@/lib/useReducedMotion";
import { useActive } from "@/lib/useInView";
import FeedCard from "./FeedCard";
import styles from "./Latest.module.css";

/** Fewer real items than this never scroll themselves. */
export const MIN_MARQUEE = 4;

/** Seconds for one full set to pass: 20 s, 3 s per card beyond ~7. */
function secondsPerSet(count: number): number {
  return Math.max(20, count * 3);
}

/** After a wheel/touch scroll, wait this long before autoplay resumes. */
const RESUME_AFTER_MS = 1600;

export type LatestRowProps = {
  items: FeedItem[];
  linkedinIcon?: string;
};

type Drag = { x: number; left: number; moved: boolean; id: number };

/**
 * Marquee geometry. The track has a leading pad (under the left fade, so a
 * focused first card can sit clear of it); positions [lead, lead + loop) and
 * [lead + loop, lead + 2·loop) show identical content, so wrapping by `loop`
 * inside that window is seamless.
 */
function geometry(track: HTMLElement | null, set: HTMLElement | null): { lead: number; loop: number } {
  const lead = track ? parseFloat(getComputedStyle(track).paddingLeft) || 0 : 0;
  return { lead, loop: set?.offsetWidth ?? 0 };
}

export default function LatestRow({ items, linkedinIcon }: LatestRowProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLUListElement>(null);

  const reduced = useReducedMotion();
  const [overflowing, setOverflowing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const marquee = items.length >= MIN_MARQUEE && !reduced && overflowing;
  const active = useActive(scrollerRef, { rootMargin: "120px 0px" });

  // Pause reasons live in refs so the animation loop never re-renders React.
  const hover = useRef(false);
  const focused = useRef(false);
  const holdUntil = useRef(0);
  const drag = useRef<Drag | null>(null);
  const suppressClick = useRef(false);

  /* Does one set of cards overflow the row? Measured from card widths so the
     answer is the same in both modes (no flip-flopping at the boundary). */
  useEffect(() => {
    const scroller = scrollerRef.current;
    const set = setRef.current;
    if (!scroller || !set) return;
    const measure = () => {
      const first = set.firstElementChild as HTMLElement | null;
      if (!first) return setOverflowing(false);
      const style = getComputedStyle(first);
      const step = first.offsetWidth + parseFloat(style.marginLeft) + parseFloat(style.marginRight);
      setOverflowing(step * set.children.length > scroller.clientWidth + 1);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(scroller);
    ro.observe(set);
    return () => ro.disconnect();
  }, [items.length]);

  /* Marquee: advance scrollLeft every frame while nothing pauses it. */
  useEffect(() => {
    const scroller = scrollerRef.current;
    const set = setRef.current;
    const track = trackRef.current;
    if (!marquee || !active || !scroller || !set || !track) return;

    let { lead, loop } = geometry(track, set);
    const ro = new ResizeObserver(() => {
      ({ lead, loop } = geometry(track, set));
    });
    ro.observe(set);
    ro.observe(scroller);

    const duration = secondsPerSet(items.length) * 1000;
    let pos = scroller.scrollLeft;
    let written = -1;
    let last = 0;
    let raf = 0;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = last ? Math.min(now - last, 50) : 0;
      last = now;
      const paused = hover.current || focused.current || drag.current !== null || now < holdUntil.current;
      if (paused || loop <= 0) {
        pos = scroller.scrollLeft;
        written = -1;
        return;
      }
      // Someone scrolled it (keyboard focus, scrollbar): continue from there.
      if (written >= 0 && Math.abs(scroller.scrollLeft - written) > 2) pos = scroller.scrollLeft;
      pos += (loop / duration) * dt;
      if (pos >= lead + loop) pos -= loop;
      scroller.scrollLeft = pos;
      written = scroller.scrollLeft;
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [marquee, active, items.length]);

  /* In marquee mode, manual scrolling past the first set wraps back to the
     identical spot at the start, so the row never runs out. */
  const onScroll = () => {
    const scroller = scrollerRef.current;
    if (!marquee || !scroller) return;
    const { lead, loop } = geometry(trackRef.current, setRef.current);
    if (loop > 0 && scroller.scrollLeft >= lead + loop) scroller.scrollLeft -= loop;
  };

  /* Mouse drag (touch and trackpads scroll natively). */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const scroller = scrollerRef.current;
    if (!scroller || scroller.scrollWidth <= scroller.clientWidth) return;
    drag.current = { x: e.clientX, left: scroller.scrollLeft, moved: false, id: e.pointerId };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    const scroller = scrollerRef.current;
    if (!d || !scroller || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x;
    if (!d.moved) {
      if (Math.abs(dx) < 5) return;
      d.moved = true;
      scroller.setPointerCapture(e.pointerId);
      setDragging(true);
    }
    let next = d.left - dx;
    const { lead, loop } = geometry(trackRef.current, setRef.current);
    if (marquee && loop > 0) {
      // Wrap both ways inside the seamless window (see geometry()).
      if (next < lead) {
        next += loop;
        d.left += loop;
      } else if (next >= lead + loop) {
        next -= loop;
        d.left -= loop;
      }
    }
    scroller.scrollLeft = next;
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || e.pointerId !== d.id) return;
    if (d.moved) {
      suppressClick.current = true;
      // If no click follows (released outside a link), forget it.
      window.setTimeout(() => {
        suppressClick.current = false;
      }, 0);
    }
    drag.current = null;
    setDragging(false);
  };

  const onClickCapture = (e: React.MouseEvent) => {
    if (suppressClick.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClick.current = false;
    }
  };

  /* Reveal: slide up out of the row's own clip. */
  useGsap(
    () => {
      const track = trackRef.current;
      const scroller = scrollerRef.current;
      if (!track || !scroller || prefersReducedMotion()) return;
      gsap.from(track, {
        yPercent: 100,
        opacity: 0,
        duration: 0.7,
        ease: "power1.inOut",
        scrollTrigger: {
          trigger: scroller,
          start: "clamp(top center)",
          toggleActions: "play none none none",
        },
      });
    },
    [],
    rootRef,
  );

  const cards = (copy: boolean) =>
    items.map((item) => (
      <li key={`${copy ? "copy" : "item"}:${item.key}`} className={styles.cell}>
        <FeedCard item={item} linkedinIcon={linkedinIcon} />
      </li>
    ));

  const className = [
    styles.scroller,
    marquee ? styles.marquee : styles.static,
    overflowing ? styles.canDrag : "",
    dragging ? styles.dragging : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={rootRef} className={styles.rowWrap}>
      <div
        ref={scrollerRef}
        className={className}
        // No role="region": the section around it is already the "Latest"
        // landmark, and a second one with the same name fails landmark-unique.
        data-mode={marquee ? "marquee" : "static"}
        onScroll={onScroll}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onClickCapture}
        onDragStart={(e) => e.preventDefault()}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") hover.current = true;
        }}
        onPointerLeave={(e) => {
          if (e.pointerType === "mouse") hover.current = false;
        }}
        onFocus={(e) => {
          // Keyboard focus only: pressing a mouse on a card link (to drag)
          // also focuses it, and that must not stop the marquee for good.
          focused.current = e.target instanceof Element && e.target.matches(":focus-visible");
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) focused.current = false;
        }}
        onWheel={() => {
          holdUntil.current = performance.now() + RESUME_AFTER_MS;
        }}
        onTouchStart={() => {
          holdUntil.current = Number.POSITIVE_INFINITY;
        }}
        onTouchEnd={() => {
          holdUntil.current = performance.now() + RESUME_AFTER_MS;
        }}
        onTouchCancel={() => {
          holdUntil.current = performance.now() + RESUME_AFTER_MS;
        }}
      >
        <div ref={trackRef} className={styles.track}>
          <ul ref={setRef} role="list" className={styles.set}>
            {cards(false)}
          </ul>
          {marquee ? (
            <ul role="list" className={styles.set} aria-hidden="true" inert>
              {cards(true)}
            </ul>
          ) : null}
        </div>
      </div>
    </div>
  );
}
