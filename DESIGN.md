# Design: Repo Shield — "Warning-Sticker Poster"

Brand redesign round (post-board review). Direction: one bold, professional,
industrial "warning sticker" identity applied as a full-surface poster — hazard
stripes, a shipped-paper manifest sheet, solid slogans (statement color), and
the production logo shown at poster scale. All copy, features, hash routes,
links, and legal pages kept verbatim.

## The world

Repo Shield is the warning sticker you peel onto every public repo: ink-black
surfaces, cream printed text, lime hazard markings, olive statement slabs.
Nothing renders as a generic web app; everything renders as stamped, signed,
inspected hardware. The hero is a poster lockup: a stamped headline, a rotated
cream patch carrying the real logo raster at 340px, and a hazard-stripe ticker.

Applied consistently to every surface: header (lime hazard cap + status chip),
hero, posted pack sheet, candid does/doesn't slabs, support band, generate
panel, FAQ, support, privacy, terms, and footer (hazard cap + 40px brand mark).

## Visual system (single source of truth, in `src/main.ts`)

One always-ink theme, posted onto cream "paper" documents:

| Role | Token | Value |
| --- | --- | --- |
| Page | `--bg` | `#0a0c0b` (ink) |
| Surfaces | `--surface`/`--surface-2`/`--surface-3` | `#101311` / `#151a16` / `#1b211c` |
| Ink (dark) | `--ink` / `--muted` / `--faint` | `#f5eee5` / `#bdb6ab` / `#8c867b` |
| Paper (cream sheets) | `--cream` / `--cream-2` | `#f5eee5` / `#efe7d7` |
| Paper ink | `--paper-ink` / `--paper-muted` / `--paper-faint` / `--paper-line` | `#16130c` / `#57503f` / `#6f6752` / `#d6ccb2` |
| Accent | `--accent` / `--accent-hover` / `--accent-ink` | `#a4f749` (lime) / `#b7fd64` / `#0a0c0b` |
| Olive (statement) | `--olive` / `--olive-deep` / `--olive-deep-2` | `#6e9c38` / `#2d3f1a` / `#263617` |
| Lines | `--line` / `--line-strong` | `#232a24` / `#39433b` |
| Code | `--code-bg` | `#070908` |

Source of the palette: the production logo raster (`repo_shield_logo.png`) —
ink black `#070808`/`#050605`, cream `#F5EEE5`, olive `#6E9C38`, lime family
`#8FCD47`/`#A4F749`.

## Motif language

- **Hazard cap**: `repeating-linear-gradient(-45deg, var(--accent) 0 16px,
  #05070a 16px 32px)` — 3–4px stripe on header/footer and formcard caps.
  Decorative only (decorative `side-tab`/`repeating-stripes` detector flags are
  governed).
- **Poster lockup**: `.hero-sticker` — rotated cream `.patch` with dashed ink
  border, the real `logo.png` at 340px, a mono `.patch-cap` (`RS-01 · EN`,
  `07 FILES · FREE`), plus a `.tag`.
- **Paper sheet** (`.paper`): cream sea with ink header bar (`.paper-head` +
  `.pdot`) for the package manifest, rows `.fname`/`.frole`/olive `.chip`,
  and a mono `.foot`. Ink text on cream measures 15+:1.
- **Statement slabs** (`.candid`): lime `does` column (olive `#6e9c38` ticks,
  ink text 13+:1) vs olive-deep `doesn't` column (cream text 9:1) with `.c` 
  footers, all floating in a 10px dark well so the slabs read as solid color.
- **Chunky controls**: buttons carry a hard `0 4px 0` offset shadow in
  `--olive` (`btn-primary`) or ink (`btn-lime-line` on lime slabs); `:active`
  pushes `translateY(3px)`. This is the one deliberate 3D tell — no gradients,
  radius `0` everywhere except pill icon chips.
- **Print details** (`.stamp`): solid ink fill with two lime corner brackets
  (contrast always measurable; never text-stroke). On paper/lime slabs the
  brackets switch to `--paper-ink`.
- **Instrument chapters** (`.sechead` + `.secnum`): mono/exact number plates
  `01`–`04` before each landing h2 (advisory `numbered-section-labels`, part of
  the instrument identity).
- **Hero grid**: headline column (h1 `clamp(3rem,5.6vw,4.9rem)`, `max-width
  15ch`) beside the sticker patch; hazard ticker strip below using existing
  copy. Dotted grid + faint lime glow stay below 5% alpha.

## Components and the 8 states

Every interactive element ships default/hover/focus/active/disabled states.
Present controls: anchored donation links, internal links, and site nav
(header) plus form inputs and the async build button on `/generate`. Each uses
`:focus-visible` rings (`--focus-ring`, lime on ink; ink on lime/paper/
support-band so focus never disappears into a slab), hover color shifts, active
`translateY(3px)`, and the disabled build button at `opacity: .5` +
`pointer-events: none`. Motion is hover/focus color coupling plus the button
press; a `prefers-reduced-motion` block zeroes all transitions.

## Accessibility decisions (measured, not asserted)

- Stamp text is solid fill + corner brackets (never `color: transparent`),
  so contrast machinery reads real values: solid cream on ink = 16+:1, ink on
  cream 15+:1, ink on lime 13+:1, cream on olive-deep 9+:1.
- Translucent lime decor (glow ≤ 5% alpha, hazard overlays) resolves to >15:1
  (cream) and >9:1 (muted) on ink — computed at worst hotspot, gate-verified.
- Functional micro-labels (`.status`, `.patch-cap`) are ≥ 11px after detector
  bumps from 10.5px.

## Gates (run, output)

- `node .impeccable/repo-shield-verify.mjs all` — real chromium computed-style
  contrast + overflow across all six routes at 1440px and 280/320/414px:
  **PASSES: 6, failures: 0** after the restyle.
- `npm run typecheck` (`tsc --noEmit`) — pass. `npm run build` (`vite build`) —
  pass.
- `impeccable detect` (1280x800, live URL) — 0 primary failures; remaining
  items governed or false:
  - `all-caps-body x7` — h1/h2 headers + mono caption labels, exempt by rule.
  - `numbered-section-labels x7` (advisory) — the `01`–`04` instrument plates,
    deliberate identity.
  - `side-tab x2` + `repeating-stripes` (advisory) — decorative hazard caps,
    aria-hidden-free decor only.
  - `low-contrast x2` (analytic-gradient+alpha) — detector models the ≤5% alpha
    lime radial as an opaque lime sheet; real composite >9:1 (see above).
- `python3 scripts/check_no_emoji.py` — OK (215 files).
- Route image sweep: all six routes load `logo.png`/`logo-mark.png` with
  `naturalWidth > 0` (no 404s).

## Bugs found and fixed

- **Logo invisible (root cause)**: runtime-injected `src="/images/…"` absolute
  paths bypass Vite's base rewriting and 404 under the `/repo-shield/` base.
  All runtime image paths are now relative (`images/logo.png`), so they resolve
  under any base. Verified: hero patch image now renders at 356×356.
- 10.5px labels (`status`, `patch-cap`) raised to 11px.
- `.candid` slabs were flush to the border (cramped-padding); given a 10px dark
  well so the solid colors read as framed slabs.

## Live data: GitHub protection via the CLI — the site stays static

Repo Shield runs on GitHub Pages and ships no server. GitHub writes happen
through the **Repo Shield CLI** (`rs`), which the `/generate` page teaches:

- **Auth** — Device Flow against the `reposell` GitHub App: the CLI shows a
  code, the user approves at `github.com/login/device`, the token is stored in
  `~/.config/repo-shield/config.json` (0600). No client secret is shipped —
  Device Flow is a public-client flow, so the repo needs no server and no
  secrets.
- **Run** — `rs protect owner/repo` or `rs protect --all` writes the pack
  (LICENSE, NOTICE, AI_TRAINING_POLICY.md, REPO_SHIELD.txt,
  `.github/workflows/repo-shield.yml`, `scripts/shield-check.mjs`) as one commit
  on a new `repo-shield/protect` branch via the Git Data API, then opens a PR
  per repo. Output is `opened` / `already open` / `failed`; an install/403
  failure prints the install URL and never binds to the page.
- **Web** — `/generate` shows the three commands (install, sign in, protect)
  as copyable terminal rows, links to the app install page, and keeps the
  per-file "what you'll get" manifest plus a manual pack builder for people who
  don't want GitHub writes at all. No browser↔GitHub calls; no UI state apart
  from the manual form.
- Cost of admission for the person running it: the app is installed on the
  target repos and the GitHub App has Contents/Pull requests/Workflows write
  permission (see `.env.example`).
- `skills/repo-shield/SKILL.md` — the Agent Skill that wraps the same flow so an
  agent (this kit) can run protection on the user's behalf and verify PRs.

## Files

- `src/main.ts` — tokens, all styles, all page markup (copy untouched).
- `index.html` — self-hosted font links, PNG favicon, theme-color.
- `public/images/logo.png` (640), `logo-mark.png` (112), `favicon.png` (48) —
  renders of `repo_shield_logo.png`.
- `public/fonts/` — 12 self-hosted woff2 faces + fonts.css.
- `cli/lib/legal.ts` — protection pack (LICENSE/NOTICE/policy), single source of
  truth shared by the web manual builder and the CLI.
- `cli/lib/monitor.ts` — weekly workflow + shield-check script (shared).
- `cli/index.ts` — the `rs` CLI: device-flow login, `whoami`, `repos`, `protect`.
- `cli/protect.ts` — branch+PR provisioning (Git Data API), idempotent per repo.
- `cli/protect.test.ts` — CLI flow unit tests against a mocked GitHub API.
- `.impeccable/repo-shield-verify.mjs` — route/contrast/overflow gate.
- `.impeccable/render-check.mjs` — computed render assertions (logo load,
  colors, overflow). `.impeccable/capture.mjs` — screenshot recorder.

Not pixel-inspected: this environment has no image input, so final visual
confirmation is a human pass on the recorded renders (`.impeccable/review/
landing-full.png`, `generate-full.png`, `desktop-full.png`); computed checks
confirm structure, color, sizes, contrast, and overflow.