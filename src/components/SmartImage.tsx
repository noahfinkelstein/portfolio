/**
 * ============================================================================
 *  SMART IMAGE  —  next/image wrapper with empty-src placeholder support.
 * ============================================================================
 *
 * WHY THIS EXISTS:
 *   The site can ship before you've added real photos. Passing src="" renders
 *   a gradient placeholder with a label instead of a broken <img>.
 *
 * HOW IT WORKS:
 *   src === ""  → gradient <div> with placeholderLabel text
 *   src set     → next/image with automatic optimization (WebP, sizing, lazy load)
 *
 * FILL MODE:
 *   When fill={true}, the parent must be `position: relative` with explicit
 *   dimensions (e.g. aspect ratio box or fixed height). Image fills that box.
 */

import Image from "next/image";

type Props = {
  src: string; // path under /public, or "" for placeholder
  alt: string; // required for accessibility (even on placeholders)
  /** Parent must be relative + sized. Image absolutely fills the parent. */
  fill?: boolean;
  /** Only used when fill is false — explicit pixel dimensions. */
  width?: number;
  height?: number;
  /** Responsive hint for next/image srcset generation */
  sizes?: string;
  className?: string;
  /** Text shown on the placeholder when src is empty */
  placeholderLabel?: string;
};

export default function SmartImage({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className,
  placeholderLabel = "add a photo",
}: Props) {
  // --- Placeholder branch: no real file yet ---
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-accent/15 via-bg-soft to-bg-softer font-mono text-[11px] text-fg-muted ${className ?? ""}`}
        style={fill ? undefined : { width, height }}
        aria-label={alt}
        role="img"
      >
        {placeholderLabel}
      </div>
    );
  }

  // --- Real image branch: next/image optimization ---
  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      className={className}
    />
  );
}
