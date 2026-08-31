```dataviewjs
const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// =========================================================================
// MUSCLE REGISTRY & ANATOMICAL REGIONS (Mapped from ImageMapster model)
// =========================================================================
const muscleRegistry = {
  head: {
    name: "Head & Cranium",
    region: "Head / Skull",
    defaultHours: 24,
    tier: "Fast Recovery",
    desc: "Cranial and facial tension mapping; cervical spine stabilization.",
    coords: [100, 12, 114, 18, 120, 32, 118, 54, 100, 64, 82, 54, 80, 32, 86, 18],
    view: "both"
  },
  neck: {
    name: "Cervical Spine / Neck",
    region: "Neck",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Neck flexors, extensors, and upper trapezius insertion zone.",
    coords: [92, 65, 108, 65, 112, 82, 88, 82],
    view: "both"
  },
  left_shoulder: {
    name: "Left Shoulder / Deltoid",
    region: "Left Upper Body",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Anterior, lateral, and posterior deltoid heads.",
    coords: [58, 86, 86, 84, 74, 122, 52, 110],
    view: "front"
  },
  right_shoulder: {
    name: "Right Shoulder / Deltoid",
    region: "Right Upper Body",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Anterior, lateral, and posterior deltoid heads.",
    coords: [114, 84, 142, 86, 148, 110, 126, 122],
    view: "front"
  },
  chest: {
    name: "Pectoralis Major",
    region: "Chest",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Sternal and clavicular heads of the chest wall.",
    coords: [88, 84, 112, 84, 124, 94, 122, 134, 78, 134, 76, 94],
    view: "front"
  },
  abdominal: {
    name: "Abdominal Wall",
    region: "Core / Flank",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Rectus abdominis and abdominal core musculature.",
    coords: [78, 136, 122, 136, 118, 180, 82, 180],
    view: "front"
  },
  pelvis: {
    name: "Pelvis / Hip Girdle",
    region: "Pelvic Floor & Hips",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Pelvic stabilization and iliopsoas insertion zone.",
    coords: [80, 182, 120, 182, 126, 210, 100, 218, 74, 210],
    view: "front"
  },
  left_femur_thigh: {
    name: "Left Thigh / Quadriceps",
    region: "Left Leg (Front)",
    defaultHours: 72,
    tier: "Slow / Deep",
    desc: "Quadriceps femoris group and vastus lateralis/medialis.",
    coords: [74, 212, 98, 218, 96, 280, 72, 276],
    view: "front"
  },
  right_femur_thigh: {
    name: "Right Thigh / Quadriceps",
    region: "Right Leg (Front)",
    defaultHours: 72,
    tier: "Slow / Deep",
    desc: "Quadriceps femoris group and vastus lateralis/medialis.",
    coords: [102, 218, 126, 212, 128, 276, 104, 280],
    view: "front"
  },
  left_knee: {
    name: "Left Knee Joint",
    region: "Left Knee",
    defaultHours: 48,
    tier: "Joint / Connective",
    desc: "Patellar tendon, ACL/MCL joint capsule.",
    coords: [72, 278, 96, 282, 94, 306, 72, 306],
    view: "front"
  },
  right_knee: {
    name: "Right Knee Joint",
    region: "Right Knee",
    defaultHours: 48,
    tier: "Joint / Connective",
    desc: "Patellar tendon, ACL/MCL joint capsule.",
    coords: [104, 282, 128, 278, 128, 306, 106, 306],
    view: "front"
  },
  left_tib_fib: {
    name: "Left Tibia / Fibula / Shin",
    region: "Left Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Tibialis anterior and peroneal compartment.",
    coords: [72, 308, 94, 308, 91, 370, 74, 370],
    view: "front"
  },
  right_tib_fib: {
    name: "Right Tibia / Fibula / Shin",
    region: "Right Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Tibialis anterior and peroneal compartment.",
    coords: [106, 308, 128, 308, 126, 370, 109, 370],
    view: "front"
  },
  left_ankle: {
    name: "Left Ankle & Foot",
    region: "Left Ankle",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Talocrural joint and metatarsal arches.",
    coords: [74, 372, 91, 372, 94, 396, 68, 396],
    view: "front"
  },
  right_ankle: {
    name: "Right Ankle & Foot",
    region: "Right Ankle",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Talocrural joint and metatarsal arches.",
    coords: [109, 372, 126, 372, 132, 396, 106, 396],
    view: "front"
  },
  left_humerus: {
    name: "Left Upper Arm / Bicep",
    region: "Left Arm",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Biceps brachii and coracobrachialis.",
    coords: [52, 112, 72, 122, 66, 156, 48, 148],
    view: "front"
  },
  right_humerus: {
    name: "Right Upper Arm / Bicep",
    region: "Right Arm",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Biceps brachii and coracobrachialis.",
    coords: [128, 122, 148, 112, 152, 148, 134, 156],
    view: "front"
  },
  left_forearm: {
    name: "Left Forearm & Wrist",
    region: "Left Forearm",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Wrist flexors and pronator teres.",
    coords: [48, 150, 66, 158, 56, 204, 40, 196],
    view: "front"
  },
  right_forearm: {
    name: "Right Forearm & Wrist",
    region: "Right Forearm",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Wrist flexors and pronator teres.",
    coords: [134, 158, 152, 150, 160, 196, 144, 204],
    view: "front"
  },
  left_hand: {
    name: "Left Hand",
    region: "Left Extremity",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Palmar fascia, thenar, and hypothenar compartments.",
    coords: [40, 198, 56, 204, 50, 226, 36, 220],
    view: "front"
  },
  right_hand: {
    name: "Right Hand",
    region: "Right Extremity",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Palmar fascia, thenar, and hypothenar compartments.",
    coords: [144, 204, 160, 198, 164, 220, 150, 226],
    view: "front"
  },

  // --- Posterior Only ---
  spine: {
    name: "Vertebral Spine & Erector Spinae",
    region: "Spine / Posterior",
    defaultHours: 72,
    tier: "Slow / Systemic",
    desc: "Thoracolumbar fascia, erector spinae, and spinal column.",
    coords: [93, 84, 107, 84, 106, 180, 94, 180],
    view: "back"
  },
  upper_back: {
    name: "Trapezius & Rhomboids",
    region: "Upper Back",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Scapular stabilizers and thoracic postural musculature.",
    coords: [74, 88, 126, 88, 122, 134, 78, 134],
    view: "back"
  },
  glutes: {
    name: "Gluteal Complex",
    region: "Glutes / Hips",
    defaultHours: 60,
    tier: "Slow / Deep",
    desc: "Gluteus maximus, medius, and piriformis.",
    coords: [76, 182, 124, 182, 128, 216, 100, 222, 72, 216],
    view: "back"
  },
  hamstrings: {
    name: "Hamstrings Complex",
    region: "Thighs (Back)",
    defaultHours: 72,
    tier: "Slow / Deep",
    desc: "Biceps femoris, semitendinosus, and semimembranosus.",
    coords: [72, 218, 128, 218, 126, 278, 74, 278],
    view: "back"
  },
  calves_back: {
    name: "Gastrocnemius & Soleus",
    region: "Calves (Back)",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Calf bellies and Achilles tendon complex.",
    coords: [72, 286, 128, 286, 126, 370, 74, 370],
    view: "back"
  }
};

// =========================================================================
// COMPONENT STYLES
// =========================================================================
const styleEl = document.createElement("style");
styleEl.textContent = `
  .bodymap-root {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--background-secondary, #18181b);
    border: 1px solid var(--background-modifier-border, #27272a);
    border-radius: 12px;
    padding: 20px;
    gap: 16px;
    font-family: var(--font-interface);
  }
  .bm-navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 580px;
  }
  .bm-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-normal, #f4f4f5);
  }
  .bm-btn-group {
    display: flex;
    background: var(--background-primary, #09090b);
    padding: 3px;
    border-radius: 8px;
    border: 1px solid var(--background-modifier-border, #27272a);
    gap: 4px;
  }
  .bm-btn {
    border: none;
    background: transparent;
    color: var(--text-muted, #a1a1aa);
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 0.78rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .bm-btn.active {
    background: var(--interactive-accent, #3b82f6);
    color: #ffffff;
  }
  .bm-workspace {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }
  .bm-canvas-box {
    width: 210px;
    position: relative;
  }
  .bm-canvas-box svg {
    width: 100%;
    height: auto;
  }
  .bm-poly {
    fill: #27272a;
    fill-opacity: 0.7;
    stroke: #3f3f46;
    stroke-width: 1.5;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .bm-poly:hover {
    fill: #d42e16 !important;
    fill-opacity: 0.6 !important;
    stroke: #3320ff !important;
    stroke-width: 2 !important;
  }
  .bm-poly.selected {
    fill: #d42e16 !important;
    fill-opacity: 0.85 !important;
    stroke: #3320ff !important;
    stroke-width: 2.5 !important;
  }
  .bm-sidebar {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 290px;
  }
  .bm-card {
    background: var(--background-primary, #09090b);
    border: 1px solid var(--background-modifier-border, #27272a);
    border-radius: 10px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .bm-card-subtitle {
    font-size: 0.72rem;
    color: var(--text-muted, #a1a1aa);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }
  .bm-card-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-normal, #f4f4f5);
  }
  .bm-meta-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: var(--text-muted, #a1a1aa);
  }
  .bm-meta-val {
    font-weight: 600;
    color: var(--text-normal, #f4f4f5);
  }
  .bm-desc-box {
    font-size: 0.78rem;
    line-height: 1.4;
    color: var(--text-muted, #a1a1aa);
    background: var(--background-secondary, #18181b);
    padding: 8px 10px;
    border-radius: 6px;
  }
  .bm-selection-tray {
    font-size: 0.8rem;
    color: var(--text-muted, #a1a1aa);
    background: var(--background-primary, #09090b);
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid var(--background-modifier-border, #27272a);
    line-height: 1.4;
  }
  .bm-selection-tray b {
    color: var(--text-normal, #f4f4f5);
  }
`;
rootEl.appendChild(styleEl);

// =========================================================================
// CONTROLLER & UI MOUNT
// =========================================================================
let currentView = "front";
let selectedKeys = new Set(["chest"]);
let hoveredKey = "chest";

const navBar = rootEl.createDiv({ cls: "bm-navbar" });
navBar.createEl("span", { text: "Muscle Recovery Architecture", cls: "bm-title" });

const btnGroup = navBar.createDiv({ cls: "bm-btn-group" });
const btnFront = btnGroup.createEl("button", { cls: "bm-btn active", text: "Anterior" });
const btnBack = btnGroup.createEl("button", { cls: "bm-btn", text: "Posterior" });

const workspace = rootEl.createDiv({ cls: "bm-workspace" });
const canvasBox = workspace.createDiv({ cls: "bm-canvas-box" });
const sidebar = workspace.createDiv({ cls: "bm-sidebar" });
const cardBox = sidebar.createDiv({ cls: "bm-card" });
const selectionsBox = sidebar.createDiv({ cls: "bm-selection-tray" });

function formatCoords(coords) {
  const pairs = [];
  for (let i = 0; i < coords.length; i += 2) {
    pairs.push(`${coords[i]},${coords[i+1]}`);
  }
  return pairs.join(" ");
}

function updateSelectionsTray() {
  if (selectedKeys.size > 0) {
    const names = Array.from(selectedKeys)
      .map(k => (muscleRegistry[k] ? muscleRegistry[k].name : k))
      .join(", ");
    selectionsBox.innerHTML = `<b>Selected Body Parts:</b> ${names}`;
  } else {
    selectionsBox.innerHTML = `<b>Please select a body part</b>`;
  }
}

function renderDetails(key) {
  const model = muscleRegistry[key];
  if (!model) return;

  cardBox.innerHTML = `
    <div class="bm-card-subtitle">${model.region}</div>
    <div class="bm-card-title">${model.name}</div>
    <div class="bm-meta-row">
      <span>Recovery Window:</span>
      <span class="bm-meta-val">${model.defaultHours} hrs</span>
    </div>
    <div class="bm-meta-row">
      <span>Recovery Tier:</span>
      <span class="bm-meta-val">${model.tier}</span>
    </div>
    <div class="bm-desc-box">${model.desc}</div>
  `;
}

function renderMap() {
  let polygons = "";
  for (const [key, item] of Object.entries(muscleRegistry)) {
    if (item.view === currentView || item.view === "both") {
      const isSelected = selectedKeys.has(key) ? "selected" : "";
      polygons += `<polygon class="bm-poly ${isSelected}" data-key="${key}" points="${formatCoords(item.coords)}" />`;
    }
  }

  canvasBox.innerHTML = `
    <svg viewBox="0 0 200 420" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
      <!-- Silhouette Base Container -->
      <g opacity="0.15">
        <path d="M100,12 C114,12 122,26 122,44 C122,60 114,72 100,72 C86,72 78,60 78,44 C78,26 86,12 100,12 Z" fill="#64748b" />
        <path d="M70,96 L130,96 L124,180 L76,180 Z" fill="#64748b" />
        <path d="M74,210 L126,210 L124,374 L76,374 Z" fill="#64748b" />
      </g>
      <!-- Interactive Region Polygons[cite: 1] -->
      ${polygons}
    </svg>
  `;

  const polyEls = canvasBox.querySelectorAll(".bm-poly");
  polyEls.forEach(poly => {
    const key = poly.getAttribute("data-key");

    poly.addEventListener("mouseenter", () => renderDetails(key));
    poly.addEventListener("mouseleave", () => renderDetails(hoveredKey));
    
    // Toggle multi-select behavior[cite: 1]
    poly.addEventListener("click", () => {
      if (selectedKeys.has(key)) {
        selectedKeys.delete(key);
        poly.classList.remove("selected");
      } else {
        selectedKeys.add(key);
        poly.classList.add("selected");
      }
      hoveredKey = key;
      renderDetails(key);
      updateSelectionsTray();
    });
  });

  renderDetails(hoveredKey);
  updateSelectionsTray();
}

btnFront.onclick = () => {
  currentView = "front";
  btnFront.classList.add("active");
  btnBack.classList.remove("active");
  renderMap();
};

btnBack.onclick = () => {
  currentView = "back";
  btnBack.classList.add("active");
  btnFront.classList.remove("active");
  renderMap();
};

renderMap();
```
