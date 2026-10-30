/* ---------------------------------------------------------------------------
   SKILLS — the "Technical" section of the CV (/cv). Each category is one row:
   the label in the margin column, the items after it as one plain sentence
   ("Python, TypeScript, C++, R and Swift.").

   Fields:
     label  the category name, sentence case
     items  the tools in it, in the order they should read

   To add a tool, put its name in the right `items` list. To add a category,
   add a block. Keep the list aligned with the current resume.
   --------------------------------------------------------------------------- */

export type SkillCategory = {
  label: string;
  items: string[];
};

export const skills: SkillCategory[] = [
  {
    label: "Languages",
    items: ["Python", "C/C++", "Rust", "R", "Java", "Go", "TypeScript", "Swift"],
  },
  {
    label: "Frameworks and tools",
    items: ["AWS", "Docker", "Kubernetes", "CI/CD", "React", "Next.js", "PostgreSQL", "Redis"],
  },
  {
    label: "AI and machine learning",
    items: ["PyTorch", "Keras", "TensorFlow", "scikit-learn", "CNNs", "Transformers", "CUDA"],
  },
];
