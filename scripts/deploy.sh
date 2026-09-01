#!/usr/bin/env bash
# Build the Obsidian plugin from source and push the artifact into the vault.
#
# The vault copy is what Obsidian (desktop + iOS via iCloud) actually loads.
# Source lives here; only main.js, manifest.json and styles.css are deployed —
# never src/, test/ or node_modules, which would sync to iCloud for no reason.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO/scripts/config.sh"

APP="$REPO/apps/obsidian"

if pgrep -f Obsidian.exe >/dev/null 2>&1 || tasklist 2>/dev/null | grep -qi obsidian; then
  echo "WARNING: Obsidian is running. Close it first to avoid an iCloud conflict copy."
  read -rp "Continue anyway? [y/N] " ok
  [[ "$ok" == "y" ]] || exit 1
fi

# Never deploy an artifact that has not been rebuilt from current source, and
# never deploy one the tests have not seen.
echo "Building…"
( cd "$APP" && node build.mjs )

echo "Testing…"
( cd "$APP" && node test/all.js | tail -2 )

mkdir -p "$PLUGIN_DIR"
for f in main.js manifest.json styles.css; do
  cp "$APP/$f" "$PLUGIN_DIR/$f"
  echo "  -> $f"
done

echo
echo "Deployed to $PLUGIN_DIR"
echo "Reload Obsidian (Ctrl+R) on desktop; force-quit and reopen on iPhone."
