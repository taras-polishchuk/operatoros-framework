#!/usr/bin/env bash
# module-cookbook show <topic> — print educational Markdown.
set -euo pipefail

topic="${1:-}"
if [[ -z "$topic" ]]; then
  echo "usage: operatoros run module-cookbook show <topic>" >&2
  echo "  topics: commands, settings, hooks, requires, manifest" >&2
  exit 1
fi

doc="${SCRIPT_DIR:-$(dirname "$0")/..}/docs/topics/${topic}.md"

# Try several resolutions
if [[ ! -f "$doc" ]]; then
  doc="$(cd "$(dirname "$0")/.." && pwd)/docs/topics/${topic}.md"
fi

if [[ ! -f "$doc" ]]; then
  echo "module-cookbook: unknown topic: ${topic}" >&2
  echo "  valid topics: commands, settings, hooks, requires, manifest" >&2
  exit 1
fi

cat "$doc"