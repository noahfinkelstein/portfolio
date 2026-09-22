/* ---------------------------------------------------------------------------
   EXPERIENCE — the list on /experience. Newest first.

   To add a role, copy a block and edit it. Fields:
     date    the left column. Keep it short; ~13 characters fit before wrapping.
     role    your title
     org     employer or lab. Use `orgHref` to link it.
     place   city, or leave it out
     bullets what you actually did. Two or three is plenty.
     stack   tools, joined with " · " automatically. Omit to hide the line.
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
    date: "Jun–Aug 2026",
    role: "Research Student",
    org: "Massachusetts General Hospital, Biostatistics Research Group",
    place: "Boston",
    bullets: [
      "Ran a simulation study testing alternative thresholds for the Long COVID Research Index, using LASSO-regularized k-means over 40-dimensional negative-unlabeled cohort data and comparing how the choice of distance metric changed the answer.",
      "Cut the runtime of the analysis pipeline with multithreaded parallel computation, and ported parts of it out of R’s Tidyverse into Python.",
      "The work sits inside the NIH RECOVER Initiative, a $1.8 billion study with roughly 30,000 enrolled participants.",
    ],
    stack: ["R", "Python", "scikit-learn"],
  },
  {
    date: "Apr 2026 –",
    role: "Co-Founder and CEO",
    org: "CourseTrees",
    orgHref: "https://coursetrees.com",
    bullets: [
      "Co-founded and built a course-planning tool that draws a university’s catalog as a graph: 400,000 courses and 220,000 prerequisite edges across 150 universities.",
      "Wrote most of the stack: Next.js and React on the front, Python scrapers and PostgreSQL behind them, deployed on Vercel and Supabase.",
      "200 users and 3,500 page requests in the first day. Sponsored by Brown’s First-Year Advising and Meiklejohn Peer Advising programs, and funded to move the heavier jobs onto AWS.",
    ],
    stack: ["Next.js", "TypeScript", "Python", "PostgreSQL", "Supabase"],
  },
  {
    date: "Nov 2024 –",
    role: "Machine Learning Researcher",
    org: "Bari–Hazeltine Applied Fluid Dynamics Group, Brown University",
    place: "Providence",
    bullets: [
      "Model how particles move through dense polymer membranes under centrifugal filtration, using physics-informed neural networks, Monte Carlo methods, and Brownian motion.",
      "Joint work with Brown’s School of Engineering and the Weitz experimental soft condensed matter group at Harvard.",
    ],
    stack: ["Python", "PyTorch", "PINNs"],
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
    date: "2022–2024",
    role: "Events Coordinator and Committee Member",
    org: "Massachusetts High School Chess League",
    place: "Boston",
    bullets: [
      "Co-founded a student-run league that grew to more than 200 members across 25 high schools.",
      "Ran tournaments in person and online, and handled sponsorships from Chess.com and the Massachusetts Chess Association.",
    ],
  },
];

/* ---------------------------------------------------------------------------
   EDUCATION — shown under the roles on /experience.
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
    degree: "Sc.B. Mathematics–Computer Science and A.B. Physics",
    note: "Expected May 2028. GPA 3.8.",
    coursework: [
      "Abstract Algebra",
      "Graph Theory",
      "Linear Algebra with Theory",
      "Statistics with Theory",
      "Quantum Mechanics",
      "Machine Learning",
      "Deep Learning",
      "Artificial Intelligence",
      "Data Structures and Algorithms",
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
