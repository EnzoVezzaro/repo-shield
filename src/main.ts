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
import { LICENSE_OPTIONS, protectionFiles, type License } from "../cli/lib/legal.ts";
import { monitorWorkflow, shieldCheckScript } from "../cli/lib/monitor.ts";
import { applyAllNote, applyAllScript } from "./lib/applyAll.js";
import { env } from "./lib/env.js";

const DONATE_LINK = env("VITE_STRIPE_PRO_PAYMENT_LINK") ?? "#/support";
const GITHUB_APP_SLUG = "reposell";

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

/* Brand mark: the production logo raster (black, cream, lime sticker badge). */
function logoMark(): string {
  return `<img class="brand-logo" src="images/logo-mark.png" alt="" width="34" height="34" />`;
}

const STYLE = `
  :root {
    --bg: #0a0c0b;
    --surface: #101311;
    --surface-2: #151a16;
    --surface-3: #1b211c;
    --ink: #f5eee5;
    --muted: #bdb6ab;
    --faint: #8c867b;
    --line: #232a24;
    --line-strong: #39433b;
    --accent: #a4f749;
    --accent-hover: #b7fd64;
    --accent-ink: #0a0c0b;
    --accent-dark: #6e9c38;
    --accent-tint: #141b13;
    --accent-line: #3a4f26;
    --code-bg: #070908;
    --code-ink: #f5eee5;
    --warn-bg: #251f0f;
    --warn-line: #6f5b2c;
    --warn-ink: #e7ce8f;
    --cream: #f5eee5;
    --cream-2: #efe7d7;
    --paper-ink: #16130c;
    --paper-muted: #57503f;
    --paper-faint: #6f6752;
    --paper-line: #d6ccb2;
    --olive: #6e9c38;
    --olive-deep: #2d3f1a;
    --olive-deep-2: #263617;
    --font-display: "Big Shoulders Display", "Arial Narrow", sans-serif;
    --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    --ease-out: cubic-bezier(.22,.61,.36,1);
    --ease-snap: cubic-bezier(.16,1,.3,1);
  }
  * { box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body { margin: 0; font-family: var(--font-sans); color: var(--ink); background: var(--bg); line-height: 1.6; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
  h1, h2, h3 { font-family: var(--font-display); font-weight: 800; text-transform: uppercase; letter-spacing: .012em; line-height: .98; text-wrap: balance; }
  .wrap { max-width: 1180px; margin: 0 auto; padding: 0 24px; }

  :focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
  .lime-slab :focus-visible, .paper :focus-visible, .support-band :focus-visible { outline-color: var(--ink); }
  ::selection { background: var(--accent); color: var(--accent-ink); }
  ::-webkit-scrollbar { width: 12px; height: 12px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--ink) 22%, transparent); border: 3px solid var(--bg); border-radius: 0; }
  ::-webkit-scrollbar-thumb:hover { background: color-mix(in srgb, var(--ink) 36%, transparent); }
  input, select, textarea { caret-color: var(--accent); }

  /* Structural signal */
  .hazard { background: repeating-linear-gradient(-45deg, var(--accent) 0 16px, #05070a 16px 32px); }
  .sechead { display: flex; align-items: baseline; gap: 16px; }
  .sechead .secnum { flex: none; transform: translateY(6px); }
  .secnum { font-family: var(--font-mono); font-size: 12px; font-weight: 700; letter-spacing: .12em; color: var(--accent); background: var(--accent-tint); border: 1px solid var(--accent-line); padding: 4px 10px; }

  /* Stamped phrase: solid ink fill + two lime calibration brackets */
  .stamp { position: relative; display: inline-block; margin: 0 .12em .06em; }
  .stamp::before, .stamp::after { content: ""; position: absolute; width: .2em; height: .2em; pointer-events: none; }
  .stamp::before { left: -.05em; top: .02em; border-left: 3px solid var(--accent); border-top: 3px solid var(--accent); }
  .stamp::after { right: -.05em; bottom: -.07em; border-right: 3px solid var(--accent); border-bottom: 3px solid var(--accent); }
  .paper .stamp::before, .paper .stamp::after, .lime-slab .stamp::before, .lime-slab .stamp::after, .support-band .stamp::before, .support-band .stamp::after { border-color: var(--paper-ink); }

  /* Header — ink bar with a lime hazard cap */
  header.site { position: sticky; top: 0; z-index: 30; background: color-mix(in srgb, var(--bg) 94%, transparent); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border-bottom: 1px solid var(--line); }
  header.site::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: repeating-linear-gradient(-45deg, var(--accent) 0 10px, #05070a 10px 20px); pointer-events: none; }
  nav.site { display: flex; align-items: center; gap: 26px; height: 72px; }
  .brand { display: inline-flex; align-items: center; gap: 12px; margin-right: auto; text-decoration: none; color: var(--ink); }
  .brand .mark { font-family: var(--font-display); font-weight: 900; font-size: 18px; letter-spacing: .05em; text-transform: uppercase; white-space: nowrap; }
  .brand .mark b { color: var(--accent); font-weight: 900; }
  .brand-logo { width: 34px; height: 34px; flex: none; display: block; }
  nav.site a.nav { font-family: var(--font-mono); font-size: 11.5px; font-weight: 600; letter-spacing: .09em; text-transform: uppercase; color: var(--muted); text-decoration: none; position: relative; padding: 7px 0; transition: color .16s var(--ease-out); }
  nav.site a.nav:hover { color: var(--ink); }
  nav.site a.nav.on { color: var(--accent); }
  nav.site a.nav.on::after { content: ""; position: absolute; left: 0; bottom: -1px; width: 100%; height: 3px; background: var(--accent); }
  nav.site .status { display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); border: 1px solid var(--line-strong); padding: 5px 10px; }
  nav.site .status::before { content: ""; width: 7px; height: 7px; background: var(--accent); }

  /* Buttons — chunky plates, hard offset edges */
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; padding: 14px 22px; border-radius: 0; border: 1px solid var(--line-strong); background: var(--surface); color: var(--ink); font-family: var(--font-display); font-weight: 800; font-size: 15px; letter-spacing: .06em; text-transform: uppercase; line-height: 1.05; cursor: pointer; text-decoration: none; box-shadow: 0 4px 0 var(--bg); transition: background .16s var(--ease-out), border-color .16s var(--ease-out), color .16s var(--ease-out), transform .12s var(--ease-out), box-shadow .12s var(--ease-out); }
  .btn:hover { border-color: var(--ink); background: var(--surface-3); }
  .btn:active { transform: translateY(3px); box-shadow: 0 1px 0 var(--bg); }
  .btn-lg { padding: 17px 30px; font-size: 16.5px; }
  .btn-primary { background: var(--accent); border-color: var(--accent); color: var(--accent-ink); box-shadow: 0 4px 0 var(--accent-dark); }
  .btn-primary:hover { background: var(--accent-hover); border-color: var(--accent-hover); color: var(--accent-ink); }
  .btn-primary:focus-visible { outline-color: var(--ink); }
  .btn-ghost { background: transparent; color: var(--ink); }
  .btn-ghost:hover { border-color: var(--ink); background: color-mix(in srgb, var(--ink) 8%, transparent); }
  .btn-lime-line { background: transparent; border-color: var(--accent-ink); color: var(--accent-ink); box-shadow: 0 4px 0 color-mix(in srgb, var(--accent-ink) 30%, transparent); }
  .btn-lime-line:hover { background: var(--accent-ink); color: var(--accent); border-color: var(--accent-ink); }
  .btn-mini { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 0; border: 1px solid var(--line-strong); background: transparent; color: var(--muted); font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; line-height: 1.4; cursor: pointer; transition: border-color .16s var(--ease-out), color .16s var(--ease-out); }
  .btn-mini:hover { border-color: var(--faint); color: var(--ink); }
  .btn-mini svg { flex: none; color: var(--accent); }
  .btn .arr { transform: translateX(0); transition: transform .16s var(--ease-snap); }
  .btn:hover .arr { transform: translateX(4px); }

  /* Plates */
  .plate { position: relative; border: 1px solid var(--line); background: var(--surface); }
  .plate::before, .plate::after { content: ""; position: absolute; left: -1px; top: -1px; background: var(--accent); pointer-events: none; }
  .plate::before { width: 18px; height: 3px; }
  .plate::after { width: 3px; height: 18px; }

  /* Hero — poster lockup */
  .hero { position: relative; overflow: hidden; border-bottom: 1px solid var(--line); background-image: radial-gradient(var(--line) 1px, transparent 1.6px), radial-gradient(90% 70% at 96% -14%, color-mix(in srgb, var(--accent) 6%, transparent), transparent 60%), radial-gradient(90% 70% at 2% 116%, color-mix(in srgb, var(--accent) 4%, transparent), transparent 60%); background-size: 30px 30px, auto, auto; }
  .hero-inner { position: relative; display: grid; grid-template-columns: minmax(0, 1.3fr) minmax(320px, 400px); gap: clamp(30px, 4vw, 60px); align-items: center; padding: clamp(66px, 8vw, 104px) 24px clamp(56px, 7vw, 90px); max-width: 1240px; }
  @media (max-width: 1040px) { .hero-inner { grid-template-columns: 1fr; } .hero-sticker { display: none; } }
  .hero h1 { max-width: 15ch; margin: 22px 0 24px; font-size: clamp(3rem, 5.6vw, 4.9rem); font-weight: 900; letter-spacing: .01em; }
  .hero .lede { margin: 0; font-size: clamp(1.05rem, 1.5vw, 1.22rem); line-height: 1.66; color: var(--muted); max-width: 62ch; }
  .hero-kicker { display: inline-flex; align-items: center; gap: 10px; border: 1px solid var(--accent); background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--accent); font-family: var(--font-mono); font-size: 11.5px; font-weight: 600; letter-spacing: .13em; text-transform: uppercase; padding: 7px 12px; }
  .hero-kicker::before { content: ""; width: 8px; height: 8px; background: var(--accent); flex: none; }
  .hero-cta { display: flex; gap: 16px; flex-wrap: wrap; margin-top: 34px; }
  .plate-rule { margin: 44px 0 0; padding: 15px 18px; border: 1px solid var(--line); background: var(--surface); max-width: 680px; display: grid; gap: 7px; }
  .plate-rule .ms { display: block; font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--accent); }
  .plate-rule .spec { display: block; font-family: var(--font-mono); font-size: 12px; color: var(--muted); letter-spacing: .01em; }

  /* Hero sticker: the real logo on a printed patch */
  .hero-sticker { position: relative; }
  .hero-sticker .patch { position: relative; background: var(--cream); border: 2px dashed var(--ink); transform: rotate(2deg); padding: 26px 26px 20px; box-shadow: 10px 12px 0 color-mix(in srgb, var(--accent) 26%, transparent); }
  .hero-sticker .patch::before, .hero-sticker .patch::after { content: ""; position: absolute; width: 18px; height: 4px; background: var(--bg); }
  .hero-sticker .patch::before { left: -6px; top: 14px; transform: rotate(90deg); }
  .hero-sticker .patch::after { right: -6px; bottom: 14px; transform: rotate(90deg); }
  .hero-sticker img { display: block; width: 100%; height: auto; }
  .hero-sticker .patch-cap { display: flex; justify-content: space-between; gap: 10px; margin-top: 14px; padding-top: 10px; border-top: 2px solid var(--bg); font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--paper-faint); }
  .hero-sticker .tag { position: absolute; top: -12px; right: -6px; background: var(--accent); color: var(--accent-ink); font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; padding: 6px 12px; box-shadow: 4px 4px 0 var(--bg); transform: rotate(3deg); }

  .hero-rail { margin-top: clamp(44px, 6vw, 64px); }
  @media (max-width: 1040px) { .hero-sticker { display: none; } }
  .hero-ticker { display: flex; align-items: center; gap: 14px; padding: 12px 18px; background: var(--surface); border: 1px solid var(--line); font-family: var(--font-mono); font-size: 12px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: var(--ink); }
  .hero-ticker::before { content: ""; width: 9px; height: 9px; background: var(--accent); flex: none; }
  .hero-ticker .stripe { margin-left: auto; width: 44px; height: 12px; flex: none; }

  /* Sections */
  .block { padding-top: clamp(64px, 8vw, 104px); padding-bottom: clamp(64px, 8vw, 104px); }
  .hairline-top { border-top: 1px solid var(--line); }
  h1 { font-size: clamp(2.6rem, 5.4vw, 4.3rem); letter-spacing: .008em; }
  h2 { font-size: clamp(1.75rem, 3.2vw, 2.6rem); }
  .lede-dark { margin: 0; font-size: 1.04rem; color: var(--muted); max-width: 62ch; line-height: 1.65; }
  .muted { color: var(--muted); }
  .kicker-bottom { margin-top: 14px; }

  /* Asymmetric split: pains */
  .split { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: clamp(36px, 5vw, 72px); align-items: start; }
  @media (max-width: 860px) { .split { grid-template-columns: 1fr; gap: 8px; } }
  .split .intro { position: sticky; top: 96px; }
  @media (max-width: 860px) { .split .intro { position: static; } }
  .pain-row { position: relative; padding: 28px 0 30px 30px; border-top: 1px solid var(--line); }
  .pain-row:last-child { border-bottom: 1px solid var(--line); }
  .pain-row::before { content: ""; position: absolute; left: 0; top: 36px; width: 16px; height: 16px; background: var(--surface-3); border: 2px solid var(--accent); transition: background .16s var(--ease-out); }
  .pain-row:hover::before { background: var(--accent); }
  .pain-row h3 { margin: 0 0 8px; font-size: 1.32rem; font-weight: 800; letter-spacing: .015em; text-transform: none; color: var(--ink); }
  .pain-row p { margin: 0; color: var(--muted); max-width: 58ch; font-size: 15px; text-wrap: pretty; }

  /* Manifest: printed paper sheet */
  .paper { position: relative; margin-top: 34px; background: var(--cream); color: var(--paper-ink); }
  .paper::before, .paper::after { content: ""; position: absolute; background: var(--bg); pointer-events: none; }
  .paper::before { right: -6px; top: -6px; width: 14px; height: 14px; }
  .paper::after { left: -6px; bottom: -6px; width: 14px; height: 14px; }
  .paper-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 12px 22px; background: var(--paper-ink); color: var(--cream); font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: .14em; text-transform: uppercase; }
  .paper-head .pdot { width: 8px; height: 8px; background: var(--accent); flex: none; }
  .paper .row { display: grid; grid-template-columns: minmax(0, 2.1fr) minmax(0, 3fr) auto; gap: 20px; align-items: center; padding: 17px 22px; border-top: 1px solid var(--paper-line); }
  .paper .row:hover { background: var(--cream-2); }
  .paper .fname { font-family: var(--font-mono); font-size: 13.5px; font-weight: 700; color: var(--paper-ink); overflow-wrap: anywhere; }
  .paper .frole { color: var(--paper-muted); font-size: 14.5px; max-width: 54ch; }
  .paper .chip { border: 1px solid var(--bg); background: var(--olive); color: var(--accent-ink); padding: 4px 11px; font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase; white-space: nowrap; }
  .paper .foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 22px; border-top: 1px solid var(--paper-line); font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--paper-faint); }
  @media (max-width: 720px) { .paper .row { grid-template-columns: 1fr; gap: 6px; } .paper .row .chip { justify-self: start; } }

  /* Steps: print sequence on a punched rail */
  .steps { position: relative; margin-top: 46px; border: 1px solid var(--line); background: var(--surface); }
  .steps::before { content: ""; position: absolute; left: 38px; top: 18px; bottom: 18px; border-left: 2px dashed var(--accent); }
  .step { position: relative; display: grid; grid-template-columns: minmax(56px, auto) 1fr; gap: 26px; padding: 32px 34px 32px 30px; }
  .step + .step { border-top: 1px solid var(--line); }
  .step .n { font-family: var(--font-mono); font-size: 13px; font-weight: 700; letter-spacing: .1em; color: var(--accent); padding-top: 3px; }
  .step h3 { margin: 0 0 6px; font-size: 1.32rem; font-weight: 800; letter-spacing: .015em; text-transform: none; color: var(--ink); }
  .step p { margin: 0; color: var(--muted); max-width: 56ch; font-size: 15px; text-wrap: pretty; }
  @media (max-width: 640px) { .steps::before { left: 14px; } .step { grid-template-columns: 1fr; gap: 6px; padding: 22px 20px 22px 28px; } .step .n { padding-top: 0; } }

  /* Honesty: solid slam columns */
  .candid { margin-top: 34px; border: 1px solid var(--line-strong); padding: 10px; background: var(--surface-2); }
  .candid-grid { display: grid; grid-template-columns: 1fr 1fr; }
  @media (max-width: 760px) { .candid-grid { grid-template-columns: 1fr; } }
  .candid-col { position: relative; }
  .candid-col + .candid-col { border-left: 1px solid var(--bg); }
  .candid-col.does { background: var(--accent); color: var(--accent-ink); }
  .candid-col.doesnt { background: var(--olive-deep); color: var(--cream); }
  .candid-col h3 { margin: 0; padding: 15px 24px; font-size: 1.18rem; font-weight: 900; letter-spacing: .1em; }
  .candid-col.does h3 { background: var(--accent-ink); color: var(--accent); }
  .candid-col.doesnt h3 { background: var(--cream); color: var(--olive-deep); }
  .candid-col ul { list-style: none; margin: 0; padding: 0; }
  .candid-col li { position: relative; padding: 17px 24px 17px 46px; font-size: 14.5px; text-wrap: pretty; }
  .candid-col li + li { border-top: 1px solid color-mix(in srgb, var(--bg) 26%, transparent); }
  .candid-col.does li::before { content: ""; position: absolute; left: 24px; top: 25px; width: 12px; height: 6px; border-left: 2px solid var(--accent-ink); border-bottom: 2px solid var(--accent-ink); transform: rotate(-45deg); }
  .candid-col.doesnt li::before { content: ""; position: absolute; left: 24px; top: 23px; width: 12px; height: 12px; border: 2px solid var(--cream); opacity: .8; }
  .candid-row { display: flex; gap: 18px; align-items: center; justify-content: space-between; padding: 16px 24px; border-top: 1px solid color-mix(in srgb, var(--bg) 26%, transparent); font-family: var(--font-mono); font-size: 11px; letter-spacing: .14em; text-transform: uppercase; color: var(--cream); }
  .candid-row.does { color: var(--accent-ink); }
  .candid-row .c { display: flex; gap: 8px; align-items: center; }
  .candid-row .c::before { content: ""; width: 8px; height: 8px; background: currentColor; }

  /* Support band — solid lime slab */
  .support-band { position: relative; margin-top: 34px; border: 1px solid var(--accent-ink); background: var(--accent); color: var(--accent-ink); padding: clamp(32px, 4vw, 48px) clamp(26px, 4vw, 50px); box-shadow: 8px 8px 0 var(--accent-dark); }
  .support-band::after { content: ""; position: absolute; right: 0; top: 0; width: 120px; height: 100%; background: repeating-linear-gradient(-45deg, transparent 0 14px, color-mix(in srgb, var(--accent-ink) 14%, transparent) 14px 28px); pointer-events: none; }
  .support-band h2 { margin: 0 0 10px; color: var(--accent-ink); max-width: 22ch; }
  .support-band .lede-dark { color: var(--accent-ink); max-width: 54ch; }
  .support-actions { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 26px; }

  /* Forms (product surface) */
  .tool-grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 26px; align-items: start; margin-top: 34px; }
  @media (max-width: 900px) { .tool-grid { grid-template-columns: 1fr; } }
  .formcard { border: 1px solid var(--line); padding: 26px 26px 30px; background: var(--surface); position: relative; }
  .formcard::before { content: ""; position: absolute; left: -1px; top: -1px; width: 100%; height: 4px; background: repeating-linear-gradient(-45deg, var(--accent) 0 10px, #05070a 10px 20px); }

  /* Run-from-terminal CLI card */
  .cmdlist { display: grid; gap: 10px; margin-bottom: 18px; }
  .cmdrow { border: 1px solid var(--line); background: var(--surface); padding: 12px 14px; display: grid; gap: 8px; }
  .cmdtop { display: flex; align-items: baseline; gap: 10px; }
  .cmdnum { font-family: var(--font-mono); font-size: 11px; font-weight: 700; letter-spacing: .12em; color: var(--accent); }
  .cmdlbl { font-family: var(--font-mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
  .cmdline { display: flex; align-items: center; gap: 10px; }
  .cmdline code { flex: 1; font-family: var(--font-mono); font-size: 13px; color: var(--accent); background: #070908; border: 1px dashed var(--accent-line); padding: 9px 12px; word-break: break-all; cursor: pointer; }
  .cmdline .btn-mini { flex: none; }
  .cmdhint { margin: 0 0 18px; font-size: 12.5px; color: var(--muted); line-height: 1.55; }
  .cmdhint code { font-family: var(--font-mono); font-size: 12px; color: var(--accent); }
  .installbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; border: 1px dashed var(--accent-line); background: var(--accent-tint); padding: 10px 14px; font-size: 13.5px; color: var(--ink); }
  .installbar a { color: var(--accent); font-weight: 600; text-decoration: underline; text-underline-offset: 3px; }
  details.manual { margin-top: 22px; border-top: 1px dashed var(--line); padding-top: 14px; }
  details.manual summary { cursor: pointer; font-family: var(--font-mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--muted); }
  details.manual[open] summary { margin-bottom: 12px; }
  .field { display: block; font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: var(--ink); margin: 22px 0 8px; }
  .field::before { content: ""; display: inline-block; width: 8px; height: 2px; background: var(--line-strong); margin-right: 9px; vertical-align: middle; }
  .field-hint { display: block; font-family: var(--font-sans); font-weight: 400; letter-spacing: 0; text-transform: none; font-size: 12.5px; color: var(--muted); margin: 4px 0 0; }
  input, select { width: 100%; padding: 12px 14px; border: 1px solid var(--line-strong); border-radius: 0; font: inherit; font-size: 15px; background: var(--bg); color: var(--ink); transition: border-color .16s var(--ease-out), box-shadow .16s var(--ease-out); margin-top: 2px; }
  input::placeholder { color: var(--faint); }
  input:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 22%, transparent); }
  select { appearance: none; -webkit-appearance: none; background-image: linear-gradient(45deg, transparent 50%, var(--muted) 50%), linear-gradient(135deg, var(--muted) 50%, transparent 50%); background-position: calc(100% - 20px) calc(50% + 4px), calc(100% - 14px) calc(50% + 4px); background-repeat: no-repeat; background-size: 6px 6px; padding-right: 42px; cursor: pointer; }
  .tool-output { min-width: 0; }
  .preview { border: 1px solid var(--line); background: var(--surface); padding: 22px; margin-bottom: 22px; position: relative; }
  .preview h3 { margin: 0 0 4px; font-size: 1.05rem; font-weight: 800; }
  .preview .plist { list-style: none; margin: 12px 0 0; padding: 0; }
  .preview .plist li { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid var(--line); font-family: var(--font-mono); font-size: 12.5px; }
  .preview .plist li:first-child { border-top: none; }
  .preview .plist li .open { color: var(--accent); font-weight: 500; }
  .preview .pnext { margin: 14px 0 0; padding: 14px 0 0; border-top: 1px solid var(--line); font-size: 13.5px; color: var(--muted); }
  .preview .pnext strong { color: var(--ink); font-weight: 600; }

  /* Output file blocks */
  .fileblock { margin: 28px 0; }
  .filehead { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap; }
  .filehead .fname { font-family: var(--font-mono); font-weight: 600; font-size: 13px; color: var(--ink); }
  .filehead .actions { margin-left: auto; display: inline-flex; gap: 8px; }
  .chip { border: 1px solid var(--accent-line); background: var(--accent-tint); color: var(--accent); border-radius: 0; padding: 3px 10px; font-size: 11px; font-weight: 600; font-family: var(--font-mono); letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; }
  pre.code { background: var(--code-bg); color: var(--code-ink); padding: 18px 20px; border: 1px solid var(--line); border-radius: 0; overflow: auto; font-size: 12.5px; line-height: 1.65; max-height: 440px; font-family: var(--font-mono); tab-size: 2; }
  pre.code::-webkit-scrollbar { height: 10px; width: 10px; }
  pre.code::-webkit-scrollbar-thumb { background: color-mix(in srgb, var(--code-ink) 24%, transparent); }
  .warn { border: 1px solid var(--warn-line); background: var(--warn-bg); color: var(--warn-ink); border-radius: 0; padding: 13px 16px; font-size: 14px; margin: 18px 0; }
  .warn a { color: var(--warn-ink); font-weight: 600; }

  /* FAQ */
  .faq { border-top: 1px solid var(--line); }
  .faq:last-child { border-bottom: 1px solid var(--line); }
  .faq summary { padding: 20px 4px 20px 0; font-family: var(--font-display); font-weight: 700; font-size: 1.28rem; letter-spacing: .012em; text-transform: none; cursor: pointer; list-style: none; display: flex; align-items: center; gap: 14px; }
  .faq summary::-webkit-details-marker { display: none; }
  .faq summary::after { content: "+"; font-family: var(--font-mono); font-weight: 400; font-size: 1.2rem; color: var(--accent); transition: transform .2s var(--ease-out); margin-left: auto; flex: none; }
  .faq[open] summary::after { transform: rotate(45deg); }
  .faq .qidx { font-family: var(--font-mono); font-size: 11px; font-weight: 600; letter-spacing: .1em; color: var(--accent); flex: none; }
  .faq .answer { padding: 0 4px 24px 36px; color: var(--muted); max-width: 76ch; }
  .faq .answer p { margin: 0 0 10px; text-wrap: pretty; }

  /* Prose (privacy / terms / support) */
  .prose { max-width: 820px; }
  .page-head { padding-bottom: 34px; border-bottom: 1px solid var(--line); margin-bottom: 40px; }
  .page-head h1 { font-size: clamp(2rem, 4.4vw, 3rem); margin: 0 0 6px; }
  .serial { display: flex; align-items: center; gap: 10px; font-family: var(--font-mono); font-size: 11px; letter-spacing: .12em; text-transform: uppercase; color: var(--faint); margin-top: 16px; }
  .serial::before { content: ""; width: 18px; height: 2px; background: var(--accent); flex: none; }
  .prose h2 { font-size: 1.16rem; font-weight: 700; letter-spacing: .05em; margin-top: 36px; }
  .prose p { color: var(--muted); max-width: 70ch; }
  .prose a:not(.btn) { color: var(--accent); text-decoration: none; border-bottom: 1px dashed var(--accent-line); }
  .prose a:not(.btn):hover { color: var(--accent-hover); border-bottom-color: var(--accent); }

  /* Footer — ink slab on a hazard cap */
  footer.site { position: relative; overflow: hidden; background: #070908; padding: 54px 0 60px; margin-top: 56px; color: var(--muted); font-size: 14px; }
  footer.site::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 4px; background: repeating-linear-gradient(-45deg, var(--accent) 0 12px, #05070a 12px 24px); }
  footer.site::after { content: "SHIELDED"; position: absolute; right: -14px; bottom: -38px; font-family: var(--font-display); font-weight: 900; font-size: clamp(90px, 16vw, 210px); line-height: .8; letter-spacing: .02em; color: transparent; -webkit-text-stroke: 1px var(--line); pointer-events: none; }
  footer.site .wrap { position: relative; z-index: 1; }
  .f-grid { display: flex; flex-wrap: wrap; gap: 36px; align-items: flex-start; }
  footer.site .f-brand { display: inline-flex; align-items: center; gap: 12px; margin-right: auto; font-family: var(--font-display); font-weight: 900; font-size: 21px; letter-spacing: .05em; text-transform: uppercase; color: var(--ink); }
  footer.site .f-brand .brand-logo { width: 40px; height: 40px; }
  footer.site .f-block { flex-basis: min(320px, 100%); }
  footer.site .f-honesty { display: flex; align-items: center; gap: 9px; margin: 12px 0 0; font-family: var(--font-mono); font-size: 11px; letter-spacing: .1em; text-transform: uppercase; color: var(--accent); }
  footer.site .f-honesty::before { content: ""; width: 18px; height: 2px; background: var(--accent); flex: none; }
  footer.site nav { display: flex; gap: 10px 22px; flex-wrap: wrap; }
  footer.site nav a { font-family: var(--font-mono); font-size: 11.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); text-decoration: none; transition: color .16s var(--ease-out); }
  footer.site nav a:hover { color: var(--ink); }
  .f-serial { margin-top: 40px; padding-top: 18px; border-top: 1px solid var(--line); font-family: var(--font-mono); font-size: 10.5px; letter-spacing: .1em; text-transform: uppercase; color: var(--faint); }

  @media (max-width: 640px) { .hide-sm { display: none !important; } nav.site { flex-wrap: wrap; gap: 10px 14px; height: auto; min-height: 72px; padding: 10px 0; } .block { padding-top: 56px; padding-bottom: 56px; } nav.site .status { display: none; } }
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

function markActive(header: HTMLElement): void {
  const route = window.location.hash || "#/";
  header.querySelectorAll("a.nav").forEach((a) => {
    const href = (a as HTMLAnchorElement).getAttribute("href") || "";
    a.classList.toggle("on", href !== "#/" && route.startsWith(href));
  });
}

function headerEl(): HTMLElement {
  const nav = document.createElement("nav");
  nav.className = "site wrap";
  nav.innerHTML = `
    <a class="brand" href="#/">${logoMark()}<span class="mark">${esc(BRAND)}</span></a>
    <a class="nav" href="#/generate">Generate</a>
    <a class="nav" href="#/faq">FAQ</a>
    <a class="nav hide-sm" href="#/support">Support</a>
    <a class="nav hide-sm" href="#/privacy">Privacy</a>
    <a class="nav hide-sm" href="#/terms">Terms</a>
    <span class="status hide-sm">Open source</span>
    <a class="btn btn-primary hide-sm" href="${esc(DONATE_LINK)}">Donate</a>
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
    <div class="f-grid">
      <div class="f-block">
        <span class="f-brand">${logoMark()}<span>${esc(BRAND)}</span></span>
        <span class="f-honesty">Deterrence, not enforcement. Free, forever.</span>
      </div>
      <nav aria-label="Footer">
        <a href="#/generate">Generate</a>
        <a href="#/support">Support</a>
        <a href="#/faq">FAQ</a>
        <a href="${esc(GITHUB_URL)}" target="_blank" rel="noopener">GitHub</a>
        <a href="#/privacy">Privacy</a>
        <a href="#/terms">Terms</a>
      </nav>
    </div>
    <div class="f-serial">Repo Shield 0.1.0 &nbsp;·&nbsp; Free forever &nbsp;·&nbsp; No-AI-training source license</div>
  `;
  foot.appendChild(wrap);
  return foot;
}

function supportEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap block prose";
  el.innerHTML = `
    <div class="page-head">
      <h1>Keep Repo Shield <span class="stamp">open</span></h1>
      <div class="serial">RS-SUPP-1 &nbsp;·&nbsp; EN &nbsp;·&nbsp; Free forever</div>
    </div>
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
    <div class="row">
      <span class="fname">${esc(m.file)}</span>
      <span class="frole">${esc(m.role)}</span>
      <span class="chip">In pack</span>
    </div>
  `).join("");
  const steps = HOW_IT_WORKS.map(
    ([t, d], i) => `<div class="step rv" style="--i:${i}"><span class="n">0${i + 1}</span><div><h3>${esc(t)}</h3><p>${esc(d)}</p></div></div>`,
  ).join("");
  el.innerHTML = `
    <div class="hero">
      <div class="wrap hero-inner">
        <div>
          <span class="hero-kicker">Free and open source for every maintainer</span>
          <h1>Protect <span class="stamp">every public repo</span> from AI scraping.</h1>
          <p class="lede">${esc(SUB)}</p>
          <div class="hero-cta">
            <a class="btn btn-lg btn-primary" href="#/generate"><svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h8M8 4l4 4-4 4"/></svg>Generate your pack</a>
            <a class="btn btn-lg btn-ghost" href="${esc(GITHUB_URL)}" target="_blank" rel="noopener">Open source on GitHub</a>
          </div>
          <div class="plate-rule">
            <span class="ms">${esc(AUDIENCE)}</span>
            <span class="spec">LICENSE + NOTICE + AI policy&nbsp;&nbsp;·&nbsp;&nbsp;monitoring in your own CI&nbsp;&nbsp;·&nbsp;&nbsp;MIT · ISC · Apache-2.0 · GPL-3.0 · Unlicense</span>
          </div>
        </div>
        <div class="hero-sticker">
          <div class="patch">
            <img src="images/logo.png" alt="" width="340" height="340" />
            <div class="patch-cap"><span>RS-01 &nbsp;·&nbsp; EN</span><span>07 FILES &nbsp;·&nbsp; FREE</span></div>
          </div>
          <span class="tag">Open source</span>
        </div>
      </div>
      <div class="wrap hero-rail">
        <div class="hero-ticker"><span class="stripe hazard"></span>Free and open source for every maintainer</div>
      </div>
    </div>

    <div class="wrap block split hairline-top rv">
      <div class="intro">
        <div class="sechead"><span class="secnum">01</span><h2>Your public code is <span class="stamp">already being trained on.</span></h2></div>
        <p class="lede-dark">Most maintainers never get the chance to say no. Not because they wouldn't, but because saying it across dozens of repos is manual work nobody ships.</p>
      </div>
      <div>${pains}</div>
    </div>

    <div class="wrap block rv">
      <div class="sechead"><span class="secnum">02</span><h2>What's <span class="stamp">in your protection pack</span></h2></div>
      <p class="lede-dark">Four files stake the claim on every repo. The rest protects them all at once and keeps watch every week.</p>
      <div class="paper">
        <div class="paper-head"><span style="display:inline-flex;align-items:center;gap:10px"><span class="pdot"></span>Package manifest &nbsp;·&nbsp; signed files</span><span class="hide-sm">07 FILES</span></div>
        ${manifest}
        <div class="foot"><span>License + notice + AI policy</span><span class="hide-sm">Monitoring in your own CI</span></div>
      </div>
    </div>

    <div class="wrap block hairline-top rv">
      <div class="sechead"><span class="secnum">03</span><h2>From zero to protected <span class="stamp">in minutes</span></h2></div>
      <div class="steps">${steps}</div>
    </div>

    <div class="wrap block rv">
      <div class="sechead"><span class="secnum">04</span><h2>What Repo Shield does, and <span class="stamp">what it can't</span></h2></div>
      <div class="candid">
        <div class="candid-grid">
          <div class="candid-col does">
            <h3>Does</h3>
            <ul>${DOES.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
            <div class="candid-row does"><span class="c">Stated on every repo you own</span></div>
          </div>
          <div class="candid-col doesnt">
            <h3>Doesn&rsquo;t</h3>
            <ul>${DOESNT.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
            <div class="candid-row"><span class="c">Detection is heuristic by design</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="wrap block hairline-top rv">
      <div class="support-band">
        <div>
          <h2>Free forever. <span class="stamp">Built for maintainers.</span></h2>
          <p class="lede-dark">Repo Shield is open source, with a custom license that keeps AI training off this code. If it saves you a headache, chip in.</p>
        </div>
        <div class="support-actions">
          <a class="btn btn-lg btn-lime-line" href="${esc(DONATE_LINK)}">Donate</a>
          <a class="btn btn-lg btn-lime-line" href="${esc(GITHUB_URL)}" target="_blank" rel="noopener">Star on GitHub</a>
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
    (f, i) => `
      <details class="faq">
        <summary><span class="qidx">Q-0${i + 1}</span>${esc(f.q)}</summary>
        <div class="answer"><p>${esc(f.a)}</p></div>
      </details>
    `,
  ).join("");
  el.innerHTML = `
    <h2 style="margin-bottom:26px">Questions, answered <span class="stamp">straight</span></h2>
    <div>${items}</div>
  `;
  return el;
}

function proseEl(title: string, sections: Array<[string, string]>, code: string): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap block prose";
  el.innerHTML = `
    <div class="page-head">
      <h1>${esc(title)}</h1>
      <div class="serial">RS-${code} &nbsp;·&nbsp; EN &nbsp;·&nbsp; Effective as published</div>
    </div>
    ${sections
      .map(([h, p]) => `<h2>${esc(h)}</h2><p>${esc(p)}</p>`)
      .join("")}
  `;
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

const INSTALL_URL = `https://github.com/apps/${GITHUB_APP_SLUG}/installations/new`;

function generateEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap block";
  el.innerHTML = `
    <h1 style="font-size:clamp(2rem,4.2vw,2.8rem);margin-bottom:12px">Run <span class="stamp">Repo Shield</span></h1>
    <p class="lede-dark">Repo Shield is a terminal tool: sign in with GitHub, choose which repos to protect, and it opens one pull request per repo with your license, AI-training notice, and monitoring workflow. The site is fully static — your code only ever flows from your terminal to GitHub.</p>
    <div class="tool-grid">
      <div class="formcard" id="g-left">
        <h2 style="font-size:1.4rem;font-weight:800;margin:0 0 6px">Run from <span class="stamp">your terminal</span></h2>
        <p class="muted" style="margin:0 0 18px;font-size:13.5px">Three commands, no password. GitHub shows you a code to approve (device flow); Repo Shield never stores your password anywhere.</p>
        <div class="cmdlist" id="g-cmds"></div>
        <div class="installbar"><span>Install the <strong>Repo Shield</strong> GitHub App on the repos you want to protect — yours, your org's, or all of them. Any GitHub user can install it; it only opens pull requests for review.</span><a href="${INSTALL_URL}" target="_blank" rel="noopener">Install app</a></div>
        <details class="manual">
          <summary>Manual mode: build the pack without GitHub</summary>
          <label class="field">GitHub user or org (owner)<span class="field-hint">Used to sign the NOTICE and AI policy.</span></label>
          <input id="m-owner" placeholder="octocat" autocomplete="off" spellcheck="false" />
          <label class="field">License<span class="field-hint">MIT is the most common, safest default for public code.</span></label>
          <select id="m-license">${LICENSE_OPTIONS.map((l) => `<option value="${l.id}">${esc(l.name)}</option>`).join("")}</select>
          <label class="field">Copyright holder<span class="field-hint">You or your legal entity. Appears in LICENSE and NOTICE.</span></label>
          <input id="m-holder" placeholder="Jane Doe" />
          <label class="field">Year<span class="field-hint">The year of first publication.</span></label>
          <input id="m-year" type="number" value="${new Date().getFullYear()}" />
          <div style="margin-top:18px">
            <button id="m-build" class="btn btn-lg btn-primary" type="button" style="width:100%">Build the pack</button>
          </div>
        </details>
      </div>
      <div class="tool-output" id="g-output">
        <div class="preview" id="g-preview">
          <h3>What you'll get</h3>
          <div class="plist-wrap"></div>
        </div>
      </div>
    </div>
  `;
  el.querySelector("#g-preview .plist-wrap")!.innerHTML = previewList();
  const cmds = [
    { n: "1", label: "Install", cmd: "npm i -g @reposell/repo-shield" },
    { n: "2", label: "Sign in", cmd: "rs login" },
    { n: "3", label: "Protect a repo", cmd: "rs protect owner/repo" },
  ];
  const list = el.querySelector("#g-cmds")! as HTMLElement;
  for (const c of cmds) {
    const row = document.createElement("div");
    row.className = "cmdrow";
    const top = document.createElement("div");
    top.className = "cmdtop";
    top.innerHTML = `<span class="cmdnum">${c.n}</span><span class="cmdlbl">${esc(c.label)}</span>`;
    const line = document.createElement("div");
    line.className = "cmdline";
    const code = document.createElement("code");
    code.textContent = "$ " + c.cmd;
    code.addEventListener("click", () => {
      void copyText(c.cmd);
    });
    line.appendChild(code);
    line.appendChild(copyButton(() => c.cmd, "Copy"));
    row.appendChild(top);
    row.appendChild(line);
    list.appendChild(row);
  }
  const owned = document.createElement("p");
  owned.className = "cmdhint";
  owned.innerHTML = `Prefer every repo at once? Run <code>rs protect --all</code> to open a PR on every repository the app is installed on. Nothing touches your default branch until you review and merge the PR.`;
  list.appendChild(owned);
  (el.querySelector("#m-build") as HTMLButtonElement).onclick = () => renderTool(el.querySelector("#g-left") as HTMLElement, "m");
  return el;
}

function renderTool(rootEl: HTMLElement, p: string): void {
  const owner = (rootEl.querySelector(`#${p}-owner`) as HTMLInputElement).value.trim();
  if (!owner) {
    alert("Enter your GitHub user or org name.");
    return;
  }
  const holder = (rootEl.querySelector(`#${p}-holder`) as HTMLInputElement).value.trim() || owner;
  const year = Number((rootEl.querySelector(`#${p}-year`) as HTMLInputElement).value) || new Date().getFullYear();
  const license = (rootEl.querySelector(`#${p}-license`) as HTMLSelectElement).value as License;
  const out = document.getElementById("g-output") as HTMLElement;

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
      <h2 style="font-size:1.5rem;font-weight:800;margin:0 0 4px">${esc(owner)} <span class="stamp">protection pack</span></h2>
      <p class="muted" style="margin:0 0 8px;font-family:var(--font-mono);font-size:11px;letter-spacing:.1em;text-transform:uppercase">Open source. Everything included, for every repo you own.</p>
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
  const header = headerEl();
  el.appendChild(header);
  markActive(header);
  const main = document.createElement("main");
  const route = window.location.hash || "#/";
  if (route.startsWith("#/privacy")) main.appendChild(proseEl("Privacy Policy", PRIVACY_SECTIONS, "PRIV-1"));
  else if (route.startsWith("#/terms")) main.appendChild(proseEl("Terms of Service", TERMS_SECTIONS, "TERMS-1"));
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