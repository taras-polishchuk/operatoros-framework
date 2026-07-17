#!/usr/bin/env bash
# drift-detector gate — exit 0 only if all six principle checks pass.
set -euo pipefail

target="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

bash "${target}/modules/drift-detector/bin/check.sh" --target "$target" --format md --strict > /dev/null 2>&1
echo "gate: PASS"
exit 0