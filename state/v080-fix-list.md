# Fix List — OperatorOS v0.8.0 Post-Release Audit

> **Mission slug:** `operatoros-v080-audit`
> **Pairs with:** `audit-report.md`

---

## Auto-fixed in this audit (commit `8fef4b0`)

| # | Severity | File | Action | Status |
|---|----------|------|--------|--------|
| F1 | HIGH | `modules/bootstrap-tier-refresh/bin/refresh.sh` | Add `trap rollback ERR` + rollback helper | DONE |
| F2 | HIGH | `modules/mission-runner/bin/init.sh:50` | Add closing `}` to source-task.md heredoc | DONE |
| F3 | HIGH | `modules/drift-detector/principles/local-first.sh` | Exclude `drift-detector/principles/` from violation scan | DONE |

---

## Open findings — v0.8.x patch mission (`.project-state/operatoros-v080-1x-patches/`)

### M1 — bootstrap-md sed prefix
**File:** `modules/bootstrap-md/bin/render.sh:80`

```diff
- $(echo "$modules" | sed 's/^/- /')
+ echo "$modules" | while IFS= read -r line; do printf -- '- %s\n' "$line"; done
```

**Effort:** 2 lines.
**Risk:** None (pure refactor).

---

### M2 — identity-md JSONL parsing
**File:** `modules/identity-md/bin/init.sh:30-37`

Replace the 5 `grep -oE` lines with a single `node -e` invocation:

```bash
answers="$(node -e "
  try {
    const fs = require('fs');
    const lines = fs.readFileSync('$history', 'utf8').trim().split('\n');
    const last = JSON.parse(lines[lines.length - 1]);
    ['q1','q2','q3','q4','q5'].forEach((k, i) => process.stdout.write(last.answers[k] + '\n'));
  } catch (e) { process.exit(0); }
" 2>/dev/null || true)"
```

**Effort:** 10 lines.
**Risk:** None (graceful fallback to "(not provided)" if node unavailable).

---

### M3 — bootstrap-md module-list regex
**File:** `modules/bootstrap-md/bin/render.sh:39`

```diff
- modules="$(grep -E '^- ' "${target}/presets/${preset}/preset.yaml" 2>/dev/null | head -20 || true)"
+ # Only top-level list items, not nested (e.g., deny: list).
+ modules="$(grep -EE '^  - ' "${target}/presets/${preset}/preset.yaml" 2>/dev/null | head -20 || true)"
```

**Effort:** 1 line.
**Risk:** Low (presets may have varying indentation; verify against `personal`).

---

### M4 — drift-detector cross-module false positive
**File:** `modules/drift-detector/principles/everything-replaceable.sh`

Add a denylist for known composition patterns:

```bash
# bootstrap-tier-refresh legitimately composes bootstrap-md + identity-md.
case "$ref" in
  *"bootstrap-tier-refresh/bin/refresh.sh"*) continue ;;
esac
```

**Effort:** 3-5 lines.
**Risk:** None (denylist-only addition).

---

### L1 — methodology timestamp
**File:** `methodology/01-six-principles.md`

Add `Last updated: 2026-07-15` header.

**Effort:** 1 line.
**Risk:** None.

---

### L2 — validate path resolution
**File:** `core/src/commands/validate.ts` (or wherever the path is resolved)

When the path is a bare filename (no `/`), default to workspace root:

```ts
if (!opts.path.includes("/")) {
  const root = await findWorkspaceRoot();
  if (root) opts.path = path.join(root, opts.path);
}
```

**Effort:** 5 lines.
**Risk:** Low (only affects bare-filename calls; absolute/relative paths unchanged).

---

### L3 — typed-substrate denylist
**File:** `modules/drift-detector/principles/typed-substrate.sh`

Add `.github/` to the denylist:

```bash
for yaml in $(find "$target" -maxdepth 4 -name '*.yaml' -o -name '*.yml' \
  -not -path '*/.git/*' -not -path '*/node_modules/*' -not -path '*/.operatoros/*' \
  -not -path '*/.github/*' \
  2>/dev/null); do
```

**Effort:** 1 line.
**Risk:** None (CI config legitimately doesn't need schema).

---

### L4 — mission-runner template generation
**File:** NEW: `scripts/generate-mission-templates.ts` (build step)

Generate the 8 standard artifacts from `methodology/06-decisions-adr.md` +
`methodology/02-doc-lifecycle.md`. Run as part of CI; reject if templates
drift from methodology.

**Effort:** ~80 LOC + CI integration.
**Risk:** Medium (changes the `init` output; if a user customized the
template, the regeneration would clobber). Suggest: opt-in via flag,
not default.

---

## Stretch modules — promotion to v0.8.x (decision needed)

If Taras wants to promote any of the 4 stretch modules:

1. `examples/v080x-candidates/schema-validator/`
2. `examples/v080x-candidates/token-budget/`
3. `examples/v080x-candidates/advisor/`
4. `examples/v080x-candidates/commit-message/`

**Process per CONTRIBUTING.md §"How to propose a capability":**
1. File a capability proposal issue.
2. Walk the 6 gates.
3. If approved, file an ADR per freeze §8.4.
4. After ADR acceptance, move from `examples/v080x-candidates/` to `modules/`.

**Pre-conditions for promotion:**
- Real JSON Schema validator (not heuristic) for `schema-validator`.
- Tokenizer integration (or keep approximation) for `token-budget`.
- All 11 Q-numbers implemented for `advisor`.
- Git hook or pre-commit integration for `commit-message`.

---

## Verification commands

```bash
# Confirm auto-fixes are in place
cd /home/taras/projects/operatoros
git log --oneline -1 8fef4b0

# Run the test suite
cd core && npx vitest run

# Run drift-detector (should report 0 VIOLATIONS)
cd /home/taras/projects/operatoros
bash modules/drift-detector/bin/check.sh --target .

# Manually test mission-runner init (should produce 8 files)
mkdir -p /tmp/fix-list-test
bash modules/mission-runner/bin/init.sh foo --target /tmp/fix-list-test
ls /tmp/fix-list-test/.project-state/foo/  # expect 8 .md files
```