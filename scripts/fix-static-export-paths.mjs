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
  ["%28site%29", "_site_"],
  ["(site)", "_site_"],
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
  path.join(outDir, "_next/static/chunks/app/(site)"),
  path.join(outDir, "_next/static/chunks/app/_site_"),
);
renameDirIfExists(
  path.join(outDir, "_next/static/chunks/app/_site_/patterns/[slug]"),
  path.join(outDir, "_next/static/chunks/app/_site_/patterns/_slug_"),
);
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

// Static hosts (Reviewa) often miss directory indexes — map /advisor/ → /advisor.html
const STATIC_ROUTES = ["advisor", "gallery", "setup", "design-system"];
const redirectLines = [
  "# Reviewa / static host fallbacks",
  ...STATIC_ROUTES.flatMap((route) => [
    `/${route}    /${route}.html    200`,
    `/${route}/   /${route}.html    200`,
  ]),
];

const patternsDir = path.join(outDir, "patterns");
if (fs.existsSync(patternsDir)) {
  for (const entry of fs.readdirSync(patternsDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/, "");
    redirectLines.push(
      `/patterns/${slug}    /patterns/${slug}.html    200`,
      `/patterns/${slug}/   /patterns/${slug}.html    200`,
    );
  }
}

fs.writeFileSync(path.join(outDir, "_redirects"), `${redirectLines.join("\n")}\n`);
console.log("wrote out/_redirects for static route fallbacks");

// Hosts without _redirects (Reviewa) need index.html inside route folders.
function mirrorHtmlAsIndex(relativePath) {
  const htmlPath = path.join(outDir, relativePath);
  if (!fs.existsSync(htmlPath)) return;
  const dir = path.join(outDir, relativePath.replace(/\.html$/, ""));
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(htmlPath, path.join(dir, "index.html"));
}

for (const route of STATIC_ROUTES) {
  mirrorHtmlAsIndex(`${route}.html`);
}

if (fs.existsSync(patternsDir)) {
  for (const entry of fs.readdirSync(patternsDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    mirrorHtmlAsIndex(path.join("patterns", entry.name));
  }
}

console.log("mirrored *.html routes as */index.html for directory-style URLs");

// Reviewa serves root index.html for unknown paths — redirect + patch links to *.html
const routeRedirectMap = Object.fromEntries(
  STATIC_ROUTES.map((route) => [`/${route}`, `/${route}.html`]),
);

if (fs.existsSync(patternsDir)) {
  for (const entry of fs.readdirSync(patternsDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/, "");
    routeRedirectMap[`/patterns/${slug}`] = `/patterns/${slug}.html`;
  }
}

const designPatternsDir = path.join(outDir, "design-system", "patterns");
if (fs.existsSync(designPatternsDir)) {
  for (const entry of fs.readdirSync(designPatternsDir, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".html")) continue;
    const slug = entry.name.replace(/\.html$/, "");
    routeRedirectMap[`/design-system/patterns/${slug}`] =
      `/design-system/patterns/${slug}.html`;
  }
}

function addHtmlExtensions(content) {
  let next = content;
  for (const route of STATIC_ROUTES) {
    next = next.replace(
      new RegExp(`(["'])/${route}(?!\\.html)(/?)(["'])`, "g"),
      `$1/${route}.html$3`,
    );
  }
  next = next.replace(
    /(["'])\/patterns\/([a-z0-9-]+)(?!\.html)(\/?)(["'])/g,
    '$1/patterns/$2.html$4',
  );
  next = next.replace(
    /(["'])\/design-system\/patterns\/([a-z0-9-]+)(?!\.html)(\/?)(["'])/g,
    '$1/design-system/patterns/$2.html$4',
  );
  return next;
}

let linkPatched = 0;
walkFiles(outDir, (filePath) => {
  if (!isTextAsset(filePath)) return;
  const before = fs.readFileSync(filePath, "utf8");
  const after = addHtmlExtensions(before);
  if (before !== after) {
    fs.writeFileSync(filePath, after);
    linkPatched += 1;
  }
});
console.log(`patched ${linkPatched} files with .html route links`);

const redirectScript = `<script>(function(){var p=location.pathname.replace(/\\/$/,"")||"/";var m=${JSON.stringify(routeRedirectMap)};if(m[p])location.replace(m[p]+location.search+location.hash);})();</script>`;
const indexPath = path.join(outDir, "index.html");
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, "utf8");
  if (!indexHtml.includes("reviewa-static-route-fallback")) {
    const updated = indexHtml.replace(
      "<body",
      `${redirectScript.replace("<script>", '<script id="reviewa-static-route-fallback">')}<body`,
    );
    fs.writeFileSync(indexPath, updated);
    console.log("injected SPA fallback redirect script into index.html");
  }
}
