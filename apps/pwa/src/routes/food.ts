// ============================================================================
// Food — macro diary, water, bodyweight, and the barcode scanner.
// ============================================================================

import type { Route } from "../lib/router";
import { getLocalDateKey, DEFAULT_GOALS, BASE_FOOD_LIBRARY, SomaIntelligenceEngine } from "@soma/core";
import { getRecord, putRecord, getMeta, setMeta, asKeyedObject } from "../lib/db";
import { startScanner, lookupBarcode, type ScanHandle } from "../lib/barcode";
import { toast } from "../lib/toast";

interface Item { name: string; meal: string; serving: number; cals: number; p: number; f: number; c: number }
interface FoodDay { items: Item[]; water: number; bodyWeight: number | null; goals: any }

const MEALS = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const today = () => getLocalDateKey(new Date());

let day: FoodDay | null = null;

async function load(): Promise<FoodDay> {
  const stored = await getRecord<FoodDay>("food", today());
  const goals = await getMeta<any>("goals", { ...DEFAULT_GOALS });
  return stored ?? { items: [], water: 0, bodyWeight: null, goals };
}

const save = () => day ? putRecord<FoodDay>("food", today(), day) : Promise.resolve();

const sum = (items: Item[], k: keyof Item) =>
  Math.round(items.reduce((a, i) => a + (Number(i[k]) || 0), 0));

function ring(label: string, done: number, goal: number, color: string): string {
  const pct = goal > 0 ? Math.min(100, (done / goal) * 100) : 0;
  return `
    <div class="macro">
      <div class="macro-top"><span>${label}</span><span class="faint">${done} / ${goal}</span></div>
      <div class="macro-bar"><div class="macro-fill" style="width:${pct}%;background:${color}"></div></div>
    </div>`;
}

async function view(host: HTMLElement): Promise<void> {
  if (!day) day = await load();
  const g = day.goals ?? DEFAULT_GOALS;

  const cals = sum(day.items, "cals");
  const p = sum(day.items, "p");
  const f = sum(day.items, "f");
  const c = sum(day.items, "c");

  const byMeal = MEALS.map(meal => {
    const items = day!.items.filter(i => i.meal === meal);
    if (!items.length) return "";
    return `
      <div class="meal">
        <div class="meal-head">${meal}<span class="faint">${sum(items, "cals")} kcal</span></div>
        ${items.map((i) => `
          <div class="list-row">
            <span>${i.name}<span class="faint"> ${i.serving}g</span></span>
            <span class="list-right">
              <span class="faint">${Math.round(i.cals)}</span>
              <button class="x" data-act="del" data-i="${day!.items.indexOf(i)}"
                      aria-label="Remove ${i.name}">✕</button>
            </span>
          </div>`).join("")}
      </div>`;
  }).join("");

  // Maintenance from real data where there is enough of it, formula otherwise.
  const allFood = await asKeyedObject<any>("food");
  const nutritionLike: Record<string, any> = {};
  for (const [k, v] of Object.entries(allFood)) nutritionLike[k] = v;
  const tdee = SomaIntelligenceEngine.computeMaintenanceCalories(nutritionLike);
  const formula = SomaIntelligenceEngine.formulaMaintenance(day.bodyWeight ?? 75);

  host.innerHTML = `
    <h1>Food</h1>

    <div class="card">
      <div class="totals">
        <div><span class="big-num">${cals}</span><span class="stat-lbl">eaten</span></div>
        <div><span class="big-num accent-text">${Math.max(0, g.cals - cals)}</span><span class="stat-lbl">left</span></div>
      </div>
      ${ring("Protein", p, g.protein, "var(--soma-accent)")}
      ${ring("Carbs", c, g.carbs, "var(--soma-info)")}
      ${ring("Fat", f, g.fat, "var(--soma-warn)")}
    </div>

    <div class="row-actions">
      <button class="btn accent" data-act="scan">📷 Scan barcode</button>
      <button class="btn" data-act="add">+ Add food</button>
    </div>

    ${byMeal || `<div class="card"><p class="muted">Nothing logged today.</p></div>`}

    <div class="card">
      <div class="card-title">💧 Water</div>
      <div class="totals"><div><span class="big-num">${day.water}</span><span class="stat-lbl">ml</span></div></div>
      <div class="row-actions" style="margin:8px 0 0">
        <button class="btn" data-act="w" data-ml="250">+250</button>
        <button class="btn" data-act="w" data-ml="500">+500</button>
        <button class="btn" data-act="w" data-ml="-250">−250</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">⚖️ Weight</div>
      <div class="stepper">
        <button class="btn" data-act="bw" data-d="-0.1">−</button>
        <input class="in big" id="bw" type="number" step="0.1" inputmode="decimal"
               placeholder="kg" value="${day.bodyWeight ?? ""}"/>
        <button class="btn" data-act="bw" data-d="0.1">+</button>
      </div>
      <button class="btn accent wide" data-act="save-bw" style="margin-top:10px">Save weight</button>
    </div>

    <div class="card">
      <div class="card-title">🔬 Maintenance</div>
      ${tdee && tdee.ok ? `
        <div class="list-row"><span>Measured from your data</span>
          <b class="accent-text">${tdee.maintenance} kcal</b></div>
        <div class="list-row"><span class="dim">Formula estimate</span>
          <span class="faint">${formula ?? "—"} kcal</span></div>
        <p class="faint" style="margin:8px 0 0">
          ${tdee.foodDays} logged days over ${tdee.days}: averaged <b>${tdee.avgIntake}</b> kcal
          while weight moved <b>${(tdee.weightDelta ?? 0) > 0 ? "+" : ""}${tdee.weightDelta ?? 0} kg</b>.
          Confidence: <b>${tdee.confidence}</b>.</p>`
      : `
        <div class="list-row"><span>Formula estimate</span><b>${formula ?? "—"} kcal</b></div>
        <p class="faint" style="margin:8px 0 0">${tdee?.reason ?? "Log weight and food for a couple of weeks and this becomes a measurement instead of a guess."}</p>`}
    </div>`;
}

// ------------------------------------------------------------- scanner -----

function openScanner(onDone: () => void): void {
  let handle: ScanHandle | null = null;
  const overlay = document.createElement("div");
  overlay.className = "scanner";
  overlay.innerHTML = `
    <div class="scan-bar"><span>Point at a barcode</span>
      <button class="lb-btn" data-s="close" aria-label="Close">✕</button></div>
    <video id="scan-video" class="scan-video" playsinline muted></video>
    <div class="scan-status" id="scan-status">Starting camera…</div>
    <div class="scan-manual">
      <input class="in" id="scan-code" inputmode="numeric" placeholder="Or type the barcode"/>
      <button class="btn accent" data-s="lookup">Look up</button>
    </div>`;
  document.body.appendChild(overlay);

  const status = overlay.querySelector<HTMLElement>("#scan-status")!;
  const video = overlay.querySelector<HTMLVideoElement>("#scan-video")!;

  const close = () => { handle?.stop(); overlay.remove(); };

  const resolve = async (code: string) => {
    status.textContent = `Looking up ${code}…`;
    const { hit, offline } = await lookupBarcode(code);
    if (offline) { status.textContent = "Offline — connect to look this up, or add it by hand."; return; }
    if (!hit) { status.textContent = `Not in the database. Add "${code}" by hand instead.`; return; }
    if (hit.needsMacros) {
      status.textContent = `Found "${hit.name}" but it has no nutrition data. Add it by hand.`;
      return;
    }
    await addItem({
      name: hit.name, meal: currentMeal(), serving: 100,
      cals: hit.cals, p: hit.p, f: hit.f, c: hit.c
    });
    toast(`Added ${hit.name}`);
    close();
    onDone();
  };

  startScanner(
    video,
    (code) => { void resolve(code); },
    (msg) => { status.textContent = msg + " You can still type the number."; }
  ).then(h => {
    handle = h;
    if (status.textContent === "Starting camera…") status.textContent = "Scanning…";
  });

  overlay.addEventListener("click", (e) => {
    const s = (e.target as HTMLElement).closest<HTMLElement>("[data-s]")?.dataset.s;
    if (s === "close") close();
    if (s === "lookup") {
      const code = overlay.querySelector<HTMLInputElement>("#scan-code")?.value.trim();
      if (code) void resolve(code);
    }
  });
}

/** Meal inferred from the clock, so logging is one tap fewer. */
function currentMeal(): string {
  const h = new Date().getHours();
  return h < 11 ? "Breakfast" : h < 16 ? "Lunch" : h < 21 ? "Dinner" : "Snacks";
}

async function addItem(item: Item): Promise<void> {
  if (!day) day = await load();
  day.items.push(item);
  await save();
}

function openFoodPicker(onDone: () => void): void {
  const overlay = document.createElement("div");
  overlay.className = "picker";
  overlay.innerHTML = `
    <div class="picker-box">
      <input class="in" id="food-search" placeholder="Search foods…" autocomplete="off"/>
      <div class="picker-list" id="food-list"></div>
      <div class="picker-actions"><button class="btn" data-p="cancel">Cancel</button></div>
    </div>`;
  document.body.appendChild(overlay);

  const list = overlay.querySelector("#food-list")!;
  const paint = (q: string) => {
    const items = (BASE_FOOD_LIBRARY as any[])
      .filter(x => x.name.toLowerCase().includes(q.toLowerCase())).slice(0, 60);
    list.innerHTML = items.length
      ? items.map(x => `
          <button class="pick-item" data-n="${x.name}">
            <span>${x.name}</span><span class="faint">${x.cals} kcal /100g</span>
          </button>`).join("")
      : `<p class="muted">No match. Scan a barcode instead.</p>`;
  };
  paint("");

  overlay.querySelector("#food-search")!
    .addEventListener("input", (e) => paint((e.target as HTMLInputElement).value));

  overlay.addEventListener("click", (e) => {
    void (async () => {
      const item = (e.target as HTMLElement).closest<HTMLElement>(".pick-item");
      if (item) {
        const src = (BASE_FOOD_LIBRARY as any[]).find(x => x.name === item.dataset.n);
        if (src) {
          await addItem({
            name: src.name, meal: currentMeal(), serving: 100,
            cals: src.cals, p: src.p, f: src.f, c: src.c
          });
          toast(`Added ${src.name}`);
        }
        overlay.remove();
        onDone();
        return;
      }
      if ((e.target as HTMLElement).closest("[data-p]")) overlay.remove();
    })();
  });
}

export const foodRoute: Route = {
  id: "food",
  label: "Food",
  icon: "🍽️",
  async render(host) {
    void setMeta("lastTab", "food");
    day = await load();
    await view(host);

    if (!(host as any).__foodWired) {
      (host as any).__foodWired = true;
      const rerender = () => { void view(host); };

      host.addEventListener("click", (e) => {
        void (async () => {
          const b = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
          if (!b || !day) return;
          const act = b.dataset.act;

          if (act === "scan") { openScanner(rerender); return; }
          if (act === "add") { openFoodPicker(rerender); return; }
          if (act === "del") {
            day.items.splice(Number(b.dataset.i), 1);
            await save(); rerender(); return;
          }
          if (act === "w") {
            day.water = Math.max(0, day.water + Number(b.dataset.ml));
            await save(); rerender(); return;
          }
          if (act === "bw") {
            const input = host.querySelector<HTMLInputElement>("#bw");
            if (input) {
              const next = Math.max(0, (parseFloat(input.value) || 0) + Number(b.dataset.d));
              input.value = (Math.round(next * 10) / 10).toFixed(1);
            }
            return;
          }
          if (act === "save-bw") {
            const v = parseFloat(host.querySelector<HTMLInputElement>("#bw")?.value ?? "");
            if (isNaN(v) || v <= 0) { toast("Enter a valid weight."); return; }
            day.bodyWeight = Math.round(v * 10) / 10;
            // Protein scales with bodyweight, so a new weigh-in moves the target.
            const perKg = await getMeta<number>("proteinPerKg", 0);
            if (perKg > 0) {
              const t = SomaIntelligenceEngine.proteinTargetFor(day.bodyWeight, perKg);
              if (t) day.goals = { ...day.goals, protein: t };
            }
            await save();
            toast(`Weight saved: ${day.bodyWeight} kg`);
            rerender();
          }
        })();
      });
    }
  }
};
