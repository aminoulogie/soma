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
    desc: "Primary shoulder flexion and horizontal pressing synergist. Highly loaded during overhead and incline presses."
  },
  delts_side: {
    name: "Lateral Deltoid",
    region: "Side Shoulder",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Responsible for shoulder abduction and capped shoulder width. High endurance with fast recovery."
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
    desc: "Main horizontal pressing musculature responsible for sternal and costal pectoral adduction."
  },
  biceps: {
    name: "Biceps Brachii",
    region: "Arms",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Primary elbow flexor and pulling synergist. Recovers quickly from isolated curling volume."
  },
  forearms: {
    name: "Forearms & Grip",
    region: "Arms",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Dense slow-twitch grip and wrist stabilization group built for high weekly training volume."
  },
  abs_core: {
    name: "Rectus Abdominis & Core",
    region: "Core",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Trunk flexion, serratus anterior control, and intra-abdominal core pressure stabilization."
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
    desc: "Anterior lower-leg musculature responsible for ankle dorsiflexion and foot deceleration."
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
    desc: "Large sweeping back musculature powering vertical pulls, heavy rows, and V-taper sweep."
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
  chest_lower: "sore-max",
  delts_front: "sore-low",
  delts_side: "sore-low",
  biceps: "sore-mid",
  quads: "sore-max",
  calves_ant: "sore-low",
  traps_upper: "sore-max",
  delts_rear: "sore-mid",
  triceps: "sore-mid",
  lats: "sore-max",
  glutes: "sore-max",
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
  max-width: 1020px;
  margin: 14px auto;
  padding: 30px 26px 24px;
  border: 1px solid rgba(56, 189, 248, 0.22);
  border-radius: 26px;
  background: radial-gradient(circle at 50% 12%, rgba(20, 48, 92, 0.42), transparent 55%), linear-gradient(145deg, #07101f 0%, #030712 100%);
  box-shadow: 0 32px 85px rgba(0, 0, 0, 0.82), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.bodymap-header { text-align: center; margin-bottom: 24px; }
.bodymap-title { margin: 0; color: #f8fafc; font-size: 1.48rem; font-weight: 850; letter-spacing: -0.025em; }
.bodymap-title-icon { display: inline-block; margin-right: 8px; color: #38bdf8; }
.bodymap-subtitle { margin-top: 6px; color: #94a3b8; font-size: 0.85rem; }

/* 3-Column Balanced Grid */
.bodymap-visual-grid {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  min-height: 560px;
}

.bodymap-side-panel {
  flex: 0 0 178px;
  padding: 22px 18px;
  border: 1px solid rgba(76, 110, 160, 0.32);
  border-radius: 18px;
  background: rgba(10, 20, 36, 0.82);
  box-shadow: 0 16px 36px rgba(0,0,0,0.35);
}

.bodymap-side-title {
  margin: 0 0 18px;
  color: #94a3b8;
  font-size: 0.74rem;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.bodymap-side-row { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }
.bodymap-side-row:last-child { margin-bottom: 0; }
.bodymap-dot { flex: 0 0 14px; width: 14px; height: 14px; margin-top: 2px; border-radius: 50%; }
.bodymap-side-main { color: #f1f5f9; font-size: 0.85rem; font-weight: 750; line-height: 1.2; }
.bodymap-side-sub { margin-top: 2px; color: #64748b; font-size: 0.68rem; }

.dot-red { background: #ff2a38; box-shadow: 0 0 14px rgba(255,42,56,0.95); }
.dot-orange { background: #ff7315; box-shadow: 0 0 14px rgba(255,115,21,0.9); }
.dot-yellow { background: #ffd000; box-shadow: 0 0 14px rgba(255,208,0,0.85); }
.dot-green { background: #10b981; box-shadow: 0 0 14px rgba(16,185,129,0.75); }
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
  font-size: 0.88rem;
}
.how-text { color: #cbd5e1; font-size: 0.77rem; line-height: 1.35; }

/* Center Anatomy Viewport */
.bodymap-figures {
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 46px;
  min-width: 0;
}
.bodymap-figure-wrap { width: 235px; text-align: center; }
.bodymap-figure-label { margin-bottom: 10px; color: #64748b; font-size: 0.74rem; font-weight: 850; letter-spacing: 0.16em; text-transform: uppercase; }
.bodymap-svg { width: 100%; height: 530px; overflow: visible; display: block; filter: drop-shadow(0 18px 40px rgba(0,0,0,0.85)); }

/* 3D Anatomical Base Layer */
.anat-head { fill: url(#head3D); stroke: #334766; stroke-width: 1.6; }
.anat-base { fill: url(#baseDark3D); stroke: #2a3d59; stroke-width: 1.5; }
.anat-shadow { fill: #0a111c; stroke: #192638; stroke-width: 1.4; }
.anat-line { fill: none; stroke: rgba(56, 189, 248, 0.3); stroke-width: 1.2; pointer-events: none; }
.anat-tendon { fill: #0e1724; stroke: #203045; stroke-width: 1.2; }

/* Interactive Muscle Layer */
.muscle {
  fill: url(#muscleIdle3D);
  stroke: #263852;
  stroke-width: 1.6;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.muscle:hover {
  fill: url(#muscleHover3D) !important;
  stroke: #38bdf8 !important;
  filter: drop-shadow(0 0 12px #38bdf8) !important;
}

/* 3D Radiant Heatmap Glowing States */
.muscle.sore-max {
  fill: url(#glowRed3D) !important;
  stroke: #ff7882 !important;
  filter: drop-shadow(0 0 8px rgba(255, 42, 56, 0.95)) drop-shadow(0 0 24px rgba(255, 42, 56, 0.7));
}
.muscle.sore-mid {
  fill: url(#glowOrange3D) !important;
  stroke: #ffaa66 !important;
  filter: drop-shadow(0 0 8px rgba(255, 115, 21, 0.9)) drop-shadow(0 0 22px rgba(255, 115, 21, 0.65));
}
.muscle.sore-low {
  fill: url(#glowYellow3D) !important;
  stroke: #fff077 !important;
  filter: drop-shadow(0 0 7px rgba(255, 208, 0, 0.85)) drop-shadow(0 0 18px rgba(255, 208, 0, 0.55));
}
.muscle.fresh {
  fill: url(#glowGreen3D) !important;
  stroke: #73f7a3 !important;
  filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.85));
}

/* Lower Focus Detail Card */
.bodymap-detail-card {
  margin-top: 24px;
  padding: 22px 24px;
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

@media (max-width: 900px) {
  .bodymap-visual-grid { flex-direction: column; align-items: center; }
  .bodymap-side-panel { width: 100%; flex: auto; }
}
`;
rootEl.appendChild(style);

// ============================================================================
// 3D HIGH-LUMINANCE VOLUMETRIC GRADIENTS
// ============================================================================
const svgDefs = `
<defs>
  <radialGradient id="head3D" cx="44%" cy="28%" r="75%">
    <stop offset="0%" stop-color="#4d6994"/>
    <stop offset="55%" stop-color="#22334c"/>
    <stop offset="100%" stop-color="#0e1724"/>
  </radialGradient>

  <linearGradient id="baseDark3D" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#263852"/>
    <stop offset="50%" stop-color="#162335"/>
    <stop offset="100%" stop-color="#0a101a"/>
  </linearGradient>

  <linearGradient id="muscleIdle3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#2a3c57"/>
    <stop offset="100%" stop-color="#141e2e"/>
  </linearGradient>

  <linearGradient id="muscleHover3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#3d6092"/>
    <stop offset="100%" stop-color="#1c304d"/>
  </linearGradient>

  <linearGradient id="glowRed3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ff6b76"/>
    <stop offset="40%" stop-color="#ff1a2b"/>
    <stop offset="100%" stop-color="#99000d"/>
  </linearGradient>

  <linearGradient id="glowOrange3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffa65c"/>
    <stop offset="40%" stop-color="#ff6a00"/>
    <stop offset="100%" stop-color="#a83c00"/>
  </linearGradient>

  <linearGradient id="glowYellow3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fff06e"/>
    <stop offset="40%" stop-color="#ffd000"/>
    <stop offset="100%" stop-color="#ad8700"/>
  </linearGradient>

  <linearGradient id="glowGreen3D" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#55f79b"/>
    <stop offset="40%" stop-color="#10b981"/>
    <stop offset="100%" stop-color="#065f43"/>
  </linearGradient>
</defs>
`;

// ============================================================================
// ANTERIOR (FRONT) PROPORTIONAL BODY SVG
// ============================================================================
const anteriorSVG = `
<svg class="bodymap-svg" viewBox="0 0 280 680" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
  ${svgDefs}
  
  <!-- Anatomical Base Silhouette -->
  <ellipse class="anat-head" cx="140" cy="42" rx="24" ry="32"/>
  <path class="anat-base" d="M122 68 C124 82 120 90 110 98 L170 98 C160 90 156 82 158 68 Z"/>
  <path class="anat-shadow" d="M118 76 C122 88 130 94 140 96 C150 94 158 88 162 76 Z"/>

  <!-- DELTOIDS (ANTERIOR & LATERAL) -->
  <path class="muscle ${activeSorenessMap.delts_front || ""}" data-part="delts_front" d="M88 112 C72 108 64 124 62 140 C62 156 70 170 82 172 C90 158 94 138 92 120 Z"/>
  <path class="muscle ${activeSorenessMap.delts_front || ""}" data-part="delts_front" d="M192 112 C208 108 216 124 218 140 C218 156 210 170 198 172 C190 158 186 138 188 120 Z"/>
  <path class="muscle ${activeSorenessMap.delts_side || ""}" data-part="delts_side" d="M61 126 C48 138 48 154 54 170 C58 178 64 186 71 188 C76 172 76 154 71 136 Z"/>
  <path class="muscle ${activeSorenessMap.delts_side || ""}" data-part="delts_side" d="M219 126 C232 138 232 154 226 170 C222 178 216 186 209 188 C204 172 204 154 209 136 Z"/>

  <!-- EXPANDED UPPER CHEST (CLAVICULAR PECS) -->
  <path class="muscle ${activeSorenessMap.chest_upper || ""}" data-part="chest_upper" d="M94 116 C116 106 130 106 139 116 L139 152 C120 152 104 146 90 136 C87 126 90 118 94 116 Z"/>
  <path class="muscle ${activeSorenessMap.chest_upper || ""}" data-part="chest_upper" d="M186 116 C164 106 150 106 141 116 L141 152 C160 152 176 146 190 136 C193 126 190 118 186 116 Z"/>

  <!-- EXPANDED LOWER CHEST (STERNAL / COSTAL PECS) -->
  <path class="muscle ${activeSorenessMap.chest_lower || ""}" data-part="chest_lower" d="M90 138 C108 148 124 154 139 154 L139 188 C118 188 100 182 86 166 C84 152 86 144 90 138 Z"/>
  <path class="muscle ${activeSorenessMap.chest_lower || ""}" data-part="chest_lower" d="M190 138 C172 148 156 154 141 154 L141 188 C162 188 180 182 194 166 C196 152 194 144 190 138 Z"/>

  <!-- BICEPS & FOREARMS -->
  <path class="muscle ${activeSorenessMap.biceps || ""}" data-part="biceps" d="M68 176 C58 186 58 208 62 226 C67 234 74 240 80 236 C86 218 86 196 80 178 Z"/>
  <path class="muscle ${activeSorenessMap.biceps || ""}" data-part="biceps" d="M212 176 C222 186 222 208 218 226 C213 234 206 240 200 236 C194 218 194 196 200 178 Z"/>
  <path class="muscle ${activeSorenessMap.forearms || ""}" data-part="forearms" d="M61 240 C51 250 46 274 52 296 C57 310 65 320 72 324 C78 318 80 306 78 292 C73 272 71 256 74 242 Z"/>
  <path class="muscle ${activeSorenessMap.forearms || ""}" data-part="forearms" d="M219 240 C229 250 234 274 228 296 C223 310 215 320 208 324 C202 318 200 306 202 292 C207 272 209 256 206 242 Z"/>

  <!-- Hands -->
  <path class="anat-base" d="M54 326 C48 334 46 348 50 358 C54 366 60 366 64 358 L68 332 Z"/>
  <path class="anat-base" d="M226 326 C232 334 234 348 230 358 C226 366 220 366 216 358 L212 332 Z"/>

  <!-- RECTUS ABDOMINIS & SERRATUS CORE -->
  <path class="muscle ${activeSorenessMap.abs_core || ""}" data-part="abs_core" d="M110 194 C124 190 132 190 139 191 L139 270 C128 271 116 266 108 258 C104 234 104 212 110 194 Z"/>
  <path class="muscle ${activeSorenessMap.abs_core || ""}" data-part="abs_core" d="M170 194 C156 190 148 190 141 191 L141 270 C152 271 164 266 172 258 C176 234 176 212 170 194 Z"/>
  <path class="anat-line" d="M116 218 L164 218 M114 242 L166 242"/>

  <!-- QUADRICEPS (THIGHS) -->
  <path class="muscle ${activeSorenessMap.quads || ""}" data-part="quads" d="M104 310 C90 334 84 378 92 414 C106 428 120 428 130 416 C136 390 137 354 135 322 C124 314 114 312 104 310 Z"/>
  <path class="muscle ${activeSorenessMap.quads || ""}" data-part="quads" d="M176 310 C190 334 196 378 188 414 C174 428 160 428 150 416 C144 390 143 354 145 322 C156 314 166 312 176 310 Z"/>
  <circle class="anat-tendon" cx="111" cy="436" r="7"/>
  <circle class="anat-tendon" cx="169" cy="436" r="7"/>

  <!-- ANTERIOR CALVES & TIBIALIS -->
  <path class="muscle ${activeSorenessMap.calves_ant || ""}" data-part="calves_ant" d="M106 442 C96 466 96 506 104 542 C112 558 120 566 126 568 C130 554 132 526 129 494 C126 468 120 452 106 442 Z"/>
  <path class="muscle ${activeSorenessMap.calves_ant || ""}" data-part="calves_ant" d="M174 442 C184 466 184 506 176 542 C168 558 160 566 154 568 C150 554 148 526 151 494 C154 468 160 452 174 442 Z"/>

  <!-- Feet -->
  <path class="anat-base" d="M100 576 C94 580 90 592 94 602 C106 608 126 608 134 598 L130 580 Z"/>
  <path class="anat-base" d="M180 576 C186 580 190 592 186 602 C174 608 154 608 146 598 L150 580 Z"/>
</svg>
`;

// ============================================================================
// POSTERIOR (BACK) PROPORTIONAL BODY SVG
// ============================================================================
const posteriorSVG = `
<svg class="bodymap-svg" viewBox="0 0 280 680" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
  ${svgDefs}

  <ellipse class="anat-head" cx="140" cy="42" rx="24" ry="32"/>
  
  <!-- TRAPEZIUS & UPPER RHOMBOIDS -->
  <path class="muscle ${activeSorenessMap.traps_upper || ""}" data-part="traps_upper" d="M112 88 L140 74 L168 88 C172 106 182 122 188 136 C170 142 154 150 140 174 C126 150 110 142 92 136 C98 122 108 106 112 88 Z"/>

  <!-- REAR DELTOIDS (POSTERIOR) -->
  <path class="muscle ${activeSorenessMap.delts_rear || ""}" data-part="delts_rear" d="M86 112 C70 108 62 124 62 140 C62 156 70 170 82 172 C88 158 92 138 90 120 Z"/>
  <path class="muscle ${activeSorenessMap.delts_rear || ""}" data-part="delts_rear" d="M194 112 C210 108 218 124 218 140 C218 156 210 170 198 172 C192 158 188 138 190 120 Z"/>

  <!-- LATISSIMUS DORSI (V-TAPER WINGS) -->
  <path class="muscle ${activeSorenessMap.lats || ""}" data-part="lats" d="M100 132 C84 144 74 168 80 200 C88 226 106 248 124 256 C132 232 134 198 134 168 C122 150 112 138 100 132 Z"/>
  <path class="muscle ${activeSorenessMap.lats || ""}" data-part="lats" d="M180 132 C196 144 206 168 200 200 C192 226 174 248 156 256 C148 232 146 198 146 168 C158 150 168 138 180 132 Z"/>

  <!-- TRICEPS BRACHII -->
  <path class="muscle ${activeSorenessMap.triceps || ""}" data-part="triceps" d="M63 176 C53 188 56 212 61 230 C66 238 72 240 78 234 C82 218 82 196 76 178 Z"/>
  <path class="muscle ${activeSorenessMap.triceps || ""}" data-part="triceps" d="M217 176 C227 188 224 212 219 230 C214 238 208 240 202 234 C198 218 198 196 204 178 Z"/>

  <!-- Hands Back -->
  <path class="anat-base" d="M54 326 C48 334 46 348 50 358 C54 366 60 366 64 358 L68 332 Z"/>
  <path class="anat-base" d="M226 326 C232 334 234 348 230 358 C226 366 220 366 216 358 L212 332 Z"/>

  <!-- LOWER BACK (ERECTORS) -->
  <path class="muscle ${activeSorenessMap.lower_back || ""}" data-part="lower_back" d="M122 190 C114 208 114 234 120 266 L138 274 L138 188 Z"/>
  <path class="muscle ${activeSorenessMap.lower_back || ""}" data-part="lower_back" d="M158 190 C166 208 166 234 160 266 L142 274 L142 188 Z"/>

  <!-- GLUTEUS COMPLEX -->
  <path class="muscle ${activeSorenessMap.glutes || ""}" data-part="glutes" d="M104 270 C92 296 98 326 118 334 C132 332 138 312 138 282 C124 274 114 270 104 270 Z"/>
  <path class="muscle ${activeSorenessMap.glutes || ""}" data-part="glutes" d="M176 270 C188 296 182 326 162 334 C148 332 142 312 142 282 C156 274 166 270 176 270 Z"/>

  <!-- HAMSTRING COMPLEX -->
  <path class="muscle ${activeSorenessMap.hamstrings || ""}" data-part="hamstrings" d="M104 336 C92 360 92 400 100 428 C110 438 124 436 132 422 C136 394 136 364 134 340 C122 334 112 334 104 336 Z"/>
  <path class="muscle ${activeSorenessMap.hamstrings || ""}" data-part="hamstrings" d="M176 336 C188 360 188 400 180 428 C170 438 156 436 148 422 C144 394 144 364 146 340 C158 334 168 334 176 336 Z"/>
  <circle class="anat-tendon" cx="114" cy="442" r="6"/>
  <circle class="anat-tendon" cx="166" cy="442" r="6"/>

  <!-- POSTERIOR CALVES (GASTROCNEMIUS & SOLEUS) -->
  <path class="muscle ${activeSorenessMap.calves_post || ""}" data-part="calves_post" d="M106 446 C90 472 94 510 104 542 C114 552 122 552 128 544 C132 522 134 492 130 456 C122 448 114 446 106 446 Z"/>
  <path class="muscle ${activeSorenessMap.calves_post || ""}" data-part="calves_post" d="M174 446 C190 472 186 510 176 542 C166 552 158 552 152 544 C148 522 146 492 150 456 C158 448 166 446 174 446 Z"/>

  <!-- Feet -->
  <path class="anat-base" d="M100 576 C94 580 90 592 94 602 C106 608 126 608 134 598 L130 580 Z"/>
  <path class="anat-base" d="M180 576 C186 580 190 592 186 602 C174 608 154 608 146 598 L150 580 Z"/>
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
  applyPreset({
    chest_upper: "sore-max",
    chest_lower: "sore-max",
    delts_front: "sore-low",
    delts_side: "sore-low",
    triceps: "sore-mid"
  });
  updateInspector("chest_upper");
};

mapContainer.querySelector("#tgl-pull").onclick = () => {
  applyPreset({
    traps_upper: "sore-max",
    delts_rear: "sore-mid",
    lats: "sore-max",
    biceps: "sore-max",
    forearms: "sore-low"
  });
  updateInspector("lats");
};

mapContainer.querySelector("#tgl-legs").onclick = () => {
  applyPreset({
    quads: "sore-max",
    glutes: "sore-max",
    hamstrings: "sore-max",
    calves_post: "sore-low",
    calves_ant: "sore-low"
  });
  updateInspector("quads");
};

mapContainer.querySelector("#tgl-clear").onclick = () => {
  applyPreset({});
  updateInspector("chest_upper");
};

// Initial Inspection Render
updateInspector("chest_upper");
```
