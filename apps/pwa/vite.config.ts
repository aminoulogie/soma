import { defineConfig, type Plugin } from "vite";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// GitHub Pages serves project sites from /<repo>/, so asset URLs need that
// prefix in production. Overridable for a custom domain or a user-page repo.
const base = process.env.PWA_BASE ?? "/soma/";

/**
 * Builds the service worker and stamps it with the two things it cannot know
 * at author time: a version string, and the list of files to precache.
 *
 * The SW is compiled separately rather than as a Rollup entry because it must
 * ship as one self-contained classic-module file at a stable URL — a hashed,
 * code-split SW cannot reliably control its own scope.
 */
function serviceWorkerPlugin(): Plugin {
  let outDir = "dist";
  let buildId = "";

  return {
    name: "soma-sw",
    apply: "build",

    configResolved(config) {
      outDir = config.build.outDir;
      // Content-independent but unique per build: enough to retire old caches.
      buildId = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, 14);
    },

    async writeBundle(_options, bundle) {
      const swSource = join(process.cwd(), "src", "sw.ts");
      if (!existsSync(swSource)) return;

      // Everything Vite emitted, as URLs the SW can request.
      const precache = Object.keys(bundle)
        .filter(name => /\.(js|css|woff2?|png|svg|wasm)$/.test(name))
        .map(name => base + name);
      // The manifest and icons are static, so they are not in the bundle map.
      precache.push(base + "manifest.webmanifest");

      // esbuild is already present via Vite; use it to strip the TypeScript.
      const esbuild = await import("esbuild");
      const built = await esbuild.build({
        entryPoints: [swSource],
        bundle: true,
        // IIFE, not ESM. Module service workers are not supported in Safari,
        // so a module worker would register on Chromium and fail on every
        // iPhone — which is the only device this app is being built for.
        format: "iife",
        target: "es2022",
        write: false,
        logLevel: "silent"
      });

      const code = (built.outputFiles?.[0]?.text ?? "")
        .replace(/__BUILD_ID__/g, buildId)
        // JSON.stringify twice: once for the array, once so the result is a
        // valid JS string literal for the JSON.parse in the worker.
        .replace(/"__PRECACHE__"/g, JSON.stringify(JSON.stringify(precache)));

      writeFileSync(join(outDir, "sw.js"), code);

      // Point the app at the emitted worker rather than the .ts source.
      const htmlPath = join(outDir, "index.html");
      if (existsSync(htmlPath)) {
        const html = readFileSync(htmlPath, "utf8");
        writeFileSync(htmlPath, html.replace(/\/src\/sw\.ts/g, base + "sw.js"));
      }

      console.log(`  sw.js  precaching ${precache.length} files (build ${buildId})`);
    }
  };
}

export default defineConfig({
  base,
  plugins: [serviceWorkerPlugin()],
  build: {
    target: "es2022",
    outDir: "dist",
    // The workspace packages are CommonJS source, not pre-bundled deps, so
    // Rollup parses them as ESM and finds no named exports. Including them
    // here runs them through the CJS interop instead.
    commonjsOptions: {
      include: [/packages[\/]/, /node_modules/],
      transformMixedEsModules: true
    },
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // ZXing's wasm decoder is large and only needed once you open the
        // scanner, so it stays a separate chunk rather than being pulled into
        // the entry bundle on every cold start.
        manualChunks(id) {
          if (id.includes("zxing")) return "scanner";
          if (id.includes("packages/core")) return "core";
          return undefined;
        }
      }
    }
  },
  optimizeDeps: {
    // Linked workspace packages are not optimised by default; without this
    // the dev server hits the same missing-export problem as the build.
    include: ["@soma/core", "@soma/browser"]
  },
  server: {
    port: 5173,
    // getUserMedia needs a secure context. localhost qualifies; a LAN IP does
    // not — test the camera from the deployed HTTPS URL or a tunnel.
    host: false
  }
});
