// ==========================================================================
// Bundle entry point.
//
// Obsidian loads main.js and expects module.exports to BE the plugin class,
// so that assignment has to come first. The test suite needs reach into the
// pure internals, which are hung off the class as __internals - a property
// on the export rather than a second export, because CJS only has one.
// ==========================================================================

const {
  ALL_DOCK_TABS,
  BASE_EXERCISE_DB,
  ROTATION_SEQUENCE,
  ROUTINE_PRESETS,
  SOMA_SCHEMA_VERSION,
  SomaIntelligenceEngine,
  WIDGET_PROFILES,
  addDays,
  calculateHabitStats,
  getLocalDateKey,
  isDateKey,
  migrateHistory,
  migrateNutrition,
  normalizeExercise,
  normalizeSet,
  nutritionEntryIsEmpty,
  parseLocalDateKey,
  sessionIsEmpty
} = require("@soma/core");
const {
  ACCENT_PRESETS,
  DEFAULT_ACCENT,
  accentInk,
  accentText,
  applySomaTheme,
  normalizeAccent,
  resolveTheme
} = require("@soma/browser");

const { SomaSmartCoachPlugin } = require("./plugin.js");

module.exports = SomaSmartCoachPlugin;

// Exposed for the test harness only; Obsidian never looks at this.
module.exports.__internals = {
  SomaIntelligenceEngine,
  getLocalDateKey, parseLocalDateKey, addDays,
  SOMA_SCHEMA_VERSION, isDateKey, sessionIsEmpty, normalizeSet, normalizeExercise,
  migrateHistory, nutritionEntryIsEmpty, migrateNutrition,
  ACCENT_PRESETS, DEFAULT_ACCENT, accentInk, accentText, normalizeAccent,
  resolveTheme, applySomaTheme,
  ALL_DOCK_TABS, WIDGET_PROFILES,
  BASE_EXERCISE_DB, ROUTINE_PRESETS, ROTATION_SEQUENCE,
  calculateHabitStats
};
