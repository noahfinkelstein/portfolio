/**
 * ============================================================================
 *  GALLERY DATA  —  photos on /gallery (not tied to a specific job).
 * ============================================================================
 *
 * Work-specific photos go in experience.ts instead.
 *
 * TO ADD A PHOTO:
 *   1. Drop file in /public/images/gallery/
 *   2. Add entry below with src, alt, optional caption and span
 *
 * span controls masonry grid cell size:
 *   undefined → 1×1 (default)
 *   "tall"    → 2 rows tall
 *   "wide"    → 2 columns wide
 *   "big"     → 2×2
 */

export type Photo = {
  src: string; // "/images/gallery/..." or "" for placeholder
  caption?: string; // hover overlay text
  alt: string; // accessibility — always describe the image
  span?: "tall" | "wide" | "big";
};

export const gallery: Photo[] = [
  { src: "", alt: "Placeholder photo 1", caption: "A caption about this moment", span: "big" },
  { src: "", alt: "Placeholder photo 2", caption: "Somewhere fun" },
  { src: "", alt: "Placeholder photo 3", caption: "A project in the wild", span: "tall" },
  { src: "", alt: "Placeholder photo 4", caption: "With friends" },
  { src: "", alt: "Placeholder photo 5", caption: "Late-night build", span: "wide" },
  { src: "", alt: "Placeholder photo 6", caption: "On campus" },
];
