# OperatorOS

> **Status:** v0.8.0 · MIT licensed
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

## Try it (5 commands, 5 minutes)

```bash
# 1. Install
curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | sh

# 2. Scaffold a workspace
operatoros init --target my-os

# 3. Step into it
cd my-os

# 4. See your workspace through an AI's eyes
operatoros inspect --format terminal

# 5. Validate + check workspace health
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
`operatoros <cmd> --help`. Single-file binary (~835 KB), no
runtime dependencies beyond Node 20+.

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
