```dataviewjs
const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// =========================================================================
// MUSCLE REGISTRY & RECOVERY DATA MODEL
// =========================================================================
const muscleRegistry = {
  // --- Anterior (Front) ---
  delts_front: {
    name: "Anterior Deltoid",
    region: "Front Shoulder",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Primary shoulder flexion and horizontal pressing synergist. Highly loaded during bench and overhead pressing.",
    view: "front"
  },
  delts_side: {
    name: "Lateral Deltoid",
    region: "Side Shoulder",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Responsible for shoulder abduction and capped shoulder width. High endurance muscle that recovers quickly.",
    view: "front"
  },
  chest: {
    name: "Pectoralis Major",
    region: "Chest",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Horizontal adduction and flexion of the humerus. Major pushing prime mover requiring balanced rest.",
    view: "front"
  },
  biceps: {
    name: "Biceps Brachii",
    region: "Upper Arm (Front)",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Elbow flexion and forearm supination. Recovers rapidly but easily fatigued from heavy pulling sessions.",
    view: "front"
  },
  forearms: {
    name: "Forearm Flexors",
    region: "Forearm",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Grip stability and wrist articulation. High daily work capacity and fast regenerative rate.",
    view: "front"
  },
  abs: {
    name: "Rectus Abdominis",
    region: "Core",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Spinal flexion and anti-extension trunk stabilizer. High proportion of slow-twitch fibers.",
    view: "front"
  },
  obliques: {
    name: "External Obliques",
    region: "Flanks",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Trunk rotation and lateral flexion stabilizer during bilateral compound movements.",
    view: "front"
  },
  quads: {
    name: "Quadriceps Femoris",
    region: "Upper Leg (Front)",
    defaultHours: 72,
    tier: "Slow / Deep",
    desc: "Knee extension and hip flexion. Massive muscle group incurring extensive mechanical tension and damage.",
    view: "front"
  },
  calves_front: {
    name: "Tibialis Anterior",
    region: "Lower Leg (Front)",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Plantarflexion & dorsiflexion ankle stability. Rapid recovery.",
    view: "front"
  },

  // --- Posterior (Back) ---
  traps: {
    name: "Trapezius",
    region: "Upper Back / Neck",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Scapular elevation, retraction, and depression. Robust postural structure with strong blood flow.",
    view: "back"
  },
  delts_rear: {
    name: "Posterior Deltoid",
    region: "Rear Shoulder",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Horizontal shoulder abduction and external rotation. Critical for shoulder health and posture.",
    view: "back"
  },
  triceps: {
    name: "Triceps Brachii",
    region: "Upper Arm (Back)",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Elbow extension. High fast-twitch muscle fiber composition prone to deep microtrauma.",
    view: "back"
  },
  lats: {
    name: "Latissimus Dorsi",
    region: "Mid Back / Flank",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Shoulder adduction, extension, and horizontal pulling powerhouse.",
    view: "back"
  },
  lower_back: {
    name: "Erector Spinae",
    region: "Lower Back",
    defaultHours: 72,
    tier: "Slow / Systemic",
    desc: "Spinal extension and anti-flexion brace. Recovers slowly due to continuous daily postural involvement.",
    view: "back"
  },
  glutes: {
    name: "Gluteus Maximus",
    region: "Posterior Chain",
    defaultHours: 60,
    tier: "Slow / Deep",
    desc: "Primary hip extensor and external rotator. High load capacity requiring extended recovery windows.",
    view: "back"
  },
  hamstrings: {
    name: "Hamstrings",
    region: "Upper Leg (Back)",
    defaultHours: 72,
    tier: "Slow / Deep",
    desc: "Knee flexion and hip extension. High eccentric strain during hinge movements causes prolonged soreness.",
    view: "back"
  },
  calves: {
    name: "Gastrocnemius & Soleus",
    region: "Lower Leg (Back)",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Plantarflexion and ankle stability. Dense, highly conditioned fibers designed for rapid recovery.",
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
    padding: 24px;
    gap: 16px;
    font-family: var(--font-interface);
  }
  .bm-navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    max-width: 560px;
  }
  .bm-title {
    font-size: 1rem;
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
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .bm-btn.active {
    background: var(--interactive-accent, #3b82f6);
    color: #ffffff;
  }
  .bm-workspace {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }
  .bm-svg-viewport {
    width: 200px;
    height: auto;
    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
  }
  .bm-muscle-path {
    fill: #27272a;
    stroke: #18181b;
    stroke-width: 1.2;
    stroke-linejoin: round;
    cursor: pointer;
    transition: fill 0.15s ease, opacity 0.15s ease;
  }
  .bm-muscle-path:hover {
    fill: #60a5fa !important;
    opacity: 0.9;
  }
  .bm-muscle-path.selected {
    fill: var(--interactive-accent, #3b82f6) !important;
  }
  .bm-card {
    background: var(--background-primary, #09090b);
    border: 1px solid var(--background-modifier-border, #27272a);
    border-radius: 10px;
    padding: 18px;
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.2);
  }
  .bm-card-header {
    border-bottom: 1px solid var(--background-modifier-border, #27272a);
    padding-bottom: 8px;
  }
  .bm-card-subtitle {
    font-size: 0.72rem;
    color: var(--text-muted, #a1a1aa);
    text-transform: uppercase;
    letter-spacing: 0.6px;
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
    font-size: 0.82rem;
    color: var(--text-muted, #a1a1aa);
  }
  .bm-meta-val {
    font-weight: 600;
    color: var(--text-normal, #f4f4f5);
  }
  .bm-desc-box {
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--text-muted, #a1a1aa);
    background: var(--background-secondary, #18181b);
    padding: 10px;
    border-radius: 6px;
    border: 1px solid var(--background-modifier-border, #27272a);
  }
`;
rootEl.appendChild(styleEl);

// =========================================================================
// EMBEDDED HIGH-RES VECTOR DATA (100% Offline & Reliable)
// =========================================================================
const svgData = {
  front: `
    <svg class="bm-svg-viewport" viewBox="0 0 200 420" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
      <!-- Head & Neck Base -->
      <path d="M100,14 C112,14 120,26 120,44 C120,58 112,68 100,68 C88,68 80,58 80,44 C80,26 88,14 100,14 Z" fill="#27272a" opacity="0.3"/>
      <path d="M93,68 L107,68 L110,84 L90,84 Z" fill="#27272a" opacity="0.3"/>

      <!-- Deltoids Anterior -->
      <path class="bm-muscle-path" data-id="delts_front" d="M72,88 C68,96 66,108 64,118 C70,122 75,122 77,112 C79,101 79,93 72,88 Z" />
      <path class="bm-muscle-path" data-id="delts_front" d="M128,88 C132,96 134,108 136,118 C130,122 125,122 123,112 C121,101 121,93 128,88 Z" />

      <!-- Deltoids Lateral -->
      <path class="bm-muscle-path" data-id="delts_side" d="M64,118 C61,108 63,96 70,88 C66,88 56,98 56,110 C56,118 60,120 64,118 Z" />
      <path class="bm-muscle-path" data-id="delts_side" d="M136,118 C139,108 137,96 130,88 C134,88 144,98 144,110 C144,118 140,120 136,118 Z" />

      <!-- Chest -->
      <path class="bm-muscle-path" data-id="chest" d="M78,88 C88,86 98,88 99,92 L99,132 C88,132 75,128 74,114 C73,101 76,92 78,88 Z" />
      <path class="bm-muscle-path" data-id="chest" d="M122,88 C112,86 102,88 101,92 L101,132 C112,132 125,128 126,114 C127,101 124,92 122,88 Z" />

      <!-- Biceps -->
      <path class="bm-muscle-path" data-id="biceps" d="M62,120 C68,122 72,126 71,154 C66,155 58,150 56,138 C55,128 58,122 62,120 Z" />
      <path class="bm-muscle-path" data-id="biceps" d="M138,120 C132,122 128,126 129,154 C134,155 142,150 144,138 C145,128 142,122 138,120 Z" />

      <!-- Forearms -->
      <path class="bm-muscle-path" data-id="forearms" d="M54,156 C62,158 66,166 60,202 C54,202 46,195 44,180 C43,168 48,158 54,156 Z" />
      <path class="bm-muscle-path" data-id="forearms" d="M146,156 C138,158 134,166 140,202 C146,202 154,195 156,180 C157,168 152,158 146,156 Z" />

      <!-- Hands (Base) -->
      <path d="M44,200 L56,203 L50,224 C46,230 40,226 39,218 Z" fill="#27272a" opacity="0.3"/>
      <path d="M156,200 L144,203 L150,224 C154,230 160,226 161,218 Z" fill="#27272a" opacity="0.3"/>

      <!-- Core / Abs -->
      <path class="bm-muscle-path" data-id="abs" d="M84,134 L116,134 C116,150 114,178 112,186 L88,186 C86,178 84,150 84,134 Z" />

      <!-- Obliques -->
      <path class="bm-muscle-path" data-id="obliques" d="M74,134 L83,134 C83,152 86,178 88,186 L78,184 C72,168 72,148 74,134 Z" />
      <path class="bm-muscle-path" data-id="obliques" d="M126,134 L117,134 C117,152 114,178 112,186 L122,184 C128,168 128,148 126,134 Z" />

      <!-- Pelvis Base -->
      <path d="M78,185 L122,185 L126,210 L100,218 L74,210 Z" fill="#27272a" opacity="0.3"/>

      <!-- Quadriceps -->
      <path class="bm-muscle-path" data-id="quads" d="M74,212 C88,216 96,224 96,282 C88,284 76,282 71,274 C68,252 70,226 74,212 Z" />
      <path class="bm-muscle-path" data-id="quads" d="M126,212 C112,216 104,224 104,282 C112,284 124,282 129,274 C132,252 130,226 126,212 Z" />

      <!-- Knees (Base) -->
      <path d="M71,278 L95,284 L93,306 L72,306 Z" fill="#27272a" opacity="0.3"/>
      <path d="M129,278 L105,284 L107,306 L128,306 Z" fill="#27272a" opacity="0.3"/>

      <!-- Calves / Shin Front -->
      <path class="bm-muscle-path" data-id="calves_front" d="M72,308 C84,308 92,316 91,372 L75,372 C71,350 70,326 72,308 Z" />
      <path class="bm-muscle-path" data-id="calves_front" d="M128,308 C116,308 108,316 109,372 L125,372 C129,350 130,326 128,308 Z" />

      <!-- Feet (Base) -->
      <path d="M75,374 L91,374 L93,394 C93,400 70,400 70,394 Z" fill="#27272a" opacity="0.3"/>
      <path d="M125,374 L109,374 L107,394 C107,400 130,400 130,394 Z" fill="#27272a" opacity="0.3"/>
    </svg>
  `,
  back: `
    <svg class="bm-svg-viewport" viewBox="0 0 200 420" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
      <!-- Head Base -->
      <path d="M100,14 C112,14 120,26 120,44 C120,58 112,68 100,68 C88,68 80,58 80,44 C80,26 88,14 100,14 Z" fill="#27272a" opacity="0.3"/>
      
      <!-- Trapezius -->
      <path class="bm-muscle-path" data-id="traps" d="M92,68 L108,68 L124,90 L100,126 L76,90 Z" />

      <!-- Posterior Deltoid -->
      <path class="bm-muscle-path" data-id="delts_rear" d="M74,90 C70,96 62,104 60,118 C66,122 74,120 76,112 C78,102 78,94 74,90 Z" />
      <path class="bm-muscle-path" data-id="delts_rear" d="M126,90 C130,96 138,104 140,118 C134,122 126,120 124,112 C122,102 122,94 126,90 Z" />

      <!-- Triceps -->
      <path class="bm-muscle-path" data-id="triceps" d="M60,120 C66,122 72,126 70,154 C64,155 56,150 54,138 C53,128 56,122 60,120 Z" />
      <path class="bm-muscle-path" data-id="triceps" d="M140,120 C134,122 128,126 130,154 C136,155 144,150 146,138 C147,128 144,122 140,120 Z" />

      <!-- Lats -->
      <path class="bm-muscle-path" data-id="lats" d="M76,94 L100,126 L124,94 C128,114 126,144 118,154 C108,156 92,156 82,154 C74,144 72,114 76,94 Z" />

      <!-- Lower Back -->
      <path class="bm-muscle-path" data-id="lower_back" d="M82,154 C92,156 108,156 118,154 L116,182 L84,182 Z" />

      <!-- Glutes -->
      <path class="bm-muscle-path" data-id="glutes" d="M80,182 C92,182 99,186 99,218 C88,218 74,214 72,198 C72,188 76,184 80,182 Z" />
      <path class="bm-muscle-path" data-id="glutes" d="M120,182 C108,182 101,186 101,218 C112,218 126,214 128,198 C128,188 124,184 120,182 Z" />

      <!-- Posterior Forearms Base -->
      <path d="M54,156 L68,160 L58,206 L44,200 Z" fill="#27272a" opacity="0.3"/>
      <path d="M146,156 L132,160 L142,206 L156,200 Z" fill="#27272a" opacity="0.3"/>

      <!-- Hamstrings -->
      <path class="bm-muscle-path" data-id="hamstrings" d="M73,220 C87,222 97,226 96,280 C86,282 74,282 70,270 C68,250 70,230 73,220 Z" />
      <path class="bm-muscle-path" data-id="hamstrings" d="M127,220 C113,222 103,226 104,280 C114,282 126,282 130,270 C132,250 130,230 127,220 Z" />

      <!-- Calves Back -->
      <path class="bm-muscle-path" data-id="calves" d="M70,290 C84,290 94,300 92,368 L74,368 C68,348 66,316 70,290 Z" />
      <path class="bm-muscle-path" data-id="calves" d="M130,290 C116,290 106,300 108,368 L126,368 C132,348 134,316 130,290 Z" />

      <!-- Feet (Base) -->
      <path d="M74,370 L92,370 L94,394 C94,400 72,400 72,394 Z" fill="#27272a" opacity="0.3"/>
      <path d="M126,370 L108,370 L106,394 C106,400 128,400 128,394 Z" fill="#27272a" opacity="0.3"/>
    </svg>
  `
};

// =========================================================================
// CONTROLLER & UI MOUNT
// =========================================================================
let currentView = "front";
let selectedKey = "delts_front";

const navBar = rootEl.createDiv({ cls: "bm-navbar" });
navBar.createEl("span", { text: "Muscle Recovery Architecture", cls: "bm-title" });

const btnGroup = navBar.createDiv({ cls: "bm-btn-group" });
const btnFront = btnGroup.createEl("button", { cls: "bm-btn active", text: "Anterior" });
const btnBack = btnGroup.createEl("button", { cls: "bm-btn", text: "Posterior" });

const workspace = rootEl.createDiv({ cls: "bm-workspace" });
const svgBox = workspace.createDiv();
const cardBox = workspace.createDiv({ cls: "bm-card" });

function renderDetails(key) {
  const model = muscleRegistry[key];
  if (!model) return;

  cardBox.innerHTML = `
    <div class="bm-card-header">
      <div class="bm-card-subtitle">${model.region}</div>
      <div class="bm-card-title">${model.name}</div>
    </div>
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
  svgBox.innerHTML = svgData[currentView];
  const paths = svgBox.querySelectorAll(".bm-muscle-path");

  paths.forEach((p) => {
    const id = p.dataset.id;
    if (id === selectedKey) p.classList.add("selected");

    p.addEventListener("mouseenter", () => renderDetails(id));
    p.addEventListener("mouseleave", () => renderDetails(selectedKey));
    p.addEventListener("click", () => {
      selectedKey = id;
      paths.forEach((node) => node.classList.remove("selected"));
      svgBox.querySelectorAll(`[data-id="${id}"]`).forEach((n) => n.classList.add("selected"));
      renderDetails(id);
    });
  });

  renderDetails(selectedKey);
}

btnFront.onclick = () => {
  currentView = "front";
  selectedKey = "delts_front";
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
