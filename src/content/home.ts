/* ---------------------------------------------------------------------------
   HOME — the words on the front page, top to bottom.

   hero      the first screen: greeting, degree line, role line, three words
   sections  the section header labels
   (the giant scroll-scrubbed lines under the hero live in titles.ts)
   about     the About box: name line, one-liner, the two paragraphs, portrait

   The two `about.intro` paragraphs are the only long-form writing on the site
   outside the blog, so they are worth rereading now and then.
   --------------------------------------------------------------------------- */

export type RoleLine = {
  /** "Co-Founder" */
  title: string;
  /** "CourseTrees" */
  org: string;
  /** Optional link on the org name. */
  href?: string;
};

export const home = {
  hero: {
    /** Decodes in with the scramble effect. Set in the display face. */
    greeting: "Hello, I am Noah",
    /** The degree line; `highlight` follows it in the warm highlight color. */
    degree: "Math–CS & Physics",
    highlight: " @ Brown University",
    /**
     * The line that slides in under the degree:
     * "Co-Founder @ CourseTrees, ML Research @ Brown".
     * The first role is emphasized, the rest are quieter.
     */
    roles: [
      { title: "Co-Founder", org: "CourseTrees", href: "https://coursetrees.com" },
      { title: "ML Research", org: "Brown" },
    ] as RoleLine[],
    /** Pop in one at a time. Keep them short. */
    words: ["Building", "Researching", "Losing at chess"],
  },

  /** Section header labels on the home page. */
  sections: {
    selectedProjects: "Selected Projects",
    latest: "Latest",
    about: "About Me",
    experience: "Experience",
  },

  about: {
    /** The big line at the top of the About box. */
    name: "I’m Noah Finkelstein.",
    /** One line under it. */
    oneLiner: "Mathematics–Computer Science and Physics at Brown University",
    /* Each string is one paragraph. */
    intro: [
      "I am an undergraduate at Brown, class of 2028, studying mathematics–computer science and physics. Most of what I work on ends up somewhere between the two: machine learning that has to respect a differential equation, statistics on data that was never collected for the question being asked, software for a problem I ran into myself.",
      "Away from that I play chess, which I have been losing at since I was seven and running tournaments for since I was sixteen. I also do astrophotography, which is mostly standing in a field in the cold waiting for a cloud to move. If any of this overlaps with something you are working on, I would like to hear about it.",
    ],
  },

  /**
   * Portrait, shown in the About box. `position` picks which part stays in
   * frame when it is cropped: "50% 50%" is dead center, lower the second
   * number to move the crop up toward a face.
   */
  portrait: {
    src: "/images/photos/turkey.jpg",
    width: 1350,
    height: 1800,
    alt: "Noah Finkelstein on a Providence sidewalk, a wild turkey behind him",
    position: "22% 38%",
    caption: "Providence, 2026",
  },

  /**
   * Roles that are ongoing, by their `role` in experience.ts. The Experience
   * section can mark these as current. Only list things that really are.
   */
  currently: ["Co-Founder and CEO", "Machine Learning Researcher"],
};

export type Home = typeof home;
