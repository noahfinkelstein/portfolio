/**
 * ============================================================================
 *  EXPERIENCE DATA  —  timeline entries in the Experience section.
 * ============================================================================
 *
 * Each object = one role (job, research, internship, leadership).
 *
 * PHOTOS (optional):
 *   Drop images in /public/images/experience/
 *   Add paths to the photos array — renders as thumbnail strip under bullets.
 */

export type Experience = {
  role: string; // your title at the org
  org: string; // company, lab, or club name
  location?: string; // city or "Remote" — omit to hide
  date: string; // e.g. "Jun 2026 – Present"
  bullets: string[]; // impact bullets — keep tight and specific
  tags?: string[]; // optional skill/tech chips
  photos?: string[]; // optional: ["/images/experience/photo.jpg"]
};

export const experience: Experience[] = [
  {
    role: "Research Student",
    org: "Mass General Hospital",
    location: "Boston, MA",
    date: "Jun 2026 – Present",
    bullets: [
      "Conducting research with the MGH Biostatistics group on the RECOVER Initiative (Long COVID).",
      "Implementing an ML-derived framework for testing different Long COVID Research Index thresholds.",
      "Using R to assist across a variety of RECOVER subprojects.",
    ],
    tags: ["R", "Python", "Biostatistics", "Machine Learning"],
    photos: [],
  },
  {
    role: "Co-Founder & CEO",
    org: "CourseTrees",
    location: "coursetrees.com",
    date: "May 2026 – Present",
    bullets: [
      "Co-founded and built an interactive course-catalog visualization platform now covering 120+ schools.",
      "Lead full-stack development (Next.js + Supabase) and the data-scraping pipeline.",
    ],
    tags: ["Next.js", "TypeScript", "Supabase", "Python"],
    photos: [],
  },
  {
    role: "Camp Specialist",
    org: "City of Newton, MA",
    location: "Albemarle Acres Summer Camp",
    date: "Jun 2023 – Aug 2025",
    bullets: [
      "Trained and evaluated counselors-in-training and organized special events.",
      "Taught Music, Drama, and Creative Writing; managed the teaching budget and materials.",
    ],
    tags: ["Leadership", "Teaching"],
    photos: [],
  },
  {
    role: "Events Coordinator & Management Team",
    org: "Massachusetts High School Chess League",
    location: "Massachusetts",
    date: "May 2022 – May 2024",
    bullets: [
      "Helped run a 20-school, 250+ member league on a six-person management team.",
      "Coordinated in-person and online tournaments and managed sponsorships (Chess.com, MACA, Boylston Chess Club).",
    ],
    tags: ["Operations", "Chess"],
    photos: [],
  },
];
