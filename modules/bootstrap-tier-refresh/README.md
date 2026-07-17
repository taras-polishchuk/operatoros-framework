# bootstrap-tier-refresh

**Tier:** always-read (transactional)
**Q-coverage:** Q2, Q7, Q11
**Status:** v0.8.0 M4 Stream E

Atomically regenerates the four always-read files (`bootstrap.md`,
`IDENTITY.md`, `operatoros.yaml` preset reference, `presets/<active>/preset.yaml`)
using POSIX `mv` (atomic per file on same filesystem) + backup-rollback.

## Atomicity model (B3 revised)

This is **best-effort with rollback**, not "true atomic":
- One `mv` is atomic (POSIX guarantees this on the same filesystem).
- Four sequential `mv`s are not all-or-nothing.
- The user-visible property is *eventual consistency under rollback*: if any
  step fails, no half-written state is observed.

## 4-step transaction

1. Snapshot all four files to `state/bootstrap-tier-refresh/backup-<ts>/`.
2. Render new content for each into sibling temp paths.
3. `mv` each temp → target (atomic per file).
4. Delete backup. On any failure between steps 1–4: restore from backup.

## Why no Core helper

Per B3 (revised): no existing Core primitive to extend. The module owns
the backup-rollback logic; adding a Core helper would not simplify it.

## Subcommands

- `refresh [--target <path>] [--no-backup]` — apply the transaction.
- `diff [--target <path>]` — show what's in scope without writing.

## Mid-write failure validation (Risk 2)

The M4 validation ticket includes a manual eyeball check: chmod-r on the
parent dir between steps 2 and 3, confirm rollback leaves files consistent.
This is per the plan's §6.2 risk register and is not a CI test.

## Local-First

No network calls. Pure POSIX filesystem operations.

## Usage

```bash
operatoros add bootstrap-tier-refresh
operatoros add bootstrap-md    # required dep
operatoros add identity-md     # required dep
operatoros run bootstrap-tier-refresh diff --target /path/to/workspace
operatoros run bootstrap-tier-refresh refresh --target /path/to/workspace
```