#!/usr/bin/env bash
# hello-world greet — print a greeting.
#
# This is the canonical demonstration of a module command:
#   1. The shell script lives at bin/<command>.sh inside the module directory.
#   2. The module.yaml's `commands[name].run` field references it.
#   3. Positional arguments are passed via $1, $2, ... $@ (shell-like).
#   4. `operatoros run hello-world greet` invokes this script with cwd=module_dir.
set -euo pipefail

name="${1:-World}"

echo "Hello, ${name}!"
echo
echo "This message was produced by examples/hello-world/bin/greet.sh"
echo "Module manifest: examples/hello-world/module.yaml"
echo "OperatorOS Core: 0.8.0"