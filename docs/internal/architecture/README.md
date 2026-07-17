# Architecture Program History (v0.8.0)

> **Status:** Internal — v0.8.0 program artifacts. Not user-facing.
> **Date range:** 2026-06 to 2026-07.

This directory contains the working documents from the v0.8.0
architecture program — the design, freeze, and implementation
artifacts that produced the v0.8.0 ships-set. They are kept
here for historical reference and continuity, not for the
new visitor.

## The 14 documents

### Inputs (research and discovery)

- `ANALYSIS-v0.7.1-directive.md` — directive for the v0.7.1
  positioning pivot (input to v0.8.0 program).
- `CORE-PROMISE-2026-07-15.md` — the validated one-sentence
  product promise.
- `POSITIONING-RESEARCH-2026-07-15.md` — competitor analysis
  (AGENTS.md, chezmoi, Nix Home Manager).
- `POSITIONING-VALIDATION-2026-07-15.md` — visitor
  first-impression validation.

### Architecture design (program outputs)

- `CANONICAL-QUESTIONS-v0.8.0.md` — Q1–Q11 canonical question
  taxonomy.
- `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md` — module ecosystem taxonomy.
- `MODULE-MODEL-CLARIFICATION-v0.8.0.md` — wrap-not-replace rule.
- `FIRST-10-MINUTES-DESIGN-v0.8.0.md` — adopt-on-ramp journey
  (visitor's first 10 minutes).
- `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md` — the 6-gate
  decision tree for new capabilities.
- `OPERATING-MODEL.md` — the author's daily-practice model that
  informed the methodology.

### Architecture freeze (binding)

- `ARCHITECTURE-FREEZE-v0.8.0.md` — **the 17 §6 frozen
  decisions**. Read this first if you want to understand
  what v0.8.0 is constrained to.
- `ARCHITECTURE-PROGRAM-CLOSING-v0.8.0.md` — formal program
  closure.

### Implementation (program execution)

- `IMPLEMENTATION-START-BRIEF-v0.8.0.md` — one-page hand-off
  from architecture to engineering.
- `IMPLEMENTATION-PLAN-v0.8.0.md` — 5-milestone, 8-workstream
  plan that produced the 10 ships.

## What is NOT here (user-facing docs)

The following are at the **repo root** for new visitors:

- `README.md` — the entry point.
- `CHANGELOG.md` — release history.
- `CONTRIBUTING.md` — how to add modules / propose capabilities.
- `ROADMAP.md` — forward-looking plan.
- `LICENSE`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `FUNDING.md`,
  `GOVERNANCE.md`.

The following are in `methodology/` for engineering depth:

- `01-six-principles.md` — constitutional rules.
- `02-doc-lifecycle.md` through `06-decisions-adr.md` — the
  methodology documents.
- `07-capability-selection.md` — methodology doc rendering
  of the framework.

The following are operational:

- `state/v080-validate/` — Phase-3 validation tickets.
- `state/v080-audit-report.md`, `state/v080-fix-list.md`,
  `state/v080-release-report.md` — audit and release reports.
- `state/drift-detector/` — auto-generated drift reports
  (untracked, runtime output).

## How to use this directory

1. **Reading for the first time?** Skip this directory. Start
   with `README.md` and `methodology/`.
2. **Investigating a design decision?** Check
   `ARCHITECTURE-FREEZE-v0.8.0.md` first.
3. **Understanding a specific capability's origin?** Check
   `CANONICAL-QUESTIONS-v0.8.0.md` and `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md`.
4. **Reconstructing the implementation history?** Read in
   chronological order: `POSITIONING-RESEARCH` →
   `CORE-PROMISE` → `ARCHITECTURE-FREEZE` → `IMPLEMENTATION-PLAN` →
   `IMPLEMENTATION-START-BRIEF` → `ARCHITECTURE-PROGRAM-CLOSING`.

## Why this directory exists

These 14 documents are the working trail of the v0.8.0 program
— the design, the discovery, the freeze, the plan. They are
preserved because they explain *why* the methodology and
implementation look the way they do, not just *what* they are.

A new visitor landing on the repo root sees a focused surface:
9 files (8 docs + 1 LICENSE) that explain the project, the
contribution process, and the license. The 14 architecture
program artifacts are here, one click away, when the visitor
needs to go deeper.

The split is intentional: root = onboarding; this directory
= institutional memory.