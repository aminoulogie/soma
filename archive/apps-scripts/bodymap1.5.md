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
    desc: "Primary shoulder flexion and pressing contribution. Heavily recruited in overhead and incline pressing."
  },
  delts_side: {
    name: "Lateral Deltoid",
    region: "Side Shoulder",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Responsible for shoulder abduction and capped shoulder width. High endurance; recovers rapidly."
  },
  chest_upper: {
    name: "Upper Clavicular Pecs",
    region: "Chest",
    defaultHours: 48,
    tier: "Standard",
    desc: "Fatigued from incline pressing and fly patterns. High micro-trauma on clavicular fibers."
  },
  chest_lower: {
    name: "Mid / Sternal Pecs",
    region: "Chest",
    defaultHours: 48,
    tier: "Standard",
    desc: "Main horizontal pressing musculature responsible for sternal and costal pec adduction."
  },
  biceps: {
    name: "Biceps Brachii",
    region: "Arms",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Primary elbow flexor and pulling synergist. Recovers quickly from isolated flexion loading."
  },
  forearms: {
    name: "Forearms & Brachioradialis",
    region: "Arms",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Dense slow-twitch grip and wrist stabilization group built for high weekly volume."
  },
  abs_core: {
    name: "Rectus Abdominis & Serratus",
    region: "Core",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Primary trunk flexion, rotational control, and intra-abdominal intra-thoracic stabilization."
  },
  quads: {
    name: "Quadriceps Femoris",
    region: "Thighs",
    defaultHours: 72,
    tier: "High Systemic",
    desc: "Major knee-extension columns (vastus medialis, lateralis, rectus femoris) causing deep fatigue."
  },
  calves_ant: {
    name: "Tibialis Anterior",
    region: "Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Anterior lower-leg musculature active during ankle dorsiflexion and deceleration."
  },
  traps_upper: {
    name: "Trapezius & Rhomboids",
    region: "Upper Back",
    defaultHours: 48,
    tier: "Standard",
    desc: "Scapular elevation and retraction network loaded heavily in deadlifts, shrugs, and rows."
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
    desc: "Large sweeping back musculature powering vertical pulls, rows, and spinal stabilization."
  },
  triceps: {
    name: "Triceps Brachii",
    region: "Arms",
    defaultHours: 48,
    tier: "Standard",
    desc: "Primary elbow-extension group (long, lateral, medial heads) heavily taxed in compound lockouts."
  },
  lower_back: {
    name: "Spinal Erectors",
    region: "Lower Back",
    defaultHours: 72,
    tier: "High Axial",
    desc: "Spinal extension and axial load support columns requiring extensive CNS and structural recovery."
  },
  glutes: {
    name: "Gluteus Complex",
    region: "Hips",
    defaultHours: 48,
    tier: "Standard",
    desc: "Major hip-extension powerhouse loaded heavily during squats, hinges, and hip thrusts."
  },
  hamstrings: {
    name: "Hamstring Complex",
    region: "Thighs",
    defaultHours: 72,
    tier: "High Systemic",
    desc: "Posterior thigh group (biceps femoris, semitendinosus) subject to high stretch-induced damage."
  },
  calves_post: {
    name: "Gastrocnemius & Soleus",
    region: "Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Posterior calf complex responsible for plantar flexion. Highly resilient and quick to recover."
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
// STYLES & VOLUMETRIC LIGHTING ENGINE
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
  padding: 32px 28px 26px;
  border: 1px solid rgba(88, 108, 145, 0.45);
  border-radius: 26px;
  background: radial-gradient(circle at 50% 12%, rgba(26, 52, 94, 0.35), transparent 48%), linear-gradient(145deg, #07101f 0%, #040812 100%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.75), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.bodymap-header { text-align: center; margin-bottom: 24px; }
.bodymap-title { margin: 0; color: #f8fafc; font-size: 1.45rem; font-weight: 850; letter-spacing: -0.025em; }
.bodymap-title-icon { display: inline-block; margin-right: 8px; color: #38bdf8; }
.bodymap-subtitle { margin-top: 6px; color: #8ea0b8; font-size: 0.85rem; }

/* 3-Column Spaced Flex Grid */
.bodymap-visual-grid {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  min-height: 510px;
}

.bodymap-side-panel {
  flex: 0 0 178px;
  padding: 22px 18px;
  border: 1px solid rgba(76, 98, 137, 0.38);
  border-radius: 18px;
  background: rgba(9, 18, 33, 0.82);
  box-shadow: 0 16px 36px rgba(0,0,0,0.3);
}

.bodymap-side-title {
  margin: 0 0 18px;
  color: #a7b5ca;
  font-size: 0.74rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bodymap-side-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 15px; }
.bodymap-side-row:last-child { margin-bottom: 0; }
.bodymap-dot { flex: 0 0 13px; width: 13px; height: 13px; margin-top: 3px; border-radius: 50%; }
.bodymap-side-main { color: #e8eef7; font-size: 0.84rem; font-weight: 750; line-height: 1.2; }
.bodymap-side-sub { margin-top: 2px; color: #70819a; font-size: 0.68rem; }

.dot-red { background: #ff2a38; box-shadow: 0 0 12px rgba(255,42,56,0.85); }
.dot-orange { background: #ff7315; box-shadow: 0 0 12px rgba(255,115,21,0.8); }
.dot-yellow { background: #ffd000; box-shadow: 0 0 12px rgba(255,208,0,0.75); }
.dot-green { background: #52d638; box-shadow: 0 0 12px rgba(82,214,56,0.65); }
.dot-bluegray { background: #24344d; }

/* How to Use Section */
.how-row { display: flex; gap: 12px; align-items: center; margin-bottom: 18px; }
.how-row:last-child { margin-bottom: 0; }
.how-icon {
  flex: 0 0 30px;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #c8d5e8;
  background: rgba(31, 47, 72, 0.7);
  border: 1px solid rgba(92, 114, 153, 0.35);
  font-size: 0.82rem;
}
.how-text { color: #d6dfeb; font-size: 0.76rem; line-height: 1.35; }

/* Anatomy Figures Viewport */
.bodymap-figures {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  min-width: 0;
}
.bodymap-figure-wrap { width: 190px; text-align: center; }
.bodymap-figure-label { margin-bottom: 8px; color: #526783; font-size: 0.7rem; font-weight: 850; letter-spacing: 0.15em; text-transform: uppercase; }
.bodymap-svg { width: 100%; height: 470px; overflow: visible; display: block; filter: drop-shadow(0 14px 32px rgba(0,0,0,0.75)); }

/* 3D Anatomical Base Layer */
.anat-dark { fill: url(#baseDark3D); stroke: #040812; stroke-width: 1.1; }
.anat-head { fill: url(#head3D); stroke: #070d18; stroke-width: 1.1; }
.anat-sculpt { fill: url(#sculptDark3D); stroke: #03070f; stroke-width: 1.1; }
.anat-line { fill: none; stroke: rgba(255, 255, 255, 0.07); stroke-width: 0.9; pointer-events: none; }

/* Interactive Muscle Layer */
.muscle {
  fill: url(#muscleIdle3D);
  stroke: #030710;
  stroke-width: 1.25;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.muscle:hover {
  fill: url(#muscleHover3D) !important;
  filter: drop-shadow(0 0 8px #38bdf8) !important;
}

/* 3D Radiant Heatmap Neon Glowing States */
.muscle.sore-max {
  fill: url(#glowRed3D) !important;
  filter: drop-shadow(0 0 7px rgba(255, 42, 56, 0.95)) drop-shadow(0 0 18px rgba(255, 42, 56, 0.55));
}
.muscle.sore-mid {
  fill: url(#glowOrange3D) !important;
  filter: drop-shadow(0 0 7px rgba(255, 115, 21, 0.9)) drop-shadow(0 0 16px rgba(255, 115, 21, 0.5));
}
.muscle.sore-low {
  fill: url(#glowYellow3D) !important;
  filter: drop-shadow(0 0 6px rgba(255, 208, 0, 0.85)) drop-shadow(0 0 14px rgba(255, 208, 0, 0.45));
}
.muscle.fresh {
  fill: url(#glowGreen3D) !important;
  filter: drop-shadow(0 0 6px rgba(82, 214, 56, 0.85));
}

/* Detail Card */
.bodymap-detail-card {
  margin-top: 24px;
  padding: 20px 24px;
  border: 1px solid rgba(33, 83, 180, 0.95);
  border-radius: 18px;
  background: linear-gradient(145deg, rgba(8, 18, 34, 0.98), rgba(7, 16, 29, 0.96));
  box-shadow: 0 16px 40px rgba(0,0,0,0.3), inset 0 0 20px rgba(37,99,235,0.08);
}
.detail-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.detail-name { color: #ffffff; font-size: 1.12rem; font-weight: 850; letter-spacing: -0.015em; }
.detail-badge { flex: 0 0 auto; padding: 7px 16px; border-radius: 9px; font-size: 0.76rem; font-weight: 850; }
.detail-time { margin-top: 6px; color: #38bdf8; font-size: 0.9rem; font-weight: 800; }
.detail-desc { margin-top: 5px; color: #8da0ba; font-size: 0.79rem; line-height: 1.45; }

/* Preset Bar */
.bodymap-presets { margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(74, 94, 125, 0.25); }
.presets-label { margin-bottom: 12px; color: #60738e; font-size: 0.7rem; font-weight: 850; letter-spacing: 0.08em; text-transform: uppercase; }
.preset-row { display: flex; flex-wrap: wrap; gap: 9px; }
.preset-button {
  border: 1px solid rgba(70, 91, 125, 0.42);
  border-radius: 10px;
  padding: 9px 16px;
  background: rgba(17, 30, 49, 0.86);
  color: #ced9e8;
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
// 3D VOLUMETRIC GRADIENT DEFINITIONS
// ============================================================================
const svgDefs = `
<defs>
  <radialGradient id="head3D" cx="44%" cy="28%" r="72%">
    <stop offset="0%" stop-color="#3b5075"/>
    <stop offset="50%" stop-color="#19253b"/>
    <stop offset="100%" stop-color="#080e1a"/>
  </radialGradient>

  <linearGradient id="baseDark3D" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#24344d"/>
    <stop offset="50%" stop-color="#141d2d"/>
    <stop offset="100%" stop-color="#080d16"/>
  </linearGradient>

  <linearGradient id="sculptDark3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#1a2538"/>
    <stop offset="100%" stop-color="#070c14"/>
  </linearGradient>

  <linearGradient id="muscleIdle3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#24334a"/>
    <stop offset="100%" stop-color="#121a28"/>
  </linearGradient>

  <linearGradient id="muscleHover3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#385885"/>
    <stop offset="100%" stop-color="#1c304d"/>
  </linearGradient>

  <linearGradient id="glowRed3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ff5963"/>
    <stop offset="45%" stop-color="#ee1f2d"/>
    <stop offset="100%" stop-color="#8a0712"/>
  </linearGradient>

  <linearGradient id="glowOrange3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ff9947"/>
    <stop offset="45%" stop-color="#ff6800"/>
    <stop offset="100%" stop-color="#9e3900"/>
  </linearGradient>

  <linearGradient id="glowYellow3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffe454"/>
    <stop offset="45%" stop-color="#ffc400"/>
    <stop offset="100%" stop-color="#a37600"/>
  </linearGradient>

  <linearGradient id="glowGreen3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#6df556"/>
    <stop offset="45%" stop-color="#3fc425"/>
    <stop offset="100%" stop-color="#176908"/>
  </linearGradient>
</defs>
`;

// ============================================================================
// ANTERIOR (FRONT) PROPORTIONAL BODY SVG
// ============================================================================
const anteriorSVG = `
<svg class="bodymap-svg" viewBox="0 0 200 480" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
  ${svgDefs}
  
  <!-- Head & Neck -->
  <ellipse class="anat-head" cx="100" cy="28" rx="17" ry="22"/>
  <path class="anat-dark" d="M88 46 C90 56 88 62 82 68 L118 68 C112 62 110 56 112 46 Z"/>
  <path class="anat-sculpt" d="M86 52 C88 62 94 66 100 68 C106 66 112 62 114 52 Z"/>

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
  <path class="anat-line" d="M85 144 L115 144 M83 160 L117 160"/>

  <!-- QUADRICEPS (THIGHS) -->
  <path class="muscle ${activeSorenessMap.quads || ""}" data-part="quads" d="M76 206 C67 222 64 250 69 273 C78 282 86 282 93 275 C96 257 97 234 95 213 C88 208 82 206 76 206 Z"/>
  <path class="muscle ${activeSorenessMap.quads || ""}" data-part="quads" d="M124 206 C133 222 136 250 131 273 C122 282 114 282 107 275 C104 257 103 234 105 213 C112 208 118 206 124 206 Z"/>
  <circle class="anat-sculpt" cx="81" cy="284" r="5"/>
  <circle class="anat-sculpt" cx="119" cy="284" r="5"/>

  <!-- ANTERIOR CALVES & TIBIALIS -->
  <path class="muscle ${activeSorenessMap.calves_ant || ""}" data-part="calves_ant" d="M78 290 C71 306 71 332 76 355 C81 366 86 371 90 373 C93 364 94 345 92 323 C90 305 86 295 78 290 Z"/>
  <path class="muscle ${activeSorenessMap.calves_ant || ""}" data-part="calves_ant" d="M122 290 C129 306 129 332 124 355 C119 366 114 371 110 373 C107 364 106 345 108 323 C110 305 114 295 122 290 Z"/>

  <!-- Feet -->
  <path class="anat-dark" d="M74 376 C70 378 67 386 70 393 C78 397 92 397 97 391 L94 379 Z"/>
  <path class="anat-dark" d="M126 376 C130 378 133 386 130 393 C122 397 108 397 103 391 L106 379 Z"/>
</svg>
`;

// ============================================================================
// POSTERIOR (BACK) PROPORTIONAL BODY SVG
// ============================================================================
const posteriorSVG = `
<svg class="bodymap-svg" viewBox="0 0 200 480" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
  ${svgDefs}

  <ellipse class="anat-head" cx="100" cy="28" rx="17" ry="22"/>
  
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
  <circle class="anat-sculpt" cx="82" cy="301" r="4.5"/>
  <circle class="anat-sculpt" cx="118" cy="301" r="4.5"/>

  <!-- POSTERIOR CALVES (GASTROCNEMIUS TWIN BELLIES & SOLEUS) -->
  <path class="muscle ${activeSorenessMap.calves_post || ""}" data-part="calves_post" d="M77 306 C66 324 68 350 75 371 C82 378 87 378 91 373 C94 357 95 337 92 312 C87 307 82 305 77 306 Z"/>
  <path class="muscle ${activeSorenessMap.calves_post || ""}" data-part="calves_post" d="M123 306 C134 324 132 350 125 371 C118 378 113 378 109 373 C106 357 105 337 108 312 C113 307 118 305 123 306 Z"/>

  <!-- Feet -->
  <path class="anat-dark" d="M74 376 C70 378 67 386 70 393 C78 397 92 397 97 391 L94 379 Z"/>
  <path class="anat-dark" d="M126 376 C130 378 133 386 130 393 C122 397 108 397 103 391 L106 379 Z"/>
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
    detBadge.style.background = "rgba(82, 214, 56, 0.16)";
    detBadge.style.color = "#52d638";
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
