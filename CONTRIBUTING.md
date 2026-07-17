# Contributing to OperatorOS

> **Status:** v0.8.0 — 10-ship milestone. Process is for contributors, not for the methodology itself.

## Ground rules

1. **Open an issue before opening a PR** for any non-trivial change.
2. **One concern per PR.** If your change touches Core, presets, and docs, split into three PRs.
3. **No drive-by refactors.** A PR titled "drive-by cleanup" is grounds for close.
4. **Tests are not optional.** If your change can be tested, it must be tested.
5. **If a feature is not implemented, don't pretend it is.** Aspirational registry entries, empty example directories, and placeholder READMEs will be removed on sight.

## How to propose a capability

A capability is a unit of workspace behavior that answers a canonical
question (Q1–Q11). The capability selection framework is the 6-gate
decision tree documented at [`methodology/07-capability-selection.md`](methodology/07-capability-selection.md).

To propose a new capability:

1. **Identify the canonical question.** Map your proposal to one of Q1–Q11
   from [`CANONICAL-QUESTIONS-v0.8.0.md`](./docs/internal/architecture/CANONICAL-QUESTIONS-v0.8.0.md).
   If it doesn't map, it's a utility, not a capability — propose it
   elsewhere.

2. **Walk the 6 gates.**
   - Gate 1 — canonical question (yes).
   - Gate 2 — layer fit (Core vs Module, no duplication).
   - Gate 3 — principle compliance (six principles, see methodology/01).
   - Gate 4 — tier placement (always-read / tier-0 / reference / transactional / showcase).
   - Gate 5 — phase-3 validation (a non-proposer engineer runs it).
   - Gate 6 — architecture-fit (no violation of the 17 §6 frozen decisions).

3. **File a capability proposal issue** using the capability-proposal
   issue template (see `.github/ISSUE_TEMPLATE/`). Include:
   - The canonical question it answers.
   - The layer + tier placement.
   - The principle-compliance checklist.
   - The proposed module manifest (sketch of `module.yaml`).

4. **Defer-to-decision.** A capability that fails any gate is
   deferred to a later version. Adding to the v0.8.x ships-set
   requires an ADR per the architecture freeze §8.4.

See [`CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md`](./docs/internal/architecture/CAPABILITY-SELECTION-FRAMEWORK-v0.8.0.md) for the full framework.

## How to add a module

A module is a directory with a `module.yaml` at its root. The contract is defined by [schemas/module.schema.json](schemas/module.schema.json).

```bash
# 1. Create the module directory
mkdir my-module && cd my-module

# 2. Write module.yaml
cat > module.yaml <<'EOF'
version: "0.2"
name: my-module
description: "What this module does (one sentence)"
author: "Your Name"
license: MIT
commands:
  hello:
    run: "echo hello $@"
    description: "Says hello to the given name"
EOF

# 3. Validate against the schema
operatoros validate module.yaml

# 4. Install it into a workspace
cd /path/to/workspace
operatoros add /path/to/my-module

# 5. Run it
operatoros run my-module hello "world"
```

Modules can declare multiple `commands`. Each command's `run` is a shell command line; `$1`, `$2`, ..., `$@` are positional args (shell-expanded). The command runs with `cwd` set to the module directory.

## How to add a preset

A preset is a YAML file in `presets/<name>/preset.yaml`. The contract is defined by [schemas/preset.schema.json](schemas/preset.schema.json).

```yaml
version: "0.2"
name: my-preset
description: "What this preset is for"
modules: []   # currently empty by design — use `operatoros add` directly
settings:
  vault_path: vault/
  state_path: state/
  hooks:
    post-apply:
      - "echo 'my-preset applied'"
  export:
    deny:
      - "vault/**"
      - "**/.env"
      - "**/*.sqlite"
```

Currently only the `personal` preset ships with OperatorOS. Add more by editing `operatoros.yaml` and pointing it at your preset's directory.

## How to file a bug

Use the [bug report issue template](.github/ISSUE_TEMPLATE/bug_report.md). Include:

- `operatoros version` output
- Steps to reproduce
- Expected vs actual behavior
- Relevant logs (with secrets redacted)

## How to file a security issue

**Do not file security issues publicly.** See [SECURITY.md](SECURITY.md) for the private reporting path.

## Code style

- TypeScript for Core. `tsc --noEmit` must be clean.
- Test with `vitest`. New commands must have at least one smoke test.
- Schemas are JSON Schema 2020-12 draft. Validate them with `ajv` before committing.

## What NOT to contribute

Until the project has real external users, please don't propose:

- Cloud features
- Marketplace / registry population (the registry is empty by design)
- Telemetry
- Web UI
- Module signing

These may be added later. For now, they're explicitly out of scope. See [ROADMAP.md](ROADMAP.md) for the criteria new features must meet.

## Maintainer note — tester packet

`docs/tester-packet.md` is the maintainer's personal runbook for inviting a specific tester to run the first-use flow and report back. It is **not** framework documentation; it lives at the framework repo for convenience only. If you fork OperatorOS and become the maintainer of your own instance, write your own runbook and either replace this one or leave it as-is. Do not treat the runbook's macOS-first scenario or specific tester-wording as canonical guidance for the project.