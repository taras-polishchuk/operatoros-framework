# About OperatorOS

> **For visitors who want context before installing.**
> This is the long-form material that used to live in the README.
> The README at the repo root is now 95 lines and focused on
> the aha moment (`inspect`).

---

## Why this and not [common alternative]?

### Why not AGENTS.md / CLAUDE.md / `.cursorrules`?

Those are the dominant prose formats for hand-written agent
instructions. OperatorOS does not replace them; it composes with
them. OperatorOS supplies the typed bootstrap file (`bootstrap.md`),
four JSON Schemas (`workspace`, `module`, `preset`, `catalog`),
and the four-tier token economy that decides what an agent reads
at cold start. AGENTS.md stays as the conditional-tier
"human-emitted wisdom" file it already is.

If your workspace only needs prose, use AGENTS.md. If it needs
typed contracts and a catalog the agent can verify, use
OperatorOS. Most engineer-grade workspaces need both.

### Why not chezmoi / Dotbot / GNU Stow?

Those are dotfile managers — they sync and link files across
machines. OperatorOS does not sync files; it governs what the
engineer and the agent and the new machine see when they look at
the workspace. Concretely: chezmoi reinstalls your dotfiles on
a new machine; OperatorOS tells the agent that arrives on that
new machine what's in the workspace (and what isn't).

You can use both. They solve different layers of the same
problem. Trying to use OperatorOS as a dotfile manager is like
trying to use `git` as a backup tool — git can do backups, but
that's not its job.

### Why not Nix Home Manager / devenv / devpod?

Those are declarative developer environments — they manage
packages, shells, container builds. OperatorOS does not provision
packages. OperatorOS governs the workspace an engineer lives in:
files, configs, schemas, agent-bootstrap contracts.

The two compose: use Nix to make a reproducible shell; use
OperatorOS to give that shell — and every AI agent that arrives
in it — a typed, schema-validatable view of the workspace.
OperatorOS's *Typed Substrate* principle overlaps with Nix's
declarative configuration, but OperatorOS does not replace Nix;
it sits one layer up, where the engineer and the agent interact
with the workspace.

## What this is NOT (the original 8-row table)

| This is not | Why |
|---|---|
| An AI-native runtime | There are no AI primitives in Core. The constitutional principle is **Local-First** (enforced by a test). |
| A SaaS, cloud service, or sync engine | Everything runs locally. There is no server. |
| A multi-agent orchestration framework | OperatorOS doesn't run agents. It gives agents a structured environment to read. |
| A replacement for Claude Code, Aider, or Hermes | Those are agent runtimes. OperatorOS is the workspace they work in. |
| A universal second brain | This is not for students, managers, or non-technical users. It assumes comfort with terminal, git, and JSON-Schema. |
| A paid product | MIT-licensed. No premium tier. No account. Donations are welcome and unmotivated. |
| A mass-adoption play | Realistic audience: 5-50 engineers comfortable with terminal, git, and JSON-Schema who want their workspace to behave like the code they write in it. |
| A community OS | BDFL governance. Contributions welcome, but the methodology is one person's. |

## Origin

This project started in June 2026 as an attempt to build an
"AI-native personal OS runtime". It failed at that ambition —
honestly documented in CHANGELOG entries from v0.5.0 to v0.5.2.

What survived is the **methodology**: the six principles, the
lifecycle rules, the token economy, and the bootstrap protocol.
They were extracted from the author's four months of daily
practice running a personal operating system called Workspace OS.

This repository is the seed of that extraction. You can plant it
in your own soil.

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

## The bootstrap protocol (deep-dive)

When you create a workspace with `operatoros init`, the CLI
produces a `bootstrap.md` file. This is what an AI agent reads
when it enters your workspace for the first time. See
[`examples/bootstrap-taras-workspace.md`](./examples/bootstrap-taras-workspace.md)
for a worked example (Taras's Workspace OS) — your own workspace
will have different paths.

The bootstrap protocol tells the agent:

1. Which four files to read first (the entire bootstrap is ~12K tokens)
2. Which files are conditional — read only if the task warrants it
3. Which files to ignore entirely
4. When to ask the user, and what to ask

The agent then runs a five-question onboarding interview to learn
what you actually do, what you care about, and what kind of work
the workspace should optimize for. The interview is documented
at `methodology/05-onboarding-interview.md`.

This is the part that makes OperatorOS **AI-usable without being
AI-dependent**: any agent — Claude, GPT, Hermes, Aider — can read
`bootstrap.md` and behave correctly. None of them are required.

## First 5 minutes — the canonical onboarding path

1. **Read this README** (5 min) — get the framing.
2. **Read `methodology/01-six-principles.md`** (5 min) — get the principles.
3. **Read `methodology/05-onboarding-interview.md`** (3 min) — understand what questions an AI agent will ask if it joins your workspace.
4. **Skim `methodology/03-token-economy.md`** (3 min) — understand the four reading tiers.
5. **Run `operatoros init --target my-os`** (1 min) — see what the CLI generates (folder layout, `operatoros.yaml`, and a default `bootstrap.md`).
6. **Decide** — apply the methodology to your real work, or close the tab.

If it resonates: read the rest of `methodology/`, then think
about whether you want to apply it to your own work environment.
If it doesn't: close the tab and forget about it.

## Where this content came from

This is the long-form material that was previously in
`README.md` (which was 243 lines). When v0.8.0 shipped, the
README was cut to 95 lines focused on the `inspect` aha moment.
The content here is the rest: the "Why not X" comparisons, the
"Origin" story, the "Who this is for" audience, the bootstrap
protocol deep-dive, and the "First 5 minutes" canonical
onboarding path.

If you're new to OperatorOS, you can skip this file entirely
and start with the README. If you want context before installing,
this file is for you.
