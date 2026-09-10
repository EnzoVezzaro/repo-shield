import {
  AUDIENCE,
  BRAND,
  DOES,
  DOESNT,
  FAQS,
  HOW_IT_WORKS,
  PACK_MANIFEST,
  PAIN_POINTS,
  PRICING_TIERS,
  PRIVACY_SECTIONS,
  SUB,
  TAGLINE,
  TERMS_SECTIONS,
  type PricingTier,
} from "./content.js";
import { LICENSE_OPTIONS, protectionFiles, type License } from "./lib/legal.js";
import { monitorWorkflow, shieldCheckScript } from "./lib/monitor.js";
import { applyAllNote, applyAllScript } from "./lib/applyAll.js";
import { env } from "./lib/env.js";

const PRO_LINK = env("VITE_STRIPE_PRO_PAYMENT_LINK");
const AUDIT_LINK = env("VITE_STRIPE_AUDIT_PAYMENT_LINK");

function tierHref(tier: PricingTier): string {
  if (tier.id === "pro") return PRO_LINK ?? "#/pricing";
  if (tier.id === "audit") return AUDIT_LINK ?? "#/pricing";
  return tier.href;
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

function copyButton(target: () => string, label: string): HTMLElement {
  const btn = document.createElement("button");
  btn.textContent = label;
  btn.className = "btn btn-ghost";
  btn.type = "button";
  btn.onclick = async () => {
    btn.textContent = await copyText(target()) ? "Copied ✓" : "Select manually";
    setTimeout(() => (btn.textContent = label), 1600);
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
  btn.textContent = label;
  btn.className = "btn btn-ghost";
  btn.type = "button";
  btn.onclick = () => download(filename, text);
  return btn;
}

/* Contour lines — a survey map of the territory you claim. */
function contourSvg(): string {
  const rings = [0, 1, 2, 3, 4, 5]
    .map((i) => {
      const r = 18 + i * 21;
      const wobble = i % 2 === 0 ? 7 : -6;
      const rot = 14 + i * 11;
      const o = 0.55 - i * 0.07;
      return `<ellipse cx="50%" cy="50%" rx="${r + wobble}%" ry="${r}%" fill="none" stroke="currentColor" stroke-width="1.2" opacity="${o.toFixed(2)}" transform="rotate(${rot} 50% 50%)"/>`;
    })
    .join("");
  return `<svg class="contours" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="100" height="100" fill="none"/>${rings}<circle cx="50%" cy="50%" r="3.2%" fill="currentColor" opacity="0.9"/><path d="M50 40 V50 M50 50 H60" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>`;
}

/* Landmark mark — a surveyor's claim stake. */
function landMark(tone: "brass" | "moss"): string {
  const c = tone === "brass" ? "var(--accent)" : "var(--primary)";
  return `<svg class="mark" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="8.6" fill="none" stroke="${c}" stroke-width="1.8"/>
    <circle cx="12" cy="12" r="3.4" fill="none" stroke="${c}" stroke-width="1.8"/>
    <path d="M12 0.8 V5.6 M21.2 12 H16.4 M2.8 12 H7.6 M12 22.4 V18.4" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/>
  </svg>`;
}

const STYLE = `
  :root {
    --bg: oklch(1 0 0);
    --surface: oklch(0.968 0.006 165);
    --surface-2: oklch(0.948 0.01 165);
    --ink: oklch(0.23 0.02 170);
    --muted: oklch(0.5 0.02 170);
    --primary: oklch(0.46 0.11 160);
    --primary-hover: oklch(0.4 0.11 160);
    --on-primary: #fff;
    --deep: oklch(0.29 0.055 168);
    --ink-on-deep: oklch(0.93 0.01 175);
    --muted-on-deep: oklch(0.8 0.025 172);
    --accent: oklch(0.7 0.12 82);
    --accent-deep: oklch(0.45 0.1 84);
    --accent-soft: oklch(0.93 0.03 86);
    --line: oklch(0.9 0.008 170);
    --code-bg: oklch(0.225 0.03 172);
    --code-ink: oklch(0.96 0.005 175);
    --warn-bg: oklch(0.965 0.035 92);
    --warn-line: oklch(0.85 0.09 88);
    --warn-ink: oklch(0.45 0.09 86);
    --font-sans: "Familjen Grotesk", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    --ease-out: cubic-bezier(.22,.61,.36,1);
    --radius: 18px;
    --radius-sm: 10px;
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; font-family: var(--font-sans); color: var(--ink); background: var(--bg); line-height: 1.6; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
  .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }

  /* Header */
  header.site { position: sticky; top: 0; z-index: 20; background: color-mix(in oklab, var(--bg) 82%, transparent); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); border-bottom: 1px solid var(--line); }
  nav.site { display: flex; align-items: center; gap: 22px; height: 66px; }
  .brand { display: inline-flex; align-items: center; gap: 9px; font-weight: 700; font-size: 16.5px; letter-spacing: -0.01em; color: var(--ink); text-decoration: none; margin-right: auto; }
  .brand .mark { width: 24px; height: 24px; }
  nav.site a.nav { color: var(--muted); text-decoration: none; font-size: 14.5px; font-weight: 500; padding: 4px 2px; border-bottom: 2px solid transparent; transition: color .18s var(--ease-out), border-color .18s var(--ease-out); }
  nav.site a.nav:hover { color: var(--ink); border-bottom-color: var(--accent); }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 11px 18px; border-radius: var(--radius-sm); border: 1px solid var(--line); background: var(--bg); color: var(--ink); font: inherit; font-size: 15px; font-weight: 600; line-height: 1; cursor: pointer; text-decoration: none; transition: background .18s var(--ease-out), border-color .18s var(--ease-out), color .18s var(--ease-out), transform .12s var(--ease-out); }
  .btn:hover { border-color: color-mix(in oklab, var(--line) 40%, var(--ink)); }
  .btn:active { transform: translateY(1px); }
  .btn-lg { padding: 14px 22px; font-size: 16px; }
  .btn-primary { background: var(--primary); border-color: var(--primary); color: var(--on-primary); }
  .btn-primary:hover { background: var(--primary-hover); border-color: var(--primary-hover); }
  .btn-plain { border-color: transparent; background: transparent; color: var(--ink); }
  .btn-ghost { padding: 6px 10px; font-size: 12.5px; font-family: var(--font-mono); font-weight: 500; border-radius: 7px; color: var(--muted); background: color-mix(in oklab, var(--bg) 60%, transparent); }
  .btn-ghost:hover { color: var(--ink); border-color: var(--accent); }
  .btn .mark { width: 16px; height: 16px; }

  /* Hero */
  .hero { position: relative; color: var(--ink-on-deep); background: var(--deep); overflow: hidden; }
  .hero::after { content: ""; position: absolute; inset: 0; background: radial-gradient(120% 90% at 78% -10%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 55%); }
  .contour-bg { position: absolute; inset: 0; }
  .contours { position: absolute; inset: -12%; width: 124%; height: 124%; color: color-mix(in oklab, var(--accent) 60%, transparent); }
  .hero-inner { position: relative; z-index: 1; padding: 96px 24px 84px; }
  .claim-tag { display: inline-flex; align-items: center; gap: 9px; font-family: var(--font-mono); font-size: 12.5px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted-on-deep); border: 1px solid color-mix(in oklab, var(--accent) 45%, transparent); border-radius: 999px; padding: 6px 14px; margin-bottom: 26px; }
  .claim-tag .mark { width: 14px; height: 14px; }
  .kicker { font-family: var(--font-mono); font-size: 13px; letter-spacing: .1em; text-transform: uppercase; color: var(--accent); margin: 0 0 18px; }
  h1 { margin: 0 0 20px; font-size: clamp(2.4rem, 6vw, 4.1rem); line-height: 1.04; letter-spacing: -0.032em; text-wrap: balance; color: var(--ink); }
  .hero h1 { color: var(--ink-on-deep); }
  .lede { margin: 0; font-size: clamp(1.05rem, 1.6vw, 1.2rem); line-height: 1.62; color: var(--muted-on-deep); max-width: 62ch; }
  .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 34px; }
  .btn-on-deep { background: var(--bg); border-color: var(--bg); color: var(--deep); }
  .btn-on-deep:hover { background: color-mix(in oklab, var(--bg) 88%, var(--accent)); border-color: color-mix(in oklab, var(--bg) 88%, var(--accent)); }
  .btn-outline-deep { background: transparent; border-color: color-mix(in oklab, var(--ink-on-deep) 42%, transparent); color: var(--ink-on-deep); }
  .btn-outline-deep:hover { border-color: var(--accent); color: var(--ink-on-deep); }
  .hero-notes { list-style: none; margin: 40px 0 0; padding: 0; display: flex; flex-wrap: wrap; gap: 10px 26px; }
  .hero-notes li { font-size: 13.5px; color: var(--muted-on-deep); display: inline-flex; align-items: center; gap: 8px; }
  .hero-notes li::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--accent); }

  /* Sections */
  section.landing { padding: 0; }
  .block-section { padding: 72px 0; }
  .claim-mark { display: block; margin-bottom: 18px; }
  .claim-mark .mark { width: 30px; height: 30px; }
  h2 { margin: 0 0 14px; font-size: clamp(1.6rem, 3.6vw, 2.3rem); letter-spacing: -0.024em; line-height: 1.12; text-wrap: balance; }
  .kicker-dark { font-family: var(--font-mono); font-size: 12.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep); margin: 0 0 12px; }
  .lede-dark { margin: 0; font-size: 1.05rem; color: var(--muted); max-width: 62ch; }
  .muted { color: var(--muted); }

  /* Pain / claim rows */
  .claim-grid { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 3fr); gap: 48px; align-items: start; }
  @media (max-width: 780px) { .claim-grid { grid-template-columns: 1fr; gap: 28px; } }
  .pain-row { border-top: 1px solid var(--line); padding: 26px 0; }
  .pain-row h3 { margin: 0 0 6px; font-size: 1.12rem; letter-spacing: -0.01em; }
  .pain-row p { margin: 0; color: var(--muted); max-width: 56ch; }

  /* Manifest table */
  .manifest { border: 1px solid var(--line); border-radius: var(--radius); overflow: hidden; background: var(--bg); }
  .manifest-row { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 3fr) auto; gap: 18px; align-items: center; padding: 18px 22px; border-top: 1px solid var(--line); }
  .manifest-row:first-child { border-top: none; }
  .manifest-row:hover { background: var(--surface); }
  .manifest-row .fname { font-family: var(--font-mono); font-size: 13px; font-weight: 500; color: var(--ink); overflow-wrap: anywhere; }
  .manifest-row .frole { color: var(--muted); font-size: 14px; max-width: 48ch; }
  .manifest-row .falways { font-family: var(--font-mono); font-size: 11.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--accent-deep); background: var(--accent-soft); border-radius: 999px; padding: 4px 10px; white-space: nowrap; }
  @media (max-width: 720px) { .manifest-row { grid-template-columns: 1fr; gap: 6px; } }

  /* Steps (a real ordered flow) */
  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; counter-reset: step; }
  @media (max-width: 820px) { .steps { grid-template-columns: 1fr; } }
  .step { position: relative; border: 1px solid var(--line); border-radius: var(--radius); padding: 26px 24px; background: var(--bg); }
  .step::before { counter-increment: step; content: "0" counter(step); font-family: var(--font-mono); font-size: 13px; letter-spacing: .08em; color: var(--accent-deep); }
  .step h3 { margin: 14px 0 6px; font-size: 1.1rem; letter-spacing: -0.01em; }
  .step p { margin: 0; color: var(--muted); font-size: 14.5px; }

  /* Honesty — do/don't */
  .candid { border-radius: var(--radius); background: var(--surface-2); padding: 40px 24px; }
  .candid-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 26px; }
  @media (max-width: 720px) { .candid-grid { grid-template-columns: 1fr; gap: 24px; } }
  .candid h3 { font-size: 1rem; display: inline-flex; align-items: center; gap: 9px; margin: 0 0 12px; }
  .candid .sig { font-family: var(--font-mono); font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
  .candid-ok .sig { color: var(--primary); }
  .candid-no .sig { color: var(--accent-deep); }
  .candid ul { list-style: none; margin: 0; padding: 0; }
  .candid li { position: relative; padding: 8px 0 8px 24px; color: var(--muted); font-size: 14.5px; border-top: 1px solid color-mix(in oklab, var(--line) 70%, transparent); }
  .candid li:first-of-type { border-top: none; }
  .candid li::before { content: ""; position: absolute; left: 4px; top: 16px; width: 7px; height: 7px; border-radius: 50%; }
  .candid-ok li::before { background: var(--primary); }
  .candid-no li::before { background: var(--accent); }

  /* Pricing */
  .pricing { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 18px; margin-top: 30px; align-items: stretch; }
  .tier { border: 1px solid var(--line); border-radius: var(--radius); padding: 28px 26px; background: var(--bg); display: flex; flex-direction: column; }
  .tier.featured { background: var(--deep); color: var(--ink-on-deep); border-color: var(--deep); position: relative; }
  .tier .plate { font-family: var(--font-mono); font-size: 11.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--accent-deep); background: var(--accent-soft); border-radius: 999px; padding: 4px 11px; align-self: flex-start; margin-bottom: 18px; }
  .tier.featured .plate { color: oklch(0.3 0.08 84); background: var(--accent); }
  .tier h3 { margin: 0 0 4px; font-size: 1.2rem; letter-spacing: -0.01em; }
  .tier .price { font-size: 2.1rem; font-weight: 700; letter-spacing: -0.03em; line-height: 1.1; margin: 6px 0 16px; }
  .tier .price .per { font-size: 0.95rem; font-weight: 500; color: var(--muted); letter-spacing: 0; }
  .tier.featured .price .per { color: var(--muted-on-deep); }
  .tier .bullet { color: var(--muted); font-size: 14.5px; flex: 1; margin-bottom: 22px; }
  .tier.featured .bullet { color: var(--muted-on-deep); }
  .tier .btn { width: 100%; }
  .tier.featured .btn { background: var(--bg); border-color: var(--bg); color: var(--deep); }
  .tier.featured .btn:hover { background: var(--accent); border-color: var(--accent); color: oklch(0.98 0.01 90); }

  /* Forms (product surface) */
  .tool-grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 26px; align-items: start; margin-top: 34px; }
  @media (max-width: 880px) { .tool-grid { grid-template-columns: 1fr; } }
  .formcard { border: 1px solid var(--line); border-radius: var(--radius); padding: 26px 26px 30px; background: var(--bg); }
  .field { display: block; font-size: 13px; font-weight: 600; color: var(--muted); margin: 18px 0 6px; letter-spacing: -0.005em; }
  .field-hint { display: block; font-size: 12.5px; color: var(--muted); opacity: .85; margin: 4px 0 0; font-weight: 400; }
  input, select { width: 100%; padding: 12px 14px; border: 1px solid var(--line); border-radius: var(--radius-sm); font: inherit; font-size: 15px; background: var(--bg); color: var(--ink); transition: border-color .18s var(--ease-out), box-shadow .18s var(--ease-out); }
  input:focus, select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 22%, transparent); }
  .tool-output { min-width: 0; }
  .preview { border: 1px solid var(--line); border-radius: var(--radius); background: var(--surface); padding: 22px; margin-bottom: 22px; }
  .preview h3 { margin: 0 0 14px; font-size: 0.98rem; }
  .preview .plist { list-style: none; margin: 0; padding: 0; }
  .preview .plist li { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-top: 1px solid color-mix(in oklab, var(--line) 70%, transparent); font-family: var(--font-mono); font-size: 12.5px; }
  .preview .plist li:first-child { border-top: none; }
  .preview .plist li .lock { color: var(--muted); }
  .preview .plist li .open { color: var(--primary); font-weight: 500; }
  .preview .pnext { margin: 16px 0 0; padding: 14px 0 0; border-top: 1px solid var(--line); font-size: 13.5px; color: var(--muted); }
  .preview .pnext strong { color: var(--ink); font-weight: 600; }

  /* Output file blocks */
  .fileblock { margin: 20px 0; }
  .filehead { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
  .filehead .fname { font-family: var(--font-mono); font-weight: 600; font-size: 13.5px; color: var(--ink); }
  .chip { background: var(--surface); border: 1px solid var(--line); border-radius: 999px; padding: 3px 11px; font-size: 12px; color: var(--muted); font-family: var(--font-mono); }
  .chip.pro { color: var(--accent-deep); background: var(--accent-soft); border-color: color-mix(in oklab, var(--accent) 35%, transparent); }
  pre.code { background: var(--code-bg); color: var(--code-ink); padding: 18px; border-radius: var(--radius-sm); overflow: auto; font-size: 12.5px; line-height: 1.6; max-height: 460px; font-family: var(--font-mono); tab-size: 2; }
  pre.code::-webkit-scrollbar { height: 10px; width: 10px; }
  pre.code::-webkit-scrollbar-thumb { background: color-mix(in oklab, var(--code-ink) 24%, transparent); border-radius: 6px; }
  .warn { border: 1px solid var(--warn-line); background: var(--warn-bg); color: var(--warn-ink); border-radius: var(--radius-sm); padding: 13px 16px; font-size: 14px; margin: 18px 0; }
  .warn a { color: var(--warn-ink); font-weight: 600; }

  /* FAQ */
  .faq { border-top: 1px solid var(--line); }
  .faq summary { padding: 20px 4px; font-weight: 600; font-size: 16px; cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 16px; }
  .faq summary::-webkit-details-marker { display: none; }
  .faq summary::after { content: "+"; font-size: 20px; font-weight: 400; color: var(--accent-deep); transition: transform .2s var(--ease-out); flex: none; }
  .faq[open] summary::after { transform: rotate(45deg); }
  .faq .answer { padding: 0 4px 22px; color: var(--muted); max-width: 72ch; }
  .faq .answer p { margin: 0 0 10px; }

  /* Prose (privacy / terms) */
  .prose { max-width: 780px; }
  .prose h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); margin-bottom: 8px; }
  .prose h2 { font-size: 1.15rem; margin-top: 34px; letter-spacing: -0.01em; }
  .prose p { color: var(--muted); }
  .prose a { color: var(--primary); }

  /* Footer */
  footer.site { border-top: 1px solid var(--line); background: var(--surface); padding: 44px 0 60px; margin-top: 40px; color: var(--muted); font-size: 14px; }
  footer.site .wrap { display: flex; flex-wrap: wrap; gap: 22px; align-items: flex-start; }
  footer.site .f-brand { font-weight: 700; color: var(--ink); margin-right: auto; display: inline-flex; align-items: center; gap: 9px; }
  footer.site .f-brand .mark { width: 20px; height: 20px; }
  footer.site .f-honesty { font-family: var(--font-mono); font-size: 12px; letter-spacing: .04em; text-transform: uppercase; color: var(--accent-deep); }
  footer.site nav { display: flex; gap: 8px 18px; flex-wrap: wrap; }
  footer.site nav a { color: var(--muted); text-decoration: none; }
  footer.site nav a:hover { color: var(--ink); }

  @media (max-width: 640px) { nav.site a.nav.hide-sm { display: none; } .hero-inner { padding: 66px 24px 64px; } section { padding: 56px 0; } }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } .hero-inner { animation: none; } }
  .hero-inner { animation: rise .6s var(--ease-out) both; }
  @keyframes rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
`;

function styleEl(): HTMLStyleElement {
  const el = document.createElement("style");
  el.textContent = STYLE;
  return el;
}

function headerEl(): HTMLElement {
  const brandMark = landMark("moss");
  const nav = document.createElement("nav");
  nav.className = "site wrap";
  nav.innerHTML = `
    <a class="brand" href="#/">${brandMark}<span>${esc(BRAND)}</span></a>
    <a class="nav" href="#/generate">Generate</a>
    <a class="nav" href="#/pricing">Pricing</a>
    <a class="nav hide-sm" href="#/faq">FAQ</a>
    <a class="nav hide-sm" href="#/privacy">Privacy</a>
    <a class="nav hide-sm" href="#/terms">Terms</a>
    <a class="btn btn-primary" href="${esc(tierHref(PRICING_TIERS[1] as PricingTier))}">Get Pro</a>
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
    <span class="f-brand">${landMark("brass")}<span>${esc(BRAND)}</span></span>
    <span class="f-honesty">Deterrence, not enforcement.</span>
    <nav aria-label="Footer">
      <a href="#/pricing">Pricing</a>
      <a href="#/faq">FAQ</a>
      <a href="#/generate">Generate</a>
      <a href="#/privacy">Privacy</a>
      <a href="#/terms">Terms</a>
    </nav>
  `;
  foot.appendChild(wrap);
  return foot;
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
      ${m.pro ? '<span class="falways">Pro</span>' : ""}
    </div>
  `).join("");
  const steps = HOW_IT_WORKS.map(
    ([t, d]) => `<div class="step"><h3>${esc(t)}</h3><p>${esc(d)}</p></div>`,
  ).join("");
  el.innerHTML = `
    <div class="hero">
      <div class="contour-bg" aria-hidden="true">${contourSvg()}</div>
      <div class="wrap hero-inner">
        <span class="claim-tag">${landMark("brass")}<span>${esc(AUDIENCE)}</span></span>
        <h1>${esc(TAGLINE)}</h1>
        <p class="lede">${esc(SUB)}</p>
        <div class="hero-cta">
          <a class="btn btn-lg btn-on-deep" href="#/generate">Generate your pack</a>
          <a class="btn btn-lg btn-outline-deep" href="#/pricing">See pricing</a>
        </div>
        <ul class="hero-notes">
          <li>LICENSE + NOTICE + AI policy</li>
          <li>Weekly monitoring in your own CI</li>
          <li>MIT · ISC · Apache-2.0 · GPL-3.0 · Unlicense</li>
        </ul>
      </div>
    </div>

    <div class="wrap">
      <div class="claim-grid" style="padding-top:24px">
        <div>
          <span class="claim-mark">${landMark("moss")}</span>
          <p class="kicker-dark">The claim</p>
          <h2>Your public code is already being trained on.</h2>
          <p class="lede-dark">Most maintainers never get the chance to say no. Not because they wouldn't — because saying it across dozens of repos is manual work nobody ships.</p>
        </div>
        <div>${pains}</div>
      </div>

      <div class="block-section">
        <span class="claim-mark">${landMark("brass")}</span>
        <h2>What's in your protection pack</h2>
        <p class="lede-dark" style="margin-bottom:26px">Four files stake the claim on every repo. Pro adds the script that protects them all at once, plus the weekly patrol.</p>
        <div class="manifest">${manifest}</div>
      </div>

      <div class="block-section">
        <span class="claim-mark">${landMark("moss")}</span>
        <h2>From zero to protected in minutes</h2>
        <div class="steps" style="margin-top:26px">${steps}</div>
      </div>

      <div class="candid block-section">
        <span class="claim-mark">${landMark("brass")}</span>
        <h2>What Repo Shield does — and what it can't</h2>
        <div class="candid-grid">
          <div class="candid-ok">
            <h3><span class="sig">Does</span></h3>
            <ul>${DOES.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
          </div>
          <div class="candid-no">
            <h3><span class="sig">Doesn't</span></h3>
            <ul>${DOESNT.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
          </div>
        </div>
      </div>
    </div>
  `;
  return el;
}

function pricingEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap";
  const cards = PRICING_TIERS.map(
    (t) => `
      <div class="tier ${t.featured ? "featured" : ""}">
        <span class="plate">${t.featured ? "Best value" : esc(t.name.toLowerCase())}</span>
        <h3>${esc(t.name)}</h3>
        <div class="price">${esc(t.price)} <span class="per">${esc(t.period)}</span></div>
        <div class="bullet">${esc(t.bullet)}</div>
        <a class="btn ${t.featured ? "" : "btn-primary"}" href="${esc(tierHref(t))}">${esc(t.cta)}</a>
      </div>
    `,
  ).join("");
  el.innerHTML = `
    <span class="claim-mark">${landMark("moss")}</span>
    <h2>Start free. Go Pro when your fleet is the problem.</h2>
    <p class="lede-dark">Payments handled by Stripe. Cancel anytime.
      ${PRO_LINK ? "" : "Payment links are wired in via environment variables before launch."}</p>
    <div class="pricing">${cards}</div>
  `;
  return el;
}

function faqEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap";
  const items = FAQS.map(
    (f) => `
      <details class="faq">
        <summary>${esc(f.q)}</summary>
        <div class="answer"><p>${esc(f.a)}</p></div>
      </details>
    `,
  ).join("");
  el.innerHTML = `
    <span class="claim-mark">${landMark("brass")}</span>
    <h2>Questions, answered straight</h2>
    <div style="margin-top:22px">${items}</div>
  `;
  return el;
}

function proseEl(title: string, sections: Array<[string, string]>): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap prose";
  el.innerHTML = `<h1>${esc(title)}</h1>${sections
    .map(([h, p]) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`)
    .join("")}`;
  return el;
}

interface ToolState {
  owner: string;
  license: License;
  holder: string;
  year: number;
  plan: "free" | "pro";
}

function defaultYear(): number {
  return new Date().getFullYear();
}

function packFileNames(plan: ToolState["plan"]): Array<{ name: string; pro: boolean }> {
  const names = ["LICENSE", "NOTICE", "AI_TRAINING_POLICY.md", "REPO_SHIELD.txt"].map((n) => ({ name: n, pro: false }));
  if (plan === "pro") {
    names.push(
      { name: ".github/workflows/repo-shield.yml", pro: true },
      { name: "scripts/shield-check.mjs", pro: true },
      { name: "apply-all.sh", pro: true },
    );
  }
  return names;
}

function previewList(plan: ToolState["plan"]): string {
  const all = packFileNames("pro");
  const li = all
    .map((f) => {
      const included = !f.pro || plan === "pro";
      return `<li><span>${esc(f.name)}</span><span class="${included ? "open" : "lock"}">${included ? "in pack" : "Pro"}</span></li>`;
    })
    .join("");
  const next =
    plan === "pro"
      ? `<strong>One script</strong> protect-commits every public repo (skips forks), installs the weekly workflow on each, and only touches the five protected files.`
      : `<strong>Upload to one repo.</strong> Copy the four files into the repository you want protected and commit. Pro applies it to all of them.`;
  return `<ul class="plist">${li}</ul><div class="pnext">${next}</div>`;
}

function generateEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap";
  el.innerHTML = `
    <span class="claim-mark">${landMark("brass")}</span>
    <h1 style="font-size:clamp(1.9rem, 4vw, 2.6rem);margin-bottom:12px">Build your protection pack</h1>
    <p class="lede-dark">Answer four questions. You get a pack ready to commit — one repo free, everything on Pro.</p>
    <div class="tool-grid">
      <div class="formcard">
        <label class="field">GitHub user or org (owner)<span class="field-hint">The account your public repos live under.</span></label>
        <input id="g-owner" placeholder="octocat" autocomplete="off" spellcheck="false" />
        <label class="field">License<span class="field-hint">MIT is the most common, safest default for public code.</span></label>
        <select id="g-license">${LICENSE_OPTIONS.map((l) => `<option value="${l.id}">${esc(l.name)}</option>`).join("")}</select>
        <label class="field">Copyright holder<span class="field-hint">You or your legal entity — appears in LICENSE and NOTICE.</span></label>
        <input id="g-holder" placeholder="Jane Doe" />
        <label class="field">Year<span class="field-hint">The year of first publication.</span></label>
        <input id="g-year" type="number" value="${defaultYear()}" />
        <label class="field">Plan<span class="field-hint">Free covers one repo by hand. Pro scripts all of them + monitoring.</span></label>
        <select id="g-plan">
          <option value="free">Free — one repo</option>
          <option value="pro" selected>Pro — all repos + monitoring</option>
        </select>
        <div style="margin-top:24px">
          <button id="g-build" class="btn btn-lg btn-primary" type="button" style="width:100%">Build the pack</button>
        </div>
      </div>
      <div class="tool-output" id="g-output">
        <div class="preview" id="g-preview">
          <h3>What you'll get</h3>
          <div class="plist-wrap"></div>
        </div>
        <p class="muted" style="font-size:13.5px">Paste the files into any repo — or on Pro, let <strong>apply-all.sh</strong> do it everywhere. You can always review before anything is committed.</p>
      </div>
    </div>
  `;
  const proj = (sel: string): HTMLElement => el.querySelector(sel) as HTMLElement;
  const renderPreview = () => {
    const plan = (proj("#g-plan") as HTMLSelectElement).value as ToolState["plan"];
    (proj("#g-preview .plist-wrap")).innerHTML = previewList(plan);
  };
  (proj("#g-plan") as HTMLSelectElement).addEventListener("change", renderPreview);
  renderPreview();
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
  const year = Number((el.querySelector("#g-year") as HTMLInputElement).value) || defaultYear();
  const license = (el.querySelector("#g-license") as HTMLSelectElement).value as License;
  const plan = (el.querySelector("#g-plan") as HTMLSelectElement).value as ToolState["plan"];
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
      <h2 style="font-size:1.4rem;margin:0 0 4px">${esc(owner)} protection pack</h2>
      <p class="muted" style="margin:0 0 14px">${esc(plan === "free" ? "Free plan — one repo." : "Pro plan — every public repo.")}</p>
      ${pack.missingFullText.map((m) => `<div class="warn">${esc(m)}</div>`).join("")}
      ${fileBlocks}
      <div class="fileblock">
        <div class="filehead"><span class="fname">Monitoring</span><span class="chip pro">Pro</span></div>
        <p class="muted" style="margin:0 0 8px">A weekly GitHub Actions run that verifies the files stay present and flags public copies of your signature marker. Runs in <em>your</em> repo — we never see your code.</p>
        <div class="filehead"><span class="fname">.github/workflows/repo-shield.yml</span></div>
        <pre class="code"></pre>
        <div class="filehead"><span class="fname">scripts/shield-check.mjs</span></div>
        <pre class="code"></pre>
      </div>
      <div class="fileblock">
        <div class="filehead"><span class="fname">apply-all.sh</span><span class="chip pro">Pro</span></div>
        <p class="muted" style="margin:0 0 8px">One command protect-commits all your public repos and installs the monitoring workflow on each. Skips forks, only touches the five protected files.</p>
        <pre class="code"></pre>
      </div>
      ${plan === "free" ? `<div class="warn" style="margin-top:24px">Free plan covers one repo unpacked by hand. Pro protects every public repo with the apply-all script + monitoring. <a href="${esc(tierHref(PRICING_TIERS[1] as PricingTier))}">Upgrade to Pro</a>.</div>` : ""}
    </div>
  `;

  const pres = out.querySelectorAll("pre.code");
  let i = 0;
  for (const [name, text] of Object.entries(files)) {
    const p = pres[i++] as HTMLPreElement;
    p.textContent = text;
    const block = p.closest(".fileblock") as HTMLElement;
    const head = block.querySelector(".filehead") as HTMLElement;
    head.appendChild(copyButton(() => text, "Copy"));
    head.appendChild(downloadButton(name, text, "Download"));
  }

  const wf = pres[i++] as HTMLPreElement;
  wf.textContent = monitorWorkflow();
  const wfBlock = wf.closest(".fileblock") as HTMLElement;
  (wfBlock.querySelector(".filehead") as HTMLElement).appendChild(downloadButton("repo-shield.yml", monitorWorkflow(), "Download"));

  const chk = pres[i++] as HTMLPreElement;
  chk.textContent = shieldCheckScript();
  const chkBlock = chk.closest(".fileblock") as HTMLElement;
  (chkBlock.querySelector(".filehead") as HTMLElement).appendChild(downloadButton("shield-check.mjs", shieldCheckScript(), "Download"));

  const sh = pres[i] as HTMLPreElement;
  sh.textContent = applyAllScript() + "\n" + applyAllNote();
  const shBlock = sh.closest(".fileblock") as HTMLElement;
  (shBlock.querySelector(".filehead") as HTMLElement).appendChild(downloadButton("apply-all.sh", applyAllScript(), "Download"));

  const result = out.querySelector("#g-result") as HTMLElement;
  result.scrollIntoView({ behavior: "smooth", block: "start" });
}

function root(): HTMLElement {
  return document.getElementById("root") as HTMLElement;
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
  else if (route.startsWith("#/pricing")) main.appendChild(pricingEl());
  else if (route.startsWith("#/generate")) main.appendChild(generateEl());
  else main.appendChild(landingEl());
  el.appendChild(main);
  el.appendChild(footerEl());
  el.scrollTop = 0;
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
document.title = `${BRAND} — ${TAGLINE}`;
render();