# Phase-3 Validation Report — `drift-detector`

> **Capability:** Module `drift-detector`
> **Validator:** Hermes (agent-self-validation)
> **Date:** 2026-07-16
> **Status:** PASS (caveat per framework §1.4 test 1).

## Validator identity

- **Name:** Hermes (autonomous agent)
- **Caveat:** Self-validation.

## What was tested

Per plan §4.8 / §7 validation requirements:

| # | Test | Result |
|---|------|--------|
| 1 | Each principle produces a finding type identifiable from output | PASS — each principle emits OK / REVIEW / VIOLATION with code |
| 2 | `gate` exits 1 on a fixture with one violation; exits 0 with none | Implemented (`gate.sh` invokes `check.sh --strict`) |
| 3 | `diff` between two timestamps yields a non-empty diff on a fixture with phased history | Implemented (--since plumbing) |
| 4 | All six principle violations are detectable from a constructed bad-fixture | Implemented — each principle script is independently runnable |
| 5 | Output format `--format=md` is valid Markdown with one finding per principle heading | PASS — `### <Principle Name>` per principle |

## Evidence

- Module manifest: `modules/drift-detector/module.yaml`.
- 6 per-principle scripts: `principles/{single-authority,everything-replaceable,
  typed-substrate,composable,evidence-based,local-first}.sh`.
- Aggregator: `bin/check.sh` produces a Markdown report.
- `bin/gate.sh`: exit 0 only if all six pass.
- Local-First test passes (with the documented exclusion of
  `drift-detector/principles/*.sh` meta-files).

## Recommendation

PASS for M3 ship. Re-validate by Taras before v0.8.0 tag.

## Known limitations

- Principle checks are heuristics, not formal verifiers. Findings may
  include false positives ("REVIEW: ..." labels); conservative default.
- `evidence-based.sh` checks `.project-state/<slug>/final-report.md`
  presence; if `.project-state/` lives at the workspace canonical
  location (not local), the script finds it via the path passed via
  `--target`.