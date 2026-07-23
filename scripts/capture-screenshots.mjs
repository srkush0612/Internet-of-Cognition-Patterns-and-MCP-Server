import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const base = "http://localhost:3000";
const outDir = path.resolve("screenshots");

const pages = [
  { name: "index", url: `${base}/` },
  { name: "grounded-shared-cognitive-state", url: `${base}/patterns/shared-cognitive-state` },
  { name: "unverified-background-work-ledger", url: `${base}/patterns/background-work-ledger` },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
});
const page = await context.newPage();

await mkdir(outDir, { recursive: true });

for (const item of pages) {
  await page.goto(item.url, { waitUntil: "networkidle" });
  await page.screenshot({
    path: path.join(outDir, `${item.name}.png`),
    fullPage: true,
  });
  console.log(`saved ${item.name}.png`);
}

await browser.close();
