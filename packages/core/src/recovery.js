// ==========================================================================
// Per-muscle recovery.
//
// How recovered each muscle is, from the stimulus its last session applied.
// This is the input autoregulation needs: computeAutoregulatedTarget takes a
// readiness figure, and this is where that figure comes from.
//
// It lived inside the Obsidian plugin, which is why the PWA could log a set
// but never tell you what to lift. Nothing here touches the DOM, the vault or
// Obsidian — it is history in, numbers out — so it belongs in core, where both
// apps read the same model rather than growing two that drift.
// ==========================================================================

// Hours to full recovery for a normal dose: three working sets taken to
// roughly RPE-target. Smaller muscles turn over faster than the big hinges.
//
// Reproduced verbatim from the plugin, deliberately. This commit moves the
// model; it does not retune it, so both apps keep answering exactly what the
// plugin answered yesterday. Keys the table omits fall back to 48h, which is
// what the plugin did with anything outside this list.
const BASE_RECOVERY_HOURS = {
  calves: 24, calves_back: 24, deltoids_back: 24, forearms: 24,
  biceps: 36, deltoids: 36,
  chest: 48, upper_back: 48, trapezius_back: 48, triceps: 48, triceps_back: 48,
  gluteal: 48, adductors: 48,
  quadriceps: 72, hamstring: 72, lower_back: 72
};

// Effort → recovery-time multiplier. A set stopped well short of failure
// should demand meaningfully less recovery than a true all-out set, not a few
// percent less.
//   1 Very Easy → 0.35x   2 Easy/RIR 2 → 0.60x   3 Target → 1.00x (the base)
//   4 Hard/Grind → 1.30x  5 True Failure → 1.60x
const EFFORT_MULTIPLIER = { 1: 0.35, 2: 0.60, 3: 1.00, 4: 1.30, 5: 1.60 };

const DEFAULT_HOURS = 48;

function effortLabel(avgFail) {
  if (avgFail <= 1.5) return "Very Easy";
  if (avgFail <= 2.5) return "Easy";
  if (avgFail <= 3.5) return "Target";
  if (avgFail <= 4.5) return "Hard";
  return "True Failure";
}

/**
 * The most recent stimulus each muscle received, from `session.muscles` —
 * a field the shared workout model writes, so both apps produce it identically.
 */
function latestStimulusByMuscle(history, now) {
  const latest = {};
  for (const session of Object.values(history || {})) {
    if (!session || typeof session !== "object" || !session.muscles) continue;
    const ts = session.timestamp || now;
    for (const [key, stats] of Object.entries(session.muscles)) {
      if (!latest[key] || ts > latest[key].timestamp) {
        latest[key] = {
          timestamp: ts,
          sets: (stats && stats.sets) || 3,
          avgFail: (stats && stats.avgFail) || 3
        };
      }
    }
  }
  return latest;
}

/**
 * Readiness for every muscle, 0-100.
 *
 * opts.keys            which muscles to report on. Defaults to every muscle
 *                      with known base hours, plus anything seen in history.
 * opts.fallbackHours   base recovery time for keys this table does not name.
 *                      A fallback, not an override — the table above wins,
 *                      which is the precedence the Obsidian plugin has always
 *                      applied to its muscle registry.
 * opts.now             injectable clock, so this is testable.
 *
 * A muscle with no recorded stimulus reads 100: untrained is fully recovered.
 */
function computeMuscleReadiness(history, opts = {}) {
  const { now = Date.now(), keys = null, fallbackHours = {} } = opts;

  const latest = latestStimulusByMuscle(history, now);
  const keyList = keys && keys.length
    ? keys
    : [...new Set([...Object.keys(BASE_RECOVERY_HOURS), ...Object.keys(latest)])];

  const out = {};
  for (const key of keyList) {
    const baseT = BASE_RECOVERY_HOURS[key] || fallbackHours[key] || DEFAULT_HOURS;
    const stim = latest[key];

    if (!stim) {
      out[key] = {
        recovery: 100, hoursLeft: 0, lastWorkedHours: null,
        effortNote: null, adjustedHours: baseT, baseHours: baseT
      };
      continue;
    }

    const elapsedHours = Math.max(0, (now - stim.timestamp) / 3600000);

    // Three working sets is the dose the base time assumes. Clamped so one
    // set, or a marathon session, cannot send this to an extreme.
    const volumeFactor = Math.min(1.8, Math.max(0.45, stim.sets / 3));

    // Interpolate between the defined effort levels, so an average difficulty
    // of 2.3 lands between "Easy" and "Target".
    const lo = Math.floor(stim.avgFail);
    const hi = Math.ceil(stim.avgFail);
    const loM = EFFORT_MULTIPLIER[lo] || 1;
    const hiM = EFFORT_MULTIPLIER[hi] || 1;
    const effortFactor = lo === hi ? loM : loM + (hiM - loM) * (stim.avgFail - lo);

    // Bounded to 30%-200% of base so nothing goes absurdly short or long.
    const tTarget = Math.min(baseT * 2, Math.max(baseT * 0.3, baseT * volumeFactor * effortFactor));

    // Concave decay: most readiness returns in the earlier hours and tapers
    // near full. A convex curve pins a muscle near 0% straight after even a
    // light session, which is not how recovery behaves.
    const recovery = Math.min(100, Math.pow(elapsedHours / tTarget, 0.8) * 100);

    out[key] = {
      recovery: Math.round(recovery),
      hoursLeft: Math.max(0, Math.round(tTarget - elapsedHours)),
      lastWorkedHours: Math.round(elapsedHours),
      effortNote: effortLabel(stim.avgFail),
      adjustedHours: Math.round(tTarget),
      baseHours: baseT
    };
  }
  return out;
}

/** Just the 0-100 figures, which is the shape suggestAlternatives wants. */
function readinessMap(history, opts = {}) {
  const full = computeMuscleReadiness(history, opts);
  const out = {};
  for (const [k, v] of Object.entries(full)) out[k] = v.recovery;
  return out;
}

/**
 * Readiness of the limiting muscle an exercise trains — the worst of the
 * muscles it targets. Null when the exercise names no muscles we model.
 */
function readinessForExercise(exercise, readiness) {
  const keys = Array.isArray(exercise && exercise.targetKeys) ? exercise.targetKeys : [];
  let worst = null;
  for (const k of keys) {
    const v = readiness && readiness[k];
    if (typeof v !== "number") continue;
    if (worst === null || v < worst) worst = v;
  }
  return worst;
}

module.exports = {
  BASE_RECOVERY_HOURS,
  computeMuscleReadiness,
  readinessMap,
  readinessForExercise
};
