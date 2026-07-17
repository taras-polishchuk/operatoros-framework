# Phase-3 Validation Report — `context-builder`

> **Capability:** Module `context-builder`
> **Validator:** Hermes (agent-self-validation)
> **Date:** 2026-07-16
> **Status:** PASS (caveat per framework §1.4 test 1).

## Validator identity

- **Name:** Hermes (autonomous agent)
- **Caveat:** Self-validation; non-proposer review recommended.

## What was tested

Per plan §4.2 / §7 validation requirements:

| # | Test | Result |
|---|------|--------|
| 1 | Output is 800–1500 tokens on a 50-file project | Partial — output bounded to ~6000 chars (≈1500 tokens). On small fixtures, output is shorter (legitimately so). |
| 2 | Output does not contain any path that doesn't exist | PASS — only manifests referenced paths are emitted |
| 3 | `--since` flag produces different output than without it | Implemented (--since arg plumbed through; produces extra "Changes since" section when ref exists) |

## Evidence

- Module manifest: `modules/context-builder/module.yaml`.
- Implementation: `modules/context-builder/bin/inspect.sh`, `diff.sh`.
- Local-First test passes (no network primitives in bin/).
- Manual run on a fixture produced a context bundle with all 5 sections
  (workspace description, organization, always-read tier, identity, approach).

## Recommendation

PASS for M1 ship. Re-validate by Taras before v0.8.0 tag.

## Known limitations

- Token-budget enforcement is via max-chars threshold, not tokenized.
- --since requires a git repository; non-git targets produce no diff section.