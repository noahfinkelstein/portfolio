#!/bin/sh
# Render scripts/og-card.html to src/app/opengraph-image.png (1200x630) with
# headless Chrome. Run from anywhere:  sh scripts/og-image.sh
# Set CHROME=/path/to/chrome to use a specific browser; otherwise the first of
# Google Chrome (macOS), google-chrome or chromium that exists is used.
set -e
ROOT=$(cd "$(dirname "$0")/.." && pwd)
if [ -z "$CHROME" ]; then
  for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" google-chrome chromium; do
    if [ -x "$c" ] || command -v "$c" >/dev/null 2>&1; then CHROME=$c; break; fi
  done
fi
if [ -z "$CHROME" ] || { [ ! -x "$CHROME" ] && ! command -v "$CHROME" >/dev/null 2>&1; }; then
  echo "Chrome not found; set CHROME=/path/to/chrome" >&2; exit 1
fi
OUT="$ROOT/src/app/opengraph-image.png"
"$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --window-size=1200,630 --virtual-time-budget=10000 \
  --screenshot="$OUT" "file://$ROOT/scripts/og-card.html" 2>/dev/null
ls -la "$OUT"
