/**
 * SmartImage — use this anywhere you show a photo.
 *
 * Why it exists: it lets the whole site work BEFORE you've added any real
 * photos. If you pass an empty `src` (""), it renders a tasteful gradient
 * placeholder with a label instead of a broken image. As soon as you set a
 * real path (e.g. "/images/projects/foo.png"), the real photo shows.
 *
 * It wraps next/image, so you still get automatic optimization for real photos.
 */
import Image from "next/image";

type Props = {
  src: string; // "" → placeholder, otherwise a path under /public
  alt: string;
  /** Fill the parent (parent must be `relative` with a set size). */
  fill?: boolean;
  /** Used only when `fill` is false. */
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  /** Text shown on the placeholder when src is empty. */
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
  // No real image yet → friendly placeholder.
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-accent/15 via-bg-soft to-bg-softer font-mono text-[11px] text-fg-muted ${className ?? ""}`}
        // When not using `fill`, give the placeholder the requested box size.
        style={fill ? undefined : { width, height }}
        aria-label={alt}
        role="img"
      >
        {placeholderLabel}
      </div>
    );
  }

  // Real image.
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
