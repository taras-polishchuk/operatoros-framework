# Module hooks — `hooks`

OperatorOS Core does not implement a generic hooks system in v0.8.0.
"Hooks" in the current sense are:

- Filesystem hooks installed by `core/src/lib/hooks.ts` (git
  pre-commit / post-checkout). These are Core-level, not module-level.
- Module-side conventions: a module may ship a `hooks/` directory
  with shell scripts and instruct operators to wire them manually.

## Future direction

Per the architecture freeze, hooks remain a Core-level concern in
v0.8.0. Module-level hooks are deferred to v0.9.0+ unless surfaced
via ADR.