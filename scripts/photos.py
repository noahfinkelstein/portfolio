#!/usr/bin/env python3
"""
Prepare a photo for the site.

    npm run photos                 # process every new photo in photos-source/
    npm run photos -- kayak.jpeg   # or just one

Turns a 5 MB phone photo into a ~400 KB web photo: applies the rotation your
camera recorded in EXIF (otherwise the picture shows up sideways), caps the
long edge at 1800 pixels, and writes the result to public/images/photos/.

Reads from photos-source/ and writes to public/images/photos/. Originals are
never touched, and they live outside public/ so they are never served.

Afterwards it prints a ready-made block to paste into
src/content/photos.ts — you only need to fill in the alt text and caption.

Needs Pillow once:  python3 -m pip install --user Pillow
"""

import sys
from pathlib import Path

try:
    from PIL import Image, ImageOps
except ImportError:
    sys.exit("Pillow is missing. Run:  python3 -m pip install --user Pillow")

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "photos-source"
OUT = ROOT / "public" / "images" / "photos"
MAX_EDGE = 1800
QUALITY = 82


def process(path: Path) -> None:
    out = OUT / (path.stem + ".jpg")
    image = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    width, height = image.size

    scale = min(1.0, MAX_EDGE / max(width, height))
    if scale < 1.0:
        image = image.resize(
            (round(width * scale), round(height * scale)), Image.LANCZOS
        )

    OUT.mkdir(parents=True, exist_ok=True)
    image.save(out, "JPEG", quality=QUALITY, optimize=True, progressive=True)

    w, h = image.size
    kb = out.stat().st_size // 1024
    print(f"{path.name} -> {out.relative_to(ROOT)}  {w}x{h}  {kb} KB\n")
    print("Paste into src/content/photos.ts:\n")
    print("  {")
    print(f'    src: "/images/photos/{out.name}",')
    print(f"    width: {w},")
    print(f"    height: {h},")
    print('    alt: "",       // describe the photo for screen readers')
    print('    caption: "",   // the part worth reading')
    print("  },\n")


def main() -> None:
    args = sys.argv[1:]
    if args:
        targets = [SRC / a for a in args]
    else:
        done = {p.stem for p in OUT.glob("*.jpg")} if OUT.exists() else set()
        targets = sorted(
            p
            for p in SRC.iterdir()
            if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".heic"}
            and p.stem not in done
        )

    if not targets:
        print("Nothing new in photos-source/. Drop a photo there and run again.")
        return

    for path in targets:
        if not path.exists():
            print(f"skipped {path.name} — not in photos-source/")
            continue
        process(path)


if __name__ == "__main__":
    main()
