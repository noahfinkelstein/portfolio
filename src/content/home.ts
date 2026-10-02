/* ---------------------------------------------------------------------------
   HOME — the words on the front page, top to bottom.

   hero      the front matter: the lede under the name, and the caption
             under the knot ("Fig. 1")
   sections  the headings of the two sections below it, Work and Writing
   about     the two paragraphs that follow the lede in the front matter
   portrait  the small photo under them ("Fig. 2")
   currently roles that are ongoing (the CV dates them "… – now")

   The `about.intro` paragraphs and `hero.lede` are the only long-form writing
   on the site outside the blog, so they are worth rereading now and then.
   --------------------------------------------------------------------------- */

export const home = {
  hero: {
    /**
     * Two or three sentences under the name: what you study, what you do.
     * Plain prose; links are added in Hero.tsx for the words in `ledeLinks`.
     */
    lede:
      "Mathematics–computer science and physics at Brown University. Co-founder of CourseTrees, and machine learning research in the Bari–Hazeltine group.",
    /** Words in the lede that become links (exact match). */
    ledeLinks: { CourseTrees: "https://coursetrees.com" } as Record<string, string>,
    /** The figure caption under the knot. Keep it true. */
    figureCaption:
      "Fig. 1. The trefoil, or (2,3) torus knot: the simplest knot that cannot be undone without cutting the string.",
  },

  /** Section headings on the home page. */
  sections: {
    work: "Work",
    writing: "Writing",
  },

  about: {
    /* Each string is one paragraph, shown under the lede in the hero. */
    intro: [
      "I am an undergraduate at Brown, class of 2028, studying mathematics–computer science and physics. Most of what I work on ends up somewhere between the two: machine learning that has to respect a differential equation, statistics on data that was never collected for the question being asked, software for a problem I ran into myself.",
      "Away from that I play chess, which I have been losing at since I was seven and running tournaments for since I was sixteen. I also do astrophotography, which is mostly standing in a field in the cold waiting for a cloud to move. If any of this overlaps with something you are working on, I would like to hear about it.",
    ],
  },

  /**
   * Portrait, the small "Fig. 2" in the hero, under the paragraphs; the
   * caption is printed after "Fig. 2. ". `position` picks which part stays
   * in frame if it is cropped: "50% 50%" is dead centre, lower the second
   * number to move the crop up toward a face.
   */
  portrait: {
    src: "/images/photos/turkey.jpg",
    width: 1350,
    height: 1800,
    alt: "Noah Finkelstein on a Providence sidewalk, a wild turkey behind him",
    position: "22% 38%",
    caption: "Providence, 2026. The turkey lives on College Hill.",
  },

  /**
   * Roles that are ongoing, by their `role` in experience.ts. Their date
   * reads "… – now" on the CV. Only list things that really are.
   */
  currently: ["Co-Founder and CEO", "Machine Learning Researcher"],
};

export type Home = typeof home;
