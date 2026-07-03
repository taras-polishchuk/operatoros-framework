# OperatorOS

> **Status:** v0.5.0-alpha · 24 tests passing on Node 20.x and 22.x · MIT licensed

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
# 1. Initialize a workspace (uses the `personal` preset by default)
mkdir ~/my-workspace && cd ~/my-workspace
operatoros init

# 2. Validate the workspace against its JSON-Schema
operatoros validate operatoros.yaml

# 3. Add a module from a local path (the journal example ships with OperatorOS)
operatoros add /path/to/operatoros-framework/examples/journal

# 4. Run a module command
operatoros run journal add "shipped v0.5.0-alpha"

# 5. Export the workspace as a portable bundle (secrets excluded by default)
operatoros export --bundle tar.gz
# → ~/my-workspace-2026-07-02T23-50-00.tar.gz
```

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

## Six principles

1. **Single Authority** — one canonical owner per concept. No dual sources.
2. **Everything Replaceable** — modules, presets, even Core. Nothing is sacred.
3. **Typed Substrate** — JSON-Schema validation at every boundary. Invalid state cannot exist.
4. **AI-Native** — Core ships structured-output primitives, prompt-aware hooks, and module-based LLM integration.
5. **Composable Modules** — one directory, one `module.yaml`, isolated commands.
6. **Profile-portable** — the entire workspace exports to one tarball.

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
| Phase | v0.5.0-alpha (post-hardening) |
| License | MIT (Copyright 2026 Taras Polishchuk) |
| GitHub | github.com/taras-polishchuk/operatoros-framework |
| GH Pages | taras-polishchuk.github.io/operatoros-framework |
| Tests | 24 passing, ~825ms |
| Binary | 768 KB single-file, Node 20+ |
| Registry | empty by design (modules ship via presets + local paths) |

## Contributing

This is an early-phase framework. Process is being established. Open an issue before opening a non-trivial PR. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## License

MIT — see [LICENSE](LICENSE). Copyright 2026 Taras Polishchuk.