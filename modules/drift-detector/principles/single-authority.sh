#!/usr/bin/env bash
# Per-principle check: Single Authority (principle 1).
#
# Per methodology/01-six-principles.md §1: every durable concept has
# exactly one file defining it. Drift = two files claiming authority
# for the same concept.
#
# Heuristic for v0.8.0: look for `canonical:` / `authority:` declarations
# across the workspace and check for duplicates.
set -euo pipefail

target="${1:-.}"

count=0
# Find YAML files with `canonical:` or `authority:` claims
while IFS= read -r claim; do
  [[ -z "$claim" ]] && continue
  count=$((count + 1))
  echo "  - $claim"
done < <(grep -rE '^(canonical|authority):' "$target" \
  --include='*.yaml' --include='*.yml' --include='*.md' \
  --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=.operatoros \
  2>/dev/null | head -50 || true)

if [[ $count -eq 0 ]]; then
  echo "OK: no single-authority violations detected (no canonical/authority claims found)"
else
  echo "REVIEW: $count canonical/authority claim(s) — verify each concept has exactly one"
fi