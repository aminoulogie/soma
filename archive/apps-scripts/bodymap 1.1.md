```dataviewjs // ============================================================================
// BODYMAP 1.0 — ANATOMICAL MUSCULOSKELETAL HEATMAP
// Refined UI + proportional front/back anatomy + interactive fatigue states
// ============================================================================

const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// ============================================================================
// MUSCLE REGISTRY
// ============================================================================

const muscleRegistry = {
  delts_front: {
    name: "Anterior Deltoid",
    region: "Front Shoulder",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Primary shoulder flexion and pressing contribution."
  },

  delts_side: {
    name: "Lateral Deltoid",
    region: "Side Shoulder",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Responsible primarily for shoulder abduction."
  },

  chest_upper: {
    name: "Upper Clavicular Pecs",
    region: "Chest",
    defaultHours: 48,
    tier: "Standard",
    desc: "Upper chest fibers emphasized during incline pressing and fly patterns."
  },

  chest_lower: {
    name: "Mid / Sternal Pecs",
    region: "Chest",
    defaultHours: 48,
    tier: "Standard",
    desc: "Main horizontal pressing musculature of the chest."
  },

  biceps: {
    name: "Biceps Brachii",
    region: "Arms",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Primary elbow flexor and pulling assistance muscle."
  },

  forearms: {
    name: "Forearm Flexors / Grip",
    region: "Arms",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Grip and wrist stabilization musculature."
  },

  abs_core: {
    name: "Rectus Abdominis & Obliques",
    region: "Core",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Primary trunk flexion and stabilization musculature."
  },

  quads: {
    name: "Quadriceps Femoris",
    region: "Thighs",
    defaultHours: 72,
    tier: "High Systemic",
    desc: "Major knee-extension group contributing heavily to lower-body fatigue."
  },

  calves_ant: {
    name: "Tibialis & Gastro Front",
    region: "Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Anterior lower-leg musculature involved in ankle control."
  },

  traps_upper: {
    name: "Trapezius & Upper Rhomboids",
    region: "Upper Back",
    defaultHours: 48,
    tier: "Standard",
    desc: "Upper-back musculature involved in scapular control and elevation."
  },

  delts_rear: {
    name: "Posterior Deltoid",
    region: "Rear Shoulder",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Rear shoulder musculature contributing to horizontal pulling."
  },

  lats: {
    name: "Latissimus Dorsi",
    region: "Back Width",
    defaultHours: 48,
    tier: "Standard",
    desc: "Large back muscle responsible for shoulder extension and adduction."
  },

  triceps: {
    name: "Triceps Brachii",
    region: "Arms",
    defaultHours: 48,
    tier: "Standard",
    desc: "Primary elbow-extension musculature."
  },

  lower_back: {
    name: "Spinal Erectors",
    region: "Lower Back",
    defaultHours: 72,
    tier: "High Axial",
    desc: "Important spinal-extension and trunk-stability musculature."
  },

  glutes: {
    name: "Gluteus Complex",
    region: "Hips",
    defaultHours: 48,
    tier: "Standard",
    desc: "Major hip-extension musculature."
  },

  hamstrings: {
    name: "Hamstring Complex",
    region: "Thighs",
    defaultHours: 72,
    tier: "High Systemic",
    desc: "Posterior thigh group involved in hip extension and knee flexion."
  },

  calves_post: {
    name: "Gastrocnemius & Soleus",
    region: "Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Posterior lower-leg group responsible for plantar flexion."
  }
};


// ============================================================================
// DEFAULT STATE
// ============================================================================

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
// STYLES
// ============================================================================

const style = document.createElement("style");

style.textContent = `
/* --------------------------------------------------------------------------
   ROOT
--------------------------------------------------------------------------- */

.bodymap-root {
  width: 100%;
  box-sizing: border-box;
  color: #f8fafc;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.bodymap-root * {
  box-sizing: border-box;
}

.bodymap-container {
  width: min(1180px, 100%);
  margin: 16px auto;
  padding: 28px 28px 24px;
  border: 1px solid rgba(88, 108, 145, 0.42);
  border-radius: 24px;
  background:
    radial-gradient(
      circle at 50% 15%,
      rgba(22, 43, 77, 0.24),
      transparent 38%
    ),
    linear-gradient(145deg, #07101f 0%, #050b15 100%);
  box-shadow:
    0 28px 70px rgba(0, 0, 0, 0.55),
    inset 0 1px 0 rgba(255,255,255,0.025);
}

/* --------------------------------------------------------------------------
   HEADER
--------------------------------------------------------------------------- */

.bodymap-header {
  text-align: center;
  margin-bottom: 24px;
}

.bodymap-title {
  margin: 0;
  color: #f8fafc;
  font-size: 1.42rem;
  line-height: 1.2;
  font-weight: 850;
  letter-spacing: -0.035em;
}

.bodymap-title-icon {
  display: inline-block;
  margin-right: 8px;
  color: #38bdf8;
}

.bodymap-subtitle {
  margin-top: 7px;
  color: #8ea0b8;
  font-size: 0.84rem;
}

/* --------------------------------------------------------------------------
   MAIN VISUAL AREA
--------------------------------------------------------------------------- */

.bodymap-visual-grid {
  display: grid;
  grid-template-columns: 190px minmax(440px, 1fr) 190px;
  align-items: center;
  gap: 18px;
  min-height: 500px;
}

.bodymap-side-panel {
  height: fit-content;
  padding: 20px 18px;
  border: 1px solid rgba(76, 98, 137, 0.40);
  border-radius: 17px;
  background: rgba(9, 18, 33, 0.74);
  box-shadow:
    0 15px 40px rgba(0,0,0,0.22),
    inset 0 1px 0 rgba(255,255,255,0.018);
}

.bodymap-side-title {
  margin: 0 0 19px;
  color: #a7b5ca;
  font-size: 0.73rem;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.bodymap-side-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 0 0 17px;
}

.bodymap-side-row:last-child {
  margin-bottom: 0;
}

.bodymap-dot {
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
  margin-top: 3px;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255,255,255,0.08);
}

.bodymap-side-main {
  color: #e8eef7;
  font-size: 0.82rem;
  font-weight: 720;
  line-height: 1.25;
}

.bodymap-side-sub {
  margin-top: 3px;
  color: #70819a;
  font-size: 0.68rem;
  line-height: 1.35;
}

.dot-red {
  background: #ff3f47;
  box-shadow: 0 0 12px rgba(255,63,71,0.45);
}

.dot-orange {
  background: #ff8a1f;
  box-shadow: 0 0 12px rgba(255,138,31,0.42);
}

.dot-yellow {
  background: #ffd11a;
  box-shadow: 0 0 12px rgba(255,209,26,0.35);
}

.dot-green {
  background: #63cf3d;
  box-shadow: 0 0 12px rgba(99,207,61,0.30);
}

.dot-bluegray {
  background: #33435f;
}

/* --------------------------------------------------------------------------
   HOW TO USE
--------------------------------------------------------------------------- */

.how-row {
  display: grid;
  grid-template-columns: 31px 1fr;
  gap: 10px;
  align-items: start;
  margin-bottom: 18px;
}

.how-row:last-child {
  margin-bottom: 0;
}

.how-icon {
  width: 31px;
  height: 31px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #c8d5e8;
  background: rgba(31, 47, 72, 0.55);
  border: 1px solid rgba(92, 114, 153, 0.22);
  font-size: 0.82rem;
}

.how-text {
  color: #d6dfeb;
  font-size: 0.79rem;
  line-height: 1.45;
}

/* --------------------------------------------------------------------------
   FIGURES
--------------------------------------------------------------------------- */

.bodymap-figures {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 72px;
  min-width: 0;
}

.bodymap-figure-wrap {
  position: relative;
  width: 205px;
  text-align: center;
}

.bodymap-figure-label {
  margin-bottom: 7px;
  color: #526783;
  font-size: 0.67rem;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.bodymap-svg {
  width: 205px;
  height: 505px;
  overflow: visible;
  display: block;
}

/* body base */
.body-base {
  fill: url(#bodyGradient);
  stroke: #172742;
  stroke-width: 1.7;
}

/* body contour */
.body-outline {
  fill: none;
  stroke: rgba(133, 154, 187, 0.24);
  stroke-width: 1.3;
}

/* inactive muscle */
.muscle {
  fill: #172238;
  stroke: #09111f;
  stroke-width: 1.45;
  cursor: pointer;
  transition:
    fill 0.18s ease,
    filter 0.18s ease,
    transform 0.18s ease,
    opacity 0.18s ease;
}

.muscle:hover {
  fill: #29405e !important;
  filter:
    drop-shadow(0 0 5px rgba(56,189,248,0.42));
}

/* heatmap */
.muscle.sore-max {
  fill: #ff3e45 !important;
  filter:
    drop-shadow(0 0 7px rgba(255,62,69,0.62));
}

.muscle.sore-mid {
  fill: #ff781f !important;
  filter:
    drop-shadow(0 0 7px rgba(255,120,31,0.53));
}

.muscle.sore-low {
  fill: #ffd11a !important;
  filter:
    drop-shadow(0 0 6px rgba(255,209,26,0.45));
}

.muscle.fresh {
  fill: #5ecb3e !important;
  filter:
    drop-shadow(0 0 6px rgba(94,203,62,0.38));
}

/* anatomical center lines */
.anatomy-line {
  stroke: rgba(11, 20, 36, 0.78);
  stroke-width: 1.6;
  fill: none;
  pointer-events: none;
}

.anatomy-soft {
  stroke: rgba(112, 132, 161, 0.17);
  stroke-width: 1.15;
  fill: none;
  pointer-events: none;
}

/* --------------------------------------------------------------------------
   DETAIL CARD
--------------------------------------------------------------------------- */

.bodymap-detail-card {
  margin-top: 21px;
  padding: 18px 20px 19px;
  border: 1px solid rgba(33, 83, 180, 0.95);
  border-radius: 17px;
  background:
    linear-gradient(
      145deg,
      rgba(8, 18, 34, 0.98),
      rgba(7, 16, 29, 0.96)
    );
  box-shadow:
    inset 0 1px 0 rgba(96,165,250,0.03),
    0 14px 30px rgba(0,0,0,0.18);
}

.detail-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.detail-name {
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 850;
  letter-spacing: -0.015em;
}

.detail-badge {
  flex: 0 0 auto;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 0.72rem;
  font-weight: 850;
  white-space: nowrap;
}

.detail-time {
  margin-top: 7px;
  color: #38bdf8;
  font-size: 0.86rem;
  font-weight: 820;
}

.detail-desc {
  margin-top: 6px;
  color: #8da0ba;
  font-size: 0.76rem;
  line-height: 1.45;
}

/* --------------------------------------------------------------------------
   PRESET BAR
--------------------------------------------------------------------------- */

.bodymap-presets {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 1px solid rgba(74, 94, 125, 0.28);
}

.presets-label {
  margin-bottom: 10px;
  color: #60738e;
  font-size: 0.68rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.preset-button {
  border: 1px solid rgba(70, 91, 125, 0.42);
  border-radius: 9px;
  padding: 8px 12px;
  background: rgba(17, 30, 49, 0.86);
  color: #ced9e8;
  font-size: 0.73rem;
  font-weight: 750;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.preset-button:hover {
  border-color: rgba(56,189,248,0.72);
  background: rgba(20, 39, 63, 0.95);
  color: #ffffff;
  transform: translateY(-1px);
}

.preset-button:active {
  transform: translateY(0);
}

/* --------------------------------------------------------------------------
   RESPONSIVE
--------------------------------------------------------------------------- */

@media (max-width: 1020px) {
  .bodymap-visual-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .bodymap-side-panel {
    width: 100%;
  }

  .bodymap-side-title {
    margin-bottom: 12px;
  }

  .bodymap-side-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }

  .how-row {
    margin-bottom: 0;
  }
}

@media (max-width: 720px) {
  .bodymap-container {
    padding: 20px 14px 18px;
    border-radius: 18px;
  }

  .bodymap-title {
    font-size: 1.1rem;
  }

  .bodymap-subtitle {
    font-size: 0.72rem;
  }

  .bodymap-figures {
    gap: 12px;
  }

  .bodymap-figure-wrap {
    width: 155px;
  }

  .bodymap-svg {
    width: 155px;
    height: 410px;
  }

  .bodymap-side-content {
    grid-template-columns: 1fr;
  }

  .detail-top {
    align-items: flex-start;
    flex-direction: column;
  }

  .detail-badge {
    white-space: normal;
  }
}
`;

rootEl.appendChild(style);


// ============================================================================
// MAIN CONTAINER
// ============================================================================

const mapContainer = document.createElement("div");
mapContainer.className = "bodymap-container";


// ============================================================================
// SVG DEFINITIONS
// ============================================================================

const svgDefs = `
<defs>
  <linearGradient id="bodyGradient" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#24334c"/>
    <stop offset="48%" stop-color="#17243a"/>
    <stop offset="100%" stop-color="#0e192b"/>
  </linearGradient>

  <radialGradient id="headGradient" cx="50%" cy="28%" r="70%">
    <stop offset="0%" stop-color="#2b3b56"/>
    <stop offset="100%" stop-color="#111c2f"/>
  </radialGradient>
</defs>
`;


// ============================================================================
// FRONT BODY
// ============================================================================

const anteriorSVG = `
<svg
  class="bodymap-svg"
  viewBox="0 0 220 510"
  xmlns="http://www.w3.org/2000/svg"
>
  ${svgDefs}

  <!-- Head -->
  <ellipse
    cx="110"
    cy="28"
    rx="23"
    ry="28"
    fill="url(#headGradient)"
    stroke="#172742"
    stroke-width="1.5"
  />

  <!-- Neck -->
  <path
    class="body-base"
    d="
      M95 48
      C96 58 95 63 89 70
      L131 70
      C125 63 124 58 125 48
      Z
    "
  />

  <!-- Main torso silhouette -->
  <path
    class="body-base"
    d="
      M89 68
      C73 70 59 82 52 103
      C47 119 51 141 57 158
      C62 173 70 188 77 200

      L82 227

      C80 247 76 268 75 290
      C74 307 79 320 88 324
      L98 322
      L110 315
      L122 322
      L132 324

      C141 320 146 307 145 290
      C144 268 140 247 138 227

      L143 200
      C150 188 158 173 163 158
      C169 141 173 119 168 103
      C161 82 147 70 131 68
      Z
    "
  />

  <!-- pelvis -->
  <path
    class="body-base"
    d="
      M81 196
      C86 188 97 184 110 184
      C123 184 134 188 139 196
      L136 222
      C129 233 122 240 110 241
      C98 240 91 233 84 222
      Z
    "
  />

  <!-- left arm silhouette -->
  <path
    class="body-base"
    d="
      M57 90
      C47 92 40 104 38 120
      C35 142 35 164 37 184
      C39 202 45 220 51 229
      C56 231 61 227 64 220
      C62 206 59 188 60 170
      C61 151 65 130 69 114
      C71 101 66 94 57 90
      Z
    "
  />

  <!-- right arm silhouette -->
  <path
    class="body-base"
    d="
      M163 90
      C173 92 180 104 182 120
      C185 142 185 164 183 184
      C181 202 175 220 169 229
      C164 231 159 227 156 220
      C158 206 161 188 160 170
      C159 151 155 130 151 114
      C149 101 154 94 163 90
      Z
    "
  />

  <!-- LEFT FRONT DELTOID -->
  <path
    class="muscle ${activeSorenessMap.delts_front || ""}"
    data-part="delts_front"
    d="
      M68 85
      C58 80 51 88 50 100
      C50 111 55 120 64 124
      C69 114 72 101 72 91
      C71 88 70 86 68 85
      Z
    "
  />

  <!-- RIGHT FRONT DELTOID -->
  <path
    class="muscle ${activeSorenessMap.delts_front || ""}"
    data-part="delts_front"
    d="
      M152 85
      C162 80 169 88 170 100
      C170 111 165 120 156 124
      C151 114 148 101 148 91
      C149 88 150 86 152 85
      Z
    "
  />

  <!-- LEFT LATERAL DELTOID -->
  <path
    class="muscle ${activeSorenessMap.delts_side || ""}"
    data-part="delts_side"
    d="
      M51 91
      C43 96 41 107 44 119
      C46 125 50 131 55 134
      C60 123 62 111 59 98
      C57 94 54 92 51 91
      Z
    "
  />

  <!-- RIGHT LATERAL DELTOID -->
  <path
    class="muscle ${activeSorenessMap.delts_side || ""}"
    data-part="delts_side"
    d="
      M169 91
      C177 96 179 107 176 119
      C174 125 170 131 165 134
      C160 123 158 111 161 98
      C163 94 166 92 169 91
      Z
    "
  />

  <!-- UPPER CHEST -->
  <path
    class="muscle ${activeSorenessMap.chest_upper || ""}"
    data-part="chest_upper"
    d="
      M69 92
      C80 82 94 80 108 91
      L108 117
      C94 116 80 114 68 107
      C66 101 66 96 69 92
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.chest_upper || ""}"
    data-part="chest_upper"
    d="
      M151 92
      C140 82 126 80 112 91
      L112 117
      C126 116 140 114 152 107
      C154 101 154 96 151 92
      Z
    "
  />

  <!-- MID / LOWER CHEST -->
  <path
    class="muscle ${activeSorenessMap.chest_lower || ""}"
    data-part="chest_lower"
    d="
      M68 108
      C80 111 94 118 108 119
      L108 145
      C94 145 80 141 68 132
      C65 124 65 116 68 108
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.chest_lower || ""}"
    data-part="chest_lower"
    d="
      M152 108
      C140 111 126 118 112 119
      L112 145
      C126 145 140 141 152 132
      C155 124 155 116 152 108
      Z
    "
  />

  <!-- BICEPS -->
  <path
    class="muscle ${activeSorenessMap.biceps || ""}"
    data-part="biceps"
    d="
      M53 128
      C47 136 47 151 50 166
      C52 173 56 177 61 177
      C64 164 64 146 61 132
      C59 128 56 127 53 128
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.biceps || ""}"
    data-part="biceps"
    d="
      M167 128
      C173 136 173 151 170 166
      C168 173 164 177 159 177
      C156 164 156 146 159 132
      C161 128 164 127 167 128
      Z
    "
  />

  <!-- FOREARMS -->
  <path
    class="muscle ${activeSorenessMap.forearms || ""}"
    data-part="forearms"
    d="
      M49 176
      C42 181 40 194 43 207
      C46 219 51 227 57 231
      C61 229 63 224 61 216
      C57 205 56 193 58 181
      C56 177 53 175 49 176
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.forearms || ""}"
    data-part="forearms"
    d="
      M171 176
      C178 181 180 194 177 207
      C174 219 169 227 163 231
      C159 229 157 224 159 216
      C163 205 164 193 162 181
      C164 177 167 175 171 176
      Z
    "
  />

  <!-- CORE / ABS -->
  <path
    class="muscle ${activeSorenessMap.abs_core || ""}"
    data-part="abs_core"
    d="
      M91 145
      C98 141 104 140 110 141
      L110 192
      C102 193 96 191 90 187
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.abs_core || ""}"
    data-part="abs_core"
    d="
      M129 145
      C122 141 116 140 110 141
      L110 192
      C118 193 124 191 130 187
      Z
    "
  />

  <!-- QUADS -->
  <path
    class="muscle ${activeSorenessMap.quads || ""}"
    data-part="quads"
    d="
      M85 224
      C79 239 78 259 80 279
      C82 292 87 303 97 306
      C104 292 106 265 104 241
      C98 231 92 226 85 224
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.quads || ""}"
    data-part="quads"
    d="
      M135 224
      C141 239 142 259 140 279
      C138 292 133 303 123 306
      C116 292 114 265 116 241
      C122 231 128 226 135 224
      Z
    "
  />

  <!-- FRONT CALVES -->
  <path
    class="muscle ${activeSorenessMap.calves_ant || ""}"
    data-part="calves_ant"
    d="
      M88 309
      C82 321 82 343 87 362
      C90 374 95 383 100 386
      C104 379 105 363 104 345
      C103 328 99 316 95 308
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.calves_ant || ""}"
    data-part="calves_ant"
    d="
      M132 309
      C138 321 138 343 133 362
      C130 374 125 383 120 386
      C116 379 115 363 116 345
      C117 328 121 316 125 308
      Z
    "
  />

  <!-- FEET -->
  <path
    class="body-base"
    d="
      M87 382
      C82 384 78 392 80 399
      C87 403 101 404 108 400
      L108 391
      C101 386 94 383 87 382
      Z
    "
  />

  <path
    class="body-base"
    d="
      M133 382
      C138 384 142 392 140 399
      C133 403 119 404 112 400
      L112 391
      C119 386 126 383 133 382
      Z
    "
  />

  <!-- anatomical center -->
  <path
    class="anatomy-line"
    d="M110 73 C110 100 110 127 110 158 C110 177 110 198 110 220"
  />

  <path
    class="anatomy-soft"
    d="
      M82 153
      C91 158 100 159 110 158
      C120 159 129 158 138 153
    "
  />
</svg>
`;


// ============================================================================
// BACK BODY
// ============================================================================

const posteriorSVG = `
<svg
  class="bodymap-svg"
  viewBox="0 0 220 510"
  xmlns="http://www.w3.org/2000/svg"
>
  ${svgDefs}

  <!-- Head -->
  <ellipse
    cx="110"
    cy="28"
    rx="23"
    ry="28"
    fill="url(#headGradient)"
    stroke="#172742"
    stroke-width="1.5"
  />

  <!-- Neck -->
  <path
    class="body-base"
    d="
      M95 48
      C96 58 95 63 89 70
      L131 70
      C125 63 124 58 125 48
      Z
    "
  />

  <!-- torso -->
  <path
    class="body-base"
    d="
      M89 68
      C73 70 59 82 52 103
      C47 119 51 141 57 158
      C62 173 70 188 77 200

      L82 227

      C80 247 76 268 75 290
      C74 307 79 320 88 324
      L98 322
      L110 315
      L122 322
      L132 324

      C141 320 146 307 145 290
      C144 268 140 247 138 227

      L143 200
      C150 188 158 173 163 158
      C169 141 173 119 168 103
      C161 82 147 70 131 68
      Z
    "
  />

  <!-- pelvis -->
  <path
    class="body-base"
    d="
      M81 196
      C86 188 97 184 110 184
      C123 184 134 188 139 196
      L136 222
      C129 233 122 240 110 241
      C98 240 91 233 84 222
      Z
    "
  />

  <!-- LEFT ARM -->
  <path
    class="body-base"
    d="
      M57 90
      C47 92 40 104 38 120
      C35 142 35 164 37 184
      C39 202 45 220 51 229
      C56 231 61 227 64 220
      C62 206 59 188 60 170
      C61 151 65 130 69 114
      C71 101 66 94 57 90
      Z
    "
  />

  <!-- RIGHT ARM -->
  <path
    class="body-base"
    d="
      M163 90
      C173 92 180 104 182 120
      C185 142 185 164 183 184
      C181 202 175 220 169 229
      C164 231 159 227 156 220
      C158 206 161 188 160 170
      C159 151 155 130 151 114
      C149 101 154 94 163 90
      Z
    "
  />

  <!-- UPPER TRAPS -->
  <path
    class="muscle ${activeSorenessMap.traps_upper || ""}"
    data-part="traps_upper"
    d="
      M91 68
      L110 79
      L129 68
      C129 77 130 86 137 97
      C127 98 118 99 110 108
      C102 99 93 98 83 97
      C90 86 91 77 91 68
      Z
    "
  />

  <!-- REAR DELTS -->
  <path
    class="muscle ${activeSorenessMap.delts_rear || ""}"
    data-part="delts_rear"
    d="
      M67 85
      C57 80 50 88 50 100
      C50 111 55 120 64 124
      C70 114 72 101 71 92
      C70 88 69 86 67 85
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.delts_rear || ""}"
    data-part="delts_rear"
    d="
      M153 85
      C163 80 170 88 170 100
      C170 111 165 120 156 124
      C150 114 148 101 149 92
      C150 88 151 86 153 85
      Z
    "
  />

  <!-- LATS -->
  <path
    class="muscle ${activeSorenessMap.lats || ""}"
    data-part="lats"
    d="
      M84 96
      C72 101 65 115 68 132
      C71 150 83 165 97 171
      C103 157 105 137 105 116
      C101 105 94 98 84 96
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.lats || ""}"
    data-part="lats"
    d="
      M136 96
      C148 101 155 115 152 132
      C149 150 137 165 123 171
      C117 157 115 137 115 116
      C119 105 126 98 136 96
      Z
    "
  />

  <!-- TRICEPS -->
  <path
    class="muscle ${activeSorenessMap.triceps || ""}"
    data-part="triceps"
    d="
      M53 126
      C47 135 47 151 50 166
      C52 174 56 178 61 177
      C64 163 64 146 61 132
      C59 128 56 126 53 126
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.triceps || ""}"
    data-part="triceps"
    d="
      M167 126
      C173 135 173 151 170 166
      C168 174 164 178 159 177
      C156 163 156 146 159 132
      C161 128 164 126 167 126
      Z
    "
  />

  <!-- LOWER BACK / ERECTORS -->
  <path
    class="muscle ${activeSorenessMap.lower_back || ""}"
    data-part="lower_back"
    d="
      M99 134
      C94 145 94 160 98 182
      L104 203
      L108 203
      L108 135
      C105 133 102 133 99 134
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.lower_back || ""}"
    data-part="lower_back"
    d="
      M121 134
      C126 145 126 160 122 182
      L116 203
      L112 203
      L112 135
      C115 133 118 133 121 134
      Z
    "
  />

  <!-- GLUTES -->
  <path
    class="muscle ${activeSorenessMap.glutes || ""}"
    data-part="glutes"
    d="
      M84 189
      C92 183 103 186 108 198
      L105 226
      C98 235 89 234 82 226
      C78 214 79 199 84 189
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.glutes || ""}"
    data-part="glutes"
    d="
      M136 189
      C128 183 117 186 112 198
      L115 226
      C122 235 131 234 138 226
      C142 214 141 199 136 189
      Z
    "
  />

  <!-- HAMSTRINGS -->
  <path
    class="muscle ${activeSorenessMap.hamstrings || ""}"
    data-part="hamstrings"
    d="
      M86 226
      C80 239 79 258 81 278
      C83 293 89 304 98 307
      C103 294 105 274 104 249
      C100 238 94 229 86 226
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.hamstrings || ""}"
    data-part="hamstrings"
    d="
      M134 226
      C140 239 141 258 139 278
      C137 293 131 304 122 307
      C117 294 115 274 116 249
      C120 238 126 229 134 226
      Z
    "
  />

  <!-- POSTERIOR CALVES -->
  <path
    class="muscle ${activeSorenessMap.calves_post || ""}"
    data-part="calves_post"
    d="
      M88 308
      C82 321 83 343 88 361
      C91 373 96 382 101 385
      C106 377 106 361 104 344
      C102 327 98 316 95 308
      Z
    "
  />

  <path
    class="muscle ${activeSorenessMap.calves_post || ""}"
    data-part="calves_post"
    d="
      M132 308
      C138 321 137 343 132 361
      C129 373 124 382 119 385
      C114 377 114 361 116 344
      C118 327 122 316 125 308
      Z
    "
  />

  <!-- FEET -->
  <path
    class="body-base"
    d="
      M87 382
      C82 384 78 392 80 399
      C87 403 101 404 108 400
      L108 391
      C101 386 94 383 87 382
      Z
    "
  />

  <path
    class="body-base"
    d="
      M133 382
      C138 384 142 392 140 399
      C133 403 119 404 112 400
      L112 391
      C119 386 126 383 133 382
      Z
    "
  />

  <!-- spine -->
  <path
    class="anatomy-line"
    d="M110 74 C110 112 110 150 110 186 C110 210 110 220 110 235"
  />

  <path
    class="anatomy-soft"
    d="M73 130 C85 136 96 138 110 139 C124 138 135 136 147 130"
  />
</svg>
`;


// ============================================================================
// HTML
// ============================================================================

mapContainer.innerHTML = `
  <div class="bodymap-header">
    <h3 class="bodymap-title">
      <span class="bodymap-title-icon">▣</span>
      Anatomical Musculoskeletal Heatmap
    </h3>

    <div class="bodymap-subtitle">
      Click any anatomical section or test toggle to inspect metabolic fatigue
    </div>
  </div>

  <div class="bodymap-visual-grid">

    <!-- LEFT LEGEND -->
    <div class="bodymap-side-panel">

      <div class="bodymap-side-title">
        Fatigue Level
      </div>

      <div class="bodymap-side-content">

        <div class="bodymap-side-row">
          <span class="bodymap-dot dot-red"></span>
          <div>
            <div class="bodymap-side-main">High</div>
            <div class="bodymap-side-sub">Severe Fatigue</div>
          </div>
        </div>

        <div class="bodymap-side-row">
          <span class="bodymap-dot dot-orange"></span>
          <div>
            <div class="bodymap-side-main">Moderate</div>
            <div class="bodymap-side-sub">Noticeable Fatigue</div>
          </div>
        </div>

        <div class="bodymap-side-row">
          <span class="bodymap-dot dot-yellow"></span>
          <div>
            <div class="bodymap-side-main">Low</div>
            <div class="bodymap-side-sub">Mild Fatigue</div>
          </div>
        </div>

        <div class="bodymap-side-row">
          <span class="bodymap-dot dot-green"></span>
          <div>
            <div class="bodymap-side-main">Fresh</div>
            <div class="bodymap-side-sub">Recovered</div>
          </div>
        </div>

        <div class="bodymap-side-row">
          <span class="bodymap-dot dot-bluegray"></span>
          <div>
            <div class="bodymap-side-main">Inactive</div>
            <div class="bodymap-side-sub">No Data</div>
          </div>
        </div>

      </div>
    </div>


    <!-- BODY FIGURES -->
    <div class="bodymap-figures">

      <div class="bodymap-figure-wrap">
        <div class="bodymap-figure-label">Anterior</div>
        ${anteriorSVG}
      </div>

      <div class="bodymap-figure-wrap">
        <div class="bodymap-figure-label">Posterior</div>
        ${posteriorSVG}
      </div>

    </div>


    <!-- HOW TO USE -->
    <div class="bodymap-side-panel">

      <div class="bodymap-side-title">
        How to Use
      </div>

      <div class="how-row">
        <div class="how-icon">⌁</div>
        <div class="how-text">
          Click any muscle group to view details
        </div>
      </div>

      <div class="how-row">
        <div class="how-icon">ϟ</div>
        <div class="how-text">
          Use test toggles to simulate fatigue
        </div>
      </div>

      <div class="how-row">
        <div class="how-icon">↻</div>
        <div class="how-text">
          Heatmap updates instantly
        </div>
      </div>

    </div>

  </div>


  <!-- DETAIL CARD -->
  <div class="bodymap-detail-card">

    <div class="detail-top">
      <div class="detail-name" id="det-name">
        Upper Clavicular Pecs
      </div>

      <div
        class="detail-badge"
        id="det-badge"
        style="
          background:#ff4148;
          color:#ffffff;
        "
      >
        Direct Hypertrophy Stimulus
      </div>
    </div>

    <div class="detail-time" id="det-time">
      ⌛ 48 Hours Estimated Recovery Window
    </div>

    <div class="detail-desc" id="det-desc">
      Fatigued from incline pressing and fly patterns.
      High micro-trauma on clavicular fibers.
    </div>

  </div>


  <!-- PRESETS -->
  <div class="bodymap-presets">

    <div class="presets-label">
      Quick Preset Demos:
    </div>

    <div class="preset-row">

      <button
        class="preset-button"
        id="tgl-push"
        type="button"
      >
        ϟ Push Day Fatigue
      </button>

      <button
        class="preset-button"
        id="tgl-pull"
        type="button"
      >
        ϟ Pull Day Fatigue
      </button>

      <button
        class="preset-button"
        id="tgl-legs"
        type="button"
      >
        ϟ Leg Day Fatigue
      </button>

      <button
        class="preset-button"
        id="tgl-clear"
        type="button"
      >
        ↻ Reset All Fresh
      </button>

    </div>

  </div>
`;

rootEl.appendChild(mapContainer);


// ============================================================================
// INSPECTOR
// ============================================================================

const detName = mapContainer.querySelector("#det-name");
const detBadge = mapContainer.querySelector("#det-badge");
const detTime = mapContainer.querySelector("#det-time");
const detDesc = mapContainer.querySelector("#det-desc");


// ============================================================================
// UPDATE INSPECTOR
// ============================================================================

function updateInspector(partKey) {

  const reg = muscleRegistry[partKey];

  if (!reg) return;

  const elem = mapContainer.querySelector(
    '.muscle[data-part="' + partKey + '"]'
  );

  const isMax = elem?.classList.contains("sore-max");
  const isMid = elem?.classList.contains("sore-mid");
  const isLow = elem?.classList.contains("sore-low");
  const isFresh = elem?.classList.contains("fresh");

  detName.textContent =
    reg.name + " (" + reg.region + ")";


  if (isMax || isMid || isLow) {

    detBadge.textContent =
      "Direct Hypertrophy Stimulus";

    if (isMax) {
      detBadge.style.background = "#ff3f47";
    }
    else if (isMid) {
      detBadge.style.background = "#ff781f";
    }
    else {
      detBadge.style.background = "#d7ae18";
    }

    detBadge.style.color = "#ffffff";

    detTime.textContent =
      "⌛ " +
      reg.defaultHours +
      " Hours Estimated Recovery Window";

    detDesc.textContent =
      reg.desc +
      " Fatigue currently logged from recent training exposure.";

  }
  else {

    detBadge.textContent =
      "Fresh & Fully Recovered";

    detBadge.style.background =
      "rgba(92,203,62,0.14)";

    detBadge.style.color =
      "#82d964";

    detTime.textContent =
      "● Ready for upcoming training volume";

    detDesc.textContent =
      reg.desc +
      " No significant fatigue currently registered.";
  }
}


// ============================================================================
// MUSCLE CLICK HANDLERS
// ============================================================================

mapContainer.querySelectorAll(".muscle").forEach(muscle => {

  muscle.addEventListener("click", () => {
    updateInspector(muscle.dataset.part);
  });

});


// ============================================================================
// PRESET SYSTEM
// ============================================================================

function applyPreset(activeList) {

  mapContainer
    .querySelectorAll(".muscle")
    .forEach(m => {

      m.classList.remove(
        "sore-max",
        "sore-mid",
        "sore-low",
        "fresh"
      );

      const part = m.dataset.part;

      if (activeList[part]) {
        m.classList.add(activeList[part]);
      }

    });
}


// PUSH DAY
mapContainer
  .querySelector("#tgl-push")
  .addEventListener("click", () => {

    applyPreset({
      chest_upper: "sore-max",
      chest_lower: "sore-max",
      delts_front: "sore-mid",
      delts_side: "sore-mid",
      triceps: "sore-max"
    });

    updateInspector("chest_upper");
  });


// PULL DAY
mapContainer
  .querySelector("#tgl-pull")
  .addEventListener("click", () => {

    applyPreset({
      lats: "sore-max",
      traps_upper: "sore-mid",
      delts_rear: "sore-max",
      biceps: "sore-max",
      forearms: "sore-mid"
    });

    updateInspector("lats");
  });


// LEG DAY
mapContainer
  .querySelector("#tgl-legs")
  .addEventListener("click", () => {

    applyPreset({
      quads: "sore-max",
      hamstrings: "sore-max",
      glutes: "sore-mid",
      calves_post: "sore-max",
      calves_ant: "sore-low"
    });

    updateInspector("quads");
  });


// RESET
mapContainer
  .querySelector("#tgl-clear")
  .addEventListener("click", () => {

    applyPreset({});

    updateInspector("chest_upper");
  });


// ============================================================================
// INITIAL STATE
// ============================================================================

updateInspector("chest_upper");
```

