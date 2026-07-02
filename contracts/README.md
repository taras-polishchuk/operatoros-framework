# OperatorOS — Contracts (human-readable)

> **Status:** Phase 0 — contract docs not yet authored. This README is the contract for how they're authored.

Each contract in this directory documents a single file format that authors edit by hand. Schemas live in `../schemas/` and are derived from these documents.

## Files (planned for Phase 1)

- `module.md` — module contract — what `module.yaml` means, why each field exists, when to use it.
- `preset.md` — preset contract — composition rules, conflict policies, examples.
- `workspace.md` — workspace contract — `operatoros.toml`, `.operatoros/`, authority map.

## Style

- **One paragraph at the top** — what this contract is, who writes it.
- **Field-by-field reference** — every field, with type, required/optional, default, and an example.
- **Examples** — minimal and realistic.
- **Cross-references** — link to module examples in `../examples/` and to the schema in `../schemas/`.
- **Diataxis frontmatter** — these are reference docs, not tutorials.

```markdown
---
type: reference
---
```
