```dataviewjs
const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// =========================================================================
// MUSCLE REGISTRY & EXACT POLYGON COORDINATE DATA MODEL
// =========================================================================
const muscleRegistry = {
  // --- Anterior (Front Side) ---
  head: {
    name: "Head",
    region: "Head & Cranium",
    defaultHours: 24,
    tier: "Fast Recovery",
    desc: "Cranial and temporal tension mapping.",
    coords: "198,23 175,31 165,78 188,112 212,113 234,72 224,28",
    view: "front"
  },
  maxillofacial: {
    name: "Maxillofacial / Jaw",
    region: "Facial / Masseter",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Masseter, TMJ joint, and lower facial muscles.",
    coords: "220,58 180,58 182,84 199,107 218,82",
    view: "front"
  },
  neck: {
    name: "Neck",
    region: "Cervical Spine",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Sternocleidomastoid, scalenes, and anterior cervical stabilizers.",
    coords: "219,105 225,125 245,135 153,137 175,124 179,103 189,112 206,115",
    view: "front"
  },
  right_shoulder: {
    name: "Right Shoulder",
    region: "Right Deltoid",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Anterior and lateral deltoid complex.",
    coords: "153,136 122,145 121,174 146,184",
    view: "front"
  },
  left_shoulder: {
    name: "Left Shoulder",
    region: "Left Deltoid",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Anterior and lateral deltoid complex.",
    coords: "246,134 273,144 279,173 253,182",
    view: "front"
  },
  chest: {
    name: "Chest",
    region: "Pectoralis Major",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Sternal and clavicular heads of the pectoralis major.",
    coords: "154,138 244,135 253,184 249,267 199,226 152,264 147,182",
    view: "front"
  },
  abdominal: {
    name: "Abdominal",
    region: "Core / Rectus Abdominis",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Rectus abdominis and core anterior wall.",
    coords: "250,268 254,292 199,312 145,290 149,268 199,230",
    view: "front"
  },
  pelvis: {
    name: "Pelvis",
    region: "Lower Core / Pelvic Girdle",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Pelvic base, iliopsoas, and inguinal boundary.",
    coords: "254,293 256,313 201,367 140,315 145,291 199,311",
    view: "front"
  },
  right_hip: {
    name: "Right Hip",
    region: "Right Hip Girdle",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Tensor fasciae latae and right hip flexor attachments.",
    coords: "141,316 139,349 196,370 185,354",
    view: "front"
  },
  left_hip: {
    name: "Left Hip",
    region: "Left Hip Girdle",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Tensor fasciae latae and left hip flexor attachments.",
    coords: "258,313 260,344 204,368 215,353",
    view: "front"
  },
  right_humerus: {
    name: "Right Humerus / Bicep",
    region: "Right Upper Arm",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Biceps brachii and coracobrachialis.",
    coords: "146,185 148,222 142,250 115,240 123,196 120,175",
    view: "front"
  },
  left_humerus: {
    name: "Left Humerus / Bicep",
    region: "Left Upper Arm",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Biceps brachii and coracobrachialis.",
    coords: "278,174 279,194 283,237 256,249 253,218 254,180",
    view: "front"
  },
  right_elbow: {
    name: "Right Elbow",
    region: "Right Elbow Joint",
    defaultHours: 48,
    tier: "Joint / Tendon",
    desc: "Right cubital fossa and joint capsule.",
    coords: "117,240 142,250 140,275 110,263",
    view: "front"
  },
  left_elbow: {
    name: "Left Elbow",
    region: "Left Elbow Joint",
    defaultHours: 48,
    tier: "Joint / Tendon",
    desc: "Left cubital fossa and joint capsule.",
    coords: "290,261 281,240 256,249 258,274",
    view: "front"
  },
  right_forearm: {
    name: "Right Forearm",
    region: "Right Forearm",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Right wrist flexors, extensors, and pronator teres.",
    coords: "140,276 123,317 103,308 106,292 109,264",
    view: "front"
  },
  left_forearm: {
    name: "Left Forearm",
    region: "Left Forearm",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Left wrist flexors, extensors, and pronator teres.",
    coords: "261,274 290,261 297,308 276,320",
    view: "front"
  },
  right_wrist: {
    name: "Right Wrist",
    region: "Right Wrist Joint",
    defaultHours: 24,
    tier: "Joint / Connective",
    desc: "Right carpal tunnel and radiocarpal articulation.",
    coords: "124,319 117,337 95,323 103,309",
    view: "front"
  },
  left_wrist: {
    name: "Left Wrist",
    region: "Left Wrist Joint",
    defaultHours: 24,
    tier: "Joint / Connective",
    desc: "Left carpal tunnel and radiocarpal articulation.",
    coords: "284,340 279,319 296,309 305,321",
    view: "front"
  },
  right_hand: {
    name: "Right Hand",
    region: "Right Hand",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Right palmar fascia, thenar, and digital compartments.",
    coords: "117,337 107,378 89,388 75,377 85,343 71,346 80,330 94,323",
    view: "front"
  },
  left_hand: {
    name: "Left Hand",
    region: "Left Hand",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Left palmar fascia, thenar, and digital compartments.",
    coords: "285,341 304,322 317,327 333,351 317,342 324,379 309,389 291,377",
    view: "front"
  },
  right_femur_thigh: {
    name: "Right Femur / Thigh",
    region: "Right Quadriceps",
    defaultHours: 72,
    tier: "Slow / Deep",
    desc: "Right quadriceps femoris group (rectus femoris, vastus lateralis/medialis).",
    coords: "197,371 183,453 140,441 136,348",
    view: "front"
  },
  left_femur_thigh: {
    name: "Left Femur / Thigh",
    region: "Left Quadriceps",
    defaultHours: 72,
    tier: "Slow / Deep",
    desc: "Left quadriceps femoris group (rectus femoris, vastus lateralis/medialis).",
    coords: "202,369 260,345 259,443 215,457",
    view: "front"
  },
  right_knee: {
    name: "Right Knee",
    region: "Right Knee Joint",
    defaultHours: 48,
    tier: "Joint / Connective",
    desc: "Right patella, meniscus, and surrounding joint capsule.",
    coords: "187,455 142,442 136,496 174,505",
    view: "front"
  },
  left_knee: {
    name: "Left Knee",
    region: "Left Knee Joint",
    defaultHours: 48,
    tier: "Joint / Connective",
    desc: "Left patella, meniscus, and surrounding joint capsule.",
    coords: "213,457 225,507 263,498 258,444",
    view: "front"
  },
  right_tib_fib: {
    name: "Right Tib / Fib",
    region: "Right Shin & Fibula",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Right tibialis anterior and peroneal compartment.",
    coords: "174,505 137,497 128,533 144,604 161,605 172,548",
    view: "front"
  },
  left_fib_tib: {
    name: "Left Fib / Tib",
    region: "Left Shin & Fibula",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Left tibialis anterior and peroneal compartment.",
    coords: "226,506 226,544 237,597 257,598 268,544 265,498 244,504",
    view: "front"
  },
  right_ankle: {
    name: "Right Ankle",
    region: "Right Ankle Joint",
    defaultHours: 24,
    tier: "Joint / Connective",
    desc: "Right talocrural joint and lateral malleolus.",
    coords: "163,604 145,605 143,634 167,634",
    view: "front"
  },
  left_ankle: {
    name: "Left Ankle",
    region: "Left Ankle Joint",
    defaultHours: 24,
    tier: "Joint / Connective",
    desc: "Left talocrural joint and lateral malleolus.",
    coords: "238,598 255,598 256,631 231,633",
    view: "front"
  },
  right_foot: {
    name: "Right Foot",
    region: "Right Foot",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Right tarsals, metatarsals, and plantar fascia.",
    coords: "143,633 136,680 156,697 173,692 168,636",
    view: "front"
  },
  left_foot: {
    name: "Left Foot",
    region: "Left Foot",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Left tarsals, metatarsals, and plantar fascia.",
    coords: "230,633 225,692 246,698 261,680 257,631",
    view: "front"
  },

  // --- Posterior (Back Side) ---
  skul_brain: {
    name: "Skull / Occipital",
    region: "Posterior Cranium",
    defaultHours: 24,
    tier: "Fast Recovery",
    desc: "Occipital base and suboccipital musculature.",
    coords: "462,29 454,73 469,93 515,92 527,74 515,29 491,13",
    view: "back"
  },
  spine: {
    name: "Spine / Erector Spinae",
    region: "Vertebral Column",
    defaultHours: 72,
    tier: "Slow / Systemic",
    desc: "Thoracic and lumbar spine, longissimus, and iliocostalis tracks.",
    coords: "480,101 481,313 498,312 499,100",
    view: "back"
  },
  left_shoulder_back: {
    name: "Left Shoulder (Back)",
    region: "Left Posterior Deltoid",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Left posterior deltoid, infraspinatus, and supraspinatus.",
    coords: "480,109 415,140 438,197 480,196",
    view: "back"
  },
  right_shoulder_back: {
    name: "Right Shoulder (Back)",
    region: "Right Posterior Deltoid",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Right posterior deltoid, infraspinatus, and supraspinatus.",
    coords: "566,141 541,195 498,196 500,106",
    view: "back"
  },
  back: {
    name: "Back / Latissimus",
    region: "Mid Back",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Latissimus dorsi, rhomboids, and lower trapezius.",
    coords: "542,196 539,244 549,312 432,311 439,249 438,197",
    view: "back"
  },
  buttocks: {
    name: "Buttocks / Gluteus",
    region: "Gluteal Complex",
    defaultHours: 60,
    tier: "Slow / Deep",
    desc: "Gluteus maximus, medius, and piriformis.",
    coords: "548,312 430,313 426,366 554,366",
    view: "back"
  },
  left_arm: {
    name: "Left Arm (Back)",
    region: "Left Tricep & Posterior Arm",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Left triceps brachii, wrist extensors, and dorsal hand.",
    coords: "398,373 377,383 368,376 360,343 371,324 392,311 397,269 405,238 410,193 408,160 416,141 437,197 430,240 429,263 408,320 399,352",
    view: "back"
  },
  right_arm: {
    name: "Right Arm (Back)",
    region: "Right Tricep & Posterior Arm",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Right triceps brachii, wrist extensors, and dorsal hand.",
    coords: "566,143 545,189 543,207 550,269 574,329 584,372 607,385 615,374 622,338 597,315 585,288 576,238 569,190",
    view: "back"
  },
  left_leg: {
    name: "Left Leg (Back)",
    region: "Left Hamstring & Calf",
    defaultHours: 72,
    tier: "Slow / Deep",
    desc: "Left hamstring group, gastrocnemius, and Achilles tendon.",
    coords: "486,367 426,367 427,442 428,475 417,527 433,602 432,634 425,675 446,695 464,684 459,629 450,596 464,539 463,497 474,472 478,423",
    view: "back"
  },
  right_leg: {
    name: "Right Leg (Back)",
    region: "Right Hamstring & Calf",
    defaultHours: 72,
    tier: "Slow / Deep",
    desc: "Right hamstring group, gastrocnemius, and Achilles tendon.",
    coords: "494,366 494,387 506,428 505,464 517,500 517,536 528,590 518,665 524,695 553,682 546,607 562,529 552,475 550,435 555,365",
    view: "back"
  }
};

// =========================================================================
// STYLES
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
    max-width: 620px;
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
    position: relative;
    background: #09090b;
    border: 1px solid var(--background-modifier-border, #27272a);
    border-radius: 10px;
    padding: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .bm-canvas-box svg {
    display: block;
    height: auto;
    max-height: 480px;
  }
  /* Exact ImageMapster Highlight & Stroke Styling[cite: 4] */
  .bm-poly {
    fill: #27272a;
    fill-opacity: 0.2;
    stroke: rgba(255, 255, 255, 0.25);
    stroke-width: 1.5;
    cursor: pointer;
    transition: fill 0.15s ease, fill-opacity 0.15s ease, stroke 0.15s ease;
  }
  .bm-poly:hover {
    fill: #d42e16 !important;
    fill-opacity: 0.55 !important;
    stroke: #3320FF !important;
    stroke-width: 3 !important;
  }
  .bm-poly.selected {
    fill: #d42e16 !important;
    fill-opacity: 0.8 !important;
    stroke: #3320FF !important;
    stroke-width: 3.5 !important;
  }
  .bm-label-txt {
    fill: var(--text-muted, #71717a);
    font-size: 14px;
    font-weight: 700;
    letter-spacing: 1.5px;
    user-select: none;
  }
  .bm-sidebar {
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: 280px;
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
    font-size: 1.05rem;
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
    line-height: 1.45;
    color: var(--text-muted, #a1a1aa);
    background: var(--background-secondary, #18181b);
    padding: 8px 10px;
    border-radius: 6px;
    border: 1px solid var(--background-modifier-border, #27272a);
  }
  .bm-selection-tray {
    font-size: 0.8rem;
    color: var(--text-muted, #a1a1aa);
    background: var(--background-primary, #09090b);
    padding: 12px;
    border-radius: 8px;
    border: 1px solid var(--background-modifier-border, #27272a);
    line-height: 1.45;
  }
  .bm-selection-tray b {
    color: var(--text-normal, #f4f4f5);
  }
`;
rootEl.appendChild(styleEl);

// =========================================================================
// CONTROLLER & UI MOUNT
// =========================================================================
let currentView = "all"; // 'all' | 'front' | 'back'
let selectedKeys = new Set(["chest"]);
let activeKey = "chest";

const navBar = rootEl.createDiv({ cls: "bm-navbar" });
navBar.createEl("span", { text: "Interactive Human Anatomy Map", cls: "bm-title" });

const btnGroup = navBar.createDiv({ cls: "bm-btn-group" });
const btnBoth = btnGroup.createEl("button", { cls: "bm-btn active", text: "Both Views" });
const btnFront = btnGroup.createEl("button", { cls: "bm-btn", text: "Anterior" });
const btnBack = btnGroup.createEl("button", { cls: "bm-btn", text: "Posterior" });

const workspace = rootEl.createDiv({ cls: "bm-workspace" });
const canvasBox = workspace.createDiv({ cls: "bm-canvas-box" });
const sidebar = workspace.createDiv({ cls: "bm-sidebar" });
const cardBox = sidebar.createDiv({ cls: "bm-card" });
const selectionsBox = sidebar.createDiv({ cls: "bm-selection-tray" });

function updateSelectionsTray() {
  if (selectedKeys.size > 0) {
    const list = Array.from(selectedKeys)
      .map(k => (muscleRegistry[k] ? muscleRegistry[k].name : k.replace(/_/g, " ")))
      .join(", ");
    selectionsBox.innerHTML = `<b>Selected body Parts: </b>${list}`; //[cite: 4]
  } else {
    selectionsBox.innerHTML = `<b>Please select a body part</b>`; //[cite: 4]
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
  // Determine ViewBox coordinate framing
  let vb = "0 0 700 720";
  let svgWidth = "320px";
  if (currentView === "front") {
    vb = "60 0 280 720";
    svgWidth = "200px";
  } else if (currentView === "back") {
    vb = "360 0 280 720";
    svgWidth = "200px";
  }

  let polygons = "";
  for (const [key, item] of Object.entries(muscleRegistry)) {
    if (currentView === "all" || item.view === currentView) {
      const isSelected = selectedKeys.has(key) ? "selected" : "";
      polygons += `<polygon class="bm-poly ${isSelected}" data-key="${key}" points="${item.coords}" />`; //[cite: 7]
    }
  }

  canvasBox.innerHTML = `
    <svg style="width: ${svgWidth};" viewBox="${vb}" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
      <!-- Section Headers -->
      <g>
        <text x="140" y="715" class="bm-label-txt" text-anchor="middle">FRONT SIDE</text>
        <text x="490" y="715" class="bm-label-txt" text-anchor="middle">BACK SIDE</text>
      </g>
      <!-- Base Anatomical Silhouettes -->
      <g stroke="rgba(255,255,255,0.2)" stroke-width="1.5" fill="rgba(255,255,255,0.02)">
        <!-- Front Head & Torso outline -->
        <path d="M198,23 C175,31 165,78 188,112 L153,136 L122,145 L115,240 L103,308 L75,377 L94,323 L140,276 L147,182 L154,138 L244,135 L253,184 L261,274 L317,327 L324,379 L291,377 L276,320 L273,144 L246,134 L212,113 C234,72 224,28 198,23 Z" />
        <!-- Front Legs outline -->
        <path d="M197,371 L183,453 L140,441 L136,496 L128,533 L144,604 L143,634 L136,680 L156,697 L173,692 L168,636 L161,605 L174,505 L202,369 L260,345 L258,444 L265,498 L257,598 L256,631 L225,692 L246,698 L261,680 L257,631 L237,597 L213,457 Z" />
        <!-- Back Torso & Spine outline -->
        <path d="M491,13 C454,73 469,93 480,109 L415,140 L408,193 L397,269 L360,343 L377,383 L408,320 L438,197 L432,311 L426,366 L554,366 L549,312 L541,195 L576,238 L607,385 L622,338 L566,141 L500,106 C527,74 515,29 491,13 Z" />
        <!-- Back Legs outline -->
        <path d="M426,367 L428,475 L417,527 L432,634 L425,675 L446,695 L464,684 L450,596 L486,367 L494,366 L506,428 L517,536 L524,695 L553,682 L546,607 L562,529 L555,365 Z" />
      </g>
      <!-- Exact Interactive Polygons[cite: 7] -->
      ${polygons}
    </svg>
  `;

  const polyEls = canvasBox.querySelectorAll(".bm-poly");
  polyEls.forEach(poly => {
    const key = poly.getAttribute("data-key");

    poly.addEventListener("mouseenter", () => renderDetails(key));
    poly.addEventListener("mouseleave", () => renderDetails(activeKey));

    // Multi-select toggle logic[cite: 4]
    poly.addEventListener("click", () => {
      if (selectedKeys.has(key)) {
        selectedKeys.delete(key); //[cite: 4]
        poly.classList.remove("selected");
      } else {
        selectedKeys.add(key); //[cite: 4]
        poly.classList.add("selected");
      }
      activeKey = key;
      renderDetails(key);
      updateSelectionsTray(); //[cite: 4]
    });
  });

  renderDetails(activeKey);
  updateSelectionsTray(); //[cite: 4]
}

btnBoth.onclick = () => {
  currentView = "all";
  btnBoth.classList.add("active");
  btnFront.classList.remove("active");
  btnBack.classList.remove("active");
  renderMap();
};

btnFront.onclick = () => {
  currentView = "front";
  activeKey = "chest";
  btnFront.classList.add("active");
  btnBoth.classList.remove("active");
  btnBack.classList.remove("active");
  renderMap();
};

btnBack.onclick = () => {
  currentView = "back";
  activeKey = "spine";
  btnBack.classList.add("active");
  btnBoth.classList.remove("active");
  btnFront.classList.remove("active");
  renderMap();
};

renderMap();
```
