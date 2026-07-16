#!/usr/bin/env bash
# Per-principle check: Everything Replaceable (principle 2).
#
# Per methodology/01 §2: every component must be replaceable by a
# different implementation without breaking the system. Drift =
# modules with undocumented imports / hard-codes of other modules' paths.
set -euo pipefail

target="${1:-.}"

count=0
while IFS= read -r ref; do
  [[ -z "$ref" ]] && continue
  count=$((count + 1))
  echo "  - $ref"
done < <(grep -rE 'modules/[a-z0-9_-]+/bin/' "$target/modules" \
  --include='*.sh' --include='*.ts' \
  2>/dev/null | head -20 || true)

if [[ $count -eq 0 ]]; then
  echo "OK: no cross-module bin/ references detected"
else
  echo "REVIEW: $count cross-module bin reference(s) — modules should reach each other via commands[].run, not direct paths"
fi