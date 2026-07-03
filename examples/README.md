# OperatorOS — Examples

Real, working modules that ship with OperatorOS Core.

## `journal/`

The simplest possible OperatorOS module. One `module.yaml`, zero JavaScript, zero external dependencies.

- **What it does:** append-only timestamped journal entries to `journal.txt`.
- **Commands:**
  - `add <text>` — append a timestamped entry.
  - `list` — print all entries.
- **Use case:** demo of the `module.yaml` contract. Also useful as-is for keeping notes.

### Install

```bash
# From a checkout of operatoros-framework:
operatoros add /path/to/operatoros-framework/examples/journal
```

### Run

```bash
operatoros run journal add "shipped v0.5.0-alpha"
operatoros run journal list
```

### Output

```text
[2026-07-02T23:50:00+00:00]  shipped v0.5.0-alpha
```

## Adding your own

See [CONTRIBUTING.md](../CONTRIBUTING.md#how-to-add-a-module) for the full guide.