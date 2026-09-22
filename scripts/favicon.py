#!/usr/bin/env python3
"""
Rasterise src/app/icon.svg into src/app/favicon.ico (16, 32 and 48 px).

Next.js serves src/app/favicon.ico at /favicon.ico for browsers and crawlers
that still request that path instead of reading the <link rel="icon"> to the
SVG. Run this after changing icon.svg:

    python3 scripts/favicon.py

Needs Pillow (python3 -m pip install --user Pillow). On macOS the SVG is
rendered by Quick Look; elsewhere the same shapes are drawn directly.
"""
import pathlib
import re
import subprocess
import sys
import tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
SVG = ROOT / "src" / "app" / "icon.svg"
OUT = ROOT / "src" / "app" / "favicon.ico"
SIZES = (48, 32, 16)

try:
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit("Pillow is not installed: python3 -m pip install --user Pillow")


def via_quicklook(size: int):
    """Render the real SVG with macOS Quick Look. Returns None if unavailable."""
    with tempfile.TemporaryDirectory() as d:
        subprocess.run(
            ["qlmanage", "-t", "-s", str(size), "-o", d, str(SVG)],
            capture_output=True,
        )
        png = pathlib.Path(d) / (SVG.name + ".png")
        if not png.exists():
            return None
        img = Image.open(png).convert("RGBA").copy()
    # Quick Look must have kept the rounded corners transparent, or the icon
    # will show a white square on dark tab bars.
    if img.getpixel((0, 0))[3] != 0:
        return None
    return img


def via_pillow(size: int):
    """Draw the same shapes as icon.svg: accent rounded square, white N."""
    svg = SVG.read_text()
    accent = re.search(r'<rect[^>]*fill="(#[0-9a-fA-F]{6})"', svg).group(1)
    s = size / 32  # icon.svg viewBox is 32x32
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    draw.rounded_rectangle([0, 0, size - 1, size - 1], radius=6 * s, fill=accent)
    # The path from icon.svg, as polygon vertices.
    n = [(9, 23), (9, 9), (12.1, 9), (19.9, 19.2), (19.9, 9), (23, 9),
         (23, 23), (19.9, 23), (12.1, 12.8), (12.1, 23)]
    draw.polygon([(x * s, y * s) for x, y in n], fill="#ffffff")
    return img


def main():
    big = via_quicklook(512) or via_pillow(512)
    source = "Quick Look" if via_quicklook.__name__ and big is not None else "Pillow"
    frames = [big.resize((s, s), Image.Resampling.LANCZOS) for s in SIZES]
    frames[0].save(OUT, format="ICO", sizes=[(s, s) for s in SIZES], append_images=frames[1:])
    print(f"wrote {OUT.relative_to(ROOT)} ({', '.join(str(s) for s in SIZES)} px)")


if __name__ == "__main__":
    main()
