import { chromium } from "playwright-core";

const BASE = process.env.BASE || "http://localhost:5178/repo-shield/";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
await page.goto(`${BASE}#/`, { waitUntil: "networkidle" });

const checks = await page.evaluate(() => {
  const $ = (s) => document.querySelector(s);
  const q = (s) => document.querySelectorAll(s).length;
  const box = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const img = $(".hero-sticker .patch img");
  const logoOk = !!img && img.complete && img.naturalWidth > 0 && img.getBoundingClientRect().height > 100;
  const hazard = $(".hazard, header.site, footer.site");
  const bg = getComputedStyle($("body")).backgroundColor;
  const paper = $(".paper");
  const paperBg = paper ? getComputedStyle(paper).backgroundColor : null;
  const does = $(".candid-col.does");
  const doesnt = $(".candid-col.doesnt");
  const doesBg = does ? getComputedStyle(does).backgroundColor : null;
  const doesntBg = doesnt ? getComputedStyle(doesnt).backgroundColor : null;
  const h1w = $(".hero h1") ? getComputedStyle($(".hero h1")).fontSize : null;
  const status = $("nav.site .status");
  const navItems = q("nav.site .nav");
  const docW = document.documentElement.scrollWidth;
  const vw = document.documentElement.clientWidth;
  const overflows = docW > vw ? docW - vw : 0;
  const allBtns = q("a.btn");
  const btnShadow = $(".btn-primary") ? getComputedStyle($(".btn-primary")).boxShadow : null;
  return {
    bg, h1w, logoOk, logoBox: img && box(img), statusText: status ? status.textContent.trim() : null,
    paperBg, doesBg, doesntBg, navItems, allBtns, btnShadow, overflows,
    heroH1Box: box($(".hero h1")), stickerBox: box($(".hero-sticker")),
    bodyH: box($("body")).h, hazardsOnPage: q(".hazard"),
  };
});
console.log(JSON.stringify(checks, null, 2));
await browser.close();