/* ---------------------------------------------------------------------------
   EXPERIENCE — the roles in "Research and work" on the CV (/cv), newest
   first, every bullet shown. A role whose `role` is listed in `currently`
   in home.ts and whose date ends with "–" is dated "… – now".

   To add a role, copy a block and edit it. Fields:
     date    the date column. Keep it short; ~13 characters fit before wrapping.
     role    your title
     org     employer or lab. Use `orgHref` to link it.
     place   city, or leave it out
     bullets what you actually did. Two or three is plenty.
     stack   tools, listed under the bullets on /cv. Omit to hide.
   --------------------------------------------------------------------------- */

export type Role = {
  date: string;
  role: string;
  org: string;
  orgHref?: string;
  place?: string;
  bullets: string[];
  stack?: string[];
};

export const experience: Role[] = [
  {
    date: "Aug 2026 –",
    role: "Campus Lead",
    org: "OpenAI Student Collective",
    place: "Providence, RI",
    bullets: [
      "Coordinated with the OpenAI team on campus workshops focused on ChatGPT, Codex, and AI-assisted development.",
    ],
  },
  {
    date: "Jun 2026 –",
    role: "Co-Founder and CEO",
    org: "CourseTrees",
    orgHref: "https://coursetrees.com",
    bullets: [
      "Built and deployed a web and iOS academic-planning platform using TypeScript, React, Next.js, and PostgreSQL/Supabase for course discovery, prerequisite visualization, and degree planning.",
      "Implemented AI-advising infrastructure with Redis-backed rate limiting, response caching, and spend controls.",
      "Grew CourseTrees to 450 registered users across 23 universities and secured a $2,500 non-dilutive Expand Grant from Brown’s Nelson Center for Entrepreneurship.",
    ],
    stack: ["TypeScript", "React", "Next.js", "PostgreSQL", "Supabase", "Redis"],
  },
  {
    date: "Jun–Aug 2026",
    role: "Applied Machine Learning Intern",
    org: "Massachusetts General Hospital, Biostatistics Research Group",
    place: "Boston, MA",
    bullets: [
      "Implemented a simulation study evaluating candidate Long COVID Research Index (LCRI) thresholds using LASSO-regularized k-means clustering for NIH RECOVER research; presented findings to senior statisticians.",
      "Parallelized simulation and analysis workflows and ported portions of an R/Tidyverse pipeline to Python for high-dimensional cohort analysis, reducing the data generation pipeline used to derive the LCRI from 12 hours to 3 hours.",
    ],
    stack: ["R", "Python", "scikit-learn"],
  },
  {
    date: "Nov 2024 – May 2026",
    role: "Deep Learning Researcher",
    org: "Prism",
    place: "Providence, RI",
    bullets: [
      "Modeled particle transport through dense polymer membranes using physics-informed neural networks, Monte Carlo simulation, and Brownian-motion models.",
      "Collaborated with Brown Engineering and Harvard’s Weitz Lab on computational methods for centrifugal particle filtration.",
    ],
    stack: ["Python", "PyTorch", "PINNs"],
  },
  {
    date: "May–Aug 2025",
    role: "Software Engineering Intern",
    org: "Biotech Stealth Startup",
    place: "Cambridge, MA",
    bullets: [
      "Built an internal workflow automation system in C++ that reduced manual data synchronization and triage time by 45%.",
    ],
    stack: ["C++"],
  },
  {
    date: "2023–2025",
    role: "Camp Specialist",
    org: "Albemarle Acres, Newton Parks and Recreation",
    place: "Newton",
    bullets: [
      "Taught music, drama, and creative writing to campers aged six to twelve.",
      "Trained and evaluated counselors-in-training, ran special events, and managed the teaching budget.",
    ],
  },
  {
    date: "Jan 2022 – May 2024",
    role: "Events Coordinator, MHSCL Committee Member, Advisor",
    org: "Massachusetts High School Chess League",
    place: "Boston, MA",
    bullets: [
      "Co-founded a student-run league of 200+ members across 25+ high schools, sponsored by Chess.com and the Massachusetts Chess Association (MACA).",
      "Ran tournaments in person and online.",
    ],
  },
];

/* ---------------------------------------------------------------------------
   EDUCATION — shown under the roles on the CV (/cv).
   --------------------------------------------------------------------------- */

export type School = {
  date: string;
  school: string;
  degree: string;
  note?: string;
  coursework?: string[];
  activities?: string[];
};

export const education: School[] = [
  {
    date: "2024–2028",
    school: "Brown University",
    degree: "Sc.B. Mathematics–Computer Science",
    note: "Expected May 2028. GPA 3.8. SAT 1560.",
    coursework: [
      "Machine Learning",
      "Deep Learning",
      "Computer Vision",
      "Data Structures & Algorithms",
      "Computer Systems",
    ],
    activities: [
      "Machine Intelligence Community",
      "Brown Space Engineering",
      "Quantitative Trading at Brown",
      "Chess Club",
      "Safewalk",
    ],
  },
];
