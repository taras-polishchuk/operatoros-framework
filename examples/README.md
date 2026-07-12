# examples/

> **Status:** Worked-example directory.
> **Boundary:** This directory holds *instances* of OperatorOS methodology applied
> by concrete engineers to their own workspaces. It is **not** the canonical
> methodology — the canonical guidance lives in `methodology/`.

## What belongs here

- **Worked examples** of any OperatorOS methodology artifact: a populated
  `bootstrap.md`, a completed onboarding interview, an `IDENTITY.md` shape, etc.
- Each file MUST carry a header status line that reads exactly one of:
  - `Worked example — NOT a generic template` (default), or
  - `Worked example by <author> as of YYYY-MM-DD`.

## What does NOT belong here

- The canonical methodology itself. That lives in `methodology/`. If you find
  yourself writing universal guidance here, stop — move it to `methodology/`.
- Bundled module YAMLs. See `CONTRIBUTING.md` §"How to add a module" for the
  module contract and `schemas/module.schema.json` for the source of truth.
- Empty example directories or placeholder READMEs. They will be removed on
  sight per `CONTRIBUTING.md` §"Ground rules".

## Why this directory exists

A reader who follows the OperatorOS flow lands on a worked example after the
canonical methodology. The worked example shows one engineer's application of
the canonical rules — paths, subsystem names, answers to the onboarding
interview. Reading the worked example before reading the canonical protocol is
fine for orientation; copying it verbatim into your own workspace is not,
because your paths, subsystems, and answers will differ.

## Files

| File | What it illustrates |
|---|---|
| `bootstrap-taras-workspace.md` | A populated `bootstrap.md` (Taras's Workspace OS). Shows what a 4+ month-old workspace's bootstrap file looks like. **Not a generic template.** |

## See also

- `methodology/04-agent-bootstrap.md` — the generic bootstrap protocol this
  directory's file instantiates.
- `methodology/05-onboarding-interview.md` — the 5-question interview the
  bootstrap file references.
