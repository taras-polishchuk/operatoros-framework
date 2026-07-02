# OperatorOS — JSON Schemas

> **Status:** Phase 0 — schemas not yet authored. This README is the contract for how they're authored.

Each schema file in this directory is the **single source of truth** for one contract. Where TypeScript or Python SDKs exist, they derive their types from these schemas (e.g. `zod-to-json-schema`, `datamodel-code-generator`).

## Files (planned for Phase 1)

- `module.schema.json` — JSON Schema 2020-12 for `module.yaml`.
- `preset.schema.json` — JSON Schema 2020-12 for `preset.yaml`.
- `workspace.schema.json` — JSON Schema 2020-12 for `operatoros.toml`.

## Validation policy

- Adapters and Core parsers MUST validate against these schemas on every load.
- A schema change is a **breaking change** unless the change is purely additive (new optional field with safe default).
- Schema changes require a BDFL PR review at v0.x and lazy-consensus approval at v1.0+.

## Compatibility target

JSON Schema 2020-12 ([https://json-schema.org/draft/2020-12](https://json-schema.org/draft/2020-12)). Avoid newer drafts until ecosystem catches up.
