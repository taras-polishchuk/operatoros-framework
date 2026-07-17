#!/usr/bin/env bash
# mission-runner init <slug> [--target <path>] [--force] [--objective <text>]
set -euo pipefail

slug="${1:-}"
shift || true

target="."
force=0
objective=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)    target="$2"; shift 2 ;;
    --force)     force=1; shift ;;
    --objective) objective="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$slug" ]]; then
  echo "mission-runner init: <slug> is required" >&2
  exit 1
fi

if [[ ! "$slug" =~ ^[a-z0-9][a-z0-9-]*$ ]]; then
  echo "mission-runner init: slug must be kebab-case (lowercase, hyphens)" >&2
  exit 1
fi

dest="${target}/.project-state/${slug}"
if [[ -d "$dest" && $force -ne 1 ]]; then
  echo "mission-runner init: ${dest} already exists. Pass --force to overwrite." >&2
  exit 1
fi

mkdir -p "$dest"

ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

cat > "$dest/source-task.md" <<EOF
# Source Task — ${slug}

> **Mission slug:** \`${slug}\`
> **Date started:** ${ts}
> **Mode:** TBD (autonomous / supervised / manual)

## Mission objective

${objective:-_(fill in 1-3 sentences)_}

## Scope

## Inputs

## Outputs

## DoD (Definition of Done)
EOF

for f in progress.md decisions.md blockers.md artifacts.md environment.md execution-log.md final-report.md; do
  if [[ ! -f "$dest/$f" ]]; then
    cat > "$dest/$f" <<EOF
# ${f%.md} — ${slug}

> **Mission slug:** \`${slug}\`
> **Status:** in-progress

_Filled by mission execution._
EOF
  fi
done

echo "mission-runner: scaffolded ${dest} (8 standard artifacts)"