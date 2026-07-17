#!/usr/bin/env bash
# context-builder diff — context-format diff against a git ref.
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

if [[ -z "$since" ]]; then
  echo "context-builder diff: --since <ref> is required" >&2
  exit 1
fi

if ! git -C "$target" rev-parse --git-dir >/dev/null 2>&1; then
  echo "context-builder diff: target is not a git repository" >&2
  exit 1
fi

echo "# Context Diff — ${target} (since ${since})"
echo
echo "## Changed files"
echo
echo '```'
git -C "$target" diff --name-only "$since" HEAD 2>&1 || true
echo '```'
echo
echo "## Stat"
echo
echo '```'
git -C "$target" diff --stat "$since" HEAD 2>&1 || true
echo '```'