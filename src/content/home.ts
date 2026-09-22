/* ---------------------------------------------------------------------------
   HOME — the words on the front page.

   The two paragraphs below are the only long-form writing on the site outside
   the blog, so they are worth rereading now and then. Everything else on this
   page is generated from experience.ts.
   --------------------------------------------------------------------------- */

export const home = {
  /* Sits directly under your name. No period. */
  lede: "Mathematics–Computer Science and Physics at Brown University",

  /* Each string is one paragraph. */
  intro: [
    "I am an undergraduate at Brown, class of 2028, studying mathematics–computer science and physics. Most of what I work on ends up somewhere between the two: machine learning that has to respect a differential equation, statistics on data that was never collected for the question being asked, software for a problem I ran into myself.",
    "Away from that I play chess, which I have been losing at since I was seven and running tournaments for since I was sixteen. I also do astrophotography, which is mostly standing in a field in the cold waiting for a cloud to move. If any of this overlaps with something you are working on, I would like to hear about it.",
  ],

  /**
   * Portrait. Any photo works — the frame crops it to 4:5.
   * `position` picks which part stays in frame: "50% 50%" is dead center,
   * lower the second number to move the crop up toward a face.
   */
  portrait: {
    src: "/images/photos/turkey.jpg",
    alt: "Noah Finkelstein on a Providence sidewalk, a wild turkey behind him",
    position: "22% 38%",
    caption: "Providence, 2026",
  },

  /**
   * What appears under "Currently". Each string is a `role` from
   * experience.ts, so the dates and text stay in one place.
   * Only list things that are actually ongoing — the date beside each one
   * will give you away otherwise.
   */
  currently: ["Co-Founder and CEO", "Machine Learning Researcher"],
};
