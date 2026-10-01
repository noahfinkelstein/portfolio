"use client";

/* ---------------------------------------------------------------------------
   ProjectVideo — the muted screen-recording loop inside ProjectMedia.

   It sits on top of the poster image and stays transparent until the browser
   reports it is actually playing. It plays only while at least a quarter of
   it is on screen in a visible tab (IntersectionObserver + visibilitychange)
   and pauses as soon as it is not. With prefers-reduced-motion it never
   plays, so the poster underneath is what people see. preload="none" means
   nothing is downloaded until it first comes into view.
   --------------------------------------------------------------------------- */

import { useEffect, useRef, useState } from "react";
import { useActive } from "@/lib/useInView";
import { useReducedMotion } from "@/lib/useReducedMotion";

export type ProjectVideoProps = {
  /** MP4 (H.264). */
  src: string;
  /** Optional WebM, offered first. */
  srcWebm?: string;
  className?: string;
};

export default function ProjectVideo({ src, srcWebm, className }: ProjectVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const reduced = useReducedMotion();
  const active = useActive(ref, { threshold: 0.25 });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (active && !reduced) {
      // React does not always reflect `muted` as an attribute; autoplay
      // policies need the property set before play().
      video.muted = true;
      const attempt = video.play();
      // A rejected play() (data saver, autoplay policy) just leaves the poster.
      if (attempt !== undefined) attempt.catch(() => undefined);
    } else if (!video.paused) {
      video.pause();
    }
  }, [active, reduced]);

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
