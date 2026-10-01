#!/bin/sh
# Render scripts/og-card.html to src/app/opengraph-image.png (1200x630) with
# headless Chrome. Run from anywhere:  sh scripts/og-image.sh
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
command -v google-chrome >/dev/null 2>&1 && CHROME=google-chrome
command -v chromium >/dev/null 2>&1 && CHROME=chromium
[ -x "$CHROME" ] || command -v "$CHROME" >/dev/null 2>&1 || { echo "Chrome not found; set CHROME=/path/to/chrome" >&2; exit 1; }
OUT="$ROOT/src/app/opengraph-image.png"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=10000 \
  --screenshot="$OUT" "file://$ROOT/scripts/og-card.html" 2>/dev/null
ls -la "$OUT"
