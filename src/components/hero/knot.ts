/* ---------------------------------------------------------------------------
   KNOT — the shape and the viewing angle of the hero figure ("Fig. 1"),
   shared by the three.js scene (torusScene.ts) and the static SVG
   (TorusKnotSvg.tsx) so the two draw the same knot from the same angle.
   Plain math, no three.js, safe to import from a server component.

     KNOT_SHAPE     the (2,3) torus knot, the trefoil, around a torus of
                    major radius R and minor radius A, axis vertical (y)
     KNOT_VIEW      tilt: how far the vertical axis is tipped toward the
                    viewer (radians about x); turn: the rest angle about the
                    vertical axis; fill: the knot's bounding radius as a
                    share of the figure box's shorter half-side
     KNOT_INK       the ink line's radius and the half-width of the break
                    cut around a strand where it passes over another (knot
                    units)
     knotPoint(t)   point on the curve at t in 0…2π, in knot space
     viewPoint(t)   the same point turned and tilted into view space:
                    x right, y up, z toward the viewer
   --------------------------------------------------------------------------- */

export const KNOT_SHAPE = { p: 2, q: 3, R: 2, A: 0.9 } as const;

export const KNOT_VIEW = { tilt: 1.2, turn: Math.PI / 2, fill: 0.86 } as const;

export const KNOT_INK = { inkRadius: 0.026, gapRadius: 0.095 } as const;

export type Vec3 = [number, number, number];

export function knotPoint(t: number): Vec3 {
  const { p, q, R, A } = KNOT_SHAPE;
  const r = R + A * Math.cos(q * t);
  return [r * Math.cos(p * t), A * Math.sin(q * t), r * Math.sin(p * t)];
}

/**
 * Turn about y by `turn`, then tilt about x by `tilt`: the same order and
 * sign as the scene's groups (three.js rotation matrices).
 */
export function viewPoint(t: number, turn: number = KNOT_VIEW.turn, tilt: number = KNOT_VIEW.tilt): Vec3 {
  const [x, y, z] = knotPoint(t);
  const ct = Math.cos(turn);
  const st = Math.sin(turn);
  const x1 = x * ct + z * st;
  const z1 = -x * st + z * ct;
  const cx = Math.cos(tilt);
  const sx = Math.sin(tilt);
  return [x1, y * cx - z1 * sx, y * sx + z1 * cx];
}
