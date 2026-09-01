// Replaces Obsidian's Notice — 38 call sites in the plugin used it.
const LIFETIME_MS = 2600;

export function toast(message: string): void {
  const host = document.getElementById("toast-host");
  if (!host) return;

  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = message;
  el.setAttribute("role", "status");
  host.appendChild(el);

  window.setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity .18s";
    window.setTimeout(() => el.remove(), 200);
  }, LIFETIME_MS);
}
