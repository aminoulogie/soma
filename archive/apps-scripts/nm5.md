```dataviewjs
const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// =========================================================================
// MUSCLE REGISTRY & CALIBRATED ANATOMICAL MESHES
// =========================================================================
const muscleRegistry = {
  // --- Anterior (Front) ---
  chest: {
    name: "Pectoralis Major",
    region: "Chest",
    recovery: 35,
    defaultHours: 48,
    tier: "High Strain",
    desc: "Primary horizontal adduction and pushing prime mover.",
    coords: "80,105 125,115 170,105 182,148 125,162 68,148",
    view: "front"
  },
  delts_front: {
    name: "Anterior Deltoids",
    region: "Shoulders (Front)",
    recovery: 85,
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Shoulder flexion and overhead pressing synergist.",
    coords: "48,102 78,105 68,148 32,138 172,105 202,102 218,138 182,148",
    view: "front"
  },
  biceps: {
    name: "Biceps Brachii",
    region: "Upper Arm (Front)",
    recovery: 70,
    defaultHours: 36,
    tier: "Optimal",
    desc: "Elbow flexion and forearm supination.",
    coords: "32,142 62,150 52,192 24,180 188,150 218,142 226,180 198,192",
    view: "front"
  },
  abs: {
    name: "Rectus Abdominis",
    region: "Core",
    recovery: 95,
    defaultHours: 24,
    tier: "Fully Recovered",
    desc: "Spinal flexion and anti-extension core trunk brace.",
    coords: "86,162 164,162 155,248 95,248",
    view: "front"
  },
  quads: {
    name: "Quadriceps Femoris",
    region: "Thighs (Front)",
    recovery: 25,
    defaultHours: 72,
    tier: "High Strain",
    desc: "Massive prime mover for knee extension and squat locomotion.",
    coords: "70,252 118,252 110,365 72,360 132,252 180,252 178,360 140,365",
    view: "front"
  },
  calves_front: {
    name: "Tibialis Anterior & Calves",
    region: "Lower Leg (Front)",
    recovery: 80,
    defaultHours: 24,
    tier: "Optimal",
    desc: "Ankle dorsiflexion and lateral tibialis stabilization.",
    coords: "72,382 105,382 100,465 78,465 145,382 178,382 172,465 150,465",
    view: "front"
  },

  // --- Posterior (Back) ---
  traps: {
    name: "Trapezius & Upper Back",
    region: "Upper Back / Neck",
    recovery: 30,
    defaultHours: 36,
    tier: "High Strain",
    desc: "Scapular elevation, upward rotation, and posterior neck stability.",
    coords: "102,52 148,52 175,115 125,168 75,115",
    view: "back"
  },
  delts_rear: {
    name: "Posterior Deltoids",
    region: "Rear Shoulders",
    recovery: 80,
    defaultHours: 24,
    tier: "Optimal",
    desc: "Horizontal shoulder abduction and external joint stability.",
    coords: "48,102 75,115 65,150 32,138 175,115 202,102 218,138 185,150",
    view: "back"
  },
  lats: {
    name: "Latissimus Dorsi",
    region: "Mid Back / Flanks",
    recovery: 45,
    defaultHours: 48,
    tier: "Fatigued",
    desc: "Humeral adduction and vertical/horizontal pulling driver.",
    coords: "75,118 125,168 175,118 162,228 88,228",
    view: "back"
  },
  triceps: {
    name: "Triceps Brachii",
    region: "Upper Arm (Back)",
    recovery: 90,
    defaultHours: 48,
    tier: "Fully Recovered",
    desc: "Elbow extension and overhead pressing lockout.",
    coords: "28,142 58,150 48,195 22,185 192,150 222,142 228,185 202,195",
    view: "back"
  },
  glutes: {
    name: "Gluteus Maximus",
    region: "Posterior Chain",
    recovery: 35,
    defaultHours: 60,
    tier: "High Strain",
    desc: "Primary hip extensor and external pelvic rotator.",
    coords: "70,230 180,230 175,298 125,285 75,298",
    view: "back"
  },
  hamstrings: {
    name: "Hamstrings Complex",
    region: "Thighs (Back)",
    recovery: 30,
    defaultHours: 72,
    tier: "High Strain",
    desc: "Knee flexion and posterior hip hinge mechanics.",
    coords: "74,298 120,292 112,375 75,372 130,292 176,298 175,372 138,375",
    view: "back"
  },
  calves_back: {
    name: "Gastrocnemius & Soleus",
    region: "Calves (Back)",
    recovery: 85,
    defaultHours: 24,
    tier: "Optimal",
    desc: "Plantarflexion and high-frequency posterior ankle support.",
    coords: "70,385 110,385 102,468 76,468 140,385 180,385 174,468 148,468",
    view: "back"
  }
};

// =========================================================================
// COLOR ENGINE (Strain Heatmap)
// =========================================================================
function getHeatColor(recovery) {
  if (recovery >= 80) return "rgba(245, 158, 11, 0.65)"; // Amber / Recovered
  if (recovery >= 50) return "rgba(249, 115, 22, 0.75)"; // Orange / Fatigue
  return "rgba(239, 68, 68, 0.85)";                      // Red / High Strain
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
    letter-spacing: 0.4px;
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
    overflow: hidden;
    border-radius: 12px;
    background: #000000;
    box-shadow: 0 8px 24px rgba(0,0,0,0.6);
  }
  .bm-bg-image {
    position: absolute;
    top: 0;
    height: 100%;
    width: 200%;
    max-width: none;
    pointer-events: none;
  }
  .bm-svg-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    mix-blend-mode: screen;
  }
  .bm-muscle-mesh {
    cursor: pointer;
    transition: fill 0.2s ease, opacity 0.2s ease, filter 0.2s ease;
    filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.5));
  }
  .bm-muscle-mesh:hover {
    filter: brightness(1.35) drop-shadow(0 0 12px rgba(255, 255, 255, 0.85)) !important;
  }
  .bm-muscle-mesh.selected {
    filter: brightness(1.5) drop-shadow(0 0 14px #60a5fa) !important;
    stroke: rgba(255, 255, 255, 0.85);
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
    box-shadow: 0 4px 16px rgba(0,0,0,0.3);
  }
  .bm-card-header {
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding-bottom: 8px;
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
    border: 1px solid rgba(255, 255, 255, 0.04);
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

// Resolves anatomy_base.png from vault attachments
const fileObj = app.metadataCache.getFirstLinkpathDest("anatomy_base", "");
const imgUrl = fileObj 
  ? app.vault.adapter.getResourcePath(fileObj.path) 
  : app.vault.adapter.getResourcePath("Attachments/anatomy_base.png");

function renderDetails(key) {
  const model = muscleRegistry[key];
  if (!model) return;

  const color = getHeatColor(model.recovery);

  cardBox.innerHTML = `
    <div class="bm-card-header">
      <div class="bm-card-subtitle">${model.region}</div>
      <div class="bm-card-title">${model.name}</div>
    </div>
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
  const imgLeftOffset = isFront ? "0%" : "-100%";

  let polygons = "";
  for (const [key, item] of Object.entries(muscleRegistry)) {
    if (item.view === currentView) {
      const isSelected = key === selectedKey ? "selected" : "";
      const color = getHeatColor(item.recovery);
      polygons += `<polygon class="bm-muscle-mesh ${isSelected}" data-key="${key}" points="${item.coords}" fill="${color}" />`;
    }
  }

  viewport.innerHTML = `
    <img class="bm-bg-image" src="${imgUrl}" style="left: ${imgLeftOffset};" alt="Anatomy Render" />
    <svg class="bm-svg-layer" viewBox="0 0 250 500" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
      ${polygons}
    </svg>
  `;

  const meshes = viewport.querySelectorAll(".bm-muscle-mesh");
  meshes.forEach((mesh) => {
    const key = mesh.getAttribute("data-key");

    mesh.addEventListener("mouseenter", () => renderDetails(key));
    mesh.addEventListener("mouseleave", () => renderDetails(selectedKey));
    mesh.addEventListener("click", () => {
      selectedKey = key;
      meshes.forEach(m => m.classList.remove("selected"));
      mesh.classList.add("selected");
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
