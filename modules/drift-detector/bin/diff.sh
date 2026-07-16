#!/usr/bin/env bash
# drift-detector diff — diff against a git ref.
set -euo pipefail

target="."
since=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    --since)  since="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$since" ]]; then
  echo "drift-detector diff: --since <ref> is required" >&2
  exit 1
fi

if ! git -C "$target" rev-parse --git-dir >/dev/null 2>&1; then
  echo "drift-detector diff: target is not a git repository" >&2
  exit 1
fi

echo "# Drift Diff — ${target} (since ${since})"
echo
echo "## Changed drift reports"
echo
echo '```'
git -C "$target" diff --name-only "$since" HEAD -- 'state/drift-detector/' 2>&1 || true
echo '```'