---
name: Module proposal
about: Propose a new first-party module for OperatorOS
title: "[MODULE] <module-name>"
labels: ["module", "needs-design"]
assignees: []
---

## Module identity

- **Name (reverse-DNS):** <!-- e.g. personal/journal -->
- **Category:** <!-- knowledge | automation | network | build | app | security -->
- **License:** <!-- MIT unless there's a reason -->

## What it does

<!-- 2–4 sentences. What capability does this module add? What existing problem does it solve? -->

## Inputs

<!-- List with types. -->

| Name | Type | Default | Required? | Secret? |
|---|---|---|---|---|
| example_string | string | "hello" | no | no |

## Outputs

| Name | Type | Secret? |
|---|---|---|
| output_path | path | no |

## Dependencies

- **Modules:** <!-- list of `mod/ref@version` -->
- **Runtime:** <!-- Python ≥3.11, sqlite ≥3.40, etc. -->
- **External services:** <!-- e.g. GitHub API, Discord webhooks -->

## Conflicts

<!-- Other modules this one cannot co-exist with. -->

## Healthcheck

<!-- How do we know this module is healthy? -->

## Preset example

```yaml
# What does the call-site look like in a preset?
- ref: personal/journal@>=0.1.0
  inputs:
    example_string: "world"
```

## Category rationale

<!-- Why does this deserve a category slot? Any category-merge suggestion? -->

## Implementation plan

<!-- High-level — 5–10 bullets. -->
