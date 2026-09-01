/// <reference lib="webworker" />
// ============================================================================
// Service worker.
//
// Hand-rolled rather than vite-plugin-pwa: the offline requirement here is
// specific (the app must be fully usable in airplane mode, and a stale shell
// must never survive a deploy), and that is ~120 lines of explicit code
// against a plugin's worth of configuration.
//
// Strategy per request type:
//   navigations  cache-first on the shell    — instant launch, works offline
//   app assets   cache-first, hashed names   — safe, invalidated by filename
//   API calls    network-only                — never serve stale nutrition data
// ============================================================================

declare const self: ServiceWorkerGlobalScope;

// Bumped by the build. Changing it retires every previous cache on activate.
const VERSION = "__BUILD_ID__";
const SHELL_CACHE = `soma-shell-${VERSION}`;
const ASSET_CACHE = `soma-assets-${VERSION}`;

// Injected at build time: every hashed asset Vite emitted, so the first launch
// after install is already fully offline-capable rather than warming up
// lazily and failing if the network drops mid-way.
const PRECACHE: string[] = JSON.parse("__PRECACHE__");

const SHELL_URL = new URL("./index.html", self.registration.scope).pathname;

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(SHELL_CACHE);
    // Fetch the shell with cache-busting so an install never adopts a stale
    // copy from the HTTP cache.
    await cache.add(new Request(SHELL_URL, { cache: "reload" }));

    const assets = await caches.open(ASSET_CACHE);
    // Individually, not addAll: one 404 in the list would otherwise abort the
    // whole install and leave the app with no offline capability at all.
    await Promise.all(PRECACHE.map(async (url) => {
      try { await assets.add(new Request(url, { cache: "reload" })); }
      catch (err) { console.warn("[sw] precache miss", url, err); }
    }));

    // Take over on next load rather than waiting for every tab to close.
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keep = new Set([SHELL_CACHE, ASSET_CACHE]);
    for (const key of await caches.keys()) {
      if (key.startsWith("soma-") && !keep.has(key)) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

/** Hosts we must never serve from cache — stale food data is worse than none. */
const NETWORK_ONLY = [
  "world.openfoodfacts.org",
  "world.openproductsfacts.org",
  "api.upcitemdb.com"
];

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Never touch anything but GET: a cached POST is meaningless and caching
  // one would silently break writes.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (NETWORK_ONLY.some(h => url.hostname.endsWith(h))) {
    event.respondWith(
      fetch(req).catch(() => new Response(
        JSON.stringify({ offline: true, status: 0 }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      ))
    );
    return;
  }

  // Every in-app route is a hash, so any navigation resolves to the one shell.
  if (req.mode === "navigate") {
    event.respondWith((async () => {
      const cached = await caches.match(SHELL_URL);
      if (cached) return cached;
      try { return await fetch(req); }
      catch { return new Response("Offline and no cached shell.", { status: 503 }); }
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
      const res = await fetch(req);
      // Only cache real successes. Caching an opaque or error response makes
      // the failure permanent until the next deploy.
      if (res.ok && res.type === "basic") {
        const cache = await caches.open(ASSET_CACHE);
        void cache.put(req, res.clone());
      }
      return res;
    } catch {
      return new Response("", { status: 503 });
    }
  })());
});

export {};
