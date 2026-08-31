```dataviewjs
const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// =========================================================================
// MUSCLE REGISTRY & ANATOMICALLY CURVED BEZIER PATHS
// =========================================================================
const muscleRegistry = {
  // --- Anterior (Front) ---
  chest: {
    name: "Pectoralis Major",
    region: "Chest",
    recovery: 35,
    defaultHours: 48,
    tier: "High Strain",
    desc: "Clavicular and sternal heads of the chest wall.",
    d: [
      "M 124,106 C 104,100 86,96 70,105 C 60,111 58,124 64,136 C 72,148 98,154 124,150 Z",
      "M 126,106 C 146,100 164,96 180,105 C 190,111 192,124 186,136 C 178,148 152,154 126,150 Z"
    ],
    view: "front"
  },
  delts_front: {
    name: "Anterior & Lateral Deltoids",
    region: "Shoulders",
    recovery: 85,
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Shoulder abduction, anterior flexion, and pressing cap.",
    d: [
      "M 68,103 C 54,100 42,108 38,120 C 34,134 46,145 56,140 C 62,134 66,122 68,103 Z",
      "M 182,103 C 196,100 208,108 212,120 C 216,134 204,145 194,140 C 188,134 184,122 182,103 Z"
    ],
    view: "front"
  },
  biceps: {
    name: "Biceps Brachii",
    region: "Arms (Front)",
    recovery: 70,
    defaultHours: 36,
    tier: "Optimal",
    desc: "Elbow flexion and forearm supination.",
    d: [
      "M 42,142 C 34,152 32,168 38,180 C 44,186 54,182 58,172 C 62,160 56,146 42,142 Z",
      "M 208,142 C 216,152 218,168 212,180 C 206,186 196,182 192,172 C 188,160 194,146 208,142 Z"
    ],
    view: "front"
  },
  abs: {
    name: "Rectus Abdominis & Core",
    region: "Abdominals",
    recovery: 95,
    defaultHours: 24,
    tier: "Fully Recovered",
    desc: "Segmented abdominal wall and core trunk brace.",
    d: [
      "M 96,156 C 110,154 140,154 154,156 C 158,185 156,215 148,245 C 135,248 115,248 102,245 C 94,215 92,185 96,156 Z"
    ],
    view: "front"
  },
  quads: {
    name: "Quadriceps Femoris",
    region: "Thighs (Front)",
    recovery: 25,
    defaultHours: 72,
    tier: "High Strain",
    desc: "Rectus femoris, vastus lateralis, and vastus medialis.",
    d: [
      "M 78,252 C 64,268 62,305 68,340 C 74,354 84,358 92,348 C 104,335 108,290 106,254 C 95,250 86,250 78,252 Z",
      "M 172,252 C 186,268 188,305 182,340 C 176,354 166,358 158,348 C 146,335 142,290 144,254 C 155,250 164,250 172,252 Z"
    ],
    view: "front"
  },
  calves_front: {
    name: "Tibialis Anterior & Calves",
    region: "Lower Leg (Front)",
    recovery: 80,
    defaultHours: 24,
    tier: "Optimal",
    desc: "Ankle dorsiflexion and lateral stability.",
    d: [
      "M 78,368 C 66,385 68,420 74,452 C 82,456 90,450 94,425 C 98,395 92,374 78,368 Z",
      "M 172,368 C 184,385 182,420 176,452 C 168,456 160,450 156,425 C 152,395 158,374 172,368 Z"
    ],
    view: "front"
  },

  // --- Posterior (Back) ---
  traps: {
    name: "Trapezius & Neck",
    region: "Upper Back",
    recovery: 30,
    defaultHours: 36,
    tier: "High Strain",
    desc: "Scapular elevation, upward rotation, and retraction.",
    d: [
      "M 112,48 C 125,44 138,44 138,48 C 146,65 174,102 170,112 C 152,125 135,148 125,166 C 115,148 98,125 80,112 C 76,102 104,65 112,48 Z"
    ],
    view: "back"
  },
  delts_rear: {
    name: "Posterior Deltoids",
    region: "Rear Shoulders",
    recovery: 80,
    defaultHours: 24,
    tier: "Optimal",
    desc: "Horizontal shoulder abduction and external rotation.",
    d: [
      "M 68,103 C 54,100 42,108 38,120 C 34,134 46,145 56,140 C 62,134 66,122 68,103 Z",
      "M 182,103 C 196,100 208,108 212,120 C 216,134 204,145 194,140 C 188,134 184,122 182,103 Z"
    ],
    view: "back"
  },
  lats: {
    name: "Latissimus Dorsi",
    region: "Mid Back / Flanks",
    recovery: 45,
    defaultHours: 48,
    tier: "Fatigued",
    desc: "Humeral adduction, extension, and horizontal pulling driver.",
    d: [
      "M 82,116 C 98,128 115,152 125,168 C 135,152 152,128 168,116 C 172,148 165,190 152,216 C 138,218 112,218 98,216 C 85,190 78,148 82,116 Z"
    ],
    view: "back"
  },
  triceps: {
    name: "Triceps Brachii",
    region: "Arms (Back)",
    recovery: 90,
    defaultHours: 48,
    tier: "Fully Recovered",
    desc: "Elbow extension and overhead elbow lockout.",
    d: [
      "M 42,138 C 32,150 30,172 38,186 C 46,190 54,184 56,170 C 60,154 54,142 42,138 Z",
      "M 208,138 C 218,150 220,172 212,186 C 204,190 196,184 194,170 C 190,154 196,142 208,138 Z"
    ],
    view: "back"
  },
  glutes: {
    name: "Gluteus Maximus",
    region: "Posterior Chain",
    recovery: 35,
    defaultHours: 60,
    tier: "High Strain",
    desc: "Primary hip extensor and external rotator.",
    d: [
      "M 125,220 C 105,216 80,222 74,242 C 68,266 84,288 106,286 C 118,284 124,265 125,220 Z",
      "M 125,220 C 145,216 170,222 176,242 C 182,266 166,288 144,286 C 132,284 126,265 125,220 Z"
    ],
    view: "back"
  },
  hamstrings: {
    name: "Hamstrings",
    region: "Thighs (Back)",
    recovery: 30,
    defaultHours: 72,
    tier: "High Strain",
    desc: "Knee flexion and hip extension hinge driver.",
    d: [
      "M 78,288 C 70,305 68,335 74,364 C 84,368 94,365 98,348 C 104,320 106,295 98,288 Z",
      "M 172,288 C 180,305 182,335 176,364 C 166,368 156,365 152,348 C 146,320 144,295 152,288 Z"
    ],
    view: "back"
  },
  calves_back: {
    name: "Gastrocnemius & Soleus",
    region: "Calves (Back)",
    recovery: 85,
    defaultHours: 24,
    tier: "Optimal",
    desc: "Plantarflexion and ankle stability.",
    d: [
      "M 76,370 C 62,388 64,424 72,456 C 80,458 88,452 92,428 C 96,396 90,375 76,370 Z",
      "M 174,370 C 188,388 186,424 178,456 C 170,458 162,452 158,428 C 154,396 160,375 174,370 Z"
    ],
    view: "back"
  }
};

// =========================================================================
// COLOR ENGINE
// =========================================================================
function getHeatColor(recovery) {
  if (recovery >= 80) return "rgba(245, 158, 11, 0.55)"; // Amber
  if (recovery >= 50) return "rgba(249, 115, 22, 0.65)"; // Orange
  return "rgba(239, 68, 68, 0.75)";                      // Red
}

// =========================================================================
// STYLES
// =========================================================================
const styleEl = document.createElement("style");
styleEl.textContent = `
  .bodymap-root {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #0d0e12;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 20px;
    gap: 16px;
    font-family: var(--font-interface);
    color: #e2e8f0;
  }
  .bm-navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 580px;
  }
  .bm-title {
    font-size: 1rem;
    font-weight: 700;
  }
  .bm-btn-group {
    display: flex;
    background: #16181f;
    padding: 3px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    gap: 4px;
  }
  .bm-btn {
    border: none;
    background: transparent;
    color: #94a3b8;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .bm-btn.active {
    background: #2563eb;
    color: #ffffff;
  }
  .bm-workspace {
    display: flex;
    gap: 28px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }
  .bm-viewport {
    position: relative;
    width: 250px;
    height: 500px;
    border-radius: 12px;
    background-color: #050508;
    background-repeat: no-repeat;
    background-size: 200% 100%;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
    overflow: hidden;
  }
  .bm-svg-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    mix-blend-mode: color-dodge;
  }
  .bm-muscle-path {
    cursor: pointer;
    transition: fill 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
    filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.4));
  }
  .bm-muscle-path:hover {
    filter: brightness(1.4) drop-shadow(0 0 10px rgba(255, 255, 255, 0.8)) !important;
  }
  .bm-muscle-path.selected {
    filter: brightness(1.6) drop-shadow(0 0 14px #60a5fa) !important;
    stroke: rgba(255, 255, 255, 0.9);
    stroke-width: 1.5;
  }
  .bm-card {
    background: #16181f;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 18px;
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .bm-card-subtitle {
    font-size: 0.72rem;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 600;
  }
  .bm-card-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: #f8fafc;
  }
  .bm-meta-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    color: #94a3b8;
  }
  .bm-meta-val {
    font-weight: 600;
    color: #f8fafc;
  }
  .bm-desc-box {
    font-size: 0.8rem;
    line-height: 1.45;
    color: #cbd5e1;
    background: #0d0e12;
    padding: 10px;
    border-radius: 8px;
  }
`;
rootEl.appendChild(styleEl);

// =========================================================================
// CONTROLLER & UI MOUNT
// =========================================================================
let currentView = "front";
let selectedKey = "chest";

const navBar = rootEl.createDiv({ cls: "bm-navbar" });
navBar.createEl("span", { text: "Muscle Recovery Architecture", cls: "bm-title" });

const btnGroup = navBar.createDiv({ cls: "bm-btn-group" });
const btnFront = btnGroup.createEl("button", { cls: "bm-btn active", text: "Anterior" });
const btnBack = btnGroup.createEl("button", { cls: "bm-btn", text: "Posterior" });

const workspace = rootEl.createDiv({ cls: "bm-workspace" });
const viewport = workspace.createDiv({ cls: "bm-viewport" });
const cardBox = workspace.createDiv({ cls: "bm-card" });

// Locate anatomy_base.png from vault attachments
const fileObj = app.metadataCache.getFirstLinkpathDest("anatomy_base", "");
const imgUrl = fileObj 
  ? app.vault.adapter.getResourcePath(fileObj.path) 
  : app.vault.adapter.getResourcePath("Attachments/anatomy_base.png");

function renderDetails(key) {
  const model = muscleRegistry[key];
  if (!model) return;

  const color = getHeatColor(model.recovery);

  cardBox.innerHTML = `
    <div class="bm-card-subtitle">${model.region}</div>
    <div class="bm-card-title">${model.name}</div>
    <div class="bm-meta-row">
      <span>Strain Status:</span>
      <span class="bm-meta-val" style="color:${color}">${model.tier} (${model.recovery}%)</span>
    </div>
    <div class="bm-meta-row">
      <span>Recovery Window:</span>
      <span class="bm-meta-val">${model.defaultHours} hrs</span>
    </div>
    <div class="bm-desc-box">${model.desc}</div>
  `;
}

function renderMap() {
  const isFront = currentView === "front";
  
  viewport.style.backgroundImage = `url("${imgUrl}")`;
  viewport.style.backgroundPosition = isFront ? "0% 0%" : "100% 0%";

  let pathsHtml = "";
  for (const [key, item] of Object.entries(muscleRegistry)) {
    if (item.view === currentView) {
      const isSelected = key === selectedKey ? "selected" : "";
      const color = getHeatColor(item.recovery);
      item.d.forEach((pathD) => {
        pathsHtml += `<path class="bm-muscle-path ${isSelected}" data-key="${key}" d="${pathD}" fill="${color}" />`;
      });
    }
  }

  viewport.innerHTML = `
    <svg class="bm-svg-layer" viewBox="0 0 250 500" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
      ${pathsHtml}
    </svg>
  `;

  const paths = viewport.querySelectorAll(".bm-muscle-path");
  paths.forEach((p) => {
    const key = p.getAttribute("data-key");

    p.addEventListener("mouseenter", () => renderDetails(key));
    p.addEventListener("mouseleave", () => renderDetails(selectedKey));
    p.addEventListener("click", () => {
      selectedKey = key;
      paths.forEach(el => el.classList.remove("selected"));
      viewport.querySelectorAll(`[data-key="${key}"]`).forEach(el => el.classList.add("selected"));
      renderDetails(key);
    });
  });

  renderDetails(selectedKey);
}

btnFront.onclick = () => {
  currentView = "front";
  selectedKey = "chest";
  btnFront.classList.add("active");
  btnBack.classList.remove("active");
  renderMap();
};

btnBack.onclick = () => {
  currentView = "back";
  selectedKey = "traps";
  btnBack.classList.add("active");
  btnFront.classList.remove("active");
  renderMap();
};

renderMap();
```
