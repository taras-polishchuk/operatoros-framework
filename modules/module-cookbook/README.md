# module-cookbook

**Tier:** Showcase
**Q-coverage:** Q11
**Status:** v0.8.0 M1 Stream F

Worked-example module generator + educational Markdown printer.
Demonstrates the canonical module shape and serves as a reference
for engineers adding their own modules.

## Subcommands

- `hello-world` — Scaffold `examples/hello-world/` (a complete runnable
  module: `module.yaml`, `bin/greet.sh`, `README.md`).
- `show <topic>` — Print educational Markdown for one of:
  `commands`, `settings`, `hooks`, `requires`, `manifest`.

## Local-First

No network calls. Pure filesystem write (scaffold) + read (docs).

## Usage

```bash
operatoros add module-cookbook
operatoros run module-cookbook hello-world --target /path/to/workspace
operatoros run module-cookbook show commands
```