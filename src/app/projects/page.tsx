/* ---------------------------------------------------------------------------
   PROJECTS  —  "/projects"
   Data lives in src/content/projects.ts.
   --------------------------------------------------------------------------- */

import type { Metadata } from "next";
import Page from "@/components/Page";
import Record from "@/components/Record";
import { projects } from "@/content/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Software, graphics, and machine learning projects by Noah Finkelstein.",
};

export default function ProjectsPage() {
  return (
    <Page title="Projects" current="/projects">
      {projects.map((project) => (
        <Record key={project.title} date={project.date}>
          <h2 className="record__title">{project.title}</h2>
          {project.kind ? <p className="record__meta">{project.kind}</p> : null}
          <p>{project.blurb}</p>
          {project.stack ? (
            <p className="stack">{project.stack.join("  ·  ")}</p>
          ) : null}
          {project.links && project.links.length > 0 ? (
            <p className="record__links">
              {project.links.map((l) => (
                <a key={l.href} href={l.href}>
                  {l.label}
                </a>
              ))}
            </p>
          ) : null}
        </Record>
      ))}
    </Page>
  );
}
