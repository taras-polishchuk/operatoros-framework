# Contributing to OperatorOS

> **Note:** This is a Phase-0 incubation. Process is being established. If anything here is unclear, open an issue — your confusion is signal.

## Ground rules

1. **Open an issue before opening a PR** for any non-trivial change. PRs against an unclear goal rarely land.
2. **One concern per PR.** If your change touches Core, presets, and docs, split into three PRs.
3. **No drive-by refactors.** A PR titled "drive-by cleanup" is grounds for close.
4. **Tests are not optional.** If your change can be tested, it must be tested.
5. **Diataxis on every doc change.** Every docs page declares its quadrant in frontmatter (`type: tutorial | how-to | reference | explanation`). CI fails on missing quadrant.

## Areas of contribution (in order of current need)

| Area | What's needed | Where to start |
|---|---|---|
| **Research verification** | Re-confirm `[TRAINING-KNOWLEDGE — verify]` annotations in [PROPOSAL-v0.1.md](../.project-state/operatoros-incubation-kickoff/PROPOSAL-v0.1.md) | Open an issue with the citation link |
| **Module authoring** | Write a `module.yaml` for a real module you use today | `examples/hello-world/` (Phase 1) |
| **Doc additions** | New tutorials, how-tos, references in `docs/` | `docs/` (Diataxis-tagged) |
| **Schema contributions** | Improve `schemas/module.schema.json` or `schemas/preset.schema.json` | `schemas/` |
| **Export modules** | New `mod-export-*` plugins | Phase 2 |
| **Core implementation** | Go/Rust implementation of `operatoros-core` | Phase 1 (no PRs accepted before RFC) |

## Module authoring (5 steps)

> These are *stub* instructions for v0.1.0. Real documentation lands in Phase 1.

1. **Scaffold.** `operatoros new module my-mod --category knowledge` (after Core ships).
2. **Declare contract.** Edit `module.yaml` (name, version, inputs, outputs, depends_on). Run `operatoros validate`.
3. **Implement lifecycle.** Write `init.sh` (install/setup) and `destroy.sh` (cleanup). Idempotent. Log to stderr.
4. **Test.** `operatoros test ./my-mod` runs the module in an ephemeral container with sample inputs; asserts healthcheck passes within `timeout`. Mirrors `helm test`.
5. **Publish.** Tag `v1.0.0`, push to GitHub. CI validates schema + runs tests + signs commit with cosign.

## Commit message format

```
<scope>(<area>): <one-line summary>

[optional body, wrapping at 72 chars]

[optional footer]
```

Scopes: `core`, `cli`, `schema`, `module`, `preset`, `docs`, `infra`, `examples`, `meta`.

Areas (in parens) for the affected package. Examples:

- `module(core): enforce 5k LoC ceiling in CI`
- `docs(explanation): add why-modules explanation page`
- `feat(module): add healthcheck retry policy`

## Code review

- Two core maintainer approvals required for Core changes (one is enough for Phase 0).
- One approval required for module and preset additions.
- Docs and `examples/` changes require one approval.

## Reporting bugs

See [SECURITY.md](SECURITY.md) for *security* issues. For ordinary bugs, open an issue with:

1. **Expected behaviour.** What you wanted.
2. **Actual behaviour.** What happened.
3. **Reproduction.** Minimum viable command(s) to reproduce.
4. **Environment.** OS, OperatorOS version (`operatoros version`), commit SHA.

## Discussions vs Issues

| | Use |
|---|---|
| **Issues** | Concrete bugs, feature requests with PRs attached, schema disputes. |
| **Discussions** | Architecture debates, roadmap questions, "how should we do X". |

## License

By contributing, you agree your contributions are licensed under MIT.
