/**
 * ============================================================================
 *  PROJECT CARD  —  one project entry (image + title + blurb + tags + links).
 * ============================================================================
 *
 * DATA comes from src/config/projects.ts via the `project` prop.
 * You normally edit projects in the config file, not this component.
 *
 * `featured` prop changes layout:
 *   true  → horizontal card on md+ (image 50% width, text beside it)
 *   false → vertical card with 16:10 image on top
 */

import type { Project } from "@/config/projects";
import SmartImage from "@/components/SmartImage";
import { Icon } from "@/components/icons";

export default function ProjectCard({
  project,
  featured,
}: {
  project: Project;
  featured?: boolean;
}) {
  return (
    <article
      className={`card group flex flex-col overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
        featured ? "md:flex-row" : ""
      }`}
    >
      {/* Image area — SmartImage handles empty src with a placeholder */}
      <div
        className={`relative overflow-hidden ${
          featured ? "md:w-1/2" : "aspect-[16/10]"
        }`}
      >
        <SmartImage
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          placeholderLabel="add a project image"
        />
      </div>

      {/* Text block — flex-1 on blurb pushes links to the bottom */}
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-semibold">{project.title}</h3>
          <span className="shrink-0 font-mono text-xs text-fg-muted">
            {project.date}
          </span>
        </div>

        <p className="mb-4 flex-1 text-fg-muted">{project.blurb}</p>

        {/* Tech stack / topic chips */}
        <ul className="mb-5 flex flex-wrap gap-2">
          {project.tags.map((t) => (
            <li
              key={t}
              className="rounded-full bg-bg-softer px-2.5 py-1 font-mono text-[11px] text-fg-muted"
            >
              {t}
            </li>
          ))}
        </ul>

        {/* External links (GitHub, live demo, paper, etc.) */}
        <div className="flex flex-wrap gap-4">
          {project.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
            >
              {l.label}
              <Icon name="arrowUpRight" width={14} height={14} />
            </a>
          ))}
        </div>
      </div>
    </article>
  );
}
