/* ---------------------------------------------------------------------------
   ProjectCard — one zig-zag project card:

     header    status line (accent caps) · date, the title (heavy caps),
               the subtitle (project.kind, serif)
     media     the 16:10 ProjectMedia frame, then a full-width outline
               "View Project →" button (links[0]; no button without a public
               link). External links open in a new tab.
     details   the description box (project.blurb: --bg-2, 3px accent left
               border) and tag pills (project.stack) cycling --tag-1…6

   Desktop: two columns, media spanning both rows on one side, header and
   details stacked on the other; `reverse` swaps the sides. At ≤1024px it
   stacks header → media → details (the DOM order).

   Props:
     project        the Project to show
     reverse?       media on the right (alternate cards pass reverse)
     index?         position in the list (accepted for callers; unused)
     headingLevel?  2 on /projects, 3 under a section header (default 3)
     priority?      eager-load the media (first card above the fold)
   --------------------------------------------------------------------------- */

import Link from "next/link";
import type { Project, ProjectLink } from "@/content/projects";
import CardReveal from "./CardReveal";
import ProjectMedia from "./ProjectMedia";
import TagList from "./TagList";
import styles from "./ProjectCard.module.css";

export type ProjectCardProps = {
  project: Project;
  reverse?: boolean;
  index?: number;
  headingLevel?: 2 | 3;
  priority?: boolean;
};

function isExternal(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:");
}

/** A solid arrow. */
function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
    </svg>
  );
}

/** Media wrapped in the project link for pointer users (the button is the
 *  keyboard/screen-reader route, so this one is hidden from both). */
function MediaLink({ link, children }: { link?: ProjectLink; children: React.ReactNode }) {
  if (!link) return <>{children}</>;
  const external = isExternal(link.href);
  return (
    <a
      className={styles.mediaLink}
      href={link.href}
      tabIndex={-1}
      aria-hidden="true"
      {...(external ? { target: "_blank", rel: "noopener" } : {})}
    >
      {children}
    </a>
  );
}

function ViewButton({ link, title }: { link: ProjectLink; title: string }) {
  const external = isExternal(link.href);
  const content = (
    <>
      <span>View Project</span>
      <ArrowIcon className={styles.buttonArrow} />
      <span className="sr-only">
        {`: ${title}, ${link.label}`}
        {external ? " (opens in a new tab)" : ""}
      </span>
    </>
  );
  return external ? (
    <a className={styles.button} href={link.href} target="_blank" rel="noopener">
      {content}
    </a>
  ) : (
    <Link className={styles.button} href={link.href}>
      {content}
    </Link>
  );
}

export default function ProjectCard({
  project,
  reverse = false,
  headingLevel = 3,
  priority = false,
}: ProjectCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const link = project.links?.[0];
  const titleId = `project-${project.slug}`;

  return (
    <CardReveal className={styles.card} labelledBy={titleId}>
      <div className={[styles.content, reverse ? styles.reverse : ""].join(" ")}>
        <header className={styles.header} data-reveal="text">
          <p className={styles.status}>
            <span>{project.status}</span>
            <span className={styles.date}>{project.date}</span>
          </p>
          <Heading id={titleId} className={styles.title}>
            {project.title}
          </Heading>
          {project.kind ? <p className={styles.subtitle}>{project.kind}</p> : null}
        </header>

        <div className={styles.mediaSection} data-reveal="media">
          <MediaLink link={link}>
            <ProjectMedia project={project} priority={priority} />
          </MediaLink>
          {link ? <ViewButton link={link} title={project.title} /> : null}
        </div>

        <div className={styles.details} data-reveal="text">
          <div className={styles.description}>
            <p>{project.blurb}</p>
          </div>
          {project.stack && project.stack.length > 0 ? (
            <TagList tags={project.stack} label={`${project.title} is built with`} />
          ) : null}
        </div>
      </div>
    </CardReveal>
  );
}
