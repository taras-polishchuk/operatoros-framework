# OperatorOS Module Ecosystem — v0.8.0 Design

> **Mission slug:** `operatoros-v080-module-ecosystem-design-2026-07-15`
> **Reviewer:** Hermes
> **Date:** 2026-07-15
> **Status:** Design only. No modules implemented. No CLI changes. No architecture changes.
> **Inputs read:** `CORE-PROMISE-2026-07-15.md`, `POSITIONING-VALIDATION-2026-07-15.md`, `README.md`, `ROADMAP.md`, `CHANGELOG.md`, `methodology/01-six-principles.md`, `CONTRIBUTING.md`, `schemas/module.schema.json`, `core/src/commands/{init,add,run,apply}.ts`, `core/src/lib/workspace.ts`.
> **Constraints held:** no implementation, no redesign of OperatorOS, no feature creep, optimize for positioning + long-term coherence (not feature count).

---

## TL;DR

OperatorOS is frozen as a *discipline* that keeps engineer and AI in agreement about a workspace. v0.8.0's job is to demonstrate that discipline in action. The ecosystem of **20 candidate modules** is structured by six roles — Reference, Showcase, Workspace, AI, Reporting, Quality — but only **7 of them ship in v0.8.0**, chosen because together they tell one coherent story:

> *"A workspace assembled from typed modules, validated against schemas, indexed in a catalog, that an AI agent reads to stay in agreement with the engineer who owns it."*

The other 13 candidates are deferred, either because they duplicate mature ecosystems (dotfile managers, package managers, deployment tools, configuration managers) or because they cost more to maintain than they demonstrate about OperatorOS. The deferred list is itself an artifact — it documents what OperatorOS deliberately does NOT do.

**The v0.8.0 module set, in order of story-telling priority:**

1. `bootstrap-md` — Workspace Module — produces the AI-readable entry-point an agent reads first.
2. `identity-md` — Workspace Module — produces the answer to "who owns this workspace".
3. `catalog-validator` — Quality Module — proves the catalog is conformant and the workspace is auditable.
4. `schema-bridge` — Quality Module — proves schemas are reachable, valid, and version-pinned.
5. `mission-runner` — Reference Module — proves the `8-artifact sprint pattern` works as a module (Evidence-Based principle embodied).
6. `drift-detector` — Reference Module — proves the catalog + stale-list can be operationalized for the user (drift → agreement).
7. `module-cookbook` — Showcase Module — proves a 5-minute "build your first module" path with worked examples.

That's it. Seven. Each module has a single job, each references the methodology docs that explain why it exists, and together they reduce the time-to-first-agreement from "read five docs" to "run one command, look at one output."

---

## 1. Module roles — what each role is for

The brief asked for six roles. They are NOT a type system — there is no schema tag called `role`. They are roles *in the story*, not in the runtime. A single module can play more than one role across time (e.g., today's `bootstrap-md` is a Workspace Module but its roadmap is to become the Reference for every similar pattern). The role taxonomy is the v0.8.0 *storyboard*, not a runtime contract.

### 1.1 Reference Modules — "this is what a well-shaped module looks like"

| | |
|---|---|
| **Purpose** | Demonstrate the module contract (`schemas/module.schema.json`) with code that an engineer can read end-to-end. The point is not what they DO — it is what they ARE. |
| **Target user** | An engineer who just ran `operatoros init`, opened `CONTRIBUTING.md`, and wants to see the contract obeyed before they write their own. |
| **Why it exists** | OperatorOS's strongest positioning claim is "the methodology is the product." Reference Modules prove that claim by being the most-correct modules the project ships — they are what `module.schema.json` was written to describe. |
| **How it supports positioning** | "Agreement" between engineer and AI starts with agreement on what a module IS. Reference Modules make that agreement visible. |

### 1.2 Showcase Modules — "look, this is what 5 minutes with OperatorOS does"

| | |
|---|---|
| **Purpose** | Exist purely to make the methodology visible to a first-time engineer. They are over-documented, commented, intentionally trivial. |
| **Target user** | A senior engineer in `git clone`-then-evaluate mode. They want to see *something* work in under five minutes before they read any docs. |
| **Why it exists** | Most engineers will not read six methodology docs before evaluating. Showcase Modules are the on-ramp — they turn "looks interesting" into "I tried it in five minutes and it works." |
| **How it supports positioning** | "Agreement" is a load-bearing claim. Showcase Modules prove it: a 5-minute experience where engineer and agent end up reading the same files. |

### 1.3 Workspace Modules — "the canonical operator-shaped files of an OperatorOS workspace"

| | |
|---|---|
| **Purpose** | Produce files that are *part of the workspace contract*, not auxiliary. The empty workspace from `operatoros init` becomes a usable workspace once these are added. |
| **Target user** | The engineer who is *building their own* OperatorOS-managed workspace and needs the canonical files generated/refreshed in a typed way. |
| **Why it exists** | `bootstrap.md` and `IDENTITY.md` are protocol-level — they must exist in every workspace, in a specific shape, generated by a module so the engineer doesn't hand-edit drift into them. |
| **How it supports positioning** | Without these, an agent has no consistent entry-point to the workspace. They are the channel through which "agreement" is *enacted*. |

### 1.4 AI Modules — "the parts of OperatorOS that an AI agent reads or invokes directly"

| | |
|---|---|
| **Purpose** | Produce or refresh inputs that an AI agent consumes: bootstrap-tier read order, conditional-tier hints, identity-tier facts. NOT AI agents themselves — OperatorOS does not run agents. |
| **Target user** | The engineer (and any AI agent that lands in the workspace) who needs a stable, refreshable, schema-validated source of onboarding facts. |
| **Why it exists** | AI Modules are not optional extras. They are the reason an agent can be productive in the workspace without the engineer re-onboarding it. |
| **How it supports positioning** | They are the *counter-evidence* to "OperatorOS is just an AI tool." An AI Module is a module. The agent is just a reader of what the module produced. |

### 1.5 Reporting Modules — "the workspace-state facts an engineer wants to see"

| | |
|---|---|
| **Purpose** | Produce structured, *durable*, schema-validated reports about the workspace state. They consume the catalog and other internal artifacts — they do not generate transient/telemetry data. |
| **Target user** | The engineer who needs to audit, share, or compare their workspace across time without losing facts. |
| **Why it exists** | OperatorOS's six principles reject ephemeral state (catalog schema enforces `additionalProperties: false`). Reporting Modules turn catalog data into human-legible, schema-validated JSON/Markdown reports — durable, no usage tracking. |
| **How it supports positioning** | They are the practical embodiment of the Local-First principle. Reports stay on disk. They are version-controlled. They outlive any session. |

### 1.6 Quality Modules — "the workspace-state checks that prevent drift"

| | |
|---|---|
| **Purpose** | Read-only validators of workspace invariants: schema conformance, catalog freshness, cross-reference integrity, principle compliance. They run, they print, they exit. They never delete anything without explicit `--confirm`. |
| **Target user** | The engineer (and any CI script) who wants to know whether the workspace still satisfies the six principles right now. |
| **Why it exists** | The constitution is enforceable in code only if you write the enforcer. Quality Modules are *how* operatoros's "principles are constitutional" claim becomes runnable. |
| **How it supports positioning** | They prove the methodology is not aspirational — every principle has at least one Quality Module that checks whether it is upheld. |

---

## 2. The twenty candidate modules

Each module below specifies: **Problem solved · Expected CLI · Generated artifacts · Dependencies · Implementation complexity · Demonstration value · Long-term maintenance cost**.

### 2.1 Reference Modules

#### R-1 — `drift-detector`

- **Problem solved.** Engineer doesn't know whether their workspace still satisfies the six principles. The catalog exists (`operatoros index`), but it has no opinion about whether the entries form a coherent, principled workspace.
- **Expected CLI.** `operatoros run drift-detector check [--format=json|md] [--strict]`. Subcommands: `check` (default; reads catalog and presets and emits a structured report), `diff <since-tag>` (compares two catalogs and reports principle drift), `gate` (exit-code-only — suitable for CI).
- **Generated artifacts.** `state/drift-reports/drift-<timestamp>.json`, optional `state/drift-reports/drift-<timestamp>.md`. Reports list: (a) Single-Authority violations (two files claim authority for same concept), (b) Everything-Replaceable violations (modules with undocumented dependencies), (c) Typed-Substrate violations (configs without schemas), (d) Composable violations (modules reaching into other modules' state), (e) Evidence-Based violations (orphan decisions), (f) Local-First violations (path-patterns matching forbidden network primitives in module command strings).
- **Dependencies.** Read-only against catalog, manifest, and module manifests. No shell-out, no network. Pulls in `catalog-validator`'s output if installed.
- **Implementation complexity.** Medium. ~400 lines of TypeScript for the six principle-checks. ~200 lines of tests. Largest cost is the principle rules — they need a precise, falsifiable definition per principle.
- **Demonstration value.** Very high. This *is* the methodology-as-code demo. A first-time engineer runs `drift-detector check` and sees, line by line, the six principles applied to their actual workspace.
- **Long-term maintenance cost.** Medium. New principle → new check (low cadence). The checks themselves should be stable for years.

#### R-2 — `principles-card`

- **Problem solved.** An engineer wants a printable, single-page summary of the six principles with one-line operational rules. The canonical version is in `methodology/01-six-principles.md`; a card is the working surface.
- **Expected CLI.** `operatoros run principles-card render [--format=md|html|terminal]`. No data input. Pure derivation from `methodology/01-six-principles.md` content.
- **Generated artifacts.** `state/cards/principles.md` (or html/terminal). One page; ~1K tokens of content. Idempotent re-renders.
- **Dependencies.** None. Pure file read + template.
- **Implementation complexity.** Trivial. ~80 lines. Pure template rendering.
- **Demonstration value.** Low–medium. Itself unremarkable, but it becomes the *carrier* for the methodology in any non-OperatorOS context (e.g., a team wiki, a card pinned at a desk).
- **Long-term maintenance cost.** Low. A new principle means a card template update — but the module never owns the source content; the canonical source remains the methodology doc.

#### R-3 — `mission-runner`

- **Problem solved.** The 8-artifact Sprint Pattern is documented in `methodology/06-decisions-adr.md` but is currently executed by hand. Engineer (or AI agent) ends up re-inventing the directory layout, the artifact list, and the decision-record shape each time.
- **Expected CLI.** `operatoros run mission-runner init <slug>` (creates `.project-state/<slug>/` with the eight standard artifacts as empty skeletons); `operatoros run mission-runner list` (lists open missions); `operatoros run mission-runner archive <slug>` (moves a finished mission to `archive/` and emits a final-report stub); `operatoros run mission-runner validate <slug>` (checks a finished mission has all eight artifacts + decisions.md following ADR shape).
- **Generated artifacts.** `.project-state/<slug>/{source-task,progress,decisions,blockers,artifacts,environment,execution-log,final-report}.md` (empty or stub). `state/missions/index.json` updated. `.project-state/archive/<date>-<slug>/` for archived missions.
- **Dependencies.** Read-only against `methodology/06-decisions-adr.md`. Read-write against `.project-state/`. No shell-out.
- **Implementation complexity.** Medium. ~300 lines for the eight file shapes + ADR validator. ~150 lines tests.
- **Demonstration value.** Very high. The Evidence-Based principle is hard to grasp in the abstract. A module that produces the canonical 8-artifact shape on demand makes the principle *runnable*, not aspirational.
- **Long-term maintenance cost.** Medium. If the methodology evolves the 8-artifact pattern, the module evolves with it. ~1 update per year is realistic.

### 2.2 Showcase Modules

#### S-1 — `module-cookbook`

- **Problem solved.** A first-time engineer reads `CONTRIBUTING.md`, sees the contract, and freezes. They want a fully-worked-out "hello world" module with commentary.
- **Expected CLI.** `operatoros run module-cookbook hello-world` (scaffolds a complete, runnable, schema-valid `hello-world/` module with heavily-commented `module.yaml`, three subcommands (`greet`, `greet-formal`, `greet-random`), a README that walks through the contract decision-by-decision). `operatoros run module-cookbook show <topic>` (prints educational snippets: `commands`, `settings`, `hooks`, `requires`, etc.).
- **Generated artifacts.** `examples/hello-world/{module.yaml,README.md,bin/greet.sh}` if invoked. Educational snippet files in `state/cookbook/` on demand.
- **Dependencies.** None. Pure file generator.
- **Implementation complexity.** Low–medium. ~250 lines. The cost is in the *commentary* — every line in the produced README has to teach.
- **Demonstration value.** Very high. The 5-minute "I tried OperatorOS" experience is the showcase's job. Without it, positioning fails at the first hop.
- **Long-term maintenance cost.** Low. The contract changes (line-shape, schema fields), not the cookbook's teaching content.

#### S-2 — `agreement-demo`

- **Problem solved.** A senior engineer reads the README and thinks: *"show me a workspace where engineer and AI genuinely agree."* The current artifacts (CLI commands, schemas, bootstrap file) are individually persuasive but they don't *demonstrate* the agreement claim.
- **Expected CLI.** `operatoros run agreement-demo walkthrough` — runs an interactive (or scripted) demo that: (a) creates a sample workspace, (b) creates three "reader identities" (engineer-as-human, fresh-AI-agent-1, fresh-AI-agent-2), (c) asks each what it sees, (d) prints a side-by-side comparison showing they all see the same files.
- **Generated artifacts.** `state/demos/agreement-walkthrough/<timestamp>/{engineer-view.md, agent-1-view.md, agent-2-view.md, comparison.md}`. The whole run is logged for replay.
- **Dependencies.** Read against the catalog. Read against `bootstrap.md`. No shell-out, no network.
- **Implementation complexity.** Medium. ~350 lines. The cost is in the comparison harness — making three "reads" genuinely equivalent.
- **Demonstration value.** Very high. This *is* "agreement" rendered visible. A demo video or screenshot of this output is the most likely path to a viral README hit.
- **Long-term maintenance cost.** Medium. The demo must evolve whenever the bootstrap protocol or the catalog schema changes — but changes are infrequent (yearly cadence).

#### S-3 — `philosophy-quotes`

- **Problem solved.** A user who reads the methodology wants shareable, low-context descriptions of each principle — for embedding in commit messages, slack posts, README badges, or onboarding packets.
- **Expected CLI.** `operatoros run philosophy-quotes get <principle>` (one-line + paragraph + one-paragraph-rationale); `operatoros run philosophy-quotes all` (full set, formatted).
- **Generated artifacts.** Plain stdout. Optional `--out <path>` flag writes to a JSON file.
- **Dependencies.** None.
- **Implementation complexity.** Trivial. ~100 lines, mostly data tables.
- **Demonstration value.** Low. Itself minor, but pairs well with `principles-card` as the "what to repeat" companion to the "what to print" surface.
- **Long-term maintenance cost.** Very low. The methodology content is the source; the module is a renderer.

### 2.3 Workspace Modules

#### W-1 — `bootstrap-md`

- **Problem solved.** `operatoros init` *generates* a default `bootstrap.md`, but the engineer has no in-workspace tool to *evolve* it. After three months of adding modules and changing presets, the bootstrap file is out of date. The engineer hand-edits and drifts.
- **Expected CLI.** `operatoros run bootstrap-md render [--interactive]` — reads the current state (`bootstrap.md` template, `identities.md`, `presets/<active>/preset.yaml`, `modules/*/module.yaml`), emits the current canonical `bootstrap.md`. `--interactive` walks the user through changes.
- **Generated artifacts.** `bootstrap.md` (overwritten), `state/bootstrap-md/history.jsonl` (append-only log of past versions with timestamps and short rationale).
- **Dependencies.** Read against the catalog, preset manifest, and modules. No shell-out.
- **Implementation complexity.** Medium. ~300 lines. The cost is in correct cross-references — the bootstrap file promises paths that the module must keep truthful.
- **Demonstration value.** Very high. This module *is* the AI-facing surface of OperatorOS. When this works, "agreement" is operational.
- **Long-term maintenance cost.** Medium. Evolves when the bootstrap protocol changes (rare) or when the workspace layout adds standard folders (rare).

#### W-2 — `identity-md`

- **Problem solved.** `IDENTITY.md` (the workspace owner's onboarding document) is currently hand-written and unprotected by a schema. Engineers can't query their own identity answers; agents can't validate them.
- **Expected CLI.** `operatoros run identity-md init` (creates default from `methodology/05-onboarding-interview.md`); `operatoros run identity-md interview` (interactive: walks through five onboarding questions); `operatoros run identity-md validate` (checks against the rules in §5 of the onboarding interview).
- **Generated artifacts.** `IDENTITY.md`, `state/identity-md/interview-history.jsonl` (interview answers with timestamps; **NOT** secrets — only what methodology/05 already asks).
- **Dependencies.** Read against `methodology/05-onboarding-interview.md`. Write against `IDENTITY.md` only.
- **Implementation complexity.** Low–medium. ~250 lines. The cost is in the *interview UX* — five prompts with good defaults.
- **Demonstration value.** High. Tying onboarding to a module proves the methodology is the product; the user gets a typed interview that any agent can re-run.
- **Long-term maintenance cost.** Low. The interview questions are the methodology's; the module is a renderer/interviewer.

#### W-3 — `preset-applier`

- **Problem solved.** `operatoros apply` already exists but is invisible. Engineers don't see what it did; agents can't audit its history.
- **Expected CLI.** `operatoros run preset-applier apply --preset <name>` (alternative UI for `operatoros apply`); `operatoros run preset-applier history` (lists all applies with timestamps + diffs).
- **Generated artifacts.** `state/preset-applier/<timestamp>.json` (apply event record: which preset, which modules added, hook outputs). Same payload as core's `apply` but with a typed ledger.
- **Dependencies.** Reads preset manifest, modules, hooks. No shell-out except module hooks.
- **Implementation complexity.** Low. ~200 lines. Most logic already lives in `core/src/commands/apply.ts`; this module wraps it with a recording layer.
- **Demonstration value.** Medium. Itself valuable as an evidence trail but not eye-catching. Pairs well with `mission-runner`.
- **Long-term maintenance cost.** Low. Once written, the schema for the apply-event record is the load-bearing part.

### 2.4 AI Modules

#### A-1 — `bootstrap-tier-refresh`

- **Problem solved.** When the workspace evolves (modules added, schema bumped, preset changed), the AI-agent reading tier (`bootstrap.md`, `IDENTITY.md`, `operatoros.yaml`, active preset) must be regenerated *consistently*. Today, each gets touched by hand or by separate command — drift between them is common.
- **Expected CLI.** `operatoros run bootstrap-tier-refresh` — regenerates the always-read tier as a single transaction (atomic write across the four files). `operatoros run bootstrap-tier-refresh diff` — shows what WOULD change without writing.
- **Generated artifacts.** `bootstrap.md`, `IDENTITY.md`, `operatoros.yaml` (active-preset reference), `presets/<active>/preset.yaml` (snapshotted). All four written atomically; partial writes rejected.
- **Dependencies.** Wraps `bootstrap-md` + `identity-md`. Read against catalog and modules.
- **Implementation complexity.** Medium. ~350 lines. Atomic-write discipline is the cost.
- **Demonstration value.** High. Demonstrates that "agreement" is a *transaction*, not a series of independent edits.
- **Long-term maintenance cost.** Medium. The always-read tier is allowed to evolve, but no faster than the underlying modules.

#### A-2 — `conditional-tier-hints`

- **Problem solved.** The bootstrap protocol has a "read when relevant" tier (per `methodology/04-agent-bootstrap.md`). Which files are in that tier is implicit. An agent has no machine-checkable list.
- **Expected CLI.** `operatoros run conditional-tier-hints list` (prints canonical tier membership); `operatoros run conditional-tier-hints validate` (checks workspace's `*.md` files against the canonical list — flags drift).
- **Generated artifacts.** `state/ai-tier/tiers.json` (durable tier list, schema-validated). Stdout on `list`.
- **Dependencies.** Read against `methodology/04-agent-bootstrap.md` and the workspace's `*.md` files (per catalog).
- **Implementation complexity.** Low. ~150 lines.
- **Demonstration value.** Medium. Useful for engineers writing agents that need to decide what to read.
- **Long-term maintenance cost.** Low. Only evolves when the bootstrap protocol's tier list evolves.

#### A-3 — `agent-onboarding-interview`

- **Problem solved.** The methodology specifies a 5-question onboarding interview (`methodology/05-onboarding-interview.md`) but executing it is currently a manual process. An engineer reading the methodology can also miss that they need to *answer* the questions.
- **Expected CLI.** `operatoros run agent-onboarding-interview run [--agent-id <id>]` — walks the five questions, reads/writes answers to `IDENTITY.md`'s interview section, marks `onboarding_complete: true` only when all five have non-trivial answers.
- **Generated artifacts.** Updates `IDENTITY.md`. Emits `state/identity-md/interview-history.jsonl` append.
- **Dependencies.** Wraps `identity-md`. Read against `methodology/05`.
- **Implementation complexity.** Low. ~180 lines.
- **Demonstration value.** High. Tying onboarding to a module is a concrete expression of the methodology-as-product claim.
- **Long-term maintenance cost.** Low.

### 2.5 Reporting Modules

#### P-1 — `workspace-snapshot`

- **Problem solved.** The engineer wants a single, shareable, signed-by-catalog JSON of the workspace state at a moment. Useful for "what was this workspace last month?," for sharing with another engineer, or for handing to a fresh machine.
- **Expected CLI.** `operatoros run workspace-snapshot capture [--out <path>] [--label <text>]`. Captures catalog hash, preset, modules, schemas versions, identity (no secrets) into a single signed file.
- **Generated artifacts.** `state/snapshots/<timestamp>-<label>.json` (catalog-derived, schema-validated). Optional `--out` for arbitrary path.
- **Dependencies.** Read against catalog, `bootstrap.md` (for provenance), `methodology/`. No write except the snapshot file.
- **Implementation complexity.** Medium. ~300 lines. Cost is in the snapshot schema (must be stable across versions).
- **Demonstration value.** High. Snapshots are a durable artifact of the Local-First principle. They also pair well with `mission-runner` for "before/after" comparisons.
- **Long-term maintenance cost.** Low–medium. Snapshot schema changes are disruptive; must be versioned.

#### P-2 — `catalog-timeline`

- **Problem solved.** The catalog is durable but flat. Engineer wants a timeline: "what changed in the workspace?" with no telemetry / no usage tracking.
- **Expected CLI.** `operatoros run catalog-timeline show [--since <iso>] [--until <iso>] [--path <glob>]` — reads git log + successive catalog hashes (if committed) and emits a timeline view of file content-changes.
- **Generated artifacts.** Stdout (table or JSON). Optional `state/timeline/<range>.md`.
- **Dependencies.** Git-only (read `git log`). No network.
- **Implementation complexity.** Medium. ~250 lines, mostly git plumbing.
- **Demonstration value.** Medium. Useful but not eye-catching.
- **Long-term maintenance cost.** Low. Git is the source of truth.

#### P-3 — `preset-card`

- **Problem solved.** A preset (`presets/<name>/preset.yaml`) is a YAML file. Engineers want a human-readable card per preset that lists each module, its purpose, and its lifecycle hooks — useful for peer review and onboarding.
- **Expected CLI.** `operatoros run preset-card render <preset-name>`. Emits a Markdown card with each module's name, version, hooks, and a one-line description.
- **Generated artifacts.** `state/cards/preset-<name>.md`. Idempotent.
- **Dependencies.** Read against preset manifest + module manifests. No shell-out.
- **Implementation complexity.** Low. ~150 lines.
- **Demonstration value.** Medium–high. Cards are concrete artifacts that "auditability" can be shown with.
- **Long-term maintenance cost.** Very low.

### 2.6 Quality Modules

#### Q-1 — `catalog-validator`

- **Problem solved.** The catalog schema (`schemas/catalog.schema.json`) enforces field shape. It does NOT enforce invariant-level rules: catalog must include every required file, no entry may be ephemeral, content-hash must match current content. Today's `operatoros index` is allowed to produce non-conformant catalogs if the schema is satisfied.
- **Expected CLI.** `operatoros run catalog-validator validate [--strict]` — reads catalog + filesystem, checks invariant rules (one of which is `additionalProperties: false` already in schema); `operatoros run catalog-validator repair [--dry-run]` — rebuilds the catalog from filesystem (delegating to `operatoros index`), writes only on `--no-dry-run`.
- **Generated artifacts.** `state/catalog-validator/<timestamp>.json` (validation report).
- **Dependencies.** Read against catalog, manifest. No network.
- **Implementation complexity.** Low–medium. ~200 lines. Most rules already exist; this module unifies them with a typed report.
- **Demonstration value.** High. The first run on a real workspace is always informative — finds content-hash mismatches, stale entries, or unplanned files.
- **Long-term maintenance cost.** Low.

#### Q-2 — `schema-bridge`

- **Problem solved.** Schemas live in `schemas/*.schema.json` (canonical), but workspaces may want to vendor them or check they are reachable. The current `validate` command works ad-hoc; there is no first-class "are all schemas present and matching the version I pinned?" check.
- **Expected CLI.** `operatoros run schema-bridge check [--schema-dir <path>]` — verifies all four core schemas are present, JSON-Schema 2020-12 valid, and version-stamped. `operatoros run schema-bridge vendor` — copies canonical schemas into the workspace's `schemas/` directory for offline use.
- **Generated artifacts.** `state/schema-bridge/report.json` (pass/fail per schema).
- **Dependencies.** Read against `schemas/`. No network. **No remote schema fetch** — Local-First principle preserved.
- **Implementation complexity.** Low. ~150 lines.
- **Demonstration value.** High. The first principle-violation this catches is impressive — schemas that drifted between OperatorOS versions.
- **Long-term maintenance cost.** Low.

#### Q-3 — `principles-gate`

- **Problem solved.** Engineers want a CI gate that fails the build if any of the six principles is violated in their workspace. `drift-detector` is the human-readable version; this is the CI-grade version (exit codes only, structured JSON on request).
- **Expected CLI.** `operatoros run principles-gate check [--principle <name>]` — runs each principle-check (delegates to `drift-detector`); exit code `1` on any violation.
- **Generated artifacts.** Stdout (summary); optional `state/gate/<timestamp>.json`.
- **Dependencies.** Wraps `drift-detector`. Read-only.
- **Implementation complexity.** Very low. ~80 lines. Mostly a thin CI adapter.
- **Demonstration value.** Medium. Useful, but the value lives in `drift-detector`; this module is its CI surface.
- **Long-term maintenance cost.** Low. If `drift-detector` evolves, this evolves with it.

---

## 3. Ranking — every candidate by four axes

Scoring is 1 (low) – 5 (high). Each axis is operational, not aspirational:

- **Product value** — *direct user benefit at steady state*.
- **Demonstration value** — *how well this module explains OperatorOS to a first-time engineer in 5 minutes*.
- **Engineering usefulness** — *how much this module helps a working engineer ship day-to-day*.
- **Implementation effort** — *senior-engineer-days, including tests and docs* (5 = highest effort, ~10 days).

Effort is plotted on **inverse** scale for the total column: lower-effort modules rank higher when other axes tie.

| # | Module | Role | Product | Demo | Engr-use | Effort | Total (sorted) |
|---|--------|------|---------|------|----------|--------|----------------|
| 1 | `drift-detector` | Reference | 5 | 5 | 5 | 4 | **20 − 4 = 16** |
| 2 | `catalog-validator` | Quality | 4 | 5 | 5 | 2 | **19 − 2 = 17** |
| 3 | `bootstrap-md` | Workspace | 5 | 5 | 5 | 3 | **18 − 3 = 15** |
| 4 | `schema-bridge` | Quality | 4 | 5 | 4 | 2 | **17 − 2 = 15** |
| 5 | `module-cookbook` | Showcase | 3 | 5 | 4 | 2 | **16 − 2 = 14** |
| 6 | `mission-runner` | Reference | 4 | 5 | 5 | 3 | **17 − 3 = 14** |
| 7 | `agreement-demo` | Showcase | 3 | 5 | 2 | 3 | **13 − 3 = 10** |
| 8 | `identity-md` | Workspace | 4 | 4 | 4 | 2 | **14 − 2 = 12** |
| 9 | `bootstrap-tier-refresh` | AI | 4 | 4 | 4 | 3 | **15 − 3 = 12** |
| 10 | `preset-applier` | Workspace | 3 | 3 | 5 | 2 | **13 − 2 = 11** |
| 11 | `agent-onboarding-interview` | AI | 4 | 4 | 3 | 2 | **13 − 2 = 11** |
| 12 | `workspace-snapshot` | Reporting | 4 | 3 | 5 | 3 | **15 − 3 = 12** |
| 13 | `preset-card` | Reporting | 3 | 3 | 4 | 1 | **11 − 1 = 10** |
| 14 | `principles-gate` | Quality | 4 | 3 | 5 | 1 | **13 − 1 = 12** |
| 15 | `conditional-tier-hints` | AI | 3 | 3 | 4 | 2 | **12 − 2 = 10** |
| 16 | `catalog-timeline` | Reporting | 3 | 2 | 4 | 3 | **11 − 3 = 8** |
| 17 | `philosophy-quotes` | Showcase | 2 | 2 | 3 | 1 | **8 − 1 = 7** |
| 18 | `preset-applier history` (sub of #10) | (same) | — | — | — | — | merged into #10 |
| 19 | `principles-card` | Reference | 2 | 2 | 3 | 1 | **8 − 1 = 7** |
| 20 | `principles-gate check` (sub of #14) | (same) | — | — | — | — | merged into #14 |

Reading the table — top three by composite are:

1. **`catalog-validator`** (17) — low cost, high user value, strong demo.
2. **`drift-detector`** (16) — high cost but the methodology-is-the-product claim's clearest expression.
3. **`bootstrap-md`** (15, tied) and **`schema-bridge`** (15, tied) — both load-bearing for positioning.

The 7 ships-v0.8.0 set below is **NOT** a straight top-7 by table. It is a hand-picked set chosen because together they tell the v0.8.0 story. The ranking informs; the story decides.

---

## 4. The recommended v0.8.0 module set

Seven modules ship in v0.8.0. They cover five of the six roles (every role except the most narrative Showcase pair could be excluded, but `module-cookbook` is the keystone). Together they tell this story:

> *"OperatorOS keeps engineer and AI in agreement about a workspace — and here's what agreement looks like in code."*

### The 7 ships-v0.8.0 list

#### 1. `bootstrap-md` (Workspace Module)

- **Why this anchors the set.** `bootstrap.md` is the only file an AI agent *must* read first. Making its generation, evolution, and refresh a *module* proves that even the agent-facing surface obeys the same contract as every other module. If this works, "agreement" is operational.
- **Story it tells.** "We don't have special files for AI. We have modules that produce the files everyone reads — humans and agents alike."
- **Acceptance.** First-time engineer runs `operatoros run bootstrap-md render`; reads the new `bootstrap.md`; recognizes the workspace they have. AI agent arrives, reads the same file, agrees.

#### 2. `identity-md` (Workspace Module)

- **Why this anchors the set.** `IDENTITY.md` is the workspace owner's onboarding document. Without it, no agent ever knows who they're working with. With it, the methodology has a *typed* entry for the human.
- **Story it tells.** "We didn't forget the engineer. Their identity is a first-class module output, schema-validated."
- **Acceptance.** First-time engineer runs `operatoros run identity-md interview`, answers five questions, reads back their own answers in `IDENTITY.md`. An agent that arrives later reads the same file.

#### 3. `catalog-validator` (Quality Module)

- **Why this anchors the set.** This module *proves* the catalog is not a toy. It checks invariants that the schema cannot express: content-hashes match, no unplanned files leaked in, no scheduled drift. Without it, the v0.7.0 catalog is "pretty JSON"; with it, it's "the audit-able source of truth."
- **Story it tells.** "We said the catalog is durable. We have a module that enforces durability. The audit log is real."
- **Acceptance.** Engineer runs `operatoros run catalog-validator validate` on a freshly-initialized workspace and gets a clean report; on a hand-tampered workspace gets a flagged report they can read.

#### 4. `schema-bridge` (Quality Module)

- **Why this anchors the set.** OperatorOS relies on JSON Schema as its typed substrate. A module that *checks the schemas themselves* — present, valid, version-pinned — means the "Typed Substrate" principle is enforceable, not aspirational.
- **Story it tells.** "Every principle has a module that checks it. Principle 3 (Typed Substrate) has `schema-bridge`. Try to violate it."
- **Acceptance.** Engineer runs `operatoros run schema-bridge check`, sees four-line summary (one per core schema). Re-runs after deliberately deleting a schema; sees failure; restores.

#### 5. `mission-runner` (Reference Module)

- **Why this anchors the set.** The Evidence-Based principle is currently the *least* enforceable in code. `mission-runner` makes the 8-artifact sprint pattern executable: it scaffolds `.project-state/<slug>/` with the eight artifacts, validates a finished mission, archives a mission. The principle becomes *operationally* codified.
- **Story it tells.** "We don't ship hand-edited decisions. We ship modules that produce the decision-record shape."
- **Acceptance.** Engineer runs `operatoros run mission-runner init operatoros-v080-demo`, runs it through, runs `validate` → pass, runs `archive` → moved. Reads the produced decision file; matches ADR shape in `methodology/06`.

#### 6. `drift-detector` (Reference Module)

- **Why this anchors the set.** Six principles, one per check, in one module's output. A first-time engineer who runs `drift-detector check` and reads the report learns the methodology by *looking at their own workspace*. This is the strongest single-encounter onboarding artifact the project can produce.
- **Story it tells.** "This is the methodology, runnable, against your real files. Every principle has a check. None of them is optional."
- **Acceptance.** Engineer runs `drift-detector check --format=md`, reads ~1K-token report, identifies the principle they didn't know they were violating, fixes it, re-runs, sees the report shrink.

#### 7. `module-cookbook` (Showcase Module)

- **Why this anchors the set.** The showcase role's whole point is the 5-minute "I tried OperatorOS" experience. The cookbook produces a fully-commented, valid, runnable `hello-world/` module in one command. Without it, an engineer reads `CONTRIBUTING.md` and freezes. With it, they have a complete worked example.
- **Story it tells.** "Writing a module is not magic. We gave you the cookbook. Open `examples/hello-world/module.yaml`, see every line explained, copy and edit."
- **Acceptance.** Engineer runs `operatoros run module-cookbook hello-world`, opens the produced files, reads the inline commentary, edits one line, re-runs, sees their change work.

### Why these 7 together, not a different 7

Three constraints were applied:

1. **Demonstrate ≥ 5 of the 6 roles.** The seven modules cover Workspace (×2), Quality (×2), Reference (×2), Showcase. AI and Reporting are deliberately under-covered in v0.8.0 because they need infrastructure (`bootstrap-tier-refresh` requires `identity-md` first; `workspace-snapshot` requires the catalog to be stable for ≥1 release). Deferring them is a sequencing choice, not a value choice.
2. **Each module must be load-bearing for at least one principle.** The mapping:
   - `bootstrap-md` → Principle 4 (Composable) — the bootstrap file *is* a composable module.
   - `identity-md` → Principle 5 (Evidence-Based) — identity is the most basic evidence a workspace carries.
   - `catalog-validator` → Principle 1 (Single Authority) — without a validator, two files could each claim authority.
   - `schema-bridge` → Principle 3 (Typed Substrate).
   - `mission-runner` → Principle 5 (Evidence-Based).
   - `drift-detector` → all six principles.
   - `module-cookbook` → Principle 4 (Composable) — a cookbook is the canonical on-ramp to composability.
3. **No module duplicates a mature ecosystem.** See §6 below.

A senior engineer who reads the seven modules' `module.yaml` files will, in 30 minutes, understand:

- the contract,
- the methodology,
- the role taxonomy (without us ever having told them the taxonomy exists),
- and how all six principles apply.

That is the success criterion: *a first-time engineer understands the unique value of OperatorOS within a few minutes of exploration.*

---

## 5. The 13 candidates deferred beyond v0.8.0

These are listed in two groups: deferred-by-design (will ship later, sequenced behind v0.8.0) and rejected-permanently (deliberate non-goals, listed so future agents don't propose them).

### 5.1 Deferred by design — sequenced behind v0.8.0

| # | Module | Earliest version | Reason for deferral |
|---|--------|------------------|---------------------|
| D-1 | `bootstrap-tier-refresh` (AI) | v0.9.0 | Depends on `bootstrap-md` + `identity-md` being stable across ≥1 release. |
| D-2 | `agent-onboarding-interview` (AI) | v0.9.0 | Depends on `identity-md`'s interview UX. |
| D-3 | `conditional-tier-hints` (AI) | v0.9.0 | Depends on `bootstrap-tier-refresh`. |
| D-4 | `preset-applier` (Workspace) | v0.9.0 | Wraps `operatoros apply` with a recording layer; valuable but unblocks nothing. |
| D-5 | `workspace-snapshot` (Reporting) | v0.10.0 | Snapshot schema needs ≥1 release of stable catalog to be versionable. |
| D-6 | `catalog-timeline` (Reporting) | v0.10.0 | Needs committed catalog history; depends on D-5. |
| D-7 | `preset-card` (Reporting) | v0.9.0 | Cheap; pairs with `principles-card`. Not in v0.8.0 because it doesn't tell a *new* part of the story. |
| D-8 | `agreement-demo` (Showcase) | v0.10.0 | The demo is a *derivative* of `drift-detector`. After v0.8.0 lands, the demo is mostly cosmetic. |
| D-9 | `principles-gate` (Quality) | v0.9.0 | CI-grade wrapper around `drift-detector`. After v0.8.0 ships, this becomes the obvious PR-template addition. |
| D-10 | `philosophy-quotes` (Showcase) | v0.10.0 or later | Marketing-adjacent; low value if added before D-8 (the demo) is in. |
| D-11 | `principles-card` (Reference) | v0.10.0 or later | Same reasoning as D-10. |

### 5.2 Rejected permanently — explicit non-goals

These are NOT designed into the ecosystem because they duplicate a mature ecosystem or contradict the constitution. They will NOT be built, and they are listed here so future agents don't propose them:

| # | "Module" that won't exist | Reason |
|---|---------------------------|--------|
| E-1 | **Dotfile manager module** (chezmoi/competitor analog) | chezmoi, Dotbot, GNU Stow do this. OperatorOS does not sync files. Building this contradicts positioning ("not a dotfile manager"). |
| E-2 | **Package/shell manager module** (Nix Home Manager analog) | Nix, devenv, devpod do this. Building this contradicts positioning ("not a package manager"). |
| E-3 | **Deployment/infra module** (Ansible/Terraform analog) | OperatorOS governs a workspace, not remote machines. |
| E-4 | **Configuration manager module** (etcd/consul analog) | Multiple processes coordinating config is a distributed-systems concern. OperatorOS is a single-machine workspace. |
| E-5 | **Vault/secrets manager module** (1Password/vault analog) | Vault lives in `vault/`, which is deny-listed at export. A module that "manages secrets" duplicates age, gopass, KeePassXC, and Bitwarden. |
| E-6 | **AI agent module** (Claude Code/Hermes analog) | OperatorOS does not run agents. It gives them a workspace. The constitution's Anti-AI-Runtime position is held. |
| E-7 | **Cloud sync engine module** | Local-First principle forbids. Network calls in Core are forbidden by `__tests__/local-first.test.ts`. |
| E-8 | **Telemetry / usage tracking module** | Catalog schema explicitly rejects ephemeral fields. Forbidden. |
| E-9 | **Markdown editor / static-site generator module** | Obsidian, MkDocs, Hugo, Astro do this. OperatorOS is not an editor. |
| E-10 | **Task / project manager module** (Linear/Jira analog) | A workspace is a place to *work*, not a place to track work. Mission runner handles the *evidence-of-work* layer; an operator wants a real tool for tasks. |
| E-11 | **"Module marketplace" / `install <registry-name>` module** | Empty by design (Decision 9, v0.6.3). Registry entries are aspirational; the registry stays empty until real users exist. |
| E-12 | **Module signing / GPG-verification module** | Out of scope until external contributors exist. Building this is solving a problem that hasn't happened yet. |
| E-13 | **Terminal / multiplexer module** (tmux/zellij analog) | OperatorOS is the workspace; the terminal is the runtime. A terminal module would couple the discipline to one tool, violating Everything Replaceable. |

E-1 through E-13 are *load-bearing anti-modules*. The fact that they are *not* in the v0.8.0 ecosystem is a positioning message. The README's anti-positioning section will be cross-referenced from this list.

---

## 6. Mapping back to the core promise

Per `CORE-PROMISE-2026-07-15.md`:

> *"OperatorOS keeps engineer and AI in agreement about a workspace."*

A test applied to every module above: **does this move engineer and AI closer to agreement, or further?**

| Module | Closer? | Why |
|--------|---------|-----|
| `bootstrap-md` | Yes | The file *both* read first is now produced by a typed module; the agent's read matches the engineer's expectation. |
| `identity-md` | Yes | The engineer's *self-description* is now a typed artifact an agent can re-read instead of re-asking. |
| `catalog-validator` | Yes | Engineer and AI now agree on what's *in* the workspace (validated catalog). |
| `schema-bridge` | Yes | The schemas both sides depend on are now guaranteed present and version-pinned. |
| `mission-runner` | Yes | Decisions are recorded in a shape both sides know; re-reading history is now typed. |
| `drift-detector` | Yes | The drift class is *measurable*; agreement is no longer a wish. |
| `module-cookbook` | Yes | The on-ramp is now typed; the engineer's first module matches the contract an agent expects. |

Every ship-v0.8.0 module reduces drift. Every reject-permanently module would have *introduced* drift with a mature ecosystem (cat-fight) or violated the constitution.

The accounting is on one side: **7 ships that close drift, 13 deferred that don't close enough, 13 rejected that open it.** That is the v0.8.0 ecosystem in one sentence.

---

## 7. Implementation dependencies and ordering

If (and only if) the seven modules are approved for v0.8.0, the recommended build order is:

```
Week 1 ─►  schema-bridge  (smallest, validates the stack works)
        └─► catalog-validator (also small; first taste of "drift caught")

Week 2 ─►  bootstrap-md  (medium; foundation for AI-facing surface)
        └─► identity-md  (small; pairs with bootstrap-md)

Week 3 ─►  mission-runner  (medium; reuses identity-md's history pattern)

Week 4 ─►  drift-detector  (medium-large; wraps mission-runner + bootstrap-md reads)

Week 5 ─►  module-cookbook  (small; final showcase)
        └─► release v0.8.0
```

Notes:

- `schema-bridge` and `catalog-validator` can ship independently of the rest — they have no module dependencies.
- `bootstrap-md` and `identity-md` are paired: both write to the always-read tier.
- `mission-runner` could ship a week before `bootstrap-md` if time-pressed; it is independent.
- `drift-detector` is the closing module. It produces the strongest demo artifact; it should not ship until the things it reads are stable.
- `module-cookbook` is last because it teaches against the now-stable module contract.

If v0.8.0 is delayed past Week 5, the *deferral plan* for D-1 through D-11 should be re-evaluated — but no new module should be added without a Keep/Reposition/Delete decision against the six ships above.

---

## 8. Verification criteria — how we'll know the design is right

A v0.8.0 module ecosystem design is *successful* if and only if the following four gates are met after build:

1. **Gate 1 — Five-minute evaluation.** A senior engineer unfamiliar with OperatorOS clones the repo, runs `operatoros init`, then runs `operatoros run module-cookbook hello-world` and `operatoros run drift-detector check`. They post their summary in ≤300 words and it identifies the six principles and the "agreement" promise. (Validates Showcase + Reference pairing.)
2. **Gate 2 — Schema reachability.** `operatoros run schema-bridge check` passes against the v0.8.0 binary and against every prior v0.7.x workspace. (Validates Quality Module #1.)
3. **Gate 3 — Catalog invariants.** `operatoros run catalog-validator validate --strict` passes on a freshly-initialized workspace and reports ≥3 real failures (not synthetic) on a hand-tampered test workspace. (Validates Quality Module #2.)
4. **Gate 4 — Principle-as-code.** `operatoros run drift-detector check --format=json` produces output where every line maps to one of the six principles. No line is "miscellaneous." (Validates Reference #1.)

A v0.8.0 ecosystem design is *unsuccessful* if:

1. A gate is defined and missed.
2. A deferred module (D-1 through D-11) ships under v0.8.0 without an explicit ADR.
3. Any rejected-permanently item (E-1 through E-13) is built.

---

## 9. Why this is not implementation

This document:

- Does not modify `core/`, `schemas/`, `methodology/`, `presets-canonical/`, `examples/`, `CONTRIBUTING.md`, or any CLI command.
- Does not commit changes.
- Does not push.
- Does not modify `.project-state/` (it lives at the workspace root as a sibling to existing positioning docs).
- Does not rename or restructure OperatorOS.

This document is a sibling to `CORE-PROMISE-2026-07-15.md`, `POSITIONING-VALIDATION-2026-07-15.md`, and `ANALYSIS-v0.7.1-directive.md`. All four are read-only research artifacts. Implementation of the seven ships-v0.8.0 modules is a separate mission — gated on this design's acceptance by the owner.

---

## 10. Summary — the v0.8.0 module ecosystem in one paragraph

OperatorOS is the discipline that keeps engineer and AI in agreement about a workspace. v0.8.0 makes that discipline executable by shipping seven modules that together cover four of the six role families and load-bear all six principles. The seven are `bootstrap-md`, `identity-md`, `catalog-validator`, `schema-bridge`, `mission-runner`, `drift-detector`, and `module-cookbook`. The seven are sequenced in five weeks, validated by four gates, and sized so a first-time engineer understands the unique value of OperatorOS within a few minutes of exploration — without the ecosystem duplicating any mature tool (chezmoi, Nix Home Manager, Ansible, package managers, secrets managers, AI agent runtimes, or cloud sync engines, all of which are explicitly *not* in scope). Thirteen candidates are deferred; thirteen anti-modules are deliberately rejected; both lists are load-bearing positioning artifacts.

---

*End of v0.8.0 module ecosystem design. No implementation performed in this session per the brief. Apply mission (if approved) lives in a separate session, gated on this design's acceptance.*
