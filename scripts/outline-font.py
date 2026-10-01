"""Build an overlap-free Montserrat Black (wght 900) for -webkit-text-stroke.

Montserrat's capitals are drawn from overlapping contours (A = legs + bar,
H = stems + bar, ...). A stroked outline shows every contour, so the seams
appear inside the letters. This script:

  1. instances Montserrat[wght].ttf (OFL, v8.000) at wght=900
  2. subsets it to Latin (what the outlined titles can contain)
  3. merges each glyph's contours under the nonzero fill rule (shapely:
     node every contour, polygonize, keep faces with winding != 0, union)
  4. writes the merged outlines back (curves flattened to line segments at
     a 0.4-unit tolerance on a 1000-unit em: < 0.05 px at 100 px type)
  5. renames the family and saves WOFF2 (+ a TTF for checking)

Source: Montserrat-VariableFont_wght.ttf, v8.000, from google/fonts
(ofl/montserrat), SIL OFL 1.1 with no Reserved Font Name, so a modified
copy is allowed; the license ships next to the output as
src/app/fonts/OFL-Montserrat.txt.

Needs fonttools, brotli and shapely (no skia-pathops). Usage:
  python3 scripts/outline-font.py Montserrat[wght].ttf /tmp/out
  cp /tmp/out/MontserratBlack-Outline.woff2 src/app/fonts/
"""

import math
import sys
from pathlib import Path

from fontTools.pens.basePen import BasePen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from shapely.geometry import LineString, MultiPolygon, Point, Polygon
from shapely.geometry.polygon import orient
from shapely.ops import polygonize, unary_union

TOL = 0.4

UNICODES = (
    list(range(0x20, 0x7F))
    + list(range(0xA0, 0x180))  # Latin-1 + Latin Extended-A
    + [0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x2032, 0x2033, 0x20AC, 0x2122]
)


class FlattenPen(BasePen):
    """Collects contours as lists of (x, y), flattening curves."""

    def __init__(self, glyphSet=None):
        super().__init__(glyphSet)
        self.contours = []
        self.cur = None

    def _moveTo(self, pt):
        self.cur = [pt]

    def _lineTo(self, pt):
        self.cur.append(pt)

    def _qCurveToOne(self, p1, p2):
        p0 = self.cur[-1]
        ddx = p0[0] - 2 * p1[0] + p2[0]
        ddy = p0[1] - 2 * p1[1] + p2[1]
        dd = math.hypot(ddx, ddy)
        n = max(1, math.ceil(math.sqrt(dd / (4 * TOL)))) if dd > 0 else 1
        for i in range(1, n + 1):
            t = i / n
            mt = 1 - t
            x = mt * mt * p0[0] + 2 * mt * t * p1[0] + t * t * p2[0]
            y = mt * mt * p0[1] + 2 * mt * t * p1[1] + t * t * p2[1]
            self.cur.append((x, y))

    def _curveToOne(self, p1, p2, p3):
        p0 = self.cur[-1]
        # Generous fixed subdivision for cubics (not expected in glyf).
        length = math.dist(p0, p1) + math.dist(p1, p2) + math.dist(p2, p3)
        n = max(2, math.ceil(length / 8))
        for i in range(1, n + 1):
            t = i / n
            mt = 1 - t
            x = mt**3 * p0[0] + 3 * mt * mt * t * p1[0] + 3 * mt * t * t * p2[0] + t**3 * p3[0]
            y = mt**3 * p0[1] + 3 * mt * mt * t * p1[1] + 3 * mt * t * t * p2[1] + t**3 * p3[1]
            self.cur.append((x, y))

    def _closePath(self):
        if self.cur and len(self.cur) > 2:
            if self.cur[0] == self.cur[-1]:
                self.cur.pop()
            self.contours.append(self.cur)
        self.cur = None

    _endPath = _closePath


def winding(ring, pt):
    """Winding number of a closed ring around pt."""
    x, y = pt
    w = 0
    n = len(ring)
    for i in range(n):
        x0, y0 = ring[i]
        x1, y1 = ring[(i + 1) % n]
        if y0 <= y:
            if y1 > y and (x1 - x0) * (y - y0) - (x - x0) * (y1 - y0) > 0:
                w += 1
        elif y1 <= y and (x1 - x0) * (y - y0) - (x - x0) * (y1 - y0) < 0:
            w -= 1
    return w


def merged(contours):
    lines = [LineString(c + [c[0]]) for c in contours]
    noded = unary_union(lines)
    keep = []
    for face in polygonize(noded):
        if face.area < 1e-6:
            continue
        p = face.representative_point()
        if sum(winding(c, (p.x, p.y)) for c in contours) != 0:
            keep.append(face)
    if not keep:
        return []
    geom = unary_union(keep)
    polys = list(geom.geoms) if isinstance(geom, MultiPolygon) else [geom]
    return [orient(p, sign=-1.0) for p in polys if isinstance(p, Polygon) and not p.is_empty]


def ring_points(coords):
    pts = []
    for x, y in list(coords)[:-1]:
        q = (round(x), round(y))
        if not pts or pts[-1] != q:
            pts.append(q)
    if len(pts) > 1 and pts[0] == pts[-1]:
        pts.pop()
    # Drop collinear points.
    out = []
    n = len(pts)
    for i in range(n):
        a, b, c = pts[i - 1], pts[i], pts[(i + 1) % n]
        if (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]) != 0:
            out.append(b)
    return out if len(out) >= 3 else []


def main(src, out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    font = TTFont(src)
    font = instancer.instantiateVariableFont(font, {"wght": 900}, updateFontNames=False)

    opts = Options()
    opts.layout_features = ["kern", "liga", "clig", "calt", "case", "cpsp", "locl", "mark", "mkmk"]
    opts.hinting = False
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    sub = Subsetter(opts)
    sub.populate(unicodes=UNICODES)
    sub.subset(font)

    glyf = font["glyf"]
    hmtx = font["hmtx"]
    gs = font.getGlyphSet()
    changed = 0
    for name in font.getGlyphOrder():
        rec = DecomposingRecordingPen(gs)
        gs[name].draw(rec)
        flat = FlattenPen()
        rec.replay(flat)
        if not flat.contours:
            continue
        polys = merged(flat.contours)
        pen = TTGlyphPen(None)
        for poly in polys:
            for ring in [poly.exterior, *poly.interiors]:
                pts = ring_points(ring.coords)
                if not pts:
                    continue
                pen.moveTo(pts[0])
                for p in pts[1:]:
                    pen.lineTo(p)
                pen.closePath()
        g = pen.glyph()
        g.recalcBounds(glyf)
        glyf[name] = g
        adv, _ = hmtx[name]
        hmtx[name] = (adv, getattr(g, "xMin", 0))
        changed += 1

    for tag in ("fpgm", "prep", "cvt ", "hdmx", "LTSH", "VDMX"):
        if tag in font:
            del font[tag]

    family = "Montserrat Black Outline"
    ps = "MontserratBlackOutline-Regular"
    name = font["name"]
    for rec in list(name.names):
        if rec.nameID in (1, 4, 16):
            rec.string = family
        elif rec.nameID == 2 or rec.nameID == 17:
            rec.string = "Regular"
        elif rec.nameID == 6:
            rec.string = ps
        elif rec.nameID == 3:
            rec.string = "8.000;ULA;" + ps + ";overlaps-removed"
    font["OS/2"].usWeightClass = 900

    font.save(out_dir / "MontserratBlack-Outline.ttf")
    font.flavor = "woff2"
    font.save(out_dir / "MontserratBlack-Outline.woff2")
    print("glyphs merged:", changed)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
