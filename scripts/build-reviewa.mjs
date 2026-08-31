/**
 * Static export for Reviewa (no API routes — advisor chat is UI-only on Reviewa).
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const apiDir = path.join(root, "app", "api");
const apiBackup = path.join(root, ".reviewa-api-backup");

function moveApiAside() {
  if (fs.existsSync(apiDir)) {
    if (fs.existsSync(apiBackup)) {
      fs.rmSync(apiBackup, { recursive: true, force: true });
    }
    fs.renameSync(apiDir, apiBackup);
    console.log("Moved app/api aside for static export");
  }
}

function restoreApi() {
  if (fs.existsSync(apiBackup)) {
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true, force: true });
    }
    fs.renameSync(apiBackup, apiDir);
    console.log("Restored app/api");
  }
}

moveApiAside();

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
  restoreApi();
}

console.log("\n✓ Reviewa static export ready in out/");
