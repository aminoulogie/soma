#!/usr/bin/env bash
# Pull the vault's live copies back into the repo, for when something was
# edited through Obsidian instead of here. Review with `git diff` before committing.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO/scripts/config.sh"

for f in main.js manifest.json styles.css; do
  [ -f "$PLUGIN_DIR/$f" ] && cp "$PLUGIN_DIR/$f" "$REPO/plugin/$f" && echo "  <- $f"
done

cp "$VAULT/Health/Dashboard/"*.md "$REPO/dashboards/" 2>/dev/null || true
cp -r "$VAULT/templates/." "$REPO/templates/" 2>/dev/null || true

echo "Pulled. Run 'git diff' to review."
