# drift-detector

**Tier:** reference (audit)
**Q-coverage:** Q5, Q6
**Status:** v0.8.0 M3 Stream D

Six per-principle drift checks against the workspace. Produces a structured
Markdown report; `--strict` exits non-zero on any violation.

## Six principle checks

Each per-principle file is independently runnable and reviewable:
`principles/<principle>.sh`. The `check` subcommand invokes them in
order and aggregates into one Markdown report.

1. **Single Authority** — every durable concept has exactly one file
   defining it. Heuristic: detect duplicate `canonical:` / `authority:`
   declarations.
2. **Everything Replaceable** — components are replaceable. Heuristic:
   detect direct cross-module `bin/` path references.
3. **Typed Substrate** — every config has a schema. Heuristic: detect
   orphan YAML configs outside canonical homes.
4. **Composable** — modules compose via catalog/hooks, not direct
   sibling access. Heuristic: detect `../../` references.
5. **Evidence-Based** — every load-bearing claim cites evidence.
   Heuristic: detect `.project-state/<slug>/` without `final-report.md`.
6. **Local-First** — no network primitives in modules. Heuristic:
   detect `curl`, `wget`, `fetch(`, `http://`, `https://`, `node-fetch`.

## Subcommands

- `check [--target] [--format md|json] [--strict]` — full report.
- `diff --since <ref>` — diff against a previous report.
- `gate` — exit 0 only if all six pass.

## Local-First

No network calls. Pure filesystem + grep.

## Usage

```bash
operatoros add drift-detector
operatoros run drift-detector check --target /path/to/workspace
operatoros run drift-detector check --target /path/to/workspace --strict
operatoros run drift-detector gate --target /path/to/workspace
```