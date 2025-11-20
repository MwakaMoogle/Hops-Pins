#!/usr/bin/env bash
# Print a project tree view. Uses 'tree' if available, otherwise falls back to 'find'.
set -euo pipefail
ROOT_DIR="${1:-.}"
if command -v tree >/dev/null 2>&1; then
  tree -a -I 'node_modules|.git' "$ROOT_DIR"
else
  find "$ROOT_DIR" -path ./node_modules -prune -o -path ./.git -prune -o -print | sed 's|^./||'
fi
