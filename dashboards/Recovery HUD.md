```dataviewjs
async function initRecoveryHUD() {
// ============================================================================
// 1. DATA LOADING & ASSETS
// ============================================================================
const dataFile = app.vault.getAbstractFileByPath("apps/scripts/soma-data.json");
const registryFile = app.vault.getAbstractFileByPath("apps/scripts/muscleRegistry.json");
const historyFile = app.vault.getAbstractFileByPath("apps/scripts/soma-history.json");

if (!dataFile || !registryFile) {
    if (!dataFile) dv.paragraph("❌ `apps/scripts/soma-data.json` not found");
    if (!registryFile) dv.paragraph("❌ `apps/scripts/muscleRegistry.json` not found");
    return;
}

const dataContent = await app.vault.read(dataFile);
const registryContent = await app.vault.read(registryFile);
const somaData = JSON.parse(dataContent);
const muscleRegistry = JSON.parse(registryContent);

const STATIC_PARTS = somaData.STATIC_PARTS;
const FRONT_OUTLINE = somaData.FRONT_OUTLINE;
const BACK_OUTLINE = somaData.BACK_OUTLINE;
const FRONT_VIEWBOX = "0 0 724 1448";
const BACK_VIEWBOX = "724 0 724 1448";

const INSTANCE_ID = Math.random().toString(36).slice(2, 9);

// ============================================================================
// 2. BIOLOGICAL RECOVERY DECAY ENGINE
// ============================================================================
const BASE_RECOVERY_HOURS = {
  calves: 24, calves_back: 24, deltoids_back: 24, forearms: 24,
  biceps: 36, deltoids: 36,
  chest: 48, upper_back: 48, trapezius_back: 48, triceps: 48, triceps_back: 48, gluteal: 48, adductors: 48,
  quadriceps: 72, hamstring: 72, lower_back: 72
};

let history = {};
if (historyFile) {
  try {
    const raw = await app.vault.read(historyFile);
    history = JSON.parse(raw);
  } catch(e) {}
}

const now = Date.now();
const latestStimulus = {};

for (const [dateKey, session] of Object.entries(history)) {
  const sessionTime = session.timestamp || now;
  if (session.muscles) {
    for (const [mKey, stats] of Object.entries(session.muscles)) {
      if (!latestStimulus[mKey] || sessionTime > latestStimulus[mKey].timestamp) {
        latestStimulus[mKey] = {
          timestamp: sessionTime,
          sets: stats.sets || 3,
          avgFail: stats.avgFail || 3
        };
      }
    }
  }
}

// Compute dynamic readiness score R(t)
for (const key in muscleRegistry) {
  const baseT = BASE_RECOVERY_HOURS[key] || muscleRegistry[key].defaultHours || 48;
  muscleRegistry[key].defaultHours = baseT;

  if (latestStimulus[key]) {
    const elapsedHours = (now - latestStimulus[key].timestamp) / 3600000;
    const sets = latestStimulus[key].sets;
    const avgFail = latestStimulus[key].avgFail;
    
    // Recovery Target Adjustment Formula
    const tTarget = baseT * (1 + 0.08 * Math.max(0, sets - 3)) * (1 + 0.06 * (avgFail - 3));
    const readiness = Math.min(100, Math.pow(elapsedHours / tTarget, 1.15) * 100);
    const hoursLeft = Math.max(0, Math.round(tTarget - elapsedHours));

    muscleRegistry[key].recovery = Math.round(readiness);
    muscleRegistry[key].hoursLeft = hoursLeft;
    muscleRegistry[key].lastWorkedHours = Math.round(elapsedHours);
  } else {
    muscleRegistry[key].recovery = 100;
    muscleRegistry[key].hoursLeft = 0;
    muscleRegistry[key].lastWorkedHours = null;
  }
}

// ============================================================================
// 3. COLOR PALETTE & RENDER PIPELINE
// ============================================================================
const HEAT_TIERS = {
    fresh:    { base: "#22c55e", light: "#a7f3c8", dark: "#0f2e1c" },
    low:      { base: "#eab308", light: "#fde68a", dark: "#3f2f08" },
    moderate: { base: "#f97316", light: "#fdc493", dark: "#3f200a" },
    high:     { base: "#ef4444", light: "#fca5a5", dark: "#3f1212" },
};

function getTier(recovery) {
    if (recovery >= 90) return HEAT_TIERS.fresh;
    if (recovery >= 70) return HEAT_TIERS.low;
    if (recovery >= 40) return HEAT_TIERS.moderate;
    return HEAT_TIERS.high;
}

let currentView = "front";
let selectedKey = null;
let selectedPoint = null;

const hudRoot = dv.el("div", "", { cls: "bm3-root" });

const styleEl = document.createElement("style");
styleEl.textContent = `
  .bm3-root {
    background: radial-gradient(circle at 50% 0%, #131c2c 0%, #080b12 65%);
    border: 1px solid rgba(96,165,250,0.14);
    border-radius: 20px;
    padding: 24px;
    font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    color: #e2e8f0;
    max-width: 680px;
    margin: 0 auto;
    box-sizing: border-box;
  }
  .bm3-header { text-align: center; margin-bottom: 16px; }
  .bm3-title { font-size: 1.45rem; font-weight: 800; color: #f1f5f9; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .bm3-title .bm3-icon { color: #38bdf8; }
  .bm3-subtitle { color: #64748b; font-size: 0.82rem; margin-top: 4px; }

  .bm3-viewtabs { display: flex; justify-content: center; gap: 6px; margin: 14px 0 16px; }
  .bm3-viewtab {
    background: rgba(148,163,184,0.06);
    border: 1px solid rgba(148,163,184,0.16);
    color: #94a3b8;
    padding: 6px 20px;
    border-radius: 999px;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .bm3-viewtab:hover { color: #cbd5e1; border-color: rgba(148,163,184,0.3); }
  .bm3-viewtab.active {
    background: linear-gradient(180deg, #1d4ed8, #1e3a8a);
    border-color: #3b82f6;
    color: #f8fafc;
    box-shadow: 0 0 14px rgba(59,130,246,0.35);
  }

  .bm3-layout { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; }
  .bm3-panel {
    background: rgba(15,23,36,0.7);
    border: 1px solid rgba(148,163,184,0.1);
    border-radius: 12px;
    padding: 14px;
    width: 135px;
    flex-shrink: 0;
  }
  .bm3-panel-title { font-size: 0.65rem; letter-spacing: 0.08em; color: #64748b; font-weight: 700; margin-bottom: 12px; }
  .bm3-legend-row { display: flex; align-items: center; gap: 8px; margin-bottom: 9px; }
  .bm3-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .bm3-legend-text { font-size: 0.76rem; line-height: 1.2; }
  .bm3-legend-text .sub { display: block; font-size: 0.65rem; color: #64748b; }

  .bm3-viewport { position: relative; width: 230px; height: 460px; flex-shrink: 0; margin: 0 auto; }
  .bm3-vector-svg { width: 100%; height: 100%; filter: drop-shadow(0 14px 25px rgba(0,0,0,0.65)); overflow: visible; }
  .bm3-base-body { fill: #1a2030; stroke: #2c3646; stroke-width: 2.5; }
  .bm3-static-part { fill: #1a2030; }

  .bm3-muscle-path {
    cursor: pointer;
    transition: filter 0.22s ease, opacity 0.22s ease;
    filter: saturate(0.9) brightness(0.95);
    opacity: 0.95;
    transform-box: fill-box;
    transform-origin: center;
  }
  .bm3-muscle-path:hover {
    filter: saturate(1.25) brightness(1.25) drop-shadow(0 0 9px currentColor);
    opacity: 1;
  }
  .bm3-muscle-path.selected {
    filter: saturate(1.35) brightness(1.35) drop-shadow(0 0 16px currentColor);
    opacity: 1;
  }
  .bm3-fiber-overlay {
    pointer-events: none;
    mix-blend-mode: overlay;
    transition: opacity 0.22s ease;
    opacity: 0.45;
  }

  .bm3-annot-group text { user-select: none; }
  .bm3-annot-dot { filter: drop-shadow(0 0 6px #38bdf8); }
  .bm3-annot-backdrop { fill: rgba(11, 18, 32, 0.94); rx: 6; ry: 6; }

  .bm3-detail-card {
    margin-top: 20px;
    background: rgba(15,23,36,0.85);
    border: 1px solid rgba(56,189,248,0.35);
    border-radius: 14px;
    padding: 16px 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }
  .bm3-detail-name { font-size: 1.1rem; font-weight: 800; color: #f8fafc; }
  .bm3-detail-hours { color: #38bdf8; font-size: 0.8rem; font-weight: 700; margin: 3px 0 6px; display: flex; align-items: center; gap: 6px; }
  .bm3-detail-desc { color: #94a3b8; font-size: 0.82rem; max-width: 460px; line-height: 1.35; }
  .bm3-detail-tag { padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.78rem; color: #fff; white-space: nowrap; flex-shrink: 0; }

  @media (max-width: 600px) { .bm3-panel { display: none; } }
`;
hudRoot.appendChild(styleEl);

// ============================================================================
// 4. HEADER & VIEWS
// ============================================================================
const header = hudRoot.createDiv({ cls: "bm3-header" });
header.createDiv({ cls: "bm3-title" }).innerHTML = `<span class="bm3-icon">🧬</span> Musculoskeletal Recovery HUD`;
header.createDiv({ cls: "bm3-subtitle", text: "Biological fatigue decay • Real-time recovery timeline" });

const viewTabs = hudRoot.createDiv({ cls: "bm3-viewtabs" });
const frontTab = viewTabs.createEl("button", { cls: "bm3-viewtab active", text: "FRONT" });
const backTab = viewTabs.createEl("button", { cls: "bm3-viewtab", text: "BACK" });

const layout = hudRoot.createDiv({ cls: "bm3-layout" });

const legendPanel = layout.createDiv({ cls: "bm3-panel" });
legendPanel.createDiv({ cls: "bm3-panel-title", text: "READINESS SCORE" });
const legendData = [
    { color: "#ef4444", label: "0 - 39%", sub: "(Acute Fatigue)" },
    { color: "#f97316", label: "40 - 69%", sub: "(Repair Phase)" },
    { color: "#eab308", label: "70 - 89%", sub: "(Supercompensated)" },
    { color: "#22c55e", label: "90 - 100%", sub: "(Fully Recovered)" }
];
legendData.forEach(item => {
    const row = legendPanel.createDiv({ cls: "bm3-legend-row" });
    const dot = row.createDiv({ cls: "bm3-dot" });
    dot.style.background = item.color;
    dot.style.color = item.color;
    const text = row.createDiv({ cls: "bm3-legend-text" });
    text.innerHTML = `${item.label}<span class="sub">${item.sub}</span>`;
});

const viewport = layout.createDiv({ cls: "bm3-viewport" });

const howtoPanel = layout.createDiv({ cls: "bm3-panel" });
howtoPanel.createDiv({ cls: "bm3-panel-title", text: "TRAINING INTEL" });
const howtoData = [
    { icon: "🟢", text: "Green: Primed for direct training" },
    { icon: "🟡", text: "Yellow: Ready for light/moderate work" },
    { icon: "🔴", text: "Red: Allow remaining hours to clear" }
];
howtoData.forEach(item => {
    const row = howtoPanel.createDiv({ style: "display:flex; align-items:flex-start; gap:8px; margin-bottom:10px;" });
    row.createDiv({ text: item.icon, style: "font-size:0.85rem;" });
    row.createDiv({ text: item.text, style: "font-size:0.75rem; color:#94a3b8; line-height:1.3;" });
});

const detailCard = hudRoot.createDiv({ cls: "bm3-detail-card" });
const detailLeft = detailCard.createDiv();
const detailName = detailLeft.createDiv({ cls: "bm3-detail-name" });
const detailHours = detailLeft.createDiv({ cls: "bm3-detail-hours" });
const detailDesc = detailLeft.createDiv({ cls: "bm3-detail-desc" });
const detailTag = detailCard.createDiv({ cls: "bm3-detail-tag" });

function renderDetails(key, nameOverride) {
    const model = muscleRegistry[key];
    if (!model) return;
    const tier = getTier(model.recovery);
    detailName.setText(nameOverride || model.name);
    
    if (model.recovery >= 90) {
      detailHours.innerHTML = `🟢 100% Fully Recovered • Ready for max overload`;
    } else {
      detailHours.innerHTML = `⏱ ${model.hoursLeft} Hours to Full Recovery • ${model.recovery}% Readiness`;
    }
    
    detailDesc.setText(model.desc);
    detailTag.setText(`${model.recovery}%`);
    detailTag.style.background = tier.base;
    detailCard.style.borderColor = tier.base + "80";
}

function buildDefs(view) {
    let defs = "";
    for (const [key, item] of Object.entries(muscleRegistry)) {
        if (item.view !== view) continue;
        const tier = getTier(item.recovery);
        const gid = `grad-${INSTANCE_ID}-${view}-${key}`;

        defs += `
            <radialGradient id="${gid}" cx="32%" cy="26%" r="80%">
                <stop offset="0%"  stop-color="${tier.light}" stop-opacity="1" />
                <stop offset="30%" stop-color="${tier.base}"  stop-opacity="1" />
                <stop offset="62%" stop-color="${tier.base}"  stop-opacity="0.96" />
                <stop offset="85%" stop-color="${tier.dark}"  stop-opacity="0.97" />
                <stop offset="100%" stop-color="${tier.dark}" stop-opacity="1" />
            </radialGradient>
        `;

        const pid = `fiber-${INSTANCE_ID}-${view}-${key}`;
        defs += `
            <pattern id="${pid}" width="5" height="5" patternTransform="rotate(58)" patternUnits="userSpaceOnUse">
                <rect width="5" height="5" fill="transparent" />
                <line x1="0" y1="0" x2="0" y2="5" stroke="#000000" stroke-width="0.8" stroke-opacity="0.75" />
                <line x1="2.5" y1="0" x2="2.5" y2="5" stroke="#ffffff" stroke-width="0.5" stroke-opacity="0.38" />
            </pattern>
        `;
    }
    return defs;
}

function clearAnnotation(svgEl) {
    const g = svgEl.querySelector(".bm3-annot-group");
    if (g) g.remove();
}

function showAnnotation(svgEl, view, point, label) {
    clearAnnotation(svgEl);
    const cx = point.x, cy = point.y;
    const vbX = view === "front" ? 0 : 724;
    const vbWidth = 724;
    const centerX = vbX + vbWidth / 2;
    const routeLeft = cx < centerX;

    const LEADER_OFFSET = 56;
    const EDGE_MARGIN = 14;
    const minX = vbX + EDGE_MARGIN, maxX = vbX + vbWidth - EDGE_MARGIN;
    let targetX = routeLeft ? cx - LEADER_OFFSET : cx + LEADER_OFFSET;
    targetX = Math.max(minX, Math.min(maxX, targetX));

    const textAnchor = routeLeft ? "end" : "start";
    const textX = targetX + (routeLeft ? -12 : 12);
    const textLength = label.length * 14;
    const backdropPad = 8;
    const backdropX = routeLeft ? textX - textLength - backdropPad : textX;
    const backdropWidth = textLength + backdropPad * 2;

    const html = `
        <g class="bm3-annot-group">
            <line x1="${cx}" y1="${cy}" x2="${targetX}" y2="${cy}" stroke="#38bdf8" stroke-width="4" stroke-linecap="round" />
            <circle class="bm3-annot-dot" cx="${cx}" cy="${cy}" r="9" fill="#38bdf8" stroke="#0b1220" stroke-width="3" />
            <rect class="bm3-annot-backdrop" x="${backdropX}" y="${cy - 18}" width="${backdropWidth}" height="36" />
            <text x="${textX}" y="${cy}" fill="#f8fafc" font-size="29" font-weight="800"
                  text-anchor="${textAnchor}" dominant-baseline="middle"
                  style="paint-order: stroke; stroke: #0b1220; stroke-width: 6px; stroke-linejoin: round;">${label}</text>
        </g>
    `;
    svgEl.insertAdjacentHTML("beforeend", html);
}

function renderBody(view) {
    viewport.empty();
    let pathsHtml = "";
    const outline = view === "front" ? FRONT_OUTLINE : BACK_OUTLINE;
    const vb = view === "front" ? FRONT_VIEWBOX : BACK_VIEWBOX;
    const staticParts = STATIC_PARTS[view];
    const defsHtml = buildDefs(view);

    for (const [partKey, partData] of Object.entries(staticParts)) {
        pathsHtml += `<path class="bm3-static-part" d="${partData.d}" fill="${partData.color}" />`;
    }

    for (const [key, item] of Object.entries(muscleRegistry)) {
        if (item.view !== view) continue;
        const gid = `grad-${INSTANCE_ID}-${view}-${key}`;
        const tier = getTier(item.recovery);
        const isSelected = key === selectedKey;
        const fill = `url(#${gid})`;
        const stroke = tier.dark;
        const pathClass = `bm3-muscle-path${isSelected ? " selected" : ""}`;

        pathsHtml += `<g class="bm3-muscle-group${isSelected ? " selected" : ""}">`;
        item.paths.forEach(p => {
            pathsHtml += `<path class="${pathClass}" data-key="${key}" d="${p}" fill="${fill}" stroke="${stroke}" stroke-width="0.6" style="color:${tier.base}" />`;
        });

        const pid = `fiber-${INSTANCE_ID}-${view}-${key}`;
        item.paths.forEach(p => {
            pathsHtml += `<path class="bm3-fiber-overlay${isSelected ? " selected" : ""}" data-key="${key}" d="${p}" fill="url(#${pid})" />`;
        });
        pathsHtml += `</g>`;
    }

    viewport.innerHTML = `
        <svg class="bm3-vector-svg" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">
            <defs>${defsHtml}</defs>
            <path class="bm3-base-body" d="${outline}" />
            ${pathsHtml}
        </svg>
    `;

    const svgEl = viewport.querySelector(".bm3-vector-svg");
    if (!svgEl) return;

    svgEl.querySelectorAll(".bm3-muscle-path").forEach(p => {
        const key = p.getAttribute("data-key");
        p.addEventListener("mouseenter", () => renderDetails(key));
        p.addEventListener("mouseleave", () => {
            if (selectedKey) renderDetails(selectedKey);
        });
        p.addEventListener("click", () => {
            selectedKey = key;
            const b = p.getBBox();
            selectedPoint = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
            renderBody(currentView);
            renderDetails(key);
        });
    });

    if (selectedKey && selectedPoint) {
        showAnnotation(svgEl, view, selectedPoint, muscleRegistry[selectedKey].name);
    }
}

function switchView(view) {
    currentView = view;
    selectedKey = null;
    selectedPoint = null;
    frontTab.classList.toggle("active", view === "front");
    backTab.classList.toggle("active", view === "back");
    renderBody(view);
    const firstKey = Object.keys(muscleRegistry).find(k => muscleRegistry[k].view === view);
    if (firstKey) renderDetails(firstKey);
}

frontTab.addEventListener("click", () => switchView("front"));
backTab.addEventListener("click", () => switchView("back"));

renderBody("front");
renderDetails("chest");
}
initRecoveryHUD();