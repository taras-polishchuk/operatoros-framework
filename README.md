# OperatorOS

> **Status:** v0.8.2 · MIT licensed · Requires Node.js 20+
> **One sentence:** An engineering workspace framework that keeps engineer and AI in agreement about a workspace.

---

## What `inspect` looks like

Drop the binary into any project. See what an AI sees in 1 second.

```bash
$ operatoros inspect --target /path/to/your/project
```

```
OperatorOS Inspect — /path/to/your/project

1. What's here: 4 files, 1 directory
2. How an AI sees it:
   "Source-tree organization suggests a software project
    rather than a personal OperatorOS workspace."
3. What's missing: operatoros.yaml, modules/, bootstrap.md, IDENTITY.md
```

`inspect` works on **any directory** — not just OperatorOS
workspaces. It is the fastest way to see what an AI agent would
"see cold" when entering your project. No setup, no install,
no commit required.

## Install

OperatorOS requires **Node.js 20+**. Install Node first if you don't have it.

### Linux / macOS / WSL

```bash
curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | bash
```

Or, equivalently:

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh)
```

> **Important:** use `| bash`, not `| sh`. On Debian/Ubuntu/Alpine,
> `/bin/sh` is dash, which doesn't support bash-isms. The installer
> detects this and prints a helpful error if you use `sh`.

**Install Node.js first** (if needed):

```bash
# macOS (Homebrew)
brew install node@20

# Linux (nvm — recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install 20

# Linux (system package, may be older)
sudo apt install nodejs npm  # verify: node --version >= 20
```

**Verify the install:**

```bash
$ operatoros --version
operatoros-core: 0.8.0
```

If `operatoros` is not found, add `~/.local/bin` to PATH:

```bash
# bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc

# zsh (macOS default)
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc && source ~/.zshrc

# fish
echo 'set -gx PATH $HOME/.local/bin $PATH' >> ~/.config/fish/config.fish
```

### Windows (PowerShell)

```powershell
iwr -useb https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.ps1 | iex
```

> **Important:** don't use `curl | sh` from PowerShell — `curl` is an alias
> for `Invoke-WebRequest` and won't pipe raw bytes correctly. Use `iwr -useb | iex`.

**Install Node.js first** (if needed):

```powershell
# winget (recommended on Windows 10/11)
winget install OpenJS.NodeJS.LTS

# chocolatey
choco install nodejs-lts

# official installer
# Download from https://nodejs.org/
```

**Verify the install:**

```powershell
PS> operatoros version
operatoros-core: 0.8.0
```

If `operatoros` is not found, add `%USERPROFILE%\.local\bin` to PATH:

```powershell
[Environment]::SetEnvironmentVariable('PATH', "$env:USERPROFILE\.local\bin;$env:PATH", 'User')
# Then open a new PowerShell window.
```

### Pin to a specific version

```bash
# Linux/macOS
OPERATOROS_VERSION=v0.8.2 curl -fsSL .../install.sh | bash

# Windows PowerShell
$env:OPERATOROS_VERSION = "v0.8.2"; iwr -useb .../install.ps1 | iex
```

## Try it (5 commands, 5 minutes)

After install, on any platform:

```bash
# 1. Scaffold a workspace
operatoros init --target my-os

# 2. Step into it
cd my-os

# 3. See your workspace through an AI's eyes
operatoros inspect --format terminal

# 4. Validate + check workspace health
operatoros validate operatoros.yaml && operatoros doctor
```

That's the visitor's first 5 minutes. The 9 modules that ship with
v0.8.0 extend further (see [CONTRIBUTING.md](./CONTRIBUTING.md) for
the contract).

## What this is

OperatorOS is an **engineering workspace framework**. It gives
engineer and AI agent the same typed, schema-validatable contract
for what the workspace is, a catalog of what's actually there,
and a bootstrap protocol an agent reads first. Six principles,
enforced where the codebase allows it. See
[`methodology/01-six-principles.md`](./methodology/01-six-principles.md).

It is **not** an AI agent, not a dotfile manager, not a package
manager. It is the discipline that holds all of those in one
shape. The constitutional principle is **Local-First** —
verified by `__tests__/local-first.test.ts` on every commit.

## The CLI

14 commands. `init`, `validate`, `add`, `apply`, `run`, `export`,
`version`, plus the v0.7.0 Catalog (`index`, `doctor`, `stats`,
`stale`, `prune`), plus v0.8.0 `inspect`. Per-command help on
`operatoros <cmd> --help`. Single-file bundle, no runtime
dependencies beyond Node 20+.

## Documentation map

- **`methodology/`** — the six principles, doc lifecycle, token
  economy, bootstrap protocol, ADR shape.
  Start with `methodology/01-six-principles.md`.
- **`CONTRIBUTING.md`** — how to add a module, propose a
  capability, file a bug.
- **`CHANGELOG.md`** — release history.
- **`ROADMAP.md`** — forward-looking plan.
- **`docs/about.md`** — *Why this and not [alternative]?*, the
  origin story, "First 5 minutes" deep-dive, "Who this is for".
  (For visitors who want context before installing.)
- **`docs/internal/architecture/`** — v0.8.0 program artifacts
  (architecture freeze, design docs). For maintainers.

## License

MIT. See [LICENSE](./LICENSE). Contributions welcome via PR.
[Donations](https://github.com/sponsors/taras-polishchuk) welcome
and unmotivated. There is no paid tier. There will never be a
paid tier.
