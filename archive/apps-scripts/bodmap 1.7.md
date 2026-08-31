```dataviewjs
const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// ============================================================================
// MUSCLE REGISTRY & RECOVERY DATA MODEL
// ============================================================================
const muscleRegistry = {
  delts_front: {
    name: "Anterior Deltoid",
    region: "Front Shoulder",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Primary shoulder flexion and horizontal pressing synergist. Highly loaded during incline presses."
  },
  delts_side: {
    name: "Lateral Deltoid",
    region: "Side Shoulder",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Responsible for shoulder abduction and shoulder width cap. Fast recovery and high volume tolerance."
  },
  chest_upper: {
    name: "Upper Clavicular Pecs",
    region: "Chest",
    defaultHours: 48,
    tier: "Standard",
    desc: "Clavicular head fibers fatigued from incline pressing and low-to-high fly patterns."
  },
  chest_lower: {
    name: "Mid / Sternal Pecs",
    region: "Chest",
    defaultHours: 48,
    tier: "Standard",
    desc: "Sternal and costal pectoral plates powering flat pressing, dips, and horizontal adduction."
  },
  biceps: {
    name: "Biceps Brachii",
    region: "Arms",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Primary elbow flexor and pulling synergist. Recovers quickly from isolated flexion loading."
  },
  forearms: {
    name: "Forearms & Grip",
    region: "Arms",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Brachioradialis and wrist flexor group. High slow-twitch density allowing daily recovery."
  },
  abs_core: {
    name: "Rectus Abdominis & Core",
    region: "Core",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Trunk flexion, serratus anterior control, and intra-abdominal core stabilization."
  },
  quads: {
    name: "Quadriceps Femoris",
    region: "Thighs",
    defaultHours: 72,
    tier: "High Systemic",
    desc: "Major knee extension mass (vastus medialis, lateralis, rectus femoris) causing deep fatigue."
  },
  calves_ant: {
    name: "Tibialis Anterior",
    region: "Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Anterior lower leg musculature responsible for ankle dorsiflexion and deceleration."
  },
  traps_upper: {
    name: "Trapezius & Rhomboids",
    region: "Upper Back",
    defaultHours: 48,
    tier: "Standard",
    desc: "Scapular elevation and retraction network loaded heavily in deadlifts, rows, and carries."
  },
  delts_rear: {
    name: "Posterior Deltoid",
    region: "Rear Shoulder",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Posterior shoulder head active in horizontal pulls, face pulls, and shoulder joint integrity."
  },
  lats: {
    name: "Latissimus Dorsi",
    region: "Back Width",
    defaultHours: 48,
    tier: "Standard",
    desc: "Large sweeping back musculature powering vertical pulls, rows, and V-taper sweep."
  },
  triceps: {
    name: "Triceps Brachii",
    region: "Arms",
    defaultHours: 48,
    tier: "Standard",
    desc: "Primary elbow extension group (long, lateral, medial heads) taxed in all pressing lockouts."
  },
  lower_back: {
    name: "Spinal Erectors",
    region: "Lower Back",
    defaultHours: 72,
    tier: "High Axial",
    desc: "Spinal extension and axial load support columns requiring extended nervous system recovery."
  },
  glutes: {
    name: "Gluteus Complex",
    region: "Hips",
    defaultHours: 48,
    tier: "Standard",
    desc: "Major hip extension powerhouse loaded heavily during squats, hinges, and hip thrusts."
  },
  hamstrings: {
    name: "Hamstring Complex",
    region: "Thighs",
    defaultHours: 72,
    tier: "High Systemic",
    desc: "Posterior thigh group (biceps femoris, semitendinosus) with high stretch-induced damage."
  },
  calves_post: {
    name: "Gastrocnemius & Soleus",
    region: "Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Posterior calf complex responsible for plantar flexion. Highly resilient and rapid recovery."
  }
};

// Initial Heatmap Soreness State
const activeSorenessMap = {
  chest_upper: "sore-max",
  chest_lower: "sore-mid",
  delts_side: "sore-low",
  triceps: "sore-mid",
  lats: "sore-max",
  hamstrings: "sore-max",
  calves_post: "sore-low"
};

// ============================================================================
// STYLES & VOLUMETRIC HIGH-CONTRAST NEON ENGINE
// ============================================================================
const style = document.createElement("style");
style.textContent = `
.bodymap-root {
  width: 100%;
  box-sizing: border-box;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
}
.bodymap-root * { box-sizing: border-box; }

.bodymap-container {
  width: 100%;
  max-width: 980px;
  margin: 16px auto;
  padding: 30px 24px 24px;
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 26px;
  background: radial-gradient(circle at 50% 15%, rgba(14, 42, 82, 0.45), transparent 55%), linear-gradient(145deg, #07101f 0%, #030712 100%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.bodymap-header { text-align: center; margin-bottom: 22px; }
.bodymap-title { margin: 0; color: #f8fafc; font-size: 1.45rem; font-weight: 850; letter-spacing: -0.025em; }
.bodymap-title-icon { display: inline-block; margin-right: 8px; color: #38bdf8; }
.bodymap-subtitle { margin-top: 6px; color: #94a3b8; font-size: 0.85rem; }

/* 3-Column Balanced Flex Grid */
.bodymap-visual-grid {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  min-height: 520px;
}

.bodymap-side-panel {
  flex: 0 0 180px;
  padding: 22px 18px;
  border: 1px solid rgba(76, 110, 160, 0.35);
  border-radius: 18px;
  background: rgba(11, 22, 40, 0.85);
  box-shadow: 0 16px 36px rgba(0,0,0,0.35);
}

.bodymap-side-title {
  margin: 0 0 18px;
  color: #94a3b8;
  font-size: 0.74rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bodymap-side-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 15px; }
.bodymap-side-row:last-child { margin-bottom: 0; }
.bodymap-dot { flex: 0 0 14px; width: 14px; height: 14px; margin-top: 2px; border-radius: 50%; }
.bodymap-side-main { color: #f1f5f9; font-size: 0.85rem; font-weight: 750; line-height: 1.2; }
.bodymap-side-sub { margin-top: 2px; color: #64748b; font-size: 0.68rem; }

.dot-red { background: #ff2a38; box-shadow: 0 0 12px rgba(255,42,56,0.9); }
.dot-orange { background: #ff7315; box-shadow: 0 0 12px rgba(255,115,21,0.85); }
.dot-yellow { background: #ffd000; box-shadow: 0 0 12px rgba(255,208,0,0.8); }
.dot-green { background: #10b981; box-shadow: 0 0 12px rgba(16,185,129,0.7); }
.dot-bluegray { background: #334155; }

/* How to Use Section */
.how-row { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; }
.how-row:last-child { margin-bottom: 0; }
.how-icon {
  flex: 0 0 32px;
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #38bdf8;
  background: rgba(30, 58, 102, 0.6);
  border: 1px solid rgba(56, 189, 248, 0.35);
  font-size: 0.85rem;
}
.how-text { color: #cbd5e1; font-size: 0.76rem; line-height: 1.35; }

/* Center Anatomy Viewport */
.bodymap-figures {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 36px;
  min-width: 0;
}
.bodymap-figure-wrap { width: 210px; text-align: center; }
.bodymap-figure-label { margin-bottom: 10px; color: #64748b; font-size: 0.72rem; font-weight: 850; letter-spacing: 0.15em; text-transform: uppercase; }
.bodymap-svg { width: 100%; height: 490px; overflow: visible; display: block; filter: drop-shadow(0 16px 36px rgba(0,0,0,0.85)); }

/* High-Contrast Anatomical Body Base (Visible 3D Mannequin) */
.anat-base { fill: #172439; stroke: #2a3c57; stroke-width: 1.6; }
.anat-head { fill: url(#head3D); stroke: #334766; stroke-width: 1.6; }
.anat-shadow { fill: #0f1929; stroke: #1e2c40; stroke-width: 1.4; }
.anat-line { fill: none; stroke: rgba(56, 189, 248, 0.25); stroke-width: 1.2; pointer-events: none; }

/* High-Visibility Interactive Muscles */
.muscle {
  fill: #1d2e47;
  stroke: #2b4060;
  stroke-width: 1.6;
  cursor: pointer;
  transition: all 0.18s ease;
}
.muscle:hover {
  fill: #334d75 !important;
  stroke: #38bdf8 !important;
  filter: drop-shadow(0 0 12px #38bdf8) !important;
}

/* Vivid High-Output Heatmap Glows */
.muscle.sore-max {
  fill: url(#glowRed3D) !important;
  stroke: #ff7882 !important;
  filter: drop-shadow(0 0 8px rgba(255, 42, 56, 0.95)) drop-shadow(0 0 22px rgba(255, 42, 56, 0.65));
}
.muscle.sore-mid {
  fill: url(#glowOrange3D) !important;
  stroke: #ffaa66 !important;
  filter: drop-shadow(0 0 8px rgba(255, 115, 21, 0.9)) drop-shadow(0 0 20px rgba(255, 115, 21, 0.6));
}
.muscle.sore-low {
  fill: url(#glowYellow3D) !important;
  stroke: #fff077 !important;
  filter: drop-shadow(0 0 7px rgba(255, 208, 0, 0.85)) drop-shadow(0 0 16px rgba(255, 208, 0, 0.5));
}
.muscle.fresh {
  fill: url(#glowGreen3D) !important;
  stroke: #73f7a3 !important;
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.85));
}

/* Detail Card */
.bodymap-detail-card {
  margin-top: 24px;
  padding: 20px 24px;
  border: 1px solid rgba(33, 83, 180, 0.95);
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(8, 18, 34, 0.98), rgba(7, 16, 29, 0.96));
  box-shadow: 0 16px 40px rgba(0,0,0,0.35), inset 0 0 20px rgba(37,99,235,0.12);
}
.detail-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.detail-name { color: #ffffff; font-size: 1.15rem; font-weight: 850; letter-spacing: -0.015em; }
.detail-badge { flex: 0 0 auto; padding: 7px 16px; border-radius: 9px; font-size: 0.76rem; font-weight: 850; }
.detail-time { margin-top: 6px; color: #38bdf8; font-size: 0.9rem; font-weight: 800; }
.detail-desc { margin-top: 5px; color: #94a3b8; font-size: 0.8rem; line-height: 1.45; }

/* Preset Bar */
.bodymap-presets { margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(74, 94, 125, 0.25); }
.presets-label { margin-bottom: 12px; color: #64748b; font-size: 0.7rem; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.preset-row { display: flex; flex-wrap: wrap; gap: 9px; }
.preset-button {
  border: 1px solid rgba(70, 91, 125, 0.45);
  border-radius: 10px;
  padding: 9px 16px;
  background: rgba(17, 30, 49, 0.86);
  color: #cbd5e1;
  font-size: 0.78rem;
  font-weight: 750;
  cursor: pointer;
  transition: all 0.15s ease;
}
.preset-button:hover {
  border-color: #38bdf8;
  background: rgba(20, 39, 63, 0.95);
  color: #ffffff;
  transform: translateY(-1px);
}

@media (max-width: 860px) {
  .bodymap-visual-grid { flex-direction: column; align-items: center; }
  .bodymap-side-panel { width: 100%; flex: auto; }
}
`;
rootEl.appendChild(style);

// ============================================================================
// 3D HIGH-LUMINANCE NEON GRADIENTS
// ============================================================================
const svgDefs = `
<defs>
  <radialGradient id="head3D" cx="44%" cy="28%" r="75%">
    <stop offset="0%" stop-color="#47628a"/>
    <stop offset="60%" stop-color="#1f2d42"/>
    <stop offset="100%" stop-color="#0e1724"/>
  </radialGradient>

  <linearGradient id="glowRed3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ff6b76"/>
    <stop offset="45%" stop-color="#ff1a2b"/>
    <stop offset="100%" stop-color="#ad000e"/>
  </linearGradient>

  <linearGradient id="glowOrange3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffa65c"/>
    <stop offset="45%" stop-color="#ff6a00"/>
    <stop offset="100%" stop-color="#ba4200"/>
  </linearGradient>

  <linearGradient id="glowYellow3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fff06e"/>
    <stop offset="45%" stop-color="#ffd000"/>
    <stop offset="100%" stop-color="#b88f00"/>
  </linearGradient>

  <linearGradient id="glowGreen3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#55f79b"/>
    <stop offset="45%" stop-color="#10b981"/>
    <stop offset="100%" stop-color="#065f43"/>
  </linearGradient>
</defs>
`;

// ============================================================================
// ANTERIOR (FRONT) PROPORTIONAL & BROAD CHEST BODY SVG
// ============================================================================
const anteriorSVG = `
<svg class="bodymap-svg" viewBox="0 0 220 500" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
  ${svgDefs}
  
  <!-- Base Silhouette Structure -->
  <ellipse class="anat-head" cx="110" cy="30" rx="19" ry="24"/>
  <path class="anat-base" d="M96 50 C98 62 96 68 88 74 L132 74 C124 68 122 62 124 50 Z"/>
  <path class="anat-shadow" d="M94 56 C96 66 102 70 110 72 C118 70 124 66 126 56 Z"/>

  <!-- DELTOIDS (ANTERIOR & LATERAL) -->
  <path class="muscle ${activeSorenessMap.delts_front || ""}" data-part="delts_front" d="M72 82 C58 80 52 92 50 106 C50 118 56 128 66 130 C74 120 78 104 76 90 Z"/>
  <path class="muscle ${activeSorenessMap.delts_front || ""}" data-part="delts_front" d="M148 82 C162 80 168 92 170 106 C170 118 164 128 154 130 C146 120 142 104 144 90 Z"/>
  <path class="muscle ${activeSorenessMap.delts_side || ""}" data-part="delts_side" d="M49 94 C39 104 39 116 44 128 C47 134 52 140 57 142 C61 130 61 116 57 102 Z"/>
  <path class="muscle ${activeSorenessMap.delts_side || ""}" data-part="delts_side" d="M171 94 C181 104 181 116 176 128 C173 134 168 140 163 142 C159 130 159 116 163 102 Z"/>

  <!-- BOLD EXPANDED UPPER CHEST (CLAVICULAR HEAD) -->
  <path class="muscle ${activeSorenessMap.chest_upper || ""}" data-part="chest_upper" d="M76 86 C92 78 102 78 109 86 L109 114 C94 114 82 110 72 102 C70 94 72 88 76 86 Z"/>
  <path class="muscle ${activeSorenessMap.chest_upper || ""}" data-part="chest_upper" d="M144 86 C128 78 118 78 111 86 L111 114 C126 114 138 110 148 102 C150 94 148 88 144 86 Z"/>

  <!-- BOLD EXPANDED LOWER CHEST (STERNAL & COSTAL HEAD) -->
  <path class="muscle ${activeSorenessMap.chest_lower || ""}" data-part="chest_lower" d="M72 104 C86 112 98 116 109 116 L109 142 C92 142 78 138 68 126 C66 116 68 109 72 104 Z"/>
  <path class="muscle ${activeSorenessMap.chest_lower || ""}" data-part="chest_lower" d="M148 104 C134 112 122 116 111 116 L111 142 C128 142 142 138 152 126 C154 116 152 109 148 104 Z"/>

  <!-- BICEPS & FOREARMS -->
  <path class="muscle ${activeSorenessMap.biceps || ""}" data-part="biceps" d="M54 134 C47 142 47 158 50 172 C54 178 59 182 64 180 C68 166 68 150 64 136 Z"/>
  <path class="muscle ${activeSorenessMap.biceps || ""}" data-part="biceps" d="M166 134 C173 142 173 158 170 172 C166 178 161 182 156 180 C152 166 152 150 156 136 Z"/>
  <path class="muscle ${activeSorenessMap.forearms || ""}" data-part="forearms" d="M49 182 C41 190 37 208 42 225 C46 235 52 242 57 246 C61 241 63 233 61 222 C57 207 56 195 58 184 Z"/>
  <path class="muscle ${activeSorenessMap.forearms || ""}" data-part="forearms" d="M171 182 C179 190 183 208 178 225 C174 235 168 242 163 246 C159 241 157 233 159 222 C163 207 164 195 162 184 Z"/>

  <!-- RECTUS ABDOMINIS & SERRATUS CORE -->
  <path class="muscle ${activeSorenessMap.abs_core || ""}" data-part="abs_core" d="M88 146 C98 143 104 142 109 143 L109 202 C100 203 92 200 86 194 C84 176 84 160 88 146 Z"/>
  <path class="muscle ${activeSorenessMap.abs_core || ""}" data-part="abs_core" d="M132 146 C122 143 116 142 111 143 L111 202 C120 203 128 200 134 194 C136 176 136 160 132 146 Z"/>
  <path class="anat-line" d="M92 164 L128 164 M90 182 L130 182"/>

  <!-- QUADRICEPS (THIGHS) -->
  <path class="muscle ${activeSorenessMap.quads || ""}" data-part="quads" d="M82 232 C72 250 68 282 74 308 C84 318 94 318 102 310 C106 290 107 264 105 240 C97 234 90 232 82 232 Z"/>
  <path class="muscle ${activeSorenessMap.quads || ""}" data-part="quads" d="M138 232 C148 250 152 282 146 308 C136 318 126 318 118 310 C114 290 113 264 115 240 C123 234 130 232 138 232 Z"/>
  <circle class="anat-shadow" cx="88" cy="324" r="5.5"/>
  <circle class="anat-shadow" cx="132" cy="324" r="5.5"/>

  <!-- ANTERIOR CALVES & TIBIALIS -->
  <path class="muscle ${activeSorenessMap.calves_ant || ""}" data-part="calves_ant" d="M84 330 C76 348 76 378 82 404 C88 416 94 422 98 424 C102 414 103 392 101 368 C99 348 94 336 84 330 Z"/>
  <path class="muscle ${activeSorenessMap.calves_ant || ""}" data-part="calves_ant" d="M136 330 C144 348 144 378 138 404 C132 416 126 422 122 424 C118 414 117 392 119 368 C121 348 126 336 136 330 Z"/>

  <!-- Feet -->
  <path class="anat-base" d="M80 430 C76 432 72 442 75 450 C84 455 100 455 106 448 L103 434 Z"/>
  <path class="anat-base" d="M140 430 C144 432 148 442 145 450 C136 455 120 455 114 448 L117 434 Z"/>
</svg>
`;

// ============================================================================
// POSTERIOR (BACK) PROPORTIONAL BODY SVG
// ============================================================================
const posteriorSVG = `
<svg class="bodymap-svg" viewBox="0 0 220 500" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
  ${svgDefs}

  <ellipse class="anat-head" cx="110" cy="30" rx="19" ry="24"/>
  
  <!-- TRAPEZIUS & UPPER RHOMBOIDS -->
  <path class="muscle ${activeSorenessMap.traps_upper || ""}" data-part="traps_upper" d="M88 64 L110 54 L132 64 C134 78 142 90 146 100 C132 104 120 110 110 128 C100 110 88 104 74 100 C78 90 86 78 88 64 Z"/>

  <!-- REAR DELTOIDS (POSTERIOR) -->
  <path class="muscle ${activeSorenessMap.delts_rear || ""}" data-part="delts_rear" d="M66 84 C54 82 48 92 48 104 C48 116 54 126 64 128 C68 116 71 102 72 90 Z"/>
  <path class="muscle ${activeSorenessMap.delts_rear || ""}" data-part="delts_rear" d="M154 84 C166 82 172 92 172 104 C172 116 166 126 156 128 C152 116 149 102 148 90 Z"/>

  <!-- LATISSIMUS DORSI (V-TAPER WINGS) -->
  <path class="muscle ${activeSorenessMap.lats || ""}" data-part="lats" d="M78 104 C66 112 58 130 64 154 C70 174 84 190 98 196 C104 178 105 152 105 130 C96 116 88 108 78 104 Z"/>
  <path class="muscle ${activeSorenessMap.lats || ""}" data-part="lats" d="M142 104 C154 112 162 130 156 154 C150 174 136 190 122 196 C116 178 115 152 115 130 C124 116 132 108 142 104 Z"/>

  <!-- TRICEPS BRACHII -->
  <path class="muscle ${activeSorenessMap.triceps || ""}" data-part="triceps" d="M50 132 C42 142 44 160 48 174 C52 180 57 182 62 178 C65 166 65 148 60 135 Z"/>
  <path class="muscle ${activeSorenessMap.triceps || ""}" data-part="triceps" d="M170 132 C178 142 176 160 172 174 C168 180 163 182 158 178 C155 166 155 148 160 135 Z"/>

  <!-- LOWER BACK (ERECTORS) -->
  <path class="muscle ${activeSorenessMap.lower_back || ""}" data-part="lower_back" d="M96 148 C90 162 90 182 95 208 L108 214 L108 146 Z"/>
  <path class="muscle ${activeSorenessMap.lower_back || ""}" data-part="lower_back" d="M124 148 C130 162 130 182 125 208 L112 214 L112 146 Z"/>

  <!-- GLUTEUS COMPLEX -->
  <path class="muscle ${activeSorenessMap.glutes || ""}" data-part="glutes" d="M82 208 C74 228 78 250 94 256 C105 254 108 240 108 218 C98 212 90 208 82 208 Z"/>
  <path class="muscle ${activeSorenessMap.glutes || ""}" data-part="glutes" d="M138 208 C146 228 142 250 126 256 C115 254 112 240 112 218 C122 212 130 208 138 208 Z"/>

  <!-- HAMSTRING COMPLEX -->
  <path class="muscle ${activeSorenessMap.hamstrings || ""}" data-part="hamstrings" d="M82 260 C74 278 74 308 80 330 C88 338 98 336 104 326 C106 304 106 280 104 262 C96 258 88 258 82 260 Z"/>
  <path class="muscle ${activeSorenessMap.hamstrings || ""}" data-part="hamstrings" d="M138 260 C146 278 146 308 140 330 C132 338 122 336 116 326 C114 304 114 280 116 262 C124 258 132 258 138 260 Z"/>
  <circle class="anat-shadow" cx="90" cy="336" r="5"/>
  <circle class="anat-shadow" cx="130" cy="336" r="5"/>

  <!-- POSTERIOR CALVES (GASTROCNEMIUS & SOLEUS) -->
  <path class="muscle ${activeSorenessMap.calves_post || ""}" data-part="calves_post" d="M84 342 C72 362 74 392 82 416 C90 424 96 424 100 418 C104 400 105 378 102 350 C96 344 90 342 84 342 Z"/>
  <path class="muscle ${activeSorenessMap.calves_post || ""}" data-part="calves_post" d="M136 342 C148 362 146 392 138 416 C130 424 124 424 120 418 C116 400 115 378 118 350 C124 344 130 342 136 342 Z"/>

  <!-- Feet -->
  <path class="anat-base" d="M80 430 C76 432 72 442 75 450 C84 455 100 455 106 448 L103 434 Z"/>
  <path class="anat-base" d="M140 430 C144 432 148 442 145 450 C136 455 120 455 114 448 L117 434 Z"/>
</svg>
`;

// ============================================================================
// MOUNT HTML LAYOUT
// ============================================================================
const mapContainer = document.createElement("div");
mapContainer.className = "bodymap-container";

mapContainer.innerHTML = `
  <div class="bodymap-header">
    <h3 class="bodymap-title">
      <span class="bodymap-title-icon">🔲</span>
      Anatomical Musculoskeletal Heatmap
    </h3>
    <div class="bodymap-subtitle">
      Click any anatomical section or test toggle to inspect metabolic fatigue
    </div>
  </div>

  <div class="bodymap-visual-grid">
    <!-- LEFT PANEL: FATIGUE LEVEL LEGEND -->
    <div class="bodymap-side-panel">
      <div class="bodymap-side-title">FATIGUE LEVEL</div>
      <div class="bodymap-side-content">
        <div class="bodymap-side-row">
          <span class="bodymap-dot dot-red"></span>
          <div>
            <div class="bodymap-side-main">High</div>
            <div class="bodymap-side-sub">(Severe Fatigue)</div>
          </div>
        </div>
        <div class="bodymap-side-row">
          <span class="bodymap-dot dot-orange"></span>
          <div>
            <div class="bodymap-side-main">Moderate</div>
            <div class="bodymap-side-sub">(Noticeable Fatigue)</div>
          </div>
        </div>
        <div class="bodymap-side-row">
          <span class="bodymap-dot dot-yellow"></span>
          <div>
            <div class="bodymap-side-main">Low</div>
            <div class="bodymap-side-sub">(Mild Fatigue)</div>
          </div>
        </div>
        <div class="bodymap-side-row">
          <span class="bodymap-dot dot-green"></span>
          <div>
            <div class="bodymap-side-main">Fresh</div>
            <div class="bodymap-side-sub">(Recovered)</div>
          </div>
        </div>
        <div class="bodymap-side-row">
          <span class="bodymap-dot dot-bluegray"></span>
          <div>
            <div class="bodymap-side-main">Inactive</div>
            <div class="bodymap-side-sub">(No Data)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- CENTER PANEL: DUAL PROPORTIONAL BODY VIEWPORT -->
    <div class="bodymap-figures">
      <div class="bodymap-figure-wrap">
        <div class="bodymap-figure-label">ANTERIOR</div>
        ${anteriorSVG}
      </div>
      <div class="bodymap-figure-wrap">
        <div class="bodymap-figure-label">POSTERIOR</div>
        ${posteriorSVG}
      </div>
    </div>

    <!-- RIGHT PANEL: HOW TO USE INSTRUCTIONS -->
    <div class="bodymap-side-panel">
      <div class="bodymap-side-title">HOW TO USE</div>
      <div class="how-row">
        <div class="how-icon">👆</div>
        <div class="how-text">Click any muscle group to view details</div>
      </div>
      <div class="how-row">
        <div class="how-icon">⚡</div>
        <div class="how-text">Use test toggles to simulate fatigue</div>
      </div>
      <div class="how-row">
        <div class="how-icon">🔄</div>
        <div class="how-text">Heatmap updates instantly</div>
      </div>
    </div>
  </div>

  <!-- LOWER FOCUS CARD (INSPECTOR) -->
  <div class="bodymap-detail-card">
    <div class="detail-top">
      <div class="detail-name" id="det-name">Upper Clavicular Pecs</div>
      <div class="detail-badge" id="det-badge" style="background:#ff2a38; color:#ffffff;">
        Direct Hypertrophy Stimulus
      </div>
    </div>
    <div class="detail-time" id="det-time">⏳ 48 Hours Estimated Recovery Window</div>
    <div class="detail-desc" id="det-desc">
      Fatigued from incline pressing and fly patterns. High micro-trauma on clavicular fibers.
    </div>
  </div>

  <!-- QUICK PRESET BUTTONS -->
  <div class="bodymap-presets">
    <div class="presets-label">QUICK PRESET DEMOS:</div>
    <div class="preset-row">
      <button class="preset-button" id="tgl-push" type="button">⚡ Push Day Fatigue</button>
      <button class="preset-button" id="tgl-pull" type="button">⚡ Pull Day Fatigue</button>
      <button class="preset-button" id="tgl-legs" type="button">⚡ Leg Day Fatigue</button>
      <button class="preset-button" id="tgl-clear" type="button">🔄 Reset All Fresh</button>
    </div>
  </div>
`;

rootEl.appendChild(mapContainer);

// ============================================================================
// INTERACTIVE SELECTION & REPAINT HANDLERS
// ============================================================================
const detName = mapContainer.querySelector("#det-name");
const detBadge = mapContainer.querySelector("#det-badge");
const detTime = mapContainer.querySelector("#det-time");
const detDesc = mapContainer.querySelector("#det-desc");

function updateInspector(partKey) {
  const reg = muscleRegistry[partKey];
  if (!reg) return;

  const elem = mapContainer.querySelector('.muscle[data-part="' + partKey + '"]');
  const isMax = elem?.classList.contains("sore-max");
  const isMid = elem?.classList.contains("sore-mid");
  const isLow = elem?.classList.contains("sore-low");

  detName.textContent = reg.name;

  if (isMax || isMid || isLow) {
    detBadge.textContent = "Direct Hypertrophy Stimulus";
    if (isMax) detBadge.style.background = "#ff2a38";
    else if (isMid) detBadge.style.background = "#ff7315";
    else detBadge.style.background = "#ffd000";
    detBadge.style.color = isLow ? "#07101f" : "#ffffff";

    detTime.textContent = "⏳ " + reg.defaultHours + " Hours Estimated Recovery Window";
    detDesc.textContent = reg.desc;
  } else {
    detBadge.textContent = "Fresh & Fully Recovered";
    detBadge.style.background = "rgba(16, 185, 129, 0.18)";
    detBadge.style.color = "#10b981";
    detTime.textContent = "🟢 Ready for upcoming targeted training volume";
    detDesc.textContent = reg.desc + " Zero fatigue currently accumulated.";
  }
}

// Click Triggers for All Visual Muscle Paths
mapContainer.querySelectorAll(".muscle").forEach(m => {
  m.addEventListener("click", () => {
    updateInspector(m.dataset.part);
  });
});

// Preset Color Repainting
function applyPreset(activeList) {
  mapContainer.querySelectorAll(".muscle").forEach(m => {
    m.classList.remove("sore-max", "sore-mid", "sore-low", "fresh");
    const part = m.dataset.part;
    if (activeList[part]) {
      m.classList.add(activeList[part]);
    }
  });
}

mapContainer.querySelector("#tgl-push").onclick = () => {
  applyPreset({ chest_upper: "sore-max", chest_lower: "sore-mid", delts_front: "sore-mid", delts_side: "sore-low", triceps: "sore-mid" });
  updateInspector("chest_upper");
};

mapContainer.querySelector("#tgl-pull").onclick = () => {
  applyPreset({ lats: "sore-max", traps_upper: "sore-mid", delts_rear: "sore-max", biceps: "sore-max", forearms: "sore-low" });
  updateInspector("lats");
};

mapContainer.querySelector("#tgl-legs").onclick = () => {
  applyPreset({ quads: "sore-max", hamstrings: "sore-max", glutes: "sore-mid", calves_post: "sore-low", calves_ant: "sore-low" });
  updateInspector("quads");
};

mapContainer.querySelector("#tgl-clear").onclick = () => {
  applyPreset({});
  updateInspector("chest_upper");
};

// Initial Inspection Render
updateInspector("chest_upper");
```
