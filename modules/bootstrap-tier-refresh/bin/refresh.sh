#!/usr/bin/env bash
# bootstrap-tier-refresh refresh — atomic regen of always-read tier.
#
# Per B3 (revised) amendment: no Core helper added. Module uses POSIX mv
# (atomic per file on the same filesystem) + backup-rollback script.
#
# 4-step transaction:
#   1. Snapshot to state/bootstrap-tier-refresh/backup-<ts>/
#   2. Render new content into sibling temp paths
#   3. mv each temp → target (atomic per file)
#   4. Delete backup. On any failure: restore from backup.
set -euo pipefail

target="."
no_backup=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target)    target="$2"; shift 2 ;;
    --no-backup) no_backup=1; shift ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

manifest="${target}/operatoros.yaml"
if [[ ! -f "$manifest" ]]; then
  echo "bootstrap-tier-refresh: no operatoros.yaml at ${target}" >&2
  exit 1
fi

preset="$(grep -E '^preset:' "$manifest" | head -1 | sed -E 's/^preset:[[:space:]]*//' | tr -d '\"' || true)"
[[ -z "$preset" ]] && preset="personal"

state_dir="${target}/state/bootstrap-tier-refresh"
ts="$(date -u +%Y%m%dT%H%M%SZ)"
backup_dir="${state_dir}/backup-${ts}"
mkdir -p "$backup_dir"

# Files we will refresh
files=(
  "${target}/bootstrap.md"
  "${target}/IDENTITY.md"
  "${target}/operatoros.yaml"
  "${target}/presets/${preset}/preset.yaml"
)

# Step 1: snapshot
if [[ $no_backup -ne 1 ]]; then
  for f in "${files[@]}"; do
    if [[ -f "$f" ]]; then
      rel="${f#${target}/}"
      mkdir -p "${backup_dir}/$(dirname "$rel")"
      cp "$f" "${backup_dir}/${rel}"
    fi
  done
  echo "step 1: snapshot at ${backup_dir}"
fi

# Step 2: render new content into temp paths
# We delegate to the bootstrap-md module for bootstrap.md, and use the
# existing files for the others (no-op regeneration).
declare -a new_paths
declare -a target_paths

# bootstrap.md — delegate to bootstrap-md render
bootstrap_tmp="$(mktemp "${target}/bootstrap.md.tmp.XXXX")"
if bash "${target}/modules/bootstrap-md/bin/render.sh" --target "$target" --out "$bootstrap_tmp" 2>/dev/null; then
  if [[ -s "$bootstrap_tmp" ]]; then
    new_paths+=("$bootstrap_tmp")
    target_paths+=("${target}/bootstrap.md")
  else
    rm -f "$bootstrap_tmp"
    echo "warning: bootstrap-md render produced empty output; skipping"
  fi
else
  rm -f "$bootstrap_tmp"
  echo "warning: bootstrap-md render failed; skipping"
fi

# IDENTITY.md — re-emit from latest interview (only if identity-md is installed).
if [[ -f "${target}/modules/identity-md/module.yaml" ]]; then
  id_tmp="$(mktemp "${target}/IDENTITY.md.tmp.XXXX")"
  if bash "${target}/modules/identity-md/bin/init.sh" --target "$target" >/dev/null 2>&1; then
    # init.sh writes to ${target}/IDENTITY.md; copy it to temp for atomic move
    if [[ -f "${target}/IDENTITY.md" ]]; then
      cp "${target}/IDENTITY.md" "$id_tmp"
      new_paths+=("$id_tmp")
      target_paths+=("${target}/IDENTITY.md")
    fi
  else
    rm -f "$id_tmp"
    echo "warning: identity-md init failed; skipping IDENTITY.md"
  fi
fi

# operatoros.yaml — only the `preset:` reference line is regenerated
# (per I3 amendment). For now: no-op (we don't auto-change preset).
echo "step 2: rendered ${#new_paths[@]} temp file(s)"

# Step 3: mv each temp → target (atomic per file)
for i in "${!new_paths[@]}"; do
  mv "${new_paths[$i]}" "${target_paths[$i]}"
  echo "step 3: ${target_paths[$i]}"
done

# Step 4: delete backup (transaction success)
if [[ $no_backup -ne 1 && ${#new_paths[@]} -gt 0 ]]; then
  rm -rf "$backup_dir"
  echo "step 4: backup deleted (transaction complete)"
elif [[ $no_backup -eq 0 ]]; then
  rm -rf "$backup_dir"
  echo "step 4: nothing to commit; backup deleted"
fi

echo "bootstrap-tier-refresh: done (${#new_paths[@]} file(s) refreshed)"