#!/usr/bin/env bash
# workspace-census census — file-kind breakdown.
set -euo pipefail

target="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *)        echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ ! -d "$target" ]]; then
  echo "workspace-census: target directory does not exist: $target" >&2
  exit 1
fi

file_count="$(find "$target" -type f -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/dist/*' 2>/dev/null | wc -l)"
dir_count="$(find "$target" -type d -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/dist/*' 2>/dev/null | wc -l)"

# Classify by extension
mapfile -t kinds < <(find "$target" -type f -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/dist/*' 2>/dev/null \
  | sed -E 's:.*\.([^./]+)$:\1:' | tr '[:upper:]' '[:lower:]' | sort -u)

# Top-level grouping
top_dirs="$(find "$target" -maxdepth 1 -mindepth 1 -type d -printf '%f\n' 2>/dev/null | sort)"

echo "# Workspace Census — ${target}"
echo
echo "- Total files: ${file_count}"
echo "- Total directories: ${dir_count}"
echo
echo "## File extensions observed"
echo
echo '```'
printf '%s\n' "${kinds[@]}"
echo '```'
echo
echo "## Top-level directories"
echo
echo '```'
echo "$top_dirs"
echo '```'

# Small workspace heuristic
if [[ $file_count -lt 10 ]]; then
  echo
  echo "_Census note: workspace is small (<10 files). Census is informational._"
fi