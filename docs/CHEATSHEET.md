# OperatorOS v0.8.4 — Cheatsheet

> **One-page reference for every Core command, the 9 ships-modules, common
> recipes, environment variables, and troubleshooting.**
>
> Print this. Pin it to your monitor. Default lookup before touching code.

---

## 1. The 14 Core commands

| Command | What it does | Flags |
|---|---|---|
| `init` | Scaffold a new workspace (default preset: `personal`). | `--target <path>`, `--preset <name>`, `--personal`, `--force` |
| `validate <path>` | Check a workspace/module/preset against its JSON-Schema. | `--schema <name>` |
| `add <source>` | Install a module. `<source>` is a path, git URL, or bare name. | `--name <name>`, `--pin <ref>` |
| `apply [preset]` | Apply a preset — install all its modules. | — |
| `run <module> <cmd> [args]` | Execute a command from an installed module. | `--target <path>` |
| `export` | Export the workspace as a portable bundle. | `--bundle <fmt>`, `--out <path>`, `--include-secrets` |
| `version` | Print Core version + git SHA + node version. | — |
| `inspect` | Three-section workspace report (inventory / cold-read / gaps). | `--target <path>`, `--format <md\|json\|terminal>`, `--no-bootstrap` |
| `index` | Rebuild the Workspace Catalog (`.operatoros/index.json`). | `--target <path>`, `--force` |
| `doctor` | Workspace health checkup. | `--target <path>` |
| `stats` | File count + size + type breakdown. Reads catalog if present. | `--target <path>` |
| `stale` | List orphan artifacts (no refs in workspace, not in denylist). | `--target <path>` |
| `prune` | Delete confirmed orphans. Dry-run by default. | `--target <path>`, `--confirm`, `--paths <list>` |
| `help` | List commands. | — |

The `install` alias exists for `add` (visitor-intuitive name). `add` works
with: absolute paths (`/abs/path`), relative paths (`./modules/foo`),
bare names (resolved against `./<name>` and `./modules/<name>`), and
git URLs (`https://github.com/me/repo.git --pin v1.0.0`).

---

## 2. The 9 ships-modules (v0.8.0 ships-set)

All 9 install automatically when you run `operatoros apply personal`.
Run them with `operatoros run <module> <command>`.

| Module | What it does | Command |
|---|---|---|
| `bootstrap-md` | Renders a 5-section `bootstrap.md` from preset + IDENTITY.md + installed modules. Replaces the in-binary fallback. | `operatoros run bootstrap-md render` |
| `identity-md` | Walks the 5-question onboarding interview, writes `IDENTITY.md` (with vault-leakage guard). | `operatoros run identity-md init` |
| `context-builder` | Builds a 800–1500-token context bundle for an AI agent handed the workspace cold. | `operatoros run context-builder inspect` |
| `workspace-census` | File-kind breakdown, orphan detection, secret-pattern anomaly scan. | `operatoros run workspace-census census` |
| `architecture-index` | Produces `state/architecture.md` + `state/architecture-index.json` with claim-by-claim validation. | `operatoros run architecture-index show` |
| `module-cookbook` | Scaffolds the `hello-world` example; prints topical help. | `operatoros run module-cookbook show commands` |
| `drift-detector` | Six per-principle drift checks (single-authority, locally-stored, etc.). | `operatoros run drift-detector check` |
| `mission-runner` | Scaffolds the canonical 8-artifact mission directory `.project-state/<slug>/`. | `operatoros run mission-runner init <slug>` |
| `bootstrap-tier-refresh` | On-demand bootstrap.md regeneration tied to drift detection. | `operatoros run bootstrap-tier-refresh refresh` |

All modules receive these env vars when run: `WORKSPACE_ROOT`,
`MODULE_DIR`. Plus any `settings:` from the module's `module.yaml`
as `SCREAMING_SNAKE_CASE` env vars.

---

## 3. Common recipes

### First 5 minutes

```bash
# (1) Install the binary
curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | bash

# (2) Create a workspace (uses default `personal` preset)
operatoros init --target ~/projects/my-os

# (3) Install all 9 modules + render bootstrap.md
cd ~/projects/my-os
operatoros apply
operatoros run bootstrap-md render

# (4) Fill in your identity (5 questions)
operatoros run identity-md init
# (interactive — answer; writes IDENTITY.md)

# (5) Check workspace health
operatoros doctor
operatoros inspect --format terminal
```

### Add a single module from a local path

```bash
operatoros add /home/me/my-module-dir
# or from git:
operatoros add https://github.com/me/my-module.git --pin v0.1.0
# or by name if ./modules/<name>/ exists:
operatoros add my-module
```

### Validate before committing

```bash
operatoros validate operatoros.yaml    # workspace
operatoros validate ./modules/my-module --schema module
operatoros validate ./presets/personal/preset.yaml --schema preset
```

### Export the workspace as a portable bundle

```bash
operatoros export -o ~/backups/my-os.tar.gz
# Default: tar.gz with vault/** + .env* + sqlite + id_rsa denied
operatoros export --include-secrets    # include secret files
```

### Re-render bootstrap.md when you change presets or modules

```bash
operatoros run bootstrap-md render
# writes to ./bootstrap.md; backs up existing to ./state/bootstrap-md/
```

### Run a one-off architecture audit

```bash
operatoros run drift-detector check              # 6 principle checks
operatoros run architecture-index show           # claim-by-claim
operatoros run workspace-census census           # file-kind breakdown
```

### Run a multi-hour mission autonomously

```bash
operatoros run mission-runner init my-mission
# creates .project-state/my-mission/ with 8 canonical artifacts
# then follow the canonical 8-artifact pattern from there
```

---

## 4. Environment variables (auto-injected)

When a module script runs via `operatoros run <module> <cmd>`:

| Variable | Value | Use |
|---|---|---|
| `WORKSPACE_ROOT` | Absolute path to the workspace root | All `cd` / `path` operations |
| `MODULE_DIR` | Absolute path to the module's install dir | Module-internal references |

Plus any `settings:` keys from `module.yaml`, upper-cased:
`default_minutes: 25` → `$DEFAULT_MINUTES=25`.

To override install location:
- `OPERATOROS_INSTALL_DIR=<path>` (default: `~/.local/bin`)
- `OPERATOROS_VERSION=v0.8.4` (default)
- On Windows PowerShell: `$env:OPERATOROS_VERSION = "v0.8.4"`

---

## 5. File layout reference

A working workspace contains:

```
my-os/
  operatoros.yaml            # workspace manifest (preset, modules, settings)
  bootstrap.md               # always-read tier — entry point for AI agents
  IDENTITY.md                # always-read tier — engineer self-description
  presets/
    personal/preset.yaml     # mirror of canonical preset
    README.md
  modules/                   # 9 ships-modules installed by `apply`
    bootstrap-md/
      module.yaml
      bin/render.sh
      README.md
    identity-md/
      ...
    <one dir per module>
  schemas/                   # JSON Schemas (validated by `validate`)
    README.md
  state/                     # mutable runtime state (catalog, drift reports)
    .operatoros/index.json   # Workspace Catalog
    drift-detector/*.md      # drift reports
  vault/                     # encrypted secrets (denylist in export)
    README.md
  .operatoros/
    index.json               # durable Workspace Catalog
```

---

## 6. Troubleshooting

### `operatoros: command not found`

After install, the binary lives at `~/.local/bin/operatoros` on Linux/macOS
or `%USERPROFILE%\.local\bin\operatoros.cmd` on Windows. Add to PATH:

```bash
# bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc

# zsh (macOS default)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# PowerShell (Windows)
[Environment]::SetEnvironmentVariable('PATH', "$env:USERPROFILE\.local\bin;$env:PATH", 'User')
# then open a new PowerShell
```

### `error: unknown command 'install'`

Your binary is older than v0.8.3. Reinstall:

```bash
curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | bash
```

### `bash: set: Illegal option -o pipefail` (curl ... | sh on Linux)

`/bin/sh` on Debian/Ubuntu/Alpine is dash, not bash. Use `bash` not `sh`:

```bash
curl -fsSL ... | bash          # correct
curl -fsSL ... | sh            # breaks on Debian-family
```

### `module not installed: <name>`

Run `operatoros add <path>` first, or run `operatoros apply` to install
all preset modules. If you see this from `operatoros run <module> <cmd>`,
the module was deleted from `modules/` but left in `operatoros.yaml`.

### `source not found: <path>` (when running `add`)

Use an absolute path, a relative path with `./`, or a git URL:

```bash
operatoros add ./modules/my-module        # relative
operatoros add /abs/path/to/module         # absolute
operatoros add https://github.com/.../module.git  # git
```

### `workspace not found`

Run from inside a directory that has `operatoros.yaml` at the root
or in a parent directory. `operatoros init` creates one.

### Permission denied when running a module script

`git clone` doesn't preserve file permissions. After `operatoros add` from
a git source, run `chmod +x` on the module's `bin/` scripts:

```bash
chmod +x modules/*/bin/*.sh
```

### Visitor who did `operatoros init --target .` finds "no workspace"

The `operatoros.yaml` was written one directory UP, not in cwd. Confirm
with `ls operatoros.yaml` from the target dir. (`init` resolves
`--target` against `cwd` if a relative path was given.)

---

## 7. Where to go next

- **`README.md`** — the visitor-friendly 95-line overview
- **`docs/about.md`** — long-form context (Why this and not X, Origin, Who this is for)
- **`CONTRIBUTING.md`** — module contract + workflow for adding modules
- **`methodology/`** — the six principles, token economy, lifecycle rules
- **`docs/internal/architecture/`** — Architecture Freeze + design docs (maintainers only)
- **`ROADMAP.md`** — forward-looking plan
- **`CHANGELOG.md`** — release history
