# identity-md

**Tier:** always-read (generator)
**Q-coverage:** Q10
**Status:** v0.8.0 M2 Stream C

Walks through the 5 onboarding questions (`methodology/05-onboarding-interview.md`)
and consolidates answers into `IDENTITY.md`. Validates against the methodology's
§5 rules.

## Subcommands

- `init [--target <path>]` — Consolidate latest interview answers into IDENTITY.md.
- `interview [--target <path>]` — Walk the 5 questions; record answers.
- `validate [--target <path>]` — Check IDENTITY.md against §5 rules.

## Vault-leakage guard (I2)

`identity-md` refuses to write `IDENTITY.md` if any answer matches a
secret pattern (`secrets.*`, `vault/`, `.env`, `API_KEY=`, `PASSWORD=`,
`SECRET=`). The `validate` subcommand flags any pre-existing file that
contains the same patterns. See plan amendment I2.

## Local-First

No network calls. Pure filesystem + readline prompts.

## Usage

```bash
operatoros add identity-md
operatoros run identity-md interview --target /path/to/workspace
operatoros run identity-md init --target /path/to/workspace
operatoros run identity-md validate --target /path/to/workspace
```