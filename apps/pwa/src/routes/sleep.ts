import type { Route } from "../lib/router";

// Scaffold. Phase 3 continues here — the UI port lands in this file.
export const sleepRoute: Route = {
  id: "sleep",
  label: "Sleep",
  icon: "😴",
  render(host) {
    host.innerHTML = `
      <h1>Sleep</h1>
      <div class="card">
        <p class="muted">Not built yet — this is the routing scaffold.</p>
      </div>`;
  }
};
