```dataviewjs
const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// =========================================================================
// MUSCLE REGISTRY & CALIBRATED POLYGONS (Ordered Convex Paths)
// =========================================================================
const muscleRegistry = {
  // --- Anterior (Front) ---
  chest: {
    name: "Pectoralis Major",
    region: "Chest",
    recovery: 35,
    defaultHours: 48,
    tier: "High Strain",
    desc: "Primary horizontal adduction and pressing motor.",
    coords: "64,90 125,96 186,90 196,128 125,142 54,128",
    view: "front"
  },
  delts_front: {
    name: "Anterior Deltoids",
    region: "Shoulders",
    recovery: 85,
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Shoulder flexion and overhead pressing synergist.",
    coords: "36,88 64,90 54,128 26,120",
    coords_r: "186,90 214,88 224,120 196,128",
    view: "front"
  },
  biceps: {
    name: "Biceps Brachii",
    region: "Upper Arm (Front)",
    recovery: 70,
    defaultHours: 36,
    tier: "Optimal",
    desc: "Elbow flexion and forearm supination.",
    coords: "26,125 52,130 44,170 18,160",
    coords_r: "198,130 224,125 232,160 206,170",
    view: "front"
  },
  abs: {
    name: "Rectus Abdominis",
    region: "Core",
    recovery: 95,
    defaultHours: 24,
    tier: "Fully Recovered",
    desc: "Spinal flexion and anti-extension trunk stability.",
    coords: "78,144 172,144 162,228 88,228",
    view: "front"
  },
  quads: {
    name: "Quadriceps Femoris",
    region: "Thighs (Front)",
    recovery: 25,
    defaultHours: 72,
    tier: "High Strain",
    desc: "Massive prime mover for knee extension and squat locomotion.",
    coords: "66,232 116,232 108,340 68,335",
    coords_r: "134,232 184,232 182,335 142,340",
    view: "front"
  },
  calves_front: {
    name: "Tibialis Anterior & Calves",
    region: "Lower Leg (Front)",
    recovery: 80,
    defaultHours: 24,
    tier: "Optimal",
    desc: "Ankle dorsiflexion and lateral stability.",
    coords: "68,355 102,355 96,440 74,440",
    coords_r: "148,355 182,355 176,440 154,440",
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
    coords: "96,46 154,46 178,102 125,152 72,102",
    view: "back"
  },
  delts_rear: {
    name: "Posterior Deltoids",
    region: "Rear Shoulders",
    recovery: 80,
    defaultHours: 24,
    tier: "Optimal",
    desc: "Horizontal shoulder abduction and external rotation.",
    coords: "36,88 72,102 62,132 26,120",
    coords_r: "178,102 214,88 224,120 188,132",
    view: "back"
  },
  lats: {
    name: "Latissimus Dorsi",
    region: "Mid Back / Flanks",
    recovery: 45,
    defaultHours: 48,
    tier: "Fatigued",
    desc: "Humeral adduction and vertical/horizontal pulling driver.",
    coords: "72,104 125,152 178,104 166,206 84,206",
    view: "back"
  },
  triceps: {
    name: "Triceps Brachii",
    region: "Upper Arm (Back)",
    recovery: 90,
    defaultHours: 48,
    tier: "Fully Recovered",
    desc: "Elbow extension and overhead elbow lockout.",
    coords: "24,125 50,132 40,172 16,162",
    coords_r: "200,132 226,125 234,162 210,172",
    view: "back"
  },
  glutes: {
    name: "Gluteus Maximus",
    region: "Posterior Chain",
    recovery: 35,
    defaultHours: 60,
    tier: "High Strain",
    desc: "Primary hip extensor and external rotator.",
    coords: "64,208 186,208 182,272 125,260 68,272",
    view: "back"
  },
  hamstrings: {
    name: "Hamstrings",
    region: "Thighs (Back)",
    recovery: 30,
    defaultHours: 72,
    tier: "High Strain",
    desc: "Knee flexion and hip extension hinge driver.",
    coords: "68,274 116,268 108,350 70,348",
    coords_r: "134,268 182,274 180,348 142,350",
    view: "back"
  },
  calves_back: {
    name: "Gastrocnemius & Soleus",
    region: "Calves (Back)",
    recovery: 85,
    defaultHours: 24,
    tier: "Optimal",
    desc: "Plantarflexion and ankle stability.",
    coords: "66,360 104,360 96,442 72,442",
    coords_r: "146,360 184,360 178,442 154,442",
    view: "back"
  }
};

// =========================================================================
// COLOR ENGINE
// =========================================================================
function getHeatColor(recovery) {
  if (recovery >= 80) return "rgba(245, 158, 11, 0.65)"; // Amber
  if (recovery >= 50) return "rgba(249, 115, 22, 0.75)"; // Orange
  return "rgba(239, 68, 68, 0.85)";                      // Red
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
    width: 240px;
    height: 480px;
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

// Vault image locator
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
  
  // Clean frame-lock: 0% for Front, 100% for Back
  viewport.style.backgroundImage = `url("${imgUrl}")`;
  viewport.style.backgroundPosition = isFront ? "0% 0%" : "100% 0%";

  let polygons = "";
  for (const [key, item] of Object.entries(muscleRegistry)) {
    if (item.view === currentView) {
      const isSelected = key === selectedKey ? "selected" : "";
      const color = getHeatColor(item.recovery);
      polygons += `<polygon class="bm-muscle-mesh ${isSelected}" data-key="${key}" points="${item.coords}" fill="${color}" />`;
      if (item.coords_r) {
        polygons += `<polygon class="bm-muscle-mesh ${isSelected}" data-key="${key}" points="${item.coords_r}" fill="${color}" />`;
      }
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
