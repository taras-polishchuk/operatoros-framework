# Operating Model

> **Status:** Reference. This is the document that bridges OperatorOS (the methodology) and Workspace OS (one real-world instance).
> **Audience:** Engineers evaluating whether OperatorOS is for them.
> **Important:** This document shows ONE worked example (Taras's Workspace OS). It is not the canonical implementation of OperatorOS — it is one engineer's application of the six principles. Your workspace will look different.

This document maps each OperatorOS principle to its expression in **one specific workspace** — Taras Polishchuk's Workspace OS, which has been in daily use since early 2026. It is not a tutorial for building that workspace, and it is not a template. It is a snapshot showing how the six principles can be applied.

**If you are evaluating whether OperatorOS is for you, this document answers the question: "What does a 4-month-old OperatorOS-style workspace actually look like?"**

**If you want to build your own workspace, this document is NOT the place to start.** Start with `methodology/01-six-principles.md` (the principles), then `methodology/04-agent-bootstrap.md` (the agent entry protocol), then apply them to your own structure.

---

## Workspace OS — one worked example, NOT the canonical implementation

Workspace OS is Taras's personal operating system. It has been in daily use since early 2026. It implements the six principles of OperatorOS — sometimes consciously, sometimes by accident, often by hard-won lessons.

This section maps each OperatorOS principle to its expression in Workspace OS. The paths and structures here are **Taras's specific implementation**, not the only way to apply OperatorOS methodology.

Workspace OS is Taras's personal operating system. It has been in daily use since early 2026. It implements the six principles of OperatorOS — sometimes consciously, sometimes by accident, often by hard-won lessons.

This document maps each OperatorOS principle to its Workspace OS expression.

---

## Principle 1 — Single Authority → canonical paths

**Workspace OS expression.**

Every concept has one canonical home. Examples:

| Concept | Canonical location |
|---|---|
| Engineering identity | `career-operating-system/EngineeringIdentity.md` (symlinked as `IDENTITY.md`) |
| Constitutional rules | `GOVERNANCE/WORKSPACE-CONSTITUTION.md` |
| Subsystem map | `system-graph.md` (symlinked as `ARCHITECTURE.md`) |
| Mission lifecycle | `GOVERNANCE/DOCUMENT-LIFECYCLE.md` |
| Active projects | `CONTEXT/workspace-index.json` |
| Amendment history | `GOVERNANCE/AMENDMENTS.md` |

Anything that needs to reference one of these references by path. Duplicates are forbidden by Article II of the constitution.

**Operational rule.** If you find yourself creating a second file about the same concept, stop. Either the new file is wrong, or the canonical one needs to be updated.

---

## Principle 2 — Everything Replaceable → mission-scoped artifacts

**Workspace OS expression.**

Mission work produces artifacts in `.project-state/<mission-slug>/`. Each mission directory is self-contained. When the mission is done, the directory is moved to archive. The rest of the workspace is unaffected.

The 8-artifact sprint pattern (`source-task.md`, `decisions.md`, `progress.md`, `blockers.md`, `artifacts.md`, `environment.md`, `execution-log.md`, `final-report.md`) is the contract. Remove any one artifact, and the mission is no longer a mission — it's just a folder.

**Operational rule.** Nothing in `.project-state/` should be referenced by the rest of the workspace except via the `final-report.md` (which records decisions for posterity).

---

## Principle 3 — Typed Substrate → JSON-Schema validation

**Workspace OS expression.**

Configuration files have corresponding JSON-Schema definitions. The Core CLI (`operatoros validate`) runs validation as part of every operation that touches a config.

Schemas in OperatorOS:

- `schemas/workspace.schema.json` — defines the workspace.yaml structure
- `schemas/module.schema.json` — defines a module's manifest
- `schemas/preset.schema.json` — defines a preset's module list

The `__tests__/local-first.test.ts` analog in Workspace OS is the validator at `bin/validate-workspace.sh`, which checks:

- All governance files exist
- All references resolve
- No duplicate authority claims
- No orphaned mission directories

**Operational rule.** If you create a config without a schema, you're working outside the system. Either define the schema or accept that the config is a draft.

---

## Principle 4 — Composable → subsystem architecture

**Workspace OS expression.**

Workspace OS has six subsystems (S1–S6), each in its own directory:

- **S1 — Career operating system.** Identity, positioning, professional artifacts.
- **S2 — Projects.** Active project work, mission state.
- **S3 — Homelab.** Infrastructure, deployment, self-hosted services.
- **S4 — Knowledge.** Reading, research, learning.
- **S5 — Tools.** Tooling, automation, scripts.
- **S6 — Context.** Workspace-level context, indexes, governance.

Each subsystem has a `README.md`, a set of canonical documents, and zero coupling to other subsystems except through `CONTEXT/workspace-index.json`.

**Operational rule.** Adding a new subsystem requires updating `system-graph.md`, `workspace-index.json`, and `AI-AGENTS-INDEX.md`. That's the cost of composition.

---

## Principle 5 — Evidence-Based → mission lifecycle

**Workspace OS expression.**

Every change in Workspace OS is tied to a mission. The mission has:

- A `source-task.md` declaring what is being attempted
- A `decisions.md` recording why specific choices were made
- A `progress.md` showing checkpoints
- A `final-report.md` declaring what was achieved and what was abandoned

The bootstrap protocol tells agents: "Read final-report.md files to learn from past missions. Do not re-derive decisions that were already made."

**Operational rule.** Speculative work — "maybe I should add X" — does not get a mission directory. It stays in drafts until there is evidence that the work is needed.

---

## Principle 6 — Local-First → zero network in Core

**Workspace OS expression.**

The Core CLI (`/home/taras/projects/operatoros/core/`) has no network code. The constitutional test `__tests__/local-first.test.ts` enforces this on every PR. Violations fail the build.

In Workspace OS itself, mission artifacts stay on the local disk. Cloud services (if used) are opt-in modules with explicit network declarations.

**Operational rule.** If a feature requires the network, it's not a Core feature. It's an opt-in module that declares its network requirements.

---

## What Workspace OS does NOT do

For symmetry, here is what Workspace OS does NOT have, by design:

- **No cloud sync.** Data lives on one machine. Backups are manual.
- **No telemetry.** The Core never reports home.
- **No web UI.** Terminal-first.
- **No real-time collaboration.** Workspace OS is single-user.
- **No AI auto-actions.** AI agents can read; they don't write without explicit mission authority.

These exclusions are not limitations. They are the cost of Local-First.

---

## The relationship between OperatorOS and Workspace OS

| OperatorOS | Workspace OS |
|---|---|
| Open-source seed | Personal instance |
| Methodology documents | One implementation |
| Generic CLI | Daily-driver configuration |
| Public, MIT-licensed | Private, on Taras's machine |
| Aimed at engineers | Aimed at Taras |

OperatorOS is to Workspace OS what a programming language is to a program written in that language. The methodology is general; the implementation is specific.

Workspace OS does not depend on OperatorOS. OperatorOS exists because Workspace OS grew enough structure to be worth extracting.

---

## How to read this document

If you are new to OperatorOS, read this after `methodology/01-six-principles.md`. It shows what the principles look like when applied.

If you are building your own workspace, treat this as a worked example, not a template. Your subsystems will be different. Your mission structure will be different. Your evidence trail will be different. The principles stay.

---

*Last updated: 2026-07-11 (v0.6.0 — methodology pivot).*
*Part of the OperatorOS methodology. See `methodology/` for the principles themselves.*