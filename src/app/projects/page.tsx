/* ---------------------------------------------------------------------------
   WORK — "/projects"

   PageTitle "Work", then every visible project from src/content/projects.ts
   as a ProjectCard margin-column row, in file order. Hidden ones
   (hidden: true) never render. The rows carry h2 headings here, under the
   page's h1.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import PageTitle from "@/components/layout/PageTitle";
import ProjectCard from "@/components/projects/ProjectCard";
import { getProjects } from "@/content/projects";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Software, graphics, and machine learning projects by Noah Finkelstein: CourseTrees, BrownSync, brown3d and more.",
};

export default function ProjectsPage() {
  const projects = getProjects();
  return (
    <div className={styles.page}>
      <PageTitle title="Work" />
      <div className={["container", styles.list].join(" ")}>
        {projects.map((project, i) => (
          <ProjectCard key={project.slug} project={project} headingLevel={2} priority={i === 0} />
        ))}
      </div>
    </div>
  );
}
