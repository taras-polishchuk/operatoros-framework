#!/usr/bin/env bash
# module-cookbook hello-world — scaffold the canonical example module.
set -euo pipefail

target="."
force=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --target) target="$2"; shift 2 ;;
    --force)  force=1; shift ;;
    *)        echo "unknown arg: $1" >&2; exit 1 ;;
  esac
done

dest="${target}/examples/hello-world"
if [[ -d "$dest" && $force -ne 1 ]]; then
  echo "module-cookbook: ${dest} already exists. Pass --force to overwrite." >&2
  exit 1
fi

mkdir -p "$dest/bin"

cat > "$dest/module.yaml" <<'YAML'
version: "1.0"
name: hello-world
description: "A canonical OperatorOS module — runnable, over-commented, used as the module-cookbook's worked example."
author: "Your Name"
license: "MIT"
tags: [example, tutorial]

requires:
  core_version: "0.8.0"

commands:
  greet:
    run: "./bin/greet.sh $@"
    description: "Print a friendly greeting. Defaults to 'World' if no name provided."
    args:
      - "<name>             name to greet (default: World)"
YAML

mkdir -p "$dest/bin"
cat > "$dest/bin/greet.sh" <<'SH'
#!/usr/bin/env bash
# hello-world greet — print a greeting.
#
# This is the canonical demonstration of a module command:
#   1. The shell script lives at bin/<command>.sh inside the module directory.
#   2. The module.yaml's `commands[name].run` field references it.
#   3. Positional arguments are passed via $1, $2, ... $@ (shell-like).
#   4. operatoros run hello-world greet invokes this script with cwd=module_dir.
set -euo pipefail

name="${1:-World}"

echo "Hello, ${name}!"
echo
echo "This message was produced by examples/hello-world/bin/greet.sh"
echo "Module manifest: examples/hello-world/module.yaml"
echo "OperatorOS Core: 0.8.0"
SH
chmod +x "$dest/bin/greet.sh"

cat > "$dest/README.md" <<'MD'
# hello-world (example module)

A canonical OperatorOS module — produced by `module-cookbook hello-world`.
Run it with:

```bash
operatoros add hello-world   # if shipped as a separate module
# OR
cp -r examples/hello-world modules/
operatoros run hello-world greet "Taras"
```

## Anatomy

- `module.yaml` — module manifest (validated against `schemas/module.schema.json`).
- `bin/greet.sh` — shell script invoked by `operatoros run hello-world greet`.
- `README.md` — this file.

## Key idea

OperatorOS modules are **shell-string dispatches**, not Node-runtime calls.
The manifest's `commands[name].run` is a shell template; `operatoros run`
spawns it via `child_process.spawn` with `cwd` set to the module directory.
MD

echo "module-cookbook: scaffolded ${dest}"