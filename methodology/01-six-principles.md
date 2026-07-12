# The Six Principles

> **Status:** Constitutional. These are not aspirational — they are enforced where the codebase allows it, and codified as invariant rules where it doesn't.

The Workspace OS methodology is built on six principles. They were extracted from four months of daily practice and refined into the rules below. Each principle has a one-sentence statement, an explanation, an operational rule, and an enforcement mechanism.

---

## Principle 1 — Single Authority

> Every concept has exactly one canonical location. Duplicates are drift.

**Explanation.** When the same idea lives in two places, one of them will drift. The drift will be silent. The drift will eventually bite. Single Authority means: one path, one filename, one definition. Everything else either references or is a derivation.

**Operational rule.**
- A document defines a concept in exactly one place. References are by path, never by copy.
- If you need the same content in two contexts, link to the canonical source — don't duplicate.
- When in doubt, search the workspace for the concept before creating a new file.

**Enforcement.**
- `operatoros validate` checks that no two files claim authority for the same concept (cross-references by path).
- The agent's bootstrap protocol reads one file per concept; if it reads two, that's a violation flag.

**Failure mode.** "I have three notes about my goals, in three different folders, and they're all slightly different." — fix by choosing one, deleting the others, and linking.

---

## Principle 2 — Everything Replaceable

> Any component can be removed without breaking the others. No tight coupling.

**Explanation.** A working system is one where you can swap any piece without rebuilding the whole. If removing a module breaks unrelated parts, those parts were coupled too tightly. Loose coupling makes the system survive change.

**Operational rule.**
- A workspace module declares its dependencies in a manifest, not by reaching into other modules' files.
- A document references other documents by path; it does not assume their contents.
- The Core CLI is not required for the methodology to work. The methodology is the documents.

**Enforcement.**
- `operatoros run <module>` checks that the module's manifest declares all imports it needs.
- The Core binary does not embed assumptions about specific modules or schemas.

**Failure mode.** "I removed my notes module and now my journal entries don't render." — fix by making the journal entry format module-agnostic (Markdown + frontmatter, not proprietary schema).

---

## Principle 3 — Typed Substrate

> Configuration is validated against JSON-Schema before it is accepted. Invalid states cannot exist.

**Explanation.** A system that allows invalid configurations will accumulate invalid configurations. Validation at the boundary — when a config is created or modified — is cheaper than validation at runtime, and prevents an entire class of bugs.

**Operational rule.**
- Every configuration file has a corresponding JSON-Schema file.
- `operatoros validate` reads the schema and the config together. Mismatch = error.
- Schemas are versioned. Configs declare which schema version they conform to.

**Enforcement.**
- `schemas/workspace.schema.json`, `schemas/module.schema.json`, `schemas/preset.schema.json` exist at the repo root.
- The Core CLI runs validation as part of `init`, `add`, and `apply`.
- A constitutional test (`__tests__/local-first.test.ts` analog) verifies schema conformance for every config in the repo.

**Failure mode.** "I added a module with a typo in the YAML and didn't notice until the agent crashed." — fix by running `operatoros validate` after every config change.

---

## Principle 4 — Composable

> A workspace is a set of named modules with explicit dependencies and declared lifecycles.

**Explanation.** Most workspace systems are monolithic: one big structure you customize. Composable means: small pieces, each with a clear purpose, that you assemble into the workspace you need. You don't import someone else's life — you assemble your own.

**Operational rule.**
- A module is a folder with a `module.yaml` declaring its name, version, dependencies, and lifecycle hooks.
- A preset is a named collection of modules. Presets are templates — they are not workspaces.
- A workspace is what you build by running `operatoros apply <preset>` and then customizing.

**Enforcement.**
- `module.schema.json` requires `name`, `version`, `dependencies[]`, `hooks{}`.
- `presets-canonical/<name>/preset.yaml` declares which modules a preset includes.
- An empty preset (`personal` with `modules: []`) is the canonical starting point.

**Failure mode.** "I imported a preset and now my workspace has 200 files I don't understand." — fix by starting empty and adding modules one at a time, each with a documented reason.

---

## Principle 5 — Evidence-Based

> Every change has a reason; every reason has a record. Speculation is rejected by convention.

**Explanation.** Decisions made without evidence accumulate. They become assumptions, then traditions, then myths. Evidence-Based means: when you change something, you write down why. The why is at least as important as the what.

**Operational rule.**
- Mission artifacts (per Workspace OS Article VII) live in the **workspace root** `<workspace-root>/.project-state/<mission-slug>/` — NOT inside any sub-project repository. Each OperatorOS-managed workspace has exactly one `.project-state/` root, owned by the workspace, not by any project inside it. In Taras's Workspace OS the canonical root resolves to `/home/taras/projects/.project-state/`; other OperatorOS users substitute their own workspace path.
- Each mission produces a `final-report.md` that records decisions, evidence, and outcomes.
- Code commits reference mission slugs. PR descriptions link to mission reports.
- Speculative features ("maybe users will want X") are not built. Features are built when at least one real user describes a real need.

**Enforcement.**
- The Workspace OS Article VII (Sprint Pattern) is the canonical mission lifecycle.
- A constitutional rule rejects speculative contributions: "If the use case changes once the user tries it, it's not a real requirement."

**Failure mode.** "I added this feature six months ago and I don't remember why." — fix by writing a `final-report.md` and linking it to the commit.

---

## Principle 6 — Local-First

> The Core never reaches the network. The methodology works offline. The user owns their data.

**Explanation.** A workspace that depends on the network is a workspace that breaks when the network breaks. Local-First means: the core tools run on your machine, your data stays on your machine, and the network is an optional add-on, not a foundation.

**Operational rule.**
- The Core CLI has no network code. No HTTP clients, no cloud APIs, no telemetry.
- Schemas, presets, and examples are embedded in the binary at build time.
- Online services (if any) are opt-in modules that declare their network requirements explicitly.

**Enforcement.**
- A constitutional test (`__tests__/local-first.test.ts`) greps `core/src/**/*.ts` for forbidden network primitives: `fetch`, `http.request`, `https.get`, `net.connect`, `tls.connect`, `dns.lookup`, `axios`, `got`, `node-fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`. If any are found, the test fails the build.
- CI runs this test on every PR.

**Failure mode.** "My workspace stopped working because the API I depend on changed." — fix by removing the network dependency from the Core and making it an opt-in module.

---

## Why these six, and not more

The original ambition included a seventh principle: "AI-Native". It was removed in v0.5.2-alpha because:

1. No AI primitives ever shipped in Core.
2. AI-Native was not verifiable by code — it was aspirational.
3. Local-First captures the verifiable subset of AI-Native that actually matters (AI agents can run locally; their tools should too).

If a proposed seventh principle cannot be enforced by either a test or a documented convention, it is not a principle — it is a wish.

---

## How to use these principles

You are not required to accept all six. You may:

- **Reject one** if it conflicts with your work. Document why in your personal `IDENTITY.md` override.
- **Add a seventh** if you can enforce it. Add the test or the convention.
- **Translate them** into your own language. The substance matters more than the words.

The principles are not commandments. They are the seed. Grow what fits.