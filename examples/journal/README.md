# journal — example OperatorOS module

The simplest possible module. Demonstrates the contract format.

## Contract (`module.yaml`)

```yaml
version: "0.2"
name: journal
description: ...
commands:
  add:
    run: "echo ..."
```

See `module.yaml` for the full schema (validated against `schemas/module.schema.json`).

## Install

```
operatoros add /path/to/this/dir
```

## Use

After installation, the module's commands are exposed under `operatoros journal <cmd>`.

## Why this is an example

This module demonstrates that the `module.yaml` contract is sufficient — no JavaScript,
no build step, no registry. A module is just a directory with a `module.yaml` at the root.
