# Document Lifecycle

> **Status:** Constitutional convention. Every document in your workspace has a state. State transitions are explicit.

Documents are not eternal. They have births, lives, and deaths. A methodology that doesn't account for this accumulates stale documents — which eventually become indistinguishable from active ones.

---

## The four states

| State | Definition | Behavior |
|---|---|---|
| **draft** | Under construction. Not yet authoritative. | Cited only by author. May be moved, renamed, or deleted freely. |
| **active** | Authoritative for its concept. Living document. | Cited by the system. Changes are tracked. New drafts fork from here. |
| **legacy** | Replaced by a newer version, but still referenced by older artifacts. | Read-only. Not modified. Exists to keep old references valid. |
| **archived** | No longer relevant. Kept for historical value only. | Read-only. Not cited by anything except archive index. |

Every document in your workspace should declare its state. The declaration is typically a header line:

```markdown
> **Status:** draft | active | legacy | archived
> **Replaces:** <path>     (if state = active and it replaces something)
> **Replaced by:** <path>  (if state = legacy)
> **Last updated:** YYYY-MM-DD
```

---

## The transitions

```
draft  ──────────► active  ──────────► legacy  ──────────► archived
  ▲                   │                    │
  │                   │                    │
  └───────────────────┘                    │
  (minor revisions)                        │
                                           │
                              active ──────┘
                              (newer version takes over)
```

**draft → active.** The document is finished. The author publishes it. From this moment, it is cited by other documents.

**active → legacy.** A new version of the document replaces this one. The old version is kept read-only so existing references don't break.

**legacy → archived.** The old version is no longer needed. Move it to `ARCHIVE/` (or your workspace's archive directory). Remove from indexes.

**active → archived (skipping legacy).** Rare. Only when the document was never cited by anything else (e.g., a doc published and immediately superseded).

**draft → archived.** Rare. When the draft is abandoned without ever being published.

**archived → active.** Effectively a re-publication. Document the reason. The archive should not be silent.

---

## Mission artifacts

Mission artifacts (per Workspace OS Article VII — Sprint Pattern) live in `.project-state/<mission-slug>/` and follow their own lifecycle:

| State | Definition |
|---|---|
| **planning** | Mission is being scoped. `source-task.md` exists. No work yet. |
| **in-progress** | Mission is being executed. `progress.md` updates as work happens. |
| **review** | Mission work is complete. `final-report.md` is being written. |
| **done** | Mission is closed. `final-report.md` is the authoritative record. |
| **abandoned** | Mission was stopped before completion. Reason is recorded. |

A mission moves from `in-progress` to `done` only when `final-report.md` exists and is approved by the owner.

---

## How agents use lifecycle

When an AI agent reads your workspace:

1. It reads `bootstrap.md` to find the bootstrap files.
2. The bootstrap files declare which documents are active vs legacy vs archived.
3. The agent reads only active documents by default.
4. The agent may read legacy documents only if the task explicitly references them.
5. The agent never reads archived documents unless the human asks.

This is how the lifecycle saves tokens: most of your workspace's documents are legacy or archived at any given moment. The active set is small.

---

## Practical questions

**Q: How do I decide if a document is draft or active?**
A: If removing the document would break something that depends on it, it's active. If nothing depends on it yet, it's draft.

**Q: When do I move a document to legacy?**
A: When a new version takes over. Don't delete the old version. Move it to legacy state, link to the new one in the old file's header.

**Q: Can I revive a legacy document?**
A: Yes, but treat it as a re-publication. The document that replaced it may also need to move to legacy.

**Q: What about documents that never change?**
A: They're active by default. "Active" means "the current authoritative version", not "constantly changing".

---

## Common pitfalls

- **The eternal draft.** A document that stays in `draft` state for months because it's "almost done". Decide: either finish it (move to active) or archive it.
- **The silent death.** A document that gets replaced without being moved to legacy. Old references break silently.
- **The legacy pile.** A workspace with 50 legacy documents and 5 active ones. Consolidate: if 10 legacy docs are all replaced by one active doc, archive 9 of them.
- **The hidden archive.** An `ARCHIVE/` directory that no one indexes. Agents read it accidentally. Keep an archive index.