#!/usr/bin/env bash
# Per-principle check: Typed Substrate (principle 3).
#
# Per methodology/01 §3: every durable artifact must have a type
# (JSON-Schema or equivalent). Drift = configs without schemas.
set -euo pipefail

target="${1:-.}"

count=0
for yaml in $(find "$target" -maxdepth 4 -name '*.yaml' -o -name '*.yml' \
  -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/.operatoros/*' \
  2>/dev/null); do
  # Skip module.yaml (has its own schema) and preset.yaml (same)
  base="$(basename "$yaml")"
  if [[ "$base" == "module.yaml" || "$base" == "preset.yaml" || "$base" == "operatoros.yaml" ]]; then
    continue
  fi
  count=$((count + 1))
  echo "  - $yaml"
done

if [[ $count -eq 0 ]]; then
  echo "OK: no orphan YAML configs (every YAML is module/preset/operatoros.yaml)"
else
  echo "REVIEW: $count YAML config(s) outside canonical homes — consider whether each needs a JSON-Schema"
fi