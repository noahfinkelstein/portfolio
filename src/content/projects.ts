/* ---------------------------------------------------------------------------
   PROJECTS — /projects, and the first three `featured` ones on the home page.
   Newest first. Adding a project is one block.

   Fields:
     slug      short id, lowercase-with-dashes. Media lives at
               public/projects/<slug>/...
     title     the project's name
     date      shown small next to the status. About 13 characters fit.
     status    one or two words next to the date: "Live", "Open source",
               "Unreleased", "Course project". Be honest.
     kind      one line under the title that adds something the status does
               not ("Co-founded with Rohan Vittal"). Leave it out otherwise.
     blurb     what it does, then the one interesting thing about how. Two or
               three sentences. Lead with the thing, not with why it matters.
     stack     tools, shown as a plain list under the blurb
     links     omit when there is nothing public to point at. A dead link is
               worse than no link. The title (and the media) link to the first one.
     media     a real screenshot or screen recording. Omit it and the row
               shows a plain title tile instead. Never a mock-up.
     featured  true = shown in "Projects" on the home page (the first three)
     hidden    true = kept here, never rendered anywhere
   --------------------------------------------------------------------------- */

export type ProjectLink = { label: string; href: string };

export type ProjectMedia =
  | {
      type: "video";
      /** MP4 (H.264) loop, muted. */
      src: string;
      /** Optional WebM alternative, listed first when present. */
      srcWebm?: string;
      /** Still frame shown before the video plays and for reduced motion. */
      poster: string;
      alt: string;
      width: number;
      height: number;
    }
  | {
      type: "image";
      src: string;
      alt: string;
      width: number;
      height: number;
    };

export type Project = {
  slug: string;
  title: string;
  date: string;
  status: string;
  kind?: string;
  blurb: string;
  stack?: string[];
  links?: ProjectLink[];
  media?: ProjectMedia;
  featured?: boolean;
  hidden?: boolean;
};

export const projects: Project[] = [
  {
    slug: "coursetrees",
    date: "Apr 2026 – now",
    title: "CourseTrees",
    status: "Live",
    kind: "Co-founded with Rohan Vittal",
    blurb:
      "A course catalog is a few thousand paragraphs with the prerequisites buried in the prose, which makes it a graph pretending to be a list. CourseTrees parses the prose back into edges and lets you walk the result: click a course and see what it needs and what it opens up, next to grade distributions, ratings, and degree requirements. Live across 150 universities. The layout is a force simulation written by hand and run in a web worker, because no off-the-shelf layout stayed readable at catalog scale.",
    stack: ["Next.js", "TypeScript", "Cytoscape", "Python", "PostgreSQL", "Supabase"],
    links: [{ label: "coursetrees.com", href: "https://coursetrees.com" }],
    media: {
      type: "video",
      src: "/projects/coursetrees/hero-graph.mp4",
      poster: "/projects/coursetrees/hero-graph-poster.webp",
      alt: "The CourseTrees map of Brown's courses: colour-coded course nodes joined by prerequisite arrows, clustered by department.",
      width: 1440,
      height: 810,
    },
    featured: true,
  },
  {
    slug: "sopranos-cli",
    date: "Aug 2026",
    title: "The Sopranos CLI",
    status: "Open source",
    kind: "A terminal toy that is also its own Homebrew tap",
    blurb:
      "Prints a quote from The Sopranos next to an ASCII portrait of whoever said it. POSIX sh and awk, no dependencies, and the repository doubles as its own Homebrew tap. The portraits are hex-digit pixel grids rendered at runtime as grayscale Unicode half-blocks, two pixels per terminal cell, downsampled to whatever size your terminal happens to be.",
    stack: ["sh", "awk"],
    links: [
      { label: "GitHub", href: "https://github.com/noahfinkelstein/homebrew-sopranos" },
    ],
    media: {
      type: "video",
      src: "/projects/sopranos-cli/loop-desktop.mp4",
      poster: "/projects/sopranos-cli/loop-desktop-poster.webp",
      alt: "A terminal running sopranos: a grayscale half-block portrait of Tony Soprano above one of his quotes.",
      width: 1600,
      height: 1000,
    },
  },
  {
    slug: "brownsync",
    date: "Jul–Aug 2026",
    title: "BrownSync",
    status: "Live",
    kind: "A live map of what is happening on campus",
    blurb:
      "A live map of what is happening at Brown right now: events, club meetings, classes in session, athletics. It pulls from LiveWhale, an athletics calendar feed, campus news, and OpenStreetMap onto a 2.5D MapLibre map locked to College Hill. The TypeScript app and the Python ingestion pipeline share no code at all — they stay compatible by implementing one written data contract twice, as Zod schemas on one side and Pydantic models on the other.",
    stack: ["TypeScript", "MapLibre", "Python", "Zod", "Pydantic"],
    links: [{ label: "brownsync.pages.dev", href: "https://brownsync.pages.dev" }],
    media: {
      type: "video",
      src: "/projects/brownsync/campus-drift-loop.mp4",
      poster: "/projects/brownsync/campus-drift-loop-poster.webp",
      alt: "BrownSync's 3D map of College Hill, with buildings that have classes in session lit up and a feed of upcoming events beside it.",
      width: 1600,
      height: 1000,
    },
    featured: true,
  },
  {
    slug: "brown3d",
    date: "Jul 2026",
    title: "brown3d",
    status: "Open source",
    kind: "Campus and downtown Providence, in three.js",
    blurb:
      "Walk around Brown’s campus and downtown Providence in a browser. The 281 building footprints come from Brown’s public ArcGIS layers, extruded to heights read off USGS one-metre lidar and draped over terrain from the same survey; a Python pipeline turns 80 raw layers plus OpenStreetMap into the runtime assets. 272 buildings get a real lidar height, three are estimated from floor area, six fall back to a default, and the pipeline writes down which got which rather than hiding the difference.",
    stack: ["TypeScript", "three.js", "Vite", "Python"],
    links: [{ label: "GitHub", href: "https://github.com/noahfinkelstein/brown3d" }],
    media: {
      type: "video",
      src: "/projects/brown3d/aerial-orbit-main-green.mp4",
      poster: "/projects/brown3d/aerial-orbit-main-green-poster.webp",
      alt: "An aerial view in brown3d over Brown's Main Green, with extruded brick buildings running to the horizon.",
      width: 1600,
      height: 1000,
    },
    featured: true,
  },
  {
    slug: "campus-clash",
    date: "Jul 2026",
    title: "Campus Clash",
    status: "Unreleased",
    kind: "An iOS app of daily minigames for your campus",
    blurb:
      "Students at the same school compete on the same daily minigames — sudoku, memory, archery, hoops — on a leaderboard gated by university email. The two arcade games are SpriteKit. The Firestore rules and Cloud Functions for scoring and weekly tournaments are written but not yet wired up, so for now it all runs on local state.",
    stack: ["Swift", "SwiftUI", "SpriteKit", "Firebase"],
  },
  {
    slug: "kvstore",
    date: "Spring 2026",
    title: "Distributed key-value store",
    status: "Course project",
    blurb:
      "A sharded key-value store in C++: a shard controller that assigns key ranges to servers, and a client that routes each operation to whichever server currently owns that key. There is one reader-writer lock per hash bucket, and multi-key operations sort and deduplicate their bucket indices before taking any of them, so two concurrent MultiPuts cannot deadlock against each other.",
    stack: ["C++", "Concurrency"],
    media: {
      type: "video",
      src: "/projects/kvstore/loop-control-plane.mp4",
      poster: "/projects/kvstore/poster-control-plane.webp",
      alt: "Terminal panes for the shard controller, a client and three servers, showing key ranges being moved between servers.",
      width: 1600,
      height: 1000,
    },
  },
  {
    slug: "betago",
    date: "Fall 2025",
    title: "BetaGo",
    status: "Course project",
    kind: "A Go agent for the 9×9 board",
    blurb:
      "A Go agent for the 9×9 board, written to compare greedy, minimax, alpha-beta, iterative deepening, and Monte Carlo tree search under a fixed per-move time budget. The winner was not the interesting-sounding one: alpha-beta at depth 3, with a small learned value network standing in for the stone-count heuristic, took 293 of 300 games from the greedy baseline and 99 of 100 from depth-2 alpha-beta, while MCTS never beat alpha-beta at any depth I tried.",
    stack: ["Python", "PyTorch"],
  },

  /* -------------------------------------------------------------------------
     Hidden. These are real and finished, but they are yours to decide on —
     delete `hidden: true` from a block to put it on the site.
     ------------------------------------------------------------------------- */
  {
    slug: "ops-deck",
    date: "Jul–Aug 2026",
    title: "Ops Deck",
    status: "Unpublished",
    blurb:
      "A local dashboard for watching several coding agents at once. It tails the transcript files Claude Code, Codex, and Cursor each write to disk, merges them into one event stream, and pushes that to a React UI over server-sent events. Its doctor command reports ok, unverified, or blocked, and never rounds unverified up to ok.",
    stack: ["TypeScript", "React", "Node"],
    hidden: true,
  },
  {
    slug: "warm-path",
    date: "Jul 2026",
    title: "Warm Path",
    status: "Unpublished",
    blurb:
      "Pulls postings from six applicant-tracking APIs across 350 companies into a local SQLite database, deduplicates them, and ranks them by keyword fit. A test suite fails the build if any connector grows a method that could log in or submit an application, so the pipeline can only ever read.",
    stack: ["Python", "SQLite"],
    hidden: true,
  },
];

/** Every project that may appear on the site, in file order. */
export function getProjects(): Project[] {
  return projects.filter((p) => !p.hidden);
}

/** The home page's "Projects": featured and visible, in file order. */
export function getFeaturedProjects(limit = 3): Project[] {
  return getProjects()
    .filter((p) => p.featured)
    .slice(0, limit);
}

export function getProject(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug);
}
