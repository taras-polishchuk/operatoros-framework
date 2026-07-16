#!/usr/bin/env bash
# mission-runner validate <slug> -- verify all 8 standard artifacts.
set -euo pipefail

slug="${1:-}"
shift || true

target="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$slug" ]]; then
  echo "mission-runner validate: <slug> is required" >&2
  exit 1
fi

dest="${target}/.project-state/${slug}"
if [[ ! -d "$dest" ]]; then
  echo "mission-runner validate: no mission at ${dest}"
  exit 1
fi

artifacts=(source-task.md progress.md decisions.md blockers.md artifacts.md environment.md execution-log.md final-report.md)
missing=0
present=0

for a in "${artifacts[@]}"; do
  if [[ -f "$dest/$a" ]]; then
    present=$((present + 1))
    echo "OK: $a"
  else
    echo "MISSING: $a"
    missing=$((missing + 1))
  fi
done

echo
echo "Summary: ${present} present, ${missing} missing (of 8)"
if [[ $missing -gt 0 ]]; then
  exit 1
fi