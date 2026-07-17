# advisor (v0.8.x candidate)

**Tier:** 0 (read-out, AI-context)
**Q-coverage:** Q1, Q11 (plus partial coverage of Q2, Q3, Q5, Q7)
**Status:** v0.8.x candidate (NOT in v0.8.0 ships-set)

Interactive Q&A over the canonical questions (Q1–Q11 per
`CANONICAL-QUESTIONS-v0.8.0.md`). Synthesizes output from `inspect`,
`context-builder`, and `drift-detector` into one command-line surface.

## Subcommands

- `ask <Q-number> [--target]` — answer one canonical question.
- `list` — show all 11 canonical questions.
- `chat [--target]` — interactive REPL.

## Implemented Q-numbers (v0.8.x candidate)

| Q# | Question | Implementation |
|----|----------|----------------|
| Q1 | What is in this workspace? | file/dir counts + top-level structure |
| Q2 | What is the always-read tier? | presence check for bootstrap/IDENTITY/operatoros.yaml |
| Q3 | Architecture (canonical homes)? | canonical concepts map |
| Q5 | Drift state? | drift-detector invocation |
| Q7 | Structural health? | 4-field presence check |

Q4, Q6, Q8–Q11: defer to existing modules (`context-builder diff`,
`mission-runner list`, `inspect`, `IDENTITY.md` read).

## Promotion path

When all 11 Q-numbers are answered, this module becomes a unified
front-end for the canonical-question taxonomy. Promote via ADR.

## Local-First

No network calls. Pure filesystem read + delegation.

## Usage

```bash
cp -r examples/v080x-candidates/advisor modules/
operatoros run advisor ask Q1 --target /path/to/workspace
operatoros run advisor ask Q5 --target /path/to/workspace
operatoros run advisor list
operatoros run advisor chat --target /path/to/workspace
```