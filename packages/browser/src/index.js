// ============================================================================
// @soma/browser — browser APIs shared by both front ends.
//
// Theming, audio feedback and photo capture. These touch the DOM, Web Audio
// and canvas, so they cannot live in @soma/core — but they know nothing about
// Obsidian either, which is why the PWA reuses them unchanged.
//
// Exports are named explicitly for the same reason as core: Rollup cannot see
// through a spread when it analyses CommonJS for named exports.
// ============================================================================

const {
  ACCENT_PRESETS, DEFAULT_ACCENT, accentInk, accentText,
  normalizeAccent, resolveTheme, applySomaTheme
} = require("./theme.js");

const { SomaAudioCelebration } = require("./audio.js");
const { readAndCompressImage, pickPhoto } = require("./habits/photo.js");

module.exports = {
  // theme
  ACCENT_PRESETS,
  DEFAULT_ACCENT,
  accentInk,
  accentText,
  normalizeAccent,
  resolveTheme,
  applySomaTheme,

  // feedback
  SomaAudioCelebration,

  // photo capture
  readAndCompressImage,
  pickPhoto
};
