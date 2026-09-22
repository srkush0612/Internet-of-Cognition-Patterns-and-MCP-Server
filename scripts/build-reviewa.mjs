/**
 * Static export for Reviewa.
 *
 * Two things cannot come along:
 *
 *   app/api                     a static host serves no route handlers, so the
 *                               advisor chat is UI-only here and Studio's
 *                               scenario store is absent.
 *   studio/[scenarioId]         a dynamic route with no fixed set of ids, which
 *                               `output: export` refuses outright. Scenario ids
 *                               are made at runtime, so there is nothing to
 *                               enumerate. /studio itself is exported and works:
 *                               it falls back to holding the scenario in the
 *                               browser when the store is not reachable.
 *
 * Both are moved aside and put back in a finally, so a failed build leaves the
 * tree as it found it.
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const EXCLUDED = [
  {
    label: "app/api",
    from: path.join(root, "app", "api"),
    to: path.join(root, ".reviewa-api-backup"),
  },
  {
    label: "app/(site)/studio/[scenarioId]",
    from: path.join(root, "app", "(site)", "studio", "[scenarioId]"),
    to: path.join(root, ".reviewa-studio-backup"),
  },
];

function moveAside() {
  for (const { label, from, to } of EXCLUDED) {
    if (!fs.existsSync(from)) continue;
    if (fs.existsSync(to)) fs.rmSync(to, { recursive: true, force: true });
    fs.renameSync(from, to);
    console.log(`Moved ${label} aside for static export`);
  }
}

function restore() {
  for (const { label, from, to } of EXCLUDED) {
    if (!fs.existsSync(to)) continue;
    if (fs.existsSync(from)) fs.rmSync(from, { recursive: true, force: true });
    fs.renameSync(to, from);
    console.log(`Restored ${label}`);
  }
}

moveAside();

try {
  execSync("npx next build", {
    cwd: root,
    stdio: "inherit",
    env: { ...process.env, REVIEWA_BUILD: "1" },
  });
  execSync("node scripts/fix-static-export-paths.mjs", {
    cwd: root,
    stdio: "inherit",
  });
} finally {
  restore();
}

console.log("\n✓ Reviewa static export ready in out/");
