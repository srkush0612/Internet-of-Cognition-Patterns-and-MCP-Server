/**
 * Reviewa and other static hosts often fail to serve Next.js chunks whose paths
 * contain literal [slug] or (themed) segments, and they do not serve
 * `/gallery` for `gallery.html`. This renames those folders and patches the
 * references after `next build` with output: "export".
 *
 * Both halves read the build rather than a list kept by hand. The list went
 * stale the first time a route was added that nobody remembered to add to it,
 * which is a thing that only shows up once the site is already deployed.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// The Reviewa build points `distDir` at `.next-reviewa` (see next.config.ts) so
// it never shares `.next` with a `next dev` server that might be running at
// the same time. With `output: "export"`, Next writes the exported static
// site directly into that distDir rather than a separate `out/`.
const outDir = path.join(__dirname, "..", ".next-reviewa");

if (!fs.existsSync(outDir)) {
  // No static export present — this step only applies to `build:reviewa`
  // (output: "export"). A plain `next build` produces `.next/`, not this
  // directory, so treat the absence as a no-op instead of failing the build.
  console.log(".next-reviewa/ not found — skipping static-export path fixes (not an export build).");
  process.exit(0);
}

function walkFiles(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) walkFiles(fullPath, callback);
    else callback(fullPath);
  }
}

function isTextAsset(filePath) {
  return /\.(html?|js|json|css|txt|map)$/i.test(filePath);
}

// ---------------------------------------------------------------- chunk dirs

/** `(site)` → `_site_`, `[slug]` → `_slug_`, `[...rest]` → `_rest_`. */
function sanitizeSegment(name) {
  const match = name.match(/^\((.+)\)$/) ?? name.match(/^\[\.*(.+?)\]$/);
  return match ? `_${match[1]}_` : null;
}

function collectDirs(dir, found = []) {
  if (!fs.existsSync(dir)) return found;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const fullPath = path.join(dir, entry.name);
    collectDirs(fullPath, found);
    if (sanitizeSegment(entry.name)) found.push({ fullPath, name: entry.name });
  }
  return found;
}

const chunkRoot = path.join(outDir, "_next/static/chunks/app");
const renamedSegments = new Set();

// Deepest first, so renaming a parent never invalidates a child's path.
for (const { fullPath, name } of collectDirs(chunkRoot)) {
  const target = path.join(path.dirname(fullPath), sanitizeSegment(name));
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
  fs.renameSync(fullPath, target);
  renamedSegments.add(name);
  console.log(
    `renamed ${path.relative(outDir, fullPath)} → ${path.relative(outDir, target)}`,
  );
}

/** The same segment as it can appear inside a URL in a JS or HTML file. */
function encodedForms(segment) {
  return [
    segment,
    segment
      .replaceAll("(", "%28")
      .replaceAll(")", "%29")
      .replaceAll("[", "%5B")
      .replaceAll("]", "%5D"),
  ];
}

const REPLACEMENTS = [...renamedSegments].flatMap((segment) =>
  encodedForms(segment).map((form) => [form, sanitizeSegment(segment)]),
);

let patched = 0;
walkFiles(outDir, (filePath) => {
  if (!isTextAsset(filePath)) return;
  const before = fs.readFileSync(filePath, "utf8");
  let after = before;
  for (const [from, to] of REPLACEMENTS) after = after.split(from).join(to);
  if (before !== after) {
    fs.writeFileSync(filePath, after);
    patched += 1;
  }
});

console.log(`patched ${patched} files in .next-reviewa/`);

// ------------------------------------------------------------------- routes

/**
 * Every exported page, as the route Next would serve it at. Read off the
 * export so a new page is covered the day it is added.
 */
const routes = [];
walkFiles(outDir, (filePath) => {
  if (!filePath.endsWith(".html")) return;
  const relative = path.relative(outDir, filePath);
  if (relative.startsWith("_next")) return;
  const route = relative.replace(/\.html$/, "").split(path.sep).join("/");
  if (route === "index" || route === "404") return;
  routes.push(route);
});
// Longest first, so a nested route is never shadowed by its parent.
routes.sort((a, b) => b.length - a.length);

console.log(`found ${routes.length} exported routes`);

// Hosts that honour _redirects: map /gallery and /gallery/ onto gallery.html.
const redirectLines = [
  "# Reviewa / static host fallbacks",
  ...routes.flatMap((route) => [
    `/${route}    /${route}.html    200`,
    `/${route}/   /${route}.html    200`,
  ]),
];
fs.writeFileSync(path.join(outDir, "_redirects"), `${redirectLines.join("\n")}\n`);
console.log("wrote .next-reviewa/_redirects for static route fallbacks");

// Hosts without _redirects (Reviewa) need index.html inside the route folder.
for (const route of routes) {
  const htmlPath = path.join(outDir, `${route}.html`);
  if (!fs.existsSync(htmlPath)) continue;
  const dir = path.join(outDir, route);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(htmlPath, path.join(dir, "index.html"));
}
console.log("mirrored *.html routes as */index.html for directory-style URLs");

// Reviewa caps an upload at 300 files. Once v2 roughly doubled the route
// count, keeping four files per route — the page, its /index.html mirror,
// Next's .txt RSC payload, and a .html.txt prefetch mirror of it — blew past
// that. The two .txt sets are what we drop: internal links are patched to
// `.html`, so a soft navigation that can't fetch an RSC payload falls back to
// a full page load (correct, just not instant), and direct or shared
// extensionless URLs still resolve through the /index.html mirror above. The
// page itself is self-contained, so dropping these costs prefetch speed, not
// correctness.
let dropped = 0;
for (const route of routes) {
  const txt = path.join(outDir, `${route}.txt`);
  if (fs.existsSync(txt)) {
    fs.rmSync(txt);
    dropped += 1;
  }
}
// index.txt sits beside the root page and is unreferenced for the same reason.
const rootTxt = path.join(outDir, "index.txt");
if (fs.existsSync(rootTxt)) {
  fs.rmSync(rootTxt);
  dropped += 1;
}
console.log(`dropped ${dropped} RSC .txt payloads to stay under the file cap`);

// And the links inside the pages have to point at the .html files themselves,
// because an extensionless href is what the host fails on in the first place.
const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Only a complete route is rewritten — never one with a trailing slash.
 * `"/v2/patterns/"` in a bundle is the first half of `"/v2/patterns/" + id`,
 * and rewriting it produces `/v2/patterns.htmlauthority-gradient`. The
 * client-side router does not need the extension anyway: it fetches the
 * route's .txt payload, which the export also writes.
 */
function addHtmlExtensions(content) {
  let next = content;
  for (const route of routes) {
    next = next.replace(
      new RegExp(`(["'])/${escape(route)}(["'])`, "g"),
      `$1/${route}.html$2`,
    );
    // A route carrying a query string, e.g. the homepage's /v2/patterns?mode=…
    next = next.replace(
      new RegExp(`(["'])/${escape(route)}\\?([^"']*)(["'])`, "g"),
      `$1/${route}.html?$2$3`,
    );
  }
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

// Last resort: Reviewa serves the root index.html for an unknown path, so the
// picker page carries a redirect table for anyone who typed a bare route.
const routeRedirectMap = Object.fromEntries(
  routes.map((route) => [`/${route}`, `/${route}.html`]),
);
const redirectScript = `<script id="reviewa-static-route-fallback">(function(){var p=location.pathname.replace(/\\/$/,"")||"/";var m=${JSON.stringify(routeRedirectMap)};if(m[p])location.replace(m[p]+location.search+location.hash);})();</script>`;
const indexPath = path.join(outDir, "index.html");
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, "utf8");
  if (!indexHtml.includes("reviewa-static-route-fallback")) {
    fs.writeFileSync(indexPath, indexHtml.replace("<body", `${redirectScript}<body`));
    console.log("injected SPA fallback redirect script into index.html");
  }
}
