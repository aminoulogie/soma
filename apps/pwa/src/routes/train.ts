// ============================================================================
// Train — the workout logger.
//
// Works on the structured model from @soma/core: exercises and supersets are
// blocks, drops chain onto their parent set. What gets *saved* is the flat
// vault shape, so the Obsidian plugin reads these sessions unchanged.
// ============================================================================

import type { Route } from "../lib/router";
import {
  getLocalDateKey, BASE_EXERCISE_DB, ROUTINE_PRESETS,
  makeSession, makeSet, makeDrop, makeExerciseBlock, makeSupersetBlock,
  eachExercise, nextAfter, toLegacySession, fromLegacySession,
  SET_WARMUP, SET_WORKING, SomaIntelligenceEngine,
  exerciseUsesBar, DEFAULT_BAR_WEIGHT
} from "@soma/core";
import { getRecord, putRecord, getMeta, setMeta } from "../lib/db";
import { toast } from "../lib/toast";
import {
  loadCoachContext, targetFor, alternativesFor, loadingFor, prFor,
  type CoachContext, type Target
} from "../lib/coach";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Session = any;
type Block = any;
type WorkSet = any;

const today = () => getLocalDateKey(new Date());

let session: Session | null = null;
let restEndsAt: number | null = null;
let restLabel = "";
let restTimer: number | null = null;

// Loaded once per visit to the tab. Recomputing readiness and trends on every
// keystroke would re-scan the whole history to redraw a number that cannot
// have changed.
let ctx: CoachContext | null = null;

/**
 * Exercise metadata as a session should store it. The database has no
 * `usesBar` field, so it is inferred here — without it the logger records
 * every barbell lift a bar's weight light, and volume, estimated 1RM and
 * personal records all inherit the error.
 */
function withBar(meta: any): any {
  const usesBar = exerciseUsesBar(meta.name);
  return { ...meta, usesBar, barWeight: usesBar ? DEFAULT_BAR_WEIGHT : 0 };
}

// --------------------------------------------------------------- loading ----

async function loadSession(): Promise<Session> {
  const stored = await getRecord<any>("workout", today());
  // Stored in the vault's flat shape; the model is what we edit.
  if (stored) return fromLegacySession(stored, today());
  return makeSession(today(), "");
}

async function save(): Promise<void> {
  if (!session) return;
  const bodyWeight = await getMeta<number>("bodyWeight", 75);
  const elapsed = Math.max(0, Date.now() - (session.startedAt || Date.now()));
  const mins = Math.floor(elapsed / 60000);
  const legacy = toLegacySession(session, {
    bodyWeight,
    durationFormatted: `${mins}m`
  });
  await putRecord("workout", today(), legacy);
}

// ------------------------------------------------------------ rest timer ----

function startRest(seconds: number, label: string, rerender: () => void): void {
  if (seconds <= 0) { restEndsAt = null; restLabel = ""; rerender(); return; }
  restEndsAt = Date.now() + seconds * 1000;
  restLabel = label;
  if (restTimer) window.clearInterval(restTimer);
  restTimer = window.setInterval(() => {
    if (!restEndsAt || Date.now() >= restEndsAt) {
      restEndsAt = null;
      if (restTimer) window.clearInterval(restTimer);
      restTimer = null;
    }
    const el = document.getElementById("rest-bar");
    if (el) paintRest(el);
  }, 250);
  rerender();
}

function paintRest(el: HTMLElement): void {
  if (!restEndsAt) { el.hidden = true; return; }
  const left = Math.max(0, Math.ceil((restEndsAt - Date.now()) / 1000));
  el.hidden = false;
  el.innerHTML = `
    <span>${restLabel}</span>
    <strong>${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}</strong>
    <button class="rest-skip" data-act="skip-rest">Skip</button>`;
}

// ------------------------------------------------------- readiness check ----

// Today's soreness and stress. Sleep comes from the Sleep tab, so the check-in
// only asks for what nothing else already knows.

/** Names where the readiness figure came from, so a number is never unexplained. */
function readinessBlurb(): string {
  if (!ctx) return "";
  if (ctx.subjective === null) {
    return "Log sleep, or rate soreness and stress, to autoregulate today's targets.";
  }
  const from = ctx.subjectiveFrom;
  const list = from.length > 1
    ? `${from.slice(0, -1).join(", ")} and ${from[from.length - 1]}`
    : from[0];
  return `From ${list}. Targets below are adjusted to it.`;
}

// ----------------------------------------------------------------- render ---

function setRow(blockId: string, exIdx: number, setIdx: number, s: WorkSet): string {
  const isWarm = s.type === SET_WARMUP;
  // Warm-ups and drops are not working sets, so they must not consume a
  // working-set number — "Set 3" would otherwise mean different things
  // depending on how you warmed up.
  const label = isWarm ? "W" : String(setIdx + 1);

  const drops = (s.drops || []).map((d: any, di: number) => `
    <div class="set-row is-drop">
      <span class="set-no">↳</span>
      <input class="in" type="number" inputmode="decimal" placeholder="kg"
             value="${d.weight ?? ""}" data-f="dw" data-b="${blockId}" data-e="${exIdx}" data-s="${setIdx}" data-d="${di}" />
      <input class="in" type="number" inputmode="numeric" placeholder="reps"
             value="${d.reps ?? ""}" data-f="dr" data-b="${blockId}" data-e="${exIdx}" data-s="${setIdx}" data-d="${di}" />
      <span class="rpe-spacer"></span>
      <button class="tick ${d.done ? "on" : ""}" data-act="drop-done"
              data-b="${blockId}" data-e="${exIdx}" data-s="${setIdx}" data-d="${di}"
              aria-label="Mark drop done">✓</button>
    </div>`).join("");

  return `
    <div class="set-row ${s.done ? "is-done" : ""} ${isWarm ? "is-warm" : ""}">
      <button class="set-no" data-act="cycle-type" data-b="${blockId}" data-e="${exIdx}" data-s="${setIdx}"
              title="Working set / warm-up">${label}</button>
      <input class="in" type="number" inputmode="decimal" placeholder="kg"
             value="${s.weight ?? ""}" data-f="w" data-b="${blockId}" data-e="${exIdx}" data-s="${setIdx}" />
      <input class="in" type="number" inputmode="numeric" placeholder="reps"
             value="${s.reps ?? ""}" data-f="r" data-b="${blockId}" data-e="${exIdx}" data-s="${setIdx}" />
      <select class="in rpe" data-f="rpe" data-b="${blockId}" data-e="${exIdx}" data-s="${setIdx}">
        ${[1, 2, 3, 4, 5].map(n =>
          `<option value="${n}" ${Number(s.rpe) === n ? "selected" : ""}>${n}</option>`).join("")}
      </select>
      <button class="tick ${s.done ? "on" : ""}" data-act="set-done"
              data-b="${blockId}" data-e="${exIdx}" data-s="${setIdx}"
              aria-label="Mark set done">✓</button>
    </div>
    ${drops}
    <button class="add-drop" data-act="add-drop" data-b="${blockId}" data-e="${exIdx}" data-s="${setIdx}">
      + drop set
    </button>`;
}

/**
 * What to lift, and why. The "why" is the point — a bare number gives you no
 * way to tell a deload from a stall from a normal week, so the tier badge and
 * the autoregulator's note ride along with it.
 */
function targetStrip(exercise: any): string {
  if (!ctx) return "";
  const t: Target = targetFor(ctx, exercise);
  const unit = ctx.unit;
  const load = exercise.isBW || !t.weight ? "BW" : `${t.weight}${unit}`;
  const tone = t.adjusted ? "warn" : "";

  return `
    <button class="tgt ${tone}" data-act="loading" data-n="${exercise.name}"
            aria-label="Target and loading for ${exercise.name}">
      <span class="tgt-main">
        <span class="tgt-lbl">Target</span>
        <strong>${load} × ${t.reps}</strong>
      </span>
      <span class="tgt-tier">${t.diffTier}</span>
      ${t.readiness !== null ? `<span class="tgt-rdy">${t.readiness}%</span>` : ""}
    </button>
    ${t.autoNote ? `<p class="tgt-note">${t.autoNote}</p>` : ""}`;
}

function exerciseCard(block: Block, exIdx: number, exercise: any, sets: WorkSet[]): string {
  const isSuper = block.kind === "superset";
  return `
    <div class="ex-card ${isSuper ? "in-superset" : ""}">
      <div class="ex-head">
        <span class="ex-name">${exercise.name}</span>
        ${isSuper ? `<span class="ss-tag">${block.label}</span>` : ""}
        <button class="ex-del" data-act="del-block" data-b="${block.id}" aria-label="Remove">✕</button>
      </div>
      ${targetStrip(exercise)}
      <div class="set-head"><span>SET</span><span>KG</span><span>REPS</span><span>RPE</span><span></span></div>
      ${sets.map((s, i) => setRow(block.id, exIdx, i, s)).join("")}
      <button class="add-set" data-act="add-set" data-b="${block.id}" data-e="${exIdx}">+ Add set</button>
    </div>`;
}

function render(host: HTMLElement): void {
  if (!session) return;

  const blocks = session.blocks.map((b: Block) => {
    if (b.kind === "superset") {
      return `
        <div class="superset">
          <div class="ss-bar">🔗 Superset ${b.label} · ${b.members.length} exercises, no rest between</div>
          ${b.members.map((m: any, i: number) => exerciseCard(b, i, m.exercise, m.sets)).join("")}
        </div>`;
    }
    return exerciseCard(b, 0, b.exercise, b.sets);
  }).join("");

  const doneSets = eachExercise(session)
    .flatMap((e: any) => e.sets)
    .filter((s: WorkSet) => s.done && s.type === SET_WORKING).length;

  const prog = ctx?.program;
  const subj = ctx?.subjective ?? null;

  host.innerHTML = `
    <h1>Train</h1>
    <div id="rest-bar" class="rest-bar" hidden></div>

    ${prog ? `
      <div class="card prog-card ${prog.isDeload ? "is-deload" : ""}">
        <div class="prog-top">
          <strong>${prog.split}</strong>
          <span class="prog-badge">${prog.phaseBadge ?? prog.phase ?? ""}</span>
        </div>
        <p class="faint">Week ${prog.weekNumber} · ${prog.repScheme ?? ""}${prog.isDeload ? " · deload — 60% load, stop well short" : ""}</p>
      </div>` : ""}

    <div class="card">
      <div class="card-title">
        Readiness ${subj !== null ? `<span class="rdy-val">${subj}%</span>` : ""}
      </div>
      <p class="faint">${readinessBlurb()}</p>
      <div class="chk-row">
        <span class="field-lbl">Soreness</span>
        <div class="quality-row">
          ${[1, 2, 3, 4, 5].map(n =>
            `<button class="q-dot ${ctx?.checkin.soreness === n ? "on" : ""}" data-chk="soreness" data-v="${n}">${n}</button>`).join("")}
        </div>
      </div>
      <div class="chk-row">
        <span class="field-lbl">Stress</span>
        <div class="quality-row">
          ${[1, 2, 3, 4, 5].map(n =>
            `<button class="q-dot ${ctx?.checkin.stress === n ? "on" : ""}" data-chk="stress" data-v="${n}">${n}</button>`).join("")}
        </div>
      </div>
    </div>

    <div class="card session-head">
      <select class="in split-pick" id="split-pick">
        <option value="">Choose a routine…</option>
        ${Object.keys(ROUTINE_PRESETS).map(r =>
          `<option value="${r}" ${session.split === r ? "selected" : ""}>${r}</option>`).join("")}
      </select>
      <div class="session-stats">
        <span><strong>${doneSets}</strong> sets done</span>
        <span><strong>${session.blocks.length}</strong> blocks</span>
      </div>
    </div>

    ${blocks || `<div class="card"><p class="muted">Nothing logged yet. Pick a routine, or add an exercise.</p></div>`}

    <div class="row-actions">
      <button class="btn" data-act="add-exercise">+ Exercise</button>
      <button class="btn" data-act="add-superset">+ Superset</button>
    </div>
    <button class="btn accent wide" data-act="finish">Finish session</button>`;

  const bar = document.getElementById("rest-bar");
  if (bar) paintRest(bar);
  // Listeners are attached once per host, not per render. render() only
  // replaces innerHTML, so re-wiring would stack a new set of handlers on the
  // same element every repaint — one tap would then toggle a set N times and
  // land back where it started on any even count.
  if (!wired.has(host)) {
    wired.add(host);
    wire(host, () => render(host));
  }
}

// ------------------------------------------------------------------ wiring --

function findSets(blockId: string, exIdx: number): WorkSet[] | null {
  const b = session.blocks.find((x: Block) => x.id === blockId);
  if (!b) return null;
  return b.kind === "superset" ? b.members[exIdx]?.sets ?? null : b.sets;
}

const wired = new WeakSet<HTMLElement>();

function wire(host: HTMLElement, rerender: () => void): void {
  // Typing must not re-render — that would blur the field mid-entry.
  host.addEventListener("input", (e) => {
    const el = e.target as HTMLInputElement;
    const f = el.dataset.f;
    if (!f) return;
    const sets = findSets(el.dataset.b!, Number(el.dataset.e));
    const set = sets?.[Number(el.dataset.s)];
    if (!set) return;
    const num = el.value === "" ? null : Number(el.value);
    if (f === "w") set.weight = num;
    if (f === "r") set.reps = num;
    if (f === "rpe") set.rpe = num;
    if (f === "dw" || f === "dr") {
      const d = set.drops[Number(el.dataset.d)];
      if (d) { if (f === "dw") d.weight = num; else d.reps = num; }
    }
    void save();
  });

  host.addEventListener("change", (e) => {
    const el = e.target as HTMLSelectElement;
    if (el.id === "split-pick") {
      const name = el.value;
      session.split = name;
      const preset = (ROUTINE_PRESETS as any)[name] || [];
      // Replacing blocks would discard anything already logged, so only seed
      // a routine into an empty session.
      if (preset.length && session.blocks.length === 0) {
        for (const item of preset) {
          const meta = BASE_EXERCISE_DB.find((x: any) => x.name === item.name) || { name: item.name, targetKeys: [] };
          session.blocks.push(makeExerciseBlock(withBar(meta), [makeSet(), makeSet(), makeSet()]));
        }
      }
      void save();
      rerender();
    }
  });

  // The readiness check-in reloads the context rather than patching it: every
  // target on screen is derived from that figure, so they all have to move.
  host.addEventListener("click", (e) => {
    const dot = (e.target as HTMLElement).closest<HTMLElement>("[data-chk]");
    if (!dot) return;
    const field = dot.dataset.chk as "soreness" | "stress";
    const value = Number(dot.dataset.v);
    void (async () => {
      const current = ctx?.checkin ?? { soreness: null, stress: null };
      // Tapping the selected value again clears it — otherwise a mis-tap is
      // permanent for the day.
      const next = { ...current, [field]: current[field] === value ? null : value };
      await putRecord("body", today(), next);
      ctx = await loadCoachContext();
      rerender();
    })();
  });

  host.addEventListener("click", (e) => {
    void (async () => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
      if (!btn) return;
      const act = btn.dataset.act;
      const blockId = btn.dataset.b ?? "";
      const exIdx = Number(btn.dataset.e ?? 0);
      const setIdx = Number(btn.dataset.s ?? 0);
      const sets = blockId ? findSets(blockId, exIdx) : null;

      if (act === "skip-rest") {
        restEndsAt = null;
        rerender();
        return;
      }

      if (act === "loading") {
        const name = btn.dataset.n;
        if (name) openLoading(name);
        return;
      }

      if (act === "set-done" && sets) {
        const set = sets[setIdx];
        set.done = !set.done;
        await save();
        if (set.done) {
          announcePR(blockId, exIdx, set);
          const next = nextAfter(session, blockId, exIdx, setIdx);
          if (next.kind === "superset-partner") {
            startRest(0, "", rerender);
            toast(`Straight into ${next.exercise.name}`);
          } else if (next.kind === "drop") {
            startRest(15, "Drop set — go", rerender);
          } else {
            // A warm-up does not earn a full working rest. The model knows the
            // difference; asking it beats a single flat duration for everything.
            const rest = SomaIntelligenceEngine.restForSet(
              exerciseAt(blockId, exIdx), set, [],
              { restDefault: ctx?.restDefault ?? 90 }
            );
            startRest(rest.seconds, next.reason ?? rest.reason, rerender);
          }
        }
        rerender();
        return;
      }

      if (act === "drop-done" && sets) {
        const d = sets[setIdx].drops[Number(btn.dataset.d)];
        if (d) d.done = !d.done;
        await save();
        rerender();
        return;
      }

      if (act === "cycle-type" && sets) {
        const set = sets[setIdx];
        set.type = set.type === SET_WORKING ? SET_WARMUP : SET_WORKING;
        await save();
        rerender();
        return;
      }

      if (act === "add-drop" && sets) {
        const set = sets[setIdx];
        const from = Number(set.weight) || 0;
        // Seed at ~80% of the parent, rounded to something loadable.
        set.drops.push(makeDrop({ weight: from ? Math.round(from * 0.8 / 2.5) * 2.5 : null }));
        await save();
        rerender();
        return;
      }

      if (act === "add-set" && sets) {
        const last = sets[sets.length - 1];
        sets.push(makeSet({ weight: last?.weight ?? null, reps: last?.reps ?? null }));
        await save();
        rerender();
        return;
      }

      if (act === "del-block") {
        session.blocks = session.blocks.filter((b: Block) => b.id !== blockId);
        await save();
        rerender();
        return;
      }

      if (act === "add-exercise" || act === "add-superset") {
        const picked = await pickExercises(act === "add-superset");
        if (!picked.length) return;
        if (act === "add-superset") {
          const label = String.fromCharCode(65 + session.blocks.filter((b: Block) => b.kind === "superset").length);
          session.blocks.push(makeSupersetBlock(label, picked.map(p => ({ exercise: withBar(p) })), 3));
        } else {
          session.blocks.push(makeExerciseBlock(withBar(picked[0]), [makeSet(), makeSet(), makeSet()]));
        }
        await save();
        rerender();
        return;
      }

      if (act === "finish") {
        session.finishedAt = Date.now();
        await save();
        toast("Session saved");
        rerender();
      }
    })();
  });
}

// ------------------------------------------------------------------- PRs ----

/** Finds which exercise a block/index pair refers to. */
function exerciseAt(blockId: string, exIdx: number): any | null {
  const b = session?.blocks.find((x: Block) => x.id === blockId);
  if (!b) return null;
  return b.kind === "superset" ? b.members[exIdx]?.exercise ?? null : b.exercise;
}

/**
 * Says so when a completed set beats what came before. The comparison runs
 * against history with today excluded, so the second set of a session is
 * measured against previous sessions rather than against the first set.
 */
function announcePR(blockId: string, exIdx: number, set: WorkSet): void {
  if (!ctx || set.type !== SET_WORKING) return;
  const exercise = exerciseAt(blockId, exIdx);
  if (!exercise) return;

  const bar = exercise.usesBar ? (exercise.barWeight || 20) : 0;
  const weight = (Number(set.weight) || 0) + bar;
  const pr = prFor(ctx, exercise.name, weight, set.reps);
  if (!pr) return;

  const kinds: string[] = [];
  if (pr.isWeightPR) kinds.push("heaviest");
  if (pr.isRepPR) kinds.push("most reps at that load");
  if (pr.isEst1RMPR) kinds.push(`est. 1RM ${pr.est1RM}${ctx.unit}`);
  toast(`🏆 ${exercise.name} — ${kinds.join(", ")}`);
}

// --------------------------------------------------------------- loading ----

/**
 * How to actually load the bar: plates per side, and the ramp up to the
 * working weight. Alternatives appear only when the muscle is fatigued
 * enough for the swap to be the point.
 */
function openLoading(name: string): void {
  if (!ctx) return;
  const meta = (BASE_EXERCISE_DB as any[]).find(x => x.name === name);
  if (!meta) return;
  const exercise = withBar(meta);

  const t = targetFor(ctx, exercise);
  const { bar, plates, ramp } = loadingFor(ctx, exercise, t.weight);
  const alts = (t.readiness !== null && t.readiness < 70) ? alternativesFor(ctx, exercise) : [];

  const plateRow = (list: any[]) => list.length
    ? list.map(p => `<span class="plate" style="background:${p.color}">${p.weight}</span>`).join("")
    : `<span class="faint">just the ${bar}${ctx!.unit} bar</span>`;

  const overlay = document.createElement("div");
  overlay.className = "picker";
  overlay.innerHTML = `
    <div class="picker-box">
      <div class="lightbox-bar">
        <span>${exercise.name}</span>
        <button class="lb-btn" data-p="cancel" aria-label="Close">✕</button>
      </div>
      <div class="picker-list">
        <div class="card-title">Target ${exercise.isBW || !t.weight ? "BW" : `${t.weight}${ctx.unit}`} × ${t.reps}</div>
        <p class="muted">${t.note}</p>
        ${t.autoNote ? `<p class="muted">${t.autoNote}</p>` : ""}

        ${bar ? `
          <div class="card-title">Plates per side</div>
          <div class="plate-row">${plateRow(plates)}</div>

          <div class="card-title">Warm-up ramp</div>
          ${ramp.map((r: any) => `
            <div class="list-row">
              <span>${r.pct}% · <strong>${r.weight}${ctx!.unit}</strong></span>
              <span class="plate-row">${plateRow(r.plates)}</span>
            </div>`).join("")}
        ` : `<p class="muted">Not a barbell lift — no plate maths to do.</p>`}

        ${alts.length ? `
          <div class="card-title">Fresher alternatives</div>
          <p class="faint">This muscle is at ${t.readiness}%. These train it with more left in the tank.</p>
          ${alts.map(a => `
            <div class="list-row">
              <span>${a.name}<br><span class="faint">${a.subTarget} · ${a.note}</span></span>
              <span class="accent-text bold">${a.readiness}%</span>
            </div>`).join("")}` : ""}
      </div>
    </div>`;

  overlay.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.closest("[data-p]") || target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
}

/** Exercise picker. Multi-select when building a superset. */
function pickExercises(multi: boolean): Promise<any[]> {
  return new Promise(resolve => {
    const chosen = new Set<string>();
    const overlay = document.createElement("div");
    overlay.className = "picker";
    overlay.innerHTML = `
      <div class="picker-box">
        <input class="in" id="pick-search" placeholder="Search exercises…" autocomplete="off" />
        <div class="picker-list" id="pick-list"></div>
        <div class="picker-actions">
          <button class="btn" data-p="cancel">Cancel</button>
          <button class="btn accent" data-p="ok">${multi ? "Add selected" : "Add"}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    const list = overlay.querySelector("#pick-list")!;
    const paint = (q: string) => {
      const items = (BASE_EXERCISE_DB as any[])
        .filter(x => x.name.toLowerCase().includes(q.toLowerCase()))
        .slice(0, 60);
      list.innerHTML = items.map(x => `
        <button class="pick-item ${chosen.has(x.name) ? "on" : ""}" data-n="${x.name}">
          <span>${x.name}</span><span class="faint">${x.subTarget ?? x.muscle ?? ""}</span>
        </button>`).join("");
    };
    paint("");

    overlay.querySelector("#pick-search")!
      .addEventListener("input", (e) => paint((e.target as HTMLInputElement).value));

    overlay.addEventListener("click", (e) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>(".pick-item");
      if (item) {
        const n = item.dataset.n!;
        if (multi) {
          chosen.has(n) ? chosen.delete(n) : chosen.add(n);
          item.classList.toggle("on");
        } else {
          overlay.remove();
          resolve([(BASE_EXERCISE_DB as any[]).find(x => x.name === n)]);
        }
        return;
      }
      const p = (e.target as HTMLElement).closest<HTMLElement>("[data-p]")?.dataset.p;
      if (p === "cancel") { overlay.remove(); resolve([]); }
      if (p === "ok") {
        overlay.remove();
        resolve([...chosen].map(n => (BASE_EXERCISE_DB as any[]).find(x => x.name === n)));
      }
    });
  });
}

export const trainRoute: Route = {
  id: "train",
  label: "Train",
  icon: "⚡",
  async render(host) {
    void setMeta("lastTab", "train");
    [session, ctx] = await Promise.all([loadSession(), loadCoachContext()]);
    render(host);
  }
};
