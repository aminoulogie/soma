#!/usr/bin/env bash
# Snapshot the live training/nutrition data into a dated folder.
# This is the safety net against an iCloud conflict eating a JSON file.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source "$REPO/scripts/config.sh"

STAMP="$(date +%Y-%m-%d)"
OUT="$REPO/data-snapshots/$STAMP"
mkdir -p "$OUT"
cp "$DATA_DIR/"*.json "$OUT/"

echo "Snapshotted $(ls "$OUT" | wc -l) files -> data-snapshots/$STAMP"
echo "Commit it:  git add -A && git commit -m \"data snapshot $STAMP\""
