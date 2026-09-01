// ============================================================================
// Workout model.
//
// The plugin models supersets and drop sets as flat tags: `supersetGroup: "A"`
// on an exercise, `type: "dropset"` on a set. That records *that* something is
// a drop set but not *what it drops from*, and a superset group is only
// discoverable by scanning every exercise for a matching letter.
//
// Here the structure says what the thing actually is:
//
//   - a superset is a BLOCK containing several exercises, performed in rounds
//   - a drop set CHAINS onto the parent set whose weight it drops from
//
// The legacy shape is still what lives in the vault, so this module owns the
// conversion both ways. Nothing else should know two shapes exist.
// ============================================================================

const { getLocalDateKey } = require("./dates.js");
const { SomaIntelligenceEngine } = require("./engine.js");

/** Set types. Warm-ups and drops are never counted as working volume. */
const SET_WARMUP = "warmup";
const SET_WORKING = "working";

let idCounter = 0;
function nextId(prefix) {
  idCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${idCounter}`;
}

// ---------------------------------------------------------------- builders --

function makeSet(overrides = {}) {
  return {
    id: nextId("set"),
    type: SET_WORKING,
    weight: null,
    reps: null,
    rpe: null,
    done: false,
    // Drops belong to the set they dropped from. A drop cannot exist without
    // a parent, which is exactly the constraint the flat model could not express.
    drops: [],
    ...overrides
  };
}

function makeDrop(overrides = {}) {
  return { weight: null, reps: null, done: false, ...overrides };
}

function makeExerciseBlock(exercise, sets) {
  return {
    kind: "exercise",
    id: nextId("blk"),
    exercise,
    sets: sets && sets.length ? sets : [makeSet()]
  };
}

/**
 * A superset block. `rounds` is how many times you go through the members;
 * each member carries one set per round, so round N is member[*].sets[N].
 */
function makeSupersetBlock(label, members, rounds = 3) {
  return {
    kind: "superset",
    id: nextId("blk"),
    label,
    rounds,
    members: members.map(m => ({
      exercise: m.exercise,
      sets: m.sets && m.sets.length
        ? m.sets
        : Array.from({ length: rounds }, () => makeSet())
    }))
  };
}

function makeSession(date, split) {
  return {
    date: date || getLocalDateKey(new Date()),
    split: split || "",
    startedAt: Date.now(),
    finishedAt: null,
    blocks: []
  };
}

// ------------------------------------------------------------- traversal ----

/** Every {exercise, sets} pair in order, whether or not it is in a superset. */
function eachExercise(session) {
  const out = [];
  for (const block of (session && session.blocks) || []) {
    if (block.kind === "superset") {
      for (const m of block.members) {
        out.push({ exercise: m.exercise, sets: m.sets, block, member: m });
      }
    } else {
      out.push({ exercise: block.exercise, sets: block.sets, block, member: null });
    }
  }
  return out;
}

/** Sets that count toward volume: completed, working, not warm-ups. */
function workingSets(session) {
  const out = [];
  for (const { exercise, sets } of eachExercise(session)) {
    for (const s of sets) {
      if (s.done && s.type === SET_WORKING) out.push({ exercise, set: s });
    }
  }
  return out;
}

/**
 * Total reps performed on a set including everything chained off it. A drop
 * set is real work — it just is not a separate *working set* for volume
 * landmark purposes, which count hard sets rather than total reps.
 */
function setTotalReps(set) {
  const base = parseInt(set.reps) || 0;
  return (set.drops || []).reduce((a, d) => a + (parseInt(d.reps) || 0), base);
}

/** Load x reps for a set and its drops, which is genuine tonnage. */
function setTonnage(set, barWeight = 0) {
  const w = (parseFloat(set.weight) || 0) + barWeight;
  let total = w * (parseInt(set.reps) || 0);
  for (const d of set.drops || []) {
    total += ((parseFloat(d.weight) || 0) + barWeight) * (parseInt(d.reps) || 0);
  }
  return Math.round(total);
}

/**
 * What to do after finishing a set. The structure answers this directly,
 * where the flat model needed a scan across sibling exercises.
 */
function nextAfter(session, blockId, exerciseIndex, setIndex) {
  const block = ((session && session.blocks) || []).find(b => b.id === blockId);
  if (!block) return { kind: "rest" };

  if (block.kind === "superset") {
    const at = exerciseIndex ?? 0;
    if (at < block.members.length - 1) {
      const next = block.members[at + 1];
      // Mid-round: straight to the partner, no rest. This is the whole point
      // of a superset and the flat model could not express it without a scan.
      return { kind: "superset-partner", exercise: next.exercise, roundIndex: setIndex };
    }
    return { kind: "rest", reason: `End of superset ${block.label}` };
  }

  const set = block.sets[setIndex];
  if (set && (set.drops || []).length) {
    const pending = set.drops.findIndex(d => !d.done);
    if (pending !== -1) {
      return { kind: "drop", dropIndex: pending, weight: set.drops[pending].weight };
    }
  }
  return { kind: "rest" };
}

// ------------------------------------------------------- legacy conversion --

/**
 * Structured session -> the vault's flat shape, so the Obsidian plugin and
 * every existing analytic keep working unchanged.
 *
 * Superset membership collapses back to a shared letter; drops become sibling
 * sets tagged "dropset" immediately after their parent, which is the order
 * they were performed in anyway.
 */
function toLegacySession(session, opts = {}) {
  const { caloriesBurned = 0, durationFormatted = "", bodyWeight = 75 } = opts;
  const exercises = [];
  let totalVol = 0;
  let axialVol = 0;
  let totalSets = 0;
  let sumRpe = 0;
  const muscles = {};

  for (const { exercise, sets, block } of eachExercise(session)) {
    const barWeight = exercise.usesBar ? (exercise.barWeight || 20) : 0;
    const flatSets = [];

    for (const s of sets) {
      flatSets.push({
        weight: s.weight === null ? "" : s.weight,
        reps: s.reps === null ? "" : s.reps,
        failure: s.rpe === null ? 3 : s.rpe,
        done: !!s.done,
        type: s.type === SET_WARMUP ? "warmup" : "normal"
      });
      for (const d of s.drops || []) {
        flatSets.push({
          weight: d.weight === null ? "" : d.weight,
          reps: d.reps === null ? "" : d.reps,
          failure: 4,
          done: !!d.done,
          type: "dropset"
        });
      }

      if (s.done && s.type === SET_WORKING) {
        totalSets += 1;
        sumRpe += (parseInt(s.rpe) || 3);
        // Volume comes from the engine, never a second implementation here.
        // It credits unloaded bodyweight work at a share of bodyweight, so a
        // set of dips is not worth zero — recomputing it by hand made the PWA
        // and the plugin disagree about the same session.
        let vol = SomaIntelligenceEngine.calculateWorkVolume(
          (parseFloat(s.weight) || 0) + barWeight, s.reps, exercise.isBW, bodyWeight
        );
        for (const d of s.drops || []) {
          vol += SomaIntelligenceEngine.calculateWorkVolume(
            (parseFloat(d.weight) || 0) + barWeight, d.reps, exercise.isBW, bodyWeight
          );
        }
        totalVol += vol;
        if (exercise.isAxial) axialVol += vol;
      }
    }

    const doneWorking = sets.filter(s => s.done && s.type === SET_WORKING);
    if (doneWorking.length) {
      const avgFail = doneWorking.reduce((a, s) => a + (parseInt(s.rpe) || 3), 0) / doneWorking.length;
      for (const k of exercise.targetKeys || []) {
        if (!muscles[k]) muscles[k] = { sets: 0, sumFail: 0 };
        muscles[k].sets += doneWorking.length;
        muscles[k].sumFail += avgFail * doneWorking.length;
      }
    }

    exercises.push({
      ...exercise,
      supersetGroup: block.kind === "superset" ? block.label : "",
      sets: flatSets
    });
  }

  const finalMuscles = {};
  for (const k of Object.keys(muscles)) {
    finalMuscles[k] = {
      sets: muscles[k].sets,
      avgFail: Math.round((muscles[k].sumFail / muscles[k].sets) * 10) / 10
    };
  }

  return {
    timestamp: session.finishedAt || session.startedAt || Date.now(),
    dateStr: new Date(session.finishedAt || session.startedAt || Date.now()).toISOString(),
    split: session.split,
    durationFormatted,
    caloriesBurned,
    totalVol,
    axialVol,
    totalSets,
    avgIntensity: totalSets ? Math.round((sumRpe / totalSets) * 10) / 10 : 3,
    muscles: finalMuscles,
    exercises
  };
}

/**
 * The vault's flat shape -> structured. Consecutive exercises sharing a
 * superset letter become one block; a "dropset" set attaches to the working
 * set above it rather than standing alone.
 */
function fromLegacySession(legacy, date) {
  const session = makeSession(
    date || (legacy.timestamp ? getLocalDateKey(new Date(legacy.timestamp)) : undefined),
    legacy.split || ""
  );
  session.startedAt = legacy.timestamp || Date.now();
  session.finishedAt = legacy.timestamp || null;

  const groups = new Map();

  for (const ex of legacy.exercises || []) {
    const sets = [];
    for (const s of ex.sets || []) {
      if (s.type === "dropset") {
        // A leading drop set with nothing above it is malformed data; promote
        // it to a working set rather than discarding what was logged.
        const parent = sets[sets.length - 1];
        const drop = makeDrop({
          weight: s.weight === "" ? null : parseFloat(s.weight),
          reps: s.reps === "" ? null : parseInt(s.reps),
          done: !!s.done
        });
        if (parent) parent.drops.push(drop);
        else sets.push(makeSet({ ...drop, type: SET_WORKING, drops: [] }));
        continue;
      }
      sets.push(makeSet({
        type: s.type === "warmup" ? SET_WARMUP : SET_WORKING,
        weight: s.weight === "" || s.weight === undefined ? null : parseFloat(s.weight),
        reps: s.reps === "" || s.reps === undefined ? null : parseInt(s.reps),
        rpe: s.failure === "" || s.failure === undefined ? null : parseInt(s.failure),
        done: !!s.done
      }));
    }

    const { supersetGroup, sets: _drop, ...exercise } = ex;
    if (supersetGroup) {
      if (!groups.has(supersetGroup)) {
        const block = makeSupersetBlock(supersetGroup, [], 0);
        groups.set(supersetGroup, block);
        session.blocks.push(block);
      }
      const block = groups.get(supersetGroup);
      block.members.push({ exercise, sets });
      block.rounds = Math.max(block.rounds, sets.length);
    } else {
      session.blocks.push(makeExerciseBlock(exercise, sets));
    }
  }

  return session;
}

module.exports = {
  SET_WARMUP,
  SET_WORKING,
  makeSet,
  makeDrop,
  makeExerciseBlock,
  makeSupersetBlock,
  makeSession,
  eachExercise,
  workingSets,
  setTotalReps,
  setTonnage,
  nextAfter,
  toLegacySession,
  fromLegacySession
};
