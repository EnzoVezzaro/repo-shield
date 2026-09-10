# Repo Shield

Protect all your GitHub repos from AI scraping — in one click.

Your public code is ingested by AI training pipelines without consent or credit.
Repo Shield adds the license + AI-training notices that stake your claim, then
monitors every repo every week so gaps get fixed before they bite.

> Honest caveat: this is **deterrence, not enforcement**. Generated files stake
> your position and make accidental ingestion visible. Nobody can "block" AI
> scrapers, and anyone who promises that to you is selling a lie.

## How it works

1. **Answer 4 questions** — your GitHub user/org, the license (MIT is a good
   default), the copyright holder, and the year.
2. **Download your protection pack** — `LICENSE`, a `NOTICE` with explicit
   AI-training consent, a machine-readable `AI_TRAINING_POLICY.md`, plus the
   monitoring workflow and check script.
3. **Apply it** — Free: drop the files in one repo by hand. Pro: one script
   applies the pack to all your public repos and installs weekly monitoring on
   each.

## What's in the pack

| File | Purpose |
|------|---------|
| `LICENSE` | Choosed license with SPDX identifier (MIT, ISC, Unlicense inline; Apache-2.0 and GPL-3.0 link the canonical text you must paste) |
| `NOTICE` | Copyright + explicit AI-training/machine-learning consent clause |
| `AI_TRAINING_POLICY.md` | Machine-readable consent key consumed by the monitor |
| `.github/workflows/repo-shield.yml` | Weekly check that the files stay present; optional heuristic scrape scan |
| `scripts/shield-check.mjs` | The check itself — runs in your repo, not ours |
| `apply-all.sh` (Pro) | One command: protect + push to every public repo, skips forks |

## Pro vs Free

- **Free** — the protection pack for a single repository, forever.
- **Pro — $9/mo** — unlimited repos, the apply-all script, weekly monitoring on
  each repo, and heuristic scrape detection.
- **One-time audit — $49** — the full pack and monitored setup without a
  subscription.

Monitoring runs inside your own repository via GitHub Actions with the existing
`GITHUB_TOKEN`. Repo Shield never sees your code.

## Stack

Static-first Vite + TypeScript app. Payments are Stripe Payment Links wired via
`VITE_STRIPE_PRO_PAYMENT_LINK` / `VITE_STRIPE_AUDIT_PAYMENT_LINK`. Deployable to
GitHub Pages or any static host.

## Development

```bash
npm install
npm run dev      # local dev server
npm run build    # production build
npm run typecheck
npm test
```

Managed by [SaaS Factory](https://github.com/your-org/saas-factory).

## License

This site's own contents are provided as-is; the generated protection files are
templates and are not legal advice. See `src/pages/terms.html`.