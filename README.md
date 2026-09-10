# Repo Shield

Protect every public repo from AI scraping.

Your public code gets bulk-ingested by AI training pipelines without consent or
credit. Repo Shield builds you a protection pack: a `LICENSE`, an explicit
AI-training `NOTICE`, and a machine-readable policy that state who can and
can't use your code. Then it keeps watch every week so gaps get fixed before
they bite.

> Honest caveat: this is **deterrence, not enforcement**. Generated files stake
> your position and make accidental ingestion visible. Nobody can "block" AI
> scrapers, and anyone who promises that to you is selling a lie.

## Open source

Repo Shield is **free and open source**, with one condition: no AI training on
this code (see [LICENSE](./LICENSE)). No plans, no tiers, no paywalled features.
Everything is included for every repo you own.

If the tool saves you a headache, a donation covers hosting and maintenance:
**[Donate](https://enzovezzaro.github.io/repo-shield/#/support)** · [Star on GitHub](https://github.com/EnzoVezzaro/repo-shield)

## How it works

1. **Answer 4 questions** — your GitHub user/org, the license (MIT is a good
   default), the copyright holder, and the year.
2. **Download your protection pack** — `LICENSE`, a `NOTICE` with explicit
   AI-training consent, a machine-readable `AI_TRAINING_POLICY.md`, plus the
   monitoring workflow and check script.
3. **Apply it** — drop the files into one repo by hand, or let `apply-all.sh`
   protect every public repo you own and install weekly monitoring on each.

## What's in the pack

| File | Purpose |
|------|---------|
| `LICENSE` | Chosen license with SPDX identifier (MIT, ISC, Unlicense inline; Apache-2.0 and GPL-3.0 link the canonical text you must paste) |
| `NOTICE` | Copyright + explicit AI-training/machine-learning consent clause |
| `AI_TRAINING_POLICY.md` | Machine-readable consent key consumed by the monitor |
| `REPO_SHIELD.txt` | Signature marker that flags public copies in scraping scans |
| `.github/workflows/repo-shield.yml` | Weekly check that the files stay present; optional heuristic scrape scan |
| `scripts/shield-check.mjs` | The check itself — runs in your repo, not ours |
| `apply-all.sh` | One command: protect + push to every public repo, skips forks |

Monitoring runs inside your own repository via GitHub Actions with the existing
`GITHUB_TOKEN`. Repo Shield never sees your code.

## License (for this repo)

Released under the **Repo Shield Source License (No AI Training)** — permissive
for use, modification, and distribution, with one additional term: the software
may not be used to train machine-learning models. Full text in [LICENSE](./LICENSE).

## Stack

Static-first Vite + TypeScript app. The donation link is a Stripe Payment Link
wired via `VITE_STRIPE_PRO_PAYMENT_LINK` (falls back to the in-app Support page).
Deployable to GitHub Pages or any static host.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
npm run typecheck
npm test
```

Managed by [SaaS Factory](https://github.com/anomalyco/saas-factory).