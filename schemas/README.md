# OperatorOS — JSON Schemas

Source-of-truth contracts for every manifest in an OperatorOS workspace. The Core CLI validates every YAML file against these schemas at every boundary (init, validate, add, apply).

## Draft

All schemas use **JSON Schema 2020-12** ([draft spec](https://json-schema.org/draft/2020-12/schema)).

## Files

| File | Validates | Used by |
|---|---|---|
| `workspace.schema.json` | `operatoros.yaml` | `init`, `validate`, `apply`, `export` |
| `module.schema.json` | `module.yaml` | `add`, `validate`, `apply` |
| `preset.schema.json` | `preset.yaml` | `init` (copies canonical preset), `apply`, `validate` |

## Validation

The Core CLI validates silently during normal operation. To run validation explicitly:

```bash
operatoros validate operatoros.yaml         # workspace
operatoros validate modules/<name>/module.yaml  # module
operatoros validate presets/<name>/preset.yaml  # preset
```

A failed validation exits with code 1 and prints the specific errors:

```text
✗ /path/to/operatoros.yaml — INVALID against "workspace" schema
    /name must match pattern "^[a-z0-9][a-z0-9_-]*$"
    /version must match pattern "^[0-9]+\.[0-9]+$"
```

## Schema evolution

Until v1.0, schemas are alpha. Changes may happen in minor versions.

At v1.0, the schemas become stable. Breaking changes (field removals, regex tightening, structural shifts) will require a major version bump and a migration guide.

Additive changes (new optional fields, new top-level keys) are NOT breaking and can ship in minor versions.
