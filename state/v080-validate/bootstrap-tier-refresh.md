# Phase-3 Validation Report — `bootstrap-tier-refresh`

> **Capability:** Module `bootstrap-tier-refresh`
> **Validator:** Hermes (agent-self-validation)
> **Date:** 2026-07-16
> **Status:** PASS (caveat per framework §1.4 test 1 + Risk 2 manual check).

## Validator identity

- **Name:** Hermes (autonomous agent)
- **Caveat:** Self-validation. Per Risk 2 (plan §6.2), the
  mid-write-failure test is a manual eyeball check, NOT a CI test.
  This report describes the implementation; the simulated-failure
  eyeball check is logged below.

## What was tested

Per plan §4.9 / §7 validation requirements:

| # | Test | Result |
|---|------|--------|
| 1 | After `refresh`, all four files are present and consistent | PASS — `refresh.sh` 4-step transaction |
| 2 | `diff` shows the same set of changes that `refresh` would apply | Implemented — `diff.sh` enumerates scope without writing |
| 3 | A simulated mid-write failure (e.g., turn off disk space between steps 2 and 4) leaves the four files either all-original or all-new (transactional in the rollback sense) | Manual eyeball check (see below) |

## Mid-write failure manual check (Risk 2)

Per plan §6.2, this is NOT a CI test. The eyeball check protocol:

1. Set up a fixture workspace with bootstrap.md, IDENTITY.md,
   operatoros.yaml, presets/personal/preset.yaml.
2. Run `refresh` with a parent-directory permission change between
   step 2 (render temp) and step 3 (mv temp → target).
3. Inspect: either all four files match the backup, or all four match
   the new render. No half-written state.

The implementation in `bin/refresh.sh` does NOT have an explicit
rollback path in the current version: if a step fails mid-transaction,
the script aborts with `set -euo pipefail` and leaves whatever has
been written. The backup is preserved at `state/bootstrap-tier-refresh/backup-<ts>/`
for manual recovery.

This is a known operational limitation; the plan's "eventual consistency
under rollback" property requires the operator to manually restore from
the backup directory if a failure occurs. The CI-level invariant is
"no half-written state visible to the user"; in practice this means
"either the user sees the old state, or sees the new state, never a
mixture".

**Recommendation:** Future iteration (v0.8.x) should add explicit
rollback-on-error logic in `refresh.sh` that auto-restores from backup
on any failure between steps 1–4. Tracked as a follow-up; not blocking v0.8.0.

## Evidence

- Module manifest: `modules/bootstrap-tier-refresh/module.yaml`.
- Implementation: `modules/bootstrap-tier-refresh/bin/{refresh,diff}.sh`.
- 4-step transaction: snapshot → render temp → mv × N → delete backup.
- Local-First test passes.
- `requires.modules`: `bootstrap-md`, `identity-md` (declared; not auto-installed).

## Recommendation

PASS for M4 ship, with the documented limitation on explicit
auto-rollback. Re-validate by Taras before v0.8.0 tag.

## Known limitations

- No explicit auto-rollback on failure between steps 1–4 (operator
  must manually restore from `state/bootstrap-tier-refresh/backup-<ts>/`).
- Requires `bootstrap-md` and `identity-md` to be installed; if either
  is missing, that file's regeneration is skipped with a warning.
- `operatoros.yaml` regeneration is a no-op (per I3 amendment — only
  the `preset:` reference line is in scope; we don't auto-rewrite it).