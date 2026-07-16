# architecture-index

**Tier:** 0 (read-out)
**Q-coverage:** Q3
**Status:** v0.8.0 M1 Stream B

Produces `architecture.md` (a Markdown narrative of the workspace's
high-level structure) and `architecture-index.json` (machine-readable
companion). The `validate` subcommand cross-references every
"this folder is for X" claim against the actual filesystem.

## Subcommands

- `show` — Render `state/architecture.md` + `state/architecture-index.json`.
- `diff --since <ref>` — Diff the architecture index against a git ref.
- `validate` — Cross-reference claims against the filesystem. Conservative:
  flags uncertain matches as "needs human review", not violations.

## Local-First

No network calls. Pure filesystem read + (optional) git diff.

## Usage

```bash
operatoros add architecture-index
operatoros run architecture-index show --target /path/to/workspace
operatoros run architecture-index diff --target /path/to/workspace --since v0.7.0
operatoros run architecture-index validate --target /path/to/workspace
```