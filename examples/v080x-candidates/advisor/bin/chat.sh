#!/usr/bin/env bash
# advisor chat — interactive REPL.
set -euo pipefail

target="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

echo "advisor chat (target: $target)"
echo "Type a Q-number (Q1, Q2, ...) or 'quit' to exit."
echo

while true; do
  if [[ -t 0 ]]; then
    read -r -p "advisor> " q
  else
    # non-tty: read one line from stdin and exit
    IFS= read -r q
  fi
  [[ -z "$q" ]] && continue
  [[ "$q" == "quit" || "$q" == "exit" ]] && break
  bash "$(dirname "$0")/ask.sh" "$q" --target "$target" || true
  echo
done