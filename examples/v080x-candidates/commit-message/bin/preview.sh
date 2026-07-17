#!/usr/bin/env bash
# commit-message preview — same as generate but don't read staged, show working-tree.
set -euo pipefail

target="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if ! git -C "$target" rev-parse --git-dir >/dev/null 2>&1; then
  echo "commit-message: not a git repository" >&2
  exit 1
fi

# Show what generate would do
echo "# commit-message — preview"
echo
echo "Working-tree changes:"
echo
git -C "$target" diff --stat HEAD 2>&1 | head -20
echo
echo "Run \`operatoros run commit-message generate --target ${target}\` after \`git add\`."