#!/usr/bin/env bash
# mission-runner list — list existing missions.
set -euo pipefail

target="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

base="${target}/.project-state"
if [[ ! -d "$base" ]]; then
  echo "no .project-state/ at ${target}"
  exit 0
fi

echo "# Missions — ${target}"
echo
for slug in $(find "$base" -maxdepth 1 -mindepth 1 -type d -printf '%f\n' 2>/dev/null | sort); do
  artifacts="$(find "$base/$slug" -maxdepth 1 -type f -name '*.md' | wc -l)"
  has_final=0
  [[ -f "$base/$slug/final-report.md" ]] && has_final=1
  status="in-progress"
  [[ $has_final -eq 1 ]] && status="complete"
  echo "- ${slug}  (${artifacts} artifacts, ${status})"
done

if [[ -d "$base/archive" ]]; then
  echo
  echo "## Archive"
  for slug in $(find "$base/archive" -maxdepth 1 -mindepth 1 -type d -printf '%f\n' 2>/dev/null | sort); do
    echo "- archive/${slug}"
  done
fi