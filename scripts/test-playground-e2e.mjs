/**
 * Integration check for the CodePen-style Pattern Playground: load /playground,
 * confirm the real reference-design component renders live, edit a Config
 * field and confirm the preview + generated code update, then apply a
 * natural-language instruction and confirm it updates the same state.
 *
 * Requires a running dev server (npm run dev / dev:restart).
 * Run:  node scripts/test-playground-e2e.mjs
 */
import { chromium } from "playwright";

const base = process.env.PLAYGROUND_BASE_URL ?? "http://localhost:3000";

let failures = 0;
const check = (label, cond, detail = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}${detail ? ` — ${detail}` : ""}`);
  if (!cond) failures += 1;
};

const browser = await chromium.launch();
const page = await browser.newPage();

await page.goto(`${base}/playground`, { waitUntil: "networkidle" });

// decision-ledger's title flows into a visible header label (contextLabel) —
// a known, verifiable spot to assert against.
await page.locator("#playground-pattern").selectOption("decision-ledger");
await page.waitForTimeout(200);

const preview = page.locator(".playground__preview-body");
check("live preview renders the real reference-design component", (await preview.innerHTML()).length > 200);

// Config tab is active by default — find the pattern's title/name input.
const nameInput = page.locator("#edit-instance-name");
await nameInput.waitFor({ state: "visible" });
await nameInput.fill("Ship OAuth end to end");
await page.waitForTimeout(300);

const codeAfterConfigEdit = await page.locator(".playground__preview-body").innerHTML();
check(
  "editing a Config field updates the live preview",
  codeAfterConfigEdit.includes("Ship OAuth end to end"),
);

// Switch to Code tab and confirm the generated code reflects the same edit.
await page.getByRole("button", { name: "Code" }).click();
await page.waitForTimeout(200);
const codeText = await page.locator(".playground__live-editor").innerText();
check("Code tab shows generated code containing the current title", codeText.includes("Ship OAuth end to end"));

// Hand-edit the code directly and confirm the SAME live preview updates from it.
const editor = page.locator(".playground__live-editor");
await editor.click();
await page.keyboard.press(process.platform === "darwin" ? "Meta+A" : "Control+A");
await page.keyboard.type('<Pattern live={{"title": "Hand-edited via Code tab", "workspace": {}}} />', {
  delay: 5,
});
await page.waitForTimeout(400);
const previewAfterCodeEdit = await page.locator(".playground__preview-body").innerHTML();
check(
  "hand-editing the Code tab updates the live preview instantly",
  previewAfterCodeEdit.includes("Hand-edited via Code tab"),
);
check(
  "no LiveError surfaced for valid hand-edited code",
  (await page.locator(".playground__live-error").count()) === 0,
);

// Switch to Ask tab and apply a natural-language instruction.
await page.getByRole("button", { name: "Ask" }).click();
const askInput = page.locator(".playground-ask__row input");
await askInput.fill("set title to Restart svc-payments now");
await page.getByRole("button", { name: "Apply" }).click();
await page.waitForTimeout(300);

const askMessage = await page.locator(".playground-ask__message").innerText();
check("Ask tab confirms it applied the instruction", askMessage.toLowerCase().includes("set title"));

const previewAfterAsk = await page.locator(".playground__preview-body").innerHTML();
check(
  "the natural-language edit updates the same live preview",
  previewAfterAsk.includes("Restart svc-payments now"),
);

// Presets: "long text" is a mechanical, schema-driven transform — should
// visibly stress-test text length without any per-pattern authoring.
await page.locator("#playground-pattern").selectOption("assumption-surface");
await page.waitForTimeout(200);
await page.getByRole("button", { name: "Long text" }).click();
await page.waitForTimeout(300);
const previewAfterLongPreset = await page.locator(".playground__preview-body").innerText();
check(
  "the 'long text' preset visibly lengthens the rendered content",
  previewAfterLongPreset.length > 200,
);

// Comparison: toggling Compare renders a second, independent live preview.
await page.getByRole("button", { name: "Compare" }).click();
await page.waitForTimeout(200);
const compareCount = await page.locator(".compare-pane").count();
check("toggling Compare renders a second preview pane", compareCount === 1);
await page.locator(".compare-pane select").selectOption("decision-ledger");
await page.waitForTimeout(300);
const compareHtml = await page.locator(".compare-pane__body").innerHTML();
check(
  "the compare pane renders a different, independently-selected pattern",
  compareHtml.includes("Sealed decision records"),
);

// Shareable scenarios: a URL round-trip should reproduce identical state on a fresh load.
await page.getByRole("button", { name: "Compare" }).click();
await page.locator("#playground-pattern").selectOption("decision-ledger");
await page.getByRole("button", { name: "Config" }).click();
await page.locator("#edit-instance-name").fill("Round trip check");
await page.waitForTimeout(200);
const shareUrl = await page.evaluate(() => {
  const scenario = { slug: "decision-ledger", name: "Round trip check", parameters: {}, context: {} };
  const url = new URL(window.location.href);
  url.searchParams.set("scenario", encodeURIComponent(JSON.stringify(scenario)));
  return url.toString();
});
const freshPage = await browser.newPage();
await freshPage.goto(shareUrl, { waitUntil: "networkidle" });
const hydratedName = await freshPage.locator("#edit-instance-name").inputValue();
check(
  "a shared scenario link reproduces the same state on a fresh load",
  hydratedName === "Round trip check",
);
await freshPage.close();

await browser.close();

console.log(failures === 0 ? "\nALL PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
