# Repo Shield — Agent Skill

Protect a GitHub repo (or many) from AI scraping by committing a protection pack
(license + AI-training NOTICE + policy + monitoring workflow) as a pull request.
The work happens through the **Repo Shield CLI** (`rs` / `repo-shield`), which
authenticates with GitHub via **device flow** — no passwords, no client secret,
no server.

## When to use

- The user wants to "shield", "protect from AI", "block AI training", "add an
  AI training notice / no-scrape", "license my repos", or "monitor repos for
  fading licenses".
- The user wants the same protection applied across an Organisation, a set of
  repos, or one repo, and expects a reviewable pull request per repo (nothing
  on the default branch changes until someone merges).
- The user is writing code that evolves a repo and wants the shield kept intact.

## What it does, per protected repo

One branch (`repo-shield/protect`) holding one commit, then one PR:
- `LICENSE` — chosen license text (mit/isc/unlicense/apache-2.0/gpl-3.0), the
  complete canonical SPDX text embedded (holder/year filled in where the license
  needs it), with an `SPDX-License-Identifier` header on top.
- `NOTICE` — stakes the AI-training restriction with a short legal claim.
- `AI_TRAINING_POLICY.md` — machine-readable no-AI-training policy.
- `REPO_SHIELD.txt` — signature marker.
- `.github/workflows/repo-shield.yml` — weekly workflow that verifies the five
  protected files still exist and opens an issue if they are removed or edited.
- `scripts/shield-check.mjs` — the local check the workflow runs.

Re-running on the same repo is idempotent: it reopens/reuses the open PR.

## Commands

```sh
npm i -g @reposell/repo-shield  # install (bin: rs, repo-shield)
rs login                     # device flow — GitHub prints a code, you approve
rs whoami
rs repos                     # repos the app is installed on
rs protect owner/repo        # one repo
rs protect --all             # every repo the app is installed on
rs protect owner/a owner/b --license isc --holder "Acme Inc" --year 2026
rs logout
```

Before `rs protect` can write, the **reposell** GitHub App must be installed on
the target repos (`https://github.com/apps/reposell/installations/new`). A 403
surface is the install hint; tell the user when you see it.

## Agent protocol (run this after you use the CLI)

1. Run the command the user asked for (`rs protect <repo>` or `--all`).
2. Read the CLI output rows. For each repo it printed `[opened]` or `[already]`
   a PR now exists.
3. If one is `[failed]` with an install/403 error, report the install URL and
   re-run after the user installs the app — do not skip the repo silently.
4. Tell the user, per repo: the PR number and URL, that nothing merged by
   itself, and that after merging they can optionally verify the weekly
   workflow by checking Actions.

## Local (no GitHub) alternative

The website's generate page also has a manual pack builder for dropping the
files straight into a clone or a gist. The CLI is the supported path whenever
GitHub writes are involved — prefer it.

## Verification gates for this repo

- `npm run typecheck` then `npm run build`
- `node scripts/check_no_emoji.py` — zero emoji in product UI
- `node .impeccable/repo-shield-verify.mjs all` — 6 PASS (contrast + overflow,
  light/dark) expected
- `npm test` — protection-pack and CLI protect-flow unit tests