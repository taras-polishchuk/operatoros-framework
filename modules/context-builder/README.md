# context-builder

**Tier:** 0 (read-out)
**Q-coverage:** Q1, Q11
**Status:** v0.8.0 M1 Stream B

Renders a deep context bundle (800–1500 tokens) for an AI agent
handed the workspace with no prior knowledge. Consumes the catalog,
key manifest files, and (optionally) a git ref to produce a Markdown
narrative.

## Subcommands

- `inspect` — Render the full context bundle.
- `diff --since <ref>` — Show changes since the given git ref, in
  context-bundle format.

## Local-First

No network calls. Pure filesystem read + git invocation.

## Usage

```bash
operatoros add context-builder
operatoros run context-builder inspect --target /path/to/workspace
operatoros run context-builder diff --target /path/to/workspace --since HEAD~3
```