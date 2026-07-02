# OperatorOS

> **Status:** Phase 2 · v0.4.0-alpha · registry + hooks + multi-preset. 32 tests passing on Node 20.x and 22.x.

**OperatorOS is a personal operating-system framework.** Modules are npm packages. Presets are Helm charts. OperatorOS is the runtime that ships both — for one human, and their agents.

```bash
# v0.4.0-alpha — install (single-file binary, ~768KB)
curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | sh

# use the CLI (now on PATH)
operatoros init --preset personal      # scaffold a workspace (4 presets available)
operatoros apply                        # install preset's modules
operatoros search journal               # search the public registry
operatoros install journal              # install by registry name
operatoros run journal add "..."        # dispatch to module command
operatoros upgrade journal              # re-fetch module, preserve .bak
operatoros validate operatoros.yaml
operatoros export --bundle tar.gz
operatoros version
```

---

## What this is

OperatorOS extracts the universal architecture behind [Workspace OS](../CLAUDE.md) and turns it into a reusable, composable, AI-native framework that any individual (and their agents) can adopt, fork, and ship.

Workspace OS remains the production environment for the author (Taras Polishchuk). OperatorOS becomes the contract that other workspaces can claim.

**Why now.** The personal-workspace-tools landscape (Raycast, Obsidian, Cursor, Hermes, OpenHands, Pi, Omnigent) has exploded — with no unifying framework. OperatorOS aims to be the kernel.

---

## Architecture (one-screen)

```
┌───────────────────────────────────────────────────┐
│                YOUR WORKSPACE                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────┐ │
│  │  Preset      │  │  Preset      │  │  Preset │ │  ← frozen compositions
│  │  personal    │  │  team-research│  │  minimal│ │
│  └──────────────┘  └──────────────┘  └─────────┘ │
│         │                │                │       │
│  ┌──────┴────────────────┴────────────────┘      │
│  │           Module Loader (Core)                │  ← typed, validated
│  │     operatoros-core ≤ 5k LoC, ≤ 20 symbols       │     (inputs, outputs, schema)
│  └─────────────────────┬─────────────────────────┘
│        ┌───────────────┼──────────────────┐
│        ▼               ▼                  ▼
│   mod-github       mod-journal       mod-discord
│   mod-export-static mod-export-llm-bundle mod-export-docker
│         ↓               ↓                  ↓
│     dist/, oci://,      single-file LLM context, terraform
└───────────────────────────────────────────────────┘
```

**Core principles (pinned, not aspirational):**

1. **Small Core.** ≤ 5k LoC, ≤ 20 public symbols, ≤ 8 CLI subcommands in v1.
2. **Composable Modules.** Forced contract: `(inputs, outputs, schema)` only — no shared state.
3. **AI Native.** Typed schemas · structured `operatoros doctor` · `operatoros export --llm-bundle`.
4. **One authority per thing.** Explicit `authority.toml` names the canonical source per subsystem.
5. **Replaceable.** Modules and presets are replaceable; Core API is the contract.
6. **Paired.** Ship Core + canonical `personal` preset in the same v0.1.0 release.

---

## Status

| | |
|---|---|
| Phase | 0 (incubation kickoff) |
| License | MIT (proposed) |
| GitHub org | TBD (reserved: `operatoros-framework`) |
| Domain | `operatoros.dev` (proposed) |
| v0.1.0 | Not yet released — see [PROPOSAL-v0.1.md](../.project-state/operatoros-incubation-kickoff/PROPOSAL-v0.1.md) |
| Docs engine | MkDocs Material (proposed) |

---

## Read more

- [PROPOSAL-v0.1.md](../.project-state/operatoros-incubation-kickoff/PROPOSAL-v0.1.md) — full first proposal (vision, layout, module system, presets, export, OSS strategy, docs, landing, roadmap).
- [RESEARCH-SYNTHESIS.md](../.project-state/operatoros-incubation-kickoff/research/RESEARCH-SYNTHESIS.md) — synthesis of 3 background research reports.
- [contracts/module.md](contracts/module.md) — module contract (when written, Phase 1).
- [contracts/preset.md](contracts/preset.md) — preset contract (when written, Phase 1).

---

## Contributing

This is an early-phase framework; expectations are still being set. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or PR.

## License

MIT. See [LICENSE](LICENSE).

## Code of Conduct

OperatorOS has adopted the Contributor Covenant v2.1. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Security

See [SECURITY.md](SECURITY.md) for how to report vulnerabilities.

---

## Naming

**OperatorOS** is the canonical name (locked 2026-06-30). All previous collision concerns around the legacy `AdaptOS` name have been resolved by the rename. The name `OperatorOS` was probed across:

- GitHub repos: `operatoros/operatoros` slot free (404)
- Package registries: PyPI / npm / crates all clear
- Domains: `operatoros.dev` / `.com` / `.io` / `.ai` all free (DNS status 0 NOERROR)
- Active competitors: none in the same vertical

See `.project-state/operatoros-phase16-confirm-rename/decisions.md` for the full probe matrix and rationale.
