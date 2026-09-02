// ============================================================================
// Habits — ticking, streaks, and the photo calendar.
//
// Two different actions live here and they want different affordances. Ticking
// today is the thing you do every day, so it is one tap on a chip at the top.
// Photos and back-filling are review actions, so they live behind a day sheet
// on the calendar — one tap to open, one to act.
//
// Ticks are stored per DAY (`habits:2026-09-02` -> { habitId: true }) to match
// the rest of the app's storage, but `calculateHabitStats` in @soma/core wants
// per-HABIT history (`{ "2026-09-02": true }`). The pivot happens here rather
// than in the store, so the engine stays the single source of streak logic.
// ============================================================================

import type { Route } from "../lib/router";
import {
  getLocalDateKey, addDays, DEFAULT_HABITS, calculateHabitStats
} from "@soma/core";
import {
  photoThumbsForMonth, getPhoto, deletePhoto, getMeta, setMeta,
  getRecord, putRecord, deleteRecord, asKeyedObject
} from "../lib/db";
import { captureFor, pickImage, ObjectUrlPool } from "../lib/photos";
import { toast } from "../lib/toast";

const MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
const DOW = ["M", "T", "W", "T", "F", "S", "S"];

interface HabitLike {
  id: string;
  name: string;
  icon?: string;
  desc?: string;
  color?: string;
  goalDaysPerWeek?: number;
}

/** One day's ticks: habit id -> done. Absent ids are simply not done. */
type DayTicks = Record<string, boolean>;

// View state survives re-renders within a session but not a reload — the
// calendar should open on the current month every time you come back to it.
let viewYear = new Date().getFullYear();
let viewMonth = new Date().getMonth();
let activeHabitId: string | null = null;

const pool = new ObjectUrlPool();

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

/** Monday-first offset for the 1st of the month. */
function leadingBlanks(y: number, m: number): number {
  return (new Date(y, m, 1).getDay() + 6) % 7;
}

function dateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

async function habits(): Promise<HabitLike[]> {
  const stored = await getMeta<HabitLike[] | null>("habits", null);
  return stored && stored.length ? stored : (DEFAULT_HABITS as HabitLike[]);
}

// ------------------------------------------------------------------ ticks ---

async function ticksOn(date: string): Promise<DayTicks> {
  return (await getRecord<DayTicks>("habits", date)) ?? {};
}

async function setTick(habitId: string, date: string, done: boolean): Promise<void> {
  const day = await ticksOn(date);
  if (done) day[habitId] = true;
  else delete day[habitId];

  // An empty day is deleted rather than stored as `{}`. Otherwise untick-then-
  // retick would leave a trail of empty records that the review screen would
  // read as "there was activity here".
  if (Object.keys(day).length === 0) await deleteRecord("habits", date);
  else await putRecord("habits", date, day);
}

/** All ticks pivoted from day-keyed to habit-keyed, which is what stats want. */
async function historyByHabit(): Promise<Record<string, Record<string, true>>> {
  const byDate = await asKeyedObject<DayTicks>("habits");
  const out: Record<string, Record<string, true>> = {};
  for (const [date, day] of Object.entries(byDate)) {
    for (const [habitId, done] of Object.entries(day)) {
      if (!done) continue;
      (out[habitId] ??= {})[date] = true;
    }
  }
  return out;
}

/** Ticks in the last 7 days, for goal-per-week progress. */
function doneThisWeek(history: Record<string, true>): number {
  const today = new Date();
  let n = 0;
  for (let i = 0; i < 7; i++) {
    if (history[getLocalDateKey(addDays(today, -i))]) n++;
  }
  return n;
}

function shift(delta: number): void {
  let m = viewMonth + delta;
  let y = viewYear;
  if (m < 0) { m = 11; y -= 1; }
  if (m > 11) { m = 0; y += 1; }
  viewMonth = m;
  viewYear = y;
}

// -------------------------------------------------------------- day sheet ---

/**
 * The sheet for one day of one habit: tick it, and add or view its photo.
 * Built imperatively rather than as a route so the calendar stays mounted
 * behind it and closing does not re-fetch the month.
 */
async function openDay(
  habit: HabitLike, date: string, rerender: () => void
): Promise<void> {
  const [photo, day] = await Promise.all([getPhoto(habit.id, date), ticksOn(date)]);
  const done = day[habit.id] === true;

  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  const url = photo ? pool.create(photo.display) : null;

  overlay.innerHTML = `
    <div class="lightbox-bar">
      <span>${habit.icon ?? ""} ${date}</span>
      <button class="lb-btn" data-act="close" aria-label="Close">✕</button>
    </div>
    ${url
      ? `<img src="${url}" alt="Photo from ${date}" />`
      : `<div class="lb-empty"><span>No photo for this day</span></div>`}
    <div class="lightbox-actions">
      <button class="lb-btn ${done ? "on" : ""}" data-act="toggle">
        ${done ? "✓ Done" : "Mark done"}
      </button>
      <button class="lb-btn" data-act="photo">${photo ? "Replace" : "Add photo"}</button>
      ${photo ? `<button class="lb-btn danger" data-act="delete">Delete photo</button>` : ""}
    </div>`;

  const close = () => overlay.remove();

  overlay.addEventListener("click", (e) => {
    void (async () => {
      const act = (e.target as HTMLElement).closest<HTMLElement>("[data-act]")?.dataset.act;
      if (!act) {
        // Tapping the backdrop closes; tapping the image itself should not.
        if (e.target === overlay) close();
        return;
      }
      if (act === "close") { close(); return; }

      if (act === "toggle") {
        await setTick(habit.id, date, !done);
        close();
        rerender();
        return;
      }

      if (act === "delete") {
        await deletePhoto(habit.id, date);
        close();
        toast("Photo deleted");
        rerender();
        return;
      }

      if (act === "photo") {
        const file = await pickImage();
        if (!file) return;
        try {
          const r = await captureFor(habit.id, date, file);
          close();
          toast(`Saved — ${Math.round(r.displayBytes / 1024)} KB`);
          rerender();
        } catch (err) {
          toast(err instanceof Error ? err.message : "Could not save that photo.");
        }
      }
    })();
  });

  document.body.appendChild(overlay);
}

// ----------------------------------------------------------------- render ---

async function renderHabits(host: HTMLElement): Promise<void> {
  // Every repaint invalidates the previous month's object URLs.
  pool.releaseAll();

  const list = await habits();
  if (!activeHabitId || !list.some(h => h.id === activeHabitId)) {
    activeHabitId = list[0]?.id ?? null;
  }

  const rerender = () => { void renderHabits(host); };

  if (!activeHabitId) {
    host.innerHTML = `<h1>Habits</h1><div class="card"><p class="muted">No habits yet.</p></div>`;
    return;
  }

  const habit = list.find(h => h.id === activeHabitId)!;
  const today = getLocalDateKey(new Date());

  const [allHistory, todayTicks, thumbs] = await Promise.all([
    historyByHabit(),
    ticksOn(today),
    photoThumbsForMonth(habit.id, viewYear, viewMonth)
  ]);

  const history = allHistory[habit.id] ?? {};
  // calculateHabitStats mutates `habit.history` when it is missing, so it gets
  // a throwaway object rather than the stored habit definition.
  const stats = calculateHabitStats({ history });

  const goal = habit.goalDaysPerWeek ?? 7;
  const week = doneThisWeek(history);
  const goalPct = Math.min(100, Math.round((week / goal) * 100));

  // -- today's chips ---------------------------------------------------------
  const chips = list.map(h => {
    const s = calculateHabitStats({ history: allHistory[h.id] ?? {} });
    const on = todayTicks[h.id] === true;
    return `
      <button class="hb-chip ${on ? "on" : ""}" data-tick="${h.id}"
              aria-pressed="${on}" aria-label="${h.name}">
        <span class="hb-ico">${h.icon ?? "•"}</span>
        <span class="hb-name">${h.name}</span>
        <span class="hb-streak">${s.currentStreak > 0 ? `🔥 ${s.currentStreak}` : ""}</span>
      </button>`;
  }).join("");

  // -- calendar --------------------------------------------------------------
  const total = daysInMonth(viewYear, viewMonth);
  const blanks = leadingBlanks(viewYear, viewMonth);
  const cells: string[] = [];
  for (let i = 0; i < blanks; i++) cells.push(`<div class="cal-cell is-blank"></div>`);

  let monthDone = 0;
  for (let d = 1; d <= total; d++) {
    const date = dateKey(viewYear, viewMonth, d);
    const thumb = thumbs.get(date);
    const isDone = history[date] === true;
    if (isDone) monthDone++;

    cells.push(`
      <button class="cal-cell ${thumb ? "has-photo" : ""} ${isDone ? "is-done" : ""} ${date === today ? "is-today" : ""}"
              data-date="${date}" ${date > today ? "disabled" : ""}
              aria-label="${date}${isDone ? ", done" : ""}${thumb ? ", has photo" : ""}">
        ${thumb ? `<img class="cal-img" src="${pool.create(thumb)}" alt="" loading="lazy" />` : ""}
        <span class="cal-num">${d}</span>
        ${thumb ? `<span class="cal-dot" aria-hidden="true">📷</span>` : ""}
      </button>`);
  }

  const options = list.map(h =>
    `<option value="${h.id}" ${h.id === habit.id ? "selected" : ""}>${h.icon ?? ""} ${h.name}</option>`
  ).join("");

  host.innerHTML = `
    <h1>Habits</h1>

    <div class="card">
      <div class="card-title">Today</div>
      <div class="hb-chips">${chips}</div>
    </div>

    <div class="card">
      <select class="habit-select" id="habit-pick">${options}</select>
      ${habit.desc ? `<p class="muted hb-desc">${habit.desc}</p>` : ""}

      <div class="stat-grid four">
        <div class="stat"><div class="stat-lbl">Streak</div><div class="stat-val">${stats.currentStreak}</div></div>
        <div class="stat"><div class="stat-lbl">Best</div><div class="stat-val">${stats.bestStreak}</div></div>
        <div class="stat"><div class="stat-lbl">7-day</div><div class="stat-val">${stats.weekRate}%</div></div>
        <div class="stat"><div class="stat-lbl">Total</div><div class="stat-val">${stats.totalCompletions}</div></div>
      </div>

      <div class="macro">
        <div class="macro-top">
          <span>Weekly goal</span>
          <span class="${week >= goal ? "accent-text" : "dim"}">${week} / ${goal} days</span>
        </div>
        <div class="macro-bar">
          <div class="macro-fill" style="width:${goalPct}%;background:${habit.color ?? "var(--soma-accent)"}"></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="cal-head">
        <button class="cal-nav" data-shift="-1" aria-label="Previous month">‹</button>
        <div class="cal-title">
          <strong>${MONTHS[viewMonth]} ${viewYear}</strong>
          <span class="faint">${monthDone} day${monthDone === 1 ? "" : "s"} done · ${thumbs.size} photo${thumbs.size === 1 ? "" : "s"}</span>
        </div>
        <button class="cal-nav" data-shift="1" aria-label="Next month">›</button>
      </div>

      <div class="cal-dow">${DOW.map(d => `<span>${d}</span>`).join("")}</div>
      <div class="cal-grid">${cells.join("")}</div>
      <p class="faint cal-hint">Tap a day to tick it or attach a photo.</p>
    </div>`;

  host.querySelector("#habit-pick")?.addEventListener("change", (e) => {
    activeHabitId = (e.target as HTMLSelectElement).value;
    rerender();
  });

  // One delegated listener per region rather than one per cell, so repainting
  // a 31-day grid stays cheap.
  host.querySelector(".hb-chips")?.addEventListener("click", (e) => {
    const chip = (e.target as HTMLElement).closest<HTMLElement>("[data-tick]");
    const id = chip?.dataset.tick;
    if (!id) return;
    void (async () => {
      await setTick(id, today, todayTicks[id] !== true);
      rerender();
    })();
  });

  for (const btn of Array.from(host.querySelectorAll<HTMLElement>("[data-shift]"))) {
    btn.addEventListener("click", () => {
      shift(Number(btn.dataset.shift));
      rerender();
    });
  }

  host.querySelector(".cal-grid")?.addEventListener("click", (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>(".cal-cell[data-date]");
    if (!cell || (cell as HTMLButtonElement).disabled) return;
    const date = cell.dataset.date;
    if (date) void openDay(habit, date, rerender);
  });
}

export const habitsRoute: Route = {
  id: "habits",
  label: "Habits",
  icon: "🎯",
  render(host) {
    void setMeta("lastTab", "habits");
    return renderHabits(host);
  }
};
