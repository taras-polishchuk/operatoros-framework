# Governance

> **Status:** v0.6.0 — BDFL model active. Methodology pivot complete; governance remains single-operator-driven until v1.0.

## Current model (v0.x)

- **BDFL:** Taras Polishchuk.
- **CODEOWNERS:** all files require BDFL review (`@taras-polishchuk`).
- **Module / preset authors:** own their respective artifacts. PRs to a module require the author's approval (or the BDFL if the author is unreachable for 14 days).
- **Core PRs:** require BDFL approval + passing CI on Node 20.x + 22.x.

## What the BDFL decides

- Feature additions (which features, in which order)
- Breaking changes (what counts as breaking, when to bump major)
- Release timing
- Anything else not delegated below

## What the BDFL does NOT decide alone

- Security disclosures — see [SECURITY.md](SECURITY.md) for the private reporting path.
- Code of Conduct violations — handled per the [Contributor Covenant](CODE_OF_CONDUCT.md) escalation process.

## Transition plan (target: v1.0)

At v1.0, governance moves from BDFL to a steering committee:

- **Steering committee:** 3 members (Taras + 2 to be elected by contributors at v1.0).
- **Decision-making:** lazy consensus. Decisions by silence + objection.
- **Module curation:** a dedicated curator (or rotation of 2) reviews incoming modules for security + quality.

Until v1.0, the BDFL model is the entire governance model. No transition is in progress.

## Breaking changes

Any change to the following is breaking and requires a major version bump:

- `schemas/workspace.schema.json` (removing or renaming fields, tightening regexes)
- `schemas/module.schema.json` (same)
- `schemas/preset.schema.json` (same)
- The `operatoros` CLI command surface (removing or renaming commands)
- The deny-list behavior in `export` (changing default patterns)
- The hook event names (`pre-init`, `post-apply`, etc.)

Additive changes (new optional fields, new commands, new presets, new modules) are NOT breaking and can ship in minor versions.

## Licensing

- **Code:** MIT (see [LICENSE](LICENSE)).
- **Documentation:** MIT (same).
- **Trademark:** "OperatorOS" is the project name. No trademark registered. Use freely with attribution.