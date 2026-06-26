/**
 * ============================================================================
 *  SITE  —  who you are, your links, and the nav menu.
 * ============================================================================
 *
 * This is the file to edit for your NAME, tagline, social links, and the
 * rotating words in the hero. No design here — just your info.
 */

export const site = {
  /** Your name as it should appear in the hero and browser tab. */
  name: "Noah Finkelstein",

  /** Short label under your name. */
  role: "Biostatistics Research @ MGH · Math-CS + Astrophysics @ Brown",

  /**
   * The hero rotates through these phrases (one swaps in/out automatically).
   * Add, remove, or reorder freely.
   */
  heroRotatingWords: [
    "Machine Learning",
    "Full-Stack Dev",
    "Mathematics",
    "Astrophysics",
  ],

  /** One or two sentences shown in the hero, below your name. */
  heroTagline:
    "Rising junior at Brown studying Math-CS and Astrophysics. Machine-learning enthusiast and full-stack developer who loves building things — from scalable software to dubiously sturdy IKEA bookshelves.",

  /** Used for SEO / browser tab / social previews. */
  description:
    "Personal site of Noah Finkelstein — Math-CS + Astrophysics student at Brown University and biostatistics researcher at MGH. Projects, experience, photos, and writing.",

  /** Your production URL once deployed (used for SEO/OpenGraph). */
  url: "https://noahfinkelstein.com",

  /** Contact email shown on the Contact section. */
  email: "nbfinkelstein@gmail.com",

  /**
   * Social links. Set `href` to "" to hide a link entirely.
   * `icon` matches a key in src/components/icons.tsx — add more there if needed.
   */
  socials: [
    // ↓ Add your GitHub URL here when ready (left blank so it stays hidden).
    { label: "GitHub", href: "", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/noah-finkelstein/", icon: "linkedin" },
    { label: "Email", href: "mailto:nbfinkelstein@gmail.com", icon: "mail" },
    // { label: "Twitter", href: "https://x.com/yourhandle", icon: "twitter" },
  ],

  /**
   * Top navigation. Each item links to a section id on the home page
   * (e.g. "#projects") or to a separate page (e.g. "/blog").
   * Reorder, rename, or remove items as you like.
   */
  nav: [
    { label: "About", href: "/#about" },
    { label: "Projects", href: "/#projects" },
    { label: "Experience", href: "/#experience" },
    { label: "Education", href: "/#education" },
    { label: "Photos", href: "/gallery" },
    { label: "Blog", href: "/blog" },
    { label: "Contact", href: "/#contact" },
  ],

  /** Optional: path to a resume PDF placed in /public (or "" to hide). */
  resumeUrl: "/resume.pdf",
} as const;
