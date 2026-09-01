// ============================================================================
// Sleep — hours and quality, with the trend that makes them mean something.
//
// A single night tells you nothing; the 7-night average is what moves. Sleep
// also feeds the training autoregulator, so this is not just a diary.
// ============================================================================

import type { Route } from "../lib/router";
import { getLocalDateKey } from "@soma/core";
import { getRecord, putRecord, allOfType, setMeta } from "../lib/db";
import { toast } from "../lib/toast";

interface SleepDay { hours: number | null; quality: number }

const today = () => getLocalDateKey(new Date());

let draftHours: number | null = null;
let draftQuality = 3;

const avg = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const fmt = (n: number | null, d = 1) => n === null || isNaN(n) ? "—" : n.toFixed(d);

function sparkline(points: { date: string; hours: number }[]): string {
  if (points.length < 2) {
    return `<p class="muted" style="text-align:center;padding:14px 0">
              Log a few nights and the trend appears here.</p>`;
  }
  const pts = points.slice(-30);
  const W = 320, H = 110, PAD = 10;
  const hi = Math.max(10, ...pts.map(p => p.hours));
  const lo = Math.min(4, ...pts.map(p => p.hours));
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (pts.length - 1);
  const y = (v: number) => PAD + (H - PAD * 2) * (1 - (v - lo) / (hi - lo));
  const line = pts.map((p, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(p.hours).toFixed(1)}`).join(" ");
  // An 8h reference line, so the trend is read against something rather than
  // just wandering up and down.
  const eight = y(8).toFixed(1);
  const dots = pts.map((p, i) =>
    `<circle cx="${x(i).toFixed(1)}" cy="${y(p.hours).toFixed(1)}" r="${i === pts.length - 1 ? 3.5 : 1.8}"
             fill="${p.hours >= 7 ? "var(--soma-accent-text)" : "var(--soma-warn)"}"/>`).join("");

  return `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:120px;display:block">
      <line x1="${PAD}" y1="${eight}" x2="${W - PAD}" y2="${eight}"
            stroke="var(--soma-border-strong)" stroke-width="1" stroke-dasharray="3 3"/>
      <path d="${line}" fill="none" stroke="var(--soma-accent-text)" stroke-width="2"
            stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
    </svg>
    <div class="chart-legend">
      <span>${pts[0]!.date}</span><span>dashed = 8h</span><span>${pts[pts.length - 1]!.date}</span>
    </div>`;
}

async function view(host: HTMLElement): Promise<void> {
  const rows = await allOfType<SleepDay>("sleep");
  const series = rows
    .filter(r => (r.data.hours ?? 0) > 0)
    .map(r => ({ date: r.date, hours: r.data.hours as number, quality: r.data.quality }));

  const stored = await getRecord<SleepDay>("sleep", today());
  if (draftHours === null && stored?.hours != null) draftHours = stored.hours;
  if (stored?.quality) draftQuality = stored.quality;

  const last7 = series.slice(-7);
  const avg7 = avg(last7.map(p => p.hours));
  const avgQ7 = avg(last7.map(p => p.quality));
  // Debt against an 8h target across the week — the number that actually
  // explains why a session felt heavy.
  const debt = avg7 !== null ? (8 - avg7) * 7 : null;

  const recent = series.slice(-10).reverse().map(p => `
    <div class="list-row">
      <span class="${p.date === today() ? "accent-text bold" : "dim"}">${p.date}${p.date === today() ? " • today" : ""}</span>
      <span class="list-right">
        <b style="color:${p.hours >= 7 ? "var(--soma-text)" : "var(--soma-warn)"}">${fmt(p.hours)} h</b>
        <span class="faint">${"●".repeat(p.quality)}${"○".repeat(5 - p.quality)}</span>
      </span>
    </div>`).join("") || `<p class="muted">No nights logged yet.</p>`;

  host.innerHTML = `
    <h1>Sleep</h1>

    <div class="card">
      <div class="card-title">😴 Last night</div>
      <p class="faint" style="margin:0 0 10px">Time actually asleep, not time in bed.</p>
      <div class="stepper">
        <button class="btn" data-act="h" data-d="-0.25">−</button>
        <input class="in big" id="hrs" type="number" step="0.25" inputmode="decimal"
               placeholder="7.5" value="${draftHours ?? ""}"/>
        <button class="btn" data-act="h" data-d="0.25">+</button>
      </div>
      <div class="field-lbl">Quality</div>
      <div class="quality-row">
        ${[1, 2, 3, 4, 5].map(n =>
          `<button class="q-dot ${n <= draftQuality ? "on" : ""}" data-act="q" data-q="${n}">${n <= draftQuality ? "●" : "○"}</button>`).join("")}
      </div>
      <button class="btn accent wide" data-act="save" style="margin-top:12px">Save for ${today()}</button>
    </div>

    <div class="card">
      <div class="card-title">📈 Trend</div>
      <div class="stat-grid">
        <div class="stat"><span class="stat-lbl">7-night avg</span><span class="stat-val">${fmt(avg7)} h</span></div>
        <div class="stat"><span class="stat-lbl">Avg quality</span><span class="stat-val accent-text">${fmt(avgQ7)}</span></div>
        <div class="stat"><span class="stat-lbl">Weekly debt</span>
          <span class="stat-val" style="color:${debt !== null && debt > 3 ? "var(--soma-warn)" : "var(--soma-text)"}">
            ${debt === null ? "—" : debt > 0 ? fmt(debt) + "h" : "0h"}</span></div>
      </div>
      ${sparkline(series)}
    </div>

    <div class="card">
      <div class="card-title">🗓️ Recent nights</div>
      ${recent}
    </div>`;
}

export const sleepRoute: Route = {
  id: "sleep",
  label: "Sleep",
  icon: "😴",
  async render(host) {
    void setMeta("lastTab", "sleep");
    await view(host);

    if (!(host as any).__sleepWired) {
      (host as any).__sleepWired = true;
      host.addEventListener("click", (e) => {
        void (async () => {
          const b = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
          if (!b) return;
          const input = host.querySelector<HTMLInputElement>("#hrs");

          if (b.dataset.act === "h" && input) {
            const next = Math.max(0, (parseFloat(input.value) || 0) + Number(b.dataset.d));
            draftHours = Math.round(next * 4) / 4;
            input.value = String(draftHours);
            return;
          }
          if (b.dataset.act === "q") {
            draftQuality = Number(b.dataset.q);
            await view(host);
            return;
          }
          if (b.dataset.act === "save") {
            const h = parseFloat(input?.value ?? "");
            if (isNaN(h) || h <= 0 || h > 24) { toast("Enter hours slept (0–24)."); return; }
            draftHours = Math.round(h * 4) / 4;
            await putRecord<SleepDay>("sleep", today(), { hours: draftHours, quality: draftQuality });
            toast(`Sleep saved: ${draftHours}h`);
            await view(host);
          }
        })();
      });
      host.addEventListener("input", (e) => {
        const el = e.target as HTMLInputElement;
        if (el.id === "hrs") draftHours = el.value === "" ? null : Number(el.value);
      });
    }
  }
};
