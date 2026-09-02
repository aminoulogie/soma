// ============================================================================
// The coaching context.
//
// The logger knew how to record a set but never what to suggest. Everything
// needed to answer "what should I lift today" was already in @soma/core —
// the progression ladder, the autoregulator, the recovery model, the trend
// detector — it just had nothing assembling the inputs.
//
// This is that assembly, and only that: it gathers state and asks the engine.
// No decision is made here, so the PWA and the plugin cannot disagree about
// what to lift.
// ============================================================================

import {
  SomaIntelligenceEngine as Engine,
  getLocalDateKey, parseLocalDateKey,
  readinessMap, readinessForExercise,
  BASE_EXERCISE_DB
} from "@soma/core";
import { asKeyedObject, getRecord, getMeta } from "./db";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ReadinessCheckin {
  soreness: number | null;
  stress: number | null;
}

export interface Target {
  weight: number;
  reps: number;
  note: string;
  diffTier: string;
  autoNote: string | null;
  adjusted: boolean;
  readiness: number | null;
}

export interface CoachContext {
  /** Every past session, keyed by date — the shape the engine expects. */
  history: Record<string, any>;
  /** Muscle key -> 0-100. */
  readiness: Record<string, number>;
  /** Sleep, soreness and stress folded into one figure, or null if unknown. */
  subjective: number | null;
  /** Which of those actually contributed, so the figure can be explained. */
  subjectiveFrom: string[];
  /** Today's check-in as stored, so the UI can show it selected. */
  checkin: ReadinessCheckin;
  /** Today's programme slot: split, phase, deload flag. */
  program: any;
  unit: string;
  bodyWeight: number;
  restDefault: number;
}

const today = () => getLocalDateKey(new Date());

/**
 * Loads everything the coach needs, once per render. Today's own session is
 * excluded from history — a set logged an hour ago must not be read as
 * fatigue accumulated before the session it belongs to, and must not become
 * its own personal record to beat.
 */
export async function loadCoachContext(): Promise<CoachContext> {
  const [all, sleep, checkin, unit, bodyWeight, restDefault, overrides] = await Promise.all([
    asKeyedObject<any>("workout"),
    getRecord<{ hours: number | null; quality: number }>("sleep", today()),
    getRecord<ReadinessCheckin>("body", today()),
    getMeta<string>("unit", "kg"),
    getMeta<number>("bodyWeight", 75),
    getMeta<number>("restDefault", 90),
    getMeta<Record<string, string>>("scheduleOverrides", {})
  ]);

  const history: Record<string, any> = { ...all };
  delete history[today()];

  // @soma/core is plain JS, so TypeScript infers these parameters as `null`
  // from their defaults rather than "number or null". Cast at the boundary
  // rather than weakening the engine's own signature.
  const subjective: number | null = Engine.computeSubjectiveReadiness({
    sleepHours: sleep?.hours ?? null,
    sleepQuality: sleep?.quality ?? null,
    soreness: checkin?.soreness ?? null,
    stress: checkin?.stress ?? null
  } as any);

  const subjectiveFrom: string[] = [];
  if (sleep?.hours != null || sleep?.quality != null) subjectiveFrom.push("sleep");
  if (checkin?.soreness != null) subjectiveFrom.push("soreness");
  if (checkin?.stress != null) subjectiveFrom.push("stress");

  return {
    history,
    readiness: readinessMap(history) as Record<string, number>,
    subjective,
    subjectiveFrom,
    checkin: { soreness: checkin?.soreness ?? null, stress: checkin?.stress ?? null },
    program: Engine.getProgramProjectedDay(parseLocalDateKey(today()), overrides),
    unit,
    bodyWeight,
    restDefault
  };
}

/** The last working set actually completed for an exercise, most recent first. */
export function lastSetFor(history: Record<string, any>, name: string): any | null {
  const sessions = Object.values(history)
    .filter(s => s && Array.isArray(s.exercises))
    .sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

  for (const s of sessions) {
    const ex = s.exercises.find((e: any) => e.name?.toLowerCase() === name.toLowerCase());
    if (!ex) continue;
    // Later sets in a session are the ones carrying the most information about
    // what the lifter could still do, so search from the end.
    for (let i = (ex.sets?.length ?? 0) - 1; i >= 0; i--) {
      const set = ex.sets[i];
      if (set.done && set.type !== "warmup" && set.type !== "dropset") return set;
    }
  }
  return null;
}

/**
 * What to lift, for one exercise. Muscle readiness and how the lifter actually
 * feels are blended — feeling rough can only pull the figure down, never
 * license more load than the muscle has recovered for.
 */
export function targetFor(ctx: CoachContext, exercise: any): Target {
  const lastSet = lastSetFor(ctx.history, exercise.name);
  return Engine.computeAutoregulatedTarget(lastSet, {
    isBW: !!exercise.isBW,
    readiness: Engine.blendReadiness(
      readinessForExercise(exercise, ctx.readiness), ctx.subjective
    ),
    isDeload: !!ctx.program?.isDeload,
    unit: ctx.unit,
    trend: Engine.computeVolumeTrend(ctx.history, exercise.name)
  }) as Target;
}

/** Fresher exercises hitting the same muscle, when this one is too fatigued. */
export function alternativesFor(ctx: CoachContext, exercise: any) {
  return Engine.suggestAlternatives(exercise, BASE_EXERCISE_DB as any[], ctx.readiness, 3);
}

/** Loadable plates per side, and the ramp to get to the working weight. */
export function loadingFor(ctx: CoachContext, exercise: any, weight: number) {
  const bar = exercise.usesBar ? (exercise.barWeight || 20) : 0;
  return {
    bar,
    plates: bar ? Engine.calculatePlateStack(weight, bar, ctx.unit) : [],
    ramp: bar ? Engine.calculateWarmupRamp(weight, bar, ctx.unit) : []
  };
}

/** A PR, or null. Called as a set is completed, against history without today. */
export function prFor(
  ctx: CoachContext, name: string, weight: unknown, reps: unknown
) {
  return Engine.detectPersonalRecords(ctx.history, name, weight, reps);
}
