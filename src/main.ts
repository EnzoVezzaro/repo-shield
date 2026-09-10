import {
  AUDIENCE,
  BRAND,
  DOES,
  DOESNT,
  FAQS,
  GITHUB_URL,
  HOW_IT_WORKS,
  PACK_MANIFEST,
  PAIN_POINTS,
  PRIVACY_SECTIONS,
  SUB,
  TAGLINE,
  TERMS_SECTIONS,
} from "./content.js";
import { LICENSE_OPTIONS, protectionFiles, type License } from "./lib/legal.js";
import { monitorWorkflow, shieldCheckScript } from "./lib/monitor.js";
import { applyAllNote, applyAllScript } from "./lib/applyAll.js";
import { env } from "./lib/env.js";

const DONATE_LINK = env("VITE_STRIPE_PRO_PAYMENT_LINK") ?? "#/support";

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function checkIcon(): string {
  return `<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5 6.5 11.5 12.5 5"/></svg>`;
}

function copyButton(target: () => string, label: string): HTMLElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-mini";
  const set = (html: string) => {
    btn.innerHTML = html;
  };
  set(esc(label));
  btn.onclick = async () => {
    if (await copyText(target())) {
      set(`${checkIcon()}<span>Copied</span>`);
    } else {
      set("Select manually");
    }
    setTimeout(() => set(esc(label)), 1600);
  };
  return btn;
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return ok;
    } catch {
      return false;
    }
  }
}

function download(filename: string, text: string): void {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function downloadButton(filename: string, text: string, label: string): HTMLElement {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "btn-mini";
  btn.textContent = label;
  btn.onclick = () => download(filename, text);
  return btn;
}

/* Brand mark: a single-line shield with a check. */
function shieldMark(): string {
  return `<svg class="brand-svg" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round">
    <path d="M12 2.6 19.4 5.6 V11 C19.4 16 16.6 19.4 12 21.8 C7.4 19.4 4.6 16 4.6 11 V5.6 Z"/>
    <path d="M8.8 11.6 11 13.8 15.4 9.4" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}

const STYLE = `
  :root {
    --bg: #0b0d0c;
    --surface: #111413;
    --surface-2: #161a18;
    --surface-3: #1c211e;
    --ink: #edf1ee;
    --muted: #a8b0ac;
    --faint: #858e89;
    --line: #202521;
    --line-strong: #2a302c;
    --accent: #2cbf7e;
    --accent-hover: #37d68d;
    --accent-ink: #06281b;
    --accent-tint: #0f241b;
    --accent-line: #1a3a2c;
    --code-bg: #070908;
    --code-ink: #edf1ee;
    --warn-bg: #2a2211;
    --warn-line: #8a6d2f;
    --warn-ink: #e8d9a6;
    --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    --font-serif: "Fraunces", Georgia, "Times New Roman", serif;
    --ease-out: cubic-bezier(.22,.61,.36,1);
    --radius: 12px;
    --radius-sm: 7px;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; font-family: var(--font-sans); font-feature-settings: "cv01", "ss03"; color: var(--ink); background: var(--bg); line-height: 1.6; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
  .wrap { max-width: 1120px; margin: 0 auto; padding: 0 24px; }

  :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; border-radius: 2px; }
  ::selection { background: var(--accent); color: var(--accent-ink); }
  .ser { font-family: var(--font-serif); font-style: italic; font-weight: 500; letter-spacing: -0.005em; padding-right: .06em; }

  /* Header */
  header.site { position: sticky; top: 0; z-index: 20; background: color-mix(in srgb, var(--bg) 82%, transparent); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
  nav.site { display: flex; align-items: center; gap: 24px; height: 62px; }
  .brand { display: inline-flex; align-items: center; gap: 9px; font-weight: 600; font-size: 15.5px; letter-spacing: -0.01em; color: var(--ink); text-decoration: none; margin-right: auto; }
  .brand svg { color: var(--accent); }
  .brand-svg { width: 22px; height: 22px; flex: none; }
  nav.site a.nav { color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 500; padding: 4px 0; transition: color .18s var(--ease-out); }
  nav.site a.nav:hover { color: var(--ink); }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 18px; border-radius: var(--radius-sm); border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); font: inherit; font-size: 15px; font-weight: 500; line-height: 1; cursor: pointer; text-decoration: none; transition: background .16s var(--ease-out), border-color .16s var(--ease-out), color .16s var(--ease-out), transform .12s var(--ease-out); }
  .btn:hover { border-color: color-mix(in srgb, var(--line-strong) 40%, var(--ink)); }
  .btn:active { transform: translateY(1px); }
  .btn-lg { padding: 13px 22px; font-size: 15.5px; }
  .btn-primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); font-weight: 600; }
  .btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); color: var(--accent-ink); }
  .btn-ghost { border-color: var(--line-strong); background: transparent; color: var(--ink); }
  .btn-ghost:hover { background: var(--surface-2); }
  .btn-mini { display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px; border-radius: 6px; border: 1px solid var(--line-strong); background: var(--surface); color: var(--muted); font-family: var(--font-mono); font-size: 12px; font-weight: 500; line-height: 1.4; cursor: pointer; transition: border-color .16s var(--ease-out), color .16s var(--ease-out); }
  .btn-mini:hover { border-color: var(--faint); color: var(--ink); }
  .btn-mini svg { flex: none; color: var(--accent); }

  /* Hero */
  .hero { position: relative; overflow: hidden; border-bottom: 1px solid var(--line); background: radial-gradient(120% 90% at 78% -10%, color-mix(in srgb, var(--accent) 13%, transparent), transparent 55%), radial-gradient(90% 70% at 8% 110%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 60%); }
  .hero-inner { position: relative; padding: clamp(84px, 11vw, 128px) 24px clamp(80px, 10vw, 112px); max-width: 760px; }
  .hero .rule { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .hero .rule::before { content: ""; width: 26px; height: 1px; background: var(--accent); flex: none; }
  .hero .audience { font-family: var(--font-mono); font-size: 12px; letter-spacing: .09em; text-transform: uppercase; color: var(--accent); font-weight: 500; }
  h1 { margin: 0 0 18px; font-size: clamp(2.5rem, 5.6vw, 4.2rem); line-height: 1.02; letter-spacing: -0.035em; text-wrap: balance; color: var(--ink); font-weight: 600; }
  .hero h1 { max-width: 18ch; }
  .lede { margin: 0; font-size: clamp(1.05rem, 1.5vw, 1.18rem); line-height: 1.65; color: var(--muted); max-width: 58ch; }
  .hero-cta { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 32px; }
  .spec-line { margin: 36px 0 0; padding-top: 22px; border-top: 1px solid var(--line); font-family: var(--font-mono); font-size: 12px; color: var(--faint); letter-spacing: .02em; }

  /* Sections */
  section.block { padding-top: clamp(64px, 8vw, 96px); padding-bottom: clamp(64px, 8vw, 96px); }
  .hairline-top { border-top: 1px solid var(--line); }
  h2 { margin: 0 0 14px; font-size: clamp(1.6rem, 3.2vw, 2.15rem); letter-spacing: -0.028em; line-height: 1.1; text-wrap: balance; color: var(--ink); font-weight: 600; }
  .lede-dark { margin: 0; font-size: 1.05rem; color: var(--muted); max-width: 62ch; line-height: 1.65; }
  .muted { color: var(--muted); }
  .text-accent { color: var(--accent); }

  /* Asymmetric split: pains */
  .split { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(32px, 5vw, 64px); align-items: start; }
  @media (max-width: 820px) { .split { grid-template-columns: 1fr; gap: 28px; } }
  .split .intro { position: sticky; top: 90px; }
  @media (max-width: 820px) { .split .intro { position: static; } }
  .split .intro h2 { margin-bottom: 16px; }
  .pain-row { border-top: 1px solid var(--line); padding: 26px 0; }
  .pain-row:last-child { border-bottom: 1px solid var(--line); }
  .pain-row h3 { margin: 0 0 8px; font-size: 1.18rem; letter-spacing: -0.014em; color: var(--ink); font-weight: 600; }
  .pain-row p { margin: 0; color: var(--muted); max-width: 58ch; font-size: 15px; text-wrap: pretty; }

  /* Manifest: typographic index */
  .panel { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); box-shadow: inset 0 1px 0 color-mix(in srgb, white 4%, transparent); overflow: hidden; }
  .manifest-row { display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(0, 3fr) auto; gap: 20px; align-items: center; padding: 17px 24px; border-top: 1px solid var(--line); }
  .manifest-row:first-child { border-top: none; }
  .manifest-row:hover { background: var(--surface-2); }
  .manifest-row .fname { font-family: var(--font-mono); font-size: 13px; font-weight: 500; color: var(--ink); overflow-wrap: anywhere; }
  .manifest-row .frole { color: var(--muted); font-size: 14.5px; max-width: 52ch; }
  @media (max-width: 720px) { .manifest-row { grid-template-columns: 1fr; gap: 6px; } }

  /* Steps: editorial numbered list */
  .steps { margin-top: 34px; }
  .step { display: grid; grid-template-columns: minmax(64px, auto) 1fr; gap: 26px; padding: 26px 0; border-top: 1px solid var(--line); }
  .step:last-child { border-bottom: 1px solid var(--line); }
  .step .n { font-family: var(--font-mono); font-size: 13px; letter-spacing: .06em; padding-top: 4px; color: var(--accent); }
  .step h3 { margin: 0 0 6px; font-size: 1.12rem; letter-spacing: -0.012em; color: var(--ink); font-weight: 600; }
  .step p { margin: 0; color: var(--muted); max-width: 56ch; font-size: 15px; text-wrap: pretty; }
  @media (max-width: 640px) { .step { grid-template-columns: 1fr; gap: 8px; padding: 20px 0; } }

  /* Honesty: quiet two-column */
  .candid { padding: clamp(32px, 5vw, 48px); }
  .candid-grid { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 5vw, 56px); margin-top: 26px; }
  @media (max-width: 720px) { .candid-grid { grid-template-columns: 1fr; } }
  .candid h3 { font-family: var(--font-mono); font-size: 12px; letter-spacing: .09em; text-transform: uppercase; color: var(--accent); margin: 0 0 4px; }
  .candid .no h3 { color: var(--accent); opacity: .85; }
  .candid ul { list-style: none; margin: 0; padding: 0; }
  .candid li { padding: 11px 0; color: var(--muted); font-size: 14.5px; border-top: 1px solid var(--line); }
  .candid li:first-child { border-top: none; }

  /* Open-source / donation band */
  .support-band { display: flex; gap: 28px; align-items: center; justify-content: space-between; flex-wrap: wrap; padding: clamp(28px, 4vw, 44px) clamp(26px, 4vw, 48px); }
  .support-band h2 { margin: 0 0 8px; }
  .support-band .lede-dark { max-width: 52ch; }
  .support-actions { display: flex; gap: 12px; flex-wrap: wrap; }

  /* Forms (product surface) */
  .tool-grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 24px; align-items: start; margin-top: 30px; }
  @media (max-width: 900px) { .tool-grid { grid-template-columns: 1fr; } }
  .formcard { border: 1px solid var(--line); border-radius: var(--radius); padding: 26px 26px 30px; background: var(--surface); box-shadow: inset 0 1px 0 color-mix(in srgb, white 4%, transparent); }
  .field { display: block; font-size: 13px; font-weight: 600; color: var(--ink); margin: 18px 0 6px; letter-spacing: -0.005em; }
  .field-hint { display: block; font-size: 12.5px; color: var(--muted); margin: 4px 0 0; font-weight: 400; }
  input, select { width: 100%; padding: 11px 13px; border: 1px solid var(--line-strong); border-radius: var(--radius-sm); font: inherit; font-size: 15px; background: var(--bg); color: var(--ink); transition: border-color .16s var(--ease-out), box-shadow .16s var(--ease-out); }
  input::placeholder { color: var(--faint); }
  input:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
  .tool-output { min-width: 0; }
  .preview { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 22px; margin-bottom: 20px; box-shadow: inset 0 1px 0 color-mix(in srgb, white 4%, transparent); }
  .preview h3 { margin: 0 0 4px; font-size: 1rem; }
  .preview .plist { list-style: none; margin: 12px 0 0; padding: 0; }
  .preview .plist li { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; border-top: 1px solid var(--line); font-family: var(--font-mono); font-size: 12.5px; }
  .preview .plist li:first-child { border-top: none; }
  .preview .plist li .open { color: var(--accent); font-weight: 500; }
  .preview .pnext { margin: 14px 0 0; padding: 14px 0 0; border-top: 1px solid var(--line); font-size: 13.5px; color: var(--muted); }
  .preview .pnext strong { color: var(--ink); font-weight: 600; }

  /* Output file blocks */
  .fileblock { margin: 20px 0; }
  .filehead { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
  .filehead .fname { font-family: var(--font-mono); font-weight: 500; font-size: 13.5px; color: var(--ink); }
  .filehead .actions { margin-left: auto; display: inline-flex; gap: 8px; }
  .chip { background: var(--surface-2); border: 1px solid var(--line); border-radius: 999px; padding: 3px 11px; font-size: 12px; color: var(--muted); font-family: var(--font-mono); }
  pre.code { background: var(--code-bg); color: var(--code-ink); padding: 18px 20px; border: 1px solid var(--line); border-radius: var(--radius-sm); overflow: auto; font-size: 12.5px; line-height: 1.6; max-height: 460px; font-family: var(--font-mono); tab-size: 2; }
  pre.code::-webkit-scrollbar { height: 10px; width: 10px; }
  pre.code::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--code-ink) 24%, transparent); border-radius: 6px; }
  .warn { border: 1px solid var(--warn-line); background: var(--warn-bg); color: var(--warn-ink); border-radius: var(--radius-sm); padding: 13px 16px; font-size: 14px; margin: 18px 0; }
  .warn a { color: var(--warn-ink); font-weight: 600; }

  /* FAQ */
  .faq { border-top: 1px solid var(--line); }
  .faq:last-child { border-bottom: 1px solid var(--line); }
  .faq summary { padding: 20px 4px; font-weight: 500; font-size: 16px; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
  .faq summary::-webkit-details-marker { display: none; }
  .faq summary::after { content: "+"; font-size: 18px; font-weight: 400; color: var(--accent); transition: transform .2s var(--ease-out); flex: none; }
  .faq[open] summary::after { transform: rotate(45deg); }
  .faq .answer { padding: 0 4px 22px; color: var(--muted); max-width: 72ch; }
  .faq .answer p { margin: 0 0 10px; text-wrap: pretty; }

  /* Prose (privacy / terms / support) */
  .prose { max-width: 780px; }
  .prose h1 { font-size: clamp(1.8rem, 4vw, 2.5rem); letter-spacing: -0.03em; margin-bottom: 6px; }
  .prose h2 { font-size: 1.12rem; margin-top: 32px; }
  .prose p { color: var(--muted); }
  .prose a { color: var(--accent); }

  /* Footer */
  footer.site { border-top: 1px solid var(--line); background: var(--surface); padding: 44px 0 56px; margin-top: 48px; color: var(--muted); font-size: 14px; }
  footer.site .wrap { display: flex; flex-wrap: wrap; gap: 22px; align-items: flex-start; }
  footer.site .f-brand { font-weight: 600; color: var(--ink); margin-right: auto; display: inline-flex; align-items: center; gap: 9px; }
  footer.site svg { color: var(--accent); }
  footer.site .f-honesty { font-family: var(--font-mono); font-size: 12px; letter-spacing: .05em; text-transform: uppercase; color: var(--faint); }
  footer.site nav { display: flex; gap: 8px 18px; flex-wrap: wrap; }
  footer.site nav a { color: var(--muted); text-decoration: none; }
  footer.site nav a:hover { color: var(--ink); }

  @media (max-width: 640px) { nav.site a.nav.hide-sm { display: none; } section.block { padding-top: 56px; padding-bottom: 56px; } }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
  .hero-inner { animation: rise .5s var(--ease-out) both; }
  .rv { will-change: transform; }
  .rv.played { animation: rise .55s cubic-bezier(.16,1,.3,1) both; }
  .step.rv { animation-delay: calc(var(--i, 0) * 90ms); }
  @keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
`;

function styleEl(): HTMLStyleElement {
  const el = document.createElement("style");
  el.textContent = STYLE;
  return el;
}

function headerEl(): HTMLElement {
  const nav = document.createElement("nav");
  nav.className = "site wrap";
  nav.innerHTML = `
    <a class="brand" href="#/">${shieldMark()}<span>${esc(BRAND)}</span></a>
    <a class="nav" href="#/generate">Generate</a>
    <a class="nav" href="#/faq">FAQ</a>
    <a class="nav hide-sm" href="#/support">Support</a>
    <a class="nav hide-sm" href="#/privacy">Privacy</a>
    <a class="nav hide-sm" href="#/terms">Terms</a>
    <a class="btn btn-primary" href="${esc(DONATE_LINK)}">Donate</a>
  `;
  const header = document.createElement("header");
  header.className = "site";
  header.appendChild(nav);
  return header;
}

function footerEl(): HTMLElement {
  const foot = document.createElement("footer");
  foot.className = "site";
  const wrap = document.createElement("div");
  wrap.className = "wrap";
  wrap.innerHTML = `
    <span class="f-brand">${shieldMark()}<span>${esc(BRAND)}</span></span>
    <span class="f-honesty">Deterrence, not enforcement. Free, forever.</span>
    <nav aria-label="Footer">
      <a href="#/generate">Generate</a>
      <a href="#/support">Support</a>
      <a href="#/faq">FAQ</a>
      <a href="${esc(GITHUB_URL)}" target="_blank" rel="noopener">GitHub</a>
      <a href="#/privacy">Privacy</a>
      <a href="#/terms">Terms</a>
    </nav>
  `;
  foot.appendChild(wrap);
  return foot;
}

function supportEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap block prose";
  el.innerHTML = `
    <h1>Keep Repo Shield open</h1>
    <p>Everything here is free, forever. The source is public on GitHub, you can fork it, and you can run it yourself. Donations are optional.</p>
    <p>If the templates and the weekly monitoring save you a headache, a little goes toward hosting, template audits, and keeping the project maintained.</p>
    <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:22px">
      <a class="btn btn-lg btn-primary" href="${esc(DONATE_LINK)}">Donate with Stripe</a>
      <a class="btn btn-lg btn-ghost" href="${esc(GITHUB_URL)}" target="_blank" rel="noopener">Star on GitHub</a>
    </div>
    <p style="font-family:var(--font-mono);font-size:12.5px;color:var(--faint);margin-top:28px">Open source. One condition: no AI training on this code.</p>
  `;
  return el;
}

function landingEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "landing";
  const pains = PAIN_POINTS.map((p) => `
    <div class="pain-row">
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.body)}</p>
    </div>
  `).join("");
  const manifest = PACK_MANIFEST.map((m) => `
    <div class="manifest-row">
      <span class="fname">${esc(m.file)}</span>
      <span class="frole">${esc(m.role)}</span>
    </div>
  `).join("");
  const steps = HOW_IT_WORKS.map(
    ([t, d], i) => `<div class="step rv" style="--i:${i}"><span class="n">0${i + 1}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`,
  ).join("");
  el.innerHTML = `
    <div class="hero">
      <div class="wrap hero-inner">
        <div class="rule"><span class="audience">${esc(AUDIENCE)}</span></div>
        <h1>Protect <span class="ser">every public repo</span> from AI scraping.</h1>
        <p class="lede">${esc(SUB)}</p>
        <div class="hero-cta">
          <a class="btn btn-lg btn-primary" href="#/generate">Generate your pack</a>
          <a class="btn btn-lg btn-ghost" href="${esc(GITHUB_URL)}" target="_blank" rel="noopener">Open source on GitHub</a>
        </div>
        <p class="spec-line">LICENSE + NOTICE + AI policy&nbsp;&nbsp;·&nbsp;&nbsp;monitoring in your own CI&nbsp;&nbsp;·&nbsp;&nbsp;MIT · ISC · Apache-2.0 · GPL-3.0 · Unlicense</p>
      </div>
    </div>

    <div class="wrap block split hairline-top rv">
      <div class="intro">
        <h2>Your public code is <span class="ser">already being trained on.</span></h2>
        <p class="lede-dark">Most maintainers never get the chance to say no. Not because they wouldn't, but because saying it across dozens of repos is manual work nobody ships.</p>
      </div>
      <div>${pains}</div>
    </div>

    <div class="wrap block rv">
      <h2>What's <span class="ser">in your protection pack</span></h2>
      <p class="lede-dark" style="margin-bottom:26px">Four files stake the claim on every repo. The rest protects them all at once and keeps watch every week.</p>
      <div class="panel">${manifest}</div>
    </div>

    <div class="wrap block hairline-top rv">
      <h2>From zero to protected <span class="ser">in minutes</span></h2>
      <div class="steps">${steps}</div>
    </div>

    <div class="wrap block rv">
      <div class="panel candid">
        <h2>What Repo Shield does, and <span class="ser">what it can't</span></h2>
        <div class="candid-grid">
          <div class="yes">
            <h3>Does</h3>
            <ul>${DOES.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
          </div>
          <div class="no">
            <h3>Doesn't</h3>
            <ul>${DOESNT.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
          </div>
        </div>
      </div>
    </div>

    <div class="wrap block hairline-top rv">
      <div class="panel support-band" style="border-color:var(--accent-line);background:linear-gradient(180deg, var(--accent-tint), var(--surface))">
        <div>
          <h2>Free forever. <span class="ser">Built for maintainers.</span></h2>
          <p class="lede-dark">Repo Shield is open source, with a custom license that keeps AI training off this code. If it saves you a headache, chip in.</p>
        </div>
        <div class="support-actions">
          <a class="btn btn-lg btn-primary" href="${esc(DONATE_LINK)}">Donate</a>
          <a class="btn btn-lg btn-ghost" href="${esc(GITHUB_URL)}" target="_blank" rel="noopener">Star on GitHub</a>
        </div>
      </div>
    </div>
  `;
  return el;
}

function faqEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap block";
  const items = FAQS.map(
    (f) => `
      <details class="faq">
        <summary>${esc(f.q)}</summary>
        <div class="answer"><p>${esc(f.a)}</p></div>
      </details>
    `,
  ).join("");
  el.innerHTML = `
    <h2>Questions, answered <span class="ser">straight</span></h2>
    <div style="margin-top:26px">${items}</div>
  `;
  return el;
}

function proseEl(title: string, sections: Array<[string, string]>): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap block prose";
  el.innerHTML = `<h1>${esc(title)}</h1>${sections
    .map(([h, p]) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`)
    .join("")}`;
  return el;
}

function packFileNames(): Array<{ name: string }> {
  return [
    "LICENSE",
    "NOTICE",
    "AI_TRAINING_POLICY.md",
    "REPO_SHIELD.txt",
    ".github/workflows/repo-shield.yml",
    "scripts/shield-check.mjs",
    "apply-all.sh",
  ].map((name) => ({ name }));
}

function previewList(): string {
  const li = packFileNames()
    .map((f) => `<li><span>${esc(f.name)}</span><span class="open">in pack</span></li>`)
    .join("");
  const next = `<strong>One script</strong> protect-commits every public repo (skips forks), installs the weekly workflow on each, and only touches the five protected files. Or drop the four core files into a single repo by hand.`;
  return `<ul class="plist">${li}</ul><div class="pnext">${next}</div>`;
}

function generateEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap block";
  el.innerHTML = `
    <h1 style="font-size:clamp(1.9rem,4vw,2.6rem);margin-bottom:12px">Build <span class="ser">your protection pack</span></h1>
    <p class="lede-dark">Answer four questions. The whole thing is free: all seven files, for as many repos as you own.</p>
    <div class="tool-grid">
      <div class="formcard">
        <label class="field">GitHub user or org (owner)<span class="field-hint">The account your public repos live under.</span></label>
        <input id="g-owner" placeholder="octocat" autocomplete="off" spellcheck="false" />
        <label class="field">License<span class="field-hint">MIT is the most common, safest default for public code.</span></label>
        <select id="g-license">${LICENSE_OPTIONS.map((l) => `<option value="${l.id}">${esc(l.name)}</option>`).join("")}</select>
        <label class="field">Copyright holder<span class="field-hint">You or your legal entity. Appears in LICENSE and NOTICE.</span></label>
        <input id="g-holder" placeholder="Jane Doe" />
        <label class="field">Year<span class="field-hint">The year of first publication.</span></label>
        <input id="g-year" type="number" value="${new Date().getFullYear()}" />
        <div style="margin-top:24px">
          <button id="g-build" class="btn btn-lg btn-primary" type="button" style="width:100%">Build the pack</button>
        </div>
      </div>
      <div class="tool-output" id="g-output">
        <div class="preview" id="g-preview">
          <h3>What you'll get</h3>
          <div class="plist-wrap"></div>
        </div>
        <p class="muted" style="font-size:13.5px">Paste the files into any repo, or let <strong>apply-all.sh</strong> do it everywhere. You can always review before anything is committed.</p>
      </div>
    </div>
  `;
  el.querySelector("#g-preview .plist-wrap")!.innerHTML = previewList();
  (el.querySelector("#g-build") as HTMLButtonElement).onclick = () => renderTool(el);
  return el;
}

function renderTool(el: HTMLElement): void {
  const owner = (el.querySelector("#g-owner") as HTMLInputElement).value.trim();
  if (!owner) {
    alert("Enter your GitHub user or org name.");
    return;
  }
  const holder = (el.querySelector("#g-holder") as HTMLInputElement).value.trim() || owner;
  const year = Number((el.querySelector("#g-year") as HTMLInputElement).value) || new Date().getFullYear();
  const license = (el.querySelector("#g-license") as HTMLSelectElement).value as License;
  const out = el.querySelector("#g-output") as HTMLElement;

  const pack = protectionFiles(`${owner}/shield`, holder, year, license);
  const files = pack.files;

  const roleFor = (name: string): string =>
    name === "LICENSE" ? "licenses the code" : name === "NOTICE" ? "stakes the AI-training claim" : name === "AI_TRAINING_POLICY.md" ? "machine-readable policy" : "signature marker";

  const fileBlocks = Object.entries(files)
    .map(
      ([name]) => `
        <div class="fileblock">
          <div class="filehead">
            <span class="fname">${esc(name)}</span>
            <span class="chip">${esc(roleFor(name))}</span>
          </div>
          <pre class="code"></pre>
        </div>
      `,
    )
    .join("");

  out.innerHTML = `
    <div class="presult" id="g-result" tabindex="-1">
      <h2 style="font-size:1.35rem;margin:0 0 4px">${esc(owner)} protection pack</h2>
      <p class="muted" style="margin:0 0 14px">Open source. Everything included, for every repo you own.</p>
      ${pack.missingFullText.map((m) => `<div class="warn">${esc(m)}</div>`).join("")}
      ${fileBlocks}
      <div class="fileblock">
        <div class="filehead"><span class="fname">Monitoring</span></div>
        <p class="muted" style="margin:0 0 8px">A weekly GitHub Actions run that verifies the files stay present and flags public copies of your signature marker. Runs in <em>your</em> repo, so we never see your code.</p>
        <div class="filehead"><span class="fname">.github/workflows/repo-shield.yml</span></div>
        <pre class="code"></pre>
        <div class="filehead"><span class="fname">scripts/shield-check.mjs</span></div>
        <pre class="code"></pre>
      </div>
      <div class="fileblock">
        <div class="filehead"><span class="fname">apply-all.sh</span></div>
        <p class="muted" style="margin:0 0 8px">One command protect-commits all your public repos and installs the monitoring workflow on each. Skips forks, only touches the five protected files.</p>
        <pre class="code"></pre>
      </div>
    </div>
  `;

  const pres = out.querySelectorAll("pre.code");
  let i = 0;
  for (const [name, text] of Object.entries(files)) {
    const p = pres[i++] as HTMLPreElement;
    p.textContent = text;
    const block = p.closest(".fileblock") as HTMLElement;
    const actions = document.createElement("span");
    actions.className = "actions";
    actions.appendChild(copyButton(() => text, "Copy"));
    actions.appendChild(downloadButton(name, text, "Download"));
    block.querySelector(".filehead")!.appendChild(actions);
  }

  const wf = pres[i++] as HTMLPreElement;
  wf.textContent = monitorWorkflow();
  const wfHead = (wf.closest(".fileblock") as HTMLElement).querySelector(".filehead") as HTMLElement;
  const wfActions = document.createElement("span");
  wfActions.className = "actions";
  wfActions.appendChild(downloadButton("repo-shield.yml", monitorWorkflow(), "Download"));
  wfHead.appendChild(wfActions);

  const chk = pres[i++] as HTMLPreElement;
  chk.textContent = shieldCheckScript();
  const chkActions = document.createElement("span");
  chkActions.className = "actions";
  chkActions.appendChild(downloadButton("shield-check.mjs", shieldCheckScript(), "Download"));
  (chk.closest(".filehead") as HTMLElement).appendChild(chkActions);

  const sh = pres[i] as HTMLPreElement;
  sh.textContent = applyAllScript() + "\n" + applyAllNote();
  const shActions = document.createElement("span");
  shActions.className = "actions";
  shActions.appendChild(downloadButton("apply-all.sh", applyAllScript(), "Download"));
  (sh.closest(".filehead") as HTMLElement).appendChild(shActions);

  const result = out.querySelector("#g-result") as HTMLElement;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function root(): HTMLElement {
  return document.getElementById("root") as HTMLElement;
}

function setupReveals(el: HTMLElement): void {
  const items = el.querySelectorAll<HTMLElement>(".rv");
  if (!items.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("played");
          io.unobserve(e.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );
  for (const item of Array.from(items)) io.observe(item);
}

function render(): void {
  const el = root();
  el.innerHTML = "";
  el.appendChild(styleEl());
  el.appendChild(headerEl());
  const main = document.createElement("main");
  const route = window.location.hash || "#/";
  if (route.startsWith("#/privacy")) main.appendChild(proseEl("Privacy Policy", PRIVACY_SECTIONS));
  else if (route.startsWith("#/terms")) main.appendChild(proseEl("Terms of Service", TERMS_SECTIONS));
  else if (route.startsWith("#/faq")) main.appendChild(faqEl());
  else if (route.startsWith("#/support") || route.startsWith("#/pricing")) main.appendChild(supportEl());
  else if (route.startsWith("#/generate")) main.appendChild(generateEl());
  else main.appendChild(landingEl());
  el.appendChild(main);
  el.appendChild(footerEl());
  setupReveals(el);
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
document.title = `${BRAND} · ${TAGLINE}`;
render();