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
// Which exercise the strength chart shows. Chosen lazily once history is
// loaded, so the first paint defaults to whatever you've actually logged.
let strengthPick: string | null = null;

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
    </div>

    <div class="card">
      <div class="card-title">📈 Strength</div>
      ${strengthCard(workouts)}
    </div>`;
}

/**
 * Estimated-1RM trend for one exercise, with PRs marked. The plugin has this
 * as its own chart; here it rides on Review since a trend is a review-time
 * question, not something to check mid-set.
 */
function strengthCard(workouts: Record<string, any>): string {
  const names: string[] = SomaIntelligenceEngine.loggedExerciseNames(workouts);
  if (!names.length) return `<p class="muted">Log a few sessions and trends appear here.</p>`;
  if (!strengthPick || !names.includes(strengthPick)) strengthPick = names[0] ?? null;
  if (!strengthPick) return `<p class="muted">Log a few sessions and trends appear here.</p>`;

  const points = SomaIntelligenceEngine.strengthSeries(workouts, strengthPick);
  const options = names.map((n: string) =>
    `<option value="${n}" ${n === strengthPick ? "selected" : ""}>${n}</option>`).join("");

  if (points.length < 2) {
    return `
      <select class="in split-pick" id="strength-pick">${options}</select>
      <p class="muted" style="margin-top:10px">
        ${points.length ? "One session logged — one more shows a trend." : "No completed working sets for this exercise yet."}
      </p>`;
  }

  // Guarded above by points.length < 2, so both ends exist.
  const firstPt = points[0]!, lastPt = points[points.length - 1]!;
  const unitLbl = lastPt.metric === "est1RM" ? "est. 1RM" : "best reps";
  const prs = points.filter((p: any) => p.isPR);
  const last = lastPt.est1RM;
  const delta = last - firstPt.est1RM;
  const metric = lastPt.metric;

  return `
    <select class="in split-pick" id="strength-pick">${options}</select>
    <div class="stat-grid" style="margin:10px 0">
      <div class="stat"><span class="stat-lbl">Current ${unitLbl}</span><span class="stat-val accent-text">${last}${metric === "est1RM" ? "kg" : ""}</span></div>
      <div class="stat"><span class="stat-lbl">Since first log</span>
        <span class="stat-val" style="color:${delta >= 0 ? "var(--soma-accent-text)" : "var(--soma-warn)"}">${delta >= 0 ? "+" : ""}${Math.round(delta * 10) / 10}</span></div>
      <div class="stat"><span class="stat-lbl">PRs hit</span><span class="stat-val">${prs.length}</span></div>
    </div>
    ${strengthSparkline(points)}`;
}

function strengthSparkline(points: any[]): string {
  const pts = points.slice(-30);
  const W = 320, H = 110, PAD = 10;
  const vals = pts.map(p => p.est1RM);
  const hi = Math.max(...vals) * 1.05;
  const lo = Math.min(...vals) * 0.95;
  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (pts.length - 1);
  const y = (v: number) => PAD + (H - PAD * 2) * (1 - (v - lo) / (hi - lo || 1));
  const line = pts.map((p, i) => `${i ? "L" : "M"} ${x(i).toFixed(1)} ${y(p.est1RM).toFixed(1)}`).join(" ");
  const dots = pts.map((p, i) => `
    <circle cx="${x(i).toFixed(1)}" cy="${y(p.est1RM).toFixed(1)}" r="${p.isPR ? 3.5 : 1.8}"
            fill="${p.isPR ? "var(--soma-warn)" : "var(--soma-accent-text)"}"/>`).join("");

  return `
    <svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:120px;display:block">
      <path d="${line}" fill="none" stroke="var(--soma-accent-text)" stroke-width="2"
            stroke-linejoin="round" stroke-linecap="round"/>
      ${dots}
    </svg>
    <div class="chart-legend">
      <span>${pts[0].date}</span><span>orange = PR</span><span>${pts[pts.length - 1].date}</span>
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
      host.addEventListener("change", (e) => {
        const el = e.target as HTMLSelectElement;
        if (el.id !== "strength-pick") return;
        strengthPick = el.value;
        void view(host);
      });
    }
  }
};
