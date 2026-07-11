# OperatorOS

> **Status:** v0.6.0 · MIT licensed
> **One sentence:** A methodology for engineers to build their own personal operating system — captured in code, documents, and a bootstrap protocol that an AI agent can run.

---

## What this is

OperatorOS is **a way of structuring an engineer's working environment**, distilled from four months of daily practice into a set of documents, an empty scaffold, and a small CLI.

It is not an operating system you install. It is a **seed** you grow into one.

If you are an engineer, developer, technical founder, or technical researcher who wants your work environment to behave the way your code does — typed, version-controlled, replaceable, and inspectable — this is for you.

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

### 2. The empty workspace scaffold

Located in `presets-canonical/personal/`. This is what you start with. It contains folders, schemas, and example files — but no personal content.

```yaml
# presets-canonical/personal/preset.yaml
version: 1
name: personal
modules: []  # start empty. add what you need.
```

You don't import someone else's life. You build your own.

### 3. The CLI

Located in `core/`. Seven commands: `init`, `validate`, `add`, `apply`, `run`, `export`, `version`.

```bash
# Install (pin to v0.5.2-alpha explicitly; the install script defaults to v0.5.1-alpha.2
# for backward-compatibility with prior users — set OPERATOROS_VERSION to opt in)
OPERATOROS_VERSION=v0.5.2-alpha \
  curl -fsSL https://raw.githubusercontent.com/taras-polishchuk/operatoros-framework/main/scripts/install.sh | sh

# Scaffold a new workspace
operatoros init my-os

# Add a module (e.g., the bundled journal example)
operatoros add ./examples/journal

# Validate the workspace against its schema
operatoros validate my-os/operatoros.yaml

# Run a module's command
operatoros run journal add "first entry"
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

# 3. Run the CLI in dry-run mode (no install needed)
./core/dist-bin/operatoros init /tmp/test-workspace

# 4. Inspect what was generated
ls -la /tmp/test-workspace
cat /tmp/test-workspace/operatoros.yaml

# 5. Validate the scaffold against its schema
./core/dist-bin/operatoros validate /tmp/test-workspace

# 6. Run the bundled journal example
cd /tmp/test-workspace
/path/to/operatoros add /home/taras/projects/operatoros/examples/journal
/path/to/operatoros run journal add "first entry"
cat journal.txt
```

### First 5 minutes — the canonical onboarding path

1. **Read this README** (5 min) — get the framing.
2. **Read `methodology/01-six-principles.md`** (5 min) — get the principles.
3. **Read `methodology/05-onboarding-interview.md`** (3 min) — understand what questions an AI agent will ask if it joins your workspace.
4. **Skim `methodology/03-token-economy.md`** (3 min) — understand the four reading tiers.
5. **Run `operatoros init my-os`** (1 min) — see what the CLI generates.
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