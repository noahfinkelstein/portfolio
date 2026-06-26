/**
 * PROJECTS section — renders featured projects large, the rest in a grid.
 * Edit the actual projects in src/config/projects.ts.
 */
import Section from "@/components/Section";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/config/projects";

export default function Projects() {
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);

  return (
    <Section id="projects" index="02" title="Projects">
      {/* Featured projects — one per row, image beside text. */}
      <div className="space-y-6">
        {featured.map((p) => (
          <ProjectCard key={p.title} project={p} featured />
        ))}
      </div>

      {/* Everything else — responsive grid of smaller cards. */}
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
