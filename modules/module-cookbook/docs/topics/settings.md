# Module settings — `settings`

`settings` is a free-form object (per `module.schema.json`,
`additionalProperties: true`). Operators can store arbitrary
per-module configuration there:

```yaml
settings:
  max_file_size_mb: 100
  default_format: "md"
  exclude_paths:
    - "vendor/"
    - ".cache/"
```

## Reading settings

Module commands read settings via their shell scripts. Convention
(not enforced) is to write a `bin/settings.sh` helper that emits
`KEY=VALUE` lines for `eval`.

## Schema

There is no schema for `settings`. Modules are free to define their
own. If you want validation, ship a separate `settings.schema.json`
in the module directory and validate against it at runtime.