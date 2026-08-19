/**
 * Reviewa and other static hosts often fail to serve Next.js chunks whose paths
 * contain literal [slug] or (themed) segments. Rename those folders and patch
 * references after `next build` with output: "export".
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "out");

const REPLACEMENTS = [
  ["%5Bslug%5D", "_slug_"],
  ["[slug]", "_slug_"],
  ["%28themed%29", "_themed_"],
  ["(themed)", "_themed_"],
];

function renameDirIfExists(from, to) {
  if (!fs.existsSync(from)) return;
  if (fs.existsSync(to)) {
    fs.rmSync(to, { recursive: true, force: true });
  }
  fs.renameSync(from, to);
  console.log(`renamed ${path.relative(outDir, from)} → ${path.relative(outDir, to)}`);
}

function patchFileContents(filePath) {
  const original = fs.readFileSync(filePath, "utf8");
  let next = original;
  for (const [from, to] of REPLACEMENTS) {
    next = next.split(from).join(to);
  }
  if (next !== original) {
    fs.writeFileSync(filePath, next);
  }
}

function walkFiles(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, callback);
    } else {
      callback(fullPath);
    }
  }
}

function isTextAsset(filePath) {
  return /\.(html?|js|json|css|txt|map)$/i.test(filePath);
}

if (!fs.existsSync(outDir)) {
  console.error("out/ not found. Run next build first.");
  process.exit(1);
}

// Rename dynamic-route chunk folders (parent routes before children).
renameDirIfExists(
  path.join(outDir, "_next/static/chunks/app/(themed)"),
  path.join(outDir, "_next/static/chunks/app/_themed_"),
);
renameDirIfExists(
  path.join(outDir, "_next/static/chunks/app/patterns/[slug]"),
  path.join(outDir, "_next/static/chunks/app/patterns/_slug_"),
);
renameDirIfExists(
  path.join(
    outDir,
    "_next/static/chunks/app/_themed_/design-system/patterns/[slug]",
  ),
  path.join(
    outDir,
    "_next/static/chunks/app/_themed_/design-system/patterns/_slug_",
  ),
);

let patched = 0;
walkFiles(outDir, (filePath) => {
  if (!isTextAsset(filePath)) return;
  const before = fs.readFileSync(filePath, "utf8");
  patchFileContents(filePath);
  const after = fs.readFileSync(filePath, "utf8");
  if (before !== after) patched += 1;
});

console.log(`patched ${patched} files in out/`);
