// ============================================================================
// Hash router.
//
// Hash, not History API, on purpose: GitHub Pages serves static files and has
// no rewrite rule, so a deep link to /soma/train under the History API returns
// a real 404. Hashes never hit the server, which also means the offline shell
// resolves every route without the service worker faking navigations.
// ============================================================================

export type RouteId = "train" | "food" | "habits" | "sleep" | "review" | "settings";

export interface Route {
  id: RouteId;
  label: string;
  icon: string;
  /** Renders into the supplied host. May be async; the shell shows the last
   *  paint until it resolves. */
  render(host: HTMLElement): void | Promise<void>;
}

const DEFAULT: RouteId = "train";

export class Router {
  private routes = new Map<RouteId, Route>();
  private current: RouteId | null = null;
  private host: HTMLElement;
  private onChange: (id: RouteId) => void;

  constructor(host: HTMLElement, onChange: (id: RouteId) => void) {
    this.host = host;
    this.onChange = onChange;
    window.addEventListener("hashchange", () => void this.apply());
  }

  register(route: Route): void {
    this.routes.set(route.id, route);
  }

  start(): void {
    void this.apply();
  }

  go(id: RouteId): void {
    if (location.hash === `#/${id}`) return;
    location.hash = `#/${id}`;
  }

  private parse(): RouteId {
    const id = location.hash.replace(/^#\/?/, "") as RouteId;
    return this.routes.has(id) ? id : DEFAULT;
  }

  private async apply(): Promise<void> {
    const id = this.parse();
    if (id === this.current) return;
    const route = this.routes.get(id);
    if (!route) return;

    this.current = id;
    this.onChange(id);

    try {
      await route.render(this.host);
    } catch (err) {
      // A crashing tab should not take the shell down with it — the nav has to
      // stay usable so you can get back to a working screen.
      console.error(`[soma] route "${id}" failed to render`, err);
      this.host.innerHTML = `
        <div class="err-card">
          <h2>This screen hit an error</h2>
          <p>${err instanceof Error ? err.message : String(err)}</p>
          <p class="err-hint">The other tabs still work.</p>
        </div>`;
    }
    // Each tab is its own context; carrying scroll position across is
    // disorienting rather than helpful.
    this.host.scrollTo?.({ top: 0 });
  }
}
