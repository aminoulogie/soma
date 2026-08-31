```dataviewjs
async function initCompleteFitnessHub() {
// ============================================================================
// 1. DATA SOURCE & RECOVERY ENGINE
// ============================================================================
const registryFile = app.vault.getAbstractFileByPath("apps/scripts/muscleRegistry.json");
const historyFile = app.vault.getAbstractFileByPath("apps/scripts/soma-history.json");

if (!registryFile) {
  dv.paragraph("❌ `apps/scripts/muscleRegistry.json` not found");
  return;
}

const registryContent = await app.vault.read(registryFile);
const muscleRegistry = JSON.parse(registryContent);

let history = {};
if (historyFile) {
  try {
    const raw = await app.vault.read(historyFile);
    history = JSON.parse(raw);
  } catch (e) {}
}

const BASE_RECOVERY_HOURS = {
  calves: 24, calves_back: 24, deltoids_back: 24, forearms: 24,
  biceps: 36, deltoids: 36,
  chest: 48, upper_back: 48, trapezius_back: 48, triceps: 48, triceps_back: 48, gluteal: 48, adductors: 48,
  quadriceps: 72, hamstring: 72, lower_back: 72
};

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

// Compute biological readiness score for all muscles
for (const key in muscleRegistry) {
  const baseT = BASE_RECOVERY_HOURS[key] || muscleRegistry[key].defaultHours || 48;
  if (latestStimulus[key]) {
    const elapsedHours = (now - latestStimulus[key].timestamp) / 3600000;
    const sets = latestStimulus[key].sets;
    const avgFail = latestStimulus[key].avgFail;
    const tTarget = baseT * (1 + 0.08 * Math.max(0, sets - 3)) * (1 + 0.06 * (avgFail - 3));
    const readiness = Math.min(100, Math.pow(elapsedHours / tTarget, 1.15) * 100);
    muscleRegistry[key].recovery = Math.round(readiness);
  } else {
    muscleRegistry[key].recovery = 100;
  }
}

// ============================================================================
// 2. SPLIT & HYBRID COMBINATION MAPPINGS
// ============================================================================
// Standard PPL / Full Body Splits
const pplSplits = [
  { name: "Push Day (Chest / Shoulders / Triceps)", keys: ["chest", "deltoids", "triceps", "triceps_back"] },
  { name: "Pull Day (Back / Rear Delts / Biceps)", keys: ["upper_back", "trapezius_back", "deltoids_back", "biceps"] },
  { name: "Leg Day (Quads / Hams / Glutes / Calves)", keys: ["quadriceps", "hamstring", "gluteal", "calves", "calves_back"] },
  { name: "Upper Body (Full Torso)", keys: ["chest", "upper_back", "deltoids", "biceps", "triceps"] },
  { name: "Lower Body & Core", keys: ["quadriceps", "hamstring", "gluteal", "calves", "lower_back"] }
];

// Targeted Accessory / Hybrid Combinations
const customCombinations = [
  { name: "Shoulders & Biceps (Hypertrophy Focus)", keys: ["deltoids", "deltoids_back", "biceps"] },
  { name: "Arms & Calves Terminator", keys: ["biceps", "triceps", "triceps_back", "calves", "calves_back"] },
  { name: "Chest & Back Detailing (Upper Flush)", keys: ["chest", "upper_back", "trapezius_back"] },
  { name: "Posterior Chain & Glutes", keys: ["hamstring", "gluteal", "lower_back"] },
  { name: "Quads & Side Delts Specialization", keys: ["quadriceps", "deltoids"] }
];

function scoreGroup(groupList) {
  const scored = groupList.map(item => {
    const sum = item.keys.reduce((acc, k) => acc + (muscleRegistry[k] ? muscleRegistry[k].recovery : 100), 0);
    const avg = Math.round(sum / item.keys.length);
    return { name: item.name, score: avg, keys: item.keys };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored;
}

const scoredPPL = scoreGroup(pplSplits);
const scoredCombos = scoreGroup(customCombinations);

const topPPL = scoredPPL[0];
const topCombo = scoredCombos[0];

// ============================================================================
// 3. UI RENDERING
// ============================================================================
const hubRoot = dv.el("div", "", { cls: "wk-hub-root" });

const style = document.createElement("style");
style.textContent = `
  .wk-hub-root {
    max-width: 680px;
    margin: 0 auto;
    font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    color: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-sizing: border-box;
  }
  .wk-hub-card {
    background: #070d19;
    border: 1px solid #1e293b;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 16px 45px rgba(0,0,0,0.65);
    box-sizing: border-box;
    width: 100%;
  }
  .wk-reco-banner-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 18px;
  }
  .wk-reco-banner {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.18), rgba(16, 185, 129, 0.12));
    border: 1px solid #2563eb;
    border-radius: 16px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
  .wk-reco-tag { font-size: 0.65rem; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
  .wk-reco-title { font-size: 0.95rem; font-weight: 800; color: #ffffff; line-height: 1.25; }
  .wk-reco-score { font-size: 1.35rem; font-weight: 900; color: #34d399; margin-top: 8px; }

  .wk-section-lbl {
    font-size: 0.72rem;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin: 14px 0 8px 0;
    display: flex;
    justify-content: space-between;
  }

  .wk-split-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #0b1324;
    border: 1px solid #172554;
    border-radius: 12px;
    padding: 10px 14px;
    margin-bottom: 8px;
  }
  .wk-split-info { display: flex; align-items: center; gap: 8px; font-weight: 800; font-size: 0.82rem; color: #f1f5f9; }
  .wk-bar-container { width: 110px; background: #1e293b; height: 8px; border-radius: 999px; overflow: hidden; margin-right: 10px; }
  .wk-bar-fill { height: 100%; border-radius: 999px; transition: width 0.4s ease; }

  @media (max-width: 600px) {
    .wk-reco-banner-grid { grid-template-columns: 1fr; }
  }
`;
hubRoot.appendChild(style);

const container = hubRoot.createDiv({ cls: "wk-hub-card" });

function renderRows(list, topItem) {
  return list.map(item => {
    let barColor = "#22c55e";
    if (item.score < 40) barColor = "#ef4444";
    else if (item.score < 70) barColor = "#f97316";
    else if (item.score < 90) barColor = "#eab308";

    return `
      <div class="wk-split-row">
        <div class="wk-split-info">
          <span>${item.name === topItem.name ? '⚡' : '▫️'}</span>
          <span>${item.name}</span>
        </div>
        <div style="display: flex; align-items: center;">
          <div class="wk-bar-container">
            <div class="wk-bar-fill" style="width: ${item.score}%; background: ${barColor};"></div>
          </div>
          <span style="font-weight: 800; font-size: 0.8rem; color: ${barColor}; width: 38px; text-align: right;">${item.score}%</span>
        </div>
      </div>
    `;
  }).join("");
}

container.innerHTML = `
  <div class="wk-reco-banner-grid">
    <div class="wk-reco-banner">
      <div>
        <div class="wk-reco-tag">🏆 Recommended Standard Split</div>
        <div class="wk-reco-title">${topPPL.name}</div>
      </div>
      <div class="wk-reco-score">${topPPL.score}% Readiness</div>
    </div>
    <div class="wk-reco-banner">
      <div>
        <div class="wk-reco-tag">🎯 Recommended Target Hybrid</div>
        <div class="wk-reco-title">${topCombo.name}</div>
      </div>
      <div class="wk-reco-score">${topCombo.score}% Readiness</div>
    </div>
  </div>

  <div class="wk-section-lbl">
    <span>Standard Training Splits (PPL)</span>
    <span>Recovery</span>
  </div>
  <div>${renderRows(scoredPPL, topPPL)}</div>

  <div class="wk-section-lbl" style="margin-top: 18px;">
    <span>Target Muscle Combinations & Isolate Focus</span>
    <span>Readiness</span>
  </div>
  <div>${renderRows(scoredCombos, topCombo)}</div>
`;
}
initCompleteFitnessHub();

async function initMasterFitnessTerminal() {
// ============================================================================
// 1. DATA SOURCES & HISTORY CALCULATION
// ============================================================================
const registryFile = app.vault.getAbstractFileByPath("apps/scripts/muscleRegistry.json");
const historyFile = app.vault.getAbstractFileByPath("apps/scripts/soma-history.json");

if (!registryFile) {
  dv.paragraph("❌ `apps/scripts/muscleRegistry.json` not found");
  return;
}

const registryContent = await app.vault.read(registryFile);
const muscleRegistry = JSON.parse(registryContent);

let history = {};
if (historyFile) {
  try { history = JSON.parse(await app.vault.read(historyFile)); } catch (e) {}
}

const now = Date.now();
const fourteenDaysAgo = now - (14 * 86400000);

let rolling14DayAxialVol = 0;
let rolling14DayTotalVol = 0;
let pushVol = 0, pullVol = 0, legVol = 0;
let latestSession = null;

for (const session of Object.values(history)) {
  const t = session.timestamp || 0;
  if (t >= fourteenDaysAgo) {
    rolling14DayTotalVol += (session.totalVol || 0);
    rolling14DayAxialVol += (session.axialVol || 0);

    const split = (session.split || "").toLowerCase();
    if (split.includes("push")) pushVol += (session.totalVol || 0);
    else if (split.includes("pull")) pullVol += (session.totalVol || 0);
    else if (split.includes("leg")) legVol += (session.totalVol || 0);
  }

  if (!latestSession || t > (latestSession.timestamp || 0)) {
    latestSession = session;
  }
}

// Compute PPL Volume Proportions
const totalPPL = (pushVol + pullVol + legVol) || 1;
const pushPct = Math.round((pushVol / totalPPL) * 100);
const pullPct = Math.round((pullVol / totalPPL) * 100);
const legPct = Math.round((legVol / totalPPL) * 100);

// CNS Deload Threshold Analysis (Axial Load > 38% of total volume triggers deload warning)
const axialRatio = Math.round((rolling14DayAxialVol / (rolling14DayTotalVol || 1)) * 100);
const needsDeload = axialRatio > 40 && rolling14DayAxialVol > 12000;

// Dynamic Calorie & Protein Calculation from latest session
const latestBurn = latestSession ? (latestSession.caloriesBurned || 0) : 0;
const recommendedProtein = latestSession && (latestSession.split === "Legs" || latestSession.split === "Pull") ? 180 : 160;

// ============================================================================
// 2. UI RENDERING
// ============================================================================
const masterRoot = dv.el("div", "", { cls: "wk-master-root" });

const style = document.createElement("style");
style.textContent = `
  .wk-master-root { max-width: 680px; margin: 0 auto; font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif); color: #f8fafc; display: flex; flex-direction: column; gap: 16px; }
  .wk-card { background: #070d19; border: 1px solid #1e293b; border-radius: 20px; padding: 20px; box-shadow: 0 16px 45px rgba(0,0,0,0.65); }
  .wk-section-title { font-size: 1.15rem; font-weight: 800; color: #ffffff; display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
  
  /* CNS FATIGUE GAUGE */
  .wk-cns-box { background: #0b1324; border: 1px solid #172554; border-radius: 14px; padding: 14px; margin-bottom: 14px; }
  .wk-cns-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-weight: 800; font-size: 0.85rem; }
  .wk-cns-bar { height: 10px; background: #1e293b; border-radius: 999px; overflow: hidden; }
  .wk-cns-fill { height: 100%; border-radius: 999px; transition: width 0.5s ease; }

  /* SYMMETRY RADAR / RATIO BAR */
  .wk-sym-bar-wrap { display: flex; height: 18px; border-radius: 8px; overflow: hidden; margin: 10px 0 6px 0; }
  .wk-sym-push { background: #3b82f6; }
  .wk-sym-pull { background: #10b981; }
  .wk-sym-legs { background: #f59e0b; }
  .wk-sym-legend { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 800; margin-top: 6px; }

  /* MACRO CROSS-SYNC CARD */
  .wk-macro-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .wk-macro-box { background: #0b1324; border: 1px solid #172554; border-radius: 12px; padding: 12px; text-align: center; }
`;
masterRoot.appendChild(style);

const card = masterRoot.createDiv({ cls: "wk-card" });

card.innerHTML = `
  <div class="wk-section-title">⚡ Nervous System (CNS) & Axial Load Index</div>
  <div class="wk-cns-box" style="${needsDeload ? 'border-color: #ef4444;' : ''}">
    <div class="wk-cns-head">
      <span>14-Day Spinal Axial Stress</span>
      <span style="color: ${needsDeload ? '#ef4444' : '#38bdf8'};">${axialRatio}% Stress Ratio (${rolling14DayAxialVol.toLocaleString()} kg)</span>
    </div>
    <div class="wk-cns-bar">
      <div class="wk-cns-fill" style="width: ${Math.min(100, axialRatio * 2)}%; background: ${needsDeload ? '#ef4444' : '#38bdf8'};"></div>
    </div>
    <div style="font-size: 0.72rem; color: #94a3b8; margin-top: 6px;">
      ${needsDeload ? '⚠️ High systemic fatigue detected. Incorporate a deload or low-axial movements (machines/cables).' : '🟢 Axial spinal fatigue within optimal recovery bounds.'}
    </div>
  </div>

  <div class="wk-section-title" style="margin-top: 18px;">⚖️ Push / Pull / Leg Structural Balance</div>
  <div style="font-size: 0.75rem; color: #94a3b8;">14-Day volume distribution across main movement planes:</div>
  <div class="wk-sym-bar-wrap">
    <div class="wk-sym-push" style="width: ${pushPct}%;" title="Push: ${pushPct}%"></div>
    <div class="wk-sym-pull" style="width: ${pullPct}%;" title="Pull: ${pullPct}%"></div>
    <div class="wk-sym-legs" style="width: ${legPct}%;" title="Legs: ${legPct}%"></div>
  </div>
  <div class="wk-sym-legend">
    <span style="color: #60a5fa;">Push: ${pushPct}%</span>
    <span style="color: #34d399;">Pull: ${pullPct}%</span>
    <span style="color: #fbbf24;">Legs: ${legPct}%</span>
  </div>

  <div class="wk-section-title" style="margin-top: 20px;">🥗 Dynamic Nutrition Sync</div>
  <div class="wk-macro-grid">
    <div class="wk-macro-box">
      <div style="font-size: 0.68rem; font-weight: 800; color: #64748b; text-transform: uppercase;">Surplus Energy Target</div>
      <div style="font-size: 1.25rem; font-weight: 900; color: #f59e0b; margin-top: 4px;">+${latestBurn} kcal</div>
      <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 2px;">Workout energy offset</div>
    </div>
    <div class="wk-macro-box">
      <div style="font-size: 0.68rem; font-weight: 800; color: #64748b; text-transform: uppercase;">Optimal Protein Target</div>
      <div style="font-size: 1.25rem; font-weight: 900; color: #38bdf8; margin-top: 4px;">${recommendedProtein} g</div>
      <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 2px;">Hypertrophy repair index</div>
    </div>
  </div>
`;
}
initMasterFitnessTerminal();