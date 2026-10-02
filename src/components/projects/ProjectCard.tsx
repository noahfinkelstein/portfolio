/* ---------------------------------------------------------------------------
   ProjectCard — one project as a list row. Server component, no motion.

     text    the title (a link to links[0] when there is one), then one mono
             line with the date and the status, the kind (if any), the blurb,
             and the stack as a TagList
     media   the 16:10 ProjectMedia frame, also linked to links[0] for
             pointer users (hidden from keyboards and screen readers, which
             already have the title link)

   From 900px the row is a two-column grid, text on the left and media on
   the right, always. Below that it stacks, media first. Rows are separated
   by a 1px hairline (.row + .row in the stylesheet).

   Props:
     project        the Project to show
     headingLevel?  2 on /projects (under the page's h1), 3 under a section
                    heading (default 3). Styled the same either way.
     priority?      eager-load the media (first row above the fold)
   --------------------------------------------------------------------------- */

import Link from "next/link";
import type { Project, ProjectLink } from "@/content/projects";
import ProjectMedia from "./ProjectMedia";
import TagList from "./TagList";
import styles from "./ProjectCard.module.css";

export type ProjectCardProps = {
  project: Project;
  headingLevel?: 2 | 3;
  priority?: boolean;
};

function isExternal(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:");
}

/** The title, linked to the project's first link when it has one. */
function TitleLink({ link, children }: { link?: ProjectLink; children: React.ReactNode }) {
  if (!link) return <>{children}</>;
  if (isExternal(link.href)) {
    return (
      <a className={styles.titleLink} href={link.href} target="_blank" rel="noopener">
        {children}
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    );
  }
  return (
    <Link className={styles.titleLink} href={link.href}>
      {children}
    </Link>
  );
}

/** The media, linked for pointer users only: the title is the keyboard and
 *  screen-reader route, so this one is hidden from both. */
function MediaLink({ link, children }: { link?: ProjectLink; children: React.ReactNode }) {
  if (!link) return <>{children}</>;
  return (
    <a
      className={styles.mediaLink}
      href={link.href}
      tabIndex={-1}
      aria-hidden="true"
      {...(isExternal(link.href) ? { target: "_blank", rel: "noopener" } : {})}
    >
      {children}
    </a>
  );
}

export default function ProjectCard({
  project,
  headingLevel = 3,
  priority = false,
}: ProjectCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const link = project.links?.[0];
  const titleId = `project-${project.slug}`;

  return (
    <article className={styles.row} aria-labelledby={titleId}>
      <div className={styles.text}>
        <Heading className={styles.title}>
          <TitleLink link={link}>
            <span id={titleId}>{project.title}</span>
          </TitleLink>
        </Heading>
        <p className={["mono", styles.meta].join(" ")}>
          <span>{project.date}</span>
          <span>{project.status}</span>
        </p>
        {project.kind ? <p className={styles.kind}>{project.kind}</p> : null}
        <p className={styles.blurb}>{project.blurb}</p>
        {project.stack && project.stack.length > 0 ? (
          <TagList
            tags={project.stack}
            label={`${project.title} is built with`}
            className={styles.stack}
          />
        ) : null}
      </div>

      <div className={styles.media}>
        <MediaLink link={link}>
          <ProjectMedia project={project} priority={priority} />
        </MediaLink>
      </div>
    </article>
  );
}
