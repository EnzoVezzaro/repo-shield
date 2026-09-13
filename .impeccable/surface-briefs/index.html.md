# Repo Shield — Landing + site-wide theme (direction contract)

## Scope
Whole SPA, one visual world: landing, Generate, FAQ, Support, Privacy, Terms. Persistent per new-work decision 2026-09-13: all copy, features, hash routes, Stripe/GitHub links, and legal text stay verbatim. Aesthetic locked as "clean, modern, sleek" in the logo's black/cream/lime industrial sticker world.

## Mode
Persuade carries the landing; Operate on the Generate tool and Support; Read on FAQ/Privacy/Terms — one world serves all four.

## Direction contract

THESIS: Repo Shield renders as a printed instrument — the shield as a calibration patch you can trust — refusing the polished enterprise-security template it currently wears. The page is a press sheet of ink, cream and one lime signal; the product's honesty ("deterrence, not enforcement") is the point, so the surface stays calm and monochrome until the moment of action.

OWN-WORLD: ink ground `#0A0C0B`; cream `#F5EEE5` as rest; warm-stone greys for secondary; one flat screen-pressed lime `#A4F749` reserved for act-now plus olive `#6E9C38` pressed variants. Big Shoulders Display poster caps for display, JetBrains Mono for micro labels/code/coordinates, Inter for body. Patch plates framed by 1px ink bars with corner ticks; stamp emphasis via outlined display words; the logo's orbit ring animates slowly behind the hero emblem; mono serial-voice microprint on spec plates and the footer.

STORY: the visitor understands this is the tool that lets a maintainer say no to AI training at repo scale — written once, checked weekly, on their own machines; believes it because the page prints its boundary at full weight (the Does / Doesn't plate); acts on the lime "Generate your pack".

FIRST VIEWPORT: sticky ink header: shield patch badge + block-caps wordmark + lime orbit dot, mono nav with ticks, solid lime Donate. Hero: left column — mono audience line with lime tick, display H1 with the appended phrase stamped/outlined, cream lede, solid lime primary CTA + cream outline secondary, a printed spec plate (LICENSE + NOTICE + AI policy · CI · licenses); right — large shield line-art with a slowly rotating dashed lime orbit ring.

FORM: assigned direction, lab-instrument calibration panel fused with the brief's sticker/badge world (seed roll 7bc8453b, assigned index 7). Raises: state ritual (lime reserved for the single action + threshold marks), one truth per gauge (manifest reads as an instrument sweep), black-bar line discipline (only ink lines; disabled/empty states frost, never grey).

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Key artifacts
- Theme source of truth: `src/main.ts` `STYLE` + header/footer/landing/faq/prose/support/generate markup.
- Fonts self-hosted under `public/fonts/` (Big Shoulders Display 500-900, Inter 400-600, JetBrains Mono 400-700), Latin subset.
- Logo palette measured from `repo_shield_logo.png`.