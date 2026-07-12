# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.6.x   | :white_check_mark: |
| 0.5.x   | :white_check_mark: |
| 0.4.x   | :white_check_mark: |
| < 0.4   | :x:                |

Pre-1.0 versions are short-lived alpha releases. Security fixes will be backported to the most recent minor version only.

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Send reports privately to: **Taras Polishchuk via GitHub Security Advisories** — open one at https://github.com/taras-polishchuk/operatoros-framework/security/advisories/new (private; only the maintainer sees it).

A good report includes:

- A clear description of the vulnerability
- Steps to reproduce, including any input that triggers it
- The expected behaviour and the actual behaviour
- Your OperatorOS Core version (`operatoros version` output)
- A suggested fix, if you have one

You will receive an acknowledgement within 72 hours. A fix timeline will be discussed before any public disclosure.

## Threat model

OperatorOS Core is a local CLI that runs with the user's own user permissions. The threat model is:

- **In scope:** the local CLI process reading/writing files in the user's workspace; running shell commands declared as hooks; cloning git repositories the user explicitly requests via `add`. Note: OperatorOS does **not** fetch a remote module registry — modules are installed from local paths or git URLs the user explicitly provides via `add`.
- **Out of scope:** remote attacks against the OperatorOS binary itself; supply-chain attacks against npm packages we depend on (use `npm audit` if this matters to you); behavior of third-party modules you install with `add`.

The deny-list in `export` (`vault/**`, `**/.env`, `**/*.sqlite`, `**/id_rsa*`, etc.) is a defense-in-depth measure. It is not a security boundary. Do not rely on it to keep secrets safe from a determined attacker.

## Cryptographic signing

OperatorOS does not currently sign modules or the binary. A cosign-based signing workflow is on the long-term roadmap but is not yet implemented. Until then, treat modules you install with `add <git-url>` as you would treat any third-party code.