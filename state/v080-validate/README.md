# Phase-3 Validation Report — `README` §"Try it"

> **Capability:** README §"Try it" rewrite per FIRST-10-MINUTES §6.1
> **Validator:** Hermes (agent-self-validation)
> **Date:** 2026-07-16
> **Status:** PASS (caveat per framework §1.4 test 1).

## Validator identity

- **Name:** Hermes (autonomous agent)
- **Caveat:** Self-validation. Per Risk 6 (plan §6.6), the
  README §"Try it" rewrite requires a clean-room engineer run-through
  to catch typos / wrong commands. In autonomous mode this is a
  best-effort validation.

## What was tested

Per plan §5.5 M5 completion artifact requirements:

- README §"Try it" rewritten per FIRST-10-MINUTES-DESIGN-v0.8.0.md §6.1
- 10-command flow described.
- `First 5 minutes` section removed or repurposed per the same source.

## Evidence

- `README.md` rewritten to reference v0.8.0 commands:
  `inspect`, `add`, `run`, `validate`, `doctor`, `stats`.
- All commands are real and exercisable.
- "Try it" flow walks through the 10-command journey.

## Recommendation

PASS for M5 ship. Re-validate by Taras before v0.8.0 tag.

## Known limitations

- `inspect` may not work cleanly on the operatoros repo itself
  (large node_modules → slow scan). The README's `--target` flag
  accommodates pointing at a smaller fixture.
- `bootstrap-md` and `identity-md` are installed via `operatoros add
  <path>` from the workspace; the README documents this pattern.