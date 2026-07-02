# Pull Request

## Title

`<scope>(<area>): <one-line summary>`

## Summary

<!-- 2–4 sentences. What changes and why. -->

## Linked issues

<!-- `Closes #NN`, `Refs #NN`. -->

## Affected surface area

<!-- Tick all that apply. -->

- [ ] Core API (`operatoros-core`)
- [ ] Module contract (`schemas/module.schema.json` etc.)
- [ ] Preset contract
- [ ] Documentation (Diataxis-tagged in frontmatter)
- [ ] Export modules
- [ ] Security model
- [ ] Governance
- [ ] Examples
- [ ] CI / tooling

## Type of change

<!-- Tick one. -->

- [ ] Bug fix (non-breaking)
- [ ] New feature (non-breaking)
- [ ] Breaking change (SemVer major bump required)
- [ ] Documentation
- [ ] Refactor (no behaviour change)
- [ ] Test addition

## Backwards compatibility

<!-- How does this interact with users on previous versions? Migration steps? -->

## Test plan

<!-- What did you test? Include commands and outputs. -->

```bash
# Example:
$ operatoros validate ./modules/personal/journal
✓ module.yaml: valid
✓ init.sh: present
✓ healthcheck.sh: present
✓ healthcheck: passed in 1.2s
```

## Risks

<!-- What could go wrong? Mitigations? -->

## Checklist

<!-- Standard OperatorOS PR checklist. -->

- [ ] Opened an issue first (for non-trivial changes)
- [ ] Tests added/updated
- [ ] Documentation updated (if applicable)
- [ ] Diataxis frontmatter on doc changes
- [ ] `gitleaks` ran clean on diff
- [ ] No drive-by refactors
- [ ] CI is green
