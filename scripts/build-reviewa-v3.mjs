/** Build an isolated static export containing only V3 routes. */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const stage = fs.mkdtempSync(path.join(os.tmpdir(), "hax-reviewa-v3-"));
const output = path.join(root, ".next-reviewa-v3");
const stageOutput = path.join(stage, ".next-reviewa");
const include = [
  "app", "components", "content", "hooks", "lib", "public", "scripts",
  "server", "types", "vendor", "package.json", "package-lock.json",
  "next.config.ts", "postcss.config.mjs", "tailwind.config.ts", "tsconfig.json",
];
const excludedRoutes = ["(site)", "(themed)", "(v2)", "(recording)", "(start)", "api"];

try {
  for (const item of include) {
    const from = path.join(root, item);
    if (fs.existsSync(from)) fs.cpSync(from, path.join(stage, item), { recursive: true });
  }
  fs.symlinkSync(path.join(root, "node_modules"), path.join(stage, "node_modules"), "dir");
  for (const item of excludedRoutes) fs.rmSync(path.join(stage, "app", item), { recursive: true, force: true });
  fs.rmSync(path.join(stage, "public", "prototypes"), { recursive: true, force: true });

  execFileSync("node", [path.join(root, "node_modules/next/dist/bin/next"), "build"], {
    cwd: stage,
    stdio: "inherit",
    env: { ...process.env, REVIEWA_BUILD: "1" },
  });
  execFileSync("node", ["scripts/fix-static-export-paths.mjs"], { cwd: stage, stdio: "inherit" });

  if (!fs.existsSync(path.join(stageOutput, "v3.html"))) {
    throw new Error("V3 homepage missing from export");
  }
  for (const version of ["v1", "v2"]) {
    if (fs.existsSync(path.join(stageOutput, `${version}.html`)) || fs.existsSync(path.join(stageOutput, version))) {
      throw new Error(`${version} route found in V3-only export`);
    }
  }

  fs.writeFileSync(path.join(stageOutput, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="refresh" content="0;url=/v3.html"><title>HAX</title><script>location.replace('/v3.html'+location.search+location.hash)</script></head><body><a href="/v3.html">Open HAX</a></body></html>`);

  // Reviewa serves HTML pages but not Next's client-side RSC payloads. A
  // capture-phase click handler makes internal V3 links load their HTML pages.
  const navigationScript = `<script id="reviewa-v3-navigation">(function(){document.addEventListener('click',function(event){if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||!(event.target instanceof Element))return;var link=event.target.closest('a[href]');if(!link||link.hasAttribute('download')||(link.target&&link.target!=='_self'))return;var url=new URL(link.href,location.href);if(url.origin!==location.origin||!/^\\/v3(?:\\/|$)/.test(url.pathname))return;if(!url.pathname.endsWith('.html'))url.pathname=url.pathname.replace(/\\/$/,'')+'.html';event.preventDefault();event.stopImmediatePropagation();location.assign(url.href)},true)})();</script>`;
  function addFullPageNavigation(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) addFullPageNavigation(full);
      else if (entry.name.endsWith(".html") && entry.name !== "404.html") {
        const html = fs.readFileSync(full, "utf8");
        fs.writeFileSync(full, html.replace("</head>", `${navigationScript}</head>`));
      }
    }
  }
  addFullPageNavigation(stageOutput);

  let checked = 0;
  function audit(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) audit(full);
      else if (entry.name.endsWith(".html")) {
        const html = fs.readFileSync(full, "utf8");
        if (/href=["']\/v[12](?:\/|\?|#|["'])/.test(html)) {
          throw new Error(`Legacy link found in ${path.relative(stageOutput, full)}`);
        }
        checked++;
      }
    }
  }
  audit(stageOutput);

  fs.rmSync(output, { recursive: true, force: true });
  fs.cpSync(stageOutput, output, { recursive: true });
  console.log(`\n✓ V3-only Reviewa export ready in ${output} (${checked} HTML pages audited)`);
} finally {
  fs.rmSync(stage, { recursive: true, force: true });
}
