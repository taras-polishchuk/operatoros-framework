#!/usr/bin/env bash
# advisor ask <Q-number> — answer one canonical question.
set -euo pipefail

q="${1:-}"
shift || true

target="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$q" ]]; then
  echo "advisor ask: <Q-number> required (e.g., Q1, Q5)" >&2
  exit 1
fi

case "$q" in
  Q1)
    # Q1: What is in this workspace?
    echo "Q1 — What is in this workspace?"
    echo
    echo "Files: $(find "$target" -maxdepth 4 -type f -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/dist/*' 2>/dev/null | wc -l)"
    echo "Directories: $(find "$target" -maxdepth 4 -type d -not -path '*/.git/*' -not -path '*/node_modules/*' 2>/dev/null | wc -l)"
    echo
    echo "Top-level structure:"
    for d in "$target"/*/; do
      [[ -d "$d" ]] && echo "  - $(basename "$d")/"
    done
    ;;

  Q2)
    # Q2: What is the always-read tier?
    echo "Q2 — What is the always-read tier?"
    echo
    for f in bootstrap.md IDENTITY.md operatoros.yaml; do
      if [[ -f "$target/$f" ]]; then
        size="$(wc -c < "$target/$f")"
        echo "  PRESENT: $f (${size} bytes)"
      else
        echo "  ABSENT:  $f"
      fi
    done
    ;;

  Q3)
    # Q3: What is the architecture (canonical homes of concepts)?
    echo "Q3 — Architecture (canonical homes)"
    echo
    for concept_home in \
      "operatoros.yaml:workspace manifest" \
      "modules:extension units" \
      "presets:workspace configurations" \
      "schemas:JSON-Schema definitions" \
      "state:runtime state" \
      "vault:secrets (denylisted from export)"; do
      path="${concept_home%%:*}"
      desc="${concept_home#*:}"
      if [[ -e "$target/$path" ]]; then
        echo "  - $path  ($desc)"
      fi
    done
    ;;

  Q5)
    # Q5: What is the drift state?
    echo "Q5 — Drift state"
    echo
    if [[ -d "$target/modules/drift-detector/bin" ]]; then
      bash "$target/modules/drift-detector/bin/check.sh" --target "$target" 2>&1 | tail -10 || echo "drift-detector not yet run"
    else
      echo "drift-detector not installed"
    fi
    ;;

  Q7)
    # Q7: What's the structural health?
    echo "Q7 — Structural health"
    echo
    manifest=0; [[ -f "$target/operatoros.yaml" ]] && manifest=1
    bootstrap=0; [[ -f "$target/bootstrap.md" ]] && bootstrap=1
    identity=0; [[ -f "$target/IDENTITY.md" ]] && identity=1
    catalog=0; [[ -f "$target/.operatoros/index.json" ]] && catalog=1

    echo "Manifest:    $([[ $manifest -eq 1 ]] && echo OK || echo MISSING)"
    echo "Bootstrap:   $([[ $bootstrap -eq 1 ]] && echo OK || echo MISSING)"
    echo "Identity:    $([[ $identity -eq 1 ]] && echo OK || echo MISSING)"
    echo "Catalog:     $([[ $catalog -eq 1 ]] && echo OK || echo MISSING)"
    ;;

  *)
    echo "Q-number not yet implemented: $q" >&2
    echo "  implemented: Q1, Q2, Q3, Q5, Q7" >&2
    exit 1
    ;;
esac