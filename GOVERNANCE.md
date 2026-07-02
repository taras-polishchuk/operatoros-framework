# Governance

> **Phase 0 status:** BDFL for v0.x. Transition plan documented but not yet active.

## v0.x (currently active)

- **BDFL:** Taras Polishchuk.
- **Core maintainers:** to be decided; up to 2 additional co-maintainers as Phase 1 begins.
- **Module / preset authors:** own their respective artifacts. PRs to a module require the author's approval (or 1 core maintainer if author is unreachable for 14 days).
- **Core PRs:** require 1 core maintainer approval + passing CI.
- **Breaking-change discipline:** any change to `operatoros.core`, `operatoros.module.contract`, or `operatoros.preset.contract` is breaking. Major SemVer bump required. Posted to `#releases` Discord and CHANGELOG.md.

## v1.0 transition plan (target ~9 months from v0.1.0)

- **Lazy consensus.** No veto-based governance; decisions by silence + objection.
- **Steering committee** of 3 (Taras + 2 to be elected by contributors).
- **Module ecosystem oversight.** A dedicated curator (or rotation of 2) reviews incoming modules for security + quality.

## Conflict resolution

1. **Within scope:** module / preset authors have final say over their artifact.
2. **Cross-cutting issues** (Core API, security policy, governance itself): discussion → proposal → lazy-consensus vote if no consensus after 14 days.
3. **Code of Conduct violations:** documented in [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md); escalation path in §Enforcement.

## Licensing

- **Code:** MIT.
- **Documentation:** CC-BY-4.0 (proposed; not yet enforced).
- **Trademark:** "OperatorOS" name and logo are reserved; community use permitted under the Linux Foundation trademark policy (when applicable).

## Adding governance changes

A PR to this file requires:
- One core maintainer approval.
- 14-day public comment period (issues or discussions).
- Zero unaddressed objections.
