// ============================================================================
// @soma/core — the shared model.
//
// Data shapes, schema migrations, and every calculation the system makes.
// Deliberately free of DOM, Obsidian and any platform API, so the Obsidian
// plugin and the PWA compute identical answers from identical data rather
// than drifting into two subtly different apps.
//
// Exports are listed explicitly rather than spread. Rollup statically analyses
// CommonJS to find named exports, and `module.exports = { ...a, ...b }` is
// opaque to that analysis — Vite then fails the build with "not exported by".
// Naming them costs a few lines and keeps `import { x } from "@soma/core"`
// working under both bundlers.
// ============================================================================

const {
  getLocalDateKey, parseLocalDateKey, addDays, formatDateLong, formatTimeShort
} = require("./dates.js");

const {
  SOMA_SCHEMA_VERSION, isDateKey, sessionIsEmpty, normalizeSet, normalizeExercise,
  migrateHistory, nutritionEntryIsEmpty, migrateNutrition
} = require("./migrations.js");

const { ALL_DOCK_TABS, WIDGET_PROFILES } = require("./profiles.js");

const {
  DEFAULT_GOALS, BASE_FOOD_LIBRARY, BASE_EXERCISE_DB, ROUTINE_PRESETS, ROTATION_SEQUENCE
} = require("./data.js");

const { DEFAULT_HABITS, DEFAULT_HABIT_SETTINGS } = require("./habits/defaults.js");
const { calculateHabitStats } = require("./habits/stats.js");
const {
  SET_WARMUP, SET_WORKING, makeSet, makeDrop, makeExerciseBlock, makeSupersetBlock,
  makeSession, eachExercise, workingSets, setTotalReps, setTonnage, nextAfter,
  toLegacySession, fromLegacySession
} = require("./workout-model.js");

const { SomaIntelligenceEngine } = require("./engine.js");
const { SomaWorkoutState } = require("./workout-state.js");

module.exports = {
  // dates
  getLocalDateKey,
  parseLocalDateKey,
  addDays,
  formatDateLong,
  formatTimeShort,

  // migrations
  SOMA_SCHEMA_VERSION,
  isDateKey,
  sessionIsEmpty,
  normalizeSet,
  normalizeExercise,
  migrateHistory,
  nutritionEntryIsEmpty,
  migrateNutrition,

  // widget composition
  ALL_DOCK_TABS,
  WIDGET_PROFILES,

  // seed data
  DEFAULT_GOALS,
  BASE_FOOD_LIBRARY,
  BASE_EXERCISE_DB,
  ROUTINE_PRESETS,
  ROTATION_SEQUENCE,
  DEFAULT_HABITS,
  DEFAULT_HABIT_SETTINGS,

  // workout model
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
  fromLegacySession,

  // logic
  calculateHabitStats,
  SomaIntelligenceEngine,
  SomaWorkoutState
};
