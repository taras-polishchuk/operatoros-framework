# workspace-census

**Tier:** 0 (read-out)
**Q-coverage:** Q5
**Status:** v0.8.0 M1 Stream B

Walks the workspace, classifies files by kind, surfaces orphans and
anomalies. Read-only — never deletes or modifies files (per freeze §6
Decision 5).

## Subcommands

- `census` — File-kind breakdown (extensions, counts, top-level dirs).
- `orphans` — Heuristic orphan detection: text files with no other
  workspace file referencing their name.
- `anomalies` — Pattern-match secret-ish or stale files
  (`.env.*.local`, `*.pem`, `secrets.*.bak`, etc.).

## Local-First

No network calls. Pure filesystem read + grep.

## Usage

```bash
operatoros add workspace-census
operatoros run workspace-census census --target /path/to/workspace
operatoros run workspace-census orphans --target /path/to/workspace
operatoros run workspace-census anomalies --target /path/to/workspace
```