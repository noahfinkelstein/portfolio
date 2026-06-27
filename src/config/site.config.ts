/**
 * ============================================================================
 *  SITE CONFIG  —  your identity, links, and navigation.
 * ============================================================================
 *
 * Edit this file for: name, tagline, hero words, email, socials, nav menu.
 * No visual styling here — that's theme.config.ts.
 *
 * CONSUMED BY:
 *   layout.tsx      → metadata (title, description, OpenGraph)
 *   Hero.tsx        → name, role, tagline, rotating words
 *   Nav.tsx         → nav links
 *   Contact.tsx     → email, socials
 *   Footer.tsx      → socials
 */

export const site = {
  /** Full name — hero headline and browser tab */
  name: "Noah Finkelstein",

  /** Short role line — hero eyebrow (above the big headline) */
  role: "Math-CS + Astrophysics @ Brown",

  /**
   * Hero "I do ___" rotation. Cycles every 2.2s in Hero.tsx.
   * Add, remove, or reorder freely.
   */
  heroRotatingWords: [
    "Full Stack Development",
    "Machine Learning",
    "Aerospace Engineering",
    "Pure Mathematics",
    "Astrophysics",
    "Applied Mathematics",
    "Robotics",
    "Quantitative Trading",
    "Data Science"
  ],

  /** Paragraph below the hero headline */
  heroTagline:
    "Rising junior at Brown studying Mathematics-Computer Science and Astrophysics. Machine-learning enthusiast and full-stack developer who loves building things — from scalable software to dubiously sturdy IKEA bookshelves.",

  /** SEO meta description + OpenGraph */
  description:
    "Noah Finkelstein",

  /** Production URL for canonical links and OpenGraph */
  url: "https://noahfinkelstein.com",

  /** Shown on Contact section and mailto links */
  email: "nbfinkelstein@gmail.com",

  /**
   * Social links. `href: ""` hides the link (filtered in Contact/Footer).
   * `icon` must match a key in src/components/icons.tsx.
   */
  socials: [
  // ↓ Add GitHub URL when ready (blank href = hidden)
    { label: "GitHub", href: "", icon: "github" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/noah-finkelstein/", icon: "linkedin" },
    { label: "Email", href: "mailto:nbfinkelstein@gmail.com", icon: "mail" },
    // { label: "Twitter", href: "https://x.com/yourhandle", icon: "twitter" },
  ],

  /**
   * Top nav items. `href` can be:
   *   /#section-id  → scroll to home page section (must match Section id=)
   *   /blog         → separate Next.js page
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

  /** Resume PDF path under /public, or "" to hide resume link if you add one */
  resumeUrl: "/resume.pdf",
} as const;
