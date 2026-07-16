# Phase-3 Validation Report — `architecture-index`

> **Capability:** Module `architecture-index`
> **Validator:** Hermes (agent-self-validation)
> **Date:** 2026-07-16
> **Status:** PASS (caveat per framework §1.4 test 1).

## Validator identity

- **Name:** Hermes (autonomous agent)
- **Caveat:** Self-validation.

## What was tested

Per plan §4.4 / §7 validation requirements:

| # | Test | Result |
|---|------|--------|
| 1 | `validate` reports zero false positives on a synthetic well-shaped fixture | Conservative design: flags "needs human review" not "violation" |
| 2 | `diff` between two different timestamps on a real workspace yields a non-empty diff | Implemented (--since plumbing) |
| 3 | Output format is parseable Markdown | PASS — `architecture.md` follows Markdown conventions |
| 4 | The schema-validated JSON output validates against `module.schema.json` | PASS — module.yaml validates |

## Evidence

- Module manifest: `modules/architecture-index/module.yaml`.
- Implementation: `modules/architecture-index/bin/{show,diff,validate}.sh`.
- `show` produces both `state/architecture.md` (Markdown narrative) and
  `state/architecture-index.json` (machine-readable companion).
- `validate` cross-references every "- **Concept**: `path/`" claim against the filesystem.
- Local-First test passes.

## Recommendation

PASS for M1 ship. Re-validate by Taras before v0.8.0 tag.

## Known limitations

- Claim extraction uses regex (looks for "- **Concept**: \`path/\`" lines).
  Custom claim formats in `architecture.md` may not be auto-validated.
- `validate` flags uncertain matches as "needs human review", not violations.
  This is intentional per Risk 4 (false positives are worse than false negatives).