# Roadmap

> **Status:** Hypothesis. Each release date below is a **target**, not a commitment.

## v0.1.0 — alpha (target: T+0)

**Goal:** ship a `operatoros-core` binary that can parse `module.yaml`, validate against `module.schema.json`, and apply a single canonical preset (`personal`).

Includes:
- `operatoros-core` in Go/Rust (final language TBD).
- TOML parser for `operatoros.toml`, YAML parser for `module.yaml` / `preset.yaml`.
- Module loader, lockfile resolver (`.operatoros/lock.toml`).
- Plan/apply split; append-only receipts (`.operatoros/receipts/*.jsonl`).
- `operatoros init` (4-tier UX), `validate`, `plan`, `apply`, `doctor`, `version`.
- `operatoros presets/personal.md` — the canonical preset (= distilled current Workspace OS).
- `docs/` MkDocs site (Material theme).
- 3 example modules: `hello-world`, `secrets`, `journal`.
- CI: yamllint, markdownlint, JSON Schema lint, gitleaks.
- MIT LICENSE.

## v0.2.0 — beta (target: T+2 months)

**Goal:** presetable composition + 3 export targets + `authority.toml`.

- Preset composition (overlay rules, conflict policy per field).
- `mod-export-static` (MkDocs → dist/).
- `mod-export-docker` (OCI image).
- `mod-export-llm-bundle` (single-file LLM context).
- `authority.toml` per workspace.
- `operatoros init` tier 2–4 expanded.
- Init wizard + secrets scanning CI step.

## v0.3.0 — RC (target: T+5 months)

**Goal:** registry foundation + remaining export targets + signature groundwork.

- `mod-export-hetzner`, `mod-export-github`.
- `operatoros.yaml` annotation file (Artifact Hub style).
- OCI distribution support.
- cosign signature groundwork for v1.0 enforcement.
- Lazy-consensus governance experiment (BDFL→committee transition prep).

## v1.0.0 — stable (target: T+9 months)

**Goal:** frozen `apiVersion: operatoros.dev/v1.0`, LTS promise 18 months, BDFL→committee handover.

- Frozen Core API; module/preset contracts stable.
- Mandatory cosign signatures on Core-published modules.
- GitHub Pages site live; community Discord promoted.
- 5–10 community-published modules accepted.
- 2+ real users running `operatoros-preset-personal` in production.

## Post-1.0 themes (preview)

- **Workspace observability.** `mod-otel` first-class.
- **Multi-workspace authority.** Cross-workspace secret sharing with provenance.
- **Plugin marketplace UI.** Web UI for module browsing.
- **Auto-curation.** AI-assisted PR review for community modules.

---

## Decision log

| Decision | Status |
|---|---|
| License = MIT | proposed |
| GitHub org = `operatoros-framework` (or `operatoros-core` alt) | blocked on Taras |
| Domain = `operatoros.dev` | blocked on Taras |
| MVP language for Core = Go (vs Rust) | TODO — open in research follow-up |
| Repo initial visibility = public | blocked on Taras |

---

## Out of scope (deliberate)

- **Cloud-specific first-class support.** OperatorOS is local-first; Hetzner export is the only first-party cloud target. (AWS/GCP exports are community modules.)
- **Mobile app.** Desktop + CLI only at v1.0.
- **Windows installer.** Linux + macOS CLI first; Windows via WSL2 in v1.0.
- **Plugin sandboxing.** v1.0 trusts declared module contracts; runtime sandbox lands in v2.0.
