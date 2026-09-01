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
  SET_WARMUP, SET_WORKING
} from "@soma/core";
import { getRecord, putRecord, getMeta, setMeta } from "../lib/db";
import { toast } from "../lib/toast";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Session = any;
type Block = any;
type WorkSet = any;

const today = () => getLocalDateKey(new Date());

let session: Session | null = null;
let restEndsAt: number | null = null;
let restLabel = "";
let restTimer: number | null = null;

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

function exerciseCard(block: Block, exIdx: number, exercise: any, sets: WorkSet[]): string {
  const isSuper = block.kind === "superset";
  return `
    <div class="ex-card ${isSuper ? "in-superset" : ""}">
      <div class="ex-head">
        <span class="ex-name">${exercise.name}</span>
        ${isSuper ? `<span class="ss-tag">${block.label}</span>` : ""}
        <button class="ex-del" data-act="del-block" data-b="${block.id}" aria-label="Remove">✕</button>
      </div>
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

  host.innerHTML = `
    <h1>Train</h1>
    <div id="rest-bar" class="rest-bar" hidden></div>

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
          session.blocks.push(makeExerciseBlock(meta, [makeSet(), makeSet(), makeSet()]));
        }
      }
      void save();
      rerender();
    }
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

      if (act === "set-done" && sets) {
        const set = sets[setIdx];
        set.done = !set.done;
        await save();
        if (set.done) {
          const next = nextAfter(session, blockId, exIdx, setIdx);
          if (next.kind === "superset-partner") {
            startRest(0, "", rerender);
            toast(`Straight into ${next.exercise.name}`);
          } else if (next.kind === "drop") {
            startRest(15, "Drop set — go", rerender);
          } else {
            const rest = await getMeta<number>("restDefault", 90);
            startRest(rest, next.reason ?? "Rest", rerender);
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
          session.blocks.push(makeSupersetBlock(label, picked.map(p => ({ exercise: p })), 3));
        } else {
          session.blocks.push(makeExerciseBlock(picked[0], [makeSet(), makeSet(), makeSet()]));
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
    session = await loadSession();
    render(host);
  }
};
