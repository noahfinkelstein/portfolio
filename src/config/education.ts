/**
 * ============================================================================
 *  EDUCATION DATA  —  school cards in the Education section.
 * ============================================================================
 *
 * coursework and honors are optional chip lists — use [] or omit to hide.
 */

export type School = {
  school: string; // institution name
  degree: string; // degree + concentration
  date: string; // e.g. "2024 – 2028"
  gpa?: string; // optional, e.g. "3.8 / 4.0"
  note?: string; // optional activities / focus one-liner
  coursework?: string[]; // optional course name chips
  honors?: string[]; // optional award chips (accent border in UI)
};

export const education: School[] = [
  {
    school: "Brown University",
    degree: "Sc.B. Mathematics–Computer Science + Physics (Astrophysics Track)",
    date: "2024 – 2028",
    gpa: "3.8 / 4.0",
    note: "Activities: Quantitative Trading at Brown, Brown Space Engineering (ADCS & Ground Software), Machine Intelligence Community, Chess Club (Collegiate Chess League), Astronomy Club.",
    coursework: [
      "Real Analysis",
      "Abstract Algebra",
      "Number Theory",
      "Graph Theory",
      "Theory of Computation",
      "Deep Learning",
      "Machine Learning",
      "Foundations of AI",
      "Applied Cryptography",
      "Quantum Mechanics",
      "Electricity & Magnetism",
      "Analytical Mechanics",
    ],
    honors: ["National Merit Commended Scholar"],
  },
  {
    school: "Newton North High School",
    degree: "High School Diploma",
    date: "2020 – 2024",
    gpa: "3.95 / 4.0 (unweighted)",
    note: "Chess Club President · Economics Challenge Team President · Classics Club Co-President.",
    honors: [
      "AP Scholar with Distinction",
      "Seal of Biliteracy (English & Latin)",
      "National Latin Exam — Gold Medal",
    ],
  },
];
