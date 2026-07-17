# commit-message (v0.8.x candidate)

**Tier:** showcase (workflow)
**Q-coverage:** (workflow, not a canonical-question answerer)
**Status:** v0.8.x candidate (NOT in v0.8.0 ships-set)

Generate Conventional Commits messages from staged git diff.
Pure local, no network.

## Subcommands

- `generate [--target] [--type] [--scope]` — produce message.
- `preview [--target]` — show working-tree changes without staging.

## Heuristic

Detects:
- `type`: from file paths (test files → `test`, README/methodology → `docs`, etc.)
- `scope`: from module path (`modules/bootstrap-md/` → `bootstrap-md`)

Override with `--type` and `--scope`.

## Promotion path

When adopted as a `commit-msg` git hook or as a pre-commit integration,
this module reduces commit-message drift across the team. Promote via ADR.

## Local-First

No network calls. Pure `git diff` + heuristics.

## Usage

```bash
cp -r examples/v080x-candidates/commit-message modules/
git add <files>
operatoros run commit-message generate --target /path/to/repo
operatoros run commit-message preview --target /path/to/repo
```