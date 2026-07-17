#!/usr/bin/env bash
# Per-principle check: Composable (principle 4).
#
# Per methodology/01 §4: modules compose via the catalog + hooks
# registry, not by reaching into other modules' state. Drift = direct
# filesystem access to another module's directory.
set -euo pipefail

target="${1:-.}"

count=0
# Detect bin/ scripts that read other modules' internal files.
while IFS= read -r ref; do
  [[ -z "$ref" ]] && continue
  count=$((count + 1))
  echo "  - $ref"
done < <(grep -rE '\.\./\.\./[a-z0-9_-]+/' "$target/modules" \
  --include='*.sh' \
  2>/dev/null | head -20 || true)

if [[ $count -eq 0 ]]; then
  echo "OK: no sibling-module internal references"
else
  echo "VIOLATION: $count sibling-module internal reference(s) — modules must compose via catalog/hooks"
fi