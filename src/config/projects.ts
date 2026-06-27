/**
 * ============================================================================
 *  PROJECTS DATA  —  cards in the Projects section.
 * ============================================================================
 *
 * TO ADD A PROJECT: copy an object below and edit fields.
 *
 * IMAGES:
 *   1. Drop file in /public/images/projects/
 *   2. Set image: "/images/projects/your-file.png"
 *   3. image: "" → SmartImage shows gradient placeholder
 *
 * featured: true → large horizontal card, shown above the grid.
 */

export type Project = {
  title: string;
  blurb: string; // 1–2 sentence description on the card
  image: string; // "/images/projects/..." or "" for placeholder
  tags: string[]; // tech chips below the blurb
  date: string; // free text, e.g. "Spring 2026"
  links: { label: string; href: string }[]; // GitHub, live demo, paper, etc.
  featured?: boolean; // true = large card, rendered first
};

export const projects: Project[] = [
  {
    title: "CourseTrees",
    blurb:
      "Co-founded an interactive course-catalog visualization tool that turns list-formatted catalogs into explorable graphs. See prerequisite chains, connections between departments, and the fastest path to any course — across 120+ schools.",
    image: "", // add /images/projects/coursetrees.png
    tags: ["Next.js", "TypeScript", "Supabase", "Data Viz", "Python"],
    date: "2026 – Present",
    links: [{ label: "Live site", href: "https://coursetrees.com" }],
    featured: true,
  },
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
  {
    title: "Astrophotography Pipeline",
    blurb: "Replace with another project worth showing off (or delete this entry).",
    image: "",
    tags: ["Python", "Astrophysics"],
    date: "2025",
    links: [{ label: "GitHub", href: "#" }],
  },
];
