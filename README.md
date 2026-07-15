# OperatorOS

> **Status:** v0.7.0 · MIT licensed
> **One sentence:** An engineering workspace framework that keeps engineer and AI in agreement about a workspace.

---

## What this is

OperatorOS is an **engineering workspace framework**. It is a six-principle discipline for engineer workspaces, distilled from four months of daily practice into a bootstrap protocol an AI agent reads when it cold-starts, a JSON-Schema config system for everything in the workspace, a catalog of what's actually there, and a small CLI that ties it all together.

**OperatorOS keeps engineer and AI in agreement about a workspace.** A workspace that humans and AI agents co-occupy drifts — files appear, configs diverge, the agent that arrives next session has to re-discover everything. OperatorOS prevents that drift: it gives both sides a typed, schema-validatable contract for what the workspace is, a catalog of what's actually there, and a bootstrap protocol an agent reads first.

It is not an AI agent, not a dotfile manager, and not a package manager. It is the discipline that holds all of those in one shape — so an engineer, a fresh AI agent, and a new machine each look at the workspace and see the same one.

If you are an engineer, developer, technical founder, or technical researcher whose work environment is supposed to behave like the code you write in it — typed, version-controlled, replaceable, inspectable — this is for you.

### Why this and not [common alternative]?

#### Why not AGENTS.md / CLAUDE.md / `.cursorrules`?

Those are the dominant prose formats for hand-written agent instructions. OperatorOS does not replace them; it composes with them. OperatorOS supplies the typed bootstrap file (`bootstrap.md`), four JSON Schemas (`workspace`, `module`, `preset`, `catalog`), and the four-tier token economy that decides what an agent reads at cold start. AGENTS.md stays as the conditional-tier "human-emitted wisdom" file it already is. If your workspace only needs prose, use AGENTS.md. If it needs typed contracts and a catalog the agent can verify, use OperatorOS. Most engineer-grade workspaces need both.

#### Why not chezmoi / Dotbot / GNU Stow?

Those are dotfile managers — they sync and link files across machines. OperatorOS does not sync files; it governs what the engineer and the agent and the new machine see when they look at the workspace. Concretely: chezmoi reinstalls your dotfiles on a new machine; OperatorOS tells the agent that arrives on that new machine what's in the workspace (and what isn't). You can use both. They solve different layers of the same problem. Trying to use OperatorOS as a dotfile manager is like trying to use `git` as a backup tool — git can do backups, but that's not its job.

#### Why not Nix Home Manager / devenv / devpod?

Those are declarative developer environments — they manage packages, shells, container builds. OperatorOS does not provision packages. OperatorOS governs the workspace an engineer lives in: files, configs, schemas, agent-bootstrap contracts. The two compose: use Nix to make a reproducible shell; use OperatorOS to give that shell — and every AI agent that arrives in it — a typed, schema-validatable view of the workspace. OperatorOS's *Typed Substrate* principle overlaps with Nix's declarative configuration, but OperatorOS does not replace Nix; it sits one layer up, where the engineer and the agent interact with the workspace.

## What this is NOT

| This is not | Why |
|---|---|
| An AI-native runtime | There are no AI primitives in Core. The constitutional principle is now **Local-First** (enforced by a test). |
| A SaaS, cloud service, or sync engine | Everything runs locally. There is no server. |
| A multi-agent orchestration framework | OperatorOS doesn't run agents. It gives agents a structured environment to read. |
| A replacement for Claude Code, Aider, or Hermes | Those are agent runtimes. OperatorOS is the workspace they work in. |
| A universal second brain | This is not for students, managers, or non-technical users. It assumes comfort with terminal, git, and JSON-Schema. |
| A paid product | MIT-licensed. No premium tier. No account. Donations are welcome and unmotivated. |
| A mass-adoption play | Realistic audience: 5-50 engineers like Taras, not 100,000 users. |
| A community OS | BDFL governance. Contributions welcome, but the methodology is one person's. |

## The methodology

OperatorOS is built on six principles. These are not aspirational — they are constitutional rules, each enforced where the codebase allows it. Each principle has an operational rule, an enforcement mechanism, and a failure mode — see [`methodology/01-six-principles.md`](./methodology/01-six-principles.md) for the canonical reference.

1. **Single Authority.** Every concept has exactly one canonical location. Duplicates are drift.
2. **Everything Replaceable.** Any component can be removed without breaking the others. No tight coupling.
3. **Typed Substrate.** Configuration is validated against JSON-Schema before it is accepted. Invalid states cannot exist.
4. **Composable.** A workspace is a set of named modules with explicit dependencies and declared lifecycles.
5. **Evidence-Based.** Every change has a reason; every reason has a record. Speculation is rejected by convention.
6. **Local-First.** The Core never reaches the network. (Replaces the abandoned "AI-Native" principle in v0.5.2.) **Enforced by** `__tests__/local-first.test.ts`.

A document explaining each principle in depth lives at `methodology/01-six-principles.md`.

## The artifact

OperatorOS ships three things:

### 1. The methodology documents

Located in `methodology/`. These explain how an engineer can build their own personal OS using these principles.

- `01-six-principles.md` — the six constitutional rules
- `02-doc-lifecycle.md` — how documents live and die
- `03-token-economy.md` — how an AI agent decides what to read
- `04-agent-bootstrap.md` — how a new agent enters a workspace
- `05-onboarding-interview.md` — five questions an agent should ask a new user
- `06-decisions-adr.md` — the shape of an ADR in `.project-state/<slug>/decisions.md`

### 2. The empty workspace scaffold

Located in `presets-canonical/personal/`. This is what you start with: an empty preset, folder layout, and JSON-Schema definitions for `operatoros.yaml`, `module.yaml`, and `preset.yaml`. No bundled modules; you assemble your own from `operatoros add <path>`.

```yaml
# presets-canonical/personal/preset.yaml
version: 1
name: personal
modules: []  # start empty. add what you need.
```

You don't import someone else's life. You build your own.

### 3. The CLI

Located in `core/`. Thirteen commands: `init`, `validate`, `add`, `apply`, `run`, `export`, `version`, plus the v0.7.0 Workspace Catalog: `index`, `doctor`, `stats`, `stale`, `prune`.

```bash
# Install (pin to v0.7.0 to match README/CHANGELOG; install.sh also defaults to v0.7.0)
OPERATOROS_VERSION=v0.7.0 \
  curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | sh

# Scaffold a new workspace (writes into ./my-os; omit --target to use the current dir)
operatoros init --target my-os

# Add a module — replace `<module-source>` with a local path or git URL.
# OperatorOS ships no bundled modules (Decision 9, v0.6.3).
# See CONTRIBUTING.md §"How to add a module" for the contract.
operatoros add <module-source>

# Validate the workspace against its schema
operatoros validate operatoros.yaml

# Run a module's command (replace `<module>` with one you added via `operatoros add`)
operatoros run <module> <command> [args...]

# Export the workspace as a portable bundle
operatoros export
```

The CLI is **the carrier, not the product**. It is small, single-file (~787 KB), and quietly stays out of your way.

## The bootstrap protocol

When you create a workspace with `operatoros init`, the CLI produces a `bootstrap.md` file. This is what an AI agent reads when it enters your workspace for the first time. See [`examples/bootstrap-taras-workspace.md`](./examples/bootstrap-taras-workspace.md) for a worked example (Taras's Workspace OS) — your own workspace will have different paths.

The bootstrap protocol tells the agent:

1. Which four files to read first (the entire bootstrap is ~12K tokens)
2. Which files are conditional — read only if the task warrants it
3. Which files to ignore entirely
4. When to ask the user, and what to ask

The agent then runs a five-question onboarding interview to learn what you actually do, what you care about, and what kind of work the workspace should optimize for. The interview is documented at `methodology/05-onboarding-interview.md`.

This is the part that makes OperatorOS **AI-usable without being AI-dependent**: any agent — Claude, GPT, Hermes, Aider — can read `bootstrap.md` and behave correctly. None of them are required.

## Try it

You don't have to believe the methodology to try the scaffold.

```bash
# 1. Clone and look around
git clone https://github.com/taras-polishchuk/operatoros-framework.git
cd operatoros-framework

# 2. Read the methodology
ls methodology/
cat methodology/01-six-principles.md

# 4. Run the CLI in dry-run mode (no install needed; use a built binary or run
#    from the cloned repo with `node core/src/cli.js`)
node core/src/cli.js version

# 5. Inspect what was generated
ls -la /tmp/test-workspace
cat /tmp/test-workspace/operatoros.yaml

# 6. Validate the scaffold against its schema
operatoros-core validate /tmp/test-workspace

# 7. Add your first module — see CONTRIBUTING.md §"How to add a module"
#    Example: git-clone an existing module repository and `operatoros add` it.
#    Or author one from scratch following the contract in schemas/module.schema.json.
```

### First 5 minutes — the canonical onboarding path

1. **Read this README** (5 min) — get the framing.
2. **Read `methodology/01-six-principles.md`** (5 min) — get the principles.
3. **Read `methodology/05-onboarding-interview.md`** (3 min) — understand what questions an AI agent will ask if it joins your workspace.
4. **Skim `methodology/03-token-economy.md`** (3 min) — understand the four reading tiers.
5. **Run `operatoros init --target my-os`** (1 min) — see what the CLI generates (folder layout, `operatoros.yaml`, and a default `bootstrap.md`).
6. **Decide** — apply the methodology to your real work, or close the tab.

If it resonates: read the rest of `methodology/`, then think about whether you want to apply it to your own work environment. If it doesn't: close the tab and forget about it.

## Who this is for

You probably are, if:
- You keep notes in 4 places and none of them work
- You have a system that survives in your head but not on disk
- You give your AI agent the same context every session and wish it would remember
- You are willing to invest 2-3 months building something personal before it pays off

You probably aren't, if:
- You want a turnkey productivity app
- You want AI to organize your life for you
- You want results in 30 minutes
- You are not comfortable editing YAML and JSON

## Origin

This project started in June 2026 as an attempt to build an "AI-native personal OS runtime". It failed at that ambition — honestly documented in CHANGELOG entries from v0.5.0 to v0.5.2.

What survived is the **methodology**: the six principles, the lifecycle rules, the token economy, and the bootstrap protocol. They were extracted from the author's four months of daily practice running a personal operating system called Workspace OS.

This repository is the seed of that extraction. You can plant it in your own soil.

## License

MIT. See `LICENSE`. Contributions welcome via PR. The methodology is one person's (Taras Polishchuk), but the seed is everyone's.

## Funding

If this saved you time, [a donation](https://github.com/sponsors/taras-polishchuk) is welcome and unmotivated. There is no paid tier. There will never be a paid tier.