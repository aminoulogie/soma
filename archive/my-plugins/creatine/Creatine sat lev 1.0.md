```dataviewjs
async function initCreatineSaturationWidget() {
try {
// ============================================================================
// 1. DATA ACCESS & CONTEXT
// ============================================================================
const nutritionFilePath = "apps/scripts/soma-nutrition.json";
let nutritionDB = {};
const nFile = app.vault.getAbstractFileByPath(nutritionFilePath);
if (nFile) {
  try { nutritionDB = JSON.parse(await app.vault.read(nFile)); } catch (e) {}
}

const fileName = dv.current()?.file?.name || "";
const dateMatch = fileName.match(/\d{4}-\d{2}-\d{2}/);
const todayKey = dateMatch ? dateMatch[0] : new Date().toISOString().slice(0, 10);

if (!nutritionDB[todayKey]) nutritionDB[todayKey] = { creatine: 0 };
if (nutritionDB[todayKey].creatine === undefined) nutritionDB[todayKey].creatine = 0;

async function saveCreatineData() {
  let file = app.vault.getAbstractFileByPath(nutritionFilePath);
  if (!file) {
    try { await app.vault.create(nutritionFilePath, JSON.stringify(nutritionDB, null, 2)); } catch (e) {}
  } else {
    await app.vault.modify(file, JSON.stringify(nutritionDB, null, 2));
  }
}

// ============================================================================
// 2. PHARMACOKINETIC ACCUMULATION, DECAY & STREAK MATH
// ============================================================================
function computeMetrics() {
  let saturation = 60.0; // Baseline non-supplemented %
  let currentStreak = 0;
  let isStreakActive = true;

  const refDate = new Date(todayKey);

  // 1. Calculate historical saturation trajectory over past 30 days
  for (let i = 30; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const dose = (nutritionDB[dStr]?.creatine) || 0;

    if (dose > 0) {
      // Non-linear accumulation approaching 100%
      const delta = (dose / 5.0) * (100.0 - saturation) * 0.10;
      saturation = Math.min(100.0, saturation + Math.max(1.4, delta));
    } else {
      // Natural elimination decay (~1.5% daily)
      if (saturation > 60.0) {
        saturation = Math.max(60.0, saturation - (saturation * 0.015));
      }
    }
  }

  // 2. Calculate consecutive daily logging streak
  let checkDate = new Date(refDate);
  for (let s = 0; s < 60; s++) {
    const dStr = checkDate.toISOString().slice(0, 10);
    const dose = (nutritionDB[dStr]?.creatine) || 0;
    if (dose > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // If today is 0g but was already logged yesterday, streak stays alive for today
      if (s === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return {
    satPct: Math.round(saturation),
    streak: currentStreak,
    todayDose: nutritionDB[todayKey]?.creatine || 0
  };
}

// Dynamic color interpolation: Amber (60%) -> Cyan (80%) -> Bright Emerald Green (100%)
function getDynamicColor(pct) {
  if (pct >= 95) return "#10b981"; // Pure Emerald Green at 100%
  if (pct >= 85) return "#34d399"; // Green-Cyan Transition
  if (pct >= 75) return "#38bdf8"; // Sky Blue
  if (pct >= 68) return "#818cf8"; // Indigo
  return "#f59e0b"; // Amber (Baseline)
}

// ============================================================================
// 3. UI RENDERING & TAP HANDLERS
// ============================================================================
const widgetContainer = dv.el("div", "", { cls: "cr-saturation-root" });

const style = document.createElement("style");
style.textContent = `
  .cr-saturation-root {
    max-width: 660px;
    margin: 0 auto;
    font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif);
    color: #e4e4e7;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
  }
  .cr-card {
    background: #141417;
    border: 1px solid #27272a;
    border-radius: 10px;
    padding: 11px 14px;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .cr-card.saturated-glow {
    border-color: rgba(16, 185, 129, 0.45);
    box-shadow: 0 0 12px rgba(16, 185, 129, 0.15);
  }
  .cr-btn {
    touch-action: manipulation;
    cursor: pointer;
    user-select: none;
    transition: transform 0.08s ease, background 0.15s ease, border-color 0.15s ease;
  }
  .cr-btn:active {
    transform: scale(0.95);
  }
`;
widgetContainer.appendChild(style);

function renderUI() {
  const { satPct, streak, todayDose } = computeMetrics();
  const themeColor = getDynamicColor(satPct);
  const isSaturated = satPct >= 95;

  const statusLabel = isSaturated
    ? "Full Intracellular Volumization • Peak ATP"
    : satPct >= 80
    ? "High Saturation • Glycogen & Hydration Shuttling"
    : "Accumulating • Daily Maintenance Intake Required";

  widgetContainer.innerHTML = `
    <div class="cr-card ${isSaturated ? 'saturated-glow' : ''}">
      <!-- TOP INFO HEADER -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:7px;">
        <div style="display:flex; align-items:center; gap:7px;">
          <span style="font-size:0.75rem; font-weight:800; color:#ffffff; text-transform:uppercase; letter-spacing:0.04em;">⚡ Creatine Saturation</span>
          ${streak > 0 ? `<span style="font-size:0.65rem; font-weight:800; padding:1px 6px; border-radius:4px; background:rgba(245, 158, 11, 0.15); border:1px solid rgba(245, 158, 11, 0.35); color:#f59e0b;">🔥 ${streak}d streak</span>` : ''}
        </div>
        <span style="font-size:0.78rem; font-weight:800; color:${themeColor}; transition:color 0.3s ease;">
          ${satPct}% • ${isSaturated ? 'Saturated' : 'Building'}
        </span>
      </div>

      <!-- PROGRESS TRACK -->
      <div style="height:6px; background:#202023; border-radius:999px; overflow:hidden; border:1px solid #27272a;">
        <div style="width:${satPct}%; height:100%; background:${themeColor}; border-radius:999px; transition:width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease;"></div>
      </div>

      <!-- BOTTOM INTERACTION BAR -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; flex-wrap:wrap; gap:6px;">
        <span style="font-size:0.68rem; color:#71717a; font-weight:700;">${statusLabel}</span>
        
        <div style="display:flex; gap:6px; align-items:center;">
          <span style="font-size:0.72rem; font-weight:800; color:#d4d4d8; margin-right:2px;">Today: <b style="color:#ffffff;">${todayDose}g</b></span>
          <button class="cr-btn" id="btn-cr-add-3g" style="background:#18181b; border:1px solid #2e2e32; color:#a1a1aa; font-size:0.68rem; font-weight:700; padding:4px 8px; border-radius:6px;">+3g</button>
          <button class="cr-btn" id="btn-cr-add-5g" style="background:#0f291e; border:1px solid #10b981; color:#a7f3d0; font-size:0.68rem; font-weight:800; padding:4px 9px; border-radius:6px;">+5g</button>
          <button class="cr-btn" id="btn-cr-reset" style="background:#18181b; border:1px solid #27272a; color:#71717a; font-size:0.68rem; padding:4px 7px; border-radius:6px;" title="Reset dose">↺</button>
        </div>
      </div>
    </div>
  `;

  // Click & tap handlers with instant reactivity
  widgetContainer.querySelector("#btn-cr-add-3g").onclick = async () => {
    nutritionDB[todayKey].creatine = (nutritionDB[todayKey].creatine || 0) + 3;
    await saveCreatineData();
    renderUI();
  };

  widgetContainer.querySelector("#btn-cr-add-5g").onclick = async () => {
    nutritionDB[todayKey].creatine = (nutritionDB[todayKey].creatine || 0) + 5;
    await saveCreatineData();
    renderUI();
  };

  widgetContainer.querySelector("#btn-cr-reset").onclick = async () => {
    nutritionDB[todayKey].creatine = 0;
    await saveCreatineData();
    renderUI();
  };
}

renderUI();

} catch (err) {
  dv.paragraph("Creatine Widget Error: " + err.message);
}
}
initCreatineSaturationWidget();