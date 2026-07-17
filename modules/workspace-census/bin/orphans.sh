#!/usr/bin/env bash
# workspace-census orphans — list orphan files.
#
# Heuristic: text-format files with no other file referencing their name.
set -euo pipefail

target="."
since=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    --since)  since="$2"; shift 2 ;;
    *)        echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ ! -d "$target" ]]; then
  echo "workspace-census: target directory does not exist: $target" >&2
  exit 1
fi

# Candidate set: text files (.md, .txt, .yaml, .json) at top 3 levels
mapfile -t candidates < <(find "$target" -maxdepth 3 -type f \
  \( -name '*.md' -o -name '*.txt' -o -name '*.yaml' -o -name '*.yml' -o -name '*.json' \) \
  -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/.operatoros/*' \
  2>/dev/null | sort)

echo "# Workspace Orphans — ${target}"
if [[ -n "$since" ]]; then
  echo
  echo "_Only files newer than ${since}._"
fi
echo

orphan_count=0
for f in "${candidates[@]}"; do
  base="$(basename "$f")"
  # Count references across the workspace (excluding the file itself)
  refs="$(grep -rlF "$base" "$target" \
    --exclude-dir=.git \
    --exclude-dir=node_modules \
    --exclude-dir=.operatoros \
    --exclude-dir=dist \
    2>/dev/null | grep -v "^${f}$" | wc -l)"
  if [[ $refs -eq 0 ]]; then
    echo "ORPHAN: ${f#$target/}"
    orphan_count=$((orphan_count + 1))
  fi
done

echo
echo "Total orphans: ${orphan_count}"