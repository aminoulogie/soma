// ============================================================================
// @soma/browser — browser APIs shared by both front ends.
//
// Theming, audio feedback and photo capture. These touch the DOM, Web Audio
// and canvas, so they cannot live in @soma/core — but they know nothing about
// Obsidian either, which is why the PWA can use them unchanged.
// ============================================================================

const theme = require("./theme.js");
const audio = require("./audio.js");
const photo = require("./habits/photo.js");

module.exports = { ...theme, ...audio, ...photo };
