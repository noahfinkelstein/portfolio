/**
 * ============================================================================
 *  EXPERIENCE  —  the timeline in the "Experience" section.
 * ============================================================================
 *
 * Each entry is one role (job, research, internship, leadership).
 * You can attach one or more PHOTOS per role — they show in a small strip
 * under the description. Drop images in /public/images/experience/ and
 * reference them by path.
 */

export type Experience = {
  role: string; // your title
  org: string; // company / lab / club
  location?: string;
  date: string; // e.g. "Jun 2026 – Aug 2026"
  bullets: string[]; // what you did / impact — keep them tight
  tags?: string[]; // optional tech/skill chips
  photos?: string[]; // optional: ["/images/experience/x.jpg", ...]
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
    photos: [], // e.g. ["/images/experience/mgh-1.jpg"]
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
