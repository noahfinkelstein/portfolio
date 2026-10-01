/* ---------------------------------------------------------------------------
   ProjectMedia — the 16:10 rounded media frame on a project card, with a
   1.05 zoom on hover (and while anything in the card has keyboard focus).
   Real media only:

     video  the poster as a next/image (responsive, lazy unless `priority`)
            with a muted <video> loop layered on top. ProjectVideo plays it
            only while it is on screen in a visible tab, pauses it otherwise,
            and never plays it for reduced motion, so those visitors (and
            no-JS visitors) see the poster. The video fades in only once it
            is actually playing, so a slow or failed load still shows the
            poster.
     image  next/image with the file's own width/height.
     none   a themed tile: the project title in heavy caps over an
            accent gradient, a faint grid and a little noise. Never a fake
            screenshot.

   The frame reserves its aspect ratio up front, so nothing shifts as media
   loads.

   Props:
     project    the Project (uses project.media and project.title)
     priority?  eager-load the still (first card above the fold)
     sizes?     next/image sizes hint
     className? extra class on the frame
   --------------------------------------------------------------------------- */

import Image from "next/image";
import type { Project } from "@/content/projects";
import ProjectVideo from "./ProjectVideo";
import styles from "./ProjectMedia.module.css";

export type ProjectMediaProps = {
  project: Project;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/** The card's media column is at most ~34rem wide; full width when stacked. */
const DEFAULT_SIZES = "(max-width: 1024px) 100vw, 576px";

/** A stable 0–3 per project, so neighbouring fallback tiles differ a little. */
function variantFor(slug: string): number {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % 4;
}

export default function ProjectMedia({
  project,
  priority = false,
  sizes = DEFAULT_SIZES,
  className,
}: ProjectMediaProps) {
  const media = project.media;
  const frameClass = [styles.frame, className].filter(Boolean).join(" ");

  if (media?.type === "image") {
    return (
      <div className={frameClass}>
        <div className={styles.zoom}>
          <Image
            className={styles.media}
            src={media.src}
            alt={media.alt}
            width={media.width}
            height={media.height}
            sizes={sizes}
            priority={priority}
          />
        </div>
      </div>
    );
  }

  if (media?.type === "video") {
    return (
      <div className={frameClass}>
        <div className={styles.zoom}>
          <Image
            className={styles.media}
            src={media.poster}
            alt={media.alt}
            width={media.width}
            height={media.height}
            sizes={sizes}
            priority={priority}
          />
          <ProjectVideo className={styles.video} src={media.src} srcWebm={media.srcWebm} />
        </div>
      </div>
    );
  }

  return (
    <div className={[frameClass, styles.fallbackFrame].join(" ")}>
      <div
        className={[styles.zoom, styles.fallback].join(" ")}
        data-variant={variantFor(project.slug)}
        aria-hidden="true"
      >
        <span className={styles.fallbackTitle}>{project.title}</span>
      </div>
    </div>
  );
}
