// ============================================================================
// @soma/core — the shared model.
//
// Data shapes, schema migrations, and every calculation the system makes.
// Deliberately free of DOM, Obsidian and any platform API, so the Obsidian
// plugin and the PWA compute identical answers from identical data rather
// than drifting into two subtly different apps.
// ============================================================================

const dates = require("./dates.js");
const migrations = require("./migrations.js");
const profiles = require("./profiles.js");
const data = require("./data.js");
const habitDefaults = require("./habits/defaults.js");
const habitStats = require("./habits/stats.js");
const { SomaIntelligenceEngine } = require("./engine.js");
const { SomaWorkoutState } = require("./workout-state.js");

module.exports = {
  ...dates,
  ...migrations,
  ...profiles,
  ...data,
  ...habitDefaults,
  ...habitStats,
  SomaIntelligenceEngine,
  SomaWorkoutState
};
