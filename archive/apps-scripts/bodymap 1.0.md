```dataviewjs
// ####################################################################################################
// ######################### [ STANDALONE ANATOMICAL MUSCLE MAP GRAPHICS ] ############################
// ####################################################################################################

const rootEl = dv.el("div", "", { cls: "wk-standalone-map-root" });

// Recovery & Physiological Specs
const muscleRegistry = {
  // ANTERIOR
  delts_front: { name: "Anterior Deltoid", region: "Front Shoulder", defaultHours: 36, tier: "Fast Recovery" },
  delts_side:  { name: "Lateral Deltoid", region: "Side Shoulder", defaultHours: 24, tier: "Ultra-Fast" },
  chest_upper: { name: "Upper Clavicular Pecs", region: "Chest", defaultHours: 48, tier: "Standard" },
  chest_lower: { name: "Mid / Sternal Pecs", region: "Chest", defaultHours: 48, tier: "Standard" },
  biceps:      { name: "Biceps Brachii", region: "Arms", defaultHours: 36, tier: "Fast Recovery" },
  forearms:    { name: "Forearm Flexors / Grip", region: "Arms", defaultHours: 24, tier: "Ultra-Fast" },
  abs_core:    { name: "Rectus Abdominis & Obliques", region: "Core", defaultHours: 24, tier: "Ultra-Fast" },
  quads:       { name: "Quadriceps Femoris", region: "Thighs", defaultHours: 72, tier: "High Systemic" },
  calves_ant:  { name: "Tibialis & Gastro Front", region: "Lower Leg", defaultHours: 24, tier: "Ultra-Fast" },

  // POSTERIOR
  traps_upper: { name: "Trapezius & Upper Rhomboids", region: "Upper Back", defaultHours: 48, tier: "Standard" },
  delts_rear:  { name: "Posterior Deltoid", region: "Rear Shoulder", defaultHours: 24, tier: "Ultra-Fast" },
  lats:        { name: "Latissimus Dorsi", region: "Back Width", defaultHours: 48, tier: "Standard" },
  triceps:     { name: "Triceps Brachii", region: "Arms", defaultHours: 48, tier: "Standard" },
  lower_back:  { name: "Spinal Erectors", region: "Lower Back", defaultHours: 72, tier: "High Axial" },
  glutes:      { name: "Gluteus Complex", region: "Hips", defaultHours: 48, tier: "Standard" },
  hamstrings:  { name: "Hamstring Complex", region: "Thighs", defaultHours: 72, tier: "High Systemic" },
  calves_post: { name: "Gastrocnemius & Soleus", region: "Lower Leg", defaultHours: 24, tier: "Ultra-Fast" }
};

// Styles
const style = document.createElement("style");
style.textContent = [
  ".wk-map-container { background: #070d19; border: 1px solid #1e293b; border-radius: 20px; padding: 22px 18px; max-width: 620px; margin: 15px auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; box-shadow: 0 16px 45px rgba(0,0,0,0.7); box-sizing: border-box; }",
  ".wk-map-header { text-align: center; margin-bottom: 16px; }",
  ".wk-map-title { font-size: 1.15rem; font-weight: 800; color: #ffffff; letter-spacing: -0.01em; margin: 0; }",
  ".wk-map-sub { font-size: 0.76rem; color: #94a3b8; margin-top: 4px; }",
  
  /* SVG Body Frame */
  ".wk-map-viewport { display: flex; justify-content: center; align-items: center; gap: 30px; padding: 10px 0; }",
  ".wk-body-figure { filter: drop-shadow(0 4px 14px rgba(0,0,0,0.5)); }",
  
  /* Muscle Path Core Aesthetics */
  ".wk-muscle { fill: #131d31; stroke: #070d19; stroke-width: 1.4; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }",
  ".wk-muscle:hover { fill: #223554 !important; filter: drop-shadow(0 0 8px #38bdf8); }",
  
  /* Heatmap Soreness Levels */
  ".wk-muscle.sore-max { fill: #ef4444 !important; filter: drop-shadow(0 0 7px rgba(239, 68, 68, 0.9)); }",
  ".wk-muscle.sore-mid { fill: #f97316 !important; filter: drop-shadow(0 0 6px rgba(249, 115, 22, 0.8)); }",
  ".wk-muscle.sore-low { fill: #eab308 !important; filter: drop-shadow(0 0 5px rgba(234, 179, 8, 0.7)); }",
  ".wk-muscle.fresh    { fill: #10b981 !important; filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.6)); }",
  
  /* Interactive Details Card */
  ".wk-card-detail { background: #0b1324; border: 1px solid #1e3a8a; border-radius: 14px; padding: 14px 16px; margin-top: 16px; transition: all 0.2s ease; }",
  ".wk-detail-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }",
  ".wk-detail-name { font-size: 0.95rem; font-weight: 800; color: #ffffff; }",
  ".wk-detail-badge { font-size: 0.7rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; }",
  ".wk-detail-time { font-size: 0.82rem; font-weight: 800; color: #38bdf8; margin-top: 2px; }",
  ".wk-detail-desc { font-size: 0.75rem; color: #94a3b8; margin-top: 4px; line-height: 1.4; }",

  /* Test Controls Bar */
  ".wk-test-bar { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 14px; padding-top: 14px; border-top: 1px solid #1e293b; }",
  ".wk-test-chip { background: #0f172a; border: 1px solid #1e293b; color: #cbd5e1; font-size: 0.72rem; font-weight: 700; padding: 5px 9px; border-radius: 8px; cursor: pointer; transition: all 0.15s ease; }",
  ".wk-test-chip:hover { border-color: #38bdf8; color: #38bdf8; }"
].join("\n");
rootEl.appendChild(style);

// Heatmap Demo State (Easily passed from your logger)
const activeSorenessMap = {
  chest_upper: "sore-max",
  chest_lower: "sore-mid",
  delts_side:  "sore-low",
  triceps:     "sore-mid",
  lats:        "sore-max",
  hamstrings:  "sore-max",
  calves_post: "sore-low"
};

// Root Container Setup
const mapContainer = document.createElement("div");
mapContainer.className = "wk-map-container";

mapContainer.innerHTML = [
  '<div class="wk-map-header">',
    '<h3 class="wk-map-title">🧬 Anatomical Musculoskeletal Heatmap</h3>',
    '<div class="wk-map-sub">Click any anatomical section or test toggle to inspect metabolic fatigue</div>',
  '</div>',
  
  '<div class="wk-map-viewport">',
    // ---------------- ANTERIOR (FRONT) BODY SVG ----------------
    '<svg class="wk-body-figure" viewBox="0 0 190 320" width="140" height="235">',
      '<g id="anterior-anatomy">',
        // Head / Neck Base Outline
        '<path d="M88 20 C88 10 102 10 102 20 C102 30 88 30 88 20 Z" fill="#131d31" stroke="#070d19" />',
        '<path d="M91 30 L90 44 L100 44 L99 30 Z" fill="#131d31" stroke="#070d19" />',
        
        // Front Deltoids (Anterior Head)
        '<path class="wk-muscle ' + (activeSorenessMap.delts_front || "") + '" data-part="delts_front" d="M68 46 C52 48 48 64 56 78 C62 74 68 62 70 48 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.delts_front || "") + '" data-part="delts_front" d="M122 46 C138 48 142 64 134 78 C128 74 122 62 120 48 Z" />',
        
        // Side Deltoids (Lateral Head)
        '<path class="wk-muscle ' + (activeSorenessMap.delts_side || "") + '" data-part="delts_side" d="M50 56 C38 68 42 88 48 96 C53 86 56 70 54 60 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.delts_side || "") + '" data-part="delts_side" d="M140 56 C152 68 148 88 142 96 C137 86 134 70 136 60 Z" />',
        
        // Upper Clavicular Pectorals
        '<path class="wk-muscle ' + (activeSorenessMap.chest_upper || "") + '" data-part="chest_upper" d="M72 48 C94 48 94 62 94 66 C75 68 64 62 70 50 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.chest_upper || "") + '" data-part="chest_upper" d="M118 48 C96 48 96 62 96 66 C115 68 126 62 120 50 Z" />',
        
        // Mid / Lower Sternal Pectorals
        '<path class="wk-muscle ' + (activeSorenessMap.chest_lower || "") + '" data-part="chest_lower" d="M71 67 C94 66 94 88 94 90 C72 92 62 81 68 68 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.chest_lower || "") + '" data-part="chest_lower" d="M119 67 C96 66 96 88 96 90 C118 92 128 81 122 68 Z" />',
        
        // Biceps Brachii
        '<path class="wk-muscle ' + (activeSorenessMap.biceps || "") + '" data-part="biceps" d="M52 98 C42 110 46 132 54 138 C60 128 60 110 56 98 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.biceps || "") + '" data-part="biceps" d="M138 98 C148 110 144 132 136 138 C130 128 130 110 134 98 Z" />',
        
        // Forearms (Flexor Group & Brachioradialis)
        '<path class="wk-muscle ' + (activeSorenessMap.forearms || "") + '" data-part="forearms" d="M52 140 C38 152 28 180 36 195 C45 185 54 160 54 142 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.forearms || "") + '" data-part="forearms" d="M138 140 C152 152 162 180 154 195 C145 185 136 160 136 142 Z" />',
        
        // Rectus Abdominis & Obliques Core
        '<path class="wk-muscle ' + (activeSorenessMap.abs_core || "") + '" data-part="abs_core" d="M78 94 C95 92 112 94 110 160 C95 164 80 160 78 94 Z" />',
        
        // Quadriceps (Rectus Femoris, Vastus Medialis/Lateralis)
        '<path class="wk-muscle ' + (activeSorenessMap.quads || "") + '" data-part="quads" d="M74 164 C58 182 50 225 66 250 C82 248 90 225 88 166 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.quads || "") + '" data-part="quads" d="M116 164 C132 182 140 225 124 250 C108 248 100 225 102 166 Z" />',
        
        // Calves Front (Tibialis Anterior / Gastrocnemius Outer)
        '<path class="wk-muscle ' + (activeSorenessMap.calves_ant || "") + '" data-part="calves_ant" d="M68 254 C58 268 64 288 72 298 C82 292 84 276 82 254 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.calves_ant || "") + '" data-part="calves_ant" d="M122 254 C132 268 126 288 118 298 C108 292 106 276 108 254 Z" />',
      '</g>',
    '</svg>',

    // ---------------- POSTERIOR (BACK) BODY SVG ----------------
    '<svg class="wk-body-figure" viewBox="0 0 190 320" width="140" height="235">',
      '<g id="posterior-anatomy">',
        // Head / Neck Posterior
        '<path d="M88 20 C88 10 102 10 102 20 C102 30 88 30 88 20 Z" fill="#131d31" stroke="#070d19" />',
        
        // Trapezius & Upper Back Rhomboids
        '<path class="wk-muscle ' + (activeSorenessMap.traps_upper || "") + '" data-part="traps_upper" d="M76 38 C95 30 114 38 128 56 C108 68 95 88 95 88 C95 88 82 68 62 56 Z" />',
        
        // Rear Deltoids (Posterior Head)
        '<path class="wk-muscle ' + (activeSorenessMap.delts_rear || "") + '" data-part="delts_rear" d="M62 48 C46 52 42 68 50 80 C60 76 66 62 66 50 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.delts_rear || "") + '" data-part="delts_rear" d="M128 48 C144 52 148 68 140 80 C130 76 124 62 124 50 Z" />',
        
        // Latissimus Dorsi (V-Taper Sweep)
        '<path class="wk-muscle ' + (activeSorenessMap.lats || "") + '" data-part="lats" d="M66 80 C50 102 60 128 78 138 C86 124 90 102 88 84 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.lats || "") + '" data-part="lats" d="M124 80 C140 102 130 128 112 138 C104 124 100 102 102 84 Z" />',
        
        // Triceps Brachii (Long & Lateral Heads)
        '<path class="wk-muscle ' + (activeSorenessMap.triceps || "") + '" data-part="triceps" d="M48 84 C36 98 40 126 50 136 C56 124 58 106 54 86 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.triceps || "") + '" data-part="triceps" d="M142 84 C154 98 150 126 140 136 C134 124 132 106 136 86 Z" />',
        
        // Lower Back (Spinal Erectors)
        '<path class="wk-muscle ' + (activeSorenessMap.lower_back || "") + '" data-part="lower_back" d="M80 132 C95 128 110 132 108 158 C95 160 82 158 80 132 Z" />',
        
        // Gluteus Maximus / Medius
        '<path class="wk-muscle ' + (activeSorenessMap.glutes || "") + '" data-part="glutes" d="M70 160 C62 186 86 196 92 164 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.glutes || "") + '" data-part="glutes" d="M120 160 C128 186 104 196 98 164 Z" />',
        
        // Hamstring Group (Biceps Femoris / Semitendinosus)
        '<path class="wk-muscle ' + (activeSorenessMap.hamstrings || "") + '" data-part="hamstrings" d="M72 198 C62 218 70 244 88 248 C94 232 94 210 92 198 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.hamstrings || "") + '" data-part="hamstrings" d="M118 198 C128 218 120 244 102 248 C96 232 96 210 98 198 Z" />',
        
        // Calves Posterior (Gastrocnemius Diamond & Soleus)
        '<path class="wk-muscle ' + (activeSorenessMap.calves_post || "") + '" data-part="calves_post" d="M72 254 C60 272 68 292 80 298 C90 292 90 274 86 254 Z" />',
        '<path class="wk-muscle ' + (activeSorenessMap.calves_post || "") + '" data-part="calves_post" d="M118 254 C130 272 122 292 110 298 C100 292 100 274 104 254 Z" />',
      '</g>',
    '</svg>',
  '</div>',
  
  // Interactive Inspector Card
  '<div class="wk-card-detail" id="map-detail-card">',
    '<div class="wk-detail-top">',
      '<div class="wk-detail-name" id="det-name">Upper Clavicular Pecs</div>',
      '<div class="wk-detail-badge" id="det-badge" style="background:#ef4444; color:#ffffff;">Direct Hypertrophy Stimulus</div>',
    '</div>',
    '<div class="wk-detail-time" id="det-time">⏳ 48 Hours Estimated Recovery Window</div>',
    '<div class="wk-detail-desc" id="det-desc">Fatigued from incline pressing and fly patterns. High micro-trauma on clavicular fibers.</div>',
  '</div>',

  // Interactive Test Toggles
  '<div class="wk-test-bar">',
    '<div style="width:100%; font-size:0.7rem; font-weight:800; color:#64748b; margin-bottom:2px; text-transform:uppercase;">Quick Preset Demos:</div>',
    '<span class="wk-test-chip" id="tgl-push">⚡ Push Day Fatigue</span>',
    '<span class="wk-test-chip" id="tgl-pull">⚡ Pull Day Fatigue</span>',
    '<span class="wk-test-chip" id="tgl-legs">⚡ Leg Day Fatigue</span>',
    '<span class="wk-test-chip" id="tgl-clear">🔄 Reset All Fresh</span>',
  '</div>'
].join("");

rootEl.appendChild(mapContainer);

// -------------------------------------------------------------
// INTERACTIVITY & EVENT BINDINGS
// -------------------------------------------------------------
const detName = mapContainer.querySelector("#det-name");
const detBadge = mapContainer.querySelector("#det-badge");
const detTime = mapContainer.querySelector("#det-time");
const detDesc = mapContainer.querySelector("#det-desc");

function updateInspector(partKey) {
  const reg = muscleRegistry[partKey] || { name: partKey, region: "Body", defaultHours: 48, tier: "Standard" };
  const elem = mapContainer.querySelector('.wk-muscle[data-part="' + partKey + '"]');
  const isFatigued = elem && (elem.classList.contains("sore-max") || elem.classList.contains("sore-mid") || elem.classList.contains("sore-low"));

  detName.textContent = reg.name + " (" + reg.region + ")";
  
  if (isFatigued) {
    detBadge.textContent = "Direct Hypertrophy Stimulus";
    detBadge.style.background = elem.classList.contains("sore-max") ? "#ef4444" : "#f97316";
    detBadge.style.color = "#ffffff";
    detTime.textContent = "⏳ " + reg.defaultHours + " Hours Estimated Recovery Window";
    detDesc.textContent = "Significant metabolic load and fiber damage logged. Recommended to allow muscle protein synthesis to peak before re-training.";
  } else {
    detBadge.textContent = "Fresh & Fully Recovered";
    detBadge.style.background = "rgba(16, 185, 129, 0.15)";
    detBadge.style.color = "#86efac";
    detTime.textContent = "🟢 Ready for immediate heavy volume";
    detDesc.textContent = "Zero fatigue accumulated. Perfect candidate for upcoming targeted micro-muscle stimulation.";
  }
}

// Click on SVG paths to inspect
mapContainer.querySelectorAll(".wk-muscle").forEach(m => {
  m.onclick = function() {
    updateInspector(m.dataset.part);
  };
});

// Demo Preset Toggles
function applyPreset(activeList) {
  mapContainer.querySelectorAll(".wk-muscle").forEach(m => {
    m.className.baseVal = "wk-muscle";
    const part = m.dataset.part;
    if (activeList[part]) {
      m.classList.add(activeList[part]);
    }
  });
}

mapContainer.querySelector("#tgl-push").onclick = function() {
  applyPreset({ chest_upper: "sore-max", chest_lower: "sore-max", delts_front: "sore-mid", delts_side: "sore-mid", triceps: "sore-max" });
  updateInspector("chest_upper");
};

mapContainer.querySelector("#tgl-pull").onclick = function() {
  applyPreset({ lats: "sore-max", traps_upper: "sore-mid", delts_rear: "sore-max", biceps: "sore-max", forearms: "sore-mid" });
  updateInspector("lats");
};

mapContainer.querySelector("#tgl-legs").onclick = function() {
  applyPreset({ quads: "sore-max", hamstrings: "sore-max", glutes: "sore-mid", calves_post: "sore-max", calves_ant: "sore-low" });
  updateInspector("quads");
};

mapContainer.querySelector("#tgl-clear").onclick = function() {
  applyPreset({});
  updateInspector("chest_upper");
};

// ####################################################################################################
// ######################### [ END OF STANDALONE ANATOMICAL MUSCLE MAP ] ##############################
// ####################################################################################################
```
