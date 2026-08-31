#!/usr/bin/env bash
# Push plugin source from this repo into the Obsidian vault.
# The vault copy is what Obsidian (desktop + iOS via iCloud) actually loads.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO/scripts/config.sh"

if pgrep -f Obsidian.exe >/dev/null 2>&1 || tasklist 2>/dev/null | grep -qi obsidian; then
  echo "WARNING: Obsidian is running. Close it first to avoid an iCloud conflict copy."
  read -rp "Continue anyway? [y/N] " ok
  [[ "$ok" == "y" ]] || exit 1
fi

mkdir -p "$PLUGIN_DIR"
for f in main.js manifest.json styles.css; do
  cp "$REPO/plugin/$f" "$PLUGIN_DIR/$f"
  echo "  -> $f"
done

echo "Deployed to $PLUGIN_DIR"
echo "Reload Obsidian (Ctrl+R) on desktop; force-quit and reopen on iPhone."
