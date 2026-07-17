---
name: Capability proposal
about: Propose a new capability (Core command or module) per CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md
title: "[CAPABILITY] <module-name> — <one-line summary>"
labels: ["capability-proposal", "needs-6-gate-walk", "needs-adr"]
assignees: []
---

> **Use this template for any new capability (Core command or module).**
> Per `CONTRIBUTING.md` §"How to propose a capability" and
> `methodology/07-capability-selection.md`.

## Capability summary

<!-- One paragraph: what is this capability, who is it for, what canonical question does it answer? -->

- **Name:** `module-name-here`
- **Layer:** Core | Module
- **Tier:** always-read | tier-0 read-out | reference | transactional | showcase
- **Q-coverage:** Q1–Q11 (which canonical questions does it answer?)
- **Local-First:** yes / no (must be yes per Principle 6)
- **Source:** examples/v080x-candidates/... | new proposal | (other)

## The 6 gates

Walk each gate from `methodology/07-capability-selection.md`. Failure at
any gate is binding.

### Gate 1 — Canonical question mapping
- [ ] Answers at least one Q1–Q11 (cite which)

### Gate 2 — Layer-fit
- [ ] Does not duplicate Core
- [ ] Does not duplicate existing Modules
- [ ] Honors wrap-not-replace rule (`MODULE-MODEL-CLARIFICATION-v0.8.0.md` §5.1)

### Gate 3 — Principle compliance
- [ ] Single Authority: no duplicate authority claims
- [ ] Everything Replaceable: declared in manifest, not by reaching into other modules
- [ ] Typed Substrate: module.yaml validates against `module.schema.json`
- [ ] Composable: no `../../` references to other modules
- [ ] Evidence-Based: ships with README + tests
- [ ] Local-First: no network primitives in `bin/*.sh`

### Gate 4 — Tier placement
- [ ] Tier declared with justification

### Gate 5 — Phase-3 validation
- [ ] Non-proposer engineer identified for Phase-3 review
- [ ] Validation ticket template at `state/v080-validate/<capability>.md` ready

### Gate 6 — Architecture-fit
- [ ] Does not violate any of the 17 §6 frozen decisions of [`docs/internal/architecture/ARCHITECTURE-FREEZE-v0.8.0.md`](./docs/internal/architecture/ARCHITECTURE-FREEZE-v0.8.0.md)
- [ ] If it does, an ADR is filed (cite ADR number)

## Module manifest sketch

```yaml
version: "1.0"
name: module-name-here
description: "..."
author: "..."
license: "MIT"
tags: [tier-...]

requires:
  core_version: "0.8.x"

commands:
  subcommand:
    run: "./bin/subcommand.sh \$@"
    description: "..."
```

## Subcommands

| Subcommand | What it does | Args |
|------------|--------------|------|
| ... | ... | ... |

## Implementation surface

- Source files: `modules/<name>/{module.yaml, bin/<cmd>.sh, README.md}`
- Tests: `modules/<name>/__tests__/` (or operatoros-v0.8.x specific path)
- LOC budget: ~XXX LOC (per `IMPLEMENTATION-PLAN-v0.8.0.md` §1 row, or estimate)

## Validation plan

- [ ] Phase-3 validation ticket ready (template at `state/v080-validate/<capability>.md`)
- [ ] Non-proposer engineer named
- [ ] Test fixtures prepared

## Risk assessment

Per `IMPLEMENTATION-PLAN-v0.8.0.md` §6 risk register:
- Risk 1 (`bootstrap-md` regression): N/A if not modifying init.ts
- Risk 2 (`bootstrap-tier-refresh` mid-write): N/A if not transactional
- Risk 3 (`drift-detector` checks shallow): N/A if not a principle check
- Risk 4 (`architecture-index` validate false positives): N/A if not in scope
- Risk 5 (`mission-runner` ADR drift): N/A if not generating templates
- Risk 6 (README regression): tick README updates

Plus any new risks introduced by this capability:

- ...

## Promotion path

- Source location: `examples/v080x-candidates/<name>/` (this proposal)
- After all 6 gates pass + non-proposer Phase-3 review + ADR accepted
- Final location: `modules/<name>/`

## Notes

<!-- Anything else. -->