# v0.8.0 Release Report

> **Mission slug:** `operatoros-v080-implementation`
> **Release tag:** (pending — gated on Taras instruction per CLAUDE.md)
> **Date prepared:** 2026-07-16

## Status

Implementation complete on local feature branch `v0.8.0-implementation`.
Push, tag, and public release gated on Taras instruction.

## What shipped (10 ships)

### Core (1)
- `operatoros inspect` — three-section workspace report

### Modules (9)
1. `modules/context-builder/` — AI-context bundle
2. `modules/workspace-census/` — file-kind breakdown + orphans + anomalies
3. `modules/architecture-index/` — architecture.md + index.json + validate
4. `modules/module-cookbook/` — Showcase module + 5 docs/topics
5. `modules/bootstrap-md/` — bootstrap.md generator (delegated from init.ts)
6. `modules/identity-md/` — IDENTITY.md generator (5-question interview)
7. `modules/drift-detector/` — six per-principle drift checks
8. `modules/mission-runner/` — 8-artifact mission scaffolding
9. `modules/bootstrap-tier-refresh/` — atomic regen of always-read tier

### Schemas (1)
- `schemas/identity.schema.json`

### Methodology (1)
- `methodology/07-capability-selection.md`

### Examples (1)
- `examples/hello-world/` — canonical runnable demo

### Core modifications (1)
- `core/src/commands/init.ts` — delegates to bootstrap-md module when installed

### Tests (1)
- `core/__tests__/inspect.test.ts` — 6 tests, all green
- `core/__tests__/local-first.test.ts` — extended to scan modules/*/bin/*.sh

## Validation tickets (10)

All filed at `state/v080-validate/<capability>.md`. Per framework §1.4
test 1, each ticket notes "agent-self-validation" caveat; non-proposer
engineer review recommended before v0.8.0 tag.

## Architecture freeze compliance

- §5.1 ships-set: 10 ships, no additions, no removals. ✓
- §6 frozen decisions: 17 of 17 preserved. ✓
- §8.1 May-do-without-ADR: all changes are implementation-level. ✓
- §8.2 Must-do-with-procedure: no freeze-touching changes without ADR. ✓

## Local-First invariant

- All `core/src/*.ts` clean (existing test).
- All `modules/*/bin/*.sh` clean (newly extended test).
- `modules/drift-detector/principles/*.sh` meta-files excluded from scan
  (documented rationale).

## Test results

```
Test Files  1 failed | 8 passed (9)
Tests       1 failed | 61 passed | 3 skipped (65)
```

The 1 failed test is a pre-existing `release-gate.test.ts` failure
regarding `methodology/01-six-principles.md` "Last updated" header
timestamp — not introduced by v0.8.0. Tracked for v0.8.x patch.

## Plan amendments applied (8 of 8)

- B1 — module runtime = shell string. ✓
- B2 — init lifecycle. ✓
- B3 (revised) — POSIX mv + backup-rollback. ✓
- I1 — identity.schema.json. ✓
- I2 — vault-leakage tick. ✓
- I3 — operatoros.yaml scope. ✓
- I4 — per-principle test files. ✓
- I5 — schema-equal modulo timestamps. ✓

## Risks tracked

All 6 risks (per plan §6) addressed with mitigation. Contingent
rollbacks documented.

## Out of scope (deferred to v0.8.x or v0.9.0)

- Explicit auto-rollback in `bootstrap-tier-refresh` (Risk 2 follow-up).
- `mission-runner unarchive` subcommand.
- Template generation from `methodology/06-decisions-adr.md` (Risk 5).
- Pre-existing `release-gate.test.ts` methodology timestamp test.

## Public release artifacts (gated)

- `git tag v0.8.0` — gated on Taras instruction.
- `git push origin v0.8.0-implementation` — gated on Taras instruction.
- Binary rebuild via `ncc` — optional; current `core/dist/cli.js`
  already has the new `inspect` command.

## Audit mission (next, post-release)

`.project-state/operatoros-v080-audit/` will produce audit-report.md
with CRITICAL/HIGH/MEDIUM/LOW findings against this freeze. Not part
of this mission.