# Decisions — Architecture Decision Records (ADR)

> **Status:** Operational convention.
> **Audience:** AI agents and humans who run missions in OperatorOS-managed workspaces.
> **Cross-references:** `01-six-principles.md` (Evidence-Based principle), `02-doc-lifecycle.md` (state transitions), `04-agent-bootstrap.md` (where this file lives in the bootstrap tier).

This document specifies the **shape** of a Decision entry in `<workspace-root>/.project-state/<mission-slug>/decisions.md`. The decisions themselves are recorded in each mission directory; this file is the canonical reference for HOW to record them. Per OperatorOS Evidence-Based principle, the canonical root is the **workspace root** (OperatorOS abstraction `<workspace-root>`), never inside any sub-project repository.

## Why a fixed shape

- **Grepability.** A future reader searches for `## Decision 3 —` and lands on the exact entry. Without a shape, every mission reinvents the format and history becomes opaque.
- **Cross-referencing.** Two ADRs can reference each other by `Replaces: N` or `Replaced by: N`, and the link survives for years.
- **Evolvability.** Each ADR is small enough (≤200 lines) to rewrite in place during a follow-up mission. Replacing an old decision means publishing a new ADR that explicitly supersedes it — never silent edits.

---

## Required shape

Every ADR has exactly five sections, in this order:

```markdown
## Decision <N> — <short title>

**Context:** <one paragraph: the situation, the question, the forces at play>

**Decision:** <one paragraph: the choice made>

**Rationale:** <why this choice; cite principles, evidence, or constraints>

**Alternatives considered:** <bulleted list, each one short; one-line rejection reason>

**Status:** <one of: proposed | accepted | superseded | deprecated>
```

Optional add-ons (use only when the section actually adds value):

- **Cross-reference:** `<Replaces: Decision N>`, `<Replaced by: Decision M>`, `<See also: METHODOLOGY/06-decisions-adr.md>`
- **Evidence:** `<link to file:line, commit, or external source>`
- **Date:** as a sidecar to `Status`, not as a replacement

---

## Statuses

| Status | Meaning | Allowed transitions |
|---|---|---|
| `proposed` | Authored; awaiting team/owner review. | → `accepted`, → `superseded` |
| `accepted` | In effect. This is the current truth. | → `superseded`, → `deprecated` |
| `superseded` | Replaced by a newer ADR. Do not modify the body. | (terminal) |
| `deprecated` | No longer recommended, but not yet replaced by a different choice. | → `superseded` |

Status transitions are themselves decisions. **Do not silently edit `Status: accepted` → `Status: superseded`.** Publish a new ADR that references the old one with `Replaces: Decision N`.

---

## Cross-reference rules

1. **Two-way links are mandatory.** If ADR-A `Replaces` ADR-B, then ADR-B gets `Replaced by` pointing at ADR-A. Both edits land in the same commit.
2. **Numbering is per-file.** ADRs are numbered by their position in `decisions.md` (`Decision 1`, `Decision 2`, ...). When a file is restructured, numbers do not have to be stable — but a `Cross-reference:` block must update.
3. **Length cap: ≤200 lines per ADR.** Longer ADRs signal that the decision is compound — split it into two ADRs.

---

## How this maps to `.project-state/<mission-slug>/`

Per the 8-artifact sprint pattern (`02-doc-lifecycle.md` §"Mission artifacts"), `decisions.md` is one of the eight required files. Its lifecycle:

| Sprint phase | `decisions.md` action |
|---|---|
| `planning` | Empty (file may not exist yet) |
| `in-progress` | ADRs accumulate as decisions are made mid-mission |
| `review` | Final pass: are there orphan `proposed` entries that should be `accepted` or `superseded`? |
| `done` | All ADRs have terminal status (`accepted`, `superseded`, or `deprecated`); new mission may `Reference:` them |
| `abandoned` | Status migration applied: each in-flight ADR marked `superseded — mission abandoned on YYYY-MM-DD` |

ADR numbering does NOT carry across missions. Each new `.project-state/<slug>/` starts fresh from `Decision 1`. Cross-mission references go through `final-report.md` or through permanent governance documents like `methodology/`.

---

## Worked example (fictional, demonstrates shape)

```markdown
## Decision 3 — Use vitest for unit tests, not mocha

**Context:** This mission adds the first end-to-end test file. Existing tests in `core/__tests__/` use vitest. We need to decide whether to add the new test file in vitest (consistent with existing infrastructure) or add a different test runner (e.g., mocha, for stylistic reasons).

**Decision:** Use vitest. One test runner per project.

**Rationale:** Single Authority principle: two test runners means two sources of truth for "test passes". Vitest is already imported in `package.json:devDependencies`. The cost of installing mocha is zero capability benefit.

**Alternatives considered:**
- *mocha*: cleaner asynchronous test API, but inconsistent with existing 5 test files.
- *node:test (built-in)*: zero dependency, but no watch-mode UI and no native coverage provider.

**Status:** accepted
```

A reviewer can grep for `## Decision 3 — Use vitest` in `.project-state/` and immediately land here. They know the context (why was this decided), the decision (what was chosen), the rationale (why this and not alternatives), and the cross-references (which other ADRs to read first). Five sections, no more, no less — unless a clearly-justified optional add-on applies.

---

## Common pitfalls

- **Adding a "Discussion" section.** Discussion belongs in `execution-log.md`, not in ADRs. ADRs are the conclusion, not the transcript.
- **Reordering the five sections.** Decision-context-rationale-alternatives-status is one order. Reordering it (e.g., "Status first") breaks grepability.
- **Silent status edits.** Changing `Status: proposed` to `Status: accepted` without publishing a new ADR loses the audit trail. Either commit the change with an `Evidence:` block citing the approval event, or publish a new ADR.
- **Embedding code in the Rationale.** ADRs explain WHY, not WHAT. If the decision needs code, the code goes in the artifact (test, command, doc), and the ADR cites it by path.
- **Adding a "Risks" section.** Risks belong in `blockers.md` or in `final-report.md`. ADRs record choices; risks are inputs to choice, not output.

---

## Related

- `methodology/01-six-principles.md` — Evidence-Based principle requires reasons before changes; ADRs are the structured form of those reasons.
- `methodology/02-doc-lifecycle.md` — state transitions of EXISTING documents; ADRs cross-reference 02 but live separately (different concern: shape vs state).
- `methodology/04-agent-bootstrap.md` — bootstrap tier that may include this file (or `decisions.md` reference).
- `.project-state/<mission-slug>/decisions.md` — the file this shape applies to.
