/* ---------------------------------------------------------------------------
   PROJECTS — the list on /projects. Newest first.

   Fields:
     date   the left column. Keep it short; about 13 characters fit.
     title  the project’s name
     kind   what it is, in a few words ("Systems course project")
     blurb  what it does, then the one interesting thing about how. Two or
            three sentences. Lead with the thing, not with why it matters.
     stack  tools, joined with " · " automatically
     links  omit when there is nothing public to point at. A dead link is
            worse than no link.
   --------------------------------------------------------------------------- */

export type Project = {
  date: string;
  title: string;
  kind?: string;
  blurb: string;
  stack?: string[];
  links?: { label: string; href: string }[];
};

export const projects: Project[] = [
  {
    date: "Apr 2026 –",
    title: "CourseTrees",
    kind: "Company, with Rohan Vittal",
    blurb:
      "A course catalog is a few thousand paragraphs with the prerequisites buried in the prose, which makes it a graph pretending to be a list. CourseTrees parses the prose back into edges and lets you walk the result: click a course and see what it needs and what it opens up, next to grade distributions, ratings, and degree requirements. Live across 150 universities. The layout is a force simulation written by hand and run in a web worker, because no off-the-shelf layout stayed readable at catalog scale.",
    stack: ["Next.js", "TypeScript", "Cytoscape", "Python", "PostgreSQL", "Supabase"],
    links: [{ label: "coursetrees.com", href: "https://coursetrees.com" }],
  },
  {
    date: "Aug 2026",
    title: "The Sopranos CLI",
    kind: "Terminal toy",
    blurb:
      "Prints a quote from The Sopranos next to an ASCII portrait of whoever said it. POSIX sh and awk, no dependencies, and the repository doubles as its own Homebrew tap. The portraits are hex-digit pixel grids rendered at runtime as grayscale Unicode half-blocks, two pixels per terminal cell, downsampled to whatever size your terminal happens to be.",
    stack: ["sh", "awk"],
    links: [
      { label: "GitHub", href: "https://github.com/noahfinkelstein/homebrew-sopranos" },
    ],
  },
  {
    date: "Jul–Aug 2026",
    title: "BrownSync",
    kind: "Campus map",
    blurb:
      "A live map of what is happening at Brown right now: events, club meetings, classes in session, athletics. It pulls from LiveWhale, an athletics calendar feed, campus news, and OpenStreetMap onto a 2.5D MapLibre map locked to College Hill. The TypeScript app and the Python ingestion pipeline share no code at all — they stay compatible by implementing one written data contract twice, as Zod schemas on one side and Pydantic models on the other.",
    stack: ["TypeScript", "MapLibre", "Python", "Zod", "Pydantic"],
    links: [{ label: "brownsync.pages.dev", href: "https://brownsync.pages.dev" }],
  },
  {
    date: "Jul 2026",
    title: "brown3d",
    kind: "Graphics",
    blurb:
      "Walk around Brown’s campus and downtown Providence in a browser. The 281 building footprints come from Brown’s public ArcGIS layers, extruded to heights read off USGS one-metre lidar and draped over terrain from the same survey; a Python pipeline turns 80 raw layers plus OpenStreetMap into the runtime assets. 272 buildings get a real lidar height, three are estimated from floor area, six fall back to a default, and the pipeline writes down which got which rather than hiding the difference.",
    stack: ["TypeScript", "three.js", "Vite", "Python"],
    links: [{ label: "GitHub", href: "https://github.com/noahfinkelstein/brown3d" }],
  },
  {
    date: "Jul 2026",
    title: "Campus Clash",
    kind: "iOS app, unreleased",
    blurb:
      "Students at the same school compete on the same daily minigames — sudoku, memory, archery, hoops — on a leaderboard gated by university email. The two arcade games are SpriteKit. The Firestore rules and Cloud Functions for scoring and weekly tournaments are written but not yet wired up, so for now it all runs on local state.",
    stack: ["Swift", "SwiftUI", "SpriteKit", "Firebase"],
  },
  {
    date: "Spring 2026",
    title: "Distributed key-value store",
    kind: "Systems course project",
    blurb:
      "A sharded key-value store in C++: a shard controller that assigns key ranges to servers, and a client that routes each operation to whichever server currently owns that key. There is one reader-writer lock per hash bucket, and multi-key operations sort and deduplicate their bucket indices before taking any of them, so two concurrent MultiPuts cannot deadlock against each other.",
    stack: ["C++", "Concurrency"],
  },
  {
    date: "Fall 2025",
    title: "BetaGo",
    kind: "Game agent",
    blurb:
      "A Go agent for the 9×9 board, written to compare greedy, minimax, alpha-beta, iterative deepening, and Monte Carlo tree search under a fixed per-move time budget. The winner was not the interesting-sounding one: alpha-beta at depth 3, with a small learned value network standing in for the stone-count heuristic, took 293 of 300 games from the greedy baseline and 99 of 100 from depth-2 alpha-beta, while MCTS never beat alpha-beta at any depth I tried.",
    stack: ["Python", "PyTorch"],
  },

  /* -------------------------------------------------------------------------
     Not shown. These are real and finished, but they are yours to decide on —
     delete the comment markers around any block to put it on the page.

  {
    date: "Jul–Aug 2026",
    title: "Ops Deck",
    kind: "Developer tool",
    blurb:
      "A local dashboard for watching several coding agents at once. It tails the transcript files Claude Code, Codex, and Cursor each write to disk, merges them into one event stream, and pushes that to a React UI over server-sent events. Its doctor command reports ok, unverified, or blocked, and never rounds unverified up to ok.",
    stack: ["TypeScript", "React", "Node"],
  },
  {
    date: "Jul 2026",
    title: "Warm Path",
    kind: "Job search tool",
    blurb:
      "Pulls postings from six applicant-tracking APIs across 350 companies into a local SQLite database, deduplicates them, and ranks them by keyword fit. A test suite fails the build if any connector grows a method that could log in or submit an application, so the pipeline can only ever read.",
    stack: ["Python", "SQLite"],
  },
  ------------------------------------------------------------------------- */
];
