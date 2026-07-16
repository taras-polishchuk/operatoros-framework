#!/usr/bin/env bash
# token-budget budget — show budget configuration.
set -euo pipefail

target="."
budget=3000

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

# Read budget from operatoros.yaml if present
manifest="${target}/operatoros.yaml"
if [[ -f "$manifest" ]]; then
  yaml_budget="$(grep -E 'token_budget:' "$manifest" | head -1 | sed -E 's/^token_budget:[[:space:]]*//' || true)"
  if [[ -n "$yaml_budget" ]]; then
    budget="$yaml_budget"
  fi
fi

echo "# Token Budget Configuration — ${target}"
echo
echo "Default budget: 3000 tokens (~12000 chars)"
echo
echo "Override (via operatoros.yaml):"
echo "  settings:"
echo "    token_budget: 4000"
echo
echo "Current budget: ${budget}"