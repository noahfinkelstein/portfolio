/* ---------------------------------------------------------------------------
   TorusKnotSvg — a static (2,3) torus knot as inline SVG: the hero figure
   before the canvas is ready, and all of it when WebGL is unavailable or
   JavaScript is off. Server component (Hero.tsx renders it and hands it to
   HeroFigure as a child), so the markup is in the server-rendered HTML and
   the geometry is computed once, at build time.

   Four parallel strands around the knot's tube, tilted and projected
   orthographically (the same projection as scripts/og-card.html), plus a
   ring of dots along the main strand like the canvas's points. Strokes are
   --scene-wire, dots --scene-point, the whole thing at --scene-opacity, so
   it follows the theme.

   Props:
     className   class for the <svg> (the owner positions and sizes it)
   --------------------------------------------------------------------------- */

const P = 2;
const Q = 3;
const R = 0.78;
const STEPS = 320;
const DOTS = 90;
const TILT_X = 0.9;
const TILT_Y = 0.55;
/** Tube radii of the strands; the second one is the main strand. */
const STRANDS = [0.26, 0.3, 0.34, 0.38];
const MAIN = 1;

/** Tilt about x, then y, and drop z (orthographic). Returns [x, -y] for SVG. */
function project(x: number, y: number, z: number): [string, string] {
  const y1 = y * Math.cos(TILT_X) - z * Math.sin(TILT_X);
  const z1 = y * Math.sin(TILT_X) + z * Math.cos(TILT_X);
  const x2 = x * Math.cos(TILT_Y) + z1 * Math.sin(TILT_Y);
  return [x2.toFixed(3), (-y1).toFixed(3)];
}

function knotPoint(t: number, r: number): [string, string] {
  const w = R + r * Math.cos(Q * t);
  return project(w * Math.cos(P * t), w * Math.sin(P * t), r * Math.sin(Q * t));
}

const strands: string[] = STRANDS.map((r) => {
  const points: string[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const [x, y] = knotPoint((i / STEPS) * Math.PI * 2, r);
    points.push(`${x},${y}`);
  }
  return points.join(" ");
});

const dots: Array<[string, string]> = Array.from({ length: DOTS }, (_, i) =>
  knotPoint((i / DOTS) * Math.PI * 2, STRANDS[MAIN]),
);

export type TorusKnotSvgProps = {
  className?: string;
};

export default function TorusKnotSvg({ className }: TorusKnotSvgProps) {
  return (
    <svg
      className={className}
      viewBox="-1.5 -1.5 3 3"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="var(--scene-wire)" strokeLinejoin="round" opacity="var(--scene-opacity)">
        {strands.map((points, i) => (
          <polyline
            key={i}
            points={points}
            strokeWidth={i === MAIN ? 0.016 : 0.009}
            opacity={i === MAIN ? 0.95 : 0.6}
          />
        ))}
      </g>
      <g fill="var(--scene-point)" opacity="var(--scene-opacity)">
        {dots.map(([cx, cy], i) => (
          <circle key={i} cx={cx} cy={cy} r="0.014" />
        ))}
      </g>
    </svg>
  );
}
