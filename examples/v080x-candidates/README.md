# v0.8.x Candidates

> **Status:** Out-of-tree showcases. NOT part of the v0.8.0 ships-set.
> **Process:** Each module here is documented as a candidate for
> **v0.8.x / v0.9.0 inclusion** via ADR (per freeze §8.4).

## Why are these in `examples/` and not in `modules/`?

The architecture freeze (§5.1) fixes the v0.8.0 ships-set at exactly
10 ships. Adding a module to `modules/` would imply it's part of the
v0.8.0 ships-set. These four modules are **candidates** — they
demonstrate patterns that complement the v0.8.0 ships-set, but their
inclusion requires an ADR post-release.

## Candidates

| # | Module | Q-coverage | Tier | Notes |
|---|--------|------------|------|-------|
| 1 | `schema-validator` | Q3 | tier-0 read-out | Validate any YAML/JSON against a JSON Schema on demand. Distinct from `operatoros validate` (Core): operates on user-supplied files outside the workspace manifest. |
| 2 | `token-budget` | Q7 | tier-always-read | Measure token cost of bootstrap.md + IDENTITY.md + operatoros.yaml. Warn if always-read tier exceeds budget (default 3000 tokens). |
| 3 | `advisor` | Q1, Q11 | tier-0 read-out | Interactive: answer canonical questions Q1-Q11 directly. Synthesizes inspect + context-builder + drift-detector output into one Q&A. |
| 4 | `commit-message` | (workflow) | showcase | Generate Conventional Commits messages from staged git diff. Pure local, no network. |

## Local-First

All candidates pass the extended local-first test
(`__tests__/local-first.test.ts`).

## Process for promoting to v0.8.x / v0.9.0

1. File a capability proposal issue (per CONTRIBUTING.md §"How to propose a capability").
2. Walk the 6 gates of the capability framework.
3. If approved, file an ADR per freeze §8.4.
4. After ADR acceptance, move the module from `examples/v080x-candidates/` to `modules/`.

## See also

- `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md` — the 6 gates.
- `methodology/07-capability-selection.md` — methodology doc.
- `ARCHITECTURE-FREEZE-v0.8.0.md` §5.1, §8.4 — ships-set + ADR procedure.