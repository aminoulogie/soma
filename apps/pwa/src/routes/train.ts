import type { Route } from "../lib/router";

// Scaffold. Phase 3 continues here — the UI port lands in this file.
export const trainRoute: Route = {
  id: "train",
  label: "Train",
  icon: "⚡",
  render(host) {
    host.innerHTML = `
      <h1>Train</h1>
      <div class="card">
        <p class="muted">Not built yet — this is the routing scaffold.</p>
      </div>`;
  }
};
