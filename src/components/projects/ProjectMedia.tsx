/* ---------------------------------------------------------------------------
   ProjectMedia — the figure under a project's text: the media at its own
   aspect ratio (from the width/height in the data, so nothing is cropped and
   the space is reserved before anything loads), square corners, a 1px
   --border, --bg-2 behind. Real media only:

     video  the poster as a next/image (responsive, lazy unless `priority`)
            with a muted <video> loop laid exactly over it. ProjectVideo
            plays it only while it is on screen in a visible tab, pauses it
            otherwise, and never plays it for reduced motion, so those
            visitors (and no-JS visitors) see the poster. The video fades in
            only once it is actually playing, so a slow or failed load still
            shows the poster.
     image  next/image with the file's own width/height.
     none   renders nothing.

   When the media has a `caption`, it is set under the frame in --text-sm
   italic. Nothing moves on hover.

   Props:
     media      the project's ProjectMedia (or undefined)
     link?      lays an empty link over the frame for pointer users (hidden
                from keyboards and screen readers, which have the title link;
                the image stays outside it, so its alt text is still read)
     priority?  eager-load the still (first row above the fold)
     sizes?     next/image sizes hint
     className? extra class on the <figure>
   --------------------------------------------------------------------------- */

import Image from "next/image";
import type { ProjectLink, ProjectMedia as Media } from "@/content/projects";
import ProjectVideo from "./ProjectVideo";
import styles from "./ProjectMedia.module.css";

export type ProjectMediaProps = {
  media?: Media;
  link?: ProjectLink;
  priority?: boolean;
  sizes?: string;
  className?: string;
};

/** The figure is the main column's width up to 40rem; full width when the
 *  row stacks. */
const DEFAULT_SIZES = "(max-width: 699px) 100vw, 640px";

function isExternal(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:");
}

export default function ProjectMedia({
  media,
  link,
  priority = false,
  sizes = DEFAULT_SIZES,
  className,
}: ProjectMediaProps) {
  if (!media) return null;

  const still = media.type === "video" ? media.poster : media.src;

  return (
    <figure className={[styles.figure, className].filter(Boolean).join(" ")}>
      <div className={styles.frame}>
        <Image
          className={styles.still}
          src={still}
          alt={media.alt}
          width={media.width}
          height={media.height}
          sizes={sizes}
          priority={priority}
        />
        {media.type === "video" ? (
          <ProjectVideo className={styles.video} src={media.src} srcWebm={media.srcWebm} />
        ) : null}
        {link ? (
          /* An empty layer over the frame for pointer users. Hidden from
             keyboards and screen readers (they have the title link), and a
             sibling of the image, not its parent, so the alt text is read. */
          <a
            className={styles.link}
            href={link.href}
            tabIndex={-1}
            aria-hidden="true"
            {...(isExternal(link.href) ? { target: "_blank", rel: "noopener" } : {})}
          />
        ) : null}
      </div>
      {media.caption ? <figcaption className={styles.caption}>{media.caption}</figcaption> : null}
    </figure>
  );
}
