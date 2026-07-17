#!/usr/bin/env bash
# identity-md interview — 5 onboarding questions, written to history JSONL.
#
# Per methodology/05-onboarding-interview.md, the five questions are:
#   1. Who are you (name, role, current focus)?
#   2. What do you care about (priorities, principles, anti-patterns)?
#   3. How do you like to work (style, communication preferences)?
#   4. What's your current focus (this week / month / quarter)?
#   5. What should I (the AI) never do without asking?
set -euo pipefail

target="."
declare -A answers

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    --answer)
      kv="$2"; shift 2
      key="${kv%%=*}"; val="${kv#*=}"
      answers["$key"]="$val"
      ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

state_dir="${target}/state/identity-md"
mkdir -p "$state_dir"
history="${state_dir}/interview-history.jsonl"

ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

# Required questions per methodology/05
questions=(
  "1:Who are you (name, role, current focus)?"
  "2:What do you care about (priorities, principles, anti-patterns)?"
  "3:How do you like to work (style, communication preferences)?"
  "4:What's your current focus (this week / month / quarter)?"
  "5:What should I (the AI) never do without asking?"
)

# For each question, prompt if not in --answer
for q in "${questions[@]}"; do
  n="${q%%:*}"
  text="${q#*:}"
  if [[ -z "${answers[$n]:-}" ]]; then
    # Interactive prompt via /dev/tty if available, else skip
    if [[ -t 0 ]]; then
      read -r -p "Q${n}: ${text} > " answers[$n] || answers[$n]="(skipped)"
    else
      answers[$n]="(not provided)"
    fi
  fi
done

# Write JSONL entry
{
  printf '{"ts":"%s","answers":{' "$ts"
  first=1
  for n in 1 2 3 4 5; do
    if [[ $first -eq 1 ]]; then first=0; else printf ','; fi
    printf '"q%s":"%s"' "$n" "${answers[$n]//\"/\\\"}"
  done
  printf '}}\n'
} >> "$history"

echo "identity-md: recorded answers to ${history}"
echo "Run \`operatoros run identity-md init\` to consolidate into IDENTITY.md."