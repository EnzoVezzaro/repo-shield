import { chromium } from "playwright-core";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "review");
const base = process.env.BASE || "http://localhost:5178/repo-shield/";

const shots = [
  ["landing-full.png", `${base}`],
  ["generate-full.png", `${base}#/generate`],
  ["desktop-full.png", `${base}`],
];

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ deviceScaleFactor: 1, viewport: { width: 1366, height: 900 } });
await page.addStyleTag({ content: "*,*::before,*::after{transition:none!important;animation:none!important}" });
for (const [name, url] of shots) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
  const full = name !== "desktop-full.png";
  await page.screenshot({ path: path.join(root, name), fullPage: full });
  console.log("captured", name);
}
await browser.close();