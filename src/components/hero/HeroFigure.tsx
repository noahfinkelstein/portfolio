"use client";

/* ---------------------------------------------------------------------------
   HeroFigure — what goes inside the hero's figure box: the static SVG knot
   (passed in as `fallback` by Hero.tsx, so it stays a server component and
   is in the server-rendered HTML) and, once it has loaded and drawn its
   first frame, the three.js canvas fading in over it. The only client file
   Hero.tsx touches: it holds the next/dynamic() call so Hero itself stays a
   server component.

   Props:
     fallback   the <TorusKnotSvg /> element (rendered by the server)
   The SVG fades back in if the WebGL context is lost or was never available.
   --------------------------------------------------------------------------- */

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import styles from "./Hero.module.css";

const TorusField = dynamic(() => import("./TorusField"), { ssr: false });

export type HeroFigureProps = {
  fallback: React.ReactNode;
};

export default function HeroFigure({ fallback }: HeroFigureProps) {
  const [live, setLive] = useState(false);
  const onReady = useCallback(() => setLive(true), []);
  const onLost = useCallback(() => setLive(false), []);

  return (
    <>
      <div className={[styles.fallback, live ? styles.fallbackOut : ""].filter(Boolean).join(" ")}>{fallback}</div>
      <TorusField className={styles.field} canvasClassName={styles.scene} onReady={onReady} onLost={onLost} />
    </>
  );
}
