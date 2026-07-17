# Capability Selection

> **Status:** Methodology doc (v0.8.0 M5 deliverable).
> **Source:** `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md` (frozen artifact).
> **Purpose:** Apply the capability framework when proposing a new module
> or capability for an OperatorOS-managed workspace.

## What this is

A capability is a unit of workspace behavior that answers a canonical
question (Q1–Q11). The capability selection framework is the 6-gate
decision tree that decides whether a proposed capability should be
adopted, deferred, or rejected — and at which tier (always-read,
tier-0 read-out, reference, transactional, showcase).

## The 6 gates

Apply each gate in order. Failure at any gate is binding; the
proposal does not advance.

### Gate 1 — Canonical-question mapping

The capability must answer at least one canonical question (Q1–Q11).
Capabilities that don't answer a canonical question are "utilities",
not workspace capabilities.

### Gate 2 — Layer-fit

The capability must declare its layer (Core / Module). Modules must
not duplicate Core; Core must not duplicate Modules. Per the
wrap-not-replace rule (`MODULE-MODEL-CLARIFICATION-v0.8.0.md` §5.1).

### Gate 3 — Principle compliance

The capability must pass all six principle checks (Single Authority,
Everything Replaceable, Typed Substrate, Composable, Evidence-Based,
Local-First). A capability that violates a principle is rejected.

### Gate 4 — Tier placement

The capability must declare its tier:
- **Always-read** — produced by generators; read by every AI agent.
- **Tier-0 read-out** — produces a workspace read; non-destructive.
- **Reference** — audits the workspace against a fixed rule set.
- **Transactional** — mutates multiple files atomically.
- **Showcase** — demonstrates a pattern; runnable demo.

### Gate 5 — Phase-3 validation

A non-proposer engineer must run the capability against a fixture
and file a `state/v080-validate/<capability>.md` report. Self-validation
is not a substitute (per framework §1.4 test 1).

### Gate 6 — Architecture-fit

The capability must not violate any of the 17 §6 frozen decisions of
`ARCHITECTURE-FREEZE-v0.8.0.md`. If it does, an ADR is required.

## Output

Passing all 6 gates → ship. Failing any → defer, reposition, or reject.

## Worked example

The proposed `secret-rotation` capability fails Gate 3 (Local-First)
because rotating secrets against a remote vault is a network primitive.
Result: reject. Workaround: a `vault-rotate` module that operates
on local `vault/` content (still Local-First); pass through Gate 3.

## See also

- `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md` — full framework (frozen).
- `MODULE-MODEL-CLARIFICATION-v0.8.0.md` — wrap-not-replace rule.
- `CANONICAL-QUESTIONS-v0.8.0.md` — Q1–Q11 taxonomy.
- `methodology/01-six-principles.md` — six principles.