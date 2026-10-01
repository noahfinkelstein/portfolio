/* ---------------------------------------------------------------------------
   PROJECTS — "/projects"

   The big page title with its offset
   shadow (just "Projects": it matches the nav and the home page's "All
   projects" link, and this page shows every visible project), then every
   visible project from
   src/content/projects.ts as a zig-zag card, the first with its media on
   the right, alternating from there. Hidden ones (hidden: true) never
   render. "← Home" at the bottom.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import PageTitle from "@/components/layout/PageTitle";
import PageSelect from "@/components/layout/PageSelect";
import ProjectCard from "@/components/projects/ProjectCard";
import { getProjects } from "@/content/projects";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Software, graphics, and machine learning projects by Noah Finkelstein: CourseTrees, BrownSync, brown3d and more.",
};

export default function ProjectsPage() {
  const projects = getProjects();
  return (
    <div className={styles.page}>
      <PageTitle title="Projects" />
      <div className={styles.list}>
        {projects.map((project, i) => (
          <ProjectCard
            key={project.slug}
            project={project}
            index={i}
            reverse={i % 2 === 0}
            headingLevel={2}
            priority={i === 0}
          />
        ))}
      </div>
      <PageSelect back={{ href: "/", label: "Home" }} />
    </div>
  );
}
