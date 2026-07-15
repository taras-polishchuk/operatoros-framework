# Roadmap

> **Status:** v0.7.0 — Workspace Catalog shipped. The roadmap below reflects what was shipped and what the next user-relevant milestone looks like.

## Shipped

### v0.1.0-alpha — Public scaffold (2026-07-02)

- Repository + LICENSE + governance + landing page
- Decision: rename from `AdaptOS` to `OperatorOS`

### v0.2.0-alpha — Working CLI (2026-07-02)

- `init`, `validate`, `add`, `export`, `version` commands
- 3 JSON-Schema definitions
- 1 example module (`journal`)
- 13 tests passing

### v0.3.0-alpha — Apply + run + binary (2026-07-02)

- `apply` and `run` commands
- Single-file binary via ncc bundling (~750 KB)
- Unix + Windows installer scripts

### v0.4.0-alpha — Registry + hooks + multi-preset (2026-07-02)

- Hooks system (6 lifecycle events)
- Multi-preset support
- Public registry (since trimmed in v0.5.0)

### v0.5.0-alpha — Prism (2026-07-02)

- 10 → 7 commands (after pruning dead code)
- 24 tests passing
- README, CHANGELOG, docs rewritten to reflect current state
- CI cache path bug fixed

### v0.5.2-alpha — Local-First invariant (2026-07-11)

- "AI-Native" principle removed (no AI primitives ever shipped)
- "Local-First" principle added with constitutional test
- `scripts/embed-assets.js` rewritten (was silently shipping stale literals)
- 14 KB of stale manual JSON literals removed from `core/src/embedded-assets.ts`
- New `__tests__/local-first.test.ts` enforces no-network-call invariant

### v0.6.0 — Methodology pivot (2026-07-11)

- Project reframed: from "AI-native personal OS runtime" to "methodology-as-artifact for engineers"
- README rewrite with explicit "What this is NOT" anti-positioning
- `methodology/` directory added with five documents (six principles, doc lifecycle, token economy, agent bootstrap, onboarding interview)
- `bootstrap.md` added at repo root for AI agent entry-point
- CHANGELOG v0.6.0 entry documents the pivot
- Landing page (`operatoros.html`) updated to match new framing
- No code changes; no schema changes; no CLI changes

### v0.7.0 — Workspace Catalog (2026-07-14)

- New `schemas/catalog.schema.json` — durable-only fields (`path`, `type`, `size`, `mtime`, `content_hash`, `indexed_at`); ephemeral fields explicitly rejected by `additionalProperties: false`.
- New library `core/src/lib/catalog.ts` — `buildCatalog()` / `readCatalog()` / `scanFresh()` / `isCatalogStale()` + `CATALOG_EXCLUDES` denylist.
- Six new CLI commands: `operatoros index`, `doctor`, `stats`, `stale`, `prune`. CLI surface 7 → 13.
- `operatoros init` now also generates `.operatoros/index.json` (the catalog) as part of scaffolding.
- Local-First invariant test extended to scan `methodology/` (ROADMAP gate 5 satisfied).
- 18 new tests added (10 catalog + 8 commands). All RED-then-GREEN.
- No methodology changes; no governance changes; no Workspace OS contract changes.

## Next milestone — v0.8.0 (real-use validation + cleanup)

The next release will validate v0.7.0 against the same `methodology/` documents — a dogfooding pass plus read-the-source-code-against-the-schema pass.

### Acceptance criteria — v0.8.0 ships when ALL of these are true

1. **External tester has run the v0.7.0 tester-packet flow.** A non-author completes `.github/ISSUE_TEMPLATE/user_test_session.md` against the v0.7.0 binary; feedback lands in CHANGELOG or relevant methodology doc.
2. **All six methodology documents have a "Changes from real use" section.** Each one has at least one entry citing an issue raised by the real-use run (rather than aspirational content). This satisfies ROADMAP v0.7.0 gate 2 (previously skipped because no real use yet).
3. **Catalog schema has been validated against the README docs.** Specifically: every user-facing claim in README §"The artifact" (e.g., "JSON-Schema definitions for operatoros.yaml, module.yaml, and preset.yaml. No bundled modules") matches what `schemas/` contains. Section 3 of README links to all 5 bundled schemas from v0.7.0 (the catalog schema was the missing one).
4. **`bin/operatoros` install + smoke flow works on a fresh non-WSL Linux.** Tested in a clean `docker run --rm -it ubuntu:latest` container via the canonical install script. No leftover v0.6.0 binary on `$PATH` confuses the test.
5. **No unaddressed issues from the v0.7.0 release.** Open issues filed against `v0.7.0` (if any) have either been fixed in v0.8.0 prep, deferred to v0.9.0 with rationale, or closed with explanation.
6. **Methodology `05-onboarding-interview.md` is exercised against a real user.** Triggers a documentation pass that adds an "interview transcript" section showing actual answers from a non-author engineer.

### Planned activities

1. Send tester-packet.md to a non-author engineer. Track every friction point.
2. Run v0.7.0 binary in a clean container; verify install + 6 new commands end-to-end.
3. Tighten the methodology docs based on tester feedback.
4. Write a 4-week case study: one engineer (the author) using v0.7.0 in a real workspace. What survived, what was abandoned, what was added.
5. Re-validate the catalog schema against the README claim about schema count.
6. Apply any "from real use" updates to methodology/01-06.

### Explicitly not planned

Identical to v0.7.0 "Explicitly not planned" (cloud, web UI, sync, marketplace, telemetry, AI features that aren't required by the principles, module signing, native single-binary compilation, central module registry). v0.8.0 is a validation release, not a feature release.

## Decision criteria for new methodology additions

Identical to v0.6.0 criteria:

1. **At least one real engineer needed it.** Hypothetical users don't count.
2. **It survives first contact with reality.** If the use case the user describes changes once they try it, it's not a real requirement.
3. **It fits in one of the six principles.** If it requires a seventh principle, the principles need to be re-thought first.
4. **It can be ignored later without breaking anything.** Avoid coupling that makes removal expensive.

Anything that fails any of these gets either postponed or not written.