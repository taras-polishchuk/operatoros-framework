# Roadmap

> **Status:** v0.5.0-alpha. Phase 2 (product hardening) is the current focus. The roadmap below reflects what was actually shipped and what the next user-relevant milestone looks like.

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

### v0.5.0-alpha — Product hardening (2026-07-02)

- Removed aspirational placeholders (registry entries, presets, empty dirs)
- 7 commands (down from 10 after pruning dead code)
- 24 tests passing
- README, CHANGELOG, docs rewritten to reflect current state
- CI cache path bug fixed

## Next milestone — v0.6.0 (dogfooding-driven)

The next release will not be a feature push. It will be whatever the first real-world use of OperatorOS reveals is missing.

The plan:

1. **Use OperatorOS to manage Taras's own workspace** — install it on a real machine, scaffold a real workspace, run real `add`/`run`/`export` cycles against real files.
2. **Track every friction point** — every confusing error message, every command that did the wrong thing, every time the docs didn't match reality.
3. **Cut what isn't used.** If a command or flag wasn't touched during real use, remove it.
4. **Harden what was touched.** Error messages become clearer. Edge cases get tested. Documentation gets aligned.

## Explicitly not planned

Until the first external user runs OperatorOS for a non-trivial task and asks for a feature, the following will NOT be added:

- Cloud features
- Web UI / dashboards
- Synchronization / multi-device
- Marketplace
- Telemetry
- AI features that aren't required to satisfy the six principles
- Module signing (premature for a single-user framework)
- Native single-binary compilation (bun/deno compile) — Node binary is sufficient
- A registry of community modules — modules ship via the personal preset and local paths until there's a real second contributor

## Decision criteria for new features

A proposed addition is worth doing if and only if:

1. **At least one real user is asking for it.** Hypothetical users don't count.
2. **It survives first contact with reality.** If the use case the user describes changes once they try it, it's not a real requirement.
3. **It fits in one of the six principles.** If it requires a seventh principle, the principles need to be re-thought first.
4. **It can be deleted later without breaking anything.** Avoid coupling that makes removal expensive.

Anything that fails any of these gets either postponed or removed.