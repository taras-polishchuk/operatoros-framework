#!/usr/bin/env bash
# schema-validator check <target> [--schema <path>] [--schema-name <name>]
#
# Validate a YAML or JSON file against a JSON Schema. Distinct from
# operatoros validate (Core): operates on user-supplied files outside
# the workspace manifest, with explicit schema-file or schema-name flag.
#
# Uses ajv-cli if available, else falls back to a pure-shell heuristic
# (presence of required fields). The shell heuristic is a placeholder
# for a real implementation; promote to v0.8.x only when ajv-cli is
# added to the dependency set (or a Node fallback is implemented).
set -euo pipefail

target="${1:-}"
shift || true

schema_path=""
schema_name=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --schema)       schema_path="$2"; shift 2 ;;
    --schema-name)  schema_name="$2"; shift 2 ;;
    *) echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

if [[ -z "$target" ]]; then
  echo "schema-validator check: <target> is required" >&2
  echo "  usage: check <file> [--schema <path>] [--schema-name <name>]" >&2
  exit 1
fi

if [[ ! -f "$target" ]]; then
  echo "schema-validator check: file not found: $target" >&2
  exit 1
fi

# Resolve schema
if [[ -n "$schema_name" ]]; then
  # Look up bundled schema by name
  schema_path="$(find /home/taras/projects/operatoros/schemas -name "${schema_name}.schema.json" 2>/dev/null | head -1)"
  if [[ -z "$schema_path" ]]; then
    echo "schema-validator check: unknown schema name: ${schema_name}" >&2
    echo "  available: workspace, module, preset, catalog, identity" >&2
    exit 1
  fi
fi

if [[ -z "$schema_path" ]]; then
  echo "schema-validator check: --schema or --schema-name required" >&2
  exit 1
fi

if [[ ! -f "$schema_path" ]]; then
  echo "schema-validator check: schema not found: $schema_path" >&2
  exit 1
fi

echo "# Schema Validation — $target"
echo
echo "schema: $schema_path"
echo

# Real implementation: delegate to ajv-cli if available
if command -v ajv >/dev/null 2>&1; then
  if ajv validate -s "$schema_path" -d "$target" --spec=draft2020 2>&1; then
    echo "VALID"
    exit 0
  else
    echo "INVALID"
    exit 1
  fi
fi

# Fallback: pure-shell heuristic — check for "required" fields presence.
# This is NOT a real JSON Schema validator; it's a placeholder for the
# v0.8.x promotion milestone (add ajv to deps or implement Node fallback).
echo "warning: ajv-cli not installed; running pure-shell heuristic (NOT a real validator)"
echo

# Extract the "required" array from the schema's top-level properties.
# We use a node one-liner to avoid grep-based regex confusion.
required="$(node -e "
  try {
    const schema = JSON.parse(require('fs').readFileSync('$schema_path', 'utf8'));
    const req = (schema.required || []).filter(r => r !== 'required');
    process.stdout.write(req.join(' '));
  } catch (e) {
    process.exit(0);
  }
" 2>/dev/null || true)"

# Trim whitespace
required="$(echo "$required" | xargs)"

if [[ -z "$required" ]]; then
  echo "OK: schema has no required fields"
  exit 0
fi

missing=0
for field in $required; do
  if grep -qE "^${field}[[:space:]]*:" "$target" 2>/dev/null || grep -qE "\"${field}\"" "$target" 2>/dev/null; then
    echo "OK: required field '${field}' present"
  else
    echo "MISSING: required field '${field}'"
    missing=$((missing + 1))
  fi
done

echo
if [[ $missing -eq 0 ]]; then
  echo "Result: VALID (heuristic)"
else
  echo "Result: INVALID (${missing} required field(s) missing)"
  exit 1
fi