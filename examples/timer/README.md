# timer — example OperatorOS module

A minimal time tracker demonstrating `settings`, positional `$1`/`$2` args,
multiple commands, and module-local state.

## Contract (`module.yaml`)

```yaml
version: "0.2"
name: timer
settings:
  default_minutes: 25
  log_path: "state/timer.log"
commands:
  start:
    run: "echo \"[$(date -Iseconds)] started task '$1' for ${2:-$DEFAULT_MINUTES} min\" >> \"$LOG_PATH\""
```

Settings declared in `module.yaml` are exposed to the command shell as
uppercase env vars (`DEFAULT_MINUTES`, `LOG_PATH`). The `run` template uses
standard POSIX shell substitution, so `${2:-$DEFAULT_MINUTES}` falls back
to the configured default when the second arg is omitted.

## Install

```
operatoros add /path/to/this/dir
```

Or, after `operatoros init --personal`, it installs automatically via the
`personal` preset (which references this directory by relative source path).

## Use

```
operatoros run timer start "deep work" 50
operatoros run timer stop  "deep work"
operatoros run timer list
```

## Why this is an example

This module demonstrates three things the `journal` example did not:

1. **`settings`** — module-level config injected as env vars at command exec.
2. **Positional args with defaults** — `$2` is optional, falls back to
   `${DEFAULT_MINUTES}` from settings.
3. **Module-local state** — writes to `state/timer.log` inside the module
   directory; excluded from `export` by the `*.sqlite` / `**/.env` deny-list
   patterns of the personal preset.

Together with `journal`, this is the smallest pair that exercises every
OperatorOS module feature surface.