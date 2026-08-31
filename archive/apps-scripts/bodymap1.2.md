```dataviewjs
const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// ============================================================================
// MUSCLE REGISTRY & RECOVERY SPECIFICATIONS
// ============================================================================
const muscleRegistry = {
  delts_front: {
    name: "Anterior Deltoid",
    region: "Front Shoulder",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Primary shoulder flexion and pressing contribution. High involvement in incline and overhead lifts."
  },
  delts_side: {
    name: "Lateral Deltoid",
    region: "Side Shoulder",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Responsible primarily for shoulder abduction and shoulder width. Tolerates high weekly frequency."
  },
  chest_upper: {
    name: "Upper Clavicular Pecs",
    region: "Chest",
    defaultHours: 48,
    tier: "Standard",
    desc: "Upper chest fibers emphasized during incline pressing and low-to-high fly patterns."
  },
  chest_lower: {
    name: "Mid / Sternal Pecs",
    region: "Chest",
    defaultHours: 48,
    tier: "Standard",
    desc: "Main horizontal pressing musculature of the chest responsible for sternal and costal adduction."
  },
  biceps: {
    name: "Biceps Brachii",
    region: "Arms",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Primary elbow flexor and pulling assistance muscle. Recovers relatively fast from curling volume."
  },
  forearms: {
    name: "Forearm Flexors / Grip",
    region: "Arms",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Grip and wrist stabilization musculature. Dense slow-twitch composition allowing rapid recovery."
  },
  abs_core: {
    name: "Rectus Abdominis & Core",
    region: "Core",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Primary trunk flexion and intra-abdominal pressure stabilization."
  },
  quads: {
    name: "Quadriceps Femoris",
    region: "Thighs",
    defaultHours: 72,
    tier: "High Systemic",
    desc: "Major knee-extension group (rectus femoris, vastus medialis/lateralis) contributing heavily to systemic fatigue."
  },
  calves_ant: {
    name: "Tibialis & Lower Leg",
    region: "Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Anterior lower-leg musculature involved in ankle dorsiflexion and foot stability."
  },
  traps_upper: {
    name: "Trapezius & Upper Rhomboids",
    region: "Upper Back",
    defaultHours: 48,
    tier: "Standard",
    desc: "Upper-back musculature involved in scapular elevation, retraction, and neck stability."
  },
  delts_rear: {
    name: "Posterior Deltoid",
    region: "Rear Shoulder",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Rear shoulder musculature contributing to horizontal pulling, face pulls, and shoulder health."
  },
  lats: {
    name: "Latissimus Dorsi",
    region: "Back Width",
    defaultHours: 48,
    tier: "Standard",
    desc: "Large sweeping back muscle responsible for shoulder extension, vertical pulling, and adduction."
  },
  triceps: {
    name: "Triceps Brachii",
    region: "Arms",
    defaultHours: 48,
    tier: "Standard",
    desc: "Primary elbow-extension musculature (long, lateral, and medial heads) heavily loaded during lockouts."
  },
  lower_back: {
    name: "Spinal Erectors",
    region: "Lower Back",
    defaultHours: 72,
    tier: "High Axial",
    desc: "Crucial spinal-extension and trunk-stability columns. High axial fatigue requiring extended recovery."
  },
  glutes: {
    name: "Gluteus Complex",
    region: "Hips",
    defaultHours: 48,
    tier: "Standard",
    desc: "Major hip-extension and pelvic stabilization musculature loaded heavily in squats and hip thrusts."
  },
  hamstrings: {
    name: "Hamstring Complex",
    region: "Thighs",
    defaultHours: 72,
    tier: "High Systemic",
    desc: "Posterior thigh group involved in hip extension and knee flexion with high stretch-induced muscle damage."
  },
  calves_post: {
    name: "Gastrocnemius & Soleus",
    region: "Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Posterior lower-leg calf complex responsible for plantar flexion. Highly fatigue-resistant."
  }
};

// Default Initial Heatmap State
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
.bodymap-root {
  width: 100%;
  box-sizing: border-box;
  color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
}
.bodymap-root * { box-sizing: border-box; }

.bodymap-container {
  width: min(1080px, 100%);
  margin: 16px auto;
  padding: 30px 28px 24px;
  border: 1px solid rgba(88, 108, 145, 0.42);
  border-radius: 26px;
  background: radial-gradient(circle at 50% 12%, rgba(26, 48, 86, 0.28), transparent 42%), linear-gradient(145deg, #07101f 0%, #050b15 100%);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

.bodymap-header { text-align: center; margin-bottom: 24px; }
.bodymap-title { margin: 0; color: #f8fafc; font-size: 1.45rem; font-weight: 850; letter-spacing: -0.03em; }
.bodymap-title-icon { display: inline-block; margin-right: 8px; color: #38bdf8; }
.bodymap-subtitle { margin-top: 6px; color: #8ea0b8; font-size: 0.84rem; }

/* 3-Column Visual Grid */
.bodymap-visual-grid {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  align-items: center;
  gap: 20px;
  min-height: 520px;
}

.bodymap-side-panel {
  height: fit-content;
  padding: 22px 18px;
  border: 1px solid rgba(76, 98, 137, 0.35);
  border-radius: 18px;
  background: rgba(9, 18, 33, 0.74);
  box-shadow: 0 15px 35px rgba(0,0,0,0.22);
}

.bodymap-side-title {
  margin: 0 0 18px;
  color: #a7b5ca;
  font-size: 0.74rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bodymap-side-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.bodymap-side-row:last-child { margin-bottom: 0; }
.bodymap-dot { flex: 0 0 13px; width: 13px; height: 13px; margin-top: 3px; border-radius: 50%; }
.bodymap-side-main { color: #e8eef7; font-size: 0.84rem; font-weight: 750; line-height: 1.2; }
.bodymap-side-sub { margin-top: 2px; color: #70819a; font-size: 0.68rem; }

.dot-red { background: #ff3e45; box-shadow: 0 0 12px rgba(255,62,69,0.55); }
.dot-orange { background: #ff781f; box-shadow: 0 0 12px rgba(255,120,31,0.50); }
.dot-yellow { background: #ffd11a; box-shadow: 0 0 12px rgba(255,209,26,0.45); }
.dot-green { background: #5ecb3e; box-shadow: 0 0 12px rgba(94,203,62,0.40); }
.dot-bluegray { background: #33435f; }

/* How to Use Section */
.how-row { display: grid; grid-template-columns: 32px 1fr; gap: 10px; align-items: center; margin-bottom: 18px; }
.how-row:last-child { margin-bottom: 0; }
.how-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #c8d5e8;
  background: rgba(31, 47, 72, 0.55);
  border: 1px solid rgba(92, 114, 153, 0.25);
  font-size: 0.85rem;
}
.how-text { color: #d6dfeb; font-size: 0.78rem; line-height: 1.4; }

/* Anatomy Figures Viewport */
.bodymap-figures {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 50px;
  min-width: 0;
}
.bodymap-figure-wrap { position: relative; width: 220px; text-align: center; }
.bodymap-figure-label { margin-bottom: 8px; color: #526783; font-size: 0.68rem; font-weight: 850; letter-spacing: 0.15em; text-transform: uppercase; }
.bodymap-svg { width: 220px; height: 500px; overflow: visible; display: block; filter: drop-shadow(0 10px 25px rgba(0,0,0,0.55)); }

/* Vector Anatomy Layers */
.body-base { fill: url(#bodyGradient); stroke: #0e1828; stroke-width: 1.2; }
.body-sculpt { fill: #1b263b; stroke: #09111f; stroke-width: 1.1; opacity: 0.85; pointer-events: none; }
.body-striation { fill: none; stroke: rgba(255, 255, 255, 0.06); stroke-width: 1; pointer-events: none; }

/* Muscle Interactive Layer */
.muscle {
  fill: #152238;
  stroke: #070d19;
  stroke-width: 1.35;
  cursor: pointer;
  transition: fill 0.2s ease, filter 0.2s ease, transform 0.15s ease;
}
.muscle:hover {
  fill: #223758 !important;
  filter: drop-shadow(0 0 8px #38bdf8) !important;
}

/* Heatmap States */
.muscle.sore-max { fill: #ff3e45 !important; filter: drop-shadow(0 0 8px rgba(255,62,69,0.85)) drop-shadow(0 0 16px rgba(255,62,69,0.4)); }
.muscle.sore-mid { fill: #ff781f !important; filter: drop-shadow(0 0 8px rgba(255,120,31,0.75)) drop-shadow(0 0 15px rgba(255,120,31,0.35)); }
.muscle.sore-low { fill: #ffd11a !important; filter: drop-shadow(0 0 7px rgba(255,209,26,0.70)) drop-shadow(0 0 14px rgba(255,209,26,0.3)); }
.muscle.fresh    { fill: #5ecb3e !important; filter: drop-shadow(0 0 7px rgba(94,203,62,0.65)); }

/* Detail Card */
.bodymap-detail-card {
  margin-top: 22px;
  padding: 18px 22px;
  border: 1px solid rgba(33, 83, 180, 0.95);
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(8, 18, 34, 0.98), rgba(7, 16, 29, 0.96));
  box-shadow: 0 14px 35px rgba(0,0,0,0.25), inset 0 0 20px rgba(37,99,235,0.08);
}
.detail-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.detail-name { color: #ffffff; font-size: 1.08rem; font-weight: 850; letter-spacing: -0.015em; }
.detail-badge { flex: 0 0 auto; padding: 6px 14px; border-radius: 8px; font-size: 0.74rem; font-weight: 850; }
.detail-time { margin-top: 6px; color: #38bdf8; font-size: 0.88rem; font-weight: 800; }
.detail-desc { margin-top: 5px; color: #8da0ba; font-size: 0.78rem; line-height: 1.45; }

/* Preset Bar */
.bodymap-presets { margin-top: 18px; padding-top: 18px; border-top: 1px solid rgba(74, 94, 125, 0.25); }
.presets-label { margin-bottom: 10px; color: #60738e; font-size: 0.68rem; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.preset-row { display: flex; flex-wrap: wrap; gap: 8px; }
.preset-button {
  border: 1px solid rgba(70, 91, 125, 0.42);
  border-radius: 10px;
  padding: 8px 14px;
  background: rgba(17, 30, 49, 0.86);
  color: #ced9e8;
  font-size: 0.76rem;
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

@media (max-width: 960px) {
  .bodymap-visual-grid { grid-template-columns: 1fr; }
  .bodymap-side-panel { width: 100%; }
  .bodymap-figures { gap: 20px; }
}
`;
rootEl.appendChild(style);

// ============================================================================
// SVG DEFINITIONS & GRADIENTS
// ============================================================================
const svgDefs = `
<defs>
  <linearGradient id="bodyGradient" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#1e2c44"/>
    <stop offset="50%" stop-color="#141f33"/>
    <stop offset="100%" stop-color="#0b1322"/>
  </linearGradient>
  <radialGradient id="headShade" cx="45%" cy="30%" r="65%">
    <stop offset="0%" stop-color="#2d3f5d"/>
    <stop offset="60%" stop-color="#172235"/>
    <stop offset="100%" stop-color="#09101c"/>
  </radialGradient>
</defs>
`;

// ============================================================================
// ANTERIOR (FRONT) BODY SVG
// ============================================================================
const anteriorSVG = `
<svg class="bodymap-svg" viewBox="0 0 220 500" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
  ${svgDefs}
  
  <!-- Anatomical Base Silhouette -->
  <ellipse cx="110" cy="32" rx="19" ry="24" fill="url(#headShade)" stroke="#09101c" stroke-width="1.2"/>
  <path class="body-base" d="M96 52 C98 62 96 68 90 74 L130 74 C124 68 122 62 124 52 Z"/>
  
  <!-- Sculpted Neck & Clavicle Frame -->
  <path class="body-sculpt" d="M94 56 C96 66 102 72 110 74 C118 72 124 66 126 56 Z"/>

  <!-- LEFT & RIGHT ANTERIOR DELTOIDS -->
  <path class="muscle ${activeSorenessMap.delts_front || ""}" data-part="delts_front" d="M68 84 C56 82 50 92 48 104 C48 116 54 126 64 128 C70 118 73 103 72 90 Z"/>
  <path class="muscle ${activeSorenessMap.delts_front || ""}" data-part="delts_front" d="M152 84 C164 82 170 92 172 104 C172 116 166 126 156 128 C150 118 147 103 148 90 Z"/>

  <!-- LEFT & RIGHT LATERAL DELTOIDS -->
  <path class="muscle ${activeSorenessMap.delts_side || ""}" data-part="delts_side" d="M47 94 C38 102 38 114 42 126 C45 132 50 138 55 140 C58 128 58 114 55 100 Z"/>
  <path class="muscle ${activeSorenessMap.delts_side || ""}" data-part="delts_side" d="M173 94 C182 102 182 114 178 126 C175 132 170 138 165 140 C162 128 162 114 165 100 Z"/>

  <!-- UPPER CLAVICULAR PECS -->
  <path class="muscle ${activeSorenessMap.chest_upper || ""}" data-part="chest_upper" d="M72 88 C86 82 98 80 109 88 L109 112 C96 112 84 109 70 102 C68 96 69 91 72 88 Z"/>
  <path class="muscle ${activeSorenessMap.chest_upper || ""}" data-part="chest_upper" d="M148 88 C134 82 122 80 111 88 L111 112 C124 112 136 109 150 102 C152 96 151 91 148 88 Z"/>

  <!-- MID / LOWER STERNAL PECS -->
  <path class="muscle ${activeSorenessMap.chest_lower || ""}" data-part="chest_lower" d="M70 104 C84 110 98 114 109 114 L109 138 C94 138 80 134 68 125 C66 116 67 109 70 104 Z"/>
  <path class="muscle ${activeSorenessMap.chest_lower || ""}" data-part="chest_lower" d="M150 104 C136 110 122 114 111 114 L111 138 C126 138 140 134 152 125 C154 116 153 109 150 104 Z"/>

  <!-- BICEPS BRACHII -->
  <path class="muscle ${activeSorenessMap.biceps || ""}" data-part="biceps" d="M52 132 C45 140 45 156 48 170 C51 176 56 180 61 178 C65 165 65 148 61 135 Z"/>
  <path class="muscle ${activeSorenessMap.biceps || ""}" data-part="biceps" d="M168 132 C175 140 175 156 172 170 C169 176 164 180 159 178 C155 165 155 148 159 135 Z"/>

  <!-- FOREARMS & BRACHIORADIALIS -->
  <path class="muscle ${activeSorenessMap.forearms || ""}" data-part="forearms" d="M48 180 C40 188 36 205 40 222 C44 232 50 240 55 244 C59 240 61 232 59 220 C55 206 54 194 56 182 Z"/>
  <path class="muscle ${activeSorenessMap.forearms || ""}" data-part="forearms" d="M172 180 C180 188 184 205 180 222 C176 232 170 240 165 244 C161 240 159 232 161 220 C165 206 166 194 164 182 Z"/>

  <!-- RECTUS ABDOMINIS & CORE -->
  <path class="muscle ${activeSorenessMap.abs_core || ""}" data-part="abs_core" d="M88 142 C98 139 104 138 109 139 L109 198 C100 199 92 196 86 190 C84 172 84 156 88 142 Z"/>
  <path class="muscle ${activeSorenessMap.abs_core || ""}" data-part="abs_core" d="M132 142 C122 139 116 138 111 139 L111 198 C120 199 128 196 134 190 C136 172 136 156 132 142 Z"/>
  
  <!-- Abdominal Muscle Striation Dividers -->
  <path class="body-striation" d="M92 160 L128 160 M90 178 L130 178"/>

  <!-- QUADRICEPS FEMORIS (Vastus Lateralis/Medialis & Rectus Femoris) -->
  <path class="muscle ${activeSorenessMap.quads || ""}" data-part="quads" d="M82 230 C72 248 68 280 74 306 C84 316 94 316 102 308 C106 288 107 262 105 238 C97 232 90 230 82 230 Z"/>
  <path class="muscle ${activeSorenessMap.quads || ""}" data-part="quads" d="M138 230 C148 248 152 280 146 306 C136 316 126 316 118 308 C114 288 113 262 115 238 C123 232 130 230 138 230 Z"/>

  <!-- ANTERIOR CALVES & TIBIALIS -->
  <path class="muscle ${activeSorenessMap.calves_ant || ""}" data-part="calves_ant" d="M84 322 C76 340 76 370 82 396 C88 408 94 414 98 416 C102 406 103 385 101 360 C99 340 94 328 84 322 Z"/>
  <path class="muscle ${activeSorenessMap.calves_ant || ""}" data-part="calves_ant" d="M136 322 C144 340 144 370 138 396 C132 408 126 414 122 416 C118 406 117 385 119 360 C121 340 126 328 136 322 Z"/>

  <!-- Feet Anchors -->
  <path class="body-base" d="M80 420 C76 422 72 432 75 440 C84 445 100 445 106 438 L103 424 Z"/>
  <path class="body-base" d="M140 420 C144 422 148 432 145 440 C136 445 120 445 114 438 L117 424 Z"/>
</svg>
`;

// ============================================================================
// POSTERIOR (BACK) BODY SVG
// ============================================================================
const posteriorSVG = `
<svg class="bodymap-svg" viewBox="0 0 220 500" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
  ${svgDefs}

  <!-- Head Back -->
  <ellipse cx="110" cy="32" rx="19" ry="24" fill="url(#headShade)" stroke="#09101c" stroke-width="1.2"/>
  
  <!-- TRAPEZIUS & UPPER RHOMBOIDS -->
  <path class="muscle ${activeSorenessMap.traps_upper || ""}" data-part="traps_upper" d="M88 64 L110 54 L132 64 C134 78 142 90 146 100 C132 104 120 110 110 128 C100 110 88 104 74 100 C78 90 86 78 88 64 Z"/>

  <!-- REAR DELTOIDS (POSTERIOR) -->
  <path class="muscle ${activeSorenessMap.delts_rear || ""}" data-part="delts_rear" d="M66 84 C54 82 48 92 48 104 C48 116 54 126 64 128 C68 116 71 102 72 90 Z"/>
  <path class="muscle ${activeSorenessMap.delts_rear || ""}" data-part="delts_rear" d="M154 84 C166 82 172 92 172 104 C172 116 166 126 156 128 C152 116 149 102 148 90 Z"/>

  <!-- LATISSIMUS DORSI (V-TAPER WINGS) -->
  <path class="muscle ${activeSorenessMap.lats || ""}" data-part="lats" d="M78 104 C66 112 58 130 64 154 C70 174 84 190 98 196 C104 178 105 152 105 130 C96 116 88 108 78 104 Z"/>
  <path class="muscle ${activeSorenessMap.lats || ""}" data-part="lats" d="M142 104 C154 112 162 130 156 154 C150 174 136 190 122 196 C116 178 115 152 115 130 C124 116 132 108 142 104 Z"/>

  <!-- TRICEPS BRACHII (LONG & LATERAL HEADS) -->
  <path class="muscle ${activeSorenessMap.triceps || ""}" data-part="triceps" d="M50 132 C42 142 44 160 48 174 C52 180 57 182 62 178 C65 166 65 148 60 135 Z"/>
  <path class="muscle ${activeSorenessMap.triceps || ""}" data-part="triceps" d="M170 132 C178 142 176 160 172 174 C168 180 163 182 158 178 C155 166 155 148 160 135 Z"/>

  <!-- LOWER BACK (SPINAL ERECTORS) -->
  <path class="muscle ${activeSorenessMap.lower_back || ""}" data-part="lower_back" d="M96 148 C90 162 90 182 95 208 L108 214 L108 146 Z"/>
  <path class="muscle ${activeSorenessMap.lower_back || ""}" data-part="lower_back" d="M124 148 C130 162 130 182 125 208 L112 214 L112 146 Z"/>

  <!-- GLUTEUS COMPLEX -->
  <path class="muscle ${activeSorenessMap.glutes || ""}" data-part="glutes" d="M82 208 C74 228 78 250 94 256 C105 254 108 240 108 218 C98 212 90 208 82 208 Z"/>
  <path class="muscle ${activeSorenessMap.glutes || ""}" data-part="glutes" d="M138 208 C146 228 142 250 126 256 C115 254 112 240 112 218 C122 212 130 208 138 208 Z"/>

  <!-- HAMSTRING COMPLEX -->
  <path class="muscle ${activeSorenessMap.hamstrings || ""}" data-part="hamstrings" d="M82 260 C74 278 74 308 80 330 C88 338 98 336 104 326 C106 304 106 280 104 262 C96 258 88 258 82 260 Z"/>
  <path class="muscle ${activeSorenessMap.hamstrings || ""}" data-part="hamstrings" d="M138 260 C146 278 146 308 140 330 C132 338 122 336 116 326 C114 304 114 280 116 262 C124 258 132 258 138 260 Z"/>

  <!-- POSTERIOR CALVES (GASTROCNEMIUS & SOLEUS) -->
  <path class="muscle ${activeSorenessMap.calves_post || ""}" data-part="calves_post" d="M84 340 C72 360 74 390 82 414 C90 422 96 422 100 416 C104 398 105 376 102 348 C96 342 90 340 84 340 Z"/>
  <path class="muscle ${activeSorenessMap.calves_post || ""}" data-part="calves_post" d="M136 340 C148 360 146 390 138 414 C130 422 124 422 120 416 C116 398 115 376 118 348 C124 342 130 340 136 340 Z"/>

  <!-- Feet Anchors -->
  <path class="body-base" d="M80 420 C76 422 72 432 75 440 C84 445 100 445 106 438 L103 424 Z"/>
  <path class="body-base" d="M140 420 C144 422 148 432 145 440 C136 445 120 445 114 438 L117 424 Z"/>
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

    <!-- CENTER PANEL: DUAL BODY VIEWPORT -->
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
      <div class="detail-badge" id="det-badge" style="background:#ff3e45; color:#ffffff;">
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
// INTERACTIVE ENGINE & SELECTION HANDLERS
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

  detName.textContent = reg.name + " (" + reg.region + ")";

  if (isMax || isMid || isLow) {
    detBadge.textContent = "Direct Hypertrophy Stimulus";
    if (isMax) detBadge.style.background = "#ff3e45";
    else if (isMid) detBadge.style.background = "#ff781f";
    else detBadge.style.background = "#ffd11a";
    detBadge.style.color = isLow ? "#0f172a" : "#ffffff";

    detTime.textContent = "⏳ " + reg.defaultHours + " Hours Estimated Recovery Window";
    detDesc.textContent = reg.desc + " High metabolic demand registered from recent workout volume.";
  } else {
    detBadge.textContent = "Fresh & Fully Recovered";
    detBadge.style.background = "rgba(94, 203, 62, 0.16)";
    detBadge.style.color = "#82d964";
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
