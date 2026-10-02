"use client";

/* ---------------------------------------------------------------------------
   ProjectVideo — the muted screen-recording loop inside ProjectMedia.

   It sits on top of the poster image and stays transparent until the browser
   reports it is actually playing. Two IntersectionObservers on the element:

     near    rootMargin "200px 0px": once the video is within 200px of the
             viewport it starts loading (preload switches from "none" to
             "auto"), so it is ready a little before it is needed
     inView  thresholds [0, 0.25] with an intersectionRatio check: at least
             a quarter of the video is on screen
   It plays only while near, in view, the tab is visible (usePageVisible)
   and motion is not reduced, and pauses as soon as any of those stops

   With prefers-reduced-motion it never plays or loads, so the poster
   underneath is what people see.

   Props:
     src        MP4 (H.264)
     srcWebm?   optional WebM, offered first
     className? class on the <video>
   --------------------------------------------------------------------------- */

import { useEffect, useRef, useState } from "react";
import { usePageVisible } from "@/lib/useInView";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type ProjectVideoProps = {
  /** MP4 (H.264). */
  src: string;
  /** Optional WebM, offered first. */
  srcWebm?: string;
  className?: string;
};

const NEAR_MARGIN = "200px 0px";
const PLAY_RATIO = 0.25;

export default function ProjectVideo({ src, srcWebm, className }: ProjectVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const pageVisible = usePageVisible();
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);
  const [playing, setPlaying] = useState(false);

  /* Near: stays true after the first time (the download is not undone). */
  useEffect(() => {
    const video = ref.current;
    if (!video || near) return;
    if (typeof IntersectionObserver === "undefined") {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: NEAR_MARGIN },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [near]);

  /* In view: at least a quarter of the element is on screen. */
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        setInView(entry.isIntersecting && entry.intersectionRatio >= PLAY_RATIO);
      },
      { threshold: [0, PLAY_RATIO] },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  /* Start loading as soon as the video is near (never for reduced motion). */
  useEffect(() => {
    const video = ref.current;
    if (!video || !near || reduced) return;
    if (video.preload !== "auto") {
      video.preload = "auto";
      video.load();
    }
  }, [near, reduced]);

  const active = near && inView && pageVisible && !reduced;

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active) {
      // React does not always reflect `muted` as an attribute; autoplay
      // policies need the property set before play().
      video.muted = true;
      const attempt = video.play();
      // A rejected play() (data saver, autoplay policy) just leaves the poster.
      if (attempt !== undefined) attempt.catch(() => undefined);
    } else if (!video.paused) {
      video.pause();
    }
  }, [active]);

  return (
    <video
      ref={ref}
      className={className}
      data-playing={playing || undefined}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      aria-hidden="true"
      tabIndex={-1}
      onPlaying={() => setPlaying(true)}
    >
      {srcWebm ? <source src={srcWebm} type="video/webm" /> : null}
      <source src={src} type="video/mp4" />
    </video>
  );
}
