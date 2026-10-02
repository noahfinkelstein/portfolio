/* ---------------------------------------------------------------------------
   SelectedProjects — the home page's "Work" section (id "work"): a
   SectionHeader, the featured projects as ProjectCard rows, and a plain
   "All work" link to /projects. Server component, no motion.

   Props:
     projects  Project[] to show (the page passes getFeaturedProjects())
     title?    section heading text (default: home.sections.work)
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

const HEADING_ID = "work-heading";

export default function SelectedProjects({
  projects,
  title = home.sections.work,
}: SelectedProjectsProps) {
  if (projects.length === 0) return null;
  return (
    <section id="work" className={styles.section} aria-labelledby={HEADING_ID}>
      <SectionHeader text={title} id={HEADING_ID} />
      <div className="container">
        <div className={styles.list}>
          {projects.map((project) => (
            <ProjectCard key={project.slug} project={project} headingLevel={3} />
          ))}
        </div>
        <p className={styles.more}>
          <Link href="/projects">All work</Link>
        </p>
      </div>
    </section>
  );
}
