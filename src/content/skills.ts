/* ---------------------------------------------------------------------------
   SKILLS — the "Technical" section of the CV (/cv). Each category is one row:
   the label in the margin column, the items after it as one plain sentence
   ("Python, TypeScript, C++, R and Swift.").

   Fields:
     label  the category name, sentence case
     items  the tools in it, in the order they should read

   To add a tool, put its name in the right `items` list. To add a category,
   add a block. Only list things that appear in experience.ts or projects.ts.
   --------------------------------------------------------------------------- */

export type SkillCategory = {
  label: string;
  items: string[];
};

export const skills: SkillCategory[] = [
  {
    label: "Languages",
    items: ["Python", "TypeScript", "C++", "R", "Swift"],
  },
  {
    label: "Machine learning and statistics",
    items: ["PyTorch", "scikit-learn", "Tidyverse"],
  },
  {
    label: "Web and data",
    items: ["React", "Next.js", "three.js", "Vite", "MapLibre", "Cytoscape.js", "Zod", "Pydantic", "PostgreSQL"],
  },
  {
    label: "Tools",
    items: ["Supabase", "Firebase", "Vercel"],
  },
];
