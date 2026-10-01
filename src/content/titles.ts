/* ---------------------------------------------------------------------------
   TITLES — the three giant lines under the hero on the home page. As you
   scroll past, each one slides sideways (alternating left and right).

   Keep them true and short (about 16 characters or fewer reads best on a
   phone). Alternate "stroke" (outline letters) and "fill" (solid letters).

     text       the words, written normally (they are set in capitals)
     style      "stroke" = outline only, "fill" = solid
     direction  which way it slides while you scroll ("left" or "right");
                leave it out to alternate automatically

   Current lines, and where each comes from:
     Mathematics–CS    the degree (Sc.B. Mathematics–Computer Science, Brown)
     Machine Learning  Machine Learning Researcher (experience.ts)
     Co-Founder        Co-Founder and CEO of CourseTrees (experience.ts)
   --------------------------------------------------------------------------- */

export type TitleLine = {
  text: string;
  /** "stroke" = outline-only letters, "fill" = solid letters. */
  style: "stroke" | "fill";
  /** Scroll direction. Default: left, right, left, … by position. */
  direction?: "left" | "right";
};

export const titles: TitleLine[] = [
  { text: "Mathematics–CS", style: "stroke", direction: "left" },
  { text: "Machine Learning", style: "fill", direction: "right" },
  { text: "Co-Founder", style: "stroke", direction: "left" },
];

/** Visually hidden heading for the section (read by screen readers). */
export const titlesLabel = "What I work on";
