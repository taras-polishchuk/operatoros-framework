# OperatorOS v0.8.0 — Implementation Plan

> **Mission slug:** `operatoros-v080-implementation-plan-2026-07-15`
> **Reviewer:** Hermes
> **Date:** 2026-07-15
> **Status:** Implementation planning only. No implementation performed in this session. The plan operates strictly within `ARCHITECTURE-FREEZE-v0.8.0.md` §8 implementation boundaries; no architectural changes are proposed.
> **Inputs read:** `ARCHITECTURE-FREEZE-v0.8.0.md`; `FIRST-10-MINUTES-DESIGN-v0.8.0.md` (§6.1 README flow); `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md` (§1.4 Phase 3 validation); `MODULE-ECOSYSTEM-DESIGN-v0.8.0.md` (§2 module contracts); `MODULE-MODEL-CLARIFICATION-v0.8.0.md` (§5.1 wrap-not-replace rule); `methodology/06-decisions-adr.md`; `core/src/cli.ts`; `core/src/commands/init.ts` (`renderBootstrap` fallback); `package.json`.
> **Constraints held:** Do not redesign the architecture (freeze §6 is immutable). Do not introduce new capabilities (freeze §5.5 is the closed list). Do not change frozen decisions (any such change requires an ADR; none is proposed here).

---

## TL;DR — The single sentence

v0.8.0 ships in **seven workstreams across five milestones over five calendar weeks** — Core `inspect` first, three Tier-0 read-out modules next, two Workspace modules third, two Reference modules fourth, the transactional `bootstrap-tier-refresh` fifth, and the `module-cookbook` Showcase in parallel; documentation roll-out (`G`) is the final milestone because it names all ten capabilities and cannot be written until ships-set is settled.

Total source LOC envelope: **~3,000 lines** of TypeScript plus **~600 lines** of new JSON-Schema additions if any. Total test LOC envelope: **~1,500 lines**. Total documentation surface: **4 files** (README, CONTRIBUTING, `methodology/07-capability-selection.md`, `CHANGELOG.md` entry).

The plan's success criterion — *"An implementation team should be able to execute v0.8.0 directly from the plan without requiring additional architectural decisions"* — is met because every step in the plan is a *file write*, a *test addition*, or a *command run*. No step produces an architectural question that this plan doesn't already answer.

Two architectural guardrails (per freeze §6) flow through the plan and are repeated at every phase boundary:

- **Local-First invariant** — `__tests__/local-first.test.ts` must remain green at every merge. New modules must not introduce network primitives.
- **Single-Authority invariant** — every file touched has *exactly one canonical source*. `bootstrap-md` module replaces (does not duplicate) the in-binary `renderBootstrap()`. `drift-detector` does not duplicate catalog invariants; it reports them.

---

## 1. The frozen ships-set, restated as work units

From `ARCHITECTURE-FREEZE-v0.8.0.md` §5.1, the canonical ten. Each entry below is restated in *implementation* terms: source files touched, expected LOC, and tests required. The Q-coverage column is from the freeze; it does not change here.

| # | Capability | Layer | Q-coverage | Source files | LOC budget | Test cases |
|---|-----------|-------|-----------|--------------|-----------|------------|
| 1 | `inspect` | Core | Q1, Q5, Q7, Q11 | `core/src/commands/inspect.ts` *(new)*; bind in `core/src/cli.ts`; embed in `core/src/embedded-assets.ts`; tests `core/__tests__/inspect.test.ts` *(new)* | 150 | 4 |
| 2 | `context-builder` | Module | Q1, Q11 | `modules/context-builder/{module.yaml,commands/inspect.ts,commands/diff.ts,README.md}`; tests `modules/context-builder/__tests__/` | 250 | 3 |
| 3 | `workspace-census` | Module | Q5 | `modules/workspace-census/{module.yaml,commands/census.ts,commands/orphans.ts,commands/anomalies.ts,README.md}`; tests | 350 | 4 |
| 4 | `architecture-index` | Module | Q3 | `modules/architecture-index/{module.yaml,commands/show.ts,commands/diff.ts,commands/validate.ts,README.md}`; tests | 400 | 4 |
| 5 | `module-cookbook` | Module | Q11 | `examples/hello-world/{module.yaml,README.md,bin/greet.sh}`; `modules/module-cookbook/{module.yaml,commands/hello-world.ts,commands/show.ts,docs/topics/*}`; tests | 250 | 2 |
| 6 | `bootstrap-md` | Module | Q2 | `modules/bootstrap-md/{module.yaml,commands/render.ts,commands/template.ts,README.md}`; tests; **modifies** `core/src/commands/init.ts:renderBootstrap()` to call the module when installed | 300 | 3 |
| 7 | `identity-md` | Module | Q10 | `modules/identity-md/{module.yaml,commands/init.ts,commands/interview.ts,commands/validate.ts,README.md}`; tests | 250 | 3 |
| 8 | `drift-detector` | Module | Q5, Q6 | `modules/drift-detector/{module.yaml,commands/check.ts,commands/diff.ts,commands/gate.ts,principles/*.sh,bin/*.sh,README.md}`; tests | 400 | 5 |

*(I4 amendment to source-files column)* Each principle-check is implemented as its own shell script under `principles/<principle>.sh`: `single-authority.sh`, `everything-replaceable.sh`, `typed-substrate.sh`, `composable.sh`, `evidence-based.sh`, `local-first.sh`. The module's `check` subcommand invokes them in order and aggregates the findings into one Markdown report. Tests are organized as one test file per principle plus one integration test. This makes each principle-check individually demonstrable and reviewable.
| 9 | `bootstrap-tier-refresh` | Module | Q2, Q7, Q11 | `modules/bootstrap-tier-refresh/{module.yaml,commands/refresh.ts,commands/diff.ts,README.md}`; tests; depends on `bootstrap-md` + `identity-md` | 350 | 3 |
| 10 | `mission-runner` | Module | Q8 | `modules/mission-runner/{module.yaml,commands/init.ts,commands/list.ts,commands/validate.ts,commands/archive.ts,artifacts/*.tmpl.md,README.md}`; tests | 300 | 4 |
|  | **Total** | | | | **~3,000** | **~35** |

Cross-cutting surface (one-time costs, not in any workstream):

| Item | Surface | LOC | Notes |
|------|---------|-----|-------|
| **`schemas/identity.schema.json`** *(I1 amendment)* | new file | ~120 JSON | Schema for `IDENTITY.md` produced by `identity-md` module. Lives next to existing schemas. Required by M2 completion ("IDENTITY.md produced by `identity-md init` is schema-valid"); additive change, recorded in CHANGELOG under v0.8.0. |
| **README §"Try it" rewrite** | `README.md` | ~200 markdown | per `FIRST-10-MINUTES-DESIGN-v0.8.0.md` §6.1 |
| **`CONTRIBUTING.md` §"How to propose a capability"** | `CONTRIBUTING.md` | ~50 markdown | per CAPABILITY-FRAMEWORK §10.1 |
| **`methodology/07-capability-selection.md`** | new file | ~150 markdown | adds framework as a methodology doc |
| **`CHANGELOG.md` v0.8.0 entry** | `CHANGELOG.md` | ~80 markdown | enumerates the 10 ships |
| **Workstream G total** | | ~600 | Gated on ships-set completion (now includes identity.schema.json from I1) |

---

## 2. Workstreams — eight parallelizable units

The ten capabilities map to **eight workstreams** (one Core workstream A; seven module workstreams B–F; one documentation roll-out G). Workstreams run with the dependencies described in §3.

| Stream | Capabilities covered | What it produces | First commit |
|--------|----------------------|------------------|--------------|
| **A** | `inspect` | Core CLI addition; README §"Try it" gets a `inspect` step | — |
| **B** | `context-builder`, `workspace-census`, `architecture-index` | Three "what does this look like" modules using the catalog as input | — |
| **C** | `bootstrap-md`, `identity-md` | Always-read tier becomes module-driven; in-binary generator becomes the fallback | — |
| **D** | `drift-detector`, `mission-runner` | "What is wrong / what was decided" modules | — |
| **E** | `bootstrap-tier-refresh` | Atomic transactional regeneration across the always-read tier | — |
| **F** | `module-cookbook` | Worked-example from-scratch module generator; `examples/hello-world/` lands | — |
| **G** | (cross-cutting) | README §"Try it" rewrite, CONTRIBUTING §"How to propose a capability", `methodology/07-capability-selection.md`, CHANGELOG entry | — |

A and F are *fully independent*; they can start in week 1. B, C, D have internal dependencies (described next). E depends on C. G is the last stream to land.

Workstream assignment notes:

- B groups three "Tier-0 read-out" modules because they share the same library (`catalog.ts` exists; they'd add three small consumers of it). Grouping them is a *delivery* choice, not an architectural choice — they remain three modules with three `module.yaml` files. Saves ~200 LOC of repeated scaffolding.
- C groups two "always-read tier" modules because they share the file-rendering pattern and both *modify Core behavior* (`renderBootstrap()` becomes module-aware). They must ship together to keep Core's behavior contract stable.
- D groups `drift-detector` and `mission-runner` because both produce structured reports against the canonical question taxonomy; they share the same report-generation utility.
- E is a separate stream because it's the *transactional* layer, depending on C.
- F can run in parallel with anything, but is best late so the contract being demonstrated is settled.

---

## 3. Dependency graph

The graph below expresses which streams must complete before others can start. Dependency edges are mechanical: they reflect *runtime* dependencies between capabilities, not scheduling preferences.

### 3.1 Edges

```
       ┌──── A (inspect, Core)
       │
       │     ┌──── B (context-builder, workspace-census, architecture-index)
       │     │
       │     │     ┌──── C (bootstrap-md, identity-md)
       │     │     │           │
       │     │     │           └──── E (bootstrap-tier-refresh)
       │     │     │
       │     │     └──── D (drift-detector, mission-runner)
       │     │
       │     └──── F (module-cookbook) — independent
       │
       └────────────────────  G (docs roll-out) — last
```

### 3.2 Edge-by-edge reasoning

- **A → no depends-on** — `inspect` reads the filesystem and the catalog (built-in). Nothing in the ships-set is required. **Independent.**
- **B → no depends-on** — the three Tier-0 read-out modules consume `core/src/lib/catalog.ts` and read the manifest. Built-in Core; no ships-set dependency. **Independent.**
- **C → no depends-on** — the always-read tier modules produce `bootstrap.md` and `IDENTITY.md`. They don't *read* any other ship. **Independent of A, B, D.** However, C *modifies* `core/src/commands/init.ts:renderBootstrap()` to delegate to the module when installed — this means **C must land before any release version** so the in-binary behavior contract settles.
- **C → E** — `bootstrap-tier-refresh` regenerates the always-read tier *atomically* across `bootstrap.md` + `IDENTITY.md` + the catalog. Without C shipped, there's no "transaction across" to perform. **Hard dependency.**
- **D → no depends-on** — `drift-detector` reads the catalog and the manifest; `mission-runner` reads `methodology/06-decisions-adr.md`. Both built-in. **Independent.**
- **F → no depends-on** — `module-cookbook` reads `module.schema.json` (built-in) and produces a *worked example*. **Independent.**
- **G → all ten** — documentation must enumerate the full ships-set. Gated on streams A–F.

### 3.3 Parallelism opportunities

A junior engineer-pair per stream makes **A, B, F** runnable from day 1 simultaneously. **C** must run alone (one engineer-pair) because `init.ts` modification is centralized. **D** can run in parallel with C — they touch *different* files. **E** starts once C completes. **G** lands after all five modules ships.

If two engineering pairs are available, the schedule below (§5) shows parallelism. If only one pair, collapse A→B→C→D→E→G and de-scope F to a v0.8.x patch.

---

## 4. Per-capability implementation contract

Each of the ten ships has a *contract* — what implementers must deliver — repeated here once so the plan is self-sufficient. The contracts are *implementation* (per freeze §8.1 May-do-without-ADR), not architectural.

### 4.1 Core capability — `inspect`

- **CLI surface.** `operatoros inspect [--target <path>] [--format=md|json|terminal] [--no-bootstrap]`.
- **Behavior.** Reads the directory (default: cwd); enumerates files (using `core/src/lib/catalog.ts`); produces a 3-section plain-text report: (1) what's here, (2) how an AI agent would describe it cold, (3) what's structurally missing for full OperatorOS alignment. Output is *non-destructive* — does not write to the target directory.
- **Edge cases.**
  - Empty directory: produces all 3 sections with "none found yet" markers.
  - `.operatoros/` exists: reads the catalog for the first section, ignores `index.json` for the second.
  - `--no-bootstrap`: do *not* generate or recommend `bootstrap.md`; pure inventory + diagnostic mode.
- **Must NOT do.** Network calls (Local-First). Write to target. Delete. Mutate any file.
- **Tests (4 minimum).** (1) Empty dir produces non-empty report. (2) On a workspace with `.operatoros/` + `bootstrap.md`, the "AI view" section agrees with bootstrap.md. (3) `--format=json` parses cleanly. (4) The "missing" section flags the absence of `bootstrap.md` and `IDENTITY.md` precisely.

### 4.2 Module — `context-builder`

- **Module manifest.** `module.yaml` per `schemas/module.schema.json`; `requires.core_version: "0.8.0"`; one subcommand `inspect` with optional `--format=md|json` and `--since <ref>`.
- **Behavior.** Same input as `inspect` (Target), but produces a *deeper* output: a "context bundle" rendered for an AI agent. The shape is "if I were handed this project with no prior knowledge, what would I conclude?" — 4–8 paragraphs, 800–1500 tokens.
- **Edge cases.** If the workspace has `bootstrap.md`, leverage its read-out for fidelity. If `--since <ref>`, use git diff to highlight what changed since the ref.
- **Must NOT do.** Network calls. Modify any file. Generate `bootstrap.md` (that's `bootstrap-md`'s job).
- **Tests (3 minimum).** (1) Output is between 800 and 1500 tokens on a 50-file project. (2) Output does not contain any path that doesn't exist. (3) `--since` flag produces a different output than without it on a project with recent commits.

### 4.3 Module — `workspace-census`

- **Module manifest.** One subcommand `census` (default); subcommands `orphans [--since <iso>]` and `anomalies`.
- **Behavior.** Walks the workspace using `catalog.ts`; classifies each file by kind (12 kinds: source, test, config, doc, data, build-artifact, lockfile, dotfile, secret-ish, etc.); emits: (a) breakdown by kind (percentage + count), (b) orphan list (heuristic: text-format files with no other file referencing them), (c) anomaly list (paths matching patterns the engineer would want flagged, e.g., `.env.production.local`, `secrets.yaml.bak`).
- **Edge cases.** `< 10 files` workspace: produces a brief output saying "too small for census to be meaningful." Large workspace (>5000 files): streams output.
- **Must NOT do.** Network calls. Delete anything (per freeze §6 Decision 5; this module reads only).
- **Tests (4 minimum).** (1) Counts by kind match `find` results on a fixed fixture. (2) Orphan list on a fixture where A references B returns empty. (3) Anomaly list flags `.env.*.local`. (4) `--since` flag's orphans differ from full orphans on a fixture with phased history.

### 4.4 Module — `architecture-index`

- **Module manifest.** Subcommands `show` (default), `diff <since-tag>`, `validate`.
- **Behavior.** Produces `architecture.md` (a Markdown narrative of the workspace's high-level structure: top-level folders, canonical homes of concepts, "what's authoritative for X?") and `architecture-index.json` (machine-readable companion). The `validate` subcommand cross-references every "this folder is for X" claim in `architecture.md` against the actual filesystem contents.
- **Edge cases.** If a workspace lacks top-level structure (e.g., flat directory of 30 files), `show` produces a short output recommending the engineer define top-level grouping, then exits gracefully.
- **Must NOT do.** Network calls. Modify any file (writes only `architecture.md` and `architecture-index.json` under `state/` per the report-only convention).
- **Tests (4 minimum).** (1) `validate` reports zero false positives on a synthetic well-shaped fixture. (2) `diff` between two different timestamps on a real workspace yields a non-empty diff. (3) Output format is parseable Markdown. (4) The schema-validated JSON output validates against `module.schema.json` and (if defined) an architecture-index output schema.

### 4.5 Module — `module-cookbook`

- **Module manifest.** Subcommands `hello-world`, `show <topic>` (where topic ∈ `commands`, `settings`, `hooks`, `requires`, `manifest`).
- **Behavior.** `hello-world` scaffolds a complete, runnable, over-commented `examples/hello-world/` module into the workspace's `examples/` (or a target dir). `show <topic>` prints educational Markdown explaining the topic.
- **Edge cases.** `examples/` already exists: refuse unless `--force`. Topic not in vocabulary: list valid topics and exit 1.
- **Must NOT do.** Network calls. Touch any file outside `examples/hello-world/` (or the target).
- **Tests (2 minimum).** (1) After `hello-world`, the produced module validates against `module.schema.json`. (2) `show commands` produces non-empty Markdown containing the word "subcommand" or "command".

### 4.5a Module runtime contract — B1 amendment

**This is the canonical module-runtime contract that applies to every module in this plan, not just `module-cookbook`.**

Per `CONTRIBUTING.md` §"How to add a module" and `core/src/commands/run.ts:107-112` (`spawn(cmd.run, { shell: true, cwd: moduleDir })`), the existing execution model interprets `commands[].run` as a *shell string*. The shell string is invoked with `cwd` set to the module directory; positional args are expanded via `$1`, `$2`, ... `$@`.

**Consequence for this plan.**

- Every module in §4.x ships its commands as shell scripts inside the module's directory (conventionally `bin/<command>.sh`); `module.yaml` references them via `run: "bin/<command>.sh"` or equivalently `run: "./bin/<command>.sh $@"` when positional args are needed.
- The plan's `commands/<cmd>.ts` paths in §1 are illustrative — they describe *what the command does*, not the file extension. The implementation language is **shell**, consistent with the existing engine contract.
- No schema change is required. No CLI change is required. `module.schema.json` continues to define `commands[].run` as a string (current behavior); the new v0.8.0 ships don't extend the schema.
- This stays inside freeze §8.1 May-do-without-ADR (no architectural change). If a future version adopts a Node-runtime for modules (i.e., ships TypeScript modules that are compiled and dispatched at `add` time), that is an ADR post-freeze — explicitly out of scope for v0.8.0.
- The `module-cookbook`'s `hello-world` (Stream F) is the *canonical demonstration* of this contract: its generated `examples/hello-world/module.yaml` shows the shell-string `run:` form, and its generated `bin/greet.sh` is a complete template. Engineers reading the cookbook see the contract satisfied, not approximated.

**Forbidden.** A module *must not* place TypeScript in `commands/*.ts` and expect it to be invoked by `operatoros run`. Files with arbitrary extensions inside a module are still copied by `add`, but only the `commands[*].run` shell string is invoked. Modules may include helper scripts at `bin/<name>.sh` (or `<name>.py` if Python is in the dependency set); they must not assume Node-runtime invocation.

### 4.6 Module — `bootstrap-md`

- **Module manifest.** Subcommands `render` (default), `template`.
- **Behavior.** Renders the canonical `bootstrap.md` from a five-section template (Always read / Read when relevant / Discover on demand / Never read / Onboarding). Reads the workspace's *current* `presets/<active>/preset.yaml` and modules to populate the four always-read tier paths accurately. **Modifies `core/src/commands/init.ts:renderBootstrap()` to delegate to this module when installed** — but only when the module is installed; the in-binary generator remains the default fallback (per `MODULE-MODEL-CLARIFICATION-v0.8.0.md` §5.1).
- **First-init vs installed-module lifecycle — B2 amendment.** A new user's first session runs `init` *before* any module can be installed (`personal` preset ships `modules: []`). On that first session, `init.ts:renderBootstrap()` runs the in-binary generator and produces the same `bootstrap.md` (or close-enough — see I5, "schema-equal modulo timestamps") it would have produced before v0.8.0. The user then runs `operatoros add bootstrap-md` and `operatoros init --target <dir> --force` to refresh; the second run delegates to `bootstrap-md`'s `render` subcommand via the dispatch path described below. The two paths produce equivalent, schema-equal output; the byte-equalness test (#2 below) is parameterized to compare modulo (a) the `last_updated` line which the module includes with timestamp, and (b) any operatoros_version bump that the in-binary fallback might emit. Concretely:
  - **First `init`** → in-binary fallback fires. `bootstrap.md` is written.
  - **`operatoros add bootstrap-md`** → module is copied into `modules/bootstrap-md/`.
  - **`operatoros init --force`** → `init.ts` re-discovers that `bootstrap-md` is now under `modules/`; delegates to `operatoros run bootstrap-md render` instead of `renderBootstrap()`.
  - **Uninstalling the module** (hypothetical, not in v0.8.0 ships) → next `init --force` falls back to in-binary again.
  - The dispatch is one line in `init.ts`: "if `bootstrap-md` is installed, run it; else call the original `renderBootstrap()`." Tests verify both paths independently and that the outputs are schema-equal.
- **Edge cases.** Multi-preset workspace (technically possible but discouraged): use `presets/<active>/`. Module uninstalled: Core falls back to in-binary generator (no behavior change). Module version older than `requires.core_version`: warn but render.
- **Must NOT do.** Network calls. Delete the existing `bootstrap.md` without backup (write atomically via temp-file-then-rename pattern; keep last good copy in `state/bootstrap-md/history.jsonl`).
- **Tests (3 minimum).** (1) Rendered bootstrap.md contains the user's *actual* `module.yaml` paths in the conditional tier, not placeholder paths. (2) Init with `bootstrap-md` installed produces a `bootstrap.md` byte-equal to the module's render (modulo timestamp lines and `last_updated` fields — see **I5**). (3) Init with `bootstrap-md` uninstalled produces the in-binary fallback (no behavior change).

### 4.7 Module — `identity-md`

- **Module manifest.** Subcommands `init` (default), `interview`, `validate`.
- **Behavior.** Reads `methodology/05-onboarding-interview.md`'s five questions; `interview` walks the engineer through them, writing answers to `state/identity-md/interview-history.jsonl`; `init` consolidates the latest answers into `IDENTITY.md`; `validate` checks `IDENTITY.md` against the methodology's §5 rules.
- **Edge cases.** Engineer wants to skip a question: write `null` for now and proceed. Engineer re-runs `interview`: append to history; do not overwrite.
- **Must NOT do.** Network calls. Touch `vault/` or any path matching `**/secrets.*`. Store answers where they might leak via export (deny-list `state/identity-md/*` in the preset's `export.deny` if not already).
- **Tests (3 minimum).** (1) After `interview` with all 5 answers, `IDENTITY.md` contains all 5 question-headers and answers. (2) `validate` flags a partial `IDENTITY.md` (missing one answer). (3) Re-running `interview` does not clobber prior answers; history grows.

### 4.8 Module — `drift-detector`

- **Module manifest.** Subcommands `check` (default), `diff <since-tag>`, `gate`.
- **Behavior.** Reads the workspace's catalog, manifest, modules; produces a structured report with one finding per principle. The six principle-checks: (1) Single Authority violations (two files claim authority for same concept), (2) Everything Replaceable violations (modules with undocumented imports), (3) Typed Substrate violations (configs without schemas), (4) Composable violations (modules reaching into other modules' state), (5) Evidence-Based violations (orphan decisions or missing mission rationale), (6) Local-First violations (path patterns matching forbidden network primitives in module command strings).
- **Edge cases.** Workspace with no modules: produces empty report saying "no drift detectable yet." Workspace with > 100 modules: streamed output.
- **Must NOT do.** Network calls. Mutate workspace files. **Folded-in responsibilities** (per `CANONICAL-QUESTIONS-v0.8.0.md` §6.2): this module *also* does what `catalog-validator` and `schema-bridge` would have done. Implementers must NOT add a separate catalog-validator or schema-bridge module — that work is here.
- **Tests (5 minimum).** (1) Each principle produces a finding type identifiable from output. (2) `gate` exits 1 on a fixture with one violation; exits 0 with none. (3) `diff` between two timestamps yields a non-empty diff on a fixture with phased history. (4) All six principle violations are detectable from a constructed bad-fixture. (5) Output format `--format=md` is valid Markdown with one finding per principle heading.

### 4.9 Module — `bootstrap-tier-refresh`

- **Module manifest.** Subcommands `refresh` (default), `diff`.
- **Behavior.** Atomically regenerates the four always-read files: `bootstrap.md`, `IDENTITY.md`, `operatoros.yaml` (the active-preset reference — see **I3** scope clarification), `presets/<active>/preset.yaml` (snapshotted). Atomicity = one transaction. Either all four are updated, or none. `diff` shows what *would* change without writing.
- **Atomic-write scheme — B3 amendment (revised).** Initial audit proposed a Core CLI helper `operatoros _atomic-write`. Re-evaluation found no existing Core primitive for that purpose (Core ships no rename/atomic-write helper today). However, **adding a Core helper is unnecessary** because the module can use POSIX `mv` (atomic per file on the same filesystem) plus a backup-rollback script. The module's `refresh` implementation in `bin/refresh.sh` does:
  1. Snapshot the four files (and the directory containing `presets/<active>/`) into `state/bootstrap-tier-refresh/backup-<timestamp>/`.
  2. Render new content for each file into a sibling temp path: `bootstrap.md.tmp.XXXX`, `IDENTITY.md.tmp.XXXX`, `presets/<active>/preset.yaml.tmp.XXXX`, plus a single line update for `operatoros.yaml` (just the `preset:` reference, see **I3**).
  3. For each file, `mv <temp> <target>` — atomic per file on POSIX (same filesystem).
  4. After all 4 `mv`s succeed, delete the backup. On any failure between step 1 and step 4, restore from backup.

  This is **best-effort with rollback**, not "true atomic" — a single mv is atomic; four sequential mvs are not all-or-nothing. The audit's strict definition of "atomic" overstates what bash can give. The user-visible property we need is *eventual consistency under rollback*: if any step fails, no half-written state is observed by the user. The backup-rollback script provides this.
- **Why not introduce a Core helper.** No existing Core primitive to extend; adding one is freeze §8.1 May-do-without-ADR but does not earn its keep — the module already needs the backup-rollback logic at the module layer. A Core helper would just move the same logic, not simplify it. The audit's original recommendation is **rejected**; this B3 amendment is the simpler path.
- **Edge cases.** Workspace with no `bootstrap-md` installed: warns that module assumes `bootstrap-md` is installed for the high-fidelity render. Missing `IDENTITY.md`: writes a default one (with consent message) or refuses — pick policy in implementation.
- **Must NOT do.** Network calls. Partial writes left without rollback (must succeed as a transaction in the user-visible sense). Trigger if any of the four sub-files is write-protected.
- **Tests (3 minimum).** (1) After `refresh`, all four files are present and consistent. (2) `diff` shows the same set of changes that `refresh` would apply. (3) A simulated mid-write failure (e.g., turn off disk space between steps 2 and 4) leaves the four files either all-original or all-new (transactional in the rollback sense; see B3 amendment). The simulated-failure test is *manual eyeball check* in the validation ticket, not a CI test (per Risk 2 in §6).

### 4.10 Module — `mission-runner`

- **Module manifest.** Subcommands `init <slug>` (default), `list`, `validate <slug>`, `archive <slug>`.
- **Behavior.** Produces the canonical 8-artifact sprint directory at `.project-state/<slug>/`: `source-task.md`, `progress.md`, `decisions.md`, `blockers.md`, `artifacts.md`, `environment.md`, `execution-log.md`, `final-report.md`. The shape of each artifact is per `methodology/06-decisions-adr.md` and `methodology/02-doc-lifecycle.md`.
- **Edge cases.** Mission already exists: refuse unless `--force`. Mission in `archive/`: refuse; user should `unarchive` first.
- **Must NOT do.** Network calls. Touch anything outside `.project-state/`.
- **Tests (4 minimum).** (1) `init foo` produces all 8 standard files. (2) `validate foo` flags a missing artifact. (3) `archive foo` moves to `archive/`. (4) `list` shows existing missions.

---

## 5. Milestones — five calendar weeks

Each milestone ends with a verifiable artifact. The schedule assumes two engineering pairs and one tech-writer; with one pair, collapse A→B→C→D→E→F and keep G in the final week.

### 5.1 Milestone M1 — Core capability + first tier-0 modules (week 1, end-of-week)

**Streams running.** A + B + F (F can be a 50% pair).

**Completion artifact.**
- `operatoros inspect` works against an arbitrary empty directory.
- `operatoros add context-builder && operatoros run context-builder inspect` works against any workspace.
- `operatoros add workspace-census && operatoros run workspace-census` works.
- `operatoros add architecture-index && operatoros run architecture-index show` works.
- `operatoros add module-cookbook && operatoros run module-cookbook hello-world` produces a working `examples/hello-world/` module.
- `__tests__/local-first.test.ts` is green (Local-First guard honored).
- A two-engineer *play-through* of Phase-2 of the FIRST-10-MINUTES-DESIGN journey (§1.2): install → inspect → read report. ~10 minutes; engineered to take longer if either fails.

**Why this milestone matters.** After M1, the adopt-on-ramp story works. A first-time engineer who only sees M1 has the *value-crystallization* moment from FIRST-10-MINUTES §1.2 — they see their own workspace reflected back at them. The remaining 8 capabilities deepen this; they don't unblock it.

### 5.2 Milestone M2 — Workspace modules (week 2)

**Streams running.** C (full pair).

**Completion artifact.**
- `bootstrap-md` module installed; `init` continues to produce a `bootstrap.md` byte-equivalent to its render.
- `init` with `bootstrap-md` uninstalled still produces the in-binary fallback — no behavior regression.
- `identity-md` module installed; running `interview` and `validate` works.
- `IDENTITY.md` produced by `identity-md init` is schema-valid (if a schema is added — small JSON Schema additive change is acceptable; record in CHANGELOG under v0.8.0).
- `__tests__/local-first.test.ts` green.
- **Validation ticket** filed against `bootstrap-md`: a real engineer (not the proposer) ran the module against a freshly-init'd workspace and reported outcomes per framework §1.4 Phase 3. Same for `identity-md`.

**Why this milestone matters.** After M2, the always-read tier is module-driven. The in-binary fallback becomes historical — present but not load-bearing. This is the milestone that completes the Single-Authority invariant on `bootstrap.md`.

### 5.3 Milestone M3 — Reference modules (week 3)

**Streams running.** D (full pair).

**Completion artifact.**
- `drift-detector check` produces a structured report with one finding per principle; `--strict` exits non-zero on any violation.
- `mission-runner init foo` produces all 8 standard artifacts; `validate foo` flags missing artifacts.
- `__tests__/local-first.test.ts` green.
- **Validation tickets** filed (per framework §1.4 Phase 3).

**Why this milestone matters.** After M3, the methodology becomes runnable. A first-time engineer who runs `drift-detector check` against their workspace sees the six principles applied — this is the methodology-as-code demonstration `CORE-PROMISE-2026-07-15.md` §1.2 names.

### 5.4 Milestone M4 — Transactional module (week 4)

**Streams running.** E (full pair).

**Completion artifact.**
- `bootstrap-tier-refresh refresh` regenerates all four always-read files transactionally on a fixture workspace.
- `diff` shows the same set of changes that `refresh` would apply, with no false positives on a clean fixture.
- `__tests__/local-first.test.ts` green.
- **Validation ticket** filed. *This module's validation ticket is more rigorous* — see §6.2 (Risk 2).
- A CI-time test that fails if the in-binary `renderBootstrap()` and the module's render diverge in the install-vs-no-install case.

**Why this milestone matters.** After M4, the always-read tier has a *transactional regenerator*. Engineer can add or remove modules, run one command, and the always-read tier stays accurate.

### 5.5 Milestone M5 — Documentation roll-out + release (week 5)

**Streams running.** G (full pair).

**Completion artifact.**
- `README.md` §"Try it" rewritten per `FIRST-10-MINUTES-DESIGN-v0.8.0.md` §6.1 (the 10-command flow). `First 5 minutes` section removed or repurposed per the same source.
- `CONTRIBUTING.md` §"How to propose a capability" added per CAPABILITY-FRAMEWORK §10.1; ~50 lines; points at the framework.
- `methodology/07-capability-selection.md` added. ~150 lines; the framework re-rendered as a methodology doc.
- `CHANGELOG.md` v0.8.0 entry added. ~80 lines; enumerates 10 ships + 1 Core capability; references the architecture freeze.
- **README command-flow test.** A clean-room engineer who has never seen the project runs the 10 commands in §6.1 in order, records the entire journey (timestamps, output snippets) in a `state/v080-validate.md` file. Per framework §1.4 Phase 3 validation, this report is the load-bearing evidence that the first-10-minutes journey works.
- A new `bin/operatoros` install + smoke-test in a clean `docker run --rm -it ubuntu:latest` container. Binary returns `0.8.0` on `operatoros version`.
- `npx vitest run` passes with all v0.7.0 tests + new tests for `inspect` and the nine modules.
- `__tests__/local-first.test.ts` and `__tests__/release-gate.test.ts` both green.
- The full ships-set is enumerated in the CHANGELOG entry.
- A `git tag v0.8.0` is created (gated on owner instruction per CLAUDE.md global rule).
- The release mission produces a `state/v080-release-report.md` with: pushed SHA, branch status, build status, smoke test results, remaining known issues.

**Why this milestone matters.** M5 is the *release*. After M5, v0.8.0 is real — installable, runnable, documented.

### 5.6 Why five milestones, not three or seven

Three milestones would collapse M2 (Workspace modules) and M3 (Reference modules) into one — a four-week burden with no intermediate artifact. The M2↔M3 boundary exists because the *reader* of M2 is the always-read-tier-author; the reader of M3 is the methodology-auditor. Different audit gates; different validation tickets.

Seven milestones would split M4 (Transactional) into "atomic write contract" and "diff behavior" as separate weeks. The two are tightly coupled; splitting them creates rework risk when atomic-write contract changes invalidate the diff implementation.

Five milestones map to three natural read-pause points: M1 (Core ready + first deep modules), M3 (all authoring complete), M5 (release). M2 and M4 are *gates* — pass-or-return — not pause points.

---

## 6. Risk register

Six risks are tracked. Each risk has a trigger, an impact, a mitigation, and a contingent rollback.

### 6.1 Risk 1 — `bootstrap-md` regression in `operatoros init`

- **Trigger.** `init.ts:renderBootstrap()` modification breaks the existing default behavior when the module is uninstalled.
- **Impact.** Critical — `init` is the user's first command. A regression is a *first-impression* failure of the highest order.
- **Mitigation.** Keep the in-binary fallback *exactly* as it is; the only change to `init.ts` is "if module is installed, call it; otherwise, call renderBootstrap() as before" (per `MODULE-MODEL-CLARIFICATION-v0.8.0.md` §5.1). Tests 4.6#2 and #3 enforce this.
- **Contingent rollback.** Revert the `init.ts` change; ship `bootstrap-md` as a module but do *not* delegate from Core. The module works standalone; users who install it get high-fidelity output; users who don't get the in-binary default. v0.8.0 ships either way.

### 6.2 Risk 2 — `bootstrap-tier-refresh` built on unstable contract

- **Trigger.** Module built in week 4 against `bootstrap-md` and `identity-md` versions from weeks 1–3; if either is updated post-E, the tier-refresh contract drifts.
- **Impact.** High — silent partial writes are the worst kind of bug. Could leave `bootstrap.md` and `IDENTITY.md` inconsistent.
- **Mitigation.** Phase-3 validation ticket for `bootstrap-tier-refresh` is *more rigorous* than other modules. Specifically:
  1. Validator installs both `bootstrap-md` and `identity-md`; confirms versions.
  2. Validator runs `refresh` on a fixture; manually inspects that all four files are consistent (manual eyeball check, not a test).
  3. Validator simulates a mid-write failure (chmod-r on the parent dir) and confirms atomicity.
- **Contingent rollback.** Defer `bootstrap-tier-refresh` to v0.8.x if validation fails. The ships-set reduces to 9 modules + 1 Core. This is a documented acceptable outcome per the freeze §5 (ships-set composition is immutable-but-revisable-via-ADR only for the 10 named capabilities; 9 is "v0.8.0 minus 1 capability post-accept", which is a v0.9.0 concern, not v0.8.0).

### 6.3 Risk 3 — `drift-detector` principle checks are shallow

- **Trigger.** Six principles in one module is a lot to encode. Implementers may produce findings that are *technically correct* but *not actionable* (e.g., "principle 3 may be violated" without naming what).
- **Impact.** Medium — the methodology-as-code promise weakens; FIRST-10-MINUTES-DESIGN §1.2's M5 (the `drift-detector` moment) becomes less compelling.
- **Mitigation.** Each principle-check must produce a structured finding: `{ principle: "Single Authority", location: "modules/foo/module.yaml:3", recommendation: "..." }`. The recommendation field is non-empty for every finding. Tests 4.8#1 and #5 enforce this.
- **Contingent rollback.** Ship `drift-detector` with explicit "principle X is not yet instrumented" notes for any principle whose check is incomplete. Don't ship incomplete without flagging.

### 6.4 Risk 4 — `architecture-index` cross-ref validation produces false positives

- **Trigger.** Module uses heuristic text-match to find cross-references between Markdown / YAML / JSON files. Heuristics can have false positives (paths that look like references but aren't) and false negatives (references that don't follow patterns).
- **Impact.** Medium — undermines trust. A false positive is more damaging than a false negative.
- **Mitigation.** Conservative default: `validate` flags uncertain matches as "needs human review" rather than "violation." Tests 4.4#1 require zero false positives on a synthetic fixture; false negatives are acceptable.
- **Contingent rollback.** Ship `architecture-index` without `validate` subcommand if heuristics aren't solid. The module still produces a useful `show`; it just doesn't auto-validate claims.

### 6.5 Risk 5 — `mission-runner` ADR shape drifts from `methodology/06`

- **Trigger.** Methodology updates the ADR shape; the module's templates don't update; `validate` flags correct missions as broken.
- **Impact.** Low–medium. Confusing for users.
- **Mitigation.** Templates live in `modules/mission-runner/artifacts/*.tmpl.md` and are *generated from* `methodology/06-decisions-adr.md` by a build step. Generate-then-validate in CI. If they're out of sync, the build fails.
- **Contingent rollback.** Pin both files to a versioned template-set. Rebuild periodically.

### 6.6 Risk 6 — Documentation roll-out (M5/G) regresses the README

- **Trigger.** README §"Try it" rewrite per FIRST-10-MINUTES §6.1 introduces a typo or a wrong command that fails when run.
- **Impact.** High — first-impression regression.
- **Mitigation.** The M5 completion artifact *requires* a clean-room run-through by an engineer who has never seen the project. Any typo is caught. Additionally, README commands are wrapped in `bash` syntax-highlighted code blocks; rendered output is verified to match by spot-check during the dry-run of M5.
- **Contingent rollback.** Revert to the v0.7.0 README in M5 if the rewrite breaks anything. Ship v0.8.0 with the v0.7.0 README; backfill the §"Try it" rewrite in v0.8.x.

### 6.7 Risks that did NOT make the register

- **Network call in a new module.** Mitigated by `__tests__/local-first.test.ts` extending into module source. Per freeze §6 Decision 3, this is the *machine-checked* invariant. If it's not in the test, implementers must extend the test.
- **Schema change breaking existing `module.yaml` files.** Mitigated by `module.schema.json` immutability per `module-schema` ownership boundary (freeze §4 row 8). Schema changes require an ADR; v0.8.0 ships no schema changes (validation tests catch any accidental drift).
- **`operatoros version` showing the wrong number.** Mitigated by the existing `bin/version` contract — `pkgVersion` is the single source of truth. v0.8.0 ships `0.8.0` exactly.
- **Test count regression.** Existing v0.7.0 release-gate test counts > 0 fail conditions; v0.8.0 must add to that count without removing.

---

## 7. Validation checklist per capability

Per `CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md` §1.4 Phase 3: every capability has a *validation ticket* — a real engineer (not the proposer) runs it and reports. The format is the framework's "Validation report" template. The table below summarizes what each validation ticket must contain.

| Capability | Validator must verify | Validator files ticket in… |
|-----------|----------------------|---------------------------|
| `inspect` | Empty dir produces non-empty report; well-formed workspace produces cleaner report; format flags work; "missing" section names files by exact path. | `state/v080-validate/inspect.md` |
| `context-builder` | Output is 800–1500 tokens on a 50-file project; output reads like a person wrote it (not a tool); path names match the user's actual files. | `state/v080-validate/context-builder.md` |
| `workspace-census` | Anomaly list flags constructed `.env.production.local`; orphan list is empty on a normal fixture; counts by kind match `find`. | `state/v080-validate/workspace-census.md` |
| `architecture-index` | `validate` zero false-positives on synthetic fixture; `show` produces readable Markdown; `diff` between two timestamps yields non-empty diff. | `state/v080-validate/architecture-index.md` |
| `module-cookbook` | After `hello-world`, the produced module validates against `module.schema.json`; output runs end-to-end. | `state/v080-validate/module-cookbook.md` |
| `bootstrap-md` | Init with module installed produces module-rendered output; init with module uninstalled produces in-binary fallback; no behavior regression. | `state/v080-validate/bootstrap-md.md` |
| `identity-md` | `interview` walks all 5 questions; `validate` flags a partial `IDENTITY.md`; re-running `interview` doesn't clobber history. | `state/v080-validate/identity-md.md` |
| `drift-detector` | All 6 principle violations detectable from a constructed bad fixture; `gate` exits 1 on violation, 0 on clean; output is parseable Markdown. | `state/v080-validate/drift-detector.md` |
| `bootstrap-tier-refresh` | All 4 always-read files consistent after `refresh`; mid-write failure simulated → atomic; `diff` matches `refresh` deltas. | `state/v080-validate/bootstrap-tier-refresh.md` (more rigorous — see Risk 2) |
| `mission-runner` | `init foo` produces all 8 standard files; `validate foo` flags missing; `archive foo` moves to `archive/`; `list` returns existing. | `state/v080-validate/mission-runner.md` |

Total validation tickets: 10. Total validation report files: 10. They are committed to `state/v080-validate/` per the framework §1.4 Phase 3 directive.

### 7.1 The framework's "real engineer, not the proposer" rule

This is *not optional*. A validator is named; their user account is recorded; their first-hand report is what gets filed. The proposer's self-validation is not a substitute. Per framework §1.4 test 1, the validator's identity is part of the report.

If a solo implementer is the proposer, the validator is the *next* person to touch the capability — possibly the tech-writer reading the README, possibly the maintainer themselves after a 24-hour cool-off. The rule keeps proposer bias out of the validation record.

---

## 8. Final execution order — the recommended v0.8.0 roadmap

Combining streams, milestones, dependencies, and validation: the recommended execution order below is the *plan* — what the implementation team executes week by week.

### 8.1 Calendar sketch (two-pair team)

```
Week 1  ─────►  A (inspect) + B (3 modules) + F (cookbook, 50% pair) + docs placeholder  → M1
Week 2  ─────►  C (bootstrap-md, identity-md)                                                 → M2
Week 3  ─────►  D (drift-detector, mission-runner)                                           → M3
Week 4  ─────►  E (bootstrap-tier-refresh)                                                    → M4
Week 5  ─────►  G (README, CONTRIBUTING, methodology/07, CHANGELOG) + smoke + release          → M5
```

Pair assignments:

- **Pair 1 (Core/mod contracts).** M1 weeks 1: A + first half of B. M2: C. M3: D-first-half. M4: E. M5: smoke-test pass.
- **Pair 2 (Modules/content).** M1 weeks 1: B-second-half + F. M2: C-second-half. M3: D-second-half. M5: docs roll-out G.

Documentation-placeholder from week 1 is the maintainer or tech-writer who files content for `state/v080-validate/` as validators emerge.

### 8.2 Single-pair fallback

```
Week 1  ─────►  A + B (first 2 modules only; defer workspace-census to week 4)
Week 2  ─────►  B (third module: workspace-census)
Week 3  ─────►  C
Week 4  ─────►  D + E (both)  — high pressure
Week 5  ─────►  F (cookbook as optional v0.8.x) + G (docs) + smoke + release
```

If single-pair, F (`module-cookbook`) defers to v0.8.x. The release ships 9 modules + 1 Core capability = 10, same as planned, but `module-cookbook` follows as a 0.8.1 patch.

### 8.3 The execution checklist (one-page)

This is the artifact the implementation team prints and ticks. It is also the *audit form* that v0.9.0's review uses to check v0.8.0's completeness.

```
┌─ v0.8.0 EXECUTION CHECKLIST ─────────────────────────────────────────────────────────┐
│                                                                                       │
│  PRE-WORK                                                                             │
│  [ ] Plan amendments B1 (shell runtime), B2 (init lifecycle), B3 (mv/rollback),       │
│       I1 (identity.schema.json), I2 (vault-leakage tick), I3 (operatoros.yaml scope),  │
│       I4 (per-principle test files), I5 (schema-equal language) all applied  *(aud)*  │
│  [ ] Identity-verified git commit access (per git-identity-preflight)                │
│  [ ] .project-state/operatoros-v080-implementation/ created with 8 artifacts          │
│                                                                                       │
│  MILESTONE M1 — Core + Tier-0 modules                                                 │
│  [ ] core/src/commands/inspect.ts implemented                                         │
│  [ ] core/src/cli.ts registers `inspect`                                              │
│  [ ] core/__tests__/inspect.test.ts: 4 tests green                                     │
│  [ ] modules/context-builder/{module.yaml, commands/, README.md}                       │
│  [ ] modules/workspace-census/{module.yaml, commands/, README.md}                     │
│  [ ] modules/architecture-index/{module.yaml, commands/, README.md}                   │
│  [ ] modules/module-cookbook/{module.yaml, commands/, docs/, README.md}               │
│  [ ] examples/hello-world/{module.yaml, bin/greet.sh, README.md}                      │
│  [ ] __tests__/local-first.test.ts green                                              │
│  [ ] State validation ticket for M1 filed                                             │
│                                                                                       │
│  MILESTONE M2 — Workspace modules                                                     │
│  [ ] modules/bootstrap-md/{module.yaml, commands/, README.md}                         │
│  [ ] modules/identity-md/{module.yaml, commands/, README.md}                           │
│  [ ] core/src/commands/init.ts modified (delegates to bootstrap-md when installed)     │
│  [ ] Identity of init behavior: with vs without module verified                       │
│  [ ] identity-md validation: NO path written matches **/secrets.* or vault/   *(I2)* │
│  [ ] schemas/identity.schema.json added and the identity-md M2 path validates        │
│  [ ] __tests__/local-first.test.ts green                                              │
│  [ ] state/v080-validate/bootstrap-md.md (Phase 3 ticket)                              │
│  [ ] state/v080-validate/identity-md.md                                               │
│                                                                                       │
│  MILESTONE M3 — Reference modules                                                     │
│  [ ] modules/drift-detector/{module.yaml, commands/, principles/, README.md}          │
│  [ ] modules/mission-runner/{module.yaml, commands/, artifacts/, README.md}           │
│  [ ] __tests__/local-first.test.ts green                                              │
│  [ ] state/v080-validate/drift-detector.md                                            │
│  [ ] state/v080-validate/mission-runner.md                                            │
│                                                                                       │
│  MILESTONE M4 — Transactional module                                                  │
│  [ ] modules/bootstrap-tier-refresh/{module.yaml, commands/, README.md}                │
│  [ ] Mid-write failure test passes (atomicity)                                        │
│  [ ] __tests__/local-first.test.ts green                                              │
│  [ ] state/v080-validate/bootstrap-tier-refresh.md (rigorous)                          │
│                                                                                       │
│  MILESTONE M5 — Documentation + release                                               │
│  [ ] README.md §"Try it" rewritten per FIRST-10-MINUTES §6.1                          │
│  [ ] CONTRIBUTING.md §"How to propose a capability" added                             │
│  [ ] methodology/07-capability-selection.md added                                     │
│  [ ] CHANGELOG.md v0.8.0 entry added (enumerates 10 ships)                            │
│  [ ] Clean-room run-through completed; state/v080-validate/README.md filed             │
│  [ ] operatoros version reports 0.8.0                                                 │
│  [ ] docker run ubuntu:latest install + smoke-test passes                             │
│  [ ] npx vitest run all green                                                          │
│  [ ] __tests__/local-first.test.ts green                                              │
│  [ ] __tests__/release-gate.test.ts green                                             │
│  [ ] state/v080-release-report.md produced                                            │
│  [ ] git tag v0.8.0 (gated on owner instruction per CLAUDE.md)                        │
│                                                                                       │
│  POST-WORK                                                                             │
│  [ ] Architecture freeze §5.1 ships-set confirmed intact                              │
│  [ ] All six §8.2 Must-do items completed                                             │
│  [ ] Audit mission produced audit-report.md (separate, post-release)                  │
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

The checklist is the *operational* form. The plan is the *strategic* form. The freeze is the *constitutional* form. All three live in the repo and are kept in sync by the maintainer.

---

## 9. Mapping back to the core promise

> *"OperatorOS keeps engineer and AI in agreement about a workspace."*

The plan's success criterion is that *an implementation team executes v0.8.0 directly from the plan without architectural questions.* This is a *very* specific kind of "agreement": the agreement between the plan (this file), the architecture (the freeze), the capability framework (the gates), and the implementation work product.

How the agreement is enforced, point-by-point:

| Promise component | Plan-side enforcement |
|-------------------|----------------------|
| **Engineer** | The M1 play-through (§5.1) is performed by a real engineer and recorded in `state/v080-validate/`. This is the same engineer's experience that the core promise protects. |
| **AI** | `bootstrap-md` (shipped M2) ensures the AI reads the same canonical always-read tier that the engineer sees; `bootstrap-tier-refresh` (M4) keeps it transactionally consistent. |
| **Agreement** | The framework's 6-gate decision tree (operational per freeze §2.4) is what produces each capability — same gates every time. The Phase-3 validator check is *the* agreement check: a real user tested against the proposed answer and filed a yes/no verdict. |
| **About a workspace** | All ten capabilities answer canonical questions about a workspace; none is philosophy or one-off tooling. The plan doesn't ship philosophy-only modules. |

The plan produces a workspace where engineer and AI see the same files, validated by a third-party engineer, recorded in ten validation tickets, against an architecture that is the seventh in a chain of decisions. That's the core promise — operationalized to "did the validation report say yes?"

---

## 10. Why this is not implementation

This document:

- Adds no file in `core/`.
- Changes no schema.
- Adds no CLI command.
- Does not commit changes.
- Does not push.
- Does not modify `.project-state/` of any other sprint.
- Does not move any existing files in the repo.
- Does not modify `methodology/`, `ROADMAP.md`, `CHANGELOG.md`, or `README.md`.

The two corrections to `ARCHITECTURE-FREEZE-v0.8.0.md` (principle-vs-count carve-out in §2.4; ships-set-as-decree not algorithm in §5.1) are *pre-freeze amendments* — the freeze had not been accepted at the time of these corrections, so an ADR was not required. After acceptance, such corrections would require an ADR.

This plan is the operational successor to the freeze. The freeze is binding once accepted; the plan is *informed by* the freeze (per freeze §8.1 May-do-without-ADR). The plan does not modify the freeze; the freeze does not constrain the plan except where it must.

### 10.1 One subtle clarification

The freeze §8.1 says implementers MAY add new modules in the v0.8.0 ships-set. This plan *implements* those exact ten modules. Any new module proposal discovered during implementation is *not* implementable; it requires either (a) an ADR amending the ships-set, or (b) deferral to a later version. Implementers who discover a new module mid-stream must surface it to the maintainer via the Kanban, not via code.

### 10.2 The post-release audit

This plan produces v0.8.0. The *next* mission after release is an *audit mission* — applying this freeze's ships-set and frozen decisions against the v0.8.0 implementation. The audit's deliverables are CRITICAL/HIGH/MEDIUM/LOW findings, paired with a fix list. Audit is not part of this plan; it is downstream of M5.

---

## 11. Summary — the implementation plan in one paragraph

v0.8.0 implements across eight workstreams in five milestones over five calendar weeks — Core `inspect` (Stream A) ships week 1 with three Tier-0 read-out modules (`context-builder`, `workspace-census`, `architecture-index` — Stream B) and a Showcase `module-cookbook` (Stream F, parallel), providing M1's "value crystallization" first-impression milestone; the always-read tier becomes module-driven in week 2 (`bootstrap-md`, `identity-md` — Stream C, M2), with `init.ts` modified to delegate to `bootstrap-md` while preserving the in-binary fallback; week 3 lands the methodology-as-code modules (`drift-detector`, `mission-runner` — Stream D, M3); week 4 closes the loop with `bootstrap-tier-refresh` (Stream E, M4, harder validation); week 5 ships documentation roll-out (README §"Try it" per FIRST-10-MINUTES §6.1, CONTRIBUTING §"How to propose a capability", `methodology/07-capability-selection.md`, CHANGELOG entry, smoke test, release report — Stream G, M5). Total source envelope ~3,000 LOC; tests ~1,500 LOC; documentation ~480 markdown lines. Dependencies form a DAG: A, B, F are independent; C is independent; D is independent; E depends on C; G depends on all. Six risks tracked; all six have a mitigation and a contingent rollback (any single risk landing is recoverable without a sprint restart). Validation per capability follows framework §1.4 Phase 3: a real engineer (not the proposer) runs each ship-set capability and files a `state/v080-validate/<capability>.md` report; ten tickets total. Two amendments to the architecture freeze were applied *before* acceptance: the *principle-vs-count* carve-out (gates/layers/phases' roles are frozen, their exact counts are not) and the *ships-set-as-decree* clarification (the freeze is the rule, the prior documents are evidence). No further architectural redesign is proposed; the plan operates strictly within freeze §8 implementation boundaries.

---

*End of implementation plan. The plan's success criterion — *"An implementation team should be able to execute v0.8.0 directly from the plan without requiring additional architectural decisions"* — is met by the plan's structure (every step is file-write / test-addition / command-run) and by the freeze corrections in §10 (which remove the two remaining over-constraints). Implementation sprints can begin when the maintainer accepts the freeze.*
