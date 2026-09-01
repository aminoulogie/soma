// Structured workout model: supersets as blocks, drop sets chained onto their
// parent set, and lossless conversion to and from the vault's flat shape.
//
// The conversion is the load-bearing part. If it drifts, the PWA and the
// Obsidian plugin stop agreeing about what a session was.
//
// Run with:  node test/test-workout-model.js
const assert = require("assert");
const path = require("path");
const fs = require("fs");

const CORE = path.resolve(__dirname, "..", "..", "..", "packages", "core", "src", "index.js");
const M = require(CORE);

let pass = 0, fail = 0;
const failures = [];
function test(name, fn) {
  try { fn(); pass++; }
  catch (e) { fail++; failures.push({ name, message: e.message }); }
}

const EX = (name, extra = {}) => ({
  name, muscle: "Chest", targetKeys: ["chest"], isAxial: false, isBW: false,
  usesBar: false, ...extra
});

// ------------------------------------------------------------- structure ----
test("a set starts with no drops attached", () => {
  assert.deepStrictEqual(M.makeSet().drops, []);
});
test("sets get unique ids", () => {
  const ids = new Set(Array.from({ length: 50 }, () => M.makeSet().id));
  assert.strictEqual(ids.size, 50);
});
test("a superset block holds its members and rounds", () => {
  const b = M.makeSupersetBlock("A", [{ exercise: EX("Curl") }, { exercise: EX("Pushdown") }], 3);
  assert.strictEqual(b.kind, "superset");
  assert.strictEqual(b.members.length, 2);
  assert.strictEqual(b.members[0].sets.length, 3, "one set per round");
});
test("an exercise block always has at least one set", () => {
  assert.strictEqual(M.makeExerciseBlock(EX("Bench")).sets.length, 1);
});

// ------------------------------------------------------------- traversal ----
test("eachExercise flattens supersets and singles in order", () => {
  const s = M.makeSession("2026-09-01", "Push");
  s.blocks.push(M.makeExerciseBlock(EX("Bench")));
  s.blocks.push(M.makeSupersetBlock("A", [{ exercise: EX("Curl") }, { exercise: EX("Pushdown") }], 2));
  assert.deepStrictEqual(M.eachExercise(s).map(e => e.exercise.name),
    ["Bench", "Curl", "Pushdown"]);
});
test("workingSets ignores warm-ups and incomplete sets", () => {
  const s = M.makeSession("2026-09-01", "Push");
  s.blocks.push(M.makeExerciseBlock(EX("Bench"), [
    M.makeSet({ type: M.SET_WARMUP, done: true, weight: 40, reps: 10 }),
    M.makeSet({ done: true, weight: 100, reps: 5 }),
    M.makeSet({ done: false, weight: 100, reps: 5 })
  ]));
  assert.strictEqual(M.workingSets(s).length, 1);
});

// ------------------------------------------------------------- drop sets ----
test("a drop chains onto its parent, not the exercise", () => {
  const set = M.makeSet({ weight: 100, reps: 8, done: true });
  set.drops.push(M.makeDrop({ weight: 80, reps: 6, done: true }));
  assert.strictEqual(set.drops.length, 1);
  assert.strictEqual(set.drops[0].weight, 80);
});
test("total reps include the drops", () => {
  const set = M.makeSet({ weight: 100, reps: 8 });
  set.drops.push(M.makeDrop({ weight: 80, reps: 6 }));
  set.drops.push(M.makeDrop({ weight: 60, reps: 4 }));
  assert.strictEqual(M.setTotalReps(set), 18);
});
test("tonnage counts the drops at their own weight", () => {
  const set = M.makeSet({ weight: 100, reps: 5 });          // 500
  set.drops.push(M.makeDrop({ weight: 80, reps: 5 }));      // 400
  assert.strictEqual(M.setTonnage(set), 900);
});
test("tonnage adds the bar where the exercise uses one", () => {
  const set = M.makeSet({ weight: 60, reps: 5 });
  assert.strictEqual(M.setTonnage(set, 20), 400);
});
test("a drop set is NOT a separate working set", () => {
  const s = M.makeSession("2026-09-01", "Push");
  const set = M.makeSet({ weight: 100, reps: 8, done: true });
  set.drops.push(M.makeDrop({ weight: 80, reps: 6, done: true }));
  s.blocks.push(M.makeExerciseBlock(EX("Bench"), [set]));
  // Volume landmarks count hard sets, not total reps performed.
  assert.strictEqual(M.workingSets(s).length, 1);
});

// -------------------------------------------------------------- what next ---
test("mid-superset sends you to the partner with no rest", () => {
  const s = M.makeSession("2026-09-01", "Pull");
  const b = M.makeSupersetBlock("A", [{ exercise: EX("Curl") }, { exercise: EX("Pushdown") }], 2);
  s.blocks.push(b);
  const n = M.nextAfter(s, b.id, 0, 0);
  assert.strictEqual(n.kind, "superset-partner");
  assert.strictEqual(n.exercise.name, "Pushdown");
});
test("the last member of a superset earns a rest", () => {
  const s = M.makeSession("2026-09-01", "Pull");
  const b = M.makeSupersetBlock("A", [{ exercise: EX("Curl") }, { exercise: EX("Pushdown") }], 2);
  s.blocks.push(b);
  assert.strictEqual(M.nextAfter(s, b.id, 1, 0).kind, "rest");
});
test("a pending drop comes before the rest", () => {
  const s = M.makeSession("2026-09-01", "Push");
  const set = M.makeSet({ weight: 100, reps: 8, done: true });
  set.drops.push(M.makeDrop({ weight: 80, reps: 6, done: false }));
  const b = M.makeExerciseBlock(EX("Bench"), [set]);
  s.blocks.push(b);
  const n = M.nextAfter(s, b.id, 0, 0);
  assert.strictEqual(n.kind, "drop");
  assert.strictEqual(n.weight, 80);
});
test("once every drop is done, it is a rest", () => {
  const s = M.makeSession("2026-09-01", "Push");
  const set = M.makeSet({ weight: 100, reps: 8, done: true });
  set.drops.push(M.makeDrop({ weight: 80, reps: 6, done: true }));
  const b = M.makeExerciseBlock(EX("Bench"), [set]);
  s.blocks.push(b);
  assert.strictEqual(M.nextAfter(s, b.id, 0, 0).kind, "rest");
});
test("an unknown block does not throw", () => {
  assert.strictEqual(M.nextAfter(M.makeSession(), "nope", 0, 0).kind, "rest");
});

// ------------------------------------------------------------ to legacy -----
test("supersets collapse back to a shared letter", () => {
  const s = M.makeSession("2026-09-01", "Pull");
  s.blocks.push(M.makeSupersetBlock("A", [{ exercise: EX("Curl") }, { exercise: EX("Pushdown") }], 2));
  const legacy = M.toLegacySession(s);
  assert.strictEqual(legacy.exercises[0].supersetGroup, "A");
  assert.strictEqual(legacy.exercises[1].supersetGroup, "A");
});
test("drops become sibling sets right after their parent", () => {
  const s = M.makeSession("2026-09-01", "Push");
  const set = M.makeSet({ weight: 100, reps: 8, done: true });
  set.drops.push(M.makeDrop({ weight: 80, reps: 6, done: true }));
  s.blocks.push(M.makeExerciseBlock(EX("Bench"), [set]));
  const flat = M.toLegacySession(s).exercises[0].sets;
  assert.deepStrictEqual(flat.map(x => x.type), ["normal", "dropset"]);
  assert.strictEqual(flat[1].weight, 80);
});
test("warm-ups survive the round trip as warm-ups", () => {
  const s = M.makeSession("2026-09-01", "Push");
  s.blocks.push(M.makeExerciseBlock(EX("Bench"), [
    M.makeSet({ type: M.SET_WARMUP, weight: 40, reps: 10, done: true })
  ]));
  assert.strictEqual(M.toLegacySession(s).exercises[0].sets[0].type, "warmup");
});
test("totals count working sets only", () => {
  const s = M.makeSession("2026-09-01", "Push");
  const set = M.makeSet({ weight: 100, reps: 5, done: true, rpe: 3 });
  set.drops.push(M.makeDrop({ weight: 80, reps: 5, done: true }));
  s.blocks.push(M.makeExerciseBlock(EX("Bench"), [
    M.makeSet({ type: M.SET_WARMUP, weight: 40, reps: 10, done: true }),
    set
  ]));
  const legacy = M.toLegacySession(s);
  assert.strictEqual(legacy.totalSets, 1, "warm-up or drop leaked into totalSets");
  // Tonnage still includes the drop, because it was real work.
  assert.strictEqual(legacy.totalVol, 900);
});
test("muscle attribution reaches the legacy shape", () => {
  const s = M.makeSession("2026-09-01", "Push");
  s.blocks.push(M.makeExerciseBlock(EX("Bench"), [
    M.makeSet({ weight: 100, reps: 5, done: true, rpe: 4 })
  ]));
  const legacy = M.toLegacySession(s);
  assert.strictEqual(legacy.muscles.chest.sets, 1);
  assert.strictEqual(legacy.muscles.chest.avgFail, 4);
});

// ---------------------------------------------------------- from legacy -----
test("a dropset set attaches to the working set above it", () => {
  const legacy = { timestamp: 1, split: "Push", exercises: [{
    ...EX("Bench"), supersetGroup: "",
    sets: [
      { weight: 100, reps: 8, failure: 3, done: true, type: "normal" },
      { weight: 80, reps: 6, failure: 4, done: true, type: "dropset" }
    ]
  }]};
  const s = M.fromLegacySession(legacy, "2026-09-01");
  const block = s.blocks[0];
  assert.strictEqual(block.sets.length, 1, "the drop should not be its own set");
  assert.strictEqual(block.sets[0].drops.length, 1);
  assert.strictEqual(block.sets[0].drops[0].weight, 80);
});
test("a shared letter rebuilds one superset block", () => {
  const legacy = { timestamp: 1, split: "Pull", exercises: [
    { ...EX("Curl"), supersetGroup: "A", sets: [{ weight: 20, reps: 10, done: true, type: "normal" }] },
    { ...EX("Pushdown"), supersetGroup: "A", sets: [{ weight: 30, reps: 10, done: true, type: "normal" }] }
  ]};
  const s = M.fromLegacySession(legacy, "2026-09-01");
  assert.strictEqual(s.blocks.length, 1);
  assert.strictEqual(s.blocks[0].kind, "superset");
  assert.strictEqual(s.blocks[0].members.length, 2);
});
test("a leading dropset is promoted rather than discarded", () => {
  // Malformed, but it is logged data and must not vanish.
  const legacy = { timestamp: 1, split: "Push", exercises: [{
    ...EX("Bench"), supersetGroup: "",
    sets: [{ weight: 60, reps: 12, done: true, type: "dropset" }]
  }]};
  const s = M.fromLegacySession(legacy, "2026-09-01");
  assert.strictEqual(s.blocks[0].sets.length, 1);
  assert.strictEqual(s.blocks[0].sets[0].weight, 60);
});
test("blank weights become null, not zero", () => {
  const legacy = { timestamp: 1, split: "Push", exercises: [{
    ...EX("Bench"), supersetGroup: "",
    sets: [{ weight: "", reps: "", failure: "", done: true, type: "normal" }]
  }]};
  const set = M.fromLegacySession(legacy, "2026-09-01").blocks[0].sets[0];
  assert.strictEqual(set.weight, null, "an empty field is unknown, not 0kg");
  assert.strictEqual(set.reps, null);
});

// ------------------------------------------------------------ round trip ----
function roundTrip(legacy) {
  return M.toLegacySession(M.fromLegacySession(legacy, "2026-09-01"));
}

test("round trip preserves set order and types", () => {
  const legacy = { timestamp: 1, split: "Push", exercises: [{
    ...EX("Bench"), supersetGroup: "",
    sets: [
      { weight: 40, reps: 10, failure: 1, done: true, type: "warmup" },
      { weight: 100, reps: 8, failure: 3, done: true, type: "normal" },
      { weight: 80, reps: 6, failure: 4, done: true, type: "dropset" },
      { weight: 100, reps: 6, failure: 4, done: true, type: "normal" }
    ]
  }]};
  const out = roundTrip(legacy);
  assert.deepStrictEqual(
    out.exercises[0].sets.map(s => s.type),
    ["warmup", "normal", "dropset", "normal"]
  );
  assert.deepStrictEqual(
    out.exercises[0].sets.map(s => s.weight),
    [40, 100, 80, 100]
  );
});
test("round trip preserves superset grouping", () => {
  const legacy = { timestamp: 1, split: "Pull", exercises: [
    { ...EX("Curl"), supersetGroup: "A", sets: [{ weight: 20, reps: 10, failure: 3, done: true, type: "normal" }] },
    { ...EX("Pushdown"), supersetGroup: "A", sets: [{ weight: 30, reps: 10, failure: 3, done: true, type: "normal" }] }
  ]};
  const out = roundTrip(legacy);
  assert.deepStrictEqual(out.exercises.map(e => e.supersetGroup), ["A", "A"]);
});
test("round trip preserves the computed totals", () => {
  const legacy = { timestamp: 1, split: "Push", exercises: [{
    ...EX("Bench"), supersetGroup: "",
    sets: [
      { weight: 100, reps: 5, failure: 3, done: true, type: "normal" },
      { weight: 80, reps: 5, failure: 4, done: true, type: "dropset" }
    ]
  }]};
  const a = roundTrip(legacy);
  const b = roundTrip(a);
  assert.strictEqual(a.totalVol, b.totalVol, "totals drift on a second pass");
  assert.strictEqual(a.totalSets, b.totalSets);
});

// ------------------------------------------- the user's real vault data -----
const VAULT = "C:/Users/pro/iCloudDrive/iCloud~md~obsidian/amine database/apps/scripts/soma-history.json";
test("real vault sessions survive a round trip", () => {
  if (!fs.existsSync(VAULT)) return; // CI has no vault; not a failure there.
  const raw = JSON.parse(fs.readFileSync(VAULT, "utf8"));
  let checked = 0;
  for (const [key, session] of Object.entries(raw)) {
    if (key.startsWith("_") || !session || !Array.isArray(session.exercises)) continue;
    if (!session.exercises.length) continue;
    const out = roundTrip(session);
    assert.strictEqual(out.exercises.length, session.exercises.length,
      key + ": lost an exercise");
    for (let i = 0; i < session.exercises.length; i++) {
      assert.strictEqual(
        out.exercises[i].sets.length, session.exercises[i].sets.length,
        key + " / " + session.exercises[i].name + ": set count changed"
      );
    }
    checked++;
  }
  assert.ok(checked > 0, "no real sessions were checked");
});

test("volume comes from the engine, not a second implementation", () => {
  // An unloaded bodyweight set is not worth zero: the engine credits it at a
  // share of bodyweight. Recomputing tonnage by hand in the converter made the
  // PWA and the plugin report different volumes for the same session.
  const s = M.makeSession("2026-09-01", "Push");
  s.blocks.push(M.makeExerciseBlock(EX("Dips", { isBW: true }), [
    M.makeSet({ weight: 0, reps: 12, done: true, rpe: 3 })
  ]));
  const legacy = M.toLegacySession(s, { bodyWeight: 75 });
  assert.ok(legacy.totalVol > 0, "bodyweight work counted as zero volume");
  assert.strictEqual(legacy.totalVol, Math.round(75 * 0.65 * 12));
});

test("a blank done set contributes nothing", () => {
  // The plugin used to substitute 80kg x 8 for a set ticked done but never
  // filled in, which is where 2026-08-22's phantom 1280 volume came from.
  const s = M.makeSession("2026-09-01", "Push");
  s.blocks.push(M.makeExerciseBlock(EX("Bench"), [
    M.makeSet({ weight: null, reps: null, done: true })
  ]));
  assert.strictEqual(M.toLegacySession(s).totalVol, 0);
});

test("drops add tonnage but never a working set", () => {
  const s = M.makeSession("2026-09-01", "Legs");
  const set = M.makeSet({ weight: 100, reps: 10, done: true, rpe: 3 });
  set.drops.push(M.makeDrop({ weight: 80, reps: 8, done: true }));
  s.blocks.push(M.makeExerciseBlock(EX("Hack Squat"), [set]));
  const legacy = M.toLegacySession(s);
  assert.strictEqual(legacy.totalSets, 1, "the drop was counted as a working set");
  assert.strictEqual(legacy.totalVol, 1000 + 640, "the drop's tonnage was dropped");
});

console.log("\n  " + pass + " passed, " + fail + " failed\n");
if (fail) {
  failures.forEach(f => console.log("  FAIL  " + f.name + "\n        " + f.message));
  process.exit(1);
}
