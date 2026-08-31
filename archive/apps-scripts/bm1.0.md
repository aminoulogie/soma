```dataviewjs
const rootEl = dv.el("div", "", { cls: "bodymap-root" });

// =========================================================================
// MUSCLE REGISTRY & RECOVERY DATA MODEL
// =========================================================================
const muscleRegistry = {
  // Front / Anterior
  deltoids: {
    name: "Deltoids (Anterior / Lateral)",
    region: "Shoulders",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Primary shoulder abduction and flexion. Synergist across all pressing mechanics.",
    view: "front"
  },
  chest: {
    name: "Pectoralis Major",
    region: "Chest",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Horizontal adduction and internal rotation. Core upper body pressing motor.",
    view: "front"
  },
  biceps: {
    name: "Biceps Brachii",
    region: "Upper Arm (Front)",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Elbow flexion and forearm supination.",
    view: "front"
  },
  forearm: {
    name: "Forearms",
    region: "Forearms",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Grip strength, wrist flexion/extension, and radial/ulnar articulation.",
    view: "front"
  },
  abs: {
    name: "Rectus Abdominis",
    region: "Core",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Spinal flexion and anti-extension trunk stabilizer.",
    view: "front"
  },
  obliques: {
    name: "External Obliques",
    region: "Flanks / Core",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Lateral trunk flexion and rotational stability.",
    view: "front"
  },
  quads: {
    name: "Quadriceps Femoris",
    region: "Thighs (Front)",
    defaultHours: 72,
    tier: "Slow / Deep",
    desc: "Massive prime mover for knee extension and squat locomotion.",
    view: "front"
  },
  calves: {
    name: "Calves",
    region: "Lower Leg",
    defaultHours: 24,
    tier: "Ultra-Fast",
    desc: "Plantarflexion and ankle stability.",
    view: "front"
  },

  // Back / Posterior
  trapezius: {
    name: "Trapezius",
    region: "Upper Back & Neck",
    defaultHours: 36,
    tier: "Fast Recovery",
    desc: "Scapular retraction, elevation, and depression.",
    view: "back"
  },
  triceps: {
    name: "Triceps Brachii",
    region: "Upper Arm (Back)",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Elbow extension and overhead elbow lockout.",
    view: "back"
  },
  lats: {
    name: "Latissimus Dorsi",
    region: "Mid & Upper Back",
    defaultHours: 48,
    tier: "Moderate",
    desc: "Shoulder adduction, horizontal pulling, and vertical lat pulldown drive.",
    view: "back"
  },
  lower_back: {
    name: "Erector Spinae",
    region: "Lower Back",
    defaultHours: 72,
    tier: "Slow / Systemic",
    desc: "Spinal extension and anti-flexion isometric bracing.",
    view: "back"
  },
  glutes: {
    name: "Gluteus Maximus",
    region: "Hips / Glutes",
    defaultHours: 60,
    tier: "Slow / Deep",
    desc: "Hip extension and external rotation powerhouse.",
    view: "back"
  },
  hamstrings: {
    name: "Hamstrings",
    region: "Thighs (Back)",
    defaultHours: 72,
    tier: "Slow / Deep",
    desc: "Knee flexion and hip extension via posterior chain hinges.",
    view: "back"
  }
};

// =========================================================================
// OPEN-SOURCE SVG FETCHER (Uses Obsidian requestUrl to bypass CORS)
// =========================================================================
const SVG_URLS = {
  front: "[https://raw.githubusercontent.com/david-desmaisons/body-highlighter/master/src/assets/body-front.svg](https://raw.githubusercontent.com/david-desmaisons/body-highlighter/master/src/assets/body-front.svg)",
  back: "[https://raw.githubusercontent.com/david-desmaisons/body-highlighter/master/src/assets/body-back.svg](https://raw.githubusercontent.com/david-desmaisons/body-highlighter/master/src/assets/body-back.svg)"
};

const svgCache = {};

async function fetchRemoteSvg(view) {
  if (svgCache[view]) return svgCache[view];
  try {
    const res = await requestUrl({ url: SVG_URLS[view] });
    svgCache[view] = res.text;
    return res.text;
  } catch (e) {
    return `<div style="color:var(--text-error);padding:20px;text-align:center;">Network error fetching open-source vector map.</div>`;
  }
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
    background: var(--background-secondary);
    border: 1px solid var(--background-modifier-border);
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
    color: var(--text-normal);
  }
  .bm-btn-group {
    display: flex;
    background: var(--background-primary);
    padding: 3px;
    border-radius: 8px;
    border: 1px solid var(--background-modifier-border);
    gap: 4px;
  }
  .bm-btn {
    border: none;
    background: transparent;
    color: var(--text-muted);
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .bm-btn.active {
    background: var(--interactive-accent, #3b82f6);
    color: var(--text-on-accent, #ffffff);
  }
  .bm-workspace {
    display: flex;
    gap: 32px;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    width: 100%;
  }
  .bm-svg-container {
    width: 200px;
    min-height: 400px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .bm-svg-container svg {
    width: 100%;
    height: auto;
    max-height: 420px;
    filter: drop-shadow(0 4px 10px rgba(0,0,0,0.25));
  }
  .bm-svg-container svg path,
  .bm-svg-container svg polygon,
  .bm-svg-container svg g {
    fill: #27272a;
    stroke: var(--background-secondary, #18181b);
    stroke-width: 0.75;
    cursor: pointer;
    transition: fill 0.2s ease, opacity 0.2s ease;
  }
  .bm-svg-container svg path:hover,
  .bm-svg-container svg polygon:hover {
    fill: #60a5fa !important;
    opacity: 0.9;
  }
  .bm-svg-container svg .selected {
    fill: var(--interactive-accent, #3b82f6) !important;
  }
  .bm-card {
    background: var(--background-primary);
    border: 1px solid var(--background-modifier-border);
    border-radius: 10px;
    padding: 18px;
    width: 280px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  .bm-card-header {
    border-bottom: 1px solid var(--background-modifier-border);
    padding-bottom: 8px;
  }
  .bm-card-subtitle {
    font-size: 0.72rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.6px;
    font-weight: 600;
  }
  .bm-card-title {
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-normal);
  }
  .bm-meta-row {
    display: flex;
    justify-content: space-between;
    font-size: 0.82rem;
    color: var(--text-muted);
  }
  .bm-meta-val {
    font-weight: 600;
    color: var(--text-normal);
  }
  .bm-desc-box {
    font-size: 0.8rem;
    line-height: 1.45;
    color: var(--text-muted);
    background: var(--background-secondary);
    padding: 10px;
    border-radius: 6px;
    border: 1px solid var(--background-modifier-border);
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
const svgBox = workspace.createDiv({ cls: "bm-svg-container" });
const cardBox = workspace.createDiv({ cls: "bm-card" });

function renderDetails(key) {
  const model = muscleRegistry[key] || Object.values(muscleRegistry).find(m => 
    key && (m.name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(m.name.toLowerCase()))
  );

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

async function renderMap() {
  svgBox.innerHTML = `<span style="color:var(--text-muted);font-size:0.8rem;">Loading Open-Source Vector...</span>`;
  const svgText = await fetchRemoteSvg(currentView);
  svgBox.innerHTML = svgText;

  const elements = svgBox.querySelectorAll("path, polygon, g");

  elements.forEach((el) => {
    const rawId = (el.id || el.getAttribute("data-id") || el.getAttribute("class") || "").toLowerCase().replace(/[-_]/g, "");
    const matchKey = Object.keys(muscleRegistry).find(k => rawId.includes(k.replace(/[-_]/g, "")));

    if (matchKey) {
      if (matchKey === selectedKey) el.classList.add("selected");

      el.addEventListener("mouseenter", () => renderDetails(matchKey));
      el.addEventListener("mouseleave", () => renderDetails(selectedKey));
      el.addEventListener("click", () => {
        selectedKey = matchKey;
        elements.forEach(n => n.classList.remove("selected"));
        el.classList.add("selected");
        renderDetails(matchKey);
      });
    }
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
  selectedKey = "trapezius";
  btnBack.classList.add("active");
  btnFront.classList.remove("active");
  renderMap();
};

renderMap();
```
