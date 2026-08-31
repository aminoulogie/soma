#!/usr/bin/env bash
# One-time removal of superseded version snapshots and scratch files.
# Everything deleted here is already committed in this repo under archive/
# (commit 491f9e0). Nothing here is loaded by the plugin or any note.
#
# Data files (apps/scripts/*.json) are explicitly NOT touched.
set -euo pipefail

source "$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)/scripts/config.sh"

if tasklist 2>/dev/null | grep -qi obsidian; then
  echo "Obsidian is running. Close it first."; exit 1
fi

echo "Data files that must survive:"
ls "$DATA_DIR"/*.json | sed 's/^/  keep /'
echo

del() { [ -e "$1" ] && rm -rf "$1" && echo "  del $1"; }

# 45 version snapshots (bm1.0-bm24, bodymap 1.0-1.8, gymlog 1.0-2.5, ...)
find "$DATA_DIR" -maxdepth 1 -name '*.md' -print -delete | sed 's/^/  del /'

# gymlog/bodymap iterations at apps/ root
find "$VAULT/apps" -maxdepth 1 \( -name '*.md' -o -name '*.ts' \) -print -delete | sed 's/^/  del /'

# macro/sleep/creatine/gymlog iterations
del "$VAULT/Health/Apps"

# typo scratch files: ```soma-coa, ```soma-coatch
find "$VAULT" -maxdepth 1 -name 'Untitled*.md' -print -delete | sed 's/^/  del /'

# dead PARA index pointing at notes that live in the other (trashed) vault
del "$VAULT/log"

# empty dirs, incl. the misspelled duplicate of Health/Attachments
del "$VAULT/Attachements"
del "$VAULT/Health/Training/Exercises"
del "$VAULT/Health/Training/Splits"
del "$VAULT/Health/Training/Untitled"

echo
echo "Data files intact:"
ls "$DATA_DIR"/*.json | sed 's/^/  ok /'
