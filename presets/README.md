# OperatorOS — Canonical Presets

A preset is a frozen composition of modules + their inputs. Presets live here so the framework ships with a real, runnable workspace out of the box.

## Phase 1 targets

- `personal.md` — derived from the author's current Workspace OS; six subsystems (income / skill / portfolio / automation / career / knowledge).
- `minimal.md` — journal + tasks only; for new users to verify the framework runs.

## Composition rules

- Preset authors must declare per-field conflict policy if multiple presets are stacked: `override`, `merge`, or `error`.
- Module inputs in a preset can reference secret variables: `${secret:KEY_NAME}`.
- Preset outputs can chain into another preset's inputs.

## Versioning

- Presets follow SemVer, parallel to the modules they reference.
- A preset's `version` field is independent of the framework's `version`.
- Lockfile pins both the modules AND the preset snapshot.
