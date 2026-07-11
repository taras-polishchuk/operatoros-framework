# OperatorOS

> **Status:** v0.5.2-alpha · 27 tests passing on Node 20.x and 22.x · MIT licensed

OperatorOS is a CLI for managing personal operating-system workspaces — your scripts, notes, secrets, and tools, organized into a typed, composable, version-controlled structure you can back up, share, and extend.

The framework extracts the universal architecture behind Taras Polishchuk's production Workspace OS into a reusable runtime.

## Install

**Recommended — single-file binary (Node 20+ required):**

```bash
curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | sh
```

**Windows (PowerShell):**

```powershell
iwr https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.ps1 | iex
```

**From source:**

```bash
git clone https://github.com/taras-polishchuk/operatoros-framework
cd operatoros-framework/core
npm install && npm run build
node dist/cli.js version
```

## Quickstart

```bash
# 1. Install (one line, single-file binary)
curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | sh

# 2. Scaffold a workspace
mkdir ~/my-workspace && cd ~/my-workspace
operatoros init

# 3. Apply the default preset — installs two example modules (journal + timer)
operatoros apply

# 4. Try them
operatoros run journal add "shipped v0.5.1-alpha"
operatoros run timer start "deep work" 50
operatoros run timer start "defaulted task"     # falls back to $DEFAULT_MINUTES from settings
operatoros run timer list

# 5. Backup the whole thing (deny-list strips secrets automatically)
operatoros export --bundle tar.gz
# → ~/my-workspace-2026-07-02T23-50-00.tar.gz
```

The `personal` preset that ships with OperatorOS installs two example modules
(`journal` + `timer`) so step 3 produces a working state immediately. No
`git clone` required — the example modules ship inside the binary.

## Commands

| Command | Purpose |
|---|---|
| `operatoros init` | Scaffold a new workspace |
| `operatoros validate <path>` | Validate YAML against JSON-Schema |
| `operatoros add <source>` | Install a module from a local path or git URL |
| `operatoros apply [preset]` | Install all modules declared in a preset |
| `operatoros run <module> <cmd>` | Execute a module's declared command |
| `operatoros export` | Pack workspace into a portable bundle |
| `operatoros version` | Print version + git info |

7 commands. Each one does one thing. Run `operatoros --help` for the full surface.

## Architecture

```
┌────────────────────────────────────────────┐
│              Workspace                     │
│  ┌─────────┐  ┌─────────┐  ┌───────────┐  │
│  │ Module  │  │ Module  │  │ Preset    │  │
│  │ journal │  │ (yours) │  │ personal  │  │
│  └─────────┘  └─────────┘  └───────────┘  │
│         \         |          /            │
│  ┌─────────────────────────────────────┐  │
│  │   Core (operatoros-core v0.5.0)     │  │
│  │   - JSON-Schema validation (ajv)    │  │
│  │   - Hook runner                     │  │
│  │   - Export with deny-list           │  │
│  └─────────────────────────────────────┘  │
│         |                                 │
│  ┌─────────────────────────────────────┐  │
│  │   Persistence                       │  │
│  │   operatoros.yaml, module.yaml,    │  │
│  │   preset.yaml, tar.gz exports       │  │
│  └─────────────────────────────────────┘  │
└────────────────────────────────────────────┘
```

Every manifest is validated against a JSON Schema (2020-12) at every CLI boundary. Modules declare their contract in `module.yaml`. Presets compose modules + settings + lifecycle hooks. Export packs everything except what you told it to deny.

## Six invariants

OperatorOS is built on six invariants. Each is enforced by the test suite, not
just declared in a doc. If you change one, the corresponding test fails and
forces a re-evaluation of the principle.

1. **Single Authority** — one canonical owner per concept. Drift between two
   files defining the same thing is treated as a bug. (Enforced by
   CI cross-link checks in `core/__tests__`.)
2. **Everything Replaceable** — modules, presets, even Core. Nothing is
   sacred. A user can replace the entire Core implementation by swapping
   out the binary; the JSON Schema contracts and on-disk layout stay stable.
3. **Typed Substrate** — every artifact (workspace, module, preset
   manifests) is validated against a JSON Schema 2020-12 at every CLI
   boundary. Invalid state cannot exist on disk.
4. **Local-First** — OperatorOS Core runs entirely on the user's local
   filesystem. **It never makes a network call.** Not for telemetry, not for
   remote schema lookup, not for module fetch, not for auto-update. The
   `__tests__/local-first.test.ts` suite greps the binary for forbidden
   network APIs and fails the build if any are found.
5. **Composable Modules** — a module is one directory, one `module.yaml`,
   isolated commands, runs in its own shell process. Replace by overwriting
   the directory.
6. **Profile-portable** — the entire workspace exports to one tarball via
   `operatoros export`, with an opt-out deny-list that excludes secrets,
   key files, and SQLite databases by default.

## Why "Local-First" instead of "AI-Native"

Earlier versions of OperatorOS listed "AI-Native" as a principle, citing
"agent-loop primitives, structured-output validation, and prompt-template
versioning." In v0.5.2 we replaced that with **Local-First** because:

- No actual AI primitives ever shipped in Core (the "AI-Native" claim was
  aspirational and is the kind of marketing-without-anchored-source
  drift that the ESSENCE audit of 2026-07-03 flagged as a category error).
- Local-First is verifiable by a single grep test and is what we already
  do — the rule was implicit; the v0.5.2 change makes it explicit.

If/when OperatorOS ships an opt-in local LLM integration (Ollama-style,
no cloud calls), the JSON Schema for `module.yaml` already supports
declaring it as `requires.modules` — the principle doesn't need to change.

## Project layout

```
operatoros-framework/
├── core/                 # OperatorOS Core CLI (TypeScript)
├── schemas/              # JSON Schema 2020-12 definitions
├── presets-canonical/    # Canonical presets (personal)
├── examples/             # Example modules (journal)
├── registry/             # Public module registry (currently empty)
├── scripts/              # Install scripts (Unix + Windows)
├── operatoros.html       # Single-file landing page
├── README.md             # This file
├── ROADMAP.md            # Roadmap (current state)
├── CHANGELOG.md          # Version history
├── CONTRIBUTING.md       # How to contribute
├── GOVERNANCE.md         # Decision-making
└── SECURITY.md           # Vulnerability disclosure
```

## Documentation

- **[Quickstart](#quickstart)** (above) — install + first 5 commands
- **[ROADMAP.md](ROADMAP.md)** — what's been built and what's next
- **[CHANGELOG.md](CHANGELOG.md)** — release history
- **[CONTRIBUTING.md](CONTRIBUTING.md)** — how to add a module, file a PR, report a bug
- **[GOVERNANCE.md](GOVERNANCE.md)** — BDFL model + transition plan
- **[SECURITY.md](SECURITY.md)** — vulnerability disclosure
- **[schemas/](schemas/)** — the contracts for `operatoros.yaml`, `module.yaml`, `preset.yaml`

## Status

| | |
|---|---|
| Phase | v0.5.2-alpha |
| License | MIT (Copyright 2026 Taras Polishchuk) |
| GitHub | github.com/taras-polishchuk/operatoros-framework |
| GH Pages | taras-polishchuk.github.io/operatoros-framework |
| Tests | 27 passing, ~900ms |
| Binary | 768 KB single-file, Node 20+ |
| Registry | empty by design (modules ship via presets + local paths) |
| Example modules | `journal` (single command, no state), `timer` (settings + 3 commands + state) |
| Local-First invariant | enforced by `__tests__/local-first.test.ts` (zero network calls) |

## Contributing

This is an early-phase framework. Process is being established. Open an issue before opening a non-trivial PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT — see [LICENSE](LICENSE). Copyright 2026 Taras Polishchuk.