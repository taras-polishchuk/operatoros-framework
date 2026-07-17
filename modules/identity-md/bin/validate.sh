#!/usr/bin/env bash
# identity-md validate — check IDENTITY.md against methodology/05 §5 rules.
set -euo pipefail

target="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

id="${target}/IDENTITY.md"
if [[ ! -f "$id" ]]; then
  echo "identity-md validate: no IDENTITY.md at ${id}"
  exit 1
fi

content="$(cat "$id")"
echo "# IDENTITY.md Validation — ${target}"
echo

missing=0
for n in 1 2 3 4 5; do
  if echo "$content" | grep -qE "^## ${n}\."; then
    echo "OK: section ${n} present"
  else
    echo "MISSING: section ${n}"
    missing=$((missing + 1))
  fi
done

if echo "$content" | grep -qE 'onboarding_complete:[[:space:]]*true'; then
  echo "OK: onboarding_complete: true"
else
  echo "MISSING: onboarding_complete: true"
  missing=$((missing + 1))
fi

# Vault-leakage tick (I2): flag any pre-existing file with potential secrets.
if echo "$content" | grep -qE 'secrets\.[a-z]+|vault/|API[_-]?KEY=|PASSWORD='; then
  echo "VIOLATION: IDENTITY.md contains potential secret pattern (I2)"
  missing=$((missing + 1))
fi

echo
if [[ $missing -eq 0 ]]; then
  echo "Validation: PASS"
else
  echo "Validation: FAIL (${missing} issue(s))"
  exit 1
fi