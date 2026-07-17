#!/usr/bin/env bash
# workspace-census anomalies — list files matching secret-ish patterns.
set -euo pipefail

target="."

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *)        echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ ! -d "$target" ]]; then
  echo "workspace-census: target directory does not exist: $target" >&2
  exit 1
fi

echo "# Workspace Anomalies — ${target}"
echo

# Patterns that suggest accidental secret leakage or stale backups
patterns=(
  ".env.*.local"
  ".env.production.local"
  "secrets.*.bak"
  "*.pem"
  "*.key"
  "*.p12"
  "id_rsa"
  "id_dsa"
  "id_ecdsa"
  "id_ed25519"
  ".aws/credentials"
  ".netrc"
)

count=0
for pat in "${patterns[@]}"; do
  while IFS= read -r match; do
    [[ -z "$match" ]] && continue
    echo "ANOMALY: ${match#$target/}"
    count=$((count + 1))
  done < <(find "$target" -name "$pat" -type f 2>/dev/null | sort -u)
done

echo
echo "Total anomalies: ${count}"

if [[ $count -gt 0 ]]; then
  echo
  echo "_Note: anomaly patterns are heuristic. Review each match manually._"
fi