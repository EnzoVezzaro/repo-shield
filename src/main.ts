import {
  BRAND,
  FAQS,
  HOW_IT_WORKS,
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

const STYLE = `
  :root { --ink:#111; --muted:#5b6472; --line:#e3e6eb; --accent:#0b5fff; --accent-ink:#fff; --bg:#fff; --chip:#f4f6f9; }
  * { box-sizing: border-box; }
  body { margin:0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; color:var(--ink); background:var(--bg); line-height:1.55; }
  header.site { position:sticky; top:0; z-index:5; background:rgba(255,255,255,.92); backdrop-filter:blur(6px); border-bottom:1px solid var(--line); }
  .wrap { max-width:1040px; margin:0 auto; padding:0 20px; }
  nav.site { display:flex; align-items:center; gap:18px; height:56px; }
  nav.site .brand { font-weight:800; letter-spacing:-.02em; color:var(--ink); text-decoration:none; margin-right:auto; }
  nav.site a.nav { color:var(--muted); text-decoration:none; font-size:14px; }
  nav.site a.nav:hover { color:var(--ink); }
  main { min-height:60vh; }
  .hero { padding:64px 0 40px; max-width:760px; }
  .hero h1 { font-size:clamp(34px, 6vw, 52px); line-height:1.08; letter-spacing:-.03em; margin:0 0 16px; }
  .hero p.sub { color:var(--muted); font-size:18px; max-width:600px; }
  .cta-row { display:flex; gap:12px; flex-wrap:wrap; margin-top:28px; }
  .btn { display:inline-flex; align-items:center; gap:8px; padding:11px 18px; border-radius:10px; border:1px solid var(--line); background:var(--bg); color:var(--ink); font:inherit; font-weight:600; cursor:pointer; text-decoration:none; }
  .btn:hover { border-color:#cfd5dd; }
  .btn-primary { background:var(--accent); border-color:var(--accent); color:var(--accent-ink); }
  .btn-primary:hover { background:#083fcc; border-color:#083fcc; }
  .btn-ghost { padding:6px 10px; font-weight:500; font-size:13px; }
  section { padding:28px 0; }
  h2 { font-size:26px; letter-spacing:-.02em; margin:0 0 8px; }
  .muted { color:var(--muted); }
  .grid { display:grid; gap:16px; }
  .grid-3 { grid-template-columns:repeat(auto-fit,minmax(240px,1fr)); }
  .card { border:1px solid var(--line); border-radius:14px; padding:20px; background:var(--bg); }
  .card.featured { border:2px solid var(--accent); }
  .card h3 { margin:0 0 6px; }
  .card ol { margin:8px 0 0; padding-left:20px; }
  .price { font-size:30px; font-weight:800; letter-spacing:-.03em; }
  .price .per { font-size:14px; font-weight:500; color:var(--muted); }
  .card .bullet { color:var(--muted); font-size:14px; margin:8px 0 14px; }
  label.field { display:block; font-size:13px; font-weight:600; color:var(--muted); margin:12px 0 4px; }
  input, select { width:100%; padding:10px 12px; border:1px solid var(--line); border-radius:10px; font:inherit; background:var(--bg); }
  input:focus, select:focus { outline:2px solid var(--accent); outline-offset:-1px; }
  pre.code { background:#0d1117; color:#e6edf3; padding:14px; border-radius:10px; overflow:auto; font-size:13px; line-height:1.5; max-height:420px; }
  .fileblock { margin:16px 0; }
  .filehead { display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap:wrap; }
  .filehead .fname { font-weight:700; font-size:14px; }
  .chip { background:var(--chip); border:1px solid var(--line); border-radius:999px; padding:2px 10px; font-size:12px; color:var(--muted); }
  .warn { border:1px solid #f0c36d; background:#fdf3dd; border-radius:10px; padding:12px 14px; font-size:14px; margin:12px 0; }
  .faq { border-top:1px solid var(--line); padding:16px 0; }
  .faq h3 { margin:0 0 4px; font-size:16px; }
  .faq p { margin:0; color:var(--muted); }
  footer.site { border-top:1px solid var(--line); padding:28px 0 48px; margin-top:40px; color:var(--muted); font-size:14px; }
  footer.site a { color:var(--muted); text-decoration:none; margin-right:16px; }
  footer.site a:hover { color:var(--ink); }
  .prose h1 { font-size:30px; letter-spacing:-.02em; }
  .prose h2 { font-size:19px; margin-top:26px; }
  .prose p { color:var(--muted); max-width:720px; }
  @media (max-width:640px){ nav.site a.nav.hide-sm { display:none; } }
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
    <a class="brand" href="#/">${BRAND}</a>
    <a class="nav" href="#/generate">Generate</a>
    <a class="nav" href="#/pricing">Pricing</a>
    <a class="nav hide-sm" href="#/faq">FAQ</a>
    <a class="nav hide-sm" href="#/privacy">Privacy</a>
    <a class="nav hide-sm" href="#/terms">Terms</a>
    <a class="btn btn-primary" href="${tierHref(PRICING_TIERS[1] as PricingTier)}">Get Pro</a>
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
    <strong>${BRAND}</strong> — deterrence, not enforcement.
    <div style="margin-top:10px">
      <a href="#/privacy">Privacy</a>
      <a href="#/terms">Terms</a>
      <a href="#/faq">FAQ</a>
      <a href="#/pricing">Pricing</a>
      <a href="#/generate">Generate</a>
    </div>
  `;
  foot.appendChild(wrap);
  return foot;
}

function landingEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap";
  const how = HOW_IT_WORKS.map(
    ([t, d], i) =>
      `<div class="card"><h3>${i + 1}. ${esc(t)}</h3><p class="bullet">${esc(d)}</p></div>`,
  ).join("");
  el.innerHTML = `
    <div class="hero">
      <h1>${esc(TAGLINE)}</h1>
      <p class="sub">${esc(SUB)}</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="#/generate">Generate your pack</a>
        <a class="btn" href="#/pricing">See pricing</a>
      </div>
    </div>
    <section>
      <h2>GitHub gives you a licensing page. ${BRAND} gives you protection.</h2>
      <p class="muted">A single script adds a license, an AI-training notice, and a machine-readable
      policy to every public repo you own — then a weekly workflow keeps them honest.</p>
      <div class="grid grid-3" style="margin-top:20px">${how}</div>
    </section>
  `;
  return el;
}

function pricingEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap";
  const cards = PRICING_TIERS.map(
    (t) => `
      <div class="card ${t.featured ? "featured" : ""}">
        <h3>${esc(t.name)}</h3>
        <div class="price">${esc(t.price)} <span class="per">${esc(t.period)}</span></div>
        <div class="bullet">${esc(t.bullet)}</div>
        <a class="btn ${t.featured ? "btn-primary" : ""}" href="${esc(tierHref(t))}">${esc(t.cta)}</a>
      </div>
    `,
  ).join("");
  el.innerHTML = `
    <section>
      <h2>Pricing</h2>
      <p class="muted">Start free on one repo. Upgrade when your fleet of repos is the problem.</p>
      <div class="grid grid-3" style="margin-top:20px">${cards}</div>
      <p class="muted" style="margin-top:12px">Payments handled by Stripe. Cancel anytime.
      ${PRO_LINK ? "" : "Payment links are wired in via environment variables before launch."}</p>
    </section>
  `;
  return el;
}

function faqEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap";
  const items = FAQS.map(
    (f) => `<div class="faq"><h3>${esc(f.q)}</h3><p>${esc(f.a)}</p></div>`,
  ).join("");
  el.innerHTML = `<section><h2>FAQ</h2>${items}</section>`;
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

function generateEl(): HTMLElement {
  const el = document.createElement("section");
  el.className = "wrap";
  el.innerHTML = `
    <div class="hero" style="padding-top:40px">
      <h1>Build your protection pack</h1>
      <p class="sub">Free: protect one repo. Pro: protect every public repo you own and add weekly monitoring.</p>
    </div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:28px">
      <div>
        <label class="field">GitHub user or org (owner)</label>
        <input id="g-owner" placeholder="octocat" autocomplete="off" spellcheck="false" />
        <label class="field">License</label>
        <select id="g-license">${LICENSE_OPTIONS.map((l) => `<option value="${l.id}">${esc(l.name)}</option>`).join("")}</select>
        <label class="field">Copyright holder</label>
        <input id="g-holder" placeholder="Jane Doe" />
        <label class="field">Year</label>
        <input id="g-year" type="number" value="${defaultYear()}" />
        <label class="field">Plan</label>
        <select id="g-plan">
          <option value="free">Free — one repo</option>
          <option value="pro" selected>Pro — all repos + monitoring</option>
        </select>
        <div style="margin-top:18px">
          <button id="g-build" class="btn btn-primary" type="button">Build pack</button>
        </div>
      </div>
      <div id="g-output" style="min-width:0">
        <p class="muted">Fill the fields and hit <strong>Build pack</strong>. For a single repo, generate
        includes a second field for the repo name — for now, paste the files into any one of your repos.</p>
      </div>
    </div>
  `;
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

  const fileBlocks = Object.entries(files)
    .map(
      ([name, text]) => `
        <div class="fileblock">
          <div class="filehead">
            <span class="fname">${esc(name)}</span>
            <span class="chip">${esc(`${name === "LICENSE" ? "licenses the code" : name === "NOTICE" ? "stakes the AI-training claim" : "machine-readable policy"}`)}</span>
          </div>
          <pre class="code"></pre>
        </div>
      `,
    )
    .join("");

  out.innerHTML = `
    <h2>${esc(owner)} protection pack</h2>
    ${pack.missingFullText.map((m) => `<div class="warn">${esc(m)}</div>`).join("")}
    ${fileBlocks}
    <div class="fileblock">
      <div class="filehead"><span class="fname">Monitoring</span><span class="chip">Pro</span></div>
      <p class="muted" style="margin:0 0 8px">A weekly GitHub Actions run that verifies the files stay present
      and flags public copies of your signature marker. Runs in <em>your</em> repo — we never see your code.</p>
      <div class="filehead">
        <span class="fname">.github/workflows/repo-shield.yml</span>
      </div>
      <pre class="code"></pre>
      <div class="filehead"><span class="fname">scripts/shield-check.mjs</span></div>
      <pre class="code"></pre>
    </div>
    <div class="fileblock">
      <div class="filehead"><span class="fname">apply-all.sh</span><span class="chip">Pro</span></div>
      <p class="muted" style="margin:0 0 8px">One command protect-commits all your public repos and installs
      the monitoring workflow on each. Skips forks, only touches the five protected files.</p>
      <pre class="code"></pre>
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

  if (plan === "free") {
    const monitor = out.querySelectorAll(".fileblock")[3] as HTMLElement | undefined;
    if (monitor) {
      monitor.insertAdjacentHTML(
        "afterend",
        `<div class="warn">Free plan covers one repo unpacked by hand. Pro protects every public repo with
        the apply-all script + monitoring. <a href="${esc(tierHref(PRICING_TIERS[1] as PricingTier))}">Upgrade to
        Pro</a>.</div>`,
      );
    }
  }
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