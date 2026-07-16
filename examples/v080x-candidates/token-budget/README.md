# token-budget (v0.8.x candidate)

**Tier:** always-read (governance)
**Q-coverage:** Q7
**Status:** v0.8.x candidate (NOT in v0.8.0 ships-set)

Measure the token cost of the always-read tier
(`bootstrap.md` + `IDENTITY.md` + `operatoros.yaml`).
Warn if it exceeds the budget (default: 3000 tokens).

## Why this matters

`bootstrap.md` is the front door for every AI agent entering the
workspace. Per `methodology/04-agent-bootstrap.md`, it should stay
"~1-2K tokens". This module enforces that as a measurable invariant.

## Subcommands

- `measure [--target <path>] [--budget <n>]` — measure tier cost.
- `budget [--target <path>]` — show budget configuration.

## Approximation

Uses ~4 chars per token approximation. For exact counts, integrate
a tokenizer (`gpt-tokenizer`, `tiktoken`, etc.) — but as a guardrail
the approximation is sufficient.

## Promotion path

Once integrated into the always-read tier's commit-gate (run on
every commit that touches bootstrap.md or IDENTITY.md), this module
becomes load-bearing for the methodology-as-code promise. Promote
to `modules/` via an ADR.

## Local-First

No network calls. Pure `wc -c` + arithmetic.

## Usage

```bash
cp -r examples/v080x-candidates/token-budget modules/
operatoros run token-budget measure --target /path/to/workspace
operatoros run token-budget measure --target /path/to/workspace --budget 4000
operatoros run token-budget budget --target /path/to/workspace
```