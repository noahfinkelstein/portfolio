/* ---------------------------------------------------------------------------
   ProjectMedia — the 16:10 media frame in a project row: --radius corners,
   a 1px --border, --bg-2 behind. Real media only:

     video  the poster as a next/image (responsive, lazy unless `priority`)
            with a muted <video> loop layered on top. ProjectVideo plays it
            only while it is on screen in a visible tab, pauses it otherwise,
            and never plays it for reduced motion, so those visitors (and
            no-JS visitors) see the poster. The video fades in only once it
            is actually playing, so a slow or failed load still shows the
            poster.
     image  next/image with the file's own width/height.
     none   a plain tile: the project title in the serif on --bg-2. Never a
            fake screenshot.

   The frame reserves its aspect ratio up front, so nothing shifts as media
   loads. Nothing moves on hover.

   Props:
     project    the Project (uses project.media and project.title)
     priority?  eager-load the still (first row above the fold)
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

/** The row's media column is about half of a 68rem column from 900px; full
 *  width when stacked. */
const DEFAULT_SIZES = "(max-width: 899px) 100vw, 520px";

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
    );
  }

  if (media?.type === "video") {
    return (
      <div className={frameClass}>
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
    );
  }

  return (
    <div className={frameClass}>
      <div className={styles.fallback} aria-hidden="true">
        <span className={styles.fallbackTitle}>{project.title}</span>
      </div>
    </div>
  );
}
