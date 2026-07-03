# Changelog

> **Format:** [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). **Versioning:** [SemVer 2.0](https://semver.org/). **Cadence:** irregular while in alpha.

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