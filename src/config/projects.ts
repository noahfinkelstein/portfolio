/**
 * ============================================================================
 *  PROJECTS  —  the cards shown in the "Projects" section.
 * ============================================================================
 *
 * Add a new project by copying one block and editing it. To add a photo:
 *   1. Drop the image in /public/images/projects/
 *   2. Set `image: "/images/projects/your-file.png"`
 *   3. Leave `image: ""` for an automatic gradient placeholder instead.
 *
 * `featured: true` projects appear larger / first.
 */

export type Project = {
  title: string;
  blurb: string; // one or two sentences
  image: string; // "/images/projects/..."  or ""  for a placeholder
  tags: string[]; // tech / topics, shown as small chips
  date: string; // free text, e.g. "Spring 2026"
  links: { label: string; href: string }[]; // e.g. GitHub / live demo / paper
  featured?: boolean;
};

export const projects: Project[] = [
  {
    title: "CourseTrees",
    blurb:
      "Co-founded an interactive course-catalog visualization tool that turns list-formatted catalogs into explorable graphs. See prerequisite chains, connections between departments, and the fastest path to any course — across 120+ schools.",
    image: "", // add a screenshot at /images/projects/coursetrees.png
    tags: ["Next.js", "TypeScript", "Supabase", "Data Viz", "Python"],
    date: "2026 – Present",
    links: [{ label: "Live site", href: "https://coursetrees.com" }],
    featured: true,
  },
  // ↓ EXAMPLE — replace with a real project (e.g. a CSCI 1470 deep-learning
  //   project, a Brown Space Engineering build, or an astrophotography tool).
  {
    title: "Deep Learning Project",
    blurb:
      "Replace this with a real project. Lead with the impressive part — the result, the metric, or the clever idea.",
    image: "",
    tags: ["Python", "PyTorch", "ML"],
    date: "2025",
    links: [{ label: "GitHub", href: "#" }],
    featured: true,
  },
  // ↓ EXAMPLE — a smaller project / experiment / class project.
  {
    title: "Astrophotography Pipeline",
    blurb: "Replace with another project worth showing off (or delete this entry).",
    image: "",
    tags: ["Python", "Astrophysics"],
    date: "2025",
    links: [{ label: "GitHub", href: "#" }],
  },
];
