/* ---------------------------------------------------------------------------
   SKILLS — the logos tossed around in the Experience section's physics box
   (a plain grid for reduced motion). Adding one is one line.

   Fields:
     name   what it is called
     icon   a Simple Icons slug (https://simpleicons.org — the slug is the
            icon's name lowercased with "." spelled "dot", "+" spelled "plus":
            "nextdotjs", "cplusplus", "threedotjs"). A slug that does not exist
            fails the build, so a typo cannot ship quietly.
     color  optional hex override. By default the logo uses its brand color,
            or the theme's text color when the brand color is too dark to see.

   Only list things that appear in experience.ts or projects.ts.
   --------------------------------------------------------------------------- */

export type Skill = {
  name: string;
  icon: string;
  color?: string;
};

export const skills: Skill[] = [
  { name: "Python", icon: "python" },
  { name: "TypeScript", icon: "typescript" },
  { name: "React", icon: "react" },
  { name: "Next.js", icon: "nextdotjs" },
  { name: "PyTorch", icon: "pytorch" },
  { name: "scikit-learn", icon: "scikitlearn" },
  { name: "R", icon: "r" },
  { name: "Tidyverse", icon: "tidyverse" },
  { name: "C++", icon: "cplusplus" },
  { name: "PostgreSQL", icon: "postgresql" },
  { name: "Supabase", icon: "supabase" },
  { name: "Vercel", icon: "vercel" },
  { name: "Swift", icon: "swift" },
  { name: "Firebase", icon: "firebase" },
  { name: "three.js", icon: "threedotjs" },
  { name: "Vite", icon: "vite" },
  { name: "MapLibre", icon: "maplibre" },
  { name: "Cytoscape.js", icon: "cytoscapedotjs" },
  { name: "Zod", icon: "zod" },
  { name: "Pydantic", icon: "pydantic" },
];
