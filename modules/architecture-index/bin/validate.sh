#!/usr/bin/env bash
# architecture-index validate — cross-reference architecture.md claims.
#
# Conservative: flags UNCERTAIN matches as "needs human review", not violations.
set -euo pipefail

target="."

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *)        echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ ! -d "$target" ]]; then
  echo "architecture-index: target directory does not exist: $target" >&2
  exit 1
fi

md="${target}/state/architecture.md"
if [[ ! -f "$md" ]]; then
  echo "validate: no architecture.md at ${md}"
  echo "         run \`operatoros run architecture-index show\` first"
  exit 1
fi

echo "# Architecture Validation — ${target}"
echo

# Find each "X/" claim in the claim registry and check existence on disk.
violations=0
needs_review=0
ok_count=0

# Read claims: lines like "- **Concept**: `path/`"
while IFS= read -r line; do
  if [[ "$line" =~ \`(.*)\` ]]; then
    path_claim="${BASH_REMATCH[1]}"
    # Skip variable refs (not filesystem paths)
    [[ "$path_claim" =~ \$\{ ]] && continue
    # Skip command-like text
    [[ "$path_claim" == *"operatoros run"* ]] && continue
    # Strip trailing slash for stat
    check_path="${path_claim%/}"
    if [[ -e "$target/$check_path" ]]; then
      echo "OK: ${path_claim} exists"
      ok_count=$((ok_count + 1))
    else
      echo "NEEDS REVIEW: ${path_claim} is claimed but does not exist on disk"
      needs_review=$((needs_review + 1))
    fi
  fi
done < <(grep -E '^- \*\*' "$md" || true)

echo
echo "## Summary"
echo
echo "- OK: ${ok_count}"
echo "- Needs human review: ${needs_review}"
echo "- Hard violations: ${violations}"