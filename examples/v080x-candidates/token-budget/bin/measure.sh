#!/usr/bin/env bash
# token-budget measure — measure always-read tier token cost.
#
# Approximation: ~4 chars per token (English markdown).
# For accuracy, integrate a tokenizer like gpt-tokenizer; for v0.8.x
# candidate, this approximation is sufficient as a guardrail.
set -euo pipefail

target="."
budget=3000

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    --budget) budget="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

# Always-read tier files
files=(
  "bootstrap.md"
  "IDENTITY.md"
  "operatoros.yaml"
)

echo "# Token Budget — ${target}"
echo
echo "_Approximation: 4 chars ≈ 1 token (English markdown)._"
echo

total_chars=0
for f in "${files[@]}"; do
  path="${target}/${f}"
  if [[ -f "$path" ]]; then
    chars="$(wc -c < "$path")"
    tokens=$((chars / 4))
    printf "%-25s  %6d chars  ~%5d tokens\n" "$f" "$chars" "$tokens"
    total_chars=$((total_chars + chars))
  else
    printf "%-25s  (absent)\n" "$f"
  fi
done

total_tokens=$((total_chars / 4))
echo
echo "Total: ${total_chars} chars, ~${total_tokens} tokens"
echo "Budget: ${budget} tokens"

if [[ $total_tokens -gt $budget ]]; then
  pct=$((total_tokens * 100 / budget))
  echo
  echo "OVER BUDGET by $((total_tokens - budget)) tokens (${pct}% of budget)"
  exit 1
else
  pct=$((total_tokens * 100 / budget))
  remaining=$((budget - total_tokens))
  echo
  echo "WITHIN BUDGET (${pct}% of budget used, ${remaining} remaining)"
fi