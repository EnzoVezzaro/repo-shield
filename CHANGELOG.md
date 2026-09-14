# Changelog

All notable changes to Repo Shield (web site, CLI, Agent Skill) are documented
here. Versions track the npm package `@reposell/repo-shield`; the same commits
ship the site and the skill.

## [0.1.5] - 2026-09-13

### Changed

- Donation buttons now point to the current Stripe Payment Link. The link is a
  single build-time source (`VITE_STRIPE_PRO_PAYMENT_LINK`), so every donate
  button on the site updates together.

### Added

- `CHANGELOG.md` for the repo, and a first GitHub Release.
- README "Releasing the CLI" example moved to `v0.1.5`.

## [0.1.4] - 2026-09-13

### Changed

- README rewritten in a clean open-source SaaS style: shields badge row (npm,
  CI, license, stars, site), table of contents, a Features list, a three-command
  Quickstart, a dedicated "Install the skill" section for AI coding agents,
  an honest "What Repo Shield isn't" section, and Contributing & support.
- The npm package README mirrors the repository README (image and asset links
  adapted to point at GitHub).

## [0.1.3] - 2026-09-13

### Changed

- npm package README now mirrors the repository README, so the registry page
  documents the CLI, the Agent Skill, and the project the same way GitHub does.

## [0.1.2] - 2026-09-13

### Changed

- Install guidance clarified so every surface (CLI messages, site install bar,
  README, skill) says the same thing: the Repo Shield GitHub App installs on
  repos yours, your org's, or all of them — any GitHub user can install it, and
  it only opens pull requests for review.

## [0.1.1] - 2026-09-11

### Added

- Package metadata: `repository`, `homepage`, `bugs`.
- `README.md` and `LICENSE` shipped inside the npm tarball.

## [0.1.0] - 2026-09-11

### Added

- First CLI release under `@reposell/repo-shield`.
- Device-flow GitHub sign-in (`rs login`) — code in the terminal, no password,
  no client secret, token stored at `~/.config/repo-shield/config.json` (0600).
- `rs whoami`, `rs repos`, `rs logout`.
- `rs protect owner/repo`, `rs protect owner/a owner/b` (up to 50 per run), and
  `rs protect --all` opening **one pull request per repo** on a
  `repo-shield/protect` branch; re-running reuses the open PR.
- Protection pack per repo: `LICENSE` with `SPDX-License-Identifier` header,
  `NOTICE` with an explicit AI-training consent clause, machine-readable
  `AI_TRAINING_POLICY.md`, `REPO_SHIELD.txt` signature marker, and a weekly
  GitHub Actions monitor plus `scripts/shield-check.mjs`.
- Five licenses with the complete canonical SPDX text embedded: MIT, ISC,
  Unlicense, Apache-2.0, GPL-3.0 (filed as `GPL-3.0-only`); MIT and ISC get
  holder and year filled in.
- Published as compiled JS so the CLI runs on Node 18+.
- Web site reworked around the CLI-first flow (install, sign in, protect), with
  a "From zero to protected in minutes" story on the landing page.
- Agent Skill at `skills/repo-shield/SKILL.md` usable from any agent.