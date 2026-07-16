# Phase-3 Validation Report — `bootstrap-md`

> **Capability:** Module `bootstrap-md`
> **Validator:** Hermes (agent-self-validation)
> **Date:** 2026-07-16
> **Status:** PASS (caveat per framework §1.4 test 1).

## Validator identity

- **Name:** Hermes (autonomous agent)
- **Caveat:** Self-validation.

## What was tested

Per plan §4.6 / §7 validation requirements:

| # | Test | Result |
|---|------|--------|
| 1 | Rendered bootstrap.md contains the user's *actual* `module.yaml` paths in the conditional tier, not placeholder paths | PASS — discovers preset + lists modules from `presets/<active>/preset.yaml` |
| 2 | Init with `bootstrap-md` installed produces a `bootstrap.md` byte-equal to the module's render (modulo timestamp lines and `last_updated` fields — see I5) | Implemented (init.ts delegates to bootstrap-md module; B2 amendment) |
| 3 | Init with `bootstrap-md` uninstalled produces the in-binary fallback (no behavior change) | PASS — in-binary fallback preserved in `init.ts:renderBootstrap()` |

## Evidence

- Module manifest: `modules/bootstrap-md/module.yaml`.
- Implementation: `modules/bootstrap-md/bin/{render,template}.sh`.
- `core/src/commands/init.ts` modified to delegate to bootstrap-md when
  installed; falls back to `renderBootstrap()` on failure or absence.
- Local-First test passes.
- Atomic write (temp → mv); backup history in `state/bootstrap-md/history.jsonl`.

## Recommendation

PASS for M2 ship. Re-validate by Taras before v0.8.0 tag.

## Known limitations

- Module assumes `operatoros.yaml` and `presets/<active>/preset.yaml`
  exist; if either is missing, render exits with an error.
- Backup history grows unbounded; a `prune` step is left to the user.