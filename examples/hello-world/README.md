# hello-world (example module)

A canonical OperatorOS module — produced by `module-cookbook hello-world`.
Run it with:

```bash
# 1. Copy the example into your modules directory (or use module-cookbook):
operatoros add module-cookbook
operatoros run module-cookbook hello-world --target .

# 2. Move the scaffold into modules/:
cp -r examples/hello-world modules/

# 3. Run it:
operatoros run hello-world greet "Taras"
```

## Anatomy

- `module.yaml` — module manifest (validated against `schemas/module.schema.json`).
- `bin/greet.sh` — shell script invoked by `operatoros run hello-world greet`.
- `README.md` — this file.

## Key idea

OperatorOS modules are **shell-string dispatches**, not Node-runtime calls.
The manifest's `commands[name].run` is a shell template; `operatoros run`
spawns it via `child_process.spawn` with `shell: true` and `cwd` set
to the module directory.