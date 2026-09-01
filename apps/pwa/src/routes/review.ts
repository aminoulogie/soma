// ============================================================================
// Review — the whole month, all three domains at once.
//
// The plugin's audit widget reports each domain separately, which makes it
// hard to see that the bad training week was also the week you slept six
// hours and ate 1,400 calories. This puts training, food, sleep and habits on
// one row per day so those patterns are visible rather than inferred.
// ============================================================================

import type { Route } from "../lib/router";
import { getLocalDateKey, SomaIntelligenceEngine } from "@soma/core";
import { asKeyedObject, setMeta } from "../lib/db";

const MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];

let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();

const pad = (n: number) => String(n).padStart(2, "0");
const dayKey = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

interface FoodDay { items?: { cals?: number; p?: number }[]; water?: number; bodyWeight?: number }
interface SleepDay { hours?: number | null }
interface HabitDay { done?: string[] }

function shift(delta: number): void {
  let m = viewMonth + delta, y = viewYear;
  if (m < 0) { m = 11; y -= 1; }
  if (m > 11) { m = 0; y += 1; }
  viewMonth = m; viewYear = y;
}

async function view(host: HTMLElement): Promise<void> {
  const [workouts, foods, sleeps, habits] = await Promise.all([
    asKeyedObject<any>("workout"),
    asKeyedObject<FoodDay>("food"),
    asKeyedObject<SleepDay>("sleep"),
    asKeyedObject<HabitDay>("habits")
  ]);

  const total = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = getLocalDateKey(new Date());

  let trained = 0, fedDays = 0, sleptDays = 0, habitTicks = 0;
  let calSum = 0, sleepSum = 0, volSum = 0;

  const rows: string[] = [];
  for (let d = 1; d <= total; d++) {
    const key = dayKey(viewYear, viewMonth, d);
    if (key > today) continue;

    const w = workouts[key];
    const f = foods[key];
    const s = sleeps[key];
    const h = habits[key];

    const vol = w?.totalVol ?? 0;
    const cals = (f?.items ?? []).reduce((a, i) => a + (Number(i.cals) || 0), 0);
    const hrs = Number(s?.hours) || 0;
    const ticks = (h?.done ?? []).length;

    if (w) { trained++; volSum += vol; }
    if (cals > 0) { fedDays++; calSum += cals; }
    if (hrs > 0) { sleptDays++; sleepSum += hrs; }
    habitTicks += ticks;

    const dow = new Date(viewYear, viewMonth, d).toLocaleDateString(undefined, { weekday: "short" });
    // A dash rather than a zero: nothing logged is not the same as a zero.
    rows.push(`
      <div class="rev-row ${key === today ? "is-today" : ""}">
        <span class="rev-day"><b>${d}</b><span class="faint">${dow}</span></span>
        <span class="rev-cell ${w ? "on" : ""}" title="${w ? w.split || "Workout" : "No session"}">
          ${w ? "⚡" : "·"}</span>
        <span class="rev-cell ${cals > 0 ? "on" : ""}">${cals > 0 ? Math.round(cals / 100) / 10 + "k" : "·"}</span>
        <span class="rev-cell ${hrs > 0 ? (hrs >= 7 ? "on" : "warn") : ""}">${hrs > 0 ? hrs + "h" : "·"}</span>
        <span class="rev-cell ${ticks ? "on" : ""}">${ticks || "·"}</span>
      </div>`);
  }

  const daysSoFar = Math.max(1, rows.length);
  const consistency = SomaIntelligenceEngine.computeConsistency(workouts, { sessionsPerWeek: 4 });

  host.innerHTML = `
    <h1>Review</h1>

    <div class="card">
      <div class="cal-head">
        <button class="cal-nav" data-shift="-1" aria-label="Previous month">‹</button>
        <div class="cal-title"><strong>${MONTHS[viewMonth]} ${viewYear}</strong>
          <span class="faint">${daysSoFar} days so far</span></div>
        <button class="cal-nav" data-shift="1" aria-label="Next month">›</button>
      </div>

      <div class="stat-grid four">
        <div class="stat"><span class="stat-lbl">Trained</span><span class="stat-val">${trained}</span></div>
        <div class="stat"><span class="stat-lbl">Avg kcal</span>
          <span class="stat-val">${fedDays ? Math.round(calSum / fedDays) : "—"}</span></div>
        <div class="stat"><span class="stat-lbl">Avg sleep</span>
          <span class="stat-val">${sleptDays ? (sleepSum / sleptDays).toFixed(1) + "h" : "—"}</span></div>
        <div class="stat"><span class="stat-lbl">Habit ticks</span><span class="stat-val">${habitTicks}</span></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">🔥 Consistency</div>
      <div class="stat-grid">
        <div class="stat"><span class="stat-lbl">Streak</span>
          <span class="stat-val accent-text">${consistency.currentStreak}<span class="faint"> wk</span></span></div>
        <div class="stat"><span class="stat-lbl">Best</span>
          <span class="stat-val">${consistency.bestStreak}<span class="faint"> wk</span></span></div>
        <div class="stat"><span class="stat-lbl">Adherence</span>
          <span class="stat-val">${consistency.adherence}%</span></div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📆 Day by day</div>
      <div class="rev-head">
        <span></span><span>TRAIN</span><span>FOOD</span><span>SLEEP</span><span>HABITS</span>
      </div>
      ${rows.join("") || `<p class="muted">Nothing logged this month yet.</p>`}
      <p class="faint" style="margin-top:10px">
        Reading across a row shows whether a poor session lines up with short sleep
        or low intake — which a single-domain view hides.</p>
    </div>

    <div class="card">
      <div class="card-title">📊 Weekly volume</div>
      ${volumeRows(workouts)}
    </div>`;
}

function volumeRows(workouts: Record<string, any>): string {
  const rows = SomaIntelligenceEngine.volumeReport(workouts, 7);
  const trained = rows.filter((r: any) => r.sets > 0);
  if (!trained.length) return `<p class="muted">No working sets in the last 7 days.</p>`;

  const TIER: Record<string, string> = {
    over: "var(--soma-danger)", under: "var(--soma-warn)", none: "var(--soma-text-faint)",
    high: "var(--soma-info)", optimal: "var(--soma-accent-text)"
  };
  return trained.map((r: any) => {
    const max = Math.max(r.mrv, r.sets);
    const pct = (v: number) => Math.min(100, (v / max) * 100);
    return `
      <div class="vol-row">
        <div class="vol-head"><span>${r.label}</span>
          <span style="color:${TIER[r.tier]}"><b>${r.sets}</b> <span class="faint">sets</span></span></div>
        <div class="vol-bar">
          <div class="vol-fill" style="width:${pct(r.sets)}%;background:${TIER[r.tier]}"></div>
          <i class="vol-tick" style="left:${pct(r.mev)}%"></i>
          <i class="vol-tick" style="left:${pct(r.mav)}%"></i>
          <i class="vol-tick mrv" style="left:${pct(r.mrv)}%"></i>
        </div>
        <div class="faint">${r.note}</div>
      </div>`;
  }).join("");
}

export const reviewRoute: Route = {
  id: "review",
  label: "Review",
  icon: "📊",
  async render(host) {
    void setMeta("lastTab", "review");
    await view(host);

    if (!(host as any).__revWired) {
      (host as any).__revWired = true;
      host.addEventListener("click", (e) => {
        const b = (e.target as HTMLElement).closest<HTMLElement>("[data-shift]");
        if (!b) return;
        shift(Number(b.dataset.shift));
        void view(host);
      });
    }
  }
};
