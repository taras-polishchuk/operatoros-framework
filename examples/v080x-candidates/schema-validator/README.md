# schema-validator (v0.8.x candidate)

**Tier:** 0 (read-out)
**Q-coverage:** Q3
**Status:** v0.8.x candidate (NOT in v0.8.0 ships-set)

Validate any YAML/JSON file against a JSON Schema on demand.
Distinct from `operatoros validate` (Core): operates on user-supplied
files outside the workspace manifest, with explicit `--schema` or
`--schema-name` flag.

## Subcommands

- `check <file> [--schema <path>] [--schema-name <name>]` — validate.
- `list [--target <path>]` — list bundled + workspace schemas.

## Promotion path

This module uses `ajv-cli` if installed; otherwise falls back to a
pure-shell heuristic (presence of required fields). The heuristic is
a placeholder for v0.8.x promotion — install `ajv-cli` to enable
real validation.

```bash
npm install -g ajv-cli
ajv --help  # confirm available
```

Once `ajv-cli` is in the dependency set (or a Node fallback is
implemented), this module can be promoted from `examples/` to
`modules/` via an ADR per freeze §8.4.

## Local-First

No network calls. Pure filesystem read + (optional) ajv.

## Usage

```bash
# 1. Copy this directory into modules/
cp -r examples/v080x-candidates/schema-validator modules/
# 2. Validate an operatoros.yaml against the bundled workspace schema
operatoros run schema-validator check /path/to/operatoros.yaml --schema-name workspace
# 3. Validate an IDENTITY.md against identity.schema.json
operatoros run schema-validator check /path/to/IDENTITY.md --schema-name identity
# 4. List available schemas
operatoros run schema-validator list --target /path/to/workspace
```