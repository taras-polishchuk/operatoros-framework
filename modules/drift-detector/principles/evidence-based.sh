#!/usr/bin/env bash
# Per-principle check: Evidence-Based (principle 5).
#
# Per methodology/01 §5: every load-bearing claim cites evidence
# (file:line, URL, or commit SHA). Drift = orphan decisions or
# missing mission rationale.
set -euo pipefail

target="${1:-.}"

count=0
# In .project-state/, every mission should have a final-report.md citing
# evidence. Orphan = .project-state/<slug> without final-report.md.
if [[ -d "$target/.project-state" ]]; then
  while IFS= read -r slug; do
    if [[ ! -f "$slug/final-report.md" ]]; then
      count=$((count + 1))
      echo "  - $slug (no final-report.md)"
    fi
  done < <(find "$target/.project-state" -maxdepth 1 -mindepth 1 -type d 2>/dev/null || true)
fi

if [[ $count -eq 0 ]]; then
  echo "OK: all missions have final-report.md (or no missions yet)"
else
  echo "REVIEW: $count mission(s) without final-report.md"
fi