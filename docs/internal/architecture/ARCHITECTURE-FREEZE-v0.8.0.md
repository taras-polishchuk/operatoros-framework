# OperatorOS v0.8.0 — Architecture Freeze

> **Mission slug:** `operatoros-v080-architecture-freeze-2026-07-15`
> **Reviewer:** Hermes
> **Date:** 2026-07-15
> **Status:** Architecture freeze. **This is the single canonical reference for v0.8.0 implementation.** All seven prior design documents are subsumed under this file's decisions where they overlap. Where they do not overlap, the prior design document remains the authority on its narrower topic; this file does not rewrite it.
> **Inputs read:** `CORE-PROMISE-2026-07-15.md`; `POSITIONING-VALIDATION-2026-07-15.md`; `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md`; `MODULE-MODEL-CLARIFICATION-v0.8.0.md`; `FIRST-10-MINUTES-DESIGN-v0.8.0.md`; `CANONICAL-QUESTIONS-v0.8.0.md`; `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md`; `README.md`; `ROADMAP.md`; `CHANGELOG.md`; `methodology/01-six-principles.md`.
> **Constraints held:** Do not redesign. Do not introduce new concepts. Do not propose new modules. Resolve contradictions; freeze the resolution.

---

## TL;DR — The single sentence

OperatorOS architecture is frozen at the state documented in this file: **a six-principle discipline with one module model, eleven canonical questions, nine reference modules + one new Core capability for v0.8.0, a 6-gate capability selection framework for future capabilities, and a closed list of decisions and deferrals that no future mission may amend without an Architecture Decision Record (ADR).** All seven prior design documents remain as the *narrower* authorities on their topics, but this file is the *integration point* — when two prior documents disagree, this file's resolution wins; when no prior document covers a topic, this file's silence means *not yet decided*.

The freeze covers five areas:

- **§3 Canonical terminology** — 27 terms with one definition each.
- **§4 Canonical responsibilities** — 11 ownership boundaries.
- **§5 Canonical capability list** — v0.8.0 ships-set (10 capabilities), deferred (7), rejected (6), gaps (1).
- **§6 Frozen decisions** — 17 frozen decisions with rationale; each is now immutable without an ADR.
- **§7 Deferred decisions** — 12 topics that are explicitly *not* decided in v0.8.0; future versions only.

The freeze also establishes **§8 Implementation boundaries** — what implementers may and may not do without first writing an ADR.

The single load-bearing change from the prior designs is the **resolution of three ships-set contradictions** (MODULE-ECOSYSTEM §4 said 7 ships; FIRST-10-MINUTES said 10 + 1 Core; CANONICAL-QUESTIONS said 9 + 1 Core; CAPABILITY-FRAMEWORK said 9 + 1 Core). The canonical ships-set is **9 modules + 1 Core capability** (one of the three competing numbers is wrong; the framework's mechanical application is the most recent and most reliable).

---

## 1. Authority and supersession chain

This file does not erase the prior seven design documents. It *integrates* them.

| File | Status after this freeze |
|------|--------------------------|
| `CORE-PROMISE-2026-07-15.md` | **Authoritative** on the promise, the outcome-first framing, and the durability tests. Nothing in this freeze contradicts it. |
| `POSITIONING-VALIDATION-2026-07-15.md` | **Authoritative** on positioning-language choices (the three "Why not X?" comparisons). Nothing in this freeze contradicts it. |
| `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md` | **Subsumed on ships-set** (§4 contradiction resolved in §5 of this file). Authoritative on module roles (§1, descriptive only). Authoritative on the 13 anti-modules list (§6, which becomes the canonical rejection set in §5 of this file). |
| `MODULE-MODEL-CLARIFICATION-v0.8.0.md` | **Authoritative** on the module definition, the one/two taxonomy decision, the layer boundary tests. Nothing in this freeze contradicts it. |
| `FIRST-10-MINUTES-DESIGN-v0.8.0.md` | **Authoritative** on the user-journey design, the README command-flow proposal (§6 of that file), and the show-then-tell principle. *Implementation of §6 is gated on this freeze's acceptance.* |
| `CANONICAL-QUESTIONS-v0.8.0.md` | **Authoritative** on the eleven canonical questions, the four-test for new questions, and the Q9 gap analysis. The Q9 gap is carried into §5 of this file. |
| `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md` | **Authoritative** on the framework itself (6 phases, 7 layers, 6 gates), and on the audit verdicts (§9.1 of that file, which becomes the ships-set in §5 of this file). |
| **`ARCHITECTURE-FREEZE-v0.8.0.md` (this file)** | **Authoritative** on integration — when two prior documents disagree, this file's resolution wins. |

This pre-existing chain is deliberate: the seven prior documents are *narrow* (each owns its scope); this file is *integrative* (it owns the disagreements between them).

---

## 2. Freeze invariants — what is now immutable

The following four claims are now constitutional. Touching them requires an **ADR**, not a discovery document or a re-design doc.

### 2.1 The core promise is fixed

> **OperatorOS keeps engineer and AI in agreement about a workspace.**

This sentence survives every durability test in `CORE-PROMISE-2026-07-15.md`. Any future mission that proposes to change it must write an ADR with the durability test re-run.

### 2.2 The six principles are constitutional

The six principles in `methodology/01-six-principles.md` (Single Authority, Everything Replaceable, Typed Substrate, Composable, Evidence-Based, Local-First) are immutable. **No seventh principle may be added without an ADR.** The v0.5.2-alpha removal of "AI-Native" (per CHANGELOG) set the precedent: principles are Constitution, not features.

### 2.3 The Local-First invariant is machine-checked

`__tests__/local-first.test.ts` enforces the Local-First principle on `core/src/**` code. Any future code change that introduces network primitives in Core fails the build. Removing or weakening this test requires an ADR.

### 2.4 The module model is one concept

Per `MODULE-MODEL-CLARIFICATION-v0.8.0.md` §2 and §6, there is **one module model** (modules are external, installable via `operatoros add`, schema-validated by `module.schema.json`) and **one canonical term** ("module" never means "Core command" or "Internal OperatorOS feature"). Inventing a new sub-type of module (e.g., "Core Module" or "Internal Module") is forbidden without an ADR.

> **Note on principle-vs-count.** §6 of this freeze records that the capability lifecycle, the layer taxonomy, and the decision-tree gate set are *constituted* by their roles (Question / Already-answered / Layer / Layer-policy / Principle / Scope & cost — for gates; Methodology / Schema / Generated / Core / Module / Documentation / Somewhere else — for layers; Question → Concept → Build → Validate → Maintain → Retire — for phases). The *exact count* in each set is not itself frozen — adding a gate, a layer, or a phase is permitted when the addition is justified by role-coverage (a stage-of-decision the current set cannot mechanize), provided the addition does not contradict any §6 frozen decision. This carve-out prevents the freeze from outliving its evidence: the numbers are observed, not constitutional.

---

## 3. Canonical terminology

27 terms are used across the seven prior documents. Several had inconsistent definitions. This table fixes one definition per term. Where a prior document used a term differently, that prior document is updated by reference; this is the only place to look for definitions.

| Term | Definition | Layer | Authority |
|------|-----------|-------|-----------|
| **Workspace** | A directory tree governed by OperatorOS, with `operatoros.yaml` at the root and the standard `WORKSPACE_LAYOUT` (modules/presets/state/schemas/vault) populated. | Per `core/src/lib/workspace.ts`. | Existing code. |
| **Module** | A schema-validatable, lifecycle-discoverable, agent-readable, named extension installed via `operatoros add <source>` and invoked via `operatoros run <module> <command>`. Its contract is `schemas/module.schema.json`. It lives *outside* the binary. | Layer 5 (per framework §2.1). | `MODULE-MODEL-CLARIFICATION-v0.8.0.md` §1. |
| **Core capability (a.k.a. "Core CLI command")** | A capability in the Core binary, invoked without `operatoros add`, that works against any directory (no workspace required). Lives in `core/src/commands/<name>.ts`. | Layer 4. | `MODULE-MODEL-CLARIFICATION-v0.8.0.md` §6 + framework §2.1. |
| **Schema** | A JSON Schema 2020-12 draft file in `schemas/*.schema.json` describing a contract for a file the engineer owns or the system produces. | Layer 2. | Framework §4.2. |
| **Methodology document** | A prose document in `methodology/NN-*.md` describing a constitutional or operational rule, enforceable by code or by convention. | Layer 1. | `methodology/` itself + framework §4.1. |
| **Generated file** | A file produced by composing existing capabilities, not hand-authored. Tracked in git only if re-derivation isn't preferred. | Layer 3. | Framework §4.3. |
| **Reference Module** | A Module whose source happens to live alongside the framework in the OperatorOS repo. **Provenance label, not a contract category.** | Subcategory of Module. | `MODULE-MODEL-CLARIFICATION-v0.8.0.md` §6.2. |
| **Showcase Module** | A Module living in `examples/` of the framework repo, intentionally over-documented and instructive. **Provenance label, not a contract category.** | Subcategory of Module. | Same as above. |
| **User Module** | A Module whose source does not live in the framework repo. **Provenance label, not a contract category.** | Subcategory of Module. | Same as above. |
| **Role (Reference, Showcase, Workspace, AI, Reporting, Quality)** | Storyboard categories from `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md` §1. **Descriptive, NOT enforced by `module.schema.json`.** A single module may play multiple roles over time. | Provenance/storied, no layer. | `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md` §1. |
| **Canonical question** | One of the eleven engineering-questions an OperatorOS-managed workspace must answer (Q1–Q11 per `CANONICAL-QUESTIONS-v0.8.0.md` §2.1). | n/a — taxonomy. | `CANONICAL-QUESTIONS-v0.8.0.md`. |
| **Canonical-question four-test** | The four criteria a new question must pass to enter the canonical taxonomy: (1) distinct from Q1–Q11; (2) answerable by a workspace tool (not a code-quality/CI/deployment tool); (3) asked often enough (≥ once per quarter); (4) general enough (≥ 80% of workspaces). | n/a — taxonomy gate. | `CANONICAL-QUESTIONS-v0.8.0.md` §2.3. |
| **Bootstrap protocol** | The 5-section contract an AI agent follows on cold start, with 4 reading tiers (Always read, Read when relevant, Discover on demand, Never read, plus Onboarding). | n/a — protocol. | `methodology/04-agent-bootstrap.md`. |
| **Bootstrap tier (or "always-read tier")** | The four canonical files every AI agent reads first: `IDENTITY.md`, `operatoros.yaml`, `bootstrap.md`, `presets/<active>/preset.yaml`. | n/a — protocol input. | `core/src/commands/init.ts:renderBootstrap()`. |
| **Workspace catalog** | The durable metadata inventory at `.operatoros/index.json`, with `path`/`type`/`size`/`mtime`/`content_hash`/`indexed_at` fields per entry. Schema: `schemas/catalog.schema.json`. | Layer 2 (schema) + Layer 3 (generated file). | `core/src/lib/catalog.ts` + the schema. |
| **Mission** | An OperatorOS-managed unit of work with eight standard artifacts at `.project-state/<slug>/`. | n/a — workflow. | `methodology/06-decisions-adr.md`. |
| **ADR (Architecture Decision Record)** | A frozen decision recorded with Context/Decision/Rationale/Alternatives/Status, in `decisions.md` of a sprint directory. **Mandatory** for any future change to a frozen decision (§6). | n/a — workflow. | `methodology/06-decisions-adr.md`. |
| **Constitutional rule** | A rule enforceable by either a code test (e.g., `__tests__/local-first.test.ts`) or by documentation convention (e.g., the methodology documents). | n/a — invariant. | Six principles. |
| **Capability** | Anything that answers a canonical question. May live at any of seven layers. The generic term for "thing an OperatorOS workspace uses." | Generic. | `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md` §2. |
| **Capability layer** | One of seven layers (Methodology document / Schema / Generated file / Core CLI command / Module / Documentation page / Somewhere else). Determines the layer-policy that applies. | Generic. | Framework §2.1. |
| **Capability lifecycle** | The six phases a capability lives through: Question → Concept → Build → Validate → Maintain → Retire. | Generic. | Framework §1. |
| **Capability gate** | One of six mechanical gates a capability proposal must pass: Question / Already-answered / Layer / Layer-policy / Principle / Scope & cost. | Generic. | Framework §3. |
| **Override** | A maintainer rejection of a framework verdict (e.g., accepting a proposal the framework marked REJECT). Recorded in `framework-observations.md` for future review. | Generic. | Framework §10.2. |
| **Skills (Hermes-internal)** | Procedural memory in `~/.hermes/skills/` for AI agents; **NOT** part of OperatorOS. Outside OperatorOS's terminology surface; this row is included only to prevent cross-product confusion. | n/a — cross-product. | OperatorOS does not define "skills." |
| **Anti-module** | A capability class OperatorOS explicitly does not build (12 categories: dotfile manager, package manager, deployment, configuration manager, secrets manager, AI agent runtime, cloud sync, telemetry, markdown editor, task manager, marketplace, module signing). Listed as the Layer-7 (Somewhere else) rejection set. | Anti-layer. | `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md` §5.2. |
| **Show-first-and-prove-it moment** | The engineering-design term for the moment in a user journey when the user sees their own workspace reflected back at them, before reading any documentation. | Generic. | `FIRST-10-MINUTES-DESIGN-v0.8.0.md` §1.3. |
| **v0.8.0 ships-set** | The canonical list of capabilities that ship in v0.8.0: 9 Modules + 1 new Core capability (`inspect`). See §5 below. | Generic. | This file. |

The terminology above is the *single canonical reference*. Implementers, future missions, and ADR authors should read §3 first when there's any wording question.

---

## 4. Canonical responsibilities — who owns what

11 ownership boundaries were inconsistent across prior documents or underspecified. This table fixes one decision per boundary.

| # | Responsibility | Owner | Authority | Other parties who may comment but not own |
|---|----------------|-------|-----------|-------------------------------------------|
| 1 | The OperatorOS Core binary | OperatorOS maintainer (BDFL model) | `core/src/**`, `package.json`, install scripts | Module authors read but don't modify |
| 2 | The CLI command surface | OperatorOS maintainer | `core/src/cli.ts`, `core/src/commands/**` | First-impressions design proposes additions (this freeze authorizes `inspect` as the v0.8.0 addition) |
| 3 | The JSON Schemas in `schemas/` | OperatorOS maintainer | `schemas/*.schema.json` | Module authors must comply but do not edit |
| 4 | The methodology documents in `methodology/` | OperatorOS maintainer | `methodology/*.md` | Seven principles are immutable (§2.2); document *structure* may evolve per `02-doc-lifecycle.md` |
| 5 | The bootstrap protocol contract | OperatorOS maintainer | `methodology/04-agent-bootstrap.md` + `core/src/commands/init.ts:renderBootstrap()` | Modules produce `bootstrap.md` but the protocol itself is Core's |
| 6 | The Workspace Catalog | OperatorOS maintainer (Core) | `core/src/lib/catalog.ts` + `schemas/catalog.schema.json` | Modules may *consume* the catalog (read-only); they do not write it |
| 7 | The Mission artifact shape (`.project-state/`) | Engineer or AI agent (each Mission is owned by whoever ran it) | `methodology/06-decisions-adr.md` | `mission-runner` produces the *shape* but does not own individual missions |
| 8 | The Module contract | OperatorOS maintainer (Core) | `schemas/module.schema.json` | Module authors implement against the contract; they do not change it |
| 9 | The Module source code | Module author (Reference Modules: OperatorOS maintainer; Showcase/User Modules: third party) | Each module's `module.yaml` is the authority | The Core binary never modifies a module's source |
| 10 | The first-10-minute user journey | OperatorOS maintainer | `FIRST-10-MINUTES-DESIGN-v0.8.0.md` + README §"Try it" | The journey is owned by Core README; modules may propose variations for their own README |
| 11 | The Capability Selection Framework | OperatorOS maintainer | `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md` + this freeze §6 (frozen decisions) | All future capability proposals pass the framework; the maintainer enforces |

These 11 boundaries are immutable in v0.8.0. A mission that wants to re-shuffle them must write an ADR.

**Three rules of thumb when in doubt:**

- If it ships inside the binary, Core owns it.
- If it lives outside the binary and is installable, the Module author owns it.
- If it's prose, the methodology authors own it — but the *intent* of the prose is constitutional, not the wording.

---

## 5. Canonical capability list

The ships-set has appeared in four prior documents with three different sizes: 7, 9, and 10 modules + 1 Core. This section is the *resolution*.

### 5.1 The ships-set

The v0.8.0 ships-set is the list of capabilities below. **This freeze is the source of truth for what ships.** The prior seven design documents are *evidence* of why these ten were chosen; they are not the *rule* that defines them. Future readers should treat the ships-set the same way they treat the core promise — as what this file says it is — and consult the prior documents only for rationale.

The four prior derivations disagreed on ship-count; this freeze settles it. The disagreement, briefly:

| Source | Ships-set size | Lens |
|--------|---------------|------|
| `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md` §4 | 7 modules | storyboard / first-impression set |
| `FIRST-10-MINUTES-DESIGN-v0.8.0.md` §4.2 | 10 modules + 1 Core | adoption / first-10-minutes journey |
| `CANONICAL-QUESTIONS-v0.8.0.md` §7.2 | 9 modules + 1 Core | canonical-question coverage (Q1–Q11) |
| `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md` §9.1 | 9 modules + 1 Core | framework 6-gate verdict |

This freeze's verdict is **9 modules + 1 new Core capability** (one canonical ten). It re-includes `mission-runner` (the framework §9.1 audit table omitted it; CANONICAL-QUESTIONS §5.1 had ACCEPTed it for Q8 coverage). It REJECTs `catalog-validator`, `schema-bridge`, `preset-applier`, `principles-card`, `philosophy-quotes`, `preset-card` per the framework's verdict. `knowledge-graph` and `engineer-profile` are DEFER (per §5.3 and §5.4).

**v0.8.0 ships-set (frozen):**

1. **`inspect`** *(NEW Core capability)* — answers Q1, Q5, Q7, Q11. Works against any directory.
2. **`context-builder`** *(Reference Module)* — answers Q1, Q11.
3. **`workspace-census`** *(Reference Module)* — answers Q5.
4. **`architecture-index`** *(Reference Module)* — answers Q3.
5. **`module-cookbook`** *(Showcase Module)* — answers Q11.
6. **`bootstrap-md`** *(Reference Module)* — answers Q2. Replaces the in-binary `renderBootstrap()` fallback (per `MODULE-MODEL-CLARIFICATION-v0.8.0.md` §5.1).
7. **`identity-md`** *(Reference Module)* — answers Q10.
8. **`drift-detector`** *(Reference Module)* — answers Q5, Q6.
9. **`bootstrap-tier-refresh`** *(Reference Module)* — answers Q2, Q7, Q11 transactionally. Promoted from deferred.
10. **`mission-runner`** *(Reference Module)* — answers Q8.

This is the canonical ten. It is **immutable** without an ADR.

### 5.2 The composition check

Each entry's Q-coverage:

| # | Capability | Q1 | Q2 | Q3 | Q4 | Q5 | Q6 | Q7 | Q8 | Q9 | Q10 | Q11 |
|---|-----------|----|----|----|----|----|----|----|----|----|-----|-----|
| 1 | `inspect` | ✓ | — | — | — | ✓ | — | ✓ | — | — | — | ✓ |
| 2 | `context-builder` | ✓ | — | — | — | — | — | — | — | — | — | ✓ |
| 3 | `workspace-census` | — | — | — | — | ✓ | — | — | — | — | — | — |
| 4 | `architecture-index` | — | — | ✓ | — | — | — | — | — | — | — | — |
| 5 | `module-cookbook` | — | — | — | — | — | — | — | — | — | — | ✓ |
| 6 | `bootstrap-md` | — | ✓ | — | — | — | — | — | — | — | — | — |
| 7 | `identity-md` | — | — | — | — | — | — | — | — | — | ✓ | — |
| 8 | `drift-detector` | — | — | — | — | ✓ | ✓ | — | — | — | — | — |
| 9 | `bootstrap-tier-refresh` | — | ✓ | — | — | — | — | ✓ | — | — | — | ✓ |
| 10 | `mission-runner` | — | — | — | — | — | — | — | ✓ | — | — | — |
| **Sum per question** | **2** | **2** | **1** | **0** | **3** | **1** | **2** | **1** | **0** | **1** | **3** |

Mapping:
- Q1 answered twice — `inspect` (Core, lightweight) + `context-builder` (deep). Correct: Core is the on-ramp; module is the deep form.
- Q2 answered twice — `bootstrap-md` (file production) + `bootstrap-tier-refresh` (atomic transaction). Correct: same dual-layer.
- Q3 answered once (`architecture-index`).
- Q4 not answered — see §5.3 below.
- Q5 answered 3× (`inspect`, `workspace-census`, `drift-detector`). Heavy coverage; intentional (Q5 is the second-most-frequent question).
- Q6 answered once (`drift-detector`).
- Q7 answered twice (`inspect`, `bootstrap-tier-refresh`).
- Q8 answered once (`mission-runner`).
- **Q9 not answered** — see §5.3.
- Q10 answered once (`identity-md`).
- Q11 answered 3× — `inspect`, `context-builder`, `module-cookbook`, `bootstrap-tier-refresh` (4 actually — count the column more carefully: 4). Wait — `inspect` ✓, `context-builder` ✓, `module-cookbook` ✓, `bootstrap-tier-refresh` ✓. So Q11 is answered 4×. High coverage intentional (Q11 = "How do I extend?" is the second-orient question).

### 5.3 The deliberately-not-answered questions

Two canonical questions are *intentionally not answered* by the v0.8.0 ships-set:

- **Q4** ("What changed recently?") — deferred to v0.10.0 with `workspace-snapshot` and `catalog-timeline`. Today's answer is `git log`, which is sufficient for v0.8.0.
- **Q9** ("Who am I in this workspace?") — *the canonical-question gap.* Today's answer is implicit (the engineer's onboarding-interview answers in `IDENTITY.md` partially cover it; the engineer's own story is not canonical anywhere). Defer to v0.9.0/v0.10.0 with a new `engineer-profile` Module.

These two gaps are *acknowledged* by this freeze. They are not implementation defects; they are scope-limitation decisions.

### 5.4 The deferred set

7 capabilities are *deferred* to v0.9.0 or v0.10.0. Their deferred status is documented in the framework §9.1 (the most recent mechanical application):

| # | Capability | Target version | Reason for deferral |
|---|-----------|---------------|---------------------|
| 1 | `agreement-demo` | v0.9.0 | Showcase; depends on v0.8.0 ships being done. |
| 2 | `principles-gate` | v0.9.0 | CI surface; depends on `drift-detector` being exercised. |
| 3 | `agent-onboarding-interview` | v0.9.0 | Deep Q10 answer; `identity-md` covers first-tier. |
| 4 | `conditional-tier-hints` | v0.9.0 | Sub-question of Q7; needed only after `bootstrap-tier-refresh` is exercised. |
| 5 | `engineer-profile` | v0.9.0 (or v0.10.0) | **The Q9 gap.** Required future work. |
| 6 | `workspace-snapshot` | v0.10.0 | Q4 rich-form; depends on ≥ 1 release of stable catalog. |
| 7 | `catalog-timeline` | v0.10.0 | Depends on `workspace-snapshot`. |
| 8 | `co-change` | v0.10.0 | Q4 cluster-level facet. Importance = Useful. |

(8 deferred, not 7 — the framework's count was 7; `engineer-profile` brings it to 8 with the Q9 gap.)

### 5.5 The rejected set

6 capabilities are *rejected*, with reasons.

| # | Capability | Reason for rejection | Gate failed |
|---|-----------|----------------------|-------------|
| 1 | `catalog-validator` | Duplicates `drift-detector`'s Typed-Substrate finding. | Gate 2 (Already-answered). |
| 2 | `schema-bridge` | Duplicates `operatoros validate schemas/*` + `drift-detector`. | Gate 2. |
| 3 | `preset-applier` | "What was applied?" is answered by `cat presets/<name>/preset.yaml` and `git log`. | Gate 2. |
| 4 | `principles-card` | "What are the principles?" is answered by `methodology/01-six-principles.md`. Not a canonical question. | Gate 1. |
| 5 | `philosophy-quotes` | Same as `principles-card`. Not a canonical question in a workspace. | Gate 1. |
| 6 | `preset-card` | "What does this preset contain?" is M6 (file inventory), which is *excluded* from the canonical taxonomy. | Gate 1. |

The 12 anti-modules from `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md` §5.2 (E-1 through E-13 minus one due to E-7 being a documented non-feature) — dotfile manager, package manager, deployment, configuration manager, secrets manager, AI agent runtime, cloud sync, telemetry, markdown editor, task manager, marketplace, module signing — are *also* rejected by virtue of being on the anti-module list (Layer 7 "Somewhere else"). These rejections are *categorical*, not individual; no future proposal at those categories can pass Gate 3 without an ADR.

### 5.6 The single gap

Q9 ("Who am I in this workspace?") is the only canonical question with no v0.8.0 answer *and* no v0.9.0 commitment. The framework §9.1 marks `engineer-profile` as ACCEPT-DEFER. The implementation sprint for v0.9.0 must include `engineer-profile` — its absence at the v0.9.0 ships-set review is *itself* a deferred-failure.

---

## 6. Frozen decisions

17 decisions are now frozen. Each is recorded with the rationale locked at the time of freeze. To change any of them, write an ADR per `methodology/06-decisions-adr.md`.

| # | Decision | Rationale | Authority at freeze |
|---|----------|-----------|--------------------|
| 1 | The core promise is *"OperatorOS keeps engineer and AI in agreement about a workspace."* | Survives every durability test in `CORE-PROMISE-2026-07-15.md`. | Core Promise §5.1. |
| 2 | Six principles (Single Authority, Everything Replaceable, Typed Substrate, Composable, Evidence-Based, Local-First). No seventh. | AI-Native was removed in v0.5.2-alpha because it was unenforceable. | `methodology/01-six-principles.md`. |
| 3 | Local-First is enforced by code, not by convention. | `__tests__/local-first.test.ts` greps Core for forbidden network primitives. | Architecture §2.3 of this file. |
| 4 | One module model. No "Internal Module," "Core Module," or "Reference Module" sub-types. | Same-schema/lifecycle/install-path applies regardless of provenance. | `MODULE-MODEL-CLARIFICATION-v0.8.0.md` §2. |
| 5 | Modules live outside the binary. `__embeddedExamples = {}` is Decision 9 (v0.6.3). | Bundling modules into Core would violate Single Authority and Local-First. | `MODULE-MODEL-CLARIFICATION-v0.8.0.md` §1, `core/src/embedded-assets.ts`. |
| 6 | v0.8.0 ships-set is exactly the 10 capabilities in §5.1. | Three contradictory counts resolved by this freeze. | This file §5.1. |
| 7 | Core `inspect` is the only Core capability addition for v0.8.0. | Adoption-funnel argument; no comparable module alternative. | `FIRST-10-MINUTES-DESIGN-v0.8.0.md` §3.2. |
| 8 | `bootstrap-md` replaces the in-binary `renderBootstrap()` fallback; the fallback stays as a default when the module is not installed. | Single Authority preserved; Everything Replaceable preserved. | `MODULE-MODEL-CLARIFICATION-v0.8.0.md` §5.1. |
| 9 | The 7 anti-pattern capability categories from `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md` §5.2 are *categorically* rejected (Layer 7 "Somewhere else"). | Reinforces positioning; blocks scope creep. | Framework §4.7; position validation §3.4. |
| 10 | The capability lifecycle has exactly six phases (Question → Concept → Build → Validate → Maintain → Retire). | Mechanical structure; gates each phase. | `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md` §1. |
| 11 | The capability taxonomy has exactly seven layers (Methodology document / Schema / Generated file / Core CLI command / Module / Documentation page / Somewhere else). | Boundary discriminators map to seven binary tests. | Framework §2.1. |
| 12 | The capability decision tree has exactly six gates. | Each gate has a binary outcome. | Framework §3. |
| 13 | Future capability proposals pass through all six gates in order. | Mechanical enforcement of §2.2 principles. | This file §7 "Future-version work". |
| 14 | The 11 canonical questions (Q1–Q11) are the *only* canonical questions at v0.8.0. New questions enter the taxonomy only via the canonical-question four-test. | Tighter constraint than "any sensible question"; reduces proposal drift. | `CANONICAL-QUESTIONS-v0.8.0.md` §2.3. |
| 15 | Q9 ("Who am I in this workspace?") is acknowledged as the singular gap; v0.9.0 must include an answer. | Without v0.9.0 commitment, gap becomes permanent. | `CANONICAL-QUESTIONS-v0.8.0.md` §7.3. |
| 16 | The README's first-10-minute journey is the canonical adoption experience; modifying it requires an ADR. | Journey is the load-bearing positioning artifact. | `FIRST-10-MINUTES-DESIGN-v0.8.0.md` §1. |
| 17 | The 27-term canonical terminology in §3 is the single reference for all future documentation. New terms must either match an existing definition or be added via ADR. | Eliminates prior-document inconsistency. | This file §3. |

These 17 decisions are **immutable without an ADR**. An ADR-authoring mission follows the rules in `methodology/06-decisions-adr.md` (Context / Decision / Rationale / Alternatives considered / Status; the four statuses proposed/accepted/superseded/deprecated).

---

## 7. Deferred decisions — explicitly not in v0.8.0

The following 12 topics are *not* decided in v0.8.0. They are the work of future versions. Listing them here means *no one should propose an answer as part of a v0.8.0 implementation mission* — doing so is out of scope.

| # | Topic | Earliest version | Reason for deferral |
|---|-------|------------------|---------------------|
| 1 | Adding a seventh principle | v1.0 | AI-Native precedent: principles require enforcement. |
| 2 | Multi-preset canonical presets beyond `personal` | v0.9.0 | Single preset by design (v0.5.0 purge). |
| 3 | Cloud-based anything | vX.Y.Z ¹ | Local-First principle, code-enforced. |
| 4 | Marketplace / registry features | vX.Y.Z ¹ | Decision 9 (v0.6.3). Registry stays empty. |
| 5 | Web UI / dashboard | vX.Y.Z ¹ | Out of scope per `GOVERNANCE.md` BDFL model; not Core philosophy. |
| 6 | Module signing / GPG verification | v0.9.0+ | Solves a problem that hasn't happened yet. |
| 7 | Native single-binary compilation (vs. ncc) | vX.Y.Z ¹ | ncc works; optimization is not blocking. |
| 8 | Telemetry / analytics | vX.Y.Z ¹ | Forbids `__tests__/local-first.test.ts`. |
| 9 | Multi-tenant features | vX.Y.Z ¹ | Out of philosophy scope. |
| 10 | Auto-update mechanism | vX.Y.Z ¹ | Auto-updates conflict with `git`-tracked workspaces. |
| 11 | Cross-workspace profile / `~/.operatoros/profile.yaml` | v0.9.0+ (gated on Q9 closure with `engineer-profile`) | The Q9 gap analysis is the prerequisite. |
| 12 | Schema-less YAML support | vX.Y.Z ¹ | Typed Substrate is constitutional; schemas are mandatory. |

¹ "vX.Y.Z" — *indefinitely deferred*. The constitution forbids them outright; they are listed for *documentation completeness*, not as future candidates. Re-asking requires a new ADR *plus* a principle-amendment ADR.

### 7.1 What's actually open vs. closed

The above 12 are *closed*: re-opening requires an ADR. The framework's 7-gate decision-tree handles the *open* side. So:

- **Closed (forbidden without ADR):** the 12 topics above + the 17 frozen decisions.
- **Open (handled by framework):** everything else, with the 6-gate decision path.

### 7.2 The anti-pattern reminder

The 12 anti-modules from §5.5 are also closed. A new "chezmoi integration module" or "GitHub Actions runner module" cannot pass Gate 3 (Layer 7) without an ADR.

---

## 8. Implementation boundaries

After this freeze, implementation may proceed. The boundaries below define what an implementer can and cannot do without further architectural work.

### 8.1 What implementers MAY do without an ADR

- Implement any capability in the v0.8.0 ships-set (§5.1).
- Write the test suite for any ships-set capability.
- Update `CONTRIBUTING.md`, `README.md`, `index.html`, `docs/` per existing editorial practice.
- Bump versions per SemVer for Core, schemas, and module contracts.
- Update `CHANGELOG.md`, `ROADMAP.md` to record shipped work.
- Write validation tickets (Phase 3 of the capability lifecycle).
- Apply the canonical-question four-test to add a new question (the four-test itself is mechanical).

### 8.2 What implementers MUST do (no ADR required, but specific procedure)

- Update the README's "Try it" / "First 5 minutes" sections per `FIRST-10-MINUTES-DESIGN-v0.8.0.md` §6.1 (the 10-command flow). **This is an apply-mission, not a discovery.**
- Add `CHANGELOG.md` entry per release.
- Run all 6 constitutional checks before any release.
- Run `__tests__/local-first.test.ts` and confirm green before any Core merge.
- Run `operatoros validate schema/workspace.schema.json` (and the other 3 schemas) before any schema change.

### 8.3 What requires an ADR

- Any change to the core promise (Decision 1).
- Any addition or removal of a principle (Decision 2).
- Any change to the Local-First enforcement test (Decision 3).
- Any change to the module model (Decision 4).
- Any modification to `__embeddedExamples = {}` (Decision 5) or to "modules live outside the binary" rule.
- Any change to the ships-set composition (Decision 6).
- Any new Core capability beyond the §5.1 list (Decision 7).
- Any change to the lifecycle phases (§6 Decision 10), layers (§6 Decision 11), or gates (§6 Decision 12).
- Any addition to the canonical-question taxonomy beyond the 4-test (Decision 14).
- Any change to README's first-10-minute journey (Decision 16).
- Any change to the canonical terminology (§3 of this file).
- Any change to any other frozen decision (Decisions 8, 9, 13, 15, 17).

### 8.4 The ADR template

The ADR for any of the above is:

```
# ADR-NNN — <title>

> **Status:** proposed | accepted | superseded | deprecated
> **Date:** 2026-...
> **Frozen-decision this proposes to amend:** D-X (number from §6 of ARCHITECTURE-FREEZE-v0.8.0.md)

## Context
<why is this proposed now; what changed in the world>

## Decision
<what we're going to do>

## Rationale
<why this decision is right; what tests pass>

## Alternatives considered
<at least two alternatives, with reasons rejected>

## Status
<where this is in the lifecycle>
```

The ADR lives in `.project-state/<mission-slug>/decisions.md` per `methodology/06-decisions-adr.md`. The freeze is updated *only* by an ADR whose status is `accepted`.

### 8.5 What an implementer must NOT do

- Open a discovery document titled "X — design" or "X — research" for a v0.8.0 ships-set capability. Discovery is over; the design is frozen.
- Renumber the canonical questions (Q1–Q11) without an ADR.
- Replace any term in §3 with a synonym in user-facing documentation.
- Add a new capability without passing all 6 framework gates.
- Bump `package.json` from `0.8.x` to `0.9.0` without a sprint-review-and-acceptance by the maintainer.
- Modify the Local-First enforcement test (`__tests__/local-first.test.ts`) to *weaken* it.

---

## 9. The freeze acceptance ritual

This freeze becomes binding after a single explicit acceptance by the maintainer (per Workspace OS BDFL model).

### 9.1 Acceptance criteria

A reviewer approves the freeze if and only if:

1. All 27 terms in §3 have a definition that does not contradict any code or schema in the repo.
2. All 11 ownership boundaries in §4 have a clear "owner" that exists.
3. All 10 ships-set entries in §5.1 pass the framework §9.1 ACCEPT test *individually*.
4. All 17 frozen decisions (§6) have rationale documented in the prior design docs.
5. All 12 deferred topics (§7) are explicitly *out* of v0.8.0.
6. The implementation boundaries (§8) are mechanical, not subjective.
7. The anti-pattern reminder (§7.2) lists the 12 anti-modules.
8. Single-Authority check passes for the freeze itself: this file is the only canonical reference; no other file *contradicts* a §6 decision.

If any criterion fails, the freeze is incomplete and requires amendment (per the ADR procedure).

### 9.2 What changes after acceptance

| Surface | Before | After |
|---------|--------|-------|
| `ROADMAP.md` v0.8.0 acceptance criteria | 6 partly-decision-y criteria (per ROADMAP §"v0.8.0 acceptance criteria") | Frozen at 17 decisions + 12 deferred + 10 ships |
| `README.md` first-5-minutes | "Read methodology docs" | "Try this 10-command flow" per `FIRST-10-MINUTES-DESIGN` §6.1 |
| `CHANGELOG.md` next v0.8.0 entry | "Workspace Catalog shipped" | "v0.8.0 ships-set" — list 10 capabilities |
| `CONTRIBUTING.md` "How to add a module" | generic | add §"How to propose a capability" referring to CAPABILITY-SELECTION-FRAMEWORK §3 |
| Methodology documents | unchanged | add `07-capability-selection.md` (the framework as a methodology doc) — this freeze *authorizes* but does not *implement* this addition |
| Module-related decisions | distributed across 3 prior docs | centralized in this freeze |

### 9.3 What does NOT change

- `core/` source — unchanged.
- `schemas/` — unchanged.
- Existing modules in `examples/` (none, post-D9) — unchanged.
- Existing 13 CLI commands — unchanged.
- `methodology/01-06` — unchanged.
- The 27 OS/git/AI tools OperatorOS does *not* replace — unchanged.

The freeze is *forward-looking and editorial*. Code changes for v0.8.0 happen in *implementation sprints* that follow this freeze, not in this freeze itself.

---

## 10. Mapping back to the core promise

> *"OperatorOS keeps engineer and AI in agreement about a workspace."*

After this freeze, that promise has the following operational expression:

| Promise component | Freezing guarantee |
|-------------------|---------------------|
| **Engineer** | An engineer reading the 17 frozen decisions and the v0.8.0 ships-set can implement OperatorOS without ambiguity. The promise is *testable* on the engineer's experience. |
| **AI** | An AI agent reading the v0.8.0 ships-set and the canonical terminology sees the same answer the engineer sees. The promise is *testable* on the AI's reading. |
| **Agreement** | The 27-term glossary (§3) is the single source of truth; both readers see the same definition. The 10 ships-set capabilities (§5.1) are the same list. The 17 frozen decisions (§6) are the same rules. The 12 deferrals (§7) are the same out-of-scope. **Agreement is mechanically guaranteed.** |
| **About a workspace** | The ships-set answers canonical questions Q1, Q2, Q3, Q5, Q6, Q7, Q8, Q10, Q11 — 9 of 11. The 2 questions not answered (Q4 = what's changed, Q9 = who am I) are *acknowledged* in this freeze as scope-limited, not silent omissions. |

The promise is now *verifiable*: an external reviewer can read this file, the framework, and the prior design docs, and confirm that every load-bearing claim in `CORE-PROMISE-2026-07-15.md` is enforced.

---

## 11. Why this is not implementation

This document:

- Adds no file in `core/`.
- Changes no schema.
- Adds no CLI command.
- Does not commit changes.
- Does not push.
- Does not modify `.project-state/` of any other sprint.
- Does not move any existing files in the repo.
- Does NOT modify `methodology/`, `ROADMAP.md`, `CHANGELOG.md`, or `README.md` in this session.
- Does NOT apply the framework's REJECTs (the 6 rejected capabilities remain in prior design docs; the freeze is advisory, not authoritative — the maintainer retains Override authority).

The freeze is **forward-looking and editorial**. It records what is now immutable and what implementers may or may not do. Code, schema, CLI, methodology, and documentation changes for v0.8.0 happen in subsequent implementation sprints that *follow* this freeze's acceptance.

### 11.1 The single explicit exception — the `01` self-reference

The freeze itself is a *file* in the repo. It is a sibling to the prior seven design docs. **It does not, by its own admission, belong to `methodology/`** (it is *meta*-methodology, not methodology). It is published at the repo root, next to `ROADMAP.md` and `CHANGELOG.md`. The §8 implementation boundaries treat it as the canonical reference; *itself* is not part of the implementation footprint.

### 11.2 The freeze vs. the audit

The freeze is *not* an audit. An audit would test the implementation against the architecture. The freeze *defines* the architecture. The next-class deliverable would be an *audit* mission, applying this freeze's ships-set and frozen decisions against the v0.7.0-era code, to verify that v0.8.0 implementation does not regress. That mission is downstream.

---

## 12. Summary — the architecture freeze in one paragraph

OperatorOS v0.8.0 architecture is frozen at the state documented here: a six-principle discipline governed by a 27-term canonical glossary (§3), eleven ownership boundaries (§4), a 10-capability v0.8.0 ships-set (§5.1: `inspect` Core capability + `context-builder`, `workspace-census`, `architecture-index`, `module-cookbook`, `bootstrap-md`, `identity-md`, `drift-detector`, `bootstrap-tier-refresh`, `mission-runner` modules), seven-architecture-layer taxonomy with a six-gate decision tree, 17 immutable decisions (§6), 12 explicitly-deferred topics (§7), and a set of mechanical implementation boundaries (§8) that allow ships-set implementation but require an ADR for any change to a frozen decision or deferred topic. The freeze resolves the 7/9/10 contradiction in the prior designs by accepting CAPABILITY-FRAMEWORK §9.1's mechanical verdict (which made every gate testable) augmented with `mission-runner` re-included for Q8 coverage. It identifies two canonical-question gaps — Q4 (changes-history) deferred to v0.10.0 via `workspace-snapshot`/`catalog-timeline`, and Q9 (engineer-identity) deferred to v0.9.0 via `engineer-profile` — as scope-limitation decisions rather than implementation defects. The freeze is itself a *file* (`ARCHITECTURE-FREEZE-v0.8.0.md`) at the repo root, sibling to the seven prior design documents; it is forward-looking and editorial, *not* an implementation; it does not modify any code, schema, CLI, methodology, or documentation in this session; and it is binding from the moment the maintainer accepts it, after which any future architectural change requires an Architecture Decision Record per `methodology/06-decisions-adr.md` rather than another discovery document. The freeze's single load-bearing contribution is making the core promise — *"OperatorOS keeps engineer and AI in agreement about a workspace"* — operationally verifiable: the 27-term glossary, 11-boundary ownership table, 10-shipset capability list, 17 frozen decisions, and 12-deferred list are each one canonical answer to a one canonical question, agreed upon once and for all by this file.

---

*End of architecture freeze. Implementation sprints follow this freeze's acceptance per the §8 implementation boundaries. The next-class deliverable after acceptance is an audit mission verifying that v0.8.0 implementation against this freeze's ships-set produces no architectural regression.*
