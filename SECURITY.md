# Security Policy

> **Status:** Phase 0 — placeholder; full policy lands at v0.1.0 release.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1   | :x:                |

(Production-ready policy inserted when `operatoros-core` ships its first binary.)

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Send reports to: **operatoros-security@proton.me** (placeholder; real address at v0.1.0).

A good report includes:

1. **Description** of the vulnerability.
2. **Reproduction steps** — minimum viable command or input.
3. **Affected versions**.
4. **Impact assessment** — what an attacker can do.
5. **Optional: suggested fix**.

## Response Targets

| Stage | Target |
|---|---|
| Acknowledgement | within 48 hours |
| Triage + severity | within 5 business days |
| Patch for High/Critical | within 14 days |
| Patch for Medium | within 30 days |
| Public disclosure | coordinated with reporter, default 90 days after patch |

## Secret scanning

Every PR runs `gitleaks` and `trufflehog` over the changed files. Exclude lists in `*.gitignore` do **not** exempt files from the scan — only layer it.

## Threat model (v0.1.0)

OperatorOS treats the local filesystem as trusted but the local agent (LLM-driven, potentially prompt-injected) as semi-trusted. The Core enforce list (`**/.env`, `**/*.sqlite`, `**/*.key`, etc.) is **layer 1** of secret defence; **gitleaks/trufflehog is layer 2**. A malicious module is out of scope for v0.1.0 (no signature policy yet).

## Cryptography

OperatorOS itself ships no cryptographic primitives; it delegates to OS / VM / host tools (gpg, ssh-keygen, age, OpenSSL). v1.0 will publish a `operatoros.security.cryptography` module contract recommending specific primitives.

## Acknowledgements

Vulnerability reporters are credited in CHANGELOG.md unless they request anonymity.
