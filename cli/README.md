# Repo Shield CLI

Protect your GitHub repos from AI scraping: a license, an AI-training notice,
and a weekly monitoring workflow, opened as one pull request per repo. Nothing
touches your default branch until you merge.

## Install

```sh
npm install -g @reposell/repo-shield
```

## Use

```sh
rs login            # sign in with GitHub (device flow, no password)
rs protect owner/repo
rs protect --all
```

`rs protect` writes `LICENSE`, `NOTICE`, `AI_TRAINING_POLICY.md`,
`REPO_SHIELD.txt`, a weekly `.github/workflows/repo-shield.yml`, and
`scripts/shield-check.mjs` to a branch named `repo-shield/protect` and opens a
pull request. Licenses come straight from the SPDX registry.

## Requirements

Node.js 18 or newer. GitHub writes happen through the Repo Shield GitHub App —
**any** GitHub user installs it on their own repos (yours, your org's, or all of
them) and the CLI then opens pull requests on those repos via device flow. No
client secret required.

## Source

https://github.com/EnzoVezzaro/repo-shield

Issues: https://github.com/EnzoVezzaro/repo-shield/issues