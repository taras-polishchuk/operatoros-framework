# Module manifest — `module.yaml`

A module manifest declares:

- `version`, `name` (required by `schemas/module.schema.json`).
- `description`, `author`, `license`, `homepage`, `tags` (optional metadata).
- `commands` (a map of subcommand name → `{ run, description, args }`).
- `requires` (a map of `modules` and `core_version`).
- `settings` (free-form per-module settings).

## Example

```yaml
version: "1.0"
name: hello-world
description: "Canonical worked example."
author: "Your Name"
license: "MIT"

requires:
  core_version: "0.8.0"

commands:
  greet:
    run: "./bin/greet.sh $@"
    description: "Print a greeting."
```

## Validation

Every `module.yaml` is validated against `schemas/module.schema.json`
before the module can be installed. Validation runs at `operatoros add`
time.