# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing codebase: Vite + vanilla TypeScript SPA. Single source of truth for all styling lives in `src/main.ts` (one `STYLE` template string over CSS custom properties); content and copy in `src/content.ts`; generated-file logic in `src/lib/*`. Hash-based routing (`#/`, `#/generate`, `#/faq`, `#/support`, `#/privacy`, `#/terms`). Deployed as static files (`dist/`, `vite build`).

## Users

Open-source maintainers and developers who publish public code on GitHub, often across many repositories. Their job: state, at repo scale, who can and can't use their code for AI training, and keep that position visible over time. Secondary audience: anyone evaluating the project as open-source users (fork, self-host, contribute, donate).

## Product Purpose

Repo Shield is a free, open-source generator and monitoring toolkit. It produces a protection pack (LICENSE, explicit AI-training NOTICE, machine-readable AI training policy, a signature marker, a weekly GitHub Actions monitoring workflow, a verify script, and an apply-all script) so a maintainer can stake an AI-training position on every public repo they own, then get a weekly check that the files stay put. Purpose is deterrence and visibility, never enforcement: the site says on the tin that nobody can actually block scrapers.

## Positioning

The first tool that makes an AI-training policy a per-repo, permanent, monitored artifact across an entire repo catalog at once, running entirely on the user's own machines. Distinct from one-repo-at-a-time GitHub tooling and from flat "block all training" promises: honest that it cannot stop scrapers, concrete that it produces a defensible, machine-readable record.

## Operating Context

Maintainers use Repo Shield inside their GitHub workflow: they have a `gh` CLI session, public repos spread over user/org accounts, and CI via GitHub Actions. The generated `apply-all.sh` uses the existing `gh` session to protect-commit public repos and install the weekly monitoring workflow on each. Monitoring runs inside the user's own repo (never uploads the user's code). Donations are optional via Stripe.

## Capabilities and Constraints

- Generator (Generate page): owner, license (MIT, ISC, Apache-2.0, GPL-3.0, Unlicense), copyright holder, year -> 7 files, each previewable, copyable, downloadable.
- apply-all.sh: protect-commits every public repo, skips forks, touches only the five protected files.
- Weekly workflow verifies LICENSE/NOTICE/policy presence and flags public copies of the marker; heuristic by design.
- Hash routes, Stripe donation link, and GitHub project URL are fixed and must keep working.
- Styling is one theme imported site-wide: switching brand or theme is one edit at the source.

## Brand Commitments

- Name: Repo Shield. Tagline: "Protect every public repo from AI scraping."
- Logo: distressed industrial tech badge — heavy angular block lettering (vintage athletic patch / workwear / underground tech), black ink + off-white aged-paper cream + a neon-lime green orbit cutting through a shield emblem that encloses code layers, sticker/patch construction with thick outer contours.
- Measured logo palette: ink black `#070808`, cream `#F5EEE5`, warm greys (`#60605E`-`#C6C3BD`), olive base-greens (`#31441B`, `#6E9C38`) and a lime green highlight family (`#8FCD47`, `#A4F749`).
- Binding direction from the owner: the redesign must read as the logo's world — industrial, protective, developer-focused, open-source street-tech meeting cybersecurity utility — expressed as a modern, sleek, clean interface. Heavy distress/grime texture is out of scope; angularity, the black/cream/lime system, and a sticker/patch sense of framing carry the identity.
- The emoji ban in the project's CLAUDE.md applies to the UI (plain text / SVG icons only).

## Evidence on Hand

- Logo asset: `repo_shield_logo.png` (1254x1254) at project root.
- All marketing copy and structure in `src/content.ts`; legal page text there is the binding legal content.
- Pack file generation in `cli/lib/legal.ts`, monitoring workflow + check script in `cli/lib/monitor.ts`, apply-all in `src/lib/applyAll.ts`.
- No testimonials, customer names, pricing, or security benchmarks exist; none may be invented.

## Product Principles

1. Honesty outranks conversion: never imply the tool can block scraping; lead with "deterrence, not enforcement."
2. The position is explicit, machine-readable, and permanent — written once, checked weekly.
3. Runs on the user's machines: no code uploads, no third-party trackers, minimal data.
4. Automation at catalog scale: one command vs. one-repo-at-a-time friction.
5. Free, forever, open source — a custom no-AI-training license protects the tool itself.

## Accessibility & Inclusion

The UI must keep WCAG AA contrast in both light and dark (this theme is dark-first), full keyboard support, visible focus states on every interactive element, reduced-motion parity, and no reliance on color alone to carry meaning. No emoji anywhere in the UI.