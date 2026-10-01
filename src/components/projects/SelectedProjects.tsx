/* ---------------------------------------------------------------------------
   SelectedProjects — the home page's "Selected Projects": a SectionHeader,
   the featured ProjectCards (zig-zag, the first with its media on the
   right), and an "All projects →" link to
   /projects.

   Props:
     projects  Project[] to show (the page passes getFeaturedProjects())
     title?    section header text (default: home.sections.selectedProjects)
   --------------------------------------------------------------------------- */

import Link from "next/link";
import { home } from "@/content/home";
import type { Project } from "@/content/projects";
import SectionHeader from "@/components/sections/SectionHeader";
import ProjectCard from "./ProjectCard";
import styles from "./SelectedProjects.module.css";

export type SelectedProjectsProps = {
  projects: Project[];
  title?: string;
};

const HEADING_ID = "selected-projects-heading";

export default function SelectedProjects({
  projects,
  title = home.sections.selectedProjects,
}: SelectedProjectsProps) {
  if (projects.length === 0) return null;
  return (
    <section id="selected-projects" className={styles.section} aria-labelledby={HEADING_ID}>
      <SectionHeader text={title} id={HEADING_ID} />
      <div className={styles.list}>
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            reverse={i % 2 === 0}
            headingLevel={3}
          />
        ))}
      </div>
      <p className={styles.more}>
        <Link href="/projects" className={styles.moreLink}>
          <span className={styles.moreLabel}>All projects</span>
          <svg
            className={styles.moreArrow}
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="currentColor"
            aria-hidden="true"
            focusable="false"
          >
            <path d="M13.025 1l-2.847 2.828 6.176 6.176h-16.354v3.992h16.354l-6.176 6.176 2.847 2.828 10.975-11z" />
          </svg>
        </Link>
      </p>
    </section>
  );
}
