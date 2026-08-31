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
    desc: "Major knee-extension group contributing heavily to lower-body systemic fatigue."
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
    desc: "Posterior thigh group involved in hip extension and knee flexion with high stretch-induced damage."
  },
  calves_post: {
    name: "Gastrocnemius & Soleus",
    region: "Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Posterior lower-leg calf complex responsible for plantar flexion. Highly fatigue-resistant."
  }
};

// Initial Heatmap State
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
  width: 100%;
  max-width: 980px;
  margin: 16px auto;
  padding: 28px 24px 24px;
  border: 1px solid rgba(88, 108, 145, 0.42);
  border-radius: 24px;
  background: radial-gradient(circle at 50% 12%, rgba(26, 48, 86, 0.32), transparent 45%), linear-gradient(145deg, #07101f 0%, #050b15 100%);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.65), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.bodymap-header { text-align: center; margin-bottom: 24px; }
.bodymap-title { margin: 0; color: #f8fafc; font-size: 1.4rem; font-weight: 850; letter-spacing: -0.03em; }
.bodymap-title-icon { display: inline-block; margin-right: 8px; color: #38bdf8; }
.bodymap-subtitle { margin-top: 6px; color: #8ea0b8; font-size: 0.84rem; }

/* 3-Column Visual Grid (Collision-Proof Flex Layout) */
.bodymap-visual-grid {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  min-height: 480px;
}

.bodymap-side-panel {
  flex: 0 0 170px;
  padding: 20px 16px;
  border: 1px solid rgba(76, 98, 137, 0.35);
  border-radius: 18px;
  background: rgba(9, 18, 33, 0.75);
  box-shadow: 0 15px 35px rgba(0,0,0,0.25);
}

.bodymap-side-title {
  margin: 0 0 16px;
  color: #a7b5ca;
  font-size: 0.72rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bodymap-side-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 15px; }
.bodymap-side-row:last-child { margin-bottom: 0; }
.bodymap-dot { flex: 0 0 12px; width: 12px; height: 12px; margin-top: 3px; border-radius: 50%; }
.bodymap-side-main { color: #e8eef7; font-size: 0.82rem; font-weight: 750; line-height: 1.2; }
.bodymap-side-sub { margin-top: 2px; color: #70819a; font-size: 0.67rem; }

.dot-red { background: #ff3344; box-shadow: 0 0 10px rgba(255,51,68,0.6); }
.dot-orange { background: #ff7711; box-shadow: 0 0 10px rgba(255,119,17,0.55); }
.dot-yellow { background: #ffcc00; box-shadow: 0 0 10px rgba(255,204,0,0.5); }
.dot-green { background: #44cc44; box-shadow: 0 0 10px rgba(68,204,68,0.45); }
.dot-bluegray { background: #28374d; }

/* How to Use Section */
.how-row { display: flex; gap: 10px; align-items: center; margin-bottom: 16px; }
.how-row:last-child { margin-bottom: 0; }
.how-icon {
  flex: 0 0 28px;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #c8d5e8;
  background: rgba(31, 47, 72, 0.6);
  border: 1px solid rgba(92, 114, 153, 0.25);
  font-size: 0.78rem;
}
.how-text { color: #d6dfeb; font-size: 0.75rem; line-height: 1.35; }

/* Anatomy Figures Viewport */
.bodymap-figures {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 36px;
  min-width: 0;
}
.bodymap-figure-wrap { width: 175px; text-align: center; }
.bodymap-figure-label { margin-bottom: 8px; color: #526783; font-size: 0.68rem; font-weight: 850; letter-spacing: 0.14em; text-transform: uppercase; }
.bodymap-svg { width: 100%; height: 440px; overflow: visible; display: block; filter: drop-shadow(0 10px 25px rgba(0,0,0,0.6)); }

/* 3D Anatomical Shader Paths */
.body-frame { fill: #0a121e; stroke: #18283e; stroke-width: 1.2; }
.body-head { fill: url(#head3D); stroke: #121e30; stroke-width: 1.2; }
.body-sculpt { fill: #131e30; stroke: #070d18; stroke-width: 1.2; }
.body-tendon { fill: #0f1828; stroke: #070d18; stroke-width: 1; }

/* Interactive Muscular Muscle Layer */
.muscle {
  fill: #16243a;
  stroke: #070d18;
  stroke-width: 1.3;
  cursor: pointer;
  transition: fill 0.2s ease, filter 0.2s ease;
}
.muscle:hover {
  fill: #273e63 !important;
  filter: drop-shadow(0 0 8px #38bdf8) !important;
}

/* Neon Heatmap Glowing States */
.muscle.sore-max {
  fill: #ff3344 !important;
  filter: drop-shadow(0 0 6px rgba(255, 51, 68, 0.95)) drop-shadow(0 0 16px rgba(255, 51, 68, 0.5));
}
.muscle.sore-mid {
  fill: #ff7711 !important;
  filter: drop-shadow(0 0 6px rgba(255, 119, 17, 0.9)) drop-shadow(0 0 14px rgba(255, 119, 17, 0.45));
}
.muscle.sore-low {
  fill: #ffcc00 !important;
  filter: drop-shadow(0 0 5px rgba(255, 204, 0, 0.85)) drop-shadow(0 0 12px rgba(255, 204, 0, 0.4));
}
.muscle.fresh {
  fill: #44cc44 !important;
  filter: drop-shadow(0 0 6px rgba(68, 204, 68, 0.8));
}

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

@media (max-width: 820px) {
  .bodymap-visual-grid { flex-direction: column; align-items: center; }
  .bodymap-side-panel { width: 100%; flex: auto; }
}
`;
rootEl.appendChild(style);

// ============================================================================
// 3D SHADER SVG GRADIENTS
// ============================================================================
const svgDefs = `
<defs>
  <radialGradient id="head3D" cx="45%" cy="32%" r="68%">
    <stop offset="0%" stop-color="#2d4060"/>
    <stop offset="60%" stop-color="#141f32"/>
    <stop offset="100%" stop-color="#080e18"/>
  </radialGradient>
</defs>
`;

// ============================================================================
// ANTERIOR (FRONT) PROPORTIONAL BODY SVG
// ============================================================================
const anteriorSVG = `
<svg class="bodymap-svg" viewBox="0 0 200 480" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
  ${svgDefs}
  
  <!-- Silhouette Frame -->
  <ellipse class="body-head" cx="100" cy="28" rx="17" ry="22"/>
  <path class="body-frame" d="M88 46 C90 56 88 62 82 68 L118 68 C112 62 110 56 112 46 Z"/>
  <path class="body-sculpt" d="M86 52 C88 62 94 66 100 68 C106 66 112 62 114 52 Z"/>

  <!-- DELTOIDS (ANTERIOR & LATERAL) -->
  <path class="muscle ${activeSorenessMap.delts_front || ""}" data-part="delts_front" d="M68 76 C56 74 50 84 48 95 C48 106 53 114 62 116 C68 107 72 94 71 82 Z"/>
  <path class="muscle ${activeSorenessMap.delts_front || ""}" data-part="delts_front" d="M132 76 C144 74 150 84 152 95 C152 106 147 114 138 116 C132 107 128 94 129 82 Z"/>
  <path class="muscle ${activeSorenessMap.delts_side || ""}" data-part="delts_side" d="M47 86 C39 94 39 104 43 115 C46 120 50 125 54 127 C57 116 57 104 54 92 Z"/>
  <path class="muscle ${activeSorenessMap.delts_side || ""}" data-part="delts_side" d="M153 86 C161 94 161 104 157 115 C154 120 150 125 146 127 C143 116 143 104 146 92 Z"/>

  <!-- PECTORALIS MAJOR (UPPER CLAVICULAR & LOWER STERNAL) -->
  <path class="muscle ${activeSorenessMap.chest_upper || ""}" data-part="chest_upper" d="M72 80 C84 75 92 73 99 80 L99 101 C88 101 77 98 68 92 C67 87 69 82 72 80 Z"/>
  <path class="muscle ${activeSorenessMap.chest_upper || ""}" data-part="chest_upper" d="M128 80 C116 75 108 73 101 80 L101 101 C112 101 123 98 132 92 C133 87 131 82 128 80 Z"/>
  <path class="muscle ${activeSorenessMap.chest_lower || ""}" data-part="chest_lower" d="M68 94 C80 100 90 103 99 103 L99 124 C86 124 74 121 65 113 C64 105 65 99 68 94 Z"/>
  <path class="muscle ${activeSorenessMap.chest_lower || ""}" data-part="chest_lower" d="M132 94 C120 100 110 103 101 103 L101 124 C114 124 126 121 135 113 C136 105 135 99 132 94 Z"/>

  <!-- ARMS (BICEPS & FOREARMS) -->
  <path class="muscle ${activeSorenessMap.biceps || ""}" data-part="biceps" d="M51 120 C45 127 45 141 48 153 C51 158 55 162 59 160 C63 148 63 134 59 122 Z"/>
  <path class="muscle ${activeSorenessMap.biceps || ""}" data-part="biceps" d="M149 120 C155 127 155 141 152 153 C149 158 145 162 141 160 C137 148 137 134 141 122 Z"/>
  <path class="muscle ${activeSorenessMap.forearms || ""}" data-part="forearms" d="M47 162 C40 169 36 184 40 199 C44 208 49 215 53 218 C57 214 59 207 57 197 C54 184 53 174 55 164 Z"/>
  <path class="muscle ${activeSorenessMap.forearms || ""}" data-part="forearms" d="M153 162 C160 169 164 184 160 199 C156 208 151 215 147 218 C143 214 141 207 143 197 C146 184 147 174 145 164 Z"/>

  <!-- CORE (RECTUS ABDOMINIS & OBLIQUES) -->
  <path class="muscle ${activeSorenessMap.abs_core || ""}" data-part="abs_core" d="M82 128 C90 125 95 124 99 125 L99 178 C91 179 84 176 79 171 C77 155 77 140 82 128 Z"/>
  <path class="muscle ${activeSorenessMap.abs_core || ""}" data-part="abs_core" d="M118 128 C110 125 105 124 101 125 L101 178 C109 179 116 176 121 171 C123 155 123 140 118 128 Z"/>
  <path class="body-sculpt" d="M85 144 L115 144 M83 160 L117 160"/>

  <!-- QUADRICEPS (THIGHS) -->
  <path class="muscle ${activeSorenessMap.quads || ""}" data-part="quads" d="M76 206 C67 222 64 250 69 273 C78 282 86 282 93 275 C96 257 97 234 95 213 C88 208 82 206 76 206 Z"/>
  <path class="muscle ${activeSorenessMap.quads || ""}" data-part="quads" d="M124 206 C133 222 136 250 131 273 C122 282 114 282 107 275 C104 257 103 234 105 213 C112 208 118 206 124 206 Z"/>
  <circle class="body-tendon" cx="81" cy="284" r="5"/>
  <circle class="body-tendon" cx="119" cy="284" r="5"/>

  <!-- ANTERIOR CALVES & TIBIALIS -->
  <path class="muscle ${activeSorenessMap.calves_ant || ""}" data-part="calves_ant" d="M78 290 C71 306 71 332 76 355 C81 366 86 371 90 373 C93 364 94 345 92 323 C90 305 86 295 78 290 Z"/>
  <path class="muscle ${activeSorenessMap.calves_ant || ""}" data-part="calves_ant" d="M122 290 C129 306 129 332 124 355 C119 366 114 371 110 373 C107 364 106 345 108 323 C110 305 114 295 122 290 Z"/>

  <!-- Feet -->
  <path class="body-frame" d="M74 376 C70 378 67 386 70 393 C78 397 92 397 97 391 L94 379 Z"/>
  <path class="body-frame" d="M126 376 C130 378 133 386 130 393 C122 397 108 397 103 391 L106 379 Z"/>
</svg>
`;

// ============================================================================
// POSTERIOR (BACK) PROPORTIONAL BODY SVG
// ============================================================================
const posteriorSVG = `
<svg class="bodymap-svg" viewBox="0 0 200 480" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
  ${svgDefs}

  <ellipse class="body-head" cx="100" cy="28" rx="17" ry="22"/>
  
  <!-- TRAPEZIUS & UPPER RHOMBOIDS -->
  <path class="muscle ${activeSorenessMap.traps_upper || ""}" data-part="traps_upper" d="M80 58 L100 49 L120 58 C122 70 129 80 132 89 C119 92 109 97 100 113 C91 97 81 92 68 89 C71 80 78 70 80 58 Z"/>

  <!-- REAR DELTOIDS (POSTERIOR) -->
  <path class="muscle ${activeSorenessMap.delts_rear || ""}" data-part="delts_rear" d="M66 76 C55 74 49 84 48 95 C48 106 53 114 62 116 C66 105 69 92 70 81 Z"/>
  <path class="muscle ${activeSorenessMap.delts_rear || ""}" data-part="delts_rear" d="M134 76 C145 74 151 84 152 95 C152 106 147 114 138 116 C134 105 131 92 130 81 Z"/>

  <!-- LATISSIMUS DORSI (V-TAPER WINGS) -->
  <path class="muscle ${activeSorenessMap.lats || ""}" data-part="lats" d="M72 93 C61 100 54 116 59 138 C64 156 76 170 88 175 C93 159 94 136 94 116 C86 104 79 97 72 93 Z"/>
  <path class="muscle ${activeSorenessMap.lats || ""}" data-part="lats" d="M128 93 C139 100 146 116 141 138 C136 156 124 170 112 175 C107 159 106 136 106 116 C114 104 121 97 128 93 Z"/>

  <!-- TRICEPS BRACHII -->
  <path class="muscle ${activeSorenessMap.triceps || ""}" data-part="triceps" d="M49 120 C42 129 44 145 47 158 C50 163 54 165 58 161 C61 150 61 134 57 122 Z"/>
  <path class="muscle ${activeSorenessMap.triceps || ""}" data-part="triceps" d="M151 120 C158 129 156 145 153 158 C150 163 146 165 142 161 C139 150 139 134 143 122 Z"/>

  <!-- LOWER BACK (ERECTORS) -->
  <path class="muscle ${activeSorenessMap.lower_back || ""}" data-part="lower_back" d="M88 133 C83 145 83 163 87 186 L98 191 L98 131 Z"/>
  <path class="muscle ${activeSorenessMap.lower_back || ""}" data-part="lower_back" d="M112 133 C117 145 117 163 113 186 L102 191 L102 131 Z"/>

  <!-- GLUTEUS COMPLEX -->
  <path class="muscle ${activeSorenessMap.glutes || ""}" data-part="glutes" d="M75 187 C68 205 71 224 85 229 C95 227 98 215 98 195 C89 190 82 187 75 187 Z"/>
  <path class="muscle ${activeSorenessMap.glutes || ""}" data-part="glutes" d="M125 187 C132 205 129 224 115 229 C105 227 102 215 102 195 C111 190 118 187 125 187 Z"/>

  <!-- HAMSTRING COMPLEX -->
  <path class="muscle ${activeSorenessMap.hamstrings || ""}" data-part="hamstrings" d="M76 233 C69 249 69 276 74 295 C81 302 90 300 95 291 C97 272 97 251 95 235 C88 231 81 231 76 233 Z"/>
  <path class="muscle ${activeSorenessMap.hamstrings || ""}" data-part="hamstrings" d="M124 233 C131 249 131 276 126 295 C119 302 110 300 105 291 C103 272 103 251 105 235 C112 231 119 231 124 233 Z"/>
  <circle class="body-tendon" cx="82" cy="301" r="4.5"/>
  <circle class="body-tendon" cx="118" cy="301" r="4.5"/>

  <!-- POSTERIOR CALVES (GASTROCNEMIUS TWIN BELLIES & SOLEUS) -->
  <path class="muscle ${activeSorenessMap.calves_post || ""}" data-part="calves_post" d="M77 306 C66 324 68 350 75 371 C82 378 87 378 91 373 C94 357 95 337 92 312 C87 307 82 305 77 306 Z"/>
  <path class="muscle ${activeSorenessMap.calves_post || ""}" data-part="calves_post" d="M123 306 C134 324 132 350 125 371 C118 378 113 378 109 373 C106 357 105 337 108 312 C113 307 118 305 123 306 Z"/>

  <!-- Feet -->
  <path class="body-frame" d="M74 376 C70 378 67 386 70 393 C78 397 92 397 97 391 L94 379 Z"/>
  <path class="body-frame" d="M126 376 C130 378 133 386 130 393 C122 397 108 397 103 391 L106 379 Z"/>
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
      <div class="detail-name" id="det-name">Upper Clavicular Pecs (Chest)</div>
      <div class="detail-badge" id="det-badge" style="background:#ff3344; color:#ffffff;">
        Direct Hypertrophy Stimulus
      </div>
    </div>
    <div class="detail-time" id="det-time">⏳ 48 Hours Estimated Recovery Window</div>
    <div class="detail-desc" id="det-desc">
      Upper chest fibers emphasized during incline pressing and low-to-high fly patterns. High metabolic demand registered from recent workout volume.
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

  detName.textContent = reg.name + " (" + reg.region + ")";

  if (isMax || isMid || isLow) {
    detBadge.textContent = "Direct Hypertrophy Stimulus";
    if (isMax) detBadge.style.background = "#ff3344";
    else if (isMid) detBadge.style.background = "#ff7711";
    else detBadge.style.background = "#ffcc00";
    detBadge.style.color = isLow ? "#07101f" : "#ffffff";

    detTime.textContent = "⏳ " + reg.defaultHours + " Hours Estimated Recovery Window";
    detDesc.textContent = reg.desc;
  } else {
    detBadge.textContent = "Fresh & Fully Recovered";
    detBadge.style.background = "rgba(68, 204, 68, 0.16)";
    detBadge.style.color = "#44cc44";
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
