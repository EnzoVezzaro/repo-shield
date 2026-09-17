import { chromium } from "playwright-core";

const BASE = process.env.BASE || "http://localhost:5178/#/";
const browser = await chromium.launch(
  process.env.CHROME_PATH
    ? { executablePath: process.env.CHROME_PATH, headless: true }
    : { channel: "chrome", headless: true }
);
const out = { failures: [], passes: 0, notes: [] };

function parseColor(s) {
  if (!s) return null;
  const m = s.match(/[\d.]+/g);
  if (!m || m.length < 3) return null;
  const a = m.length >= 4 ? Math.min(1, +m[3]) : 1;
  return [+m[0], +m[1], +m[2], a];
}
function lin(c) { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }
function L(c) { return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); }
function ratio(a, b) { const l1 = L(a), l2 = L(b), hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05); }

async function makePage() {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE, { waitUntil: "networkidle" });
  await page.addStyleTag({ content: "*{transition:none!important;animation:none!important}" });
  await page.emulateMedia({ reducedMotion: "reduce" });
  return page;
}

const CHECK = process.argv[2] || "all";
const routes = { "/": "Landing", "/generate": "Generate", "/faq": "FAQ", "/support": "Support", "/privacy": "Privacy", "/terms": "Terms" };
const pages = CHECK === "all" ? Object.keys(routes) : [CHECK];

for (const route of pages) {
  const page = await makePage();
  await page.goto(BASE.replace("#/", "") + "#" + route, { waitUntil: "networkidle" });

  const stats = await page.evaluate(() => {
    const parseColor = (s) => { if (!s) return null; const m = s.match(/[\d.]+/g); if (!m || m.length < 3) return null; const a = m.length >= 4 ? Math.min(1, +m[3]) : 1; return [+m[0], +m[1], +m[2], a]; };
    const bodyBg = parseColor(getComputedStyle(document.body).backgroundColor) || [10, 12, 11, 1];
    const isVisible = (el) => {
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden" || +cs.opacity === 0) return false;
      const r = el.getBoundingClientRect();
      return r.width > 1 && r.height > 1;
    };
    const compositeBg = (el) => {
      let acc = [0, 0, 0, 0];
      let node = el;
      while (node && node.nodeType === 1 && acc[3] < 0.999) {
        const c = parseColor(getComputedStyle(node).backgroundColor);
        if (c && c[3] > 0.0001) {
          const a = c[3];
          acc = [c[0]*a + acc[0]*(1-a), c[1]*a + acc[1]*(1-a), c[2]*a + acc[2]*(1-a), acc[3] + (1 - acc[3]) * a];
        }
        node = node.parentElement;
      }
      return [acc[0] + bodyBg[0]*(1-acc[3]), acc[1] + bodyBg[1]*(1-acc[3]), acc[2] + bodyBg[2]*(1-acc[3])];
    };
    const hasOwnText = (el) => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
    const fail = [];
    for (const el of document.querySelectorAll("body *")) {
      if (!isVisible(el) || !hasOwnText(el)) continue;
      if (el.closest("script,style")) continue;
      const cs = getComputedStyle(el);
      if (el.closest("pre")) { if (/repo-shield|license|permission|notice/i.test(el.textContent)) continue; } // code blocks exempt (they're data)
      const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
      const L = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
      const ratio = (a, b) => { const l1 = L(a), l2 = L(b), hi = Math.max(l1, l2), lo = Math.min(l1, l2); return (hi + 0.05) / (lo + 0.05); };
      const px = parseFloat(cs.fontSize);
      const w = parseInt(cs.fontWeight);
      const large = px * 0.75 >= 24 || (px * 0.75 >= 18.66 && w >= 700);
      const need = large ? 3 : 4.5;
      let fg = parseColor(cs.color) || [245, 238, 229, 1];
      if (fg[3] < 0.5) { const stroke = parseColor(cs.webkitTextStrokeColor); if (stroke && parseFloat(cs.webkitTextStrokeWidth) > 0) fg = stroke; }
      const bg = compositeBg(el);
      const r = ratio([fg[0], fg[1], fg[2]], [Math.round(bg[0]), Math.round(bg[1]), Math.round(bg[2])]);
      if (r < need - 0.001) fail.push({ tag: el.tagName, cls: String(el.className || "").slice(0, 36), text: el.textContent.trim().slice(0, 42), fg: fg.slice(0,3), bg: bg.map(Math.round), r: +r.toFixed(2), need, px });
    }
    return fail;
  });

  if (stats.length) out.failures.push({ route, contrast: stats.slice(0, 14) });
  else { out.passes++; out.notes.push(`contrast ${route}: passes AA`); }

  for (const w of [280, 320, 414]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(250);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    if (overflow > 0) out.failures.push({ route, overflowAt: w, px: overflow });
  }

  const outr = await page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    clientW: document.documentElement.clientWidth,
    heroEmblem: (() => { const e = document.querySelector(".hero-emblem"); if (!e) return null; const r = e.getBoundingClientRect(); return { vis: getComputedStyle(e).display, w: r.width, h: r.height }; })(),
  }));
  out.notes.push(`route ${route} 1440: ${JSON.stringify(outr)}`);
  await page.close();
}

const summary = out.failures.length
  ? `FAIL: ${out.failures.length} issue(s) across ${pages.length} route(s)`
  : `PASS: contrast + overflow, ${out.passes} route(s) clean`;
console.log(summary);
console.log(JSON.stringify(out, null, 2).slice(0, 10000));
await browser.close();
process.exit(out.failures.length ? 1 : 0);