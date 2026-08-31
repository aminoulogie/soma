```dataviewjs
const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// =========================================================================
// MUSCLE REGISTRY & TIGHT CALIBRATED ANATOMY MESHES
// =========================================================================
const muscleRegistry = {
  // --- Anterior (Front) ---
  chest: {
    name: "Pectoralis Major",
    region: "Chest",
    recovery: 35,
    defaultHours: 48,
    tier: "High Strain",
    desc: "Primary horizontal adduction and pushing motor.",
    paths: [
      "78,98 123,104 123,148 76,146 64,120", // Left Pec
      "127,104 172,98 186,120 174,146 127,148" // Right Pec
    ],
    view: "front"
  },
  delts_front: {
    name: "Anterior Deltoids",
    region: "Shoulders (Front)",
    recovery: 85,
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Shoulder flexion and overhead pressing synergist.",
    paths: [
      "52,94 76,98 68,142 46,134", // Left Deltoid
      "174,98 198,94 204,134 182,142" // Right Deltoid
    ],
    view: "front"
  },
  biceps: {
    name: "Biceps Brachii",
    region: "Upper Arm (Front)",
    recovery: 70,
    defaultHours: 36,
    tier: "Optimal",
    desc: "Elbow flexion and forearm supination.",
    paths: [
      "46,140 68,146 60,188 42,178", // Left Bicep
      "182,146 204,140 208,178 190,188" // Right Bicep
    ],
    view: "front"
  },
  abs: {
    name: "Rectus Abdominis",
    region: "Core",
    recovery: 95,
    defaultHours: 24,
    tier: "Fully Recovered",
    desc: "Spinal flexion and anti-extension trunk stability.",
    paths: [
      "86,152 164,152 155,242 95,242"
    ],
    view: "front"
  },
  quads: {
    name: "Quadriceps Femoris",
    region: "Thighs (Front)",
    recovery: 25,
    defaultHours: 72,
    tier: "High Strain",
    desc: "Massive prime mover for knee extension and squat locomotion.",
    paths: [
      "72,246 116,246 110,358 72,352", // Left Quad
      "134,246 178,246 178,352 140,358" // Right Quad
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
    paths: [
      "74,370 102,370 96,448 76,448", // Left Calf/Shin
      "148,370 176,370 174,448 154,448" // Right Calf/Shin
    ],
    view: "front"
  },

  // --- Posterior (Back) ---
  traps: {
    name: "Trapezius & Upper Back",
    region: "Upper Back / Neck",
    recovery: 30,
    defaultHours: 36,
    tier: "High Strain",
    desc: "Scapular elevation, upward rotation, and retraction.",
    paths: [
      "102,48 148,48 168,102 125,160 82,102"
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
    paths: [
      "52,94 78,102 68,142 46,134", // Left Rear Delt
      "172,102 198,94 204,134 182,142" // Right Rear Delt
    ],
    view: "back"
  },
  lats: {
    name: "Latissimus Dorsi",
    region: "Mid Back / Flanks",
    recovery: 45,
    defaultHours: 48,
    tier: "Fatigued",
    desc: "Humeral adduction and vertical/horizontal pulling driver.",
    paths: [
      "78,108 125,160 172,108 160,214 90,214"
    ],
    view: "back"
  },
  triceps: {
    name: "Triceps Brachii",
    region: "Upper Arm (Back)",
    recovery: 90,
    defaultHours: 48,
    tier: "Fully Recovered",
    desc: "Elbow extension and overhead elbow lockout.",
    paths: [
      "44,138 66,144 58,188 38,178", // Left Tricep
      "184,144 206,138 212,178 192,188" // Right Tricep
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
    paths: [
      "72,216 178,216 172,282 125,270 78,282"
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
    paths: [
      "72,284 116,278 110,360 74,356", // Left Hamstring
      "134,278 178,284 176,356 140,360" // Right Hamstring
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
    paths: [
      "72,372 104,372 98,450 74,450", // Left Calf
      "146,372 178,372 176,450 152,450" // Right Calf
    ],
    view: "back"
  }
};

// =========================================================================
// COLOR ENGINE (Strain Heatmap)
// =========================================================================
function getHeatColor(recovery) {
  if (recovery >= 80) return "rgba(245, 158, 11, 0.6)"; // Amber
  if (recovery >= 50) return "rgba(249, 115, 22, 0.7)"; // Orange
  return "rgba(239, 68, 68, 0.8)";                      // Red
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
    mix-blend-mode: screen;
  }
  .bm-muscle-mesh {
    cursor: pointer;
    transition: fill 0.2s ease, filter 0.2s ease;
    filter: drop-shadow(0 0 6px rgba(239, 68, 68, 0.5));
  }
  .bm-muscle-mesh:hover {
    filter: brightness(1.4) drop-shadow(0 0 12px rgba(255, 255, 255, 0.9)) !important;
  }
  .bm-muscle-mesh.selected {
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

  let polygons = "";
  for (const [key, item] of Object.entries(muscleRegistry)) {
    if (item.view === currentView) {
      const isSelected = key === selectedKey ? "selected" : "";
      const color = getHeatColor(item.recovery);
      item.paths.forEach((p) => {
        polygons += `<polygon class="bm-muscle-mesh ${isSelected}" data-key="${key}" points="${p}" fill="${color}" />`;
      });
    }
  }

  viewport.innerHTML = `
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
      viewport.querySelectorAll(`[data-key="${key}"]`).forEach(m => m.classList.add("selected"));
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
