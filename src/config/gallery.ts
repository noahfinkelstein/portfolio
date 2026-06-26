/**
 * ============================================================================
 *  GALLERY  —  general photos shown on the /gallery page.
 * ============================================================================
 *
 * These are photos NOT tied to a specific job (travel, hobbies, projects in
 * the wild, life at Brown, etc.). Work-specific photos go in experience.ts.
 *
 * To add a photo:
 *   1. Drop the file in /public/images/gallery/
 *   2. Add an entry below with its path and a short caption.
 *
 * `span` lets a photo take more space in the masonry grid:
 *   "tall"  → 2 rows,  "wide" → 2 columns,  "big" → 2x2,  undefined → 1x1.
 */

export type Photo = {
  src: string; // "/images/gallery/..."
  caption?: string; // optional text shown on hover / below
  alt: string; // accessibility description (always fill this in)
  span?: "tall" | "wide" | "big";
};

export const gallery: Photo[] = [
  // Replace these with real photos. Until you do, they render as placeholders.
  { src: "", alt: "Placeholder photo 1", caption: "A caption about this moment", span: "big" },
  { src: "", alt: "Placeholder photo 2", caption: "Somewhere fun" },
  { src: "", alt: "Placeholder photo 3", caption: "A project in the wild", span: "tall" },
  { src: "", alt: "Placeholder photo 4", caption: "With friends" },
  { src: "", alt: "Placeholder photo 5", caption: "Late-night build", span: "wide" },
  { src: "", alt: "Placeholder photo 6", caption: "On campus" },
];
