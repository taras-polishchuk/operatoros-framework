# OperatorOS Module Model — Taxonomy Clarification

> **Mission slug:** `operatoros-v080-module-model-clarification-2026-07-15`
> **Reviewer:** Hermes
> **Date:** 2026-07-15
> **Status:** Analysis only. No code change. No schema change. No CLI change. No CLI flag added. No file movement.
> **Inputs read:** `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md`; `core/src/cli.ts`; `core/src/embedded-assets.ts`; `core/src/commands/{init,add,apply,run}.ts`; `core/src/lib/workspace.ts`; `schemas/{module,preset,catalog}.schema.json`; `README.md`; `CHANGELOG.md` (especially v0.6.3 Decision 9); `methodology/01-six-principles.md`.
> **Constraints held:** no redesign, prefer reducing concepts over adding them, optimize for clarity + long-term coherence (not feature count).

---

## TL;DR

**Recommendation: One module model, not two.** The v0.8.0 design document used "module" ambiguously because two different things needed names:

1. **Things OperatorOS ships inside the binary** (presets, schemas) — these are NOT modules today, and should not become modules. They are Core assets.
2. **Things installed via `operatoros add <path>`** — these are the only things that are modules. There is one and only one definition.

**Core is NOT a "type of module." Core is the runtime that *runs* modules.** Categorizing Core as `Internal Modules` would conflate the platform with its extensions, re-introduce the conceptual mess that v0.6.3's Decision 9 ("ship no bundled example modules") and v0.5.2-alpha's Local-First invariant test (`__tests__/local-first.test.ts`) spent three releases cleaning up. Six of the seven v0.8.0 candidates are correctly classified as User Modules with no movement. One candidate (`bootstrap-md`) needs a small boundary clarification, but not a relabel.

A new **section naming rule** plus three **schema taxonomy clarifications** are sufficient — no new concept is introduced.

The four v0.8.0 categories (Core platform capability, Internal OperatorOS module, User-facing module, Showcase/example module) reduce to **two**: Core capability and User Module. The "Internal" and "Showcase" sub-categories are *taxonomic* (where the source code lives), not *contractual* (different schema, different lifecycle). One concept, two source locations, one schema — same module all the way down.

---

## 1. What a module is — the canonical definition

A module in OperatorOS is:

> **A schema-validatable, lifecycle-discoverable, agent-readable, named extension that lives outside the Core binary, is installed via `operatoros add <source>`, and is invoked through `operatoros run <module> <command>`.** Its contract is `schemas/module.schema.json`. Its identity is its `name`. Its lifecycle is: install → run → (optionally remove). Its surface is: a `module.yaml` + zero or more supporting files + zero or more subcommands.

Five properties this definition pins down, each falsifiable:

| Property | Test | Schema enforcement |
|----------|------|--------------------|
| **Schema-validatable** | `operatoros validate module.yaml` passes | `schemas/module.schema.json` (required: `version`, `name`; `additionalProperties: false`) |
| **Lifecycle-discoverable** | `operatoros list-modules` (future) finds it | `modules/` directory under workspace root; `WORKSPACE_LAYOUT` in `core/src/lib/workspace.ts` |
| **Agent-readable** | A cold-starting agent can describe what each module does by reading `module.yaml` and `README.md` | implicit in YAML structure; not currently schema-enforced, observable in audit |
| **Named** | exactly one canonical name; one directory under `modules/` | schema pattern `^[a-z0-9][a-z0-9_-]*$` |
| **Outside the binary** | not embedded in `__embeddedAssets`; loaded at install-time | `core/src/embedded-assets.ts` ships `__embeddedPresets` and `__embeddedSchemas` only; `__embeddedExamples = {}` by Decision 9 |

**The fifth property is the load-bearing one.** Modules are *external* by constitutional rule. Three independent decisions cemented this:

1. **v0.5.0-alpha** removed the four aspirational registry entries (`vault`, `git-automation`, `tmux-sessions`, `ai-context`) that pointed to non-existent GitHub repos.
2. **v0.6.3 (Decision 9)** removed the bundled `examples/journal/` and `examples/timer/` modules and set `__embeddedExamples = {}`. The `personal` preset now ships `modules: []`. CHANGELOG line: *"reverses a v0.5.1-alpha decision that made the preset install journal+timer for 'free working state' — that boost is removed permanently."*
3. **`methodology/01-six-principles.md`, Single Authority**, says: *"A document defines a concept in exactly one place. References are by path, never by copy."* Bundling modules into the binary makes them live in two places (`embedded-assets.ts` + `examples/`), violating the rule.

**Therefore: anything in the Core binary that can also be a module is a violation of OperatorOS's own constitution.** This is why the v0.8.0 candidates like `drift-detector`, `bootstrap-md`, etc. must live as **external, installable modules** — not as features of the binary — even though they are written and maintained by the OperatorOS authors.

---

## 2. One concept, not two — the recommended taxonomy

The brief proposed "Core/Internal Modules vs User/Marketplace Modules" as a possible split. **Reject this split.** It would create four problems:

1. **Conflation with the constitution.** Single Authority + Local-First both presume: the binary is canonical for what *it* does; userspaces are canonical for what *they* do. A new "Internal Module" type would mean Core's modules would be both `embedded-assets` AND discoverable on disk — two canonical locations.

2. **Lifecycle confusion.** Core ships on a SemVer cadence with the CLI (every release). Modules might ship on their own cadence. A "Core Module" would have to invent a separate version contract, independent from Core's SemVer. That's an unnecessary concept.

3. **Marketing asymmetry.** "Core/Internal modules" suggests "modules the OperatorOS team maintains." User Modules then implies "modules the community maintains." OperatorOS is *explicitly* BDFL-managed (per `GOVERNANCE.md`) with no marketplace and no registry (per Decision 9, v0.6.3). There is no community, no marketplace, no second tier — there is only the user's own `operatoros add`.

4. **Anti-pattern revival.** v0.4.0-alpha shipped "registry/modules.json with 5 seeded entries." v0.5.0-alpha removed them as "aspirational." v0.6.3 explicitly closed the door on Marketplace/registry populate. Recreating that distinction now is exactly the scope-creep that prior teams (well — Taras, monothically) worked to remove.

### The actual taxonomy

There is **one module model**, with **three sub-categories that are NOT types** (a module is either internal-source or user-source, but the schema and lifecycle are identical):

| Sub-category | Where source lives | Where on disk | Example v0.8.0 candidate |
|--------------|--------------------|---------------|---------------------------|
| **Reference module** | Inside the OperatorOS framework repo, under a future `modules/` directory at the repo root | Installed via `operatoros add ./modules/<name>` into the user's workspace | `drift-detector`, `mission-runner`, `principles-card` |
| **Showcase / example module** | Inside the framework repo, under `examples/` | Same lifecycle; user copies/fork-uses them | `module-cookbook`, `agreement-demo`, `philosophy-quotes` |
| **User module** | Anywhere else (own repo, local fork, etc.) | Same lifecycle | Anything authored by the user |

**Critical clarification:** "Reference" and "Showcase" are *provenance descriptors* (where the source happens to live), not *contractual categories*. They do not appear in `module.schema.json`. They do not change the install/run/remove lifecycle. They do not have separate versioning. They are documentation roles, like the design document's six role taxonomy (Reference / Showcase / Workspace / AI / Reporting / Quality) — descriptive, not enforced.

A user can fork a Reference module and turn it into a User module in one commit (change `homepage` field, change repo remote). A Reference module can `require` a User module. There is no schema difference. There is no install path difference. There is no permission check.

### What about Core platform capabilities?

The four v0.8.0 categories in the brief include "Core platform capability." This is the correct classification for things that ARE part of the Core binary — `init`, `validate`, `add`, `apply`, `run`, `export`, `version`, `index`, `doctor`, `stats`, `stale`, `prune`. These are **commands**, not modules. They live in `core/src/commands/<name>.ts`. They are part of Core. They can never be turned into a module because the binary IS what runs them.

**A Core command and a module are different beasts.** Conflating them was the original ambiguity in the v0.8.0 design. The clean rule:

- If changing it requires changing `core/src/**` AND shipping a new binary — it's a **Core command**, not a module.
- If changing it requires only editing the module's directory AND (optionally) re-running `operatoros add` — it's a **module**.

This is the falsifiable boundary test. It maps onto SemVer correctly: Core commands bump Core's version; modules bump the module's own version. Anything in between fails one of the two tests and is misclassified.

---

## 3. Classification of every v0.8.0 candidate

The 20 candidates from the prior design document, now classified against the canonical definition. **Six of seven ships-v0.8.0 are correctly classified as modules.** One (`bootstrap-md`) needs clarification but no movement. Six of the 13 deferred-by-design candidates are also correctly classified as modules. One (E-series) is documentation only.

### 3.1 The v0.8.0 ships-set (7 modules)

| # | Module (from prior design) | Canonical category | Source-location sub-category | Verdict |
|---|---------------------------|--------------------|------------------------------|---------|
| 1 | `bootstrap-md` | **Module** | Reference (lives in framework repo) | **CORRECTLY CLASSIFIED, but with a boundary caveat.** See §5.1. |
| 2 | `identity-md` | **Module** | Reference | Correctly classified. |
| 3 | `catalog-validator` | **Module** | Reference | Correctly classified. |
| 4 | `schema-bridge` | **Module** | Reference | Correctly classified. |
| 5 | `mission-runner` | **Module** | Reference | Correctly classified. |
| 6 | `drift-detector` | **Module** | Reference | Correctly classified. |
| 7 | `module-cookbook` | **Module** | Showcase (lives under `examples/`) | Correctly classified. |

### 3.2 The 13 deferred-by-design candidates

| # | Module | Canonical category | Verdict |
|---|--------|--------------------|---------|
| D-1 | `bootstrap-tier-refresh` | Module | Correctly classified. |
| D-2 | `agent-onboarding-interview` | Module | Correctly classified. |
| D-3 | `conditional-tier-hints` | Module | Correctly classified. |
| D-4 | `preset-applier` | Module | Correctly classified. |
| D-5 | `workspace-snapshot` | Module | Correctly classified. |
| D-6 | `catalog-timeline` | Module | Correctly classified. |
| D-7 | `preset-card` | Module | Correctly classified. |
| D-8 | `agreement-demo` | Module (Showcase) | Correctly classified. |
| D-9 | `principles-gate` | Module | Correctly classified. |
| D-10 | `philosophy-quotes` | Module (Showcase) | Correctly classified. |
| D-11 | `principles-card` | Module (Reference) | Correctly classified. |

### 3.3 The 13 rejected-permanently (anti-modules)

These were never intended as modules. They are documented anti-patterns and remain documentation-only. They are not modules in any sense and are not classified below.

```
E-1  dotfile manager              E-8   telemetry / usage tracking
E-2  package/shell manager        E-9   markdown editor / static-site generator
E-3  deployment / infra           E-10  task / project manager
E-4  configuration manager        E-11  "module marketplace"
E-5  vault / secrets manager      E-12  module signing
E-6  AI agent runner              E-13  terminal / multiplexer
E-7  cloud sync engine
```

### 3.4 Summary — 7 ships, 0 misclassified; 13 deferred, 0 misclassified; 13 rejected, 0 to reclassify

**No module needs to be moved into Core.** The classification stands. The "module model" is one concept; what the design call was missing is *terminology precision* (which §4 fixes) and *boundary precision* for one edge case (which §5 fixes).

---

## 4. What the v0.8.0 design needed — terminology precision

The ambiguity in the prior design was a wording problem, not an architecture problem. The fix is a one-paragraph clarification in §1 of the design, plus one small documentation change to `CONTRIBUTING.md`. **No new concept is introduced.**

### 4.1 The clarification paragraph (proposed addition to MODULE-ECOSYSTEM-DESIGN-v0.8.0.md §1)

> **Single-module rule.** Throughout this document, the word "module" refers to one and only one thing: an external, schema-validatable extension installed via `operatoros add <source>` and invoked via `operatoros run <module> <command>`. The Core CLI is not a module. The catalog is not a module. Presets are not modules. Schemas are not modules. Modules may be Reference Modules (maintained alongside OperatorOS) or Showcase Modules (in `examples/`) or User Modules (anything else), but these are *provenance labels*, not *contractual categories* — same schema, same lifecycle, same install path. If something you want to ship changes with the binary, it is a Core capability, not a module.

### 4.2 The companion paragraph in CONTRIBUTING.md

> **Two things ship with OperatorOS. Modules do not.** OperatorOS ships a CLI (`core/`), four JSON Schemas (`schemas/`), one preset (`presets-canonical/personal/`), and six methodology documents (`methodology/`). It does **not** ship modules. Modules live in their own repos or locally; you install them with `operatoros add <source>`. This is by design: bundling modules into Core would violate the Single Authority and Local-First principles. See `MODULE-MODEL-CLARIFICATION-v0.8.0.md` for the canonical definition.

### 4.3 The schema taxonomy clarification

The current `schemas/module.schema.json` is already correct. It pins down `version`, `name`, `description`, `author`, `license`, `homepage`, `tags`, `commands`, `requires`, `settings`. None of these enforce "is this a Reference module" or "is this a Showcase module" — and that's *correct*. The schema does not need a `category` field; provenance is metadata, not contract.

If metadata is desired for documentation purposes (e.g., the OperatorOS website listing Reference modules separately), it belongs in a **separate `modules-catalog.schema.json`** for displaying, not in the module schema. The module schema stays minimal. (See §6 for the "ambition tax" note.)

---

## 5. Boundary clarifications — three tests for the grey-zone candidates

Three v0.8.0 candidates live near the module/Core boundary. Each needs a precise test, not a relocation.

### 5.1 `bootstrap-md` — most load-bearing of the candidates

**The confusion.** `bootstrap.md` is generated by `operatoros init` *today* (in `core/src/commands/init.ts:renderBootstrap()`). It's already part of Core's behavior. Does turning it into a module mean: Core stops generating it, and the module replaces that generation? Or does the module *wrap* the existing generation with a typed, refactorable interface?

**The answer.** Module wraps the existing generation. `operatoros init` continues to emit a *default* `bootstrap.md` as a fallback. The `bootstrap-md` module, when installed, becomes the canonical source for that file — its `render` command is what `init` calls, and its `regenerate` command is what `bootstrap-tier-refresh` calls. The module *replaces* the hard-coded `renderBootstrap()` in `init.ts`. This means:

- `operatoros init --target foo` with `bootstrap-md` installed → calls module, gets full-quality output.
- `operatoros init --target foo` without `bootstrap-md` → calls the in-binary fallback (current behavior, never removed, defensive).

**Why this is right.** Single Authority still holds: `bootstrap.md`'s canonical source is one place (either the module, or the in-binary fallback if the module isn't installed — never both at once). Everything Replaceable still holds: removing `bootstrap-md` doesn't break `init`. Local-First still holds: no network call. The module reuses the binary's existing capability rather than duplicating it.

**What needs to change in the design.** The design needs a sub-section in §2.3 (Workspace Modules) explicitly stating: *"The bootstrap-md module replaces, rather than duplicates, the in-binary default generator in `core/src/commands/init.ts:renderBootstrap()`. The default stays; the module supersedes it when present."* Without this clause, a future contributor might re-implement `renderBootstrap()` separately inside the module, violating Single Authority.

### 5.2 `catalog-validator` and `schema-bridge` — Quality Modules that read Core

**The confusion.** These modules validate Core-emitted artifacts (catalog, schemas). They might be misread as "Core commands that just happen to live outside Core." Are they not just `doctor` and `stats` with more output?

**The answer.** No, they are different. `doctor` and `stats` produce *operational output* (current health, current counts). `catalog-validator` and `schema-bridge` produce *invariant-checking output* (does the catalog conform to durable invariants, do the schemas conform to version-pinned contracts). The principle difference:

- `doctor` answers: *"what's the state right now?"*
- `catalog-validator` answers: *"does this state satisfy the durability invariants?"*

The first is observability (Core's job). The second is *falsifiability of the schema's own claims* (modules' job). The user-facing CLI command name is different, the output schema is different, the failure modes are different. They compose: `doctor` reports a status; `catalog-validator` validates the report.

**Boundary test for any similar candidate going forward.** A candidate is "Core observability" if its output is consumed by humans for status-checking. It is "Module" if its output is consumed *by another module or by CI* for invariant-checking. The test is the consumer, not the producer.

### 5.3 `mission-runner` — touches `.project-state/` (mission directory)

**The confusion.** `.project-state/<slug>/` is the canonical location for mission artifacts. The methodology documents are owned by `methodology/06-decisions-adr.md`. Does `mission-runner` cross the boundary?

**The answer.** No, because `mission-runner` *generates* scaffolding files (the eight standard artifacts), it does not *own* the methodology. The methodology is canonical; `mission-runner` is a renderer for it. This is the same relationship that `bootstrap-md` has to `methodology/04-agent-bootstrap.md`. The pattern is: methodology documents are constitutional truth; modules are renderers/interviewers/validators for those truths. Modules never edit methodology docs.

**Boundary test.** A candidate "touches methodology" if:
- It writes to `methodology/<N>-*.md` — **forbidden**, methodology is canonical.
- It only reads methodology as a source for rendering scaffolding — **allowed**, this is its job.

`mission-runner` reads `methodology/06-decisions-adr.md` to know what the 8-artifact shape is. It does not write to it. Same rule as `bootstrap-md` reads `methodology/04-agent-bootstrap.md` to know the 5-section shape, without writing to it.

### 5.4 What this means for the v0.8.0 design

The seven ships-v0.8.0 modules are correctly classified. The three tests above (`bootstrap-md` wraps-doesn't-replace, Quality Modules are validators-not-observers, mission-runner renders-not-edits) are *design notes*, not *module relocations*. They go into the implementation sprint as guardrails; they don't change the module taxonomy.

---

## 6. Concepts removed from the brief's four-category proposal

The brief listed four candidate categories:

- Core platform capability
- Internal OperatorOS module
- User-facing module
- Showcase/example module

### 6.1 What survives

Two of the four:

| Survives as a category | Reason |
|------------------------|--------|
| **Core platform capability** | A real distinction. The CLI commands (`init`, `validate`, `add`, `apply`, `run`, `export`, `version`, `index`, `doctor`, `stats`, `stale`, `prune`) are Core. They live in `core/src/commands/`. They ship with the binary. They are NOT modules. |
| **Module** (one category, three provenance labels) | A real distinction. Anything `operatoros add`-installable is one thing: a module. Provenance (Reference vs Showcase vs User) is metadata, not a category. |

### 6.2 What's removed and why

| Removed category | Reason for removal |
|------------------|---------------------|
| **Internal OperatorOS module** | Conflates the platform with its extensions. Recreates the v0.4.0 marketplace concept that v0.5.0 removed. Violates Single Authority (binary AND module would each "own" the same capability). Violates Local-First (an "internal module" tempts the team to bundle it, which `local-first.test.ts` already forbids at the source-code level for *any* new network primitive — bundling is the same instinct at the asset level). |
| **Showcase/example module** (as a separate category) | Lives at `examples/`, follows identical schema, identical install lifecycle. The "showcase" quality is a *content* property (over-documented, commented) not a *contract* property. Promoting "showcase" to a category would force a `category: showcase` field in `module.schema.json` — a field with zero schema-validatable semantics, since "showcase" is a judgement call. |

### 6.3 The resulting taxonomy is

| Concept | Location | Schema | Lifecycle | Shipped where |
|---------|----------|--------|-----------|---------------|
| **Core command** | `core/src/commands/<name>.ts` | None at file level; the CLI flags are documented in `cli.ts` | Tracks Core SemVer | Inside the binary |
| **Core asset** (preset, schema) | `presets-canonical/`, `schemas/` | Self-describing (preset's schema is `preset.schema.json`); `additionalProperties: false` enforced | Tracks Core SemVer | Embedded in binary (`__embeddedPresets`, `__embeddedSchemas`) |
| **Module** | `modules/<name>/` (in workspace) after install; source lives *anywhere* (`examples/`, own repo, fork) | `module.schema.json` (`additionalProperties: false`) | Module's own SemVer; install via `operatoros add` | Disk only — `__embeddedExamples = {}` by Decision 9 |

Three concepts. No more. Each one is already in the code today; the documentation just hadn't named them with this precision.

---

## 7. Migration recommendations

Three small documentation patches — zero code changes — implement this clarification.

### 7.1 Patch 1 — MODULE-ECOSYSTEM-DESIGN-v0.8.0.md §1

Add the "Single-module rule" paragraph (text given in §4.1 above). 8 lines. ~150 words.

### 7.2 Patch 2 — CONTRIBUTING.md §"How to add a module"

Replace the current opening with: **"Two things ship with OperatorOS. Modules do not."** (text given in §4.2 above). Replaces the intro to "How to add a module" without removing any technical content.

### 7.3 Patch 3 — methodology/01-six-principles.md, Principle 4 (Composable)

Add one sentence after the existing explanation: *"Modules may be Reference Modules (maintained alongside the framework) or User Modules (anywhere else). The distinction is provenance, not contract — same schema, same lifecycle, same install path."* ~30 words.

### 7.4 What is NOT a migration

The migration does **not**:

- Modify `core/src/**` — no new command, no new flag, no refactor.
- Modify `schemas/module.schema.json` — no new field. (A schema change would be a SemVer minor for downstream user modules; the cost is unjustified by the benefit.)
- Modify `operatoros add` semantics — it still installs a module whether from `./examples/cookbook` or from a local fork. No change in behavior.
- Move the v0.8.0 ships-set to a new directory today — Reference modules land in `modules/<name>/` in the framework repo *when an implementation sprint ships them*, which is post-design-approval. The design only specifies the *destination*, not the *time*. (See the prior design's §7 build order.)
- Create `modules-catalog.schema.json` — if a metadata schema is needed in v0.9.0+, it's a separate decision. Not blocking.

### 7.5 What if future use pressure proves the one-model rule wrong?

The classification is durable, but the test for "one vs two models" is itself falsifiable. **Future pressure test:** if the OperatorOS authors ever want to ship a helper Python script that requires no install (just a `pip install`-style adjunct), they will be tempted to invent a "second kind of module." At that moment, the right question is: "is this a Core capability or a module?" — not "should we add an Internal Modules category?" A new kind of installable unit is a separate product (different schema, different commands, different version), and would warrant its own ADR with a different naming convention. The one-model rule today doesn't preclude that future; it just keeps the scope clean now.

---

## 8. Mapping back to the core promise

The core promise — *"OperatorOS keeps engineer and AI in agreement about a workspace"* — gains from this clarification, doesn't lose.

| Question this clarification answers | Effect on engineer/AI agreement |
|-------------------------------------|-----------------------------------|
| What IS a module? | Both can answer with one sentence. **Stronger** agreement. |
| What is Core vs. module? | Engineer knows what will/won't change with Core SemVer. Agent knows the same. **Stronger** agreement. |
| Is `bootstrap-md` a Core feature or a module? | Both know it's a Reference module that wraps Core's default. The boundary is unambiguous. **Stronger** agreement. |
| Does a Reference module differ from a User module at install time? | No. The install path is identical; the provenance label is metadata. **Stronger** agreement (no class-of-module surprise). |
| What category is `module-cookbook`? | A Reference/Showcase-flavored module — same install, same schema. **Stronger** agreement. |

Net: the taxonomy clarification *adds* to the core promise, doesn't subtract.

---

## 9. Why this is not implementation

This document:

- Adds no file in `core/`.
- Changes no schema.
- Adds no CLI command, flag, or subcommand.
- Adds no field to `module.schema.json`.
- Does not commit changes.
- Does not push.
- Does not modify `.project-state/` of any other sprint.
- Does not move any existing files in the repo.

The three proposed documentation patches in §7 are part of the *next* mission (the implementation sprint, if approved). They are not applied here.

---

## 10. Summary — the simplest long-term model

**One concept, three provenance labels, two real categories.**

OperatorOS has:

- **Core capabilities** — the 13 CLI commands. Live in `core/src/`. Shipped inside the binary. Track Core SemVer.
- **Core assets** — presets and schemas. Live in `presets-canonical/` and `schemas/`. Embedded in the binary. Track Core SemVer.
- **Modules** — installable extensions. Live wherever the source author puts them; installed under `modules/<name>/` in the workspace. Run via `operatoros run <module> <cmd>`. Track their own SemVer per `module.schema.json`. Reference, Showcase, User are provenance labels, not categories.

That's the whole model. The 7 modules shipping in v0.8.0 follow it. The 13 deferred modules follow it. The 13 rejected anti-modules document why OperatorOS *isn't* a dotfile manager, package manager, etc. — which is itself a positioning message.

A first-time engineer reading `CONTRIBUTING.md` will now see exactly three noun-phrases used consistently: **Core**, **preset/schemas**, **modules**. They will not encounter "Internal Module" anywhere in the docs. They will not be confused about whether `bootstrap-md` is a Core feature. They will see one schema, `module.schema.json`, with `additionalProperties: false` — meaning "everything a module can be is here, by name."

That's the **simplest long-term model**. One concept where the v0.8.0 design had two. Two source locations where the brief proposed four. Zero additions to the schema. Zero new CLI surface. Zero redesign of OperatorOS. Just terminology precision — the rare win where talking less accurately is the move.

---

*End of module model clarification. No code, schema, or CLI changes performed in this session. Apply mission (if approved) follows the three §7 patches above.*
