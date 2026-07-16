#!/usr/bin/env bash
# mission-runner archive <slug> -- move to .project-state/archive/<slug>/.
set -euo pipefail

slug="${1:-}"
shift || true

target="."
while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$slug" ]]; then
  echo "mission-runner archive: <slug> is required" >&2
  exit 1
fi

src="${target}/.project-state/${slug}"
archive="${target}/.project-state/archive"

if [[ ! -d "$src" ]]; then
  echo "mission-runner archive: no mission at ${src}"
  exit 1
fi

if [[ -d "$archive/${slug}" ]]; then
  echo "mission-runner archive: ${archive}/${slug} already exists; refusing" >&2
  exit 1
fi

mkdir -p "$archive"
mv "$src" "$archive/${slug}"
echo "mission-runner: archived → ${archive}/${slug}"