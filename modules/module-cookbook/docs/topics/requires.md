# Module requires — `requires`

`requires` declares dependencies:

```yaml
requires:
  modules:
    - bootstrap-md
    - identity-md
  core_version: "0.8.0"
```

## Semantics in v0.8.0

- `core_version`: informational. Not enforced at install time.
- `modules`: informational. Not auto-installed.

Operators are responsible for installing required modules separately.
This matches the v0.8.0 Local-First principle: no auto-pull from
remote registries (forbidden).