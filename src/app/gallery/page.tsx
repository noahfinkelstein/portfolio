/**
 * GALLERY PAGE (/gallery) — a masonry-style grid of general photos.
 * Edit the photos in src/config/gallery.ts.
 */
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import SmartImage from "@/components/SmartImage";
import { gallery } from "@/config/gallery";

export const metadata: Metadata = {
  title: "Photos",
  description: "A gallery of photos.",
};

// Maps a photo's `span` to the grid classes that make it bigger.
const spanClass: Record<string, string> = {
  tall: "row-span-2",
  wide: "col-span-2",
  big: "col-span-2 row-span-2",
};

export default function GalleryPage() {
  return (
    <>
      <Nav />
      <main className="container-col py-16">
        <p className="eyebrow">Gallery</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight sm:text-5xl">
          Photos
        </h1>
        <p className="mt-4 max-w-xl text-fg-muted">
          A mix of moments — projects in the wild, travel, and life at Brown.
        </p>

        {/* Auto-rows give the masonry effect; `span` makes some photos bigger. */}
        <div className="mt-10 grid auto-rows-[180px] grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {gallery.map((photo, i) => (
            <figure
              key={i}
              className={`group relative overflow-hidden rounded-xl border border-border ${
                photo.span ? spanClass[photo.span] : ""
              }`}
            >
              <SmartImage
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                placeholderLabel="add a photo"
              />

              {/* Caption overlay (only if a caption is set). */}
              {photo.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-bg to-transparent p-3 text-sm text-fg transition-transform duration-300 group-hover:translate-y-0">
                  {photo.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
