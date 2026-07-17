#!/usr/bin/env bash
# Per-principle check: Local-First (principle 6).
#
# Per methodology/01 §6: the Core never reaches the network. Drift =
# forbidden network primitives in module command strings.
set -euo pipefail

target="${1:-.}"

count=0
if [[ -d "$target/modules" ]]; then
  while IFS= read -r primitive; do
    [[ -z "$primitive" ]] && continue
    # Skip comment-only lines
    case "$primitive" in
      "#"*) continue ;;
    esac
    # Skip drift-detector/principles/ meta-files — they DEFINE the patterns
    # to look for and legitimately mention "curl", "wget" etc. as strings.
    # Mirrors the exclusion in core/__tests__/local-first.test.ts.
    case "$primitive" in
      *"/drift-detector/principles/"*) continue ;;
    esac
    count=$((count + 1))
    echo "  - $primitive"
  done < <(grep -rE '\b(curl |wget |fetch\(|http://|https://|node-fetch)' "$target/modules" \
    --include='*.sh' --include='*.ts' \
    2>/dev/null \
    | grep -vE '^[^:]+:[0-9]+:#' \
    | head -20 || true)
fi

if [[ $count -eq 0 ]]; then
  echo "OK: no Local-First violations in modules/"
else
  echo "VIOLATION: $count network primitive(s) in modules/"
fi