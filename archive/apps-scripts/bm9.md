```dataviewjs
const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// =========================================================================
// ASSET RESOLUTION (Loads anatomy_front.jpg and anatomy_back.jpg from Vault)
// =========================================================================
function getImgPath(name) {
  const file = app.metadataCache.getFirstLinkpathDest(name, "");
  return file 
    ? app.vault.adapter.getResourcePath(file.path)
    : app.vault.adapter.getResourcePath(`Attachments/${name}.jpg`);
}

const images = {
  front: getImgPath("anatomy_front"),
  back: getImgPath("anatomy_back")
};

// =========================================================================
// MUSCLE REGISTRY & ANATOMICALLY CURVED BEZIER PATHS
// =========================================================================
const muscleRegistry = {
  // --- Posterior (Back View) ---
  traps: {
    name: "Trapezius (Upper & Mid)",
    region: "Upper Back / Cervical",
    recovery: 30,
    defaultHours: 36,
    tier: "High Strain",
    desc: "Scapular elevation, upward rotation, and thoracic spine stabilization.",
    d: [
      "M 265,95 C 290,88 310,88 335,95 C 342,130 388,180 435,215 C 385,255 330,320 300,425 C 270,320 215,255 165,215 C 212,180 258,130 265,95 Z"
    ],
    view: "back"
  },
  delts_rear: {
    name: "Posterior Deltoids",
    region: "Shoulders (Rear Head)",
    recovery: 80,
    defaultHours: 24,
    tier: "Optimal",
    desc: "Horizontal shoulder abduction and external joint integrity.",
    d: [
      "M 160,215 C 130,225 105,255 95,305 C 110,345 130,355 150,335 C 170,295 175,250 160,215 Z", // Left Rear Delt
      "M 440,215 C 470,225 495,255 505,305 C 490,345 470,355 450,335 C 430,295 425,250 440,215 Z"  // Right Rear Delt
    ],
    view: "back"
  },
  lats: {
    name: "Latissimus Dorsi",
    region: "Mid / Lower Back",
    recovery: 45,
    defaultHours: 48,
    tier: "Fatigued",
    desc: "Humeral adduction, extension, and horizontal lat drive.",
    d: [
      "M 175,270 C 220,295 270,340 295,435 C 275,540 255,620 220,670 C 190,570 175,440 175,270 Z", // Left Lat
      "M 425,270 C 380,295 330,340 305,435 C 325,540 345,620 380,670 C 410,570 425,440 425,270 Z"  // Right Lat
    ],
    view: "back"
  },
  infraspinatus: {
    name: "Infraspinatus & Teres Major",
    region: "Rotator Cuff / Scapula",
    recovery: 65,
    defaultHours: 36,
    tier: "Recovering",
    desc: "Scapular external rotation and dynamic shoulder stabilizing brace.",
    d: [
      "M 170,230 C 210,265 240,310 240,340 C 200,375 165,370 155,340 C 150,300 158,260 170,230 Z", // Left Scapular
      "M 430,230 C 390,265 360,310 360,340 C 400,375 435,370 445,340 C 450,300 442,260 430,230 Z"  // Right Scapular
    ],
    view: "back"
  },
  triceps: {
    name: "Triceps Brachii (Lateral & Long Heads)",
    region: "Upper Arm (Back)",
    recovery: 90,
    defaultHours: 48,
    tier: "Fully Recovered",
    desc: "Elbow extension and overhead lockout.",
    d: [
      "M 90,315 C 80,360 75,435 90,480 C 105,490 120,480 125,440 C 135,385 125,335 90,315 Z", // Left Tricep
      "M 510,315 C 520,360 525,435 510,480 C 495,490 480,480 475,440 C 465,385 475,335 510,315 Z"  // Right Tricep
    ],
    view: "back"
  },
  erectors: {
    name: "Erector Spinae / Lower Back",
    region: "Lumbar & Thoracic Column",
    recovery: 40,
    defaultHours: 72,
    tier: "Fatigued",
    desc: "Spinal extension and anti-flexion isometric core brace.",
    d: [
      "M 285,430 C 295,430 305,430 315,430 C 315,580 308,680 300,700 C 292,680 285,580 285,430 Z"
    ],
    view: "back"
  },
  glutes: {
    name: "Gluteus Maximus",
    region: "Posterior Chain",
    recovery: 35,
    defaultHours: 60,
    tier: "High Strain",
    desc: "Primary hip extensor and external pelvic rotator.",
    d: [
      "M 300,700 C 260,685 205,705 190,750 C 175,810 215,860 270,855 C 295,850 300,810 300,700 Z", // Left Glute
      "M 300,700 C 340,685 395,705 410,750 C 425,810 385,860 330,855 C 305,850 300,810 300,700 Z"  // Right Glute
    ],
    view: "back"
  },

  // --- Anterior (Front View) ---
  chest: {
    name: "Pectoralis Major",
    region: "Chest",
    recovery: 35,
    defaultHours: 48,
    tier: "High Strain",
    desc: "Horizontal adduction and pushing prime mover.",
    d: [
      "M 295,210 C 250,195 205,188 170,210 C 145,225 140,255 155,280 C 175,305 235,315 295,305 Z", // Left Pec
      "M 305,210 C 350,195 395,188 430,210 C 455,225 460,255 445,280 C 425,305 365,315 305,305 Z"  // Right Pec
    ],
    view: "front"
  },
  delts_front: {
    name: "Anterior & Lateral Deltoids",
    region: "Shoulders (Front)",
    recovery: 85,
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Shoulder abduction, anterior flexion, and pressing cap.",
    d: [
      "M 165,205 C 130,200 100,220 90,245 C 80,275 110,295 135,285 C 150,270 160,245 165,205 Z", // Left Front Delt
      "M 435,205 C 470,200 500,220 510,245 C 520,275 490,295 465,285 C 450,270 440,245 435,205 Z"  // Right Front Delt
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
    d: [
      "M 100,290 C 80,310 75,345 90,370 C 105,385 130,375 140,350 C 150,325 135,295 100,290 Z", // Left Bicep
      "M 500,290 C 520,310 525,345 510,370 C 495,385 470,375 460,350 C 450,325 465,295 500,290 Z"  // Right Bicep
    ],
    view: "front"
  },
  abs: {
    name: "Rectus Abdominis & Core",
    region: "Core / 6-Pack",
    recovery: 95,
    defaultHours: 24,
    tier: "Fully Recovered",
    desc: "Segmented abdominal wall and core trunk brace.",
    d: [
      "M 235,320 C 270,315 330,315 365,320 C 375,380 370,440 350,500 C 320,510 280,510 250,500 C 230,440 225,380 235,320 Z"
    ],
    view: "front"
  },
  obliques: {
    name: "External Obliques",
    region: "Flanks",
    recovery: 80,
    defaultHours: 24,
    tier: "Optimal",
    desc: "Lateral trunk flexion and rotational stability.",
    d: [
      "M 175,325 C 225,320 230,380 220,490 C 185,465 170,410 175,325 Z", // Left Oblique
      "M 425,325 C 375,320 370,380 380,490 C 415,465 430,410 425,325 Z"  // Right Oblique
    ],
    view: "front"
  },
  quads: {
    name: "Quadriceps Femoris",
    region: "Thighs (Front)",
    recovery: 25,
    defaultHours: 72,
    tier: "High Strain",
    desc: "Knee extension and hip flexion compound power.",
    d: [
      "M 195,510 C 160,545 155,620 170,690 C 185,720 210,725 230,705 C 260,675 270,585 265,515 Z", // Left Quad
      "M 405,510 C 440,545 445,620 430,690 C 415,720 390,725 370,705 C 340,675 330,585 335,515 Z"  // Right Quad
    ],
    view: "front"
  }
};

// =========================================================================
// COLOR ENGINE (Strain Heatmap)
// =========================================================================
function getHeatColor(recovery) {
  if (recovery >= 80) return "rgba(245, 158, 11, 0.65)"; // Amber / Recovered
  if (recovery >= 50) return "rgba(249, 115, 22, 0.75)"; // Orange / Fatigue
  return "rgba(239, 68, 68, 0.85)";                      // Red / Strain
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
    max-width: 600px;
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
    width: 270px;
    height: 480px;
    border-radius: 12px;
    background-color: #050508;
    background-size: cover;
    background-position: center top;
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
  .bm-muscle-path {
    cursor: pointer;
    transition: fill 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
    filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.5));
  }
  .bm-muscle-path:hover {
    filter: brightness(1.4) drop-shadow(0 0 14px rgba(255, 255, 255, 0.95)) !important;
  }
  .bm-muscle-path.selected {
    filter: brightness(1.6) drop-shadow(0 0 16px #60a5fa) !important;
    stroke: rgba(255, 255, 255, 0.9);
    stroke-width: 2;
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
let currentView = "back";
let selectedKey = "traps";

const navBar = rootEl.createDiv({ cls: "bm-navbar" });
navBar.createEl("span", { text: "Muscle Recovery Architecture", cls: "bm-title" });

const btnGroup = navBar.createDiv({ cls: "bm-btn-group" });
const btnFront = btnGroup.createEl("button", { cls: "bm-btn", text: "Anterior" });
const btnBack = btnGroup.createEl("button", { cls: "bm-btn active", text: "Posterior" });

const workspace = rootEl.createDiv({ cls: "bm-workspace" });
const viewport = workspace.createDiv({ cls: "bm-viewport" });
const cardBox = workspace.createDiv({ cls: "bm-card" });

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
  viewport.style.backgroundImage = `url("${images[currentView]}")`;

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
    <svg class="bm-svg-layer" viewBox="0 0 600 850" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
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
