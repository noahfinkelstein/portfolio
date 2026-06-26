/**
 * Small inline SVG icons (no icon library dependency).
 * To add a new social icon: add a new entry to the `icons` map below, then
 * reference its key from site.config.ts `socials[].icon`.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const icons: Record<string, (p: IconProps) => JSX.Element> = {
  github: (p) => (
    <svg {...base(p)} fill="currentColor" stroke="none">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49v-1.7c-2.78.62-3.37-1.21-3.37-1.21-.46-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.4 9.4 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9v2.82c0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z" />
    </svg>
  ),
  linkedin: (p) => (
    <svg {...base(p)} fill="currentColor" stroke="none">
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm6 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.29-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.85V21H9V9Z" />
    </svg>
  ),
  mail: (p) => (
    <svg {...base(p)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  twitter: (p) => (
    <svg {...base(p)} fill="currentColor" stroke="none">
      <path d="M18.9 2H22l-7.3 8.34L23 22h-6.6l-5.18-6.77L5.3 22H2.2l7.8-8.92L1.3 2H8l4.7 6.2L18.9 2Zm-1.16 18h1.71L7.34 3.8H5.5L17.74 20Z" />
    </svg>
  ),
  arrowDown: (p) => (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12l7 7 7-7" />
    </svg>
  ),
  arrowUpRight: (p) => (
    <svg {...base(p)}>
      <path d="M7 17 17 7M7 7h10v10" />
    </svg>
  ),
};

/** Convenience component: <Icon name="github" /> */
export function Icon({ name, ...props }: { name: string } & IconProps) {
  const Cmp = icons[name];
  if (!Cmp) return null;
  return Cmp(props);
}
