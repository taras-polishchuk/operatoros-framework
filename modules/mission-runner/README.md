# mission-runner

**Tier:** reference (methodology)
**Q-coverage:** Q8
**Status:** v0.8.0 M3 Stream D

Scaffolds and validates the canonical 8-artifact mission directory at
`.project-state/<slug>/`:

1. `source-task.md` — mission definition
2. `progress.md` — milestone tracker
3. `decisions.md` — D-N decisions log
4. `blockers.md` — Taras-side blocker tickets
5. `artifacts.md` — files produced
6. `environment.md` — host/git/tooling baseline
7. `execution-log.md` — chronological log
8. `final-report.md` — completion report

Per `methodology/06-decisions-adr.md` and `mission-execution-model`.

## Subcommands

- `init <slug> [--objective]` — Scaffold the 8 files.
- `list` — List existing missions.
- `validate <slug>` — Check all 8 files present.
- `archive <slug>` — Move to `.project-state/archive/`.

## Local-First

No network calls. Pure filesystem mkdir + write.

## Usage

```bash
operatoros add mission-runner
operatoros run mission-runner init my-mission --target /path/to/workspace
operatoros run mission-runner validate my-mission --target /path/to/workspace
operatoros run mission-runner list --target /path/to/workspace
operatoros run mission-runner archive my-mission --target /path/to/workspace
```