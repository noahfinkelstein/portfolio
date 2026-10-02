/* ---------------------------------------------------------------------------
   TorusKnotSvg — the hero figure as a static ink drawing: the trefoil, a
   (2,3) torus knot, in inline SVG. It is the figure before the canvas is
   ready, and all of it when WebGL is unavailable or JavaScript is off.
   Server component (Hero.tsx renders it and hands it to HeroFigure as a
   child), so the markup is in the server-rendered HTML and the geometry is
   computed once, at build time.

   The curve and the viewing angle come from knot.ts, the same ones the
   three.js scene uses, projected orthographically. It is drawn as solid
   strokes in --scene-wire with a small gap on each side wherever a strand
   passes beneath another, like a knot diagram in print: a sample of the
   curve is left out when another part of the curve, far away along the
   string, passes within GAP of it on the page and nearer the viewer. The
   strand is then drawn as the runs of samples that remain.

   Props:
     className   class for the <svg> (the owner positions and sizes it)
   --------------------------------------------------------------------------- */

import { KNOT_INK, KNOT_SHAPE, KNOT_VIEW, viewPoint, type Vec3 } from "./knot";

/** Samples along the curve. */
const STEPS = 720;
/** Stroke width, in knot units (the canvas's ink tube is this wide). */
const STROKE = 2 * KNOT_INK.inkRadius;
/** Half-width of the break around an over-strand, to the end of the stroke. */
const GAP = KNOT_INK.gapRadius + KNOT_INK.inkRadius;
/** Samples closer than this along the curve are the same strand, not a crossing. */
const SAME_STRAND = STEPS / 12;

const points: Vec3[] = Array.from({ length: STEPS }, (_, i) => viewPoint((i / STEPS) * Math.PI * 2));

const hidden: boolean[] = points.map(([x, y, z], i) =>
  points.some(([ox, oy, oz], j) => {
    const apart = Math.abs(i - j);
    if (Math.min(apart, STEPS - apart) <= SAME_STRAND) return false;
    return oz > z && Math.hypot(ox - x, oy - y) < GAP;
  }),
);

/** The visible runs of the closed curve, as SVG polyline point lists. */
function visibleRuns(): string[] {
  const format = (i: number) => `${points[i][0].toFixed(3)},${(-points[i][1]).toFixed(3)}`;
  const start = hidden.findIndex((h, i) => h && !hidden[(i + 1) % STEPS]);
  if (start === -1) {
    /* No crossings found: one closed loop. */
    return [[...points.keys(), 0].map(format).join(" ")];
  }
  const runs: string[] = [];
  let run: string[] = [];
  for (let k = 1; k <= STEPS; k++) {
    const i = (start + k) % STEPS;
    if (hidden[i]) {
      if (run.length > 1) runs.push(run.join(" "));
      run = [];
    } else {
      run.push(format(i));
    }
  }
  if (run.length > 1) runs.push(run.join(" "));
  return runs;
}

const runs = visibleRuns();

const HALF = (KNOT_SHAPE.R + KNOT_SHAPE.A + KNOT_INK.gapRadius) / KNOT_VIEW.fill;
const VIEW_BOX = `${-HALF} ${-HALF} ${2 * HALF} ${2 * HALF}`;

export type TorusKnotSvgProps = {
  className?: string;
};

export default function TorusKnotSvg({ className }: TorusKnotSvgProps) {
  return (
    <svg
      className={className}
      viewBox={VIEW_BOX}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="var(--scene-wire)" strokeWidth={STROKE} strokeLinecap="round" strokeLinejoin="round">
        {runs.map((run, i) => (
          <polyline key={i} points={run} />
        ))}
      </g>
    </svg>
  );
}
