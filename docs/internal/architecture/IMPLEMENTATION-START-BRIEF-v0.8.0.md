# OperatorOS v0.8.0 — Implementation Start Brief

> **One page. Hand-off from Architecture to Engineering.**
> **Date:** 2026-07-15. **Status:** Ready. Implementation starts now.

---

## TL;DR — two sentences

The architecture is frozen; the implementation plan is amended and ready; the readiness audit returned 84 / 100 with a GO. Implementation can start immediately by following the §8.3 one-page checklist in `IMPLEMENTATION-PLAN-v0.8.0.md`. **Three things only** — read in this order, then start ticking.

---

## 1. Read these three documents, in order

| # | Document | What it gives you | Time |
|---|----------|-------------------|------|
| 1 | `IMPLEMENTATION-PLAN-v0.8.0.md` §8.3 (the one-page checklist) | The 36 ticks you'll spend the next 5 weeks doing | 5 min |
| 2 | `ARCHITECTURE-ARTIFACT-INDEX-v0.8.0.md` | A map of the eight frozen artifacts and when to consult each | 5 min |
| 3 | `IMPLEMENTATION-PLAN-v0.8.0.md` §5 (the five milestones) | The weekly rhythm and what each milestone produces | 10 min |

Total reading: ~20 minutes. After that, you have everything you need.

---

## 2. The contract you operate within

- You are inside freeze §8.1 (May-do-without-ADR) and §8.2 (Must-do-with-procedure).
- The ships-set is 9 modules + 1 Core capability (Core `inspect`). **10 ships total.** See `ARCHITECTURE-FREEZE-v0.8.0.md` §5.1.
- Modules ship as **shell scripts** in `bin/<cmd>.sh`; `module.yaml:commands[].run` references them. (B1 amendment; see plan §4.5a.)
- The Local-First test `__tests__/local-first.test.ts` must remain green at every commit. Network code in Core is forbidden.
- Validation: a real engineer (not the proposer) runs each capability and files a `state/v080-validate/<capability>.md` report. Per framework §1.4 Phase 3. **10 validation tickets** total.

---

## 3. The five-week rhythm

| Week | Streams | Milestone | What you produce |
|------|---------|-----------|------------------|
| 1 | A + B + F | **M1** | Core `inspect` + 3 Tier-0 read-out modules + `module-cookbook` |
| 2 | C | **M2** | `bootstrap-md` + `identity-md` + `schemas/identity.schema.json` |
| 3 | D | **M3** | `drift-detector` (with 6 per-principle `principles/*.sh`) + `mission-runner` |
| 4 | E | **M4** | `bootstrap-tier-refresh` (mv + backup-rollback scheme) |
| 5 | G | **M5** | README §"Try it" rewrite + CONTRIBUTING `§How to propose a capability` + `methodology/07-capability-selection.md` + CHANGELOG entry + smoke test + release |

Two engineering pairs complete in 5 weeks. Single pair: 7 weeks with `module-cookbook` deferred to v0.8.1.

---

## 4. What you do NOT do

- Open a discovery document titled "X — design" or "X — research". Discovery is over. The architecture is frozen.
- Touch the freeze, the framework, the canonical-questions list, or the ships-set. Changes to any of these require an ADR per freeze §8.4.
- Add a new module not in the §5.1 ships-set (10 ships) without an ADR. Discoveries during implementation that surface a new module go to the Kanban, not the code.
- Implement a Network call in Core. `__tests__/local-first.test.ts` fails the build if you do.
- Implement a 11th Core command. Core's command surface is 14 (after `inspect`) — no more in v0.8.0.

---

## 5. The implementation entry command

After you read the three documents above, the entry point is:

```bash
cd /home/taras/projects/operatoros
# 1. Open the plan's checklist and tick the PRE-WORK items (1 tick: amendments applied).
# 2. Open the mission directory:
mkdir -p .project-state/operatoros-v080-implementation
# 3. Standard 8-artifact mission starts. From this point, run the streams per week.
```

Identity verification (`git-identity-preflight`) is required before any commit. Push is held until release mission.

---

## 6. If you have a question

| Type of question | Where it goes |
|------------------|---------------|
| *"How do I structure the per-principle scripts?"* | Implementation judgment. Use plan §4.8 + methodology/01. No document needed. |
| *"What does `bootstrap-tier-refresh` actually do at the file level?"* | Plan §4.9 (with B3 amendment). |
| *"Where can I find the run-time contract for modules?"* | Plan §4.5a. |
| *"Should I add a new module I just thought of?"* | Kanban defer; do not implement. |
| *"Does this principle-check need a new test?"* | Use the per-principle files in I4; add to the test ledger. |
| *"I think the architecture has a bug"* | Open an ADR. Do not "fix" the bug in a feature commit. |
| *"The freeze contradicts what I need to do"* | STOP. Open an ADR. The freeze says §8.3 — ADR-only path for that. |

---

## 7. Where the post-work goes

After M5:

- **Audit mission** (.project-state/operatoros-v080-audit/) verifies the implementation against the freeze. CRITICAL/HIGH/MEDIUM/LOW findings. Read the readiness audit's `audit-report.md` for the audit-mission pattern.
- **Release mission** (.project-state/operatoros-v080-release/) produces the release report and pushes the v0.8.0 tag (gated on owner instruction per CLAUDE.md).
- **v0.8.1 patch missions** pick up any post-release fixes.
- **v0.9.0 planning** opens after v0.8.0 ships. Future-version work is gated on the deferral table in the closing report.

---

## 8. Final sentence

Read the three documents. Run the checklist. Tick the boxes. File the validation tickets. Implement. If everything in this hand-off is followed, v0.8.0 ships in five weeks (two-pair team) or seven weeks (single pair). The architecture is done. The work is execution.
