# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue. Report it privately through
[GitHub private vulnerability reporting](https://github.com/mtk2608/Portfolio-Website/security/advisories/new).
I aim to respond within 7 days.

## How this site is protected

- **Static output only:** no server, database or user accounts to attack.
- **Strict security headers** (`public/_headers`): same-origin-only CSP, HSTS,
  no framing, locked-down Permissions-Policy. These are enforced by tests.
- **CI gate on `main`:** type checks, tests, dependency audit, dependency review,
  secret scanning (gitleaks), CodeQL, and workflow linting (zizmor) must pass
  before a merge.
- **Supply chain:** lockfile-exact installs with install scripts disabled, npm
  registry signature verification, actions pinned to commit SHAs, and
  Dependabot updates with a 7-day cooldown.
