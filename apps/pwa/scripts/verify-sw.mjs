// Checks the built service worker is actually deployable:
//   - build-time placeholders were substituted
//   - the precache list covers every emitted asset
//   - index.html points at the built worker, not the TypeScript source
//
// Run after `vite build`. Exits non-zero on any problem so CI can gate on it.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";

// Resolve from this file, not the caller's cwd, so it works from the repo
// root, from apps/pwa, and from CI without three different invocations.
const DIST = join(dirname(fileURLToPath(import.meta.url)), "..", "dist");
const problems = [];
const ok = [];

if (!existsSync(DIST)) {
  console.error("dist/ is missing — run the build first.");
  process.exit(1);
}

// --- the worker itself -------------------------------------------------------
const swPath = join(DIST, "sw.js");
if (!existsSync(swPath)) {
  problems.push("sw.js was not emitted");
} else {
  const sw = readFileSync(swPath, "utf8");

  if (/__BUILD_ID__|__PRECACHE__/.test(sw)) {
    problems.push("sw.js still contains build placeholders");
  } else {
    ok.push("placeholders substituted");
  }

  // The precache array is embedded as a JSON string literal.
  const m = sw.match(/JSON\.parse\((".*?")\)/s);
  if (!m) {
    problems.push("no precache list found in sw.js");
  } else {
    let list = [];
    try {
      list = JSON.parse(JSON.parse(m[1]));
    } catch {
      problems.push("precache list is not valid JSON");
    }

    // Everything Vite emitted that the app needs at runtime.
    const emitted = [];
    (function walk(dir, prefix) {
      for (const e of readdirSync(dir, { withFileTypes: true })) {
        if (e.isDirectory()) walk(join(dir, e.name), prefix + e.name + "/");
        else if (/\.(js|css|woff2?|png|svg|wasm|webmanifest)$/.test(e.name)) {
          if (e.name === "sw.js") continue; // the worker never caches itself
          emitted.push(prefix + e.name);
        }
      }
    })(DIST, "");

    const cached = new Set(list.map(u => u.replace(/^.*?\/(?=assets\/|manifest)/, "")));
    const missing = emitted.filter(f => ![...cached].some(c => c.endsWith(f)));

    if (missing.length) {
      problems.push("not precached: " + missing.join(", "));
    } else {
      ok.push(`precaches all ${emitted.length} runtime assets`);
    }

    if (!list.some(u => u.endsWith(".css"))) problems.push("no stylesheet precached");
    if (!list.some(u => u.endsWith(".js"))) problems.push("no script precached");
  }

  // Offline correctness properties worth asserting rather than assuming.
  if (!/req\.method !== "GET"/.test(sw)) {
    problems.push("sw does not skip non-GET requests");
  } else ok.push("non-GET requests pass through");

  if (!/mode === "navigate"/.test(sw)) {
    problems.push("sw has no navigation fallback — deep links break offline");
  } else ok.push("navigations fall back to the cached shell");

  if (!/openfoodfacts/.test(sw)) {
    problems.push("food API is not marked network-only — stale data risk");
  } else ok.push("food API is network-only");
}

// --- the HTML ---------------------------------------------------------------
const htmlPath = join(DIST, "index.html");
if (existsSync(htmlPath)) {
  const html = readFileSync(htmlPath, "utf8");
  if (/src\/sw\.ts/.test(html)) problems.push("index.html still references src/sw.ts");
  else ok.push("index.html has no stale worker reference");

  for (const [label, re] of [
    ["viewport-fit=cover", /viewport-fit=cover/],
    ["apple-mobile-web-app-capable", /apple-mobile-web-app-capable/],
    ["apple-touch-icon", /apple-touch-icon/],
    ["manifest link", /rel="manifest"/]
  ]) {
    if (re.test(html)) ok.push(label); else problems.push("index.html missing " + label);
  }
}

// --- icons -------------------------------------------------------------------
// A home-screen app with a missing icon is the one thing users see first.
for (const icon of ['icons/icon-192.png','icons/icon-512.png','icons/icon-maskable-512.png','icons/apple-touch-icon.png']) {
  if (existsSync(join(DIST, icon))) ok.push(icon);
  else problems.push('missing ' + icon);
}

// --- report -----------------------------------------------------------------
for (const o of ok) console.log("  ok    " + o);
for (const p of problems) console.log("  FAIL  " + p);
console.log();
if (problems.length) {
  console.error(problems.length + " service-worker problem(s)");
  process.exit(1);
}
console.log("service worker looks deployable");
