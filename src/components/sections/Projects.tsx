/**
 * ============================================================================
 *  PROJECTS SECTION  —  featured + grid project cards.
 * ============================================================================
 *
 * DATA: src/config/projects.ts — add/edit projects there, not here.
 *
 * LAYOUT:
 *   featured: true  → large horizontal cards (image left, text right on md+)
 *   featured: false → smaller cards in a responsive grid (2 cols → 3 cols)
 */

import Section from "@/components/Section";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/config/projects";

export default function Projects() {
  // Split the config array into two display groups
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Section id="projects" index="02" title="Projects">
      {/* Featured projects — stacked vertically, one per row */}
      <div className="space-y-6">
        {featured.map((p) => (
          <ProjectCard key={p.title} project={p} featured />
        ))}
      </div>

      {/* Non-featured — only render the grid if there are any */}
      {rest.length > 0 && (
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <ProjectCard key={p.title} project={p} />
          ))}
        </div>
      )}
    </Section>
  );
}
