# Roadmap

> **Status:** v0.6.0 — methodology pivot complete. The roadmap below reflects what was shipped and what the next user-relevant milestone looks like.

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

## Next milestone — v0.7.0 (dogfooding + methodology validation)

The next release will not be a feature push. It will validate the methodology by using it.

The plan:

1. **Apply OperatorOS to a fresh engineering workspace.** Create a new project (homelab-template, career-template, or similar), run `operatoros init`, run `operatoros apply`, populate it with one module, document the onboarding interview answers.
2. **Track every friction point.** Every confusing error message, every doc that didn't match reality, every time the bootstrap was too heavy or too thin.
3. **Tighten the methodology docs.** What worked, what didn't, what was missing. Update `methodology/*.md` based on real use.
4. **Test the bootstrap protocol.** Have a fresh AI agent cold-start in the workspace. Verify the four-tier reading system works as designed.
5. **Write a case study.** One engineer (the author) using the methodology for 4-6 weeks. What survived, what was abandoned, what was added.

## Explicitly not planned

Until a second real engineer applies the methodology to a non-trivial workspace and asks for a change, the following will NOT be added:

- Cloud features
- Web UI / dashboards
- Synchronization / multi-device
- Marketplace
- Telemetry
- AI features that aren't required to satisfy the six principles
- Module signing (premature for a methodology artifact)
- Native single-binary compilation (bun/deno compile) — Node binary is sufficient
- A registry of community modules — modules ship via the personal preset and local paths until there's a real second contributor

## Decision criteria for new methodology additions

A proposed methodology document is worth writing if and only if:

1. **At least one real engineer needed it.** Hypothetical users don't count.
2. **It survives first contact with reality.** If the use case the user describes changes once they try it, it's not a real requirement.
3. **It fits in one of the six principles.** If it requires a seventh principle, the principles need to be re-thought first.
4. **It can be ignored later without breaking anything.** Avoid coupling that makes removal expensive.

Anything that fails any of these gets either postponed or not written.