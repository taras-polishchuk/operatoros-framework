# Onboarding Interview

> **Status:** Operational protocol. The five questions an agent should ask when entering a new workspace for the first time.

When a workspace doesn't have `onboarding_complete: true` in `IDENTITY.md`, the agent runs the onboarding interview. The interview has five questions. Each answer is recorded. After the interview, the agent writes the answers to `IDENTITY.md` so future cold-starts don't repeat it.

The interview takes ~0.5K tokens. It runs once per agent-workspace pair.

---

## The five questions

### 1. "What do you do, and what are you working on right now?"

This establishes the owner's current context. The agent uses this to prioritize conditional reads.

**Why this question.** A workspace is shaped by what its owner does. An engineer working on infra has different priorities than a researcher writing papers. The agent needs to know which.

**Acceptable answers.** A short paragraph. The agent should not require formality — bullet points are fine.

**Example answer.**
> "I'm an AI automation engineer transitioning to AI solutions architect. Currently shipping a methodology repository (OperatorOS) and exploring how agents can replace the bootstrap step."

**Where it goes.** `IDENTITY.md` → `## Current focus` section.

---

### 2. "What does this workspace need to be good at?"

This establishes the workspace's optimization target. Not everything can be optimized. Choose 3-5 priorities.

**Why this question.** A workspace optimized for "fast retrieval of past decisions" is structured differently than one optimized for "tracking active projects". The agent needs to know the priorities to decide which conditional files to read first.

**Acceptable answers.** A numbered list of 3-5 priorities.

**Example answer.**
> 1. Fast cold-start (target: < 5K tokens for bootstrap)
> 2. Clear mission lifecycle (each mission has explicit state and owner)
> 3. Token-economical agent reads (no agent reads more than necessary)
> 4. Recoverability (any state can be reconstructed from the workspace)

**Where it goes.** `IDENTITY.md` → `## Workspace priorities` section.

---

### 3. "What does this workspace explicitly NOT need to do?"

This is as important as question 2. A workspace that tries to do everything does nothing well.

**Why this question.** Without explicit exclusions, agents will read files and create structures for tasks the workspace isn't designed for. That bloats the workspace and dilutes attention.

**Acceptable answers.** A short list of explicit exclusions.

**Example answer.**
> - Not a CRM. Don't track contacts unless they're engineering-relevant.
> - Not a content platform. Don't optimize for publishing or SEO.
> - Not a financial tracker. Don't store money data here.
> - Not a personal diary. Daily reflections go elsewhere.

**Where it goes.** `IDENTITY.md` → `## Explicit exclusions` section.

---

### 4. "How do you want me (the agent) to behave when I'm uncertain?"

This establishes the agent's behavior in ambiguous situations. There are three reasonable defaults:

- **Ask.** The agent stops and asks the user when uncertain.
- **Default and log.** The agent makes a reasonable default choice, logs it, and continues.
- **Escalate.** The agent flags the uncertainty but continues with the most-likely-correct action.

**Why this question.** Different owners have different tolerances. Some want to be asked every time. Some want the agent to act and explain later.

**Acceptable answers.** One of the three defaults, with optional clarification.

**Example answer.**
> "Default and log. Ask only if blocked by credentials, legal, or explicit user request."

**Where it goes.** `IDENTITY.md` → `## Agent behavior in uncertainty` section.

---

### 5. "What makes you trust a workspace?"

This is a meta-question about the owner's psychology. It reveals what the workspace should optimize for in its visible behavior.

**Why this question.** Trust is built by specific behaviors: consistency, recoverability, transparency. The agent needs to know which behaviors matter most.

**Acceptable answers.** A short paragraph or list.

**Example answer.**
> "I trust a workspace that: (a) never silently changes a document's state, (b) tells me when something is uncertain, (c) makes it easy to roll back, (d) keeps state visible at a glance."

**Where it goes.** `IDENTITY.md` → `## Trust signals` section.

---

## What the interview is NOT

**Not a personality test.** The agent is not trying to characterize the owner. It's collecting operational parameters.

**Not a one-time questionnaire.** The owner can re-run the interview at any time by deleting `onboarding_complete: true` from `IDENTITY.md` and re-invoking the agent.

**Not exhaustive.** Five questions cover the essentials. Anything more specific should be in `IDENTITY.md` or in mission artifacts, not in the interview.

**Not a replacement for documentation.** The interview collects parameters. The methodology documents (this folder) explain the principles. The two are complementary.

---

## When the agent should NOT run the interview

- The workspace already has `onboarding_complete: true` in `IDENTITY.md`.
- The owner explicitly tells the agent to skip it.
- The agent is running in a subdirectory or for a specific task that doesn't need full context.
- The agent is non-interactive (e.g., a CI script) and can't ask questions.

In these cases, the agent uses default parameters and proceeds.

---

## The interview script (for agents)

```python
# Pseudo-code. Real agents adapt to their own runtime.

def run_onboarding(workspace):
    identity_path = workspace / "IDENTITY.md"
    if identity_path.exists():
        content = identity_path.read_text()
        if "onboarding_complete: true" in content:
            return  # already onboarded

    print("I need 5 questions to onboard this workspace.")
    print()

    answers = {}
    answers["focus"] = ask("Q1: What do you do, and what are you working on right now?")
    answers["priorities"] = ask("Q2: What does this workspace need to be good at? (3-5 priorities)")
    answers["exclusions"] = ask("Q3: What does this workspace explicitly NOT need to do?")
    answers["uncertainty"] = ask("Q4: How should I behave when uncertain? (ask | default-and-log | escalate)")
    answers["trust"] = ask("Q5: What makes you trust a workspace?")

    # Write to IDENTITY.md
    write_identity_addendum(identity_path, answers)
    print()
    print("Onboarding complete. Future cold-starts will skip this.")
```

---

## After the interview

The agent writes the answers to `IDENTITY.md` in a structured format. The file should look like:

```markdown
# IDENTITY

## Owner context
<existing content>

## Current focus
> I am working on...

## Workspace priorities
1. <priority 1>
2. <priority 2>
3. <priority 3>

## Explicit exclusions
- <exclusion 1>
- <exclusion 2>

## Agent behavior in uncertainty
> <ask | default-and-log | escalate>

## Trust signals
- <signal 1>
- <signal 2>

---
onboarding_complete: true
last_updated: YYYY-MM-DD
```

The agent then sets `onboarding_complete: true`. Future cold-starts skip the interview.

---

## Common pitfalls

- **The over-detailed interview.** Some agents ask 20 questions. Five is enough. Anything more is noise.
- **The empty answers.** "I don't know" is not an acceptable answer. The agent should push back once, then accept and use defaults.
- **The stale answers.** The owner changes focus but doesn't update `IDENTITY.md`. Solution: agents should check the `last_updated` field and offer to re-interview if it's > 6 months old.
- **The interview-as-test.** The owner treats the interview as a test of the agent's intelligence. It's not. It's a parameter collection.