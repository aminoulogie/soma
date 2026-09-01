// ============================================================================
// Habits — the photo calendar.
//
// A month grid, one cell per day, each cell showing that day's photo as its
// thumbnail. Tap an empty day to add one, tap a filled day to view it.
//
// Only thumbnails are read to paint the grid; the full-size derivative is
// fetched lazily when a day is actually opened.
// ============================================================================

import type { Route } from "../lib/router";
import { getLocalDateKey, DEFAULT_HABITS } from "@soma/core";
import { photoThumbsForMonth, getPhoto, deletePhoto, getMeta, setMeta } from "../lib/db";
import { captureFor, pickImage, ObjectUrlPool } from "../lib/photos";
import { toast } from "../lib/toast";

const MONTHS = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"];
const DOW = ["M", "T", "W", "T", "F", "S", "S"];

interface HabitLike { id: string; name: string; icon?: string }

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

async function habits(): Promise<HabitLike[]> {
  const stored = await getMeta<HabitLike[] | null>("habits", null);
  return stored && stored.length ? stored : (DEFAULT_HABITS as HabitLike[]);
}

function shift(delta: number): void {
  let m = viewMonth + delta;
  let y = viewYear;
  if (m < 0) { m = 11; y -= 1; }
  if (m > 11) { m = 0; y += 1; }
  viewMonth = m;
  viewYear = y;
}

async function openDay(habitId: string, date: string, rerender: () => void): Promise<void> {
  const existing = await getPhoto(habitId, date);

  if (!existing) {
    const file = await pickImage();
    if (!file) return;
    try {
      const r = await captureFor(habitId, date, file);
      toast(`Saved — ${Math.round(r.displayBytes / 1024)} KB`);
      rerender();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Could not save that photo.");
    }
    return;
  }

  // Lightbox. Built here rather than as a route so the calendar stays behind
  // it and closing does not re-fetch the whole month.
  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  const url = pool.create(existing.display);
  overlay.innerHTML = `
    <div class="lightbox-bar">
      <span>${date}</span>
      <button class="lb-btn" data-act="close" aria-label="Close">✕</button>
    </div>
    <img src="${url}" alt="Photo from ${date}" />
    <div class="lightbox-actions">
      <button class="lb-btn danger" data-act="delete">Delete</button>
      <button class="lb-btn" data-act="replace">Replace</button>
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
      if (act === "delete") {
        await deletePhoto(habitId, date);
        close();
        toast("Photo deleted");
        rerender();
        return;
      }
      if (act === "replace") {
        const file = await pickImage();
        if (!file) return;
        await captureFor(habitId, date, file);
        close();
        toast("Photo replaced");
        rerender();
      }
    })();
  });

  document.body.appendChild(overlay);
}

async function renderCalendar(host: HTMLElement): Promise<void> {
  // Every repaint invalidates the previous month's object URLs.
  pool.releaseAll();

  const list = await habits();
  if (!activeHabitId || !list.some(h => h.id === activeHabitId)) {
    activeHabitId = list[0]?.id ?? null;
  }
  const habitId = activeHabitId;

  const rerender = () => { void renderCalendar(host); };

  if (!habitId) {
    host.innerHTML = `<h1>Habits</h1><div class="card"><p class="muted">No habits yet.</p></div>`;
    return;
  }

  const thumbs = await photoThumbsForMonth(habitId, viewYear, viewMonth);
  const today = getLocalDateKey(new Date());
  const total = daysInMonth(viewYear, viewMonth);
  const blanks = leadingBlanks(viewYear, viewMonth);

  const cells: string[] = [];
  for (let i = 0; i < blanks; i++) cells.push(`<div class="cal-cell is-blank"></div>`);

  for (let d = 1; d <= total; d++) {
    const date = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const thumb = thumbs.get(date);
    const isToday = date === today;
    const isFuture = date > today;

    const bg = thumb
      ? `<img class="cal-img" src="${pool.create(thumb)}" alt="" loading="lazy" />`
      : "";

    cells.push(`
      <button class="cal-cell ${thumb ? "has-photo" : ""} ${isToday ? "is-today" : ""}"
              data-date="${date}" ${isFuture ? "disabled" : ""}
              aria-label="${date}${thumb ? ", has photo" : ""}">
        ${bg}<span class="cal-num">${d}</span>
      </button>`);
  }

  const filled = thumbs.size;
  const options = list.map(h =>
    `<option value="${h.id}" ${h.id === habitId ? "selected" : ""}>${h.icon ?? ""} ${h.name}</option>`
  ).join("");

  host.innerHTML = `
    <h1>Habits</h1>

    <div class="card">
      <select class="habit-select" id="habit-pick">${options}</select>

      <div class="cal-head">
        <button class="cal-nav" data-shift="-1" aria-label="Previous month">‹</button>
        <div class="cal-title">
          <strong>${MONTHS[viewMonth]} ${viewYear}</strong>
          <span class="faint">${filled} photo${filled === 1 ? "" : "s"}</span>
        </div>
        <button class="cal-nav" data-shift="1" aria-label="Next month">›</button>
      </div>

      <div class="cal-dow">${DOW.map(d => `<span>${d}</span>`).join("")}</div>
      <div class="cal-grid">${cells.join("")}</div>
      <p class="faint cal-hint">Tap a day to add a photo. Tap one you have to view it.</p>
    </div>`;

  host.querySelector("#habit-pick")?.addEventListener("change", (e) => {
    activeHabitId = (e.target as HTMLSelectElement).value;
    rerender();
  });

  for (const btn of Array.from(host.querySelectorAll<HTMLElement>("[data-shift]"))) {
    btn.addEventListener("click", () => {
      shift(Number(btn.dataset.shift));
      rerender();
    });
  }

  // One delegated listener rather than 31, so re-rendering stays cheap.
  host.querySelector(".cal-grid")?.addEventListener("click", (e) => {
    const cell = (e.target as HTMLElement).closest<HTMLElement>(".cal-cell[data-date]");
    if (!cell || (cell as HTMLButtonElement).disabled) return;
    const date = cell.dataset.date;
    if (date) void openDay(habitId, date, rerender);
  });
}

export const habitsRoute: Route = {
  id: "habits",
  label: "Habits",
  icon: "🎯",
  render(host) {
    void setMeta("lastTab", "habits");
    return renderCalendar(host);
  }
};
