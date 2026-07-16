# Module commands — `commands`

A module's `commands` map declares every subcommand the module exposes
under `operatoros <module-name> <command>`.

Each command has:
- `run`: a shell-string template. Invoked via `child_process.spawn`
  with `shell: true` and `cwd` set to the module directory.
- `description`: a human-readable summary.
- `args`: an array of free-form argument descriptors (informational;
  not parsed by Core).

## Example

```yaml
commands:
  greet:
    run: "./bin/greet.sh $@"
    description: "Print a greeting."
  diff:
    run: "./bin/diff.sh $@"
    description: "Show what changed."
```

## Runtime

`operatoros run hello-world greet Taras` resolves to:

```bash
cd modules/hello-world && ./bin/greet.sh Taras
```

Positional arguments (`$1`, `$2`, ... `$@`) are shell-expanded from
the user-provided args.

## Where the shell scripts live

Convention: `bin/<command>.sh` inside the module directory. This is
not enforced by `module.schema.json` — the `run` field can be any
shell command — but it is the canonical pattern.