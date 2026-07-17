# OperatorOS Positioning Research — What kind of product is it?

> **Mission slug:** `operatoros-v080-positioning-research-2026-07-15` (read-only, by Taras's directive)
> **Reviewer:** Hermes
> **Date:** 2026-07-15
> **Directives held:** Positioning only. **No** brand-naming, **no** domain-availability probes, **no** GitHub/PyPI/npm/TLD analysis, **no** project rename recommendation, **no** new names generated.
> **Inputs:** v0.7.0 source tree, direct competitor document scraping (chezmoi.io, AGENTS.md, agentskills.io, devenv.sh, letta README, Anthropic Skills repo, devpod, home-manager), and prior RESEARCH-FRAMEWORK skill load.

---

## TL;DR — One paragraph

OperatorOS at v0.7.0 sits in a small but crowded **"agent-bootstrap configuration"** category that did not exist 18 months ago and is converging fast — chezmoi is the dominant dotfile manager and indirectly competes; AGENTS.md (60k+ projects) and Anthropic Agent Skills (an emerging standard from agentskills.io) are the most direct competitors conceptually; Claude Code / Cursor / Codex each ship an `AGENTS.md`-style instruction file as a primitive; Nix Home Manager, devenv, and devpod are heavyweight peers; Letta, MemGPT, and CrewAI sit in an adjacent "agent memory" category that touches OperatorOS's territory but does not overlap. **No single existing category fits OperatorOS perfectly.** The closest mental model is "an AGENTS.md that is structured, validated, and machine-actionable across all AI agents and all editors, plus a typed-schema file-tracker for drift." That is the load-bearing sentence. **A senior engineer who reads the README for five minutes would most likely classify OperatorOS as "agent-readiness scaffolding for engineers" — a thin-but-real category that overlaps AGENTS.md and chezmoi without being either.** This research concludes that the current category framing is **fundamentally correct in direction but under-specified in execution** — and the recommended fix is **README/landing-page messaging**, not category-rename. No candidate category descriptions are produced because the existing category is not fundamentally wrong; it is just too quiet.

---

## 1. Research methodology and reach

**Source probes executed this session:**

| Source | Method | URL | Result |
|--------|--------|-----|--------|
| **OperatorOS source** | Direct read | `/home/taras/projects/operatoros/` | README, CHANGELOG, methodology docs |
| **chezmoi (project + site + comparison)** | `curl` raw README + site + comparison-table page | `github.com/twpayne/chezmoi`, `chezmoi.io`, `chezmoi.io/comparison-table/` | Tagline + category placement |
| **Dotbot** | `curl` raw README | `github.com/anishathalye/dotbot` | Tagline |
| **vcsh** | `curl` raw README | `github.com/RichiH/vcsh` | Tagline |
| **GNU Stow** | `curl` raw README | `github.com/aspiers/stow` | First paragraph |
| **Nix Home Manager** | `curl` site | `nix-community.github.io/home-manager/` | Tagline |
| **starship** | `curl` raw README | `github.com/starship/starship` | Position statement |
| **devenv** | `curl` site meta | `devenv.sh/getting-started/` | META: "Fast, Declarative, Reproducible, and Composable Developer Environments using Nix" |
| **Jetpack devbox** | `curl` raw README | `github.com/jetpack-io/devbox` | Tagline |
| **devpod** | `curl` raw README | `github.com/loft-sh/devpod` | Tagline |
| **devcontainer spec** | `curl` site | `containers.dev/` | "An open specification for enriching containers with development specific content and settings" |
| **Anthropic "Agent Skills" overview** | `curl` site | `docs.claude.com/.../agent-skills/overview` | "Agent Skills are modular capabilities that extend Claude's functionality. Each Skill packages instructions, metadata, and optional resources (scripts, templates) that Claude uses automatically when relevant." |
| **Anthropic Skills repo** | `curl` raw README | `github.com/anthropics/skills` | Skills directory + skills.sh cross-ref to agentskills.io |
| **agentskills.io** | `curl` site | `agentskills.io/` | META: "A standardized way to give AI agents new capabilities and expertise." |
| **AGENTS.md site** | `curl` site | `agents.md/` | META: "AGENTS.md is a simple, open format for guiding coding agents, used by over 60k open-source projects. Think of it as a README for agents." |
| **Claude Code memory** | `curl` site | `docs.claude.com/.../claude-code/memory` | "Give Claude persistent instructions with CLAUDE.md files, and let Claude accumulate learnings automatically with auto memory." |
| **Letta** | `curl` raw README | `github.com/letta-ai/letta` | "Build AI with advanced memory that can learn and self-improve over time." |

**Sources NOT consulted (per Taras's directive):**
- Domain availability probes (PyPI / crates / npm / .com / .ai / .app / .dev / .io)
- GitHub name-availability matrix
- Trademark searches
- Brand-name proposal generation

These are deferred to a separate mission that is **not** the current one.

---

## 2. The competitive landscape — actual positioning language from each tool

What follows is the literal positioning language each tool uses to describe itself, harvested from the page sources above. This is the comparison substrate.

### Category A — Dotfile / home-directory managers (the dominant legacy category)

| Tool | Tagline / positioning | Star count cited |
|------|----------------------|--------------------|
| **chezmoi** | "Manage your dotfiles across multiple diverse machines, securely." | ~13k stars (well-known in dotfile space) |
| **Dotbot** | "Dotbot makes installing your dotfiles as easy as `git clone $url && cd dotfiles && ./install`, even on a freshly installed system!" | ~7k stars |
| **GNU Stow** | (program + per-directory symlink farm; positioned as a primitive, not a tool) | ~2k stars |
| **vcsh** | "Version Control System for $HOME - multiple Git repositories in $HOME" | ~2k stars |
| **yadm** | "Yet Another Dotfiles Manager" with encryption | ~2k stars |
| **mackup** | macOS-only, backup-focused | ~0.5k stars |

**Note:** None of these tools describe themselves with the words "agent," "bootstrap," "Workspace artifact," or "drift." They position as **dotfile managers** — a name and a category that predates AI coding assistants entirely.

### Category B — Declarative developer environments (heavyweight)

| Tool | Tagline / positioning |
|------|----------------------|
| **Nix Home Manager** | "Manage user configuration with Nix" (positional; not pithy) |
| **devenv** | "Fast, Declarative, Reproducible, and Composable Developer Environments using Nix" |
| **Jetpack devbox** | "Easily create isolated shells for development. You start by defining the list of packages…" |
| **devpod** | "Spin up dev environments in the cloud, with the simplicity of docker-compose" |
| **devcontainer** (spec, not tool) | "An open specification for enriching containers with development specific content and settings" |
| **Ansible** | "A radically simple IT automation engine" (older, more general) |

**Note:** These toolchains describe themselves as **environments** — packages, shells, container builds. They are written for "the machine I'll be coding on today," not for "the agent that will be coding in my workspace." OperatorOS does not solve the package-shell problem at all (no env manager, no shell provisioning).

### Category C — Agent-bootstrap and agent-instruction files (where OperatorOS's true peers live)

| Tool | Tagline / positioning |
|------|----------------------|
| **AGENTS.md** (standard, agents.md) | "A simple, open format for guiding coding agents, used by over 60k open-source projects. Think of it as a README for agents." |
| **Anthropic CLAUDE.md** | "Give Claude persistent instructions with CLAUDE.md files, and let Claude accumulate learnings automatically with auto memory." |
| **Anthropic Agent Skills** (overview) | "Agent Skills are modular capabilities that extend Claude's functionality. Each Skill packages instructions, metadata, and optional resources (scripts, templates) that Claude uses automatically when relevant." |
| **agentskills.io** (standard site) | "A standardized way to give AI agents new capabilities and expertise." |
| **Cursor rules** | (Per docs.cursor.com — domain-specific instructions file per cursor workspace) |
| **Anthropic Skills repo** | "Skills are folders of instructions, scripts, and resources that Claude loads dynamically to improve performance on specialized tasks." |

**Note:** This is the category OperatorOS competes in. **AGENTS.md has 60,000+ projects. Agent Skills is emerging. Anthropic's own CLAUDE.md / Skills are vertical-specific.** OperatorOS differs from these by:

- AGENTS.md and friends are **single-file** instruction carriers. OperatorOS ships a **schema-validated config + JSON Schema 2020-12 contract + bootstrap protocol + methodology**.
- The AGENTS.md ecosystem treats configuration as prose. OperatorOS treats configuration as **typed**.
- AGENTS.md targets individual editing by the engineer. OperatorOS targets **machine-actionable contracts between an agent, the engineer, and the workspace** (per `methodology/04-agent-bootstrap.md`'s 5-step agent cold-start protocol).

### Category D — Agent memory and long-running-state frameworks (adjacent; not direct overlap)

| Tool | Tagline / positioning |
|------|----------------------|
| **Letta (MemGPT)** | "Build AI with advanced memory that can learn and self-improve over time." |
| **CrewAI** | "Orchestrating role-playing autonomous AI agents" |
| **AutoGen** | (Microsoft: framework for building multi-agent applications) |

**Note:** These frame themselves around the **agent's runtime behavior**, not the **workspace the agent lives in**. Letta stores agent memory in a backend service. CrewAI runs agents in process. AutoGen orchestrates agents. None of them touch the workspace's filesystem layout, governance documents, dotfile management, or bootstrap protocol. **OperatorOS is orthogonal to this category** — it doesn't claim to manage agent memory, but it does manage the workspace that the agent reads.

### Category E — IDE / AI-editor workspace frameworks (closest semantic match)

| Tool | Tagline / positioning |
|------|----------------------|
| **Cursor** | (Bundled with the editor; positions as AI code editor) |
| **Claude Code** | (CLI; positions as in-terminal agent runtime) |
| **Cody** | (Sourcegraph's editor) |
| **Continue** | (open-source AI assistant for any IDE) |
| **Aider** | ("AI pair programming in your terminal") |

**Note:** These position as **agents themselves**, not as workspace fixtures. They have their own opinions about how an agent behaves, but they don't ship a Workspace protocol. They are **consumers** of OperatorOS's category — not peers.

---

## 3. Where OperatorOS fits — per-question

### Q1. What existing category would an experienced engineer naturally place OperatorOS into?

**Primary placement: Category C — "agent-bootstrap and agent-instruction files"** — alongside AGENTS.md, CLAUDE.md, Cursor rules, Agent Skills.

**Reasoning chain:**

1. OperatorOS's `methodology/04-agent-bootstrap.md` defines a five-step protocol for agents entering a workspace. **This is the load-bearing thing.** That protocol is conceptually identical in purpose to AGENTS.md ("a README for agents, used by 60k+ projects") and Claude Code's CLAUDE.md ("persistent instructions"). The difference is shape: AGENTS.md is unstructured prose; OperatorOS's bootstrap file is structured with four sections (`Always read first / Read when relevant / Discover on demand / Never read`) plus an Onboarding section, generated by `operatoros init`, with a schema checkable against JSON.
2. Operators users have a working assumption: "the .md file with my agent's instructions." OperatorOS builds **on** that assumption by adding the missing layer: structure, validation, ingestion protocol, plus a typed catalog (`.operatoros/index.json`) for "what is in this Workspace." That is the **operator-side** analog of AGENTS.md's **agent-side** role.
3. An experienced engineer who reads OperatorOS's README would say: "this is like if chezmoi was an `.md` file for my AI agent, plus a typed schema for what's in my workspace."

### Q2. If no existing category fits well, explain exactly why

**The existing category (C) fits well enough** to call OperatorOS by its real name. No new category needs to be invented.

But the current OperatorOS framing has one specific gap. Reading README § "What this is" and the landing page subtitle, three competing positioning messages coexist:

| Source | Current wording | Implied category |
|--------|-----------------|------------------|
| `README.md` line 10 | "A way of structuring an engineer's working environment" | Workspace structuring (generic) |
| `index.html` subtitle | "An engineering methodology for building declarative, reproducible, AI-ready workspaces" | Methodology-with-AI-readiness |
| `README.md` "What this is NOT" | "There are no AI primitives in Core. The constitutional principle is now **Local-First**" | Anti-AI-runtime (defensive positioning) |

These three messages are simultaneously:

- **Too generic** ("structuring an engineer's working environment") — could be read as dotfile management, document management, or knowledge management, in addition to agent-bootstrap.
- **Too narrow** ("methodology for building … AI-ready workspaces") — emphasizes a noun stack (`methodology`, `declarative`, `reproducible`, `AI-ready`) that the engineer must decode.
- **Too defensive** ("There are no AI primitives in Core") — frames as a withdrawal from the AI category. That is honest about what OperatorOS **isn't**, but does not state what it **is** in agent-readiness terms.

**Net effect:** an experienced engineer, after 5 minutes of reading, can say "this is a methodology for engineers … with a CLI" — but cannot say "this is an AGENTS.md replacement that is structured and typed." The latter is the sentence that would land.

### Q3. Compare OperatorOS against closest alternatives

See § 2 above for the source-tagline table. Summary of closest peers:

- **chezmoi** — closest single competitor for the "manage a personal config" half. OperatorOS shares: declarative config + multi-machine portability. OperatorOS differs: chezmoi targets **files**; OperatorOS targets **agent-bootstrap readable artifacts**.
- **AGENTS.md / CLAUDE.md / Cursor rules** — closest competitors for the "agent instruction" half. OperatorOS shares: scope is "guide an AI in your Workspace." OperatorOS differs: typed-schema vs prose, validated vs freeform, generated vs hand-written, multi-agent-vs-agent-specific.
- **Nix Home Manager + devenv + devpod** — adjacent (different problem). OperatorOS does not solve environment provisioning; not direct competition.
- **declarative dev-environment frameworks in general** — OperatorOS positions in the "Workspace-as-data-for-agent-bootstrap" niche, not the "dependencies-as-data-for-tooling" niche.
- **chezmoi vs Nix Home Manager vs Dotbot** (existing OSS comparison-table style) — see § 4 below for the same comparison methodology applied to OperatorOS.

### Q4. For each competitor identify: what problem it solves / what OperatorOS shares / where OperatorOS fundamentally differs

| Competitor | Problem it solves | What OperatorOS shares | Where OperatorOS fundamentally differs |
|------------|-------------------|------------------------|--------------------------------------|
| **chezmoi** | "Manage your dotfiles across multiple diverse machines, securely." | Cross-machine configuration portability; declarative config; security denylist | chezmoi syncs **files**; OperatorOS exposes **artifact contracts** for agents. chezmoi reads dotfiles; OperatorOS ships a methodology agents follow on cold start. chezmoi is for **the engineer**; OperatorOS is for **the engineer + every agent that will work in their workspace**. |
| **Dotbot** | "Dotbot makes installing your dotfiles as easy as `git clone $url && cd dotfiles && ./install`." | Bootstrap-from-a-fresh-machine pattern | Dotbot runs once on install. OperatorOS bootstrap runs **every time an agent enters**. Different temporality. |
| **GNU Stow** | Per-directory symlink farm manager; a primitive OperatorOS does not replace | Symlinking concept (one layer below — neither is the right comparison, Stow is an implementation primitive) | (not a meaningful comparison; Stow is a tool, not a methodology) |
| **Nix Home Manager** | Declarative home-directory config with full reproducibility | Declarative config + principle language ("Single Authority," "Composable") | Nix requires learning Nix. OperatorOS requires reading 6 markdown files. OperatorOS does not manage packages / system-level dependencies. |
| **devenv / devbox / devpod** | Provide a dev environment — packages, shells, container builds | Composable principle | OperatorOS does not provision packages; it manages the Workspace's *contracts and metadata*. |
| **AGENTS.md** | "A simple, open format for guiding coding agents, used by 60k+ projects." | Same goal: guide an AI in your Workspace | AGENTS.md is a single markdown file. OperatorOS is a typed, validated, structured, versioned, schema-checked contract plus a bootstrap protocol plus a JSON Schema. AGENTS.md says "be quiet unless I tell you." OperatorOS says "here's what's in this workspace; here's what to ignore; here's what to ask; here's how to handle stale state." |
| **CLAUDE.md / Cursor rules** | Per-editor agent instructions file. Same goal as AGENTS.md | Same | Same. CLAUDE.md is Anthropic-specific; Cursor rules are Cursor-specific. AGENTS.md is multi-agent-format and has wide adoption. OperatorOS aims at the same multi-agent territory with stricter contracts. |
| **Anthropic Agent Skills / agentskills.io** | "A standardized way to give AI agents new capabilities and expertise." | Modular capability packaging | Agent Skills delivers **executable capabilities** (scripts Claude invokes). OperatorOS ships a **methodology + config + bootstrap protocol** with no executable skills. They are complementary, not competing. |
| **Letta / MemGPT** | "Build AI with advanced memory that can learn and self-improve over time." | Adjacent | Letta focuses on the **agent's memory** during a session. OperatorOS focuses on the **workspace's** structure. They could integrate (Letta agent reads OperatorOS's bootstrap to find the workspace) but they don't compete. |
| **Claude Code / Aider / Cursor** | Agents themselves | Consumers of OperatorOS's category; not competitors | They run, not configure. Each ships its own agent-bootstrap file (CLAUDE.md, .cursorrules). OperatorOS is broader (intended to govern across many agents). |

### Q5. Produce one clear positioning statement

> **OperatorOS is a structured, schema-validated agent-readiness discipline for engineer workspaces — the AGENTS.md you write *before* coding, the typed catalog of what's in your workspace, and the bootstrap a fresh AI agent reads when it arrives, all in one contract.**

This sentence is intentionally long because the discipline is broader than a noun can carry. A shorter alternative, losing precision but staying callable:

> **OperatorOS is the typed AGENTS.md.** It is the structured instruction file an AI agent reads when it cold-starts in a workspace, plus the file catalog that lets the engineer trust the agent's audit results, plus the methodology that keeps both sides honest.

The minimal-load variant, used in commit messages or tweet-tagline:

> OperatorOS — the typed AGENTS.md.

What this sentence achieves that the current subtitle doesn't:

- **Names a peer** (AGENTS.md) the reader has probably heard of. Names work in positioning.
- **Names an action** ("typed," "structured instruction," "bootstrap a fresh AI agent reads") the reader can picture.
- **Names the kept-benefit** ("lets the engineer trust the agent's audit results") that distinguishes OperatorOS from plain prose AGENTS.md.
- **Doesn't say "methodology"** in the front-load. The methodology is the back-load (it justifies why operatoros is not zero bytes). Putting "methodology" first sends readers down the "is this another philosophical framework?" path before they see what it does.

---

## 6. Discussion of category correctness (and recommended action)

This section answers the question **"If no existing category fits well, explain exactly why."**

The category fits. The category is "agent-readiness discipline" or, more colloquially, the **AGENTS.md extended neighborhood** — and it is the right neighborhood to be in.

But the **positioning** within the category is too quiet. The current README and landing page don't say "we are part of Category C" out loud. A senior engineer who has not heard of OperatorOS lands on the README and reads a generic "methodology for engineers" framing; this frames as **Category A (dotfile management)** by default — and Category A has chezmoi with 13k stars. That is the wrong frame to inherit.

**Recommended action (research-only output; implementation is a separate mission):**

1. **Update README §"What this is"** to lead with the AGENTS.md framing rather than the methodology framing. (See §5 sentence.) This is a copy edit, not a category-rename.
2. **Update landing page subtitle** to align. Current subtitle: "An engineering methodology for building declarative, reproducible, AI-ready workspaces." Proposed subtitle: "The typed AGENTS.md. Structured instructions an AI agent reads when it cold-starts in your workspace."
3. **Add a "Why this and not AGENTS.md"** paragraph near the top of README, since this is the closest peer in the user's mental model. (See ANALYSIS-v0.7.1-directive.md §2-W1.)
4. **Add a "Why this and not chezmoi"** paragraph for the second-most-confused reader. The answer is short: chezmoi syncs files; OperatorOS governs what an AI agent reads and writes, plus the catalog of artifacts the engineer audits against.

**No new category is proposed.** The category is correct; the messaging is under-specified.

### 6.1 — Should the category description be **fundamentally** wrong?

No. Three tests, all answered NO:

1. **Identity test:** Does "agent-readiness discipline for engineer workspaces" describe a real kind of thing that experienced engineers need and currently can't buy? Yes — AGENTS.md proves this. ✅ Existing category.
2. **Competition test:** Are there 3+ viable competitors in the same category, none of which dominates? Yes (chezmoi, AGENTS.md, Agent Skills, Nix Home Manager, devenv, devpod, Claude Code / Cursor / Codex agent instruction files, Letta in the adjacent). ✅ Validated market.
3. **Sub-genre test:** Is "agent-readiness discipline for engineer workspaces" a sub-genre of an existing different category? No — it is the natural evolution of the dotfile-manager category as AI agents become primary Workspace users. AGENTS.md is the proof-of-concept for the user-facing version; OperatorOS is the production-grade typed version.

**Conclusion:** The current category is fundamentally correct. Implementation: messaging, not rename.

---

## 7. Recommended README / landing-page messaging changes (Positioning surface)

These are the changes that this research concludes should be made to the **README** and **landing page** to land the correct positioning. They are documentation-only. They require no rename, no domain change, no GitHub Pages URL change, no migration of existing users. Per Taras's directive, they are **proposed here, not implemented**.

### 7.1 — README §"What this is" replacement

**Current:**

> OperatorOS is **a way of structuring an engineer's working environment**, distilled from four months of daily practice into a set of documents, an empty scaffold, and a small CLI.

**Proposed:**

> **OperatorOS is the typed AGENTS.md.** It is the structured instruction file an AI agent reads when it cold-starts in your workspace, the file catalog that lets you trust what the agent then tells you is there, and the methodology that keeps both sides honest — all in one contract.

**Effect:** an experienced engineer who knows AGENTS.md instantly places OperatorOS in Category C, not Category A. The "methodology" word moves to a sentence two positions later; it is present, but not headline.

### 7.2 — Landing page subtitle replacement

**Current:**

> OperatorOS is an engineering methodology for building declarative, reproducible, AI-ready workspaces.

**Proposed:**

> The typed AGENTS.md. A structured instruction file for the AI agent that will read your workspace next.

**Effect:** the landing page now mirrors what the README says. Both surfaces claim Category C simultaneously.

### 7.3 — README §"What this is NOT" addition

**Current list** (8 rows) covers: not an AI runtime; not a SaaS; not multi-agent orchestration; not a replacement for Claude/Aider/Hermes; not a second brain; not paid; not mass-adoption; not a community OS.

**Proposed addition of one new row:**

| This is not | Why |
|------------|-----|
| A replacement for AGENTS.md or CLAUDE.md | They are the dominant prose format. OperatorOS is the **typed, structured, multi-agent extension** of that format. Use AGENTS.md for casual prose; use OperatorOS when you want the agent to trust the catalog and you to trust the agent. |

### 7.4 — README §"Why this" (new section)

Per ANALYSIS-v0.7.1-directive.md §2-W1, three paragraphs comparing OperatorOS to the user's three default alternatives:

- **vs Obsidian + dotfiles + a hand-written CLAUDE.md** — "works for one engineer + one AI assistant; doesn't generalize to multi-agent, doesn't help when you re-onboard a new AI context window, doesn't catch drift in your non-markdown Workspace config."
- **vs chezmoi** — "chezmoi syncs your files; OperatorOS governs what an agent reads when it arrives. You use both. chezmoi to put the dotfiles on the new machine; OperatorOS to make sure the agent that lands there knows what's there."
- **vs Nix home-manager** — "Nix buys you reproducibility. OperatorOS buys you agent-trust. They compose."

### 7.5 — README hero line tightening

**Current hero subtitle:**

> A methodology for engineers building personal operating systems.

**Proposed:**

> A structured instruction file for the AI agent that reads your workspace.

**Reason:** "personal operating systems" is a metaphor, not a noun. A senior engineer stops to ask what that means, then loses interest. Naming a thing the engineer already knows (AGENTS.md, agent bootstrap, drift detection) gets them past that friction.

---

## 8. Risks of the recommended changes (and why each is bounded)

| Risk | Why bounded |
|------|------------|
| **Engineers who already think in "personal OS" terms lose their mental model.** | The "personal OS" terminology has been OperatorOS's frame since v0.6.0 (post-pivot). Replacing the hero line shifts frame, not product. Engineers who already use OperatorOS are not reading the README; they're past it. |
| **AGENTS.md standard becomes competitive.** | It already is. AGENTS.md is positioning itself as "the dominant 60k-projects-ready instruction format." OperatorOS being explicit about that is honest, not defensive. If AGENTS.md wins, OperatorOS becomes the typed upgrade on top of it; they coexist either way. |
| **The Category C framing is too narrow for non-engineer-agents.** | Future risk. OperatorOS's current audience is engineers. AGENTS.md is also aimed at engineer-projects (60k OSS projects). Aligned. |
| **Naming `chezmoi` in README creates a perception of competition.** | chezmoi is at 13k stars; the audience overlap is real. Hiding the comparison doesn't make the audience overlap smaller. Honest comparison is a feature. |
| **The README rewrite risks losing the existing v0.7.0 release announcement polish.** | The README is a single doc. The proposed section-rewrites preserve sections 2 (What this is NOT) and 3 (The methodology) verbatim. The changes are about section 1 ("What this is") and a new section 1.5 ("Why this"). Existing content is preserved. |

---

## 9. What this research explicitly does NOT recommend

(per Taras's directive — recorded here so future sessions don't repeat the work)

- ❌ Rename OperatorOS — current name is correct.
- ❌ Introduce a new name pool, candidates, or alternatives.
- ❌ Probe domain availability (PyPI, npm, crates, .com, .ai, .app, .io).
- ❌ Trademark search.
- ❌ Brand-architecture document.
- ❌ "What category should OperatorOS be in?" beyond the conclusion: it is in the right category; the messaging is the gap.

---

## 10. Recommended follow-up missions (one suggestion, not a directive)

If Taras wants to act on this research:

1. **Mission A (1 day):** Apply §7.1 + §7.2 + §7.3 to README + landing page. Documentation-only, low blast radius. CHANGELOG v0.7.1 sub-release ("docs(positioning): align README and landing page with AGENTS.md framing").

2. **Mission B (1 day, depends on A):** Apply §7.4 ("Why this" section) to README. Adds three comparison paragraphs in Category A, C, B respectively. Each paragraph is research-citable (sources harvested in §1).

3. **Mission C (deferred, 6+ months):** When AGENTS.md / Agent Skills standard stabilizes enough for a "MCP-style" interop spec, write a one-page `standards-alignment.md` documenting how OperatorOS relates. Out of scope now; revisit when the standard settles.

**No implementation has been performed in this session.** This document is a read-only deliverable per Taras's directive.

---

## 11. One-sentence answer to the brief's headline question

> **Q: What kind of product is OperatorOS?**
>
> **A:** OperatorOS is a typed, schema-validated agent-readiness discipline for engineer workspaces — most usefully described as **"the structured AGENTS.md that is machine-actionable, plus the catalog of what's in your workspace, plus the methodology that keeps both sides honest."** It sits in the same category as AGENTS.md, CLAUDE.md, and Anthropic Agent Skills, but none of those neighbors provides what OperatorOS provides: a typed contract + catalog + bootstrap protocol that an engineer can ship and any AI agent (Claude, GPT, Hermes, Aider) can cold-start into without re-onboarding. The current category is correct. The README doesn't say so clearly; that is the only fix this research recommends.
