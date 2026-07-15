# Changelog

> **Format:** [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). **Versioning:** [SemVer 2.0](https://semver.org/). **Cadence:** irregular while in alpha.
>
> **Release-tag reality (read this first):** the tagged, installable releases in the `v0.6` line are `v0.6.0`, and `v0.7.0` is the first tagged minor-bump-of-minor over v0.6. The `v0.6.0.1`, `v0.6.2`, and `v0.6.3` sections below are **post-v0.6.0 increments folded into the `main` branch without their own git tags or a `package.json` bump** (documentation/repositioning changes, no CLI code change). Treat them as sub-releases within the v0.6.0 line. A version bump + new tag is a deliberate release action and has not been performed for these increments. `v0.7.0` is tagged, has a `package.json` bump (`0.6.0` → `0.7.0`), and ships a single-file binary asset. `v0.7.1` is the documentation-positioning update below; it has no `package.json` bump and ships no new binary.

## [v0.7.1] — 2026-07-15

### Changed — Documentation positioning update

The introductory sections of README and landing page (`index.html`) are updated to follow the validated positioning research (see `ANALYSIS-v0.7.1-directive.md`, `POSITIONING-RESEARCH-2026-07-15.md`, `POSITIONING-VALIDATION-2026-07-15.md`, `CORE-PROMISE-2026-07-15.md` in this repo root for the research trail). The structural change is **a three-layer split**: (1) **product category** in the hero, (2) **product promise** immediately after, (3) **product mechanism** only below. No architecture, schema, CLI, or methodology changes.

### Hero (Layer 1 — product category)

> **One sentence:** An engineering workspace framework that keeps engineer and AI in agreement about a workspace.

This replaces the previous "methodology for engineers to build their own personal operating system — captured in code, documents, and a bootstrap protocol that an AI agent can run." The category noun moved from "personal operating system" to "engineering workspace framework"; the verb moved from "build" (which frames OperatorOS as a builder) to "keeps in agreement" (which frames it as a discipline).

### `§What this is` (Layer 2 — product promise)

The first sentence now states the core promise — *"OperatorOS keeps engineer and AI in agreement about a workspace."* — followed by a 2-sentence explanation of what drift between engineer and agent looks like and how OperatorOS prevents it (schema-validatable contract, catalog, bootstrap protocol).

### `§Why this and not [common alternative]?` (new section)

Three subsections were added that name OperatorOS's three closest peers and explain why they are peers, not competitors:

- **Why not AGENTS.md / CLAUDE.md / `.cursorrules`?** — Those are the dominant prose formats. OperatorOS composes with them rather than replacing them; it adds typed, schema-validated contracts on top.
- **Why not chezmoi / Dotbot / GNU Stow?** — Those are dotfile managers. OperatorOS governs what engineer and agent see in the workspace, not which files get synced.
- **Why not Nix Home Manager / devenv / devpod?** — Those are declarative developer environments. OperatorOS governs the workspace they live in; it does not provision packages.

### Landing page (`index.html`)

- `<title>`: `Methodology — OperatorOS` → `OperatorOS — An engineering workspace framework`.
- `<h1>`: `A methodology / for personal / operating systems.` → `An engineering / workspace / framework.`
- `<p class="subtitle">`: simplified to one sentence stating Layer 2 (the promise) + a four-clause mechanism summary (bootstrap / schemas / catalog / CLI).
- All `<meta name="description">`, `<meta property="og:*">`, `<meta name="twitter:*">` updated to match.
- Animation, dark theme, sections, particle background, 3D tilt: preserved unchanged.

### What did NOT change

- `core/` source — zero code changes.
- `schemas/` — zero schema changes.
- `methodology/01-06-*.md` — methodology documents unchanged; methodology is mechanism, not positioning.
- `ROADMAP.md` — unchanged.
- `CONTRIBUTING.md`, `GOVERNANCE.md`, `SECURITY.md` — unchanged.
- All principles, schemas, CLI commands, modules, exports — unchanged.

### Why this is not a v0.7.0 release (and not a v0.8.0 release)

This is a positioning update only; no CLI, schema, or runtime behavior changes. The v0.7.1 sub-release label records that the documentation is now consistent with the validated core promise; a `git tag` is not produced for it. Real version bumps remain gated by binary / schema / methodology changes (per ROADMAP v0.8.0 acceptance criteria).

## [v0.7.0] — 2026-07-14

### Added — Workspace Catalog

This release adds a **durable, content-hash-only Workspace Catalog** and six new CLI commands. The catalog is the project’s first non-trivial runtime tool: it is a metadata inventory of Workspace artifacts that survives across sessions, supports dead-reference detection, and stays compatible with the Local-First principle (no background processes, no telemetry, no usage tracking).

- **`schemas/catalog.schema.json` (new).** JSON Schema 2020-12 defining the on-disk catalog at `.operatoros/index.json`. Six durable fields per entry: `path`, `type` (`file|directory|symlink`), `size` (bytes, `0` for directories), `mtime` (ISO 8601), `content_hash` (SHA-256 hex for files, `""` for directories and symlinks), `indexed_at` (ISO 8601). `additionalProperties: false` forbids any ephemeral field by name — explicitly rejects `opened_count`, `last_access`, `access_count`, and other usage-style fields at the schema level.
- **`core/src/lib/catalog.ts` (new).** `buildCatalog(root)` writes the catalog from a single filesystem walk; `readCatalog(root)` returns it (or `null`) and compares against a fresh re-scan for staleness; `scanFresh(root)` is the read-only walker; `isCatalogStale(catalog, freshEntries)` is a pure helper. Catalog walker skips a `CATALOG_EXCLUDES` denylist (`.git`, `node_modules`, `dist`, `dist-bin`, `build`, `.svelte-kit`, `.vite`, `.cache`, `.operatoros`) so the catalog never includes generated content.
- **`core/src/commands/{index,doctor,stats,stale,prune}.ts` (new).** Six new commands — total CLI surface grows from 7 → 13. See `core/src/cli.ts` header comment for the per-command synopsis.
  - **`operatoros index`** — Rebuilds `.operatoros/index.json` from current filesystem state. Writes the entire catalog (idempotent; overwrites any prior file). Default target: workspace root if `operatoros.yaml` exists, else `cwd`.
  - **`operatoros doctor`** — Read-only workspace diagnostics with three finding codes: `missing-manifest` (no `operatoros.yaml` at workspace root), `missing-layout` (any of the standard layout dirs is absent — informational warning), `missing-catalog` (no catalog yet — informational), `stale-catalog` (catalog exists but filesystem has changed since `indexed_at` — informational warning). Exits `1` only on error-level findings.
  - **`operatoros stats`** — Returns `WorkspaceStats` JSON: `fileCount`, `directoryCount`, `symlinkCount`, `byType`, `totalSize`, optionally `catalogIndexedAt` + `catalogStale` when a catalog exists. Reads catalog for the fast path; falls back to a fresh `scanFresh()` if no catalog yet.
  - **`operatoros stale`** — Lists orphan candidates: catalog entries whose path is not referenced by any other text-format file in the workspace. Reference detection is text-based (substring match on basename). Heuristic output for human review, not an authoritative deletion list.
  - **`operatoros prune`** — Two-phase cleanup with two hard safety invariants: (a) dry-run is the default; `--confirm` is the only way to actually delete; (b) `--confirm` requires explicit `--paths <list>` — refuses to delete a blanket-derived list, preventing implicit mass deletion from a single flag. Files in `CATALOG_EXCLUDES` are always skipped even if explicitly listed.
- **`core/src/commands/init.ts` updated.** `operatoros init` now also generates the catalog as part of scaffolding. The next-steps hint at the end of init advertises `operatoros doctor` and `operatoros stats` (in addition to the existing `validate` and `add`).
- **`core/__tests__/catalog.test.ts` (new, 10 tests).** Schema validity, schema field enumeration, ephemeral-field rejection, `buildCatalog()` output, durable-fields-only entry shape, content-hash SHA-256 stability, ephemeral-directory exclusion, `readCatalog()` fresh + null paths, `isCatalogStale()` correctness across mtime/content changes.
- **`core/__tests__/commands.test.ts` (new, 8 tests).** `index` writes catalog + excludes ephemeral dirs; `doctor` passes when workspace is well-formed, reports when manifest is missing, reports when layout is partial; `stats` returns file count and size breakdown; `stale` returns list shape; `prune --dry-run` does not delete; `prune --confirm` without explicit `--paths` refuses (no implicit blanket deletion).
- **`core/src/cli.ts` updated.** Eight new command declarations (`index`, `doctor`, `stats`, `stale`, `prune`; plus two internal handlers for `stats` and `stale` that print to stdout). CLI surface 7 → 13. `--confirm` flag overrides the default `dryRun=true` in the prune handler (commander coerce).
- **`scripts/embed-assets.js` updated.** Schema-name list extended from `[workspace, module, preset]` to `[workspace, module, preset, catalog]`. Embedded-assets file regenerated to include the new schema (4 schemas embedded instead of 3).

### Changed — Local-First test extended (ROADMAP gate 5)

- **`core/__tests__/local-first.test.ts`** — Local-First invariant test now scans `methodology/` in addition to `core/src/`. Scan is "smart" — only content inside fenced code blocks (lines matching `^```...` open/close pairs) is checked. Plain prose mentions of URLs (e.g., in `docs/tester-packet.md`) remain allowed. ROADMAP gate 5 ("Local-first invariant test still passes AND covers the methodology/ directory") is now satisfied: the new test passes against the current `methodology/` content.

### Not changed

- **`core/src/embedded-assets.ts`** — regenerated (no source change), 4 schemas embedded instead of 3.
- **Existing 7 commands** (`init`, `validate`, `add`, `apply`, `run`, `export`, `version`) — unchanged behavior.
- **Existing 3 schemas** (`workspace`, `module`, `preset`) — byte-identical.
- **All 6 constitutional principles** — unchanged.
- **Methodology documents** — unchanged.

### Migration notes

- **For v0.6.x → v0.7.0 users:** new commands are additive. No CLI command was renamed, removed, or had its flags changed. The catalog is generated automatically on `operatoros init`; run `operatoros index` to build one in an existing workspace, then `operatoros doctor` / `operatoros stats` / `operatoros stale` will start working.
- **For maintainers:** tagged release `v0.7.0` points at the version-bump commit (which includes CHANGELOG + install-script default bumps in addition to the implementation). The implementation lives in `e287e83`. Identity-verified commit per `git-identity-preflight` Steps 1-5; push held per Workspace OS rule.

### Stats

- 5 new commands: `index`, `doctor`, `stats`, `stale`, `prune`. CLI surface 7 → 13.
- 18 new tests (10 catalog + 8 commands); all RED-then-GREEN.
- 1 new schema: `catalog.schema.json` (60 lines).
- 1 new library: `core/src/lib/catalog.ts` (~180 lines, pure functions over filesystem).
- 2 modified commands: `init` (now also builds catalog) + `cli.ts` (registers new commands).
- 1 modified test: `local-first.test.ts` (methodology/ scan).
- 1 modified build script: `scripts/embed-assets.js`.
- Binary delta: still 768 KB single-file bundle (4 schemas embed adds < 2 KB).

### Why v0.7.0 (not v0.6.x)

Per SemVer, additive features that introduce new commands warrant a minor version bump. Adding 6 new commands (37.5% larger CLI surface) and a new schema is the threshold at which "minor" is the conservative call. The release itself is intentional and bounded — see `RATIFICATION.md` §4 (decisions taken in the Workspace Alignment mission) and `decisions.md` decision #6 (schema-versioned additions).

## [v0.6.3] — 2026-07-11

### Changed — repositioning: pure methodology

This release is a **repositioning**, not a feature change. OperatorOS now ships no bundled example modules. The `personal` preset is `modules: []`, so `operatoros apply` succeeds with a friendly hint pointing at `operatoros add <path>`. The methodology documents in `methodology/` remain the canonical guidance; `schemas/module.schema.json` and `CONTRIBUTING.md` §"How to add a module" are the single sources of truth for the module contract.

Rationale recorded in ADR-shape at `~/.project-state/operatoros-quality-borrow-2026-07-11/decisions.md` (Decision 9, status: accepted). Headline reasons:

- **Audience:** target users (5-50 engineers like Taras) already have a workflow; example modules were noise.
- **Single Authority:** examples duplicated what `module.schema.json` + CONTRIBUTING.md already teach.
- **Smaller surface:** ~120 lines removed; the binary shrinks ~4.4 KB (10807 → 6397 bytes for the embedded-assets file).
- **Reverses a v0.5.1-alpha decision** that made the preset install journal+timer for "free working state" — that boost is removed permanently.

### Removed

- **`examples/journal/module.yaml`** — pure bundled example with no longer any deployment path.
- **`examples/timer/module.yaml`** — pure bundled example with no longer any deployment path.
- **`examples/journal/` and `examples/timer/` directories** — empty after file deletion.
- **`examples/README.md`** — listings of journal+timer modules that no longer exist; replaced by `examples/.gitkeep` (empty directory marker) so the directory can host future opt-in modules.
- **`core/src/embedded-assets.ts` — embedded `__embeddedExamples` block.** Now empty `{}` after `scripts/embed-assets.js` re-generation. Idempotent re-build verified.

### Modified

- **`presets-canonical/personal/preset.yaml`** — `modules:` now empty list; description rewritten to point at `operatoros add` rather than at bundled examples.
- **`core/src/commands/init.ts`** — `next steps` console output no longer promises journal/timer examples; instead suggests `operatoros add <path-to-your-first-module>` and points at CONTRIBUTING.md.
- **`core/src/commands/apply.ts`** — empty-preset branch now prints "preset has no modules to install — add one with: operatoros add <path>" (more actionable than previous "preset has no modules to install"). The for-loop is preserved for future presets that DO declare modules.
- **`README.md`** — Quickstart line "Add a module" replaced with a generic `operatoros add <module-source>` and pointer to CONTRIBUTING.md. The "Try it" Step 7 changed from "Run the bundled journal example" to "Add your first module". Section "The artifact" lists `06-decisions-adr.md` among methodology docs and clarifies that the scaffold contains "no bundled modules".

### Migration notes

- **For v0.6.2 → v0.6.3 users:** if you relied on `operatoros apply` installing journal+timer, you must now `operatoros add <journal-source>` and `operatoros add <timer-source>` from your own copies (or fork/author new modules following the contract).
- **For AI agents:** the schema and contributor docs remain the only places to learn the module contract — examples no longer exist.
- **For CI:** test counts unchanged; no test deleted.

### Status

- All 7 CLI commands still present, no breaking changes.
- All 3 JSON-Schema files unchanged.
- All 6 constitutional principles unchanged.
- Embedded assets regenerated with 1 preset + 3 schemas + 0 examples; size: 10807 → 6397 bytes.

## [v0.6.2] — 2026-07-11

### Changed

- **`scripts/install.sh` and `scripts/install.ps1` default version pinned to `v0.6.0`.** Previously defaulted to `v0.5.1-alpha.2` for backward-compat with v0.5.x users. The 6-line-aside comment block justifying the old default is replaced with a 2-line "Override with `OPERATOROS_VERSION` to pin" comment. No effect on users who already set `OPERATOROS_VERSION` explicitly.
- **`operatoros.html`** — Quickstart heading, banner CTA, and footer references bumped from `v0.5.2-alpha` to `v0.6.0`. Sample timestamp `2026-07-02T23-50-00` → `2026-07-11T20-57-00` (matches current date). "Why AI-Native is removed" note in `What this is NOT` adds "Local-First took its place".
- **`CONTRIBUTING.md`** — status banner updated from `v0.5.0-alpha` to `v0.6.0 — methodology pivot`. Clarifies that the process is for code contributors, not for the methodology itself.
- **`GOVERNANCE.md`** — status banner updated to reflect BDFL model active under v0.6.0.
- **`SECURITY.md`** — threat model `In scope` line removes the false `fetching the public module registry over HTTPS` claim and replaces it with a "registry is empty by design" note. The threat model now matches reality (`registry/modules.json` is a placeholder, not a live service).
- **`README.md`** — install snippet `OPERATOROS_VERSION=v0.5.2-alpha` → `OPERATOROS_VERSION=v0.6.0`; comment shortened; "Try it" Step 6 personal-path `/home/taras/projects/operatoros/examples/journal` → `./examples/journal`.
- **`examples/README.md`** — rewritten to lead with `operatoros apply` (the pattern matched by README Quickstart), removes the `/path/to/<repo-root>/examples/journal` copy-paste. Aligns with CHANGELOG v0.5.1-alpha "no git clone step required" intent.
- **`core/src/commands/init.ts`** — stale `v0.5.0-alpha`-in-javadoc and `v0.5.2-alpha`-in-template strings stripped. Functionally identical output.

### Added

- **[`methodology/06-decisions-adr.md`](./methodology/06-decisions-adr.md)** — sixth methodology document. Specifies the **required shape** of `.project-state/<mission-slug>/decisions.md` entries (Context / Decision / Rationale / Alternatives considered / Status), the four statuses (`proposed | accepted | superseded | deprecated`), the cross-reference rules, and worked examples. Extends the existing 8-artifact sprint pattern with a writing convention for decision records. **Does not** redefine `02-doc-lifecycle.md` (state of existing docs) or `01-six-principles.md` (principles themselves). The new doc cross-references both.

- **[`core/__tests__/release-gate.test.ts`](./core/__tests__/release-gate.test.ts)** — codifies ROADMAP v0.7.0 acceptance criteria as vitest test cases. Six gates, one per ROADMAP bullet. Three gates are forward-looking (`it.skip` with reason: external tester, case study, full init→bootstrap.md round-trip) — they do NOT lie-green; they document what's left for v0.7.0. The other three pass today (bootstrap protocol spec, tester-packet artifacts, audit baseline). **The test's intentional FAIL on `Last updated:` field across methodology 01-05 is itself measurement**: maintainer can see exactly which ROADMAP criteria remain unmet.

- **`core/__tests__/local-first.test.ts`** — extended with a `it("(future) extend the scan to methodology/ per ROADMAP gate 5")` placeholder block (currently a no-op `it`), pointing implementers at the next step when first executable content is added to methodology/.

### Migration notes

- **For v0.5.x → v0.6.0 → v0.6.2 users:** no action required. The CLI is functionally identical. The default install version bumps — users who set `OPERATOROS_VERSION` explicitly to `v0.5.x` continue to get `v0.5.x`.
- **For AI agents:** `methodology/06-decisions-adr.md` may now appear in the conditional reading tier. Read it on first encounter with `.project-state/<slug>/decisions.md`.
- **For CI:** the new vitest suite adds 12 test cases (8 passing, 1 measuring-realistic-failure, 3 forward-looking-skipped). CI will surface the measurement failure loudly; this is intentional.

### Status

- All 7 CLI commands still present, no breaking changes.
- All 3 JSON-Schema files unchanged.
- All 6 constitutional principles unchanged.
- 27 existing CLI/parser tests still pass on Node 20.x and 22.x.
- New release-gate test adds 12 cases (8 pass, 1 measures honest-failure-as-signal, 3 skipped-forward-looking).

### Comprehensive cleanup (sweep #2, 2026-07-11)

Triggered by user request "проаналіз усі папки і файли — можливо через зміну напрямку там залишилося багато зайвого шлаку". A complete folder-and-file sweep identified 14 categories of dead-weight; all removed.

**Deleted (4 files, ~5.7K bytes):**
- `.nojekyll` — 0-byte legacy GitHub Pages workaround, no longer used since v0.6.0.1.
- `.github/ISSUE_TEMPLATE/module_proposal.md` — phantom template for a community-module proposal workflow that ROADMAP §"Explicitly not planned" rules out.
- `examples/journal/README.md` — per-module README duplicating `examples/README.md` content with stale `/path/to/this/dir` install command.
- `examples/timer/README.md` — same pattern.

**Modified (~85 lines of stale config removed):**
- `.gitignore` — Python/Go/Rust hypothetical language sections, unused `.coverage*` patterns, Oracle/Terraform hypothetical entries.
- `.gitattributes` — 4 unused binary-format entries (.png/.jpg/.gif/.svg) for image formats the repo never carries.
- `.github/CODEOWNERS` — Phase-1 placeholder lines (Phase 1 never happened; BDFL-only model).
- `.github/workflows/ci.yml` — `secret-scan` job that referenced a non-existent `GITLEAKS_LICENSE` secret and would silently no-op.
- `CODE_OF_CONDUCT.md` — 62-line 4-level enforcement ladder over-engineered for the 5-50 engineer audience (replaced with BDFL escalation via GitHub Security Advisories).
- `CONTRIBUTING.md` — one out-of-scope rationale line in "What NOT to contribute".
- `README.md` — dead `core/dist-bin/` references and a step-3 numbering glitch in "Try it".
- `core/src/commands/init.ts:130` — embedded `v0.5.2-alpha` literal in `renderManifest()` template.

**Net file count in operatoros repo: 63 → 61** (-2).

### Methodology amendment (applied 2026-07-11, mid-sweep)

`methodology/01-six-principles.md`, `methodology/02-doc-lifecycle.md`, and `OPERATING-MODEL.md` were tightened mid-mission to specify: mission artifacts live in the **workspace root** `<workspace-root>/.project-state/<mission-slug>/` — NOT inside any sub-project repository. The pre-existing `.project-state/operatoros-quality-borrow-2026-07-11/` was relocated from inside `operatoros/.project-state/` to `/home/taras/projects/.project-state/operatoros-quality-borrow-2026-07-11/`. Personal-path references to `/home/taras/projects/operatoros/...` in the canonical docs were replaced with `<repo-root>/...` placeholders.

## [v0.6.0.1-stabilize] — 2026-07-11

Post-release stabilization. No code changes; documentation drift fixes only. Triggered by a self-audit (mission `operatoros-v060-audit-2026-07-11`) that found 11 drift issues (4 CRITICAL, 4 HIGH, 3 MEDIUM).

### Changed

- **Principle ordering unified.** All artifacts (README, landing page, OPERATING-MODEL) now list principles in the same canonical order defined by [`methodology/01-six-principles.md`](./methodology/01-six-principles.md): Single Authority → Everything Replaceable → Typed Substrate → Composable → Evidence-Based → Local-First. (Previously: README and landing had Local-First at position 1; methodology had Single Authority at position 1.)

- **README install command version-pinned.** The quick-install snippet now sets `OPERATOROS_VERSION=v0.5.2-alpha` explicitly instead of relying on the install script's default (which is `v0.5.1-alpha.2` for backward compatibility with prior users).

- **README "Try it" section expanded.** Added a 6-step "First 5 minutes" canonical onboarding path. (Was previously just "clone, read, run init" — incomplete.)

- **Local-First principle now cites its enforcement mechanism.** README explicitly references `__tests__/local-first.test.ts` as the test that enforces Local-First.

### Moved

- **`bootstrap.md` → `examples/bootstrap-taras-workspace.md`.** The original `bootstrap.md` at the repository root was a worked example (Taras's Workspace OS), not a generic template. It has been renamed to `examples/` and reframed as a worked example. The generic bootstrap protocol lives at `methodology/04-agent-bootstrap.md`.

### Removed

- **`index.html`** — md5-identical duplicate of `operatoros.html`. Removed to comply with the Single Authority principle. *(Corrected in retrospect on 2026-07-15: GitHub Pages actually requires the file to be named `index.html` at the repo root, not `operatoros.html`. The historical claim "GH Pages serves operatoros.html directly" was incorrect — GH Pages only serves `index.html` at the configured source path. The fix appears in `chore(landing): rename operatoros.html → index.html` on 2026-07-15.)*
- **`presets/`** — legacy directory (only README.md remained; legacy per v0.5.0-alpha). The canonical preset location is `presets-canonical/`.
- **`+ .url`** — Windows copy-paste artifact (0 bytes, never tracked).

### Updated

- **`docs/tester-packet.md`** — `OPERATOROS_VERSION` updated from `v0.5.2-alpha` to `v0.6.0` in 4 install commands (both Unix and PowerShell). The CLI is functionally identical between v0.5.2-alpha and v0.6.0; the bump ensures testers install the version that matches the README and CHANGELOG they will read.
- **[`OPERATING-MODEL.md`](./OPERATING-MODEL.md)** — added explicit "this is a worked example, not the canonical implementation" framing. The previous version presented Taras's Workspace OS paths as if they were the canonical structure.
- **[`ROADMAP.md`](./ROADMAP.md)** — v0.7.0 now has 6 measurable acceptance criteria (was previously 5 activities without criteria).

## [v0.6.0] — 2026-07-11

### Changed

- **Project pivot: from "AI-native personal OS runtime" to "methodology-as-artifact for engineers".** The README, this changelog, and the landing page now describe OperatorOS as a seed for engineers to build their own personal operating system — not a runtime, not an AI agent framework, not a SaaS. This is a positioning pivot, not a feature change: no code is modified, no schemas changed, no CLI commands added or removed. The CLI works exactly as it did in v0.5.2.

- **README rewrite.** The new README has explicit anti-positioning ("What this is NOT"), six principles instead of seven (AI-Native removed in v0.5.2), and a "Who this is for" gate. Target audience: engineers who want their own OS, not universal productivity users.

- **Origin section.** Added an honest narrative about the project's evolution: started as an AI-runtime ambition, didn't ship AI primitives, pivoted to methodology preservation in v0.5.x, formalized as the project's actual purpose in v0.6.0.

### Added

- **[`methodology/`](./methodology/)** directory with five documents:
  - [`01-six-principles.md`](./methodology/01-six-principles.md) — the six constitutional principles, with operational rules and enforcement mechanisms for each.
  - [`02-doc-lifecycle.md`](./methodology/02-doc-lifecycle.md) — the four document states (draft / active / legacy / archived) and the transitions between them.
  - [`03-token-economy.md`](./methodology/03-token-economy.md) — the four reading tiers (bootstrap / conditional / discovery / ignore) and how to apply them to a workspace.
  - [`04-agent-bootstrap.md`](./methodology/04-agent-bootstrap.md) — the protocol an AI agent follows when entering a workspace for the first time.
  - [`05-onboarding-interview.md`](./methodology/05-onboarding-interview.md) — the five questions an agent asks when onboarding, with answer storage in `IDENTITY.md`.

- **[`bootstrap.md`](./bootstrap.md)** at the repository root. This is the file an AI agent reads first when entering a workspace generated by OperatorOS. It declares the four-tier reading system, the onboarding protocol, the mission lifecycle, and the default uncertainty behavior.

  *(Note: as of v0.6.0.1-stabilize, `bootstrap.md` was renamed to [`examples/bootstrap-taras-workspace.md`](./examples/bootstrap-taras-workspace.md) — it is a worked example of Taras's Workspace OS, not a generic template. See `methodology/04-agent-bootstrap.md` for the generic protocol.)*

### Not changed

- `core/` — no code changes. All 27 tests still pass on Node 20.x and 22.x.
- `schemas/` — unchanged.
- `presets-canonical/` — unchanged.
- `examples/` — unchanged.
- `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `GOVERNANCE.md`, `FUNDING.md` — unchanged.

### Migration notes

- **For existing users of v0.5.x:** no action required. The CLI behaves identically. The new `methodology/` documents are reference material, not required reading.
- **For new users:** start with `README.md`, then `methodology/01-six-principles.md`, then `bootstrap.md`. The onboarding interview in `methodology/05-onboarding-interview.md` is optional but recommended.
- **For AI agents:** if you were entering this workspace before v0.6.0, replace your old bootstrap file with the new `bootstrap.md` at the repository root. The conditional tier list has changed.

### Why v0.6.0 (not v0.5.x)

A positioning pivot that changes the project's identity is significant enough to warrant a minor version bump, even when no code changes. v0.6.0 reflects: "the project is now what it always said it was, only more honestly."

## [v0.5.2-alpha] — 2026-07-11

### Changed

- **Identity drift: "AI-Native" → "Local-First".** The Six Principles section
  in README and the landing page no longer claims "AI-Native" as a principle.
  Replaced with **Local-First** because (a) no AI primitives ever shipped in
  Core and (b) Local-First is verifiable by code. The constitutional rule
  (ESSENCE.md §10) is now codified as an invariant enforced by the test
  suite. See the new `__tests__/local-first.test.ts`.

- **`scripts/embed-assets.js` rewritten and made loudly-failing.** Previously
  the script had a broken marker regex (`__EMBEDDED_RUNTIME__` was searched
  but the actual markers were `__EMBEDDED_ASSETS__`/`__EMBEDDED_ASSETS_END__`
  in cli.ts, with no markers at all in `embedded-assets.ts`) — so the ncc
  bundle silently shipped with whatever manual literal happened to be in
  `embedded-assets.ts`, which had drifted from the on-disk presets/schemas/
  examples. The script now uses consistent markers (`__EMBEDDED_RUNTIME__` /
  `__EMBEDDED_RUNTIME_END__` in `embedded-assets.ts`), errors out loudly when
  they go missing, and is fully idempotent (re-runs are no-ops).

- **`scripts/embed-assets.js`: 14 KB of stale manual JSON literals removed.**
  `core/src/embedded-assets.ts` shrunk from 353 lines to 23 (markers only).
  The bundled binary is now guaranteed to ship the same canonical assets
  that the repo ships — no manual sync, no drift.

### Added

- **`__tests__/local-first.test.ts`** — constitutional invariant. Greps every
  `core/src/**/*.ts` file for forbidden network-call primitives
  (`fetch`, `http.request`, `https.get`, `net.connect`, `tls.connect`,
  `dns.lookup`, `axios`, `got`, `node-fetch`, `XMLHttpRequest`,
  `WebSocket`, `EventSource`, etc.). If any are found in Core source,
  the test fails the build with a list of offending lines.

### Fixed

- **`init` command next-steps hint.** Previously told users to run
  `operatoros add <repo-root>/examples/journal`, which assumes the user is
  sitting inside the operatoros-framework checkout. Doesn't work for users
  who `curl | sh` installed the binary. Now points at `operatoros apply`
  (which uses the embedded examples baked into the binary).

- **Landing page (`index.html` / `operatoros.html`): stale numbers.**
  Bumped version 0.5.0 → 0.5.2, test count 24 → 27, "AI-native" → "Local-First",
  references to "without pretending to be a marketplace" → "without pretending
  to be an AI tool", quickstart heading v0.5.1 → v0.5.2.

- **Install scripts (`install.sh` / `install.ps1`).** Default
  `OPERATOROS_VERSION` bumped to `v0.5.2-alpha`. Users who `curl | sh`
  no longer hit the v0.5.0 binary that doesn't match the README docs.

## [v0.5.1-alpha] — 2026-07-10

### Added

- **`examples/timer/`** — second example module demonstrating `settings` (env
  var propagation to spawned commands), positional args (`$1`, `$2` with
  default fallback), and module-local state under `state/timer.log`. Three
  commands: `start`, `stop`, `list`.
- **`run` command: settings env propagation.** Module `settings.*` are now
  injected into the spawned shell as uppercased env vars (e.g. `default_minutes`
  → `$DEFAULT_MINUTES`). Previously documented in the schema but silently
  dropped at runtime.
- **`apply` command: relative-source rewrite.** Relative `./foo` and `../foo`
  module sources are now resolved against the canonical preset.yaml's
  directory and rewritten to absolute paths in the workspace copy, so
  `operatoros apply` keeps working when the workspace is moved outside the
  repo checkout.
- **26th vitest** — `propagates module settings as uppercase env vars`.

### Changed

- **`presets-canonical/personal/preset.yaml`** — `modules: []` → installs
  `journal` + `timer` so `operatoros apply` produces a working state immediately
  (previously no-op'd with "preset has no modules to install").
- **`scripts/install.sh` / `scripts/install.ps1`** — default
  `OPERATOROS_VERSION` bumped from `v0.3.0-alpha` to `v0.5.0-alpha.2`. Users
  who `curl | sh` now get the version that the README documents.
- **`README.md` Quickstart** — rewritten to use `apply` instead of
  `add <repo-root>/examples/journal`. No `git clone` step required; the
  example modules ship inside the binary.

### Removed

- **Stale embedded snapshots** — `core/src/cli.ts` and `core/src/embedded-assets.ts`
  no longer carry hand-maintained preset/schema JSON literals. Dev mode uses
  the filesystem fallback that already existed in `init.ts` / `schema.ts`;
  ncc bundle builds use the build-time `scripts/embed-assets.js` step (which
  was always broken — now correctable in one place).

### Fixed

- **`apply` command: relative `./` source paths** — previously resolved
  against workspace root (broken when source lives outside repo); now resolve
  against the canonical preset.yaml.
- **`run` command: settings env vars** — were declared in schema and module
  examples but silently ignored; now actually injected into the spawned shell.

## [v0.5.0-alpha] — 2026-07-02

### Changed (product hardening)

- **Trimmed to one real preset.** Removed `minimal`, `team-research`, `dev-machine` (boilerplate placeholders). Only `personal` ships; it scaffolds a bare workspace with no installed modules.
- **Trimmed registry to empty by design.** Removed four aspirational entries (`vault`, `git-automation`, `tmux-sessions`, `ai-context`) that pointed to non-existent GitHub repos. The `registry/modules.json` now documents this honestly.
- **Removed `operatoros search`, `operatoros install`, `operatoros upgrade`.** These commands required the registry to have real entries. Modules now ship via the `personal` preset and `operatoros add <path>`.
- **Removed `examples/hello-world/` and `examples/personal-workspace/`** (empty placeholder directories from Phase 0).
- **Removed `docs/`** (MkDocs placeholder directory with no actual content).
- **Removed `contracts/`** (empty directory with a README-only stub).

### Added

- `init` output now prints a working `add` command for the journal example (concrete next step instead of generic "cd into your workspace").
- README.md rewritten to reflect current state (was Phase 0 stale copy).
- CI cache path bug fixed (was failing on Node 22.x with "Some specified paths were not resolved").

## [v0.4.0-alpha] — 2026-07-02

### Added

- `operatoros search [query]` — query the public module registry
- `operatoros install <name>` — install a module by registry name
- `operatoros upgrade <module>` — re-fetch an installed module, preserve `.bak`
- Hooks system — 6 lifecycle events (`pre-init`, `post-init`, `pre-apply`, `post-apply`, `pre-export`, `post-export`)
- Multi-preset support — 4 canonical presets (since removed in v0.5.0)
- `registry/modules.json` with 5 seeded entries (since trimmed to empty in v0.5.0)
- Workspace + preset schemas extended with `settings.hooks`

### Stats

- 10 commands, 32 tests, 785 KB binary, 4 presets, 5 registry entries

## [v0.3.0-alpha] — 2026-07-02

### Added

- `operatoros apply [preset]` — install all modules from a preset
- `operatoros run <module> <cmd> [args]` — dispatch to module commands
- Single-file binary via `@vercel/ncc` bundling (746 KB)
- `scripts/install.sh` (Unix) + `scripts/install.ps1` (Windows) one-liner installers

### Stats

- 6 commands, 18 tests, 764 KB binary asset

## [v0.2.0-alpha] — 2026-07-02

### Added

- `operatoros-core` working CLI: `init`, `validate`, `add`, `export`, `version`
- 3 JSON-Schema definitions (`workspace`, `module`, `preset`)
- 1 example module (`examples/journal`)
- GitHub Actions CI on Node 20.x + 22.x
- vitest test suite

### Stats

- 5 commands, 13 tests

## [v0.1.0-alpha] — 2026-07-02

### Added

- Public GitHub repo (`taras-polishchuk/operatoros-framework`)
- 24-file repository scaffold (README, ROADMAP, CONTRIBUTING, GOVERNANCE, SECURITY, LICENSE, CODE_OF_CONDUCT, CHANGELOG, FUNDING, .github/, etc.)
- `operatoros.html` — single-file landing page (dark theme, no JS)
- GH Pages auto-deploy of the landing page
- MIT LICENSE
- Decision to rename from `AdaptOS` to `OperatorOS` (live product collision on `adaptos.ai`)

[Unreleased]: https://github.com/taras-polishchuk/operatoros-framework/compare/v0.5.0-alpha...HEAD
[v0.5.0-alpha]: https://github.com/taras-polishchuk/operatoros-framework/compare/v0.4.0-alpha...v0.5.0-alpha
[v0.4.0-alpha]: https://github.com/taras-polishchuk/operatoros-framework/compare/v0.3.0-alpha...v0.4.0-alpha
[v0.3.0-alpha]: https://github.com/taras-polishchuk/operatoros-framework/compare/v0.2.0-alpha...v0.3.0-alpha
[v0.2.0-alpha]: https://github.com/taras-polishchuk/operatoros-framework/compare/v0.1.0-alpha...v0.2.0-alpha
[v0.1.0-alpha]: https://github.com/taras-polishchuk/operatoros-framework/releases/tag/v0.1.0-alpha