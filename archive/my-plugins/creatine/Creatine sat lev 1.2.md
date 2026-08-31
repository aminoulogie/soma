```dataviewjs
async function initCreatineSaturationWidget() {
try {
// ============================================================================
// 1. DATA PERSISTENCE & INITIALIZATION
// ============================================================================
const nutritionFilePath = "apps/scripts/soma-nutrition.json";
let nutritionDB = {};
const nFile = app.vault.getAbstractFileByPath(nutritionFilePath);
if (nFile) {
  try { nutritionDB = JSON.parse(await app.vault.read(nFile)); } catch (e) {}
}

if (!nutritionDB._settings) nutritionDB._settings = {};
if (nutritionDB._settings.creatineStashGrams === undefined) {
  nutritionDB._settings.creatineStashGrams = 300;
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
// 2. MATHEMATICAL ENGINES
// ============================================================================
function computeMetrics() {
  let saturation = 60.0;
  let currentStreak = 0;

  const refDate = new Date(todayKey);

  // 1. 30-Day Saturation Trajectory
  for (let i = 30; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const dose = (nutritionDB[dStr]?.creatine) || 0;

    if (dose > 0) {
      const delta = (dose / 5.0) * (100.0 - saturation) * 0.10;
      saturation = Math.min(100.0, saturation + Math.max(1.4, delta));
    } else {
      if (saturation > 60.0) {
        saturation = Math.max(60.0, saturation - (saturation * 0.015));
      }
    }
  }

  // 2. Logging Streak
  let checkDate = new Date(refDate);
  for (let s = 0; s < 60; s++) {
    const dStr = checkDate.toISOString().slice(0, 10);
    const dose = (nutritionDB[dStr]?.creatine) || 0;
    if (dose > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      if (s === 0) {
        checkDate.setDate(checkDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  // 3. Stash Run-out Forecast
  const remainingStash = Math.max(0, nutritionDB._settings.creatineStashGrams || 0);
  const dailyRate = 5;
  const daysLeft = Math.floor(remainingStash / dailyRate);
  
  const finishDate = new Date(refDate);
  finishDate.setDate(finishDate.getDate() + daysLeft);
  const finishFormatted = finishDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return {
    satPct: Math.round(saturation),
    streak: currentStreak,
    todayDose: nutritionDB[todayKey]?.creatine || 0,
    stashGrams: remainingStash,
    daysLeft: daysLeft,
    finishFormatted: finishFormatted
  };
}

function getDynamicColor(pct) {
  if (pct >= 95) return "#10b981";
  if (pct >= 85) return "#34d399";
  if (pct >= 75) return "#38bdf8";
  if (pct >= 68) return "#818cf8";
  return "#f59e0b";
}

// ============================================================================
// 3. UI RENDERING & INLINE STASH CUSTOMIZER
// ============================================================================
let isCustomizingStash = false;
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
  .cr-stash-chip {
    cursor: pointer;
    background: #1c1c20;
    border: 1px solid #2e2e33;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 0.68rem;
    font-weight: 700;
    color: #a1a1aa;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
  }
  .cr-stash-chip:hover {
    background: #27272a;
    border-color: #38bdf8;
    color: #f4f4f5;
  }
  .cr-input-inline {
    background: #09090b;
    border: 1px solid #38bdf8;
    color: #ffffff;
    font-size: 0.72rem;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 5px;
    width: 65px;
    outline: none;
  }
`;
widgetContainer.appendChild(style);

function renderUI() {
  const { satPct, streak, todayDose, stashGrams, daysLeft, finishFormatted } = computeMetrics();
  const themeColor = getDynamicColor(satPct);
  const isSaturated = satPct >= 95;
  const stashAlertColor = stashGrams <= 50 ? "#f87171" : stashGrams <= 100 ? "#fbbf24" : "#94a3b8";

  widgetContainer.innerHTML = `
    <div class="cr-card ${isSaturated ? 'saturated-glow' : ''}">
      <!-- TOP STATUS & SATURATION HEADER -->
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

      <!-- STASH DEPLETION & INLINE CUSTOMIZER STRIP -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding:5px 0; border-bottom:1px solid #1e1e22; flex-wrap:wrap; gap:6px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.68rem; color:#71717a; font-weight:700;">Home Stash:</span>
          ${isCustomizingStash ? `
            <div style="display:inline-flex; align-items:center; gap:4px;">
              <input type="number" id="input-stash-val" class="cr-input-inline" value="${stashGrams}" min="0" max="2000" step="5" />
              <button class="cr-btn" id="btn-save-stash" style="background:#0284c7; border:none; color:#ffffff; font-size:0.65rem; font-weight:800; padding:3px 7px; border-radius:4px;">Save</button>
              <button class="cr-btn" id="btn-cancel-stash" style="background:#27272a; border:none; color:#a1a1aa; font-size:0.65rem; padding:3px 6px; border-radius:4px;">✕</button>
            </div>
          ` : `
            <span class="cr-stash-chip" id="btn-open-stash-edit" title="Click to customize grams remaining in your tub">
              📦 <b>${stashGrams}g</b> left (${daysLeft}d supply) ✏️
            </span>
          `}
        </div>
        <span style="font-size:0.68rem; font-weight:700; color:${stashAlertColor};">
          ${stashGrams > 0 ? `Depletion ~ <b>${finishFormatted}</b>` : '⚠️ Tub is Empty'}
        </span>
      </div>

      <!-- BOTTOM LOGGING CONTROLS -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; flex-wrap:wrap; gap:6px;">
        <span style="font-size:0.68rem; color:#71717a; font-weight:700;">
          ${isSaturated ? "Full Intracellular Volumization • Peak ATP" : "Accumulating • Daily 5g Maintenance"}
        </span>
        
        <div style="display:flex; gap:6px; align-items:center;">
          <span style="font-size:0.72rem; font-weight:800; color:#d4d4d8; margin-right:2px;">Today: <b style="color:#ffffff;">${todayDose}g</b></span>
          <button class="cr-btn" id="btn-cr-add-3g" style="background:#18181b; border:1px solid #2e2e32; color:#a1a1aa; font-size:0.68rem; font-weight:700; padding:4px 8px; border-radius:6px;">+3g</button>
          <button class="cr-btn" id="btn-cr-add-5g" style="background:#0f291e; border:1px solid #10b981; color:#a7f3d0; font-size:0.68rem; font-weight:800; padding:4px 9px; border-radius:6px;">+5g</button>
          <button class="cr-btn" id="btn-cr-reset" style="background:#18181b; border:1px solid #27272a; color:#71717a; font-size:0.68rem; padding:4px 7px; border-radius:6px;" title="Reset today's dose">↺</button>
        </div>
      </div>
    </div>
  `;

  // --- Inline Customization Actions ---
  if (!isCustomizingStash) {
    widgetContainer.querySelector("#btn-open-stash-edit").onclick = () => {
      isCustomizingStash = true;
      renderUI();
      const input = widgetContainer.querySelector("#input-stash-val");
      if (input) { input.focus(); input.select(); }
    };
  } else {
    widgetContainer.querySelector("#btn-save-stash").onclick = async () => {
      const val = parseFloat(widgetContainer.querySelector("#input-stash-val").value);
      if (!isNaN(val)) {
        nutritionDB._settings.creatineStashGrams = Math.max(0, Math.round(val));
        await saveCreatineData();
      }
      isCustomizingStash = false;
      renderUI();
    };

    widgetContainer.querySelector("#btn-cancel-stash").onclick = () => {
      isCustomizingStash = false;
      renderUI();
    };
  }

  // --- Dose Logging Actions ---
  widgetContainer.querySelector("#btn-cr-add-3g").onclick = async () => {
    nutritionDB[todayKey].creatine = (nutritionDB[todayKey].creatine || 0) + 3;
    nutritionDB._settings.creatineStashGrams = Math.max(0, (nutritionDB._settings.creatineStashGrams || 0) - 3);
    await saveCreatineData();
    renderUI();
  };

  widgetContainer.querySelector("#btn-cr-add-5g").onclick = async () => {
    nutritionDB[todayKey].creatine = (nutritionDB[todayKey].creatine || 0) + 5;
    nutritionDB._settings.creatineStashGrams = Math.max(0, (nutritionDB._settings.creatineStashGrams || 0) - 5);
    await saveCreatineData();
    renderUI();
  };

  widgetContainer.querySelector("#btn-cr-reset").onclick = async () => {
    const currentToday = nutritionDB[todayKey]?.creatine || 0;
    nutritionDB._settings.creatineStashGrams = (nutritionDB._settings.creatineStashGrams || 0) + currentToday;
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