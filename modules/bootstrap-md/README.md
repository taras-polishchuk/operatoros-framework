# bootstrap-md

**Tier:** always-read (generator)
**Q-coverage:** Q2
**Status:** v0.8.0 M2 Stream C

Renders `bootstrap.md` from a five-section template (per
`methodology/04-agent-bootstrap.md`). Reads the workspace's current
preset + modules to populate the always-read tier accurately.

## Behavior

- Replaces the in-binary `init.ts:renderBootstrap()` generator when
  installed (per B2 amendment: first `init` uses in-binary fallback;
  after `add bootstrap-md`, subsequent `init --force` delegates).
- Writes atomically (temp → mv). Keeps a history of backups in
  `state/bootstrap-md/history.jsonl`.
- Local-First: no network calls.

## Subcommands

- `render [--target <path>]` — Render `bootstrap.md`.
- `template` — Print the canonical five-section template.

## Usage

```bash
operatoros add bootstrap-md
operatoros run bootstrap-md render --target /path/to/workspace
operatoros run bootstrap-md template
```