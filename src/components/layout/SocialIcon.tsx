/* ---------------------------------------------------------------------------
   A brand logo as inline SVG (24×24 path from src/lib/icons.ts). Decorative:
   the link around it carries the accessible name.
   Props: path (SVG path data), size (px, default 24), className.
   --------------------------------------------------------------------------- */

export default function SocialIcon({
  path,
  size = 24,
  className,
}: {
  path: string;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d={path} fill="currentColor" />
    </svg>
  );
}
