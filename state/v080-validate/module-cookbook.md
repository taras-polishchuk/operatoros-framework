# Phase-3 Validation Report — `module-cookbook`

> **Capability:** Module `module-cookbook`
> **Validator:** Hermes (agent-self-validation)
> **Date:** 2026-07-16
> **Status:** PASS (caveat per framework §1.4 test 1).

## Validator identity

- **Name:** Hermes (autonomous agent)
- **Caveat:** Self-validation.

## What was tested

Per plan §4.5 / §7 validation requirements:

| # | Test | Result |
|---|------|--------|
| 1 | After `hello-world`, the produced module validates against `module.schema.json` | PASS — produced `module.yaml` follows schema |
| 2 | `show commands` produces non-empty Markdown containing the word "subcommand" or "command" | PASS |

## Evidence

- Module manifest: `modules/module-cookbook/module.yaml`.
- Implementation: `modules/module-cookbook/bin/{hello-world,show}.sh`.
- 5 docs/topics/*.md (`commands`, `settings`, `hooks`, `requires`, `manifest`).
- `examples/hello-world/` is the canonical pre-built version.
- Local-First test passes.

## Recommendation

PASS for M1 ship. Re-validate by Taras before v0.8.0 tag.

## Known limitations

- `hello-world` writes directly to `examples/hello-world/` (no `--target`
  rewriting of internal paths); if the user copies the scaffold to
  `modules/`, the `module.yaml` `name: hello-world` field should be renamed.
- `show` uses a fixed doc-path resolution (`$(dirname "$0")/../docs/topics/`)
  which assumes the module is installed at its canonical location.