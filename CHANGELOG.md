# Changelog

> **Format:** [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). **Versioning:** [SemVer 2.0](https://semver.org/). **Cadence:** irregular while in alpha.

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