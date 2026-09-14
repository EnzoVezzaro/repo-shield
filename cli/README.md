<p align="center">
  <img src="https://raw.githubusercontent.com/EnzoVezzaro/repo-shield/main/public/images/logo.png" alt="Repo Shield" width="360" />
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@reposell/repo-shield"><img alt="npm version" src="https://img.shields.io/npm/v/@reposell/repo-shield?color=2e8b57" /></a>
  <a href="https://github.com/EnzoVezzaro/repo-shield/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/EnzoVezzaro/repo-shield/ci.yml?label=CI" /></a>
  <a href="https://github.com/EnzoVezzaro/repo-shield/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/badge/license-Source%20License%20(No%20AI%20Training)-black" /></a>
  <a href="https://github.com/EnzoVezzaro/repo-shield"><img alt="GitHub stars" src="https://img.shields.io/github/stars/EnzoVezzaro/repo-shield" /></a>
  <a href="https://enzovezzaro.github.io/repo-shield/"><img alt="website" src="https://img.shields.io/badge/site-enzovezzaro.github.io-2e8b57" /></a>
</p>

# Repo Shield

**Claim your code. Stop AI pipelines from silently training on it.**

Public repos get bulk-ingested into AI training corpora every day — no consent,
no credit, often no trace. Repo Shield gives you a simple, honest, enforceable
position: a signed `LICENSE`, an explicit AI-training `NOTICE`, a
machine-readable policy, and a weekly watch that keeps them from fading.

Free, open source, and only as complicated as you want it to be.
Web: [repo-shield](https://enzovezzaro.github.io/repo-shield/) ·
CLI: [`@reposell/repo-shield`](https://www.npmjs.com/package/@reposell/repo-shield)
· Agent skill: [`skills/repo-shield/SKILL.md`](https://github.com/EnzoVezzaro/repo-shield/blob/main/skills/repo-shield/SKILL.md)

> **Honest caveat:** this is deterrence, not enforcement. Generated files stake
> your position and make accidental ingestion visible. Nobody can "block" AI
> scrapers, and anyone who promises that is selling a lie.

## Table of contents

- [Features](#features)
- [Quickstart](#quickstart)
- [CLI reference](#cli-reference)
- [For AI coding agents](#for-ai-coding-agents)
- [What's in the pack](#whats-in-the-pack)
- [Pick a license](#pick-a-license)
- [No GitHub account?](#no-github-account)
- [What Repo Shield isn't](#what-repo-shield-isnt)
- [Open source](#open-source)
- [Contributing & support](#contributing--support)
- [Development](#development)

## Features

- **Signed license, canonical text.** The complete official SPDX text for all
  five licenses is embedded in your repo — no truncated copy, no paste-in-the-
  notes approximation. MIT and ISC get your holder and year filled in.
- **Explicit AI-training NOTICE.** A short legal claim that names what is and
  isn't allowed, with an SPDX identifier the whole pack stays matched to.
- **Machine-readable policy.** `AI_TRAINING_POLICY.md` lets scrapers and tooling
  check consent without parsing prose.
- **A self-healing watch.** A weekly GitHub Actions check runs *inside your repo*
  with your own token — Repo Shield never sees your code — and opens an issue
  the moment a protected file is removed, edited, or a license id drifts.
- **One review, one PR, per repo.** Nothing touches your default branch until
  you merge. Re-running just reuses the open PR.
- **Agent-ready.** The exact same flow is packaged as an Agent Skill, so an AI
  coding agent can protect `owner/a owner/b` or `--all` with the one binary a
  human runs. See [For AI coding agents](#for-ai-coding-agents).

## Quickstart

Requirements: **Node 18+**, and the **Repo Shield** GitHub App installed on the
repos you want to protect. Three commands:

```bash
npm i -g @reposell/repo-shield   # installs `rs` (and `repo-shield`)
rs login                    # device-flow sign-in — code in terminal, no password
rs protect --all            # one protection PR on every repo the app can write to
```

Or protect a single repo: `rs protect owner/repo`.

Install the GitHub App on the repos you want to protect — yours, your org's, or
all of them. Any GitHub user can install it; the app is the write mechanism `rs`
uses to open pull requests on your behalf:
[`https://github.com/apps/reposell/installations/new`](https://github.com/apps/reposell/installations/new)

What happens next: Repo Shield writes the pack as **one commit on a
`repo-shield/protect` branch** and opens **one pull request per repo**. Nothing
on your default branch changes until you review and merge. Running it again on
the same repo just reuses the open PR.

## CLI reference

| Command | What it does |
|---------|--------------|
| `rs login` | Device-flow sign-in. GitHub prints a code, you approve it in the browser; a token is stored in `~/.config/repo-shield/config.json` (0600) on your machine. |
| `rs whoami` | Your account + whether the app is installed. |
| `rs repos` | Every repository the app can write to. |
| `rs protect owner/repo` | Opens one protection PR on that repo. |
| `rs protect owner/a owner/b` | One PR per repo, up to 50 per run. |
| `rs protect --all` | One PR per repo across every installed repo. |
| `rs logout` | Forgets your session. |

`rs protect` options:

```
--license <id>   mit | isc | unlicense | apache-2.0 | gpl-3.0   (default: mit)
--holder <name>  Copyright holder (default: your GitHub name)
--year <n>       Year of first publication (default: current year)
```

Protected files are written as one commit on a `repo-shield/protect` branch.
If a PR for the repo is already open, `rs protect` reuses it.

## For AI coding agents

Repo Shield is a **first-class tool for coding agents**. The same flow a
maintainer runs by hand is packaged as an Agent Skill — an agent can be pointed
at [`skills/repo-shield/SKILL.md`](https://github.com/EnzoVezzaro/repo-shield/blob/main/skills/repo-shield/SKILL.md), sign in once,
protect one repo or an entire organization, and hand the PR links back. No
separate API, no server, no admin.

```bash
npm i -g @reposell/repo-shield
rs login
rs protect owner/a owner/b --license isc
```

Why it's safe to hand to an agent:

- **Same CLI, no second system.** There is no web API or different tool for the
  agent to learn — it drives the exact `rs` binary a human runs.
- **Org-wide in one command.** `protect owner/a owner/b`, or `--all` for
  everything the app is installed on.
- **Reviewable by construction.** Every repo gets its own pull request on a
  `repo-shield/protect` branch. Nothing is ever pushed to a default branch
  without a human merging it.
- **It says when it can't.** A 403 or missing-install surfaces as a clear
  re-run step; the skill does not skip repos silently.

### Install the skill

The skill is a single file at
[`skills/repo-shield/SKILL.md`](https://github.com/EnzoVezzaro/repo-shield/blob/main/skills/repo-shield/SKILL.md) — instructions plus
the exact agent protocol (what to run, how to read the output, what to report).
Any agent that accepts skill files can load it:

- **Claude Code** — copy the folder into `~/.claude/skills/repo-shield/`
- **Cursor** — copy into `.cursor/skills/repo-shield/`
- **Codex / Copilot / any agent** — open `SKILL.md` and follow it

Or simply tell your agent to read the file before working on the repo:

> Read `skills/repo-shield/SKILL.md` and follow its protocol to protect this
> repo from AI training.

## What's in the pack

| File | Purpose |
|------|---------|
| `LICENSE` | Your chosen license, with an SPDX identifier |
| `NOTICE` | Copyright + explicit AI-training consent clause |
| `AI_TRAINING_POLICY.md` | Machine-readable consent key |

Plus two kept-in-sync extras for public repos:

| File | Purpose |
|------|---------|
| `REPO_SHIELD.txt` | Signature marker that flags copies in scrape scans |
| `.github/workflows/repo-shield.yml` | Weekly monitor (runs in your repo, not ours) |
| `scripts/shield-check.mjs` | The check itself — verifies files, license, markers |

The monitor runs weekly on GitHub Actions with your repo's existing
`GITHUB_TOKEN`. Repo Shield never sees your code.

## Pick a license

The defaults are the safest, most common choices for public code:

| License | When to use it |
|---------|----------------|
| **MIT** | The default. Permissive, tiny, understood everywhere. |
| **ISC** | Minimal permissive — the whole grant fits in a paragraph. |
| **Apache-2.0** | Permissive plus an explicit patent grant, for big projects. |
| **GPL-3.0** | Copyleft: derivatives must stay free. Filed as `GPL-3.0-only`. |
| **Unlicense** | Your code, public domain. |

Every license is written into your repo as the complete canonical text from the
official [SPDX](https://spdx.org/licenses/) registry — including Apache-2.0 and
GPL-3.0, no paste step needed. MIT and ISC get your holder and year filled in.
An approximate license is worse than none.

Every generated `LICENSE` carries an `SPDX-License-Identifier` header, and the
monitor verifies the identifier is from the known set and matches the `NOTICE`.
No AI-training clause, or a wrong license id, fails the weekly check and opens
an issue telling you exactly which file to fix.

## No GitHub account?

Build the pack straight from the manual mode on the site
([`#/generate`](https://enzovezzaro.github.io/repo-shield/#/generate)) — pick
the files you want and download them, or use `apply-all.sh` offline.

## What Repo Shield isn't

- **Not enforcement.** No tool can block AI scrapers. These files make the
  position explicit and the removal visible.
- **Not a watermark.** No banner, sticker, or altered source — the repo you
  publish is the repo you own.
- **Not a scanner.** Repo Shield protects *your* repos; it does not scan or
  police what others do with their code.

## Open source

Repo Shield is free and open source, with the condition that it stays *yours*:
the **Repo Shield Source License (No AI Training)** lets anyone use, read, and
improve this code, and explicitly forbids using the software itself to train a
machine-learning model. Full terms in [`LICENSE`](https://github.com/EnzoVezzaro/repo-shield/blob/main/LICENSE).

If the tool saves your repos from a scrape, a small donation covers hosting and
maintenance:

- **[Donate](https://enzovezzaro.github.io/repo-shield/#/support)**
- **[Star on GitHub](https://github.com/EnzoVezzaro/repo-shield)**
- **[Read the design system](https://github.com/EnzoVezzaro/repo-shield/blob/main/DESIGN.md)**

## Contributing & support

Issues and pull requests are welcome — this product runs on the gates that make
it trustworthy, so fixes should keep every gate green:

- [Open an issue](https://github.com/EnzoVezzaro/repo-shield/issues) for a bug
  or a suggestion
- Read [DESIGN.md](https://github.com/EnzoVezzaro/repo-shield/blob/main/DESIGN.md) before changing UI or tokens
- Run the quality gates before opening a PR (see below)
- For hosting and maintenance donations, use the [support page](https://enzovezzaro.github.io/repo-shield/#/support)

## Development

```bash
npm install
npm run dev        # local dev server
npm run build      # production build
npm run typecheck
npm test           # pack + license + CLI protect-flow unit tests
```

Static Vite + TypeScript app, deployed to GitHub Pages. No server components.
The published CLI is compiled JS and runs on Node 18+; running the TypeScript
sources directly (tests, `npm run cli`) needs Node 22.6+.

Quality gates: `node scripts/check_no_emoji.py`,
`node .impeccable/repo-shield-verify.mjs all` (6 PASS: contrast + overflow,
light/dark), and `scripts/validate_tokens.py` — the whole suite runs in CI.

### Releasing the CLI

The npm package (`@reposell/repo-shield`) auto-publishes from GitHub Actions
when a `v*` tag is pushed, once the repo is connected as a trusted publisher
for the package in npm settings:

```bash
# bump cli/package.json first (tag must match the version exactly)
git tag v0.1.5 && git push origin v0.1.5
```