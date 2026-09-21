# Changelog

All notable changes to Repo Shield (web site, CLI, Agent Skill) are documented
here. Versions track the npm package `@reposell/repo-shield`; the same commits
ship the site and the skill.

## [Unreleased]

### Fixed

- The site is no longer blank at https://reposhield.reposell.dev/. The Vite
  `base` was still set to `/repo-shield/` (the old GitHub Pages project-page
  path), so the built `index.html` requested `/repo-shield/assets/*.js` while
  the custom domain serves assets at the root — the bundle 404'd and React
  never mounted. `base` is now `/`, matching the custom-domain deployment.
- `robots.txt` now declares the sitemap with an absolute URL
  (`https://reposhield.reposell.dev/sitemap.xml`) per the robots exclusion
  protocol; relative `Sitemap:` paths are ignored by crawlers.
- `sitemap.xml` now uses absolute `<loc>` URLs per the sitemap protocol
  (previously relative, which is invalid), and no longer lists
  `privacy.html`, `terms.html`, and `pricing.html` — static pages that were
  never built. The live routes are the hash routes (`/#/privacy`, `/#/terms`,
  `/#/pricing`), which are now listed instead.

## [0.1.6] - 2026-09-17

### Fixed

- `rs protect owner/a owner/b --license ... --holder "..." --year ...` no longer
  treats option values as repo targets — the documented multi-repo form now
  protects exactly the repos given (previously `isc`, the holder name, and the
  year were each attempted as a fake repo).
- An unknown `--license <id>` now fails with the valid list
  (`mit | isc | unlicense | apache-2.0 | gpl-3.0`) instead of silently falling
  back to MIT, so a typo'd license can never fling a repo into the wrong license.
- Invalid `--year` values (`0`, negative, or non-numeric) now fall back to the
  current year instead of writing a broken copyright line.
- The npm release workflow publishes with trusted publishing (OIDC,
  `id-token: write`) — no token secret required — and documents the one-time
  npm-side setup. It previously failed with `ENEEDAUTH`.
- CI now runs the full documented quality-gate suite: a `quality` job
  (typecheck, tests, build, `validate_tokens`, `validate_contrast`,
  `validate_component_spec`, `check_no_emoji`) and a `render` job that drives the
  real Chrome contrast + overflow gate against a built preview.
- The render gate now prints a `PASS`/`FAIL` summary and exits non-zero when an
  issue is found, and honours `CHROME_PATH` so CI can point it at any Chrome
  build.

### Changed

- Documentation corrected to match reality: quality-gate commands now show the
  real runner (`python3 scripts/check_no_emoji.py`, not `node`), the render gate
  is described as light-theme contrast + overflow across the six routes (not
  "light/dark"), and the READMEs state the suite that actually runs in CI.
- Root `package.json` version synced to the npm package version.

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