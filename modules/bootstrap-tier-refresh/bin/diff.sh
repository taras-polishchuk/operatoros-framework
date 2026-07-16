#!/usr/bin/env bash
# bootstrap-tier-refresh diff — show what would change without writing.
set -euo pipefail

target="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

echo "# Bootstrap-tier Diff — ${target}"
echo
echo "## Files in scope"
echo
echo "- bootstrap.md"
echo "- IDENTITY.md"
echo "- operatoros.yaml (preset: reference only — per I3)"
echo "- presets/<active>/preset.yaml (snapshot only)"

echo
echo "## Detection"
echo
for f in bootstrap.md IDENTITY.md operatoros.yaml "presets"; do
  if [[ -e "${target}/${f}" ]]; then
    echo "PRESENT: ${f}"
  else
    echo "ABSENT: ${f}"
  fi
done

echo
echo "_Run \`operatoros run bootstrap-tier-refresh refresh --target ${target}\` to apply._"