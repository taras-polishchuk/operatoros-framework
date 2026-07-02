# OperatorOS — Examples

Realistic, copy-pastable module and preset examples.

## Phase 1 targets

- `hello-world/` — minimum viable module that just echoes a value. Tests the contract.
- `personal-workspace/` — composition of 3–5 canonical modules corresponding to `operatoros-preset-personal`.

Each example directory contains:

- `module.yaml` (or `preset.yaml` at the top level for workspace examples).
- `init.sh` and `destroy.sh` where appropriate.
- `README.md` explaining what it does and how to test it.
- `tests/` with a smoke-test script.
