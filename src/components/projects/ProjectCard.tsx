/* ---------------------------------------------------------------------------
   ProjectCard — one project as a margin-column row, set like a CV entry.
   Server component, no motion.

     margin  the date in the mono (--text-xs), and under it the status in
             italic serif, lowercase, --fg-muted ("live", "open source")
     main    the title (a link to links[0] when there is one), the blurb,
             ending with an italic "Built with A, B and C." clause from the
             stack (none when there is no stack), then the media as a
             ProjectMedia figure (no figure when there is no media)

   From 700px the row is [ --margin-col | 1fr ]; below that it stacks, the
   margin lines first. Rows are separated by a 1px hairline (.row + .row in
   the stylesheet).

   Props:
     project        the Project to show
     headingLevel?  2 on /projects (under the page's h1), 3 under a section
                    heading (default 3). Styled the same either way.
     priority?      eager-load the media (first row above the fold)
   --------------------------------------------------------------------------- */

import Link from "next/link";
import type { Project, ProjectLink } from "@/content/projects";
import ProjectMedia from "./ProjectMedia";
import styles from "./ProjectCard.module.css";

export type ProjectCardProps = {
  project: Project;
  headingLevel?: 2 | 3;
  priority?: boolean;
};

function isExternal(href: string): boolean {
  return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:");
}

/** "A", "A and B", "A, B and C". */
export function listPhrase(items: string[]): string {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
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

export default function ProjectCard({
  project,
  headingLevel = 3,
  priority = false,
}: ProjectCardProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const link = project.links?.[0];
  const titleId = `project-${project.slug}`;
  const stack = project.stack ?? [];

  return (
    <article className={styles.row} aria-labelledby={titleId}>
      <div className={styles.margin}>
        <p className={`mono ${styles.date}`}>{project.date}</p>
        <p className={styles.status}>{project.status.toLowerCase()}</p>
      </div>

      <div className={styles.main}>
        <Heading className={styles.title}>
          <TitleLink link={link}>
            <span id={titleId}>{project.title}</span>
          </TitleLink>
        </Heading>
        <p className={styles.blurb}>
          {project.blurb}
          {stack.length > 0 ? (
            <>
              {" "}
              <span className={styles.built}>Built with {listPhrase(stack)}.</span>
            </>
          ) : null}
        </p>
        <ProjectMedia
          media={project.media}
          link={link}
          priority={priority}
          className={styles.media}
        />
      </div>
    </article>
  );
}
