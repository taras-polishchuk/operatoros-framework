#!/usr/bin/env bash
# schema-validator list — list available schemas (bundled + workspace).
set -euo pipefail

target=""
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

echo "# Available Schemas"
echo
echo "## Bundled (OperatorOS Core)"
echo
echo "- workspace: schemas/workspace.schema.json"
echo "- module:    schemas/module.schema.json"
echo "- preset:    schemas/preset.schema.json"
echo "- catalog:   schemas/catalog.schema.json"
echo "- identity:  schemas/identity.schema.json (added in v0.8.0 per I1)"

if [[ -n "$target" && -d "$target/schemas" ]]; then
  echo
  echo "## Workspace (${target}/schemas/)"
  echo
  for f in "$target"/schemas/*.schema.json; do
    [[ -f "$f" ]] || continue
    echo "- ${f#${target}/}"
  done
fi