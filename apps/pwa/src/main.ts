// ============================================================================
// Boot: shell, nav, router, service worker.
// ============================================================================

import { Router, type Route, type RouteId } from "./lib/router";
import { requestPersistence } from "./lib/db";
import { toast } from "./lib/toast";

import { trainRoute } from "./routes/train";
import { foodRoute } from "./routes/food";
import { habitsRoute } from "./routes/habits";
import { sleepRoute } from "./routes/sleep";
import { reviewRoute } from "./routes/review";

const ROUTES: Route[] = [trainRoute, foodRoute, habitsRoute, sleepRoute, reviewRoute];

function mountShell(): { view: HTMLElement; nav: HTMLElement } {
  const app = document.getElementById("app");
  if (!app) throw new Error("#app is missing from index.html");

  app.innerHTML = "";

  const view = document.createElement("main");
  view.className = "view";
  app.appendChild(view);

  const nav = document.createElement("nav");
  nav.className = "nav";
  nav.setAttribute("role", "navigation");
  app.appendChild(nav);

  const toastHost = document.createElement("div");
  toastHost.className = "toast-host";
  toastHost.id = "toast-host";
  app.appendChild(toastHost);

  return { view, nav };
}

function buildNav(nav: HTMLElement, router: Router): void {
  for (const r of ROUTES) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.route = r.id;
    b.innerHTML = `<span class="ico">${r.icon}</span><span>${r.label}</span>`;
    b.addEventListener("click", () => router.go(r.id));
    nav.appendChild(b);
  }
}

function markActive(nav: HTMLElement, id: RouteId): void {
  for (const b of Array.from(nav.querySelectorAll("button"))) {
    const el = b as HTMLButtonElement;
    if (el.dataset.route === id) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  }
}

function watchConnectivity(): void {
  const bar = document.createElement("div");
  bar.className = "offline-bar";
  bar.textContent = "Offline — everything still works, changes save locally";
  bar.hidden = true;
  document.body.appendChild(bar);

  const sync = () => { bar.hidden = navigator.onLine; };
  window.addEventListener("online", sync);
  window.addEventListener("offline", sync);
  sync();
}

async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  // sw.js is emitted by the build plugin, not bundled as a module entry: a
  // service worker needs a stable, unhashed URL to control its own scope.
  try {
    const swUrl = new URL("sw.js", document.baseURI).href;
    const reg = await navigator.serviceWorker.register(swUrl, { scope: "./" });
    reg.addEventListener("updatefound", () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener("statechange", () => {
        // A controller already exists, so this install is an update rather
        // than a first run — worth telling the user, since the new version
        // only takes effect next launch.
        if (sw.state === "installed" && navigator.serviceWorker.controller) {
          toast("Update ready — reopen the app to apply");
        }
      });
    });
  } catch (err) {
    // Not fatal: the app runs online without a SW, it just loses offline.
    console.warn("[soma] service worker registration failed", err);
  }
}

async function boot(): Promise<void> {
  const { view, nav } = mountShell();
  const router = new Router(view, id => markActive(nav, id));
  for (const r of ROUTES) router.register(r);
  buildNav(nav, router);
  watchConnectivity();
  router.start();

  // Safari grants persistence to home-screen apps and usually refuses it in
  // the browser. Asking is cheap and a refusal is not worth reporting.
  void requestPersistence();
  void registerServiceWorker();
}

void boot();
