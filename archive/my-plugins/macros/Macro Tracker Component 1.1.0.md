---
calories_consumed: 629
protein_grams: 27
carbs_grams: 11
fat_grams: 53
water_ml: 0
---
```dataviewjs
async function initUnifiedMacroTracker() {
try {
// ============================================================================
// 1. DATA SOURCE & SAFE DATE EXTRACTION
// ============================================================================
const nutritionFilePath = "apps/scripts/soma-nutrition.json";
const customFoodsFilePath = "apps/scripts/custom-foods.json";
const savedMealsFilePath = "apps/scripts/saved-meals.json";
const historyFilePath = "apps/scripts/soma-history.json";

// Extract YYYY-MM-DD from note title or fallback to today's actual date
const fileName = dv.current()?.file?.name || "";
const dateMatch = fileName.match(/\d{4}-\d{2}-\d{2}/);
const noteDateKey = dateMatch ? dateMatch[0] : new Date().toISOString().slice(0, 10);

let nutritionDB = {};
const nFile = app.vault.getAbstractFileByPath(nutritionFilePath);
if (nFile) {
  try { nutritionDB = JSON.parse(await app.vault.read(nFile)); } catch (e) {}
}

let customFoods = [];
const cfFile = app.vault.getAbstractFileByPath(customFoodsFilePath);
if (cfFile) {
  try { customFoods = JSON.parse(await app.vault.read(cfFile)); } catch (e) {}
}

let savedMeals = [];
const smFile = app.vault.getAbstractFileByPath(savedMealsFilePath);
if (smFile) {
  try { savedMeals = JSON.parse(await app.vault.read(smFile)); } catch (e) {}
}

let historyDB = {};
const hFile = app.vault.getAbstractFileByPath(historyFilePath);
if (hFile) {
  try { historyDB = JSON.parse(await app.vault.read(hFile)); } catch (e) {}
}

const todayWorkout = historyDB[noteDateKey] || {};
const exerciseCaloriesBurned = todayWorkout.caloriesBurned || 0;

const baseFoodLibrary = [
  { name: "Whole Eggs", serving: 100, unit: "g", cals: 143, p: 13.0, c: 0.7, f: 9.9 },
  { name: "Chicken Breast (Cooked)", serving: 100, unit: "g", cals: 165, p: 31.0, c: 0.0, f: 3.6 },
  { name: "White Rice (Cooked)", serving: 150, unit: "g", cals: 195, p: 4.1, c: 43.0, f: 0.4 },
  { name: "Egg Whites", serving: 100, unit: "g", cals: 52, p: 11.0, c: 0.7, f: 0.2 },
  { name: "Oatmeal (Dry)", serving: 50, unit: "g", cals: 190, p: 6.5, c: 34.0, f: 3.5 },
  { name: "Whey Protein Isolate", serving: 30, unit: "g", cals: 120, p: 25.0, c: 1.5, f: 1.0 },
  { name: "Greek / Plain Yogurt", serving: 150, unit: "g", cals: 90, p: 15.0, c: 5.0, f: 0.5 },
  { name: "Canned Tuna (Drained)", serving: 120, unit: "g", cals: 130, p: 29.0, c: 0.0, f: 1.0 },
  { name: "Pasta (Dry)", serving: 80, unit: "g", cals: 280, p: 10.0, c: 58.0, f: 1.2 },
  { name: "Olive Oil", serving: 14, unit: "g", cals: 120, p: 0.0, c: 0.0, f: 14.0 },
  { name: "Peanut Butter", serving: 32, unit: "g", cals: 190, p: 8.0, c: 7.0, f: 16.0 },
  { name: "Banana", serving: 118, unit: "g", cals: 105, p: 1.3, c: 27.0, f: 0.3 }
];

let foodLibrary = [...baseFoodLibrary, ...customFoods];

const defaultGoals = {
  cals: 2400,
  protein: 160,
  carbs: 260,
  fat: 70,
  water: 3500
};

if (!nutritionDB[noteDateKey]) {
  nutritionDB[noteDateKey] = {
    goals: { ...(nutritionDB.__defaultGoals || defaultGoals) },
    summaryOpen: true,
    tableOpen: true,
    analyticsOpen: true,
    water: 0,
    items: []
  };
}

const dayData = nutritionDB[noteDateKey];
if (!dayData.goals) dayData.goals = { ...(nutritionDB.__defaultGoals || defaultGoals) };
if (dayData.goals.water === undefined) dayData.goals.water = 3500;
if (dayData.summaryOpen === undefined) dayData.summaryOpen = true;
if (dayData.tableOpen === undefined) dayData.tableOpen = true;
if (dayData.analyticsOpen === undefined) dayData.analyticsOpen = true;
if (dayData.water === undefined) dayData.water = 0;
if (!dayData.items) dayData.items = [];

async function saveNutrition() {
  let file = app.vault.getAbstractFileByPath(nutritionFilePath);
  if (!file) {
    try { await app.vault.create(nutritionFilePath, JSON.stringify(nutritionDB, null, 2)); } catch (e) {}
  } else {
    await app.vault.modify(file, JSON.stringify(nutritionDB, null, 2));
  }

  const currentFilePath = dv.current()?.file?.path;
  const currentFile = currentFilePath ? app.vault.getAbstractFileByPath(currentFilePath) : null;
  if (currentFile && app.fileManager?.processFrontMatter) {
    let totCals = 0, totP = 0, totC = 0, totF = 0;
    (dayData.items || []).forEach(i => {
      totCals += i.cals || 0; totP += i.p || 0; totC += i.c || 0; totF += i.f || 0;
    });
    try {
      await app.fileManager.processFrontMatter(currentFile, fm => {
        fm["calories_consumed"] = Math.round(totCals);
        fm["protein_grams"] = Math.round(totP);
        fm["carbs_grams"] = Math.round(totC);
        fm["fat_grams"] = Math.round(totF);
        fm["water_ml"] = Math.round(dayData.water || 0);
      });
    } catch (e) {}
  }
}

async function saveCustomFoods() {
  let file = app.vault.getAbstractFileByPath(customFoodsFilePath);
  if (!file) {
    try { await app.vault.create(customFoodsFilePath, JSON.stringify(customFoods, null, 2)); } catch (e) {}
  } else {
    await app.vault.modify(file, JSON.stringify(customFoods, null, 2));
  }
  foodLibrary = [...baseFoodLibrary, ...customFoods];
}

async function saveSavedMeals() {
  let file = app.vault.getAbstractFileByPath(savedMealsFilePath);
  if (!file) {
    try { await app.vault.create(savedMealsFilePath, JSON.stringify(savedMeals, null, 2)); } catch (e) {}
  } else {
    await app.vault.modify(file, JSON.stringify(savedMeals, null, 2));
  }
}

// ============================================================================
// 2. ANALYTICS & 7-DAY ROLLING CALCULATION
// ============================================================================
function computeHistoricalMetrics() {
  let parsedDate = new Date(noteDateKey);
  if (isNaN(parsedDate.getTime())) parsedDate = new Date();

  const rolling7Days = [];
  let bankedSurplusTotal = 0;
  let loggedDaysCount = 0;
  let totalRollingCalories = 0;

  for (let i = 6; i >= 0; i--) {
    const d = new Date(parsedDate);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const dayEntry = nutritionDB[dStr];

    const targetGoal = (dayEntry && dayEntry.goals) ? dayEntry.goals.cals : (nutritionDB.__defaultGoals?.cals || defaultGoals.cals);
    const burned = (historyDB[dStr] && historyDB[dStr].caloriesBurned) ? historyDB[dStr].caloriesBurned : 0;
    const maintenanceTarget = targetGoal + burned;

    let dayCals = 0;
    if (dayEntry && dayEntry.items && dayEntry.items.length > 0) {
      dayCals = dayEntry.items.reduce((sum, item) => sum + (item.cals || 0), 0);
      loggedDaysCount++;
    } else if (dStr === noteDateKey && dayData.items.length > 0) {
      dayCals = dayData.items.reduce((sum, item) => sum + (item.cals || 0), 0);
      loggedDaysCount++;
    }

    const diff = dayCals > 0 ? (dayCals - maintenanceTarget) : 0;
    bankedSurplusTotal += diff;
    totalRollingCalories += dayCals;

    rolling7Days.push({
      dateStr: dStr,
      dayLabel: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      calories: Math.round(dayCals),
      target: maintenanceTarget,
      diff: Math.round(diff),
      hasData: dayCals > 0
    });
  }

  let logStreak = 0;
  let goalStreak = 0;
  let checkDate = new Date(parsedDate);

  const isTodayLogged = dayData.items && dayData.items.length > 0;
  if (!isTodayLogged) checkDate.setDate(checkDate.getDate() - 1);

  for (let s = 0; s < 60; s++) {
    const dStr = checkDate.toISOString().slice(0, 10);
    const entry = (dStr === noteDateKey) ? dayData : nutritionDB[dStr];
    if (entry && entry.items && entry.items.length > 0) {
      logStreak++;
      const totalC = entry.items.reduce((sum, item) => sum + (item.cals || 0), 0);
      const target = (entry.goals ? entry.goals.cals : defaultGoals.cals) + ((historyDB[dStr]?.caloriesBurned) || 0);
      if (Math.abs(totalC - target) <= target * 0.08 || (totalC <= target && totalC >= target * 0.85)) {
        goalStreak++;
      }
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const rollingAvgCalories = loggedDaysCount > 0 ? Math.round(totalRollingCalories / loggedDaysCount) : 0;
  return { rolling7Days, bankedSurplusTotal, rollingAvgCalories, logStreak, goalStreak };
}

// ============================================================================
// 3. UI STYLES
// ============================================================================
const macroRoot = dv.el("div", "", { cls: "ntr-root-container" });

const style = document.createElement("style");
style.textContent = `
  .ntr-root-container { max-width: 680px; margin: 0 auto; font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif); color: #f4f4f5; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; }
  .ntr-card { background: #18181b; border: 1px solid #27272a; border-radius: 10px; overflow: hidden; }
  
  .ntr-goals-widget { background: linear-gradient(145deg, #18181b, #202024); border: 1px solid #2e2e34; border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .ntr-goals-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ntr-goals-title { font-size: 0.72rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.06em; }
  .ntr-goal-pill { font-size: 0.74rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: #27272a; display: inline-flex; align-items: center; gap: 4px; }
  .ntr-streak-pill { font-size: 0.73rem; font-weight: 800; padding: 2px 8px; border-radius: 6px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.35); color: #f59e0b; display: inline-flex; align-items: center; gap: 4px; }
  .ntr-btn-edit-goals { background: #27272a; border: 1px solid #3f3f46; color: #cbd5e1; border-radius: 6px; padding: 5px 10px; font-size: 0.72rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
  .ntr-btn-edit-goals:hover { background: #3f3f46; color: #ffffff; }

  .ntr-water-dock { background: #0c1a2e; border: 1px solid #1e3a8a; border-radius: 10px; padding: 8px 14px; display: flex; justify-content: space-between; align-items: center; }
  .ntr-water-label { font-size: 0.75rem; font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 6px; }
  .ntr-water-btn-group { display: flex; gap: 6px; }
  .ntr-btn-water { background: #172554; border: 1px solid #1d4ed8; color: #bae6fd; font-size: 0.7rem; font-weight: 800; padding: 4px 8px; border-radius: 6px; cursor: pointer; transition: all 0.15s ease; }
  .ntr-btn-water:hover { background: #1e40af; color: #ffffff; }

  .ntr-accordion-bar { background: #202023; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; }
  .ntr-accordion-title { font-size: 0.88rem; font-weight: 800; color: #f4f4f5; display: flex; align-items: center; gap: 8px; }
  .ntr-accordion-cals { font-size: 0.8rem; font-weight: 700; color: #a1a1aa; margin-right: 8px; }
  .ntr-arrow { color: #a1a1aa; font-size: 0.75rem; transition: transform 0.2s ease; }
  .ntr-arrow.closed { transform: rotate(-90deg); }

  .ntr-analytics-body { padding: 12px; background: #18181b; }
  .ntr-bank-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
  .ntr-bank-stat { background: #202023; border: 1px solid #2e2e32; border-radius: 8px; padding: 8px; text-align: center; }
  .ntr-bank-lbl { font-size: 0.65rem; font-weight: 700; color: #71717a; text-transform: uppercase; }
  .ntr-bank-val { font-size: 0.95rem; font-weight: 800; margin-top: 2px; }
  
  .ntr-spark-chart-box { background: #202023; border: 1px solid #2e2e32; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px; }
  .ntr-spark-bars { display: flex; justify-content: space-between; align-items: flex-end; height: 60px; padding-top: 10px; gap: 8px; }
  .ntr-spark-col { flex: 1; display: flex; flex-direction: column; align-items: center; height: 100%; justify-content: flex-end; }
  .ntr-spark-bar-fill { width: 100%; max-width: 22px; border-radius: 4px 4px 0 0; min-height: 4px; transition: height 0.3s ease; }
  .ntr-spark-day { font-size: 0.65rem; font-weight: 700; color: #71717a; margin-top: 4px; }

  .ntr-donut-card { display: flex; align-items: center; justify-content: space-around; background: #202023; border: 1px solid #2e2e32; border-radius: 8px; padding: 10px 14px; }
  .ntr-donut-legend { display: flex; flex-direction: column; gap: 4px; font-size: 0.72rem; font-weight: 700; }
  .ntr-donut-legend-row { display: flex; align-items: center; gap: 6px; }
  .ntr-dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }

  .ntr-tiles-body { padding: 12px; background: #18181b; }
  .ntr-tiles-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .ntr-tile { background: #202023; border: 1px solid #2e2e32; border-radius: 8px; padding: 8px 10px; position: relative; overflow: hidden; }
  .ntr-tile-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 3.5px; }
  .ntr-tile-top { display: flex; justify-content: space-between; align-items: center; }
  .ntr-tile-lbl { font-size: 0.68rem; font-weight: 700; color: #a1a1aa; }
  .ntr-tile-pct { font-size: 0.65rem; font-weight: 700; color: #71717a; }
  .ntr-tile-val { font-size: 0.95rem; font-weight: 800; color: #ffffff; margin-top: 3px; }
  .ntr-tile-bar-bg { height: 4px; background: #2e2e34; border-radius: 999px; overflow: hidden; margin-top: 6px; }
  .ntr-tile-bar-fill { height: 100%; border-radius: 999px; }

  .acc-cals { background: #f59e0b; color: #f59e0b; }
  .acc-prot { background: #10b981; color: #10b981; }
  .acc-fat  { background: #ef4444; color: #ef4444; }
  .acc-carb { background: #0ea5e9; color: #0ea5e9; }

  .ntr-action-bar { display: flex; gap: 6px; padding: 8px 10px; background: #1c1c1f; border-bottom: 1px solid #27272a; flex-wrap: wrap; }
  .ntr-btn-tool { background: #27272a; color: #e4e4e7; border: 1px solid #3f3f46; border-radius: 6px; padding: 6px 10px; font-size: 0.72rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 4px; transition: all 0.15s ease; }
  .ntr-btn-tool:hover { background: #3f3f46; color: #ffffff; }

  .ntr-list-head { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 30px; background: #18181b; border-bottom: 1px solid #27272a; padding: 6px 10px; font-size: 0.7rem; font-weight: 800; color: #a1a1aa; }
  .ntr-row-item { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 30px; align-items: center; padding: 6px 10px; border-bottom: 1px solid #222226; font-size: 0.76rem; font-weight: 700; color: #f4f4f5; transition: background 0.15s ease; }
  .ntr-row-item:hover { background: #202024; }
  .ntr-row-item:last-child { border-bottom: none; }

  .col-cals { border-left: 2px solid #f59e0b; padding-left: 8px; }
  .col-prot { border-left: 2px solid #10b981; padding-left: 8px; }
  .col-fat  { border-left: 2px solid #ef4444; padding-left: 8px; }
  .col-carb { border-left: 2px solid #0ea5e9; padding-left: 8px; }

  .ntr-sub-bar-bg { height: 3px; background: #27272a; border-radius: 999px; width: 100%; margin-top: 2px; overflow: hidden; }
  .ntr-sub-bar-fill { height: 100%; border-radius: 999px; }

  .ntr-del-btn { background: #27272a; border: none; color: #a1a1aa; cursor: pointer; font-size: 0.7rem; border-radius: 4px; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; transition: all 0.15s ease; }
  .ntr-del-btn:hover { background: #ef4444; color: #ffffff; }

  .ntr-modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 3000; align-items: center; justify-content: center; }
  .ntr-modal-box { background: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 18px; width: 92%; max-width: 460px; box-shadow: 0 16px 45px rgba(0,0,0,0.9); max-height: 90vh; overflow-y: auto; }
  .ntr-modal-title { font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
  .ntr-modal-input { width: 100%; height: 36px; background: #202023; border: 1px solid #2e2e32; color: #fff; border-radius: 8px; padding: 6px 10px; font-weight: 700; font-size: 0.82rem; box-sizing: border-box; outline: none; margin-bottom: 8px; }
  .ntr-search-results { max-height: 130px; overflow-y: auto; border: 1px solid #27272a; border-radius: 8px; background: #202023; margin-bottom: 10px; }
  .ntr-search-item { padding: 8px 10px; border-bottom: 1px solid #27272a; cursor: pointer; }
  .ntr-search-item:hover { background: #27272a; }

  .ntr-macro-input-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px; }
  .ntr-mini-lbl { font-size: 0.62rem; font-weight: 800; color: #71717a; text-transform: uppercase; margin-bottom: 2px; }
  .ntr-mini-inp { width: 100%; height: 34px; background: #202023; border: 1px solid #2e2e32; color: #fff; border-radius: 6px; text-align: center; font-weight: 800; font-size: 0.8rem; box-sizing: border-box; }

  .ntr-meal-ing-row { display: grid; grid-template-columns: 2fr 1fr 24px; gap: 6px; align-items: center; margin-bottom: 6px; }
  .ntr-video-feed { width: 100%; height: 210px; background: #000; border-radius: 8px; object-fit: cover; margin-bottom: 8px; border: 1px solid #3f3f46; }
`;
macroRoot.appendChild(style);

// ============================================================================
// 4. UI RENDERING & LOGIC
// ============================================================================
const container = macroRoot.createDiv();

function renderMacroTracker() {
  let totalCals = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  (dayData.items || []).forEach(item => {
    totalCals += (item.cals || 0);
    totalProtein += (item.p || 0);
    totalCarbs += (item.c || 0);
    totalFat += (item.f || 0);
  });

  const effectiveGoalCals = dayData.goals.cals + exerciseCaloriesBurned;
  const calsPct = Math.min(100, Math.round((totalCals / effectiveGoalCals) * 100));
  const protPct = Math.min(100, Math.round((totalProtein / dayData.goals.protein) * 100));
  const fatPct = Math.min(100, Math.round((totalFat / dayData.goals.fat) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbs / dayData.goals.carbs) * 100));

  const { rolling7Days, bankedSurplusTotal, rollingAvgCalories, logStreak, goalStreak } = computeHistoricalMetrics();

  const pCal = totalProtein * 4;
  const fCal = totalFat * 9;
  const cCal = totalCarbs * 4;
  const totalMacroCal = pCal + fCal + cCal;

  const pRatio = totalMacroCal > 0 ? Math.round((pCal / totalMacroCal) * 100) : 30;
  const fRatio = totalMacroCal > 0 ? Math.round((fCal / totalMacroCal) * 100) : 25;
  const cRatio = totalMacroCal > 0 ? Math.max(0, 100 - pRatio - fRatio) : 45;

  const circumference = 2 * Math.PI * 24;
  const pDash = (pRatio / 100) * circumference;
  const fDash = (fRatio / 100) * circumference;
  const cDash = (cRatio / 100) * circumference;

  const pOffset = 0;
  const fOffset = -pDash;
  const cOffset = -(pDash + fDash);

  const maxBarCals = Math.max(...rolling7Days.map(d => Math.max(d.calories, d.target)), 2600);
  const sparkBarsHtml = rolling7Days.map(d => {
    const heightPct = Math.max(8, Math.min(100, Math.round((d.calories / maxBarCals) * 100)));
    const barColor = d.hasData ? (d.diff > 150 ? '#ef4444' : d.diff < -150 ? '#38bdf8' : '#10b981') : '#2e2e34';
    const isToday = d.dateStr === noteDateKey;
    return `
      <div class="ntr-spark-col" title="${d.dateStr}: ${d.calories} / ${d.target} kcal (${d.diff >= 0 ? '+' : ''}${d.diff})">
        <div class="ntr-spark-bar-fill" style="height: ${heightPct}%; background: ${barColor}; ${isToday ? 'outline: 1.5px solid #fff;' : ''}"></div>
        <div class="ntr-spark-day" style="${isToday ? 'color:#fff; font-weight:800;' : ''}">${d.dayLabel}</div>
      </div>
    `;
  }).join("");

  let rowsHtml = (dayData.items || []).map((item, idx) => {
    const pWidth = Math.min(100, Math.round((item.p / 40) * 100));
    const fWidth = Math.min(100, Math.round((item.f / 25) * 100));
    const cWidth = Math.min(100, Math.round((item.c / 60) * 100));

    return `
      <div class="ntr-row-item">
        <div>
          <div style="font-weight: 800; color: #f4f4f5; line-height: 1.2;">${item.name}</div>
          ${item.meal ? `<div style="font-size:0.6rem; color:#71717a; font-weight:700;">${item.meal}</div>` : ''}
        </div>
        <div style="color: #a1a1aa; font-size: 0.74rem;">${item.serving || "100 g"}</div>
        <div class="col-cals" style="font-weight: 800;">${item.cals.toFixed(1)} kcal</div>
        <div class="col-prot">
          <div style="font-size: 0.74rem; font-weight: 800;">${item.p.toFixed(1)} g</div>
          <div class="ntr-sub-bar-bg"><div class="ntr-sub-bar-fill" style="width: ${pWidth}%; background: #10b981;"></div></div>
        </div>
        <div class="col-fat">
          <div style="font-size: 0.74rem; font-weight: 800;">${item.f.toFixed(1)} g</div>
          <div class="ntr-sub-bar-bg"><div class="ntr-sub-bar-fill" style="width: ${fWidth}%; background: #ef4444;"></div></div>
        </div>
        <div class="col-carb">
          <div style="font-size: 0.74rem; font-weight: 800;">${item.c.toFixed(1)} g</div>
          <div class="ntr-sub-bar-bg"><div class="ntr-sub-bar-fill" style="width: ${cWidth}%; background: #0ea5e9;"></div></div>
        </div>
        <div style="text-align: right;">
          <button class="ntr-del-btn" data-idx="${idx}" title="Remove">✕</button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = `
    <!-- 0. CURRENT GOALS & STREAKS TOP WIDGET -->
    <div class="ntr-goals-widget">
      <div class="ntr-goals-info">
        <span class="ntr-goals-title">🎯 Goals</span>
        <span class="ntr-goal-pill" style="color:#f59e0b;"><b style="color:#fff;">${dayData.goals.cals}</b> kcal ${exerciseCaloriesBurned > 0 ? `<span style="font-size:0.65rem; color:#34d399;">(+${exerciseCaloriesBurned})</span>` : ''}</span>
        <span class="ntr-goal-pill" style="color:#10b981;">P: <b style="color:#fff;">${dayData.goals.protein}g</b></span>
        <span class="ntr-goal-pill" style="color:#ef4444;">F: <b style="color:#fff;">${dayData.goals.fat}g</b></span>
        <span class="ntr-goal-pill" style="color:#0ea5e9;">C: <b style="color:#fff;">${dayData.goals.carbs}g</b></span>
        <span class="ntr-streak-pill" title="Consecutive days logging food">🔥 ${logStreak}d Log</span>
        <span class="ntr-streak-pill" style="color:#34d399; background:rgba(16,185,129,0.15); border-color:rgba(16,185,129,0.35);" title="Consecutive days hitting targets">🎯 ${goalStreak}d Target</span>
      </div>
      <button class="ntr-btn-edit-goals" id="btn-open-goals-modal">⚙️ Targets</button>
    </div>

    <!-- WATER DOCK -->
    <div class="ntr-water-dock">
      <div class="ntr-water-label">
        <span>💧 Hydration:</span>
        <b style="color:#ffffff;">${(dayData.water || 0)}</b> / ${(dayData.goals.water || 3500)} ml
      </div>
      <div class="ntr-water-btn-group">
        <button class="ntr-btn-water" id="w-plus-250">+250ml</button>
        <button class="ntr-btn-water" id="w-plus-500">+500ml</button>
        <button class="ntr-btn-water" id="w-reset" style="background:#27272a; border-color:#3f3f46; color:#a1a1aa;">↺</button>
      </div>
    </div>

    <!-- 1. CALORIE BANKING & 7-DAY ROLLING TRENDLINE -->
    <div class="ntr-card">
      <div class="ntr-accordion-bar" id="toggle-analytics">
        <span class="ntr-accordion-title">📈 7-Day Calorie Banking & Macro Ratio</span>
        <div style="display: flex; align-items: center;">
          <span class="ntr-accordion-cals" style="color:${bankedSurplusTotal > 0 ? '#ef4444' : '#10b981'}; font-weight:800;">
            ${bankedSurplusTotal >= 0 ? '+' : ''}${bankedSurplusTotal} kcal Bank
          </span>
          <span class="ntr-arrow ${dayData.analyticsOpen ? '' : 'closed'}">▼</span>
        </div>
      </div>
      <div class="ntr-analytics-body" style="display: ${dayData.analyticsOpen ? 'block' : 'none'};">
        <div class="ntr-bank-summary-grid">
          <div class="ntr-bank-stat">
            <div class="ntr-bank-lbl">7-Day Avg Intake</div>
            <div class="ntr-bank-val" style="color:#f59e0b;">${rollingAvgCalories} kcal</div>
          </div>
          <div class="ntr-bank-stat">
            <div class="ntr-bank-lbl">Net Bank (7D)</div>
            <div class="ntr-bank-val" style="color:${bankedSurplusTotal > 0 ? '#ef4444' : '#10b981'};">${bankedSurplusTotal >= 0 ? '+' : ''}${bankedSurplusTotal} kcal</div>
          </div>
          <div class="ntr-bank-stat">
            <div class="ntr-bank-lbl">Caloric Balance</div>
            <div class="ntr-bank-val" style="color:#38bdf8;">${bankedSurplusTotal > 0 ? 'Surplus' : bankedSurplusTotal < -150 ? 'Deficit' : 'Balanced'}</div>
          </div>
        </div>

        <div class="ntr-spark-chart-box">
          <div style="font-size:0.68rem; font-weight:800; color:#a1a1aa; text-transform:uppercase; margin-bottom:2px;">7-Day Intake Sparkline (vs Maintenance Baseline)</div>
          <div class="ntr-spark-bars">${sparkBarsHtml}</div>
        </div>

        <div class="ntr-donut-card">
          <div style="position:relative; width:64px; height:64px; display:flex; align-items:center; justify-content:center;">
            <svg width="64" height="64" viewBox="0 0 64 64" style="transform: rotate(-90deg);">
              <circle cx="32" cy="32" r="24" fill="none" stroke="#27272a" stroke-width="7" />
              <circle cx="32" cy="32" r="24" fill="none" stroke="#10b981" stroke-width="7" stroke-dasharray="${pDash} ${circumference}" stroke-dashoffset="${pOffset}" />
              <circle cx="32" cy="32" r="24" fill="none" stroke="#ef4444" stroke-width="7" stroke-dasharray="${fDash} ${circumference}" stroke-dashoffset="${fOffset}" />
              <circle cx="32" cy="32" r="24" fill="none" stroke="#0ea5e9" stroke-width="7" stroke-dasharray="${cDash} ${circumference}" stroke-dashoffset="${cOffset}" />
            </svg>
            <div style="position:absolute; font-size:0.65rem; font-weight:800; color:#fff;">Ratio</div>
          </div>
          <div class="ntr-donut-legend">
            <div class="ntr-donut-legend-row"><span class="ntr-dot" style="background:#10b981;"></span> Protein: <b style="color:#fff;">${pRatio}%</b> (${Math.round(pCal)} kcal)</div>
            <div class="ntr-donut-legend-row"><span class="ntr-dot" style="background:#ef4444;"></span> Fat: <b style="color:#fff;">${fRatio}%</b> (${Math.round(fCal)} kcal)</div>
            <div class="ntr-donut-legend-row"><span class="ntr-dot" style="background:#0ea5e9;"></span> Carbs: <b style="color:#fff;">${cRatio}%</b> (${Math.round(cCal)} kcal)</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. MACROS SUMMARY CARD -->
    <div class="ntr-card">
      <div class="ntr-accordion-bar" id="toggle-summary">
        <span class="ntr-accordion-title">Macros Summary</span>
        <div style="display: flex; align-items: center;">
          <span class="ntr-accordion-cals">${totalCals.toFixed(1)} kcal</span>
          <span class="ntr-arrow ${dayData.summaryOpen ? '' : 'closed'}">▼</span>
        </div>
      </div>
      <div class="ntr-tiles-body" style="display: ${dayData.summaryOpen ? 'block' : 'none'};">
        <div class="ntr-tiles-grid">
          <div class="ntr-tile">
            <div class="ntr-tile-accent acc-cals"></div>
            <div class="ntr-tile-top">
              <span class="ntr-tile-lbl">Calories</span>
              <span class="ntr-tile-pct">${calsPct}%</span>
            </div>
            <div class="ntr-tile-val">${totalCals.toFixed(1)} <span style="font-size:0.68rem; font-weight:700; color:#71717a;">kcal</span></div>
            <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-cals" style="width: ${calsPct}%;"></div></div>
          </div>

          <div class="ntr-tile">
            <div class="ntr-tile-accent acc-prot"></div>
            <div class="ntr-tile-top">
              <span class="ntr-tile-lbl">Protein</span>
              <span class="ntr-tile-pct">${protPct}%</span>
            </div>
            <div class="ntr-tile-val">${totalProtein.toFixed(1)} <span style="font-size:0.68rem; font-weight:700; color:#71717a;">g</span></div>
            <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-prot" style="width: ${protPct}%;"></div></div>
          </div>

          <div class="ntr-tile">
            <div class="ntr-tile-accent acc-fat"></div>
            <div class="ntr-tile-top">
              <span class="ntr-tile-lbl">Fat</span>
              <span class="ntr-tile-pct">${fatPct}%</span>
            </div>
            <div class="ntr-tile-val">${totalFat.toFixed(1)} <span style="font-size:0.68rem; font-weight:700; color:#71717a;">g</span></div>
            <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-fat" style="width: ${fatPct}%;"></div></div>
          </div>

          <div class="ntr-tile">
            <div class="ntr-tile-accent acc-carb"></div>
            <div class="ntr-tile-top">
              <span class="ntr-tile-lbl">Carbs</span>
              <span class="ntr-tile-pct">${carbsPct}%</span>
            </div>
            <div class="ntr-tile-val">${totalCarbs.toFixed(1)} <span style="font-size:0.68rem; font-weight:700; color:#71717a;">g</span></div>
            <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-carb" style="width: ${carbsPct}%;"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. NUTRITION LOG CARD -->
    <div class="ntr-card">
      <div class="ntr-accordion-bar" id="toggle-table">
        <span class="ntr-accordion-title">Nutrition Log</span>
        <div style="display: flex; align-items: center;">
          <span class="ntr-accordion-cals">${totalCals.toFixed(1)} kcal</span>
          <span class="ntr-arrow ${dayData.tableOpen ? '' : 'closed'}">▼</span>
        </div>
      </div>
      <div style="display: ${dayData.tableOpen ? 'block' : 'none'};">
        <div class="ntr-action-bar">
          <button class="ntr-btn-tool" id="btn-open-modal">🔍 Log Food</button>
          <button class="ntr-btn-tool" id="btn-open-meal-builder" style="background:#1e1b4b; border-color:#4338ca; color:#c7d2fe;">🍱 Combine Meal</button>
          <button class="ntr-btn-tool" id="btn-copy-yesterday" style="background:#172554; border-color:#1d4ed8; color:#bae6fd;">📋 Copy Yesterday</button>
          <button class="ntr-btn-tool" id="btn-open-barcode" style="background:#064e3b; border-color:#059669; color:#a7f3d0;">📷 Scan Barcode</button>
          <button class="ntr-btn-tool" id="btn-open-custom-food" style="background:#3b2308; border-color:#d97706; color:#fde68a;">✨ Save Food</button>
        </div>

        <div class="ntr-list-head">
          <div>Food</div>
          <div>Serving</div>
          <div style="border-left: 2px solid #f59e0b; padding-left: 8px;">Calories</div>
          <div style="border-left: 2px solid #10b981; padding-left: 8px;">Protein</div>
          <div style="border-left: 2px solid #ef4444; padding-left: 8px;">Fat</div>
          <div style="border-left: 2px solid #0ea5e9; padding-left: 8px;">Carbs</div>
          <div></div>
        </div>
        <div>
          ${rowsHtml || `<div style="text-align:center; padding: 14px; color:#52525b; font-size:0.75rem;">No foods logged yet today</div>`}
        </div>
      </div>
    </div>

    <!-- 4. EDIT GOALS MODAL -->
    <div class="ntr-modal-overlay" id="goals-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>🎯 Edit Nutrition Targets</span><button class="ntr-del-btn" id="btn-close-goals-x">✕</button></div>
        <div style="font-size:0.75rem; color:#a1a1aa; margin-bottom:12px;">Set your daily caloric and macronutrient targets.</div>
        
        <div class="ntr-macro-input-grid">
          <div>
            <div class="ntr-mini-lbl">Calories</div>
            <input type="number" class="ntr-mini-inp" id="inp-goal-cals" value="${dayData.goals.cals}" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Protein (g)</div>
            <input type="number" class="ntr-mini-inp" id="inp-goal-p" value="${dayData.goals.protein}" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Fat (g)</div>
            <input type="number" class="ntr-mini-inp" id="inp-goal-f" value="${dayData.goals.fat}" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Carbs (g)</div>
            <input type="number" class="ntr-mini-inp" id="inp-goal-c" value="${dayData.goals.carbs}" />
          </div>
        </div>

        <div style="margin-bottom:12px;">
          <div class="ntr-mini-lbl">Water Target (ml)</div>
          <input type="number" class="ntr-modal-input" id="inp-goal-water" value="${dayData.goals.water || 3500}" />
        </div>

        <label style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:#cbd5e1; margin-bottom:14px; cursor:pointer;">
          <input type="checkbox" id="chk-save-default-goals" checked /> Set as default for all new days
        </label>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button id="btn-close-goals-modal" style="padding:6px 14px; background:#27272a; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:700;">Cancel</button>
          <button id="btn-save-goals" style="padding:6px 16px; background:#2563eb; border:none; color:#fff; border-radius:8px; font-weight:800; cursor:pointer;">Save Targets</button>
        </div>
      </div>
    </div>

    <!-- 5. ADD FOOD MODAL -->
    <div class="ntr-modal-overlay" id="ntr-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>Log Food Item</span><button class="ntr-del-btn" id="btn-close-log-x">✕</button></div>
        <input type="text" class="ntr-modal-input" id="ntr-search-food" placeholder="🔍 Search library (Eggs, Rice, Tuna...)" />
        <div class="ntr-search-results" id="ntr-search-res"></div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px; margin: 8px 0 4px 0;">
          <input type="text" class="ntr-modal-input" id="ntr-custom-name" placeholder="Food Name" />
          <select class="ntr-modal-input" id="ntr-custom-meal">
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>
        </div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px;">
          <input type="text" class="ntr-modal-input" id="ntr-custom-serv" placeholder="Serving Size (e.g. 100)" />
          <input type="text" class="ntr-modal-input" id="ntr-custom-unit" placeholder="Unit (g/ml)" value="g" />
        </div>

        <div class="ntr-macro-input-grid">
          <div>
            <div class="ntr-mini-lbl">Calories</div>
            <input type="number" class="ntr-mini-inp" id="ntr-in-cals" placeholder="0" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Protein (g)</div>
            <input type="number" class="ntr-mini-inp" id="ntr-in-p" placeholder="0" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Fat (g)</div>
            <input type="number" class="ntr-mini-inp" id="ntr-in-f" placeholder="0" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Carbs (g)</div>
            <input type="number" class="ntr-mini-inp" id="ntr-in-c" placeholder="0" />
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top: 10px;">
          <button id="btn-close-ntr-modal" style="padding:6px 14px; background:#27272a; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:700;">Cancel</button>
          <button id="btn-save-ntr-food" style="padding:6px 16px; background:#2563eb; border:none; color:#fff; border-radius:8px; font-weight:800; cursor:pointer;">+ Log Item</button>
        </div>
      </div>
    </div>

    <!-- 6. PERMANENT CUSTOM FOOD CREATOR MODAL -->
    <div class="ntr-modal-overlay" id="custom-food-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>✨ Save Custom Food to Library</span><button class="ntr-del-btn" id="btn-close-cf-x">✕</button></div>
        <div style="font-size:0.75rem; color:#a1a1aa; margin-bottom:10px;">Values per standard serving (e.g. 100g or 1 bottle)</div>
        
        <input type="text" class="ntr-modal-input" id="cf-name" placeholder="Food Name (e.g. Soummam 0%)" />
        
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px;">
          <input type="number" class="ntr-modal-input" id="cf-serving" placeholder="Serving Base" value="100" />
          <input type="text" class="ntr-modal-input" id="cf-unit" placeholder="Unit (g/ml)" value="g" />
        </div>

        <div class="ntr-macro-input-grid">
          <div>
            <div class="ntr-mini-lbl">Calories</div>
            <input type="number" class="ntr-mini-inp" id="cf-cals" placeholder="100" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Protein (g)</div>
            <input type="number" class="ntr-mini-inp" id="cf-p" placeholder="10" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Fat (g)</div>
            <input type="number" class="ntr-mini-inp" id="cf-f" placeholder="2" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Carbs (g)</div>
            <input type="number" class="ntr-mini-inp" id="cf-c" placeholder="15" />
          </div>
        </div>

        <label style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:#cbd5e1; margin-bottom:12px; cursor:pointer;">
          <input type="checkbox" id="cf-auto-log" checked /> Also log this to today's diary immediately
        </label>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button id="btn-close-cf-modal" style="padding:6px 14px; background:#27272a; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:700;">Cancel</button>
          <button id="btn-save-permanent-cf" style="padding:6px 16px; background:#d97706; border:none; color:#fff; border-radius:8px; font-weight:800; cursor:pointer;">Save Food</button>
        </div>
      </div>
    </div>

    <!-- 7. MEAL BUILDER & COMBINER MODAL -->
    <div class="ntr-modal-overlay" id="meal-builder-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>🍱 Combine Foods / Meal Builder</span><button class="ntr-del-btn" id="btn-close-mb-x">✕</button></div>
        
        <input type="text" class="ntr-modal-input" id="mb-meal-name" placeholder="Meal Name (e.g. Tuna Pasta Bowl)" />
        
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px; margin-bottom:8px;">
          <select class="ntr-modal-input" id="mb-select-food" style="margin-bottom:0;"></select>
          <input type="number" class="ntr-modal-input" id="mb-add-qty" placeholder="Grams" value="100" style="margin-bottom:0;" />
        </div>
        <button id="btn-mb-add-item" style="width:100%; background:#27272a; color:#cbd5e1; border:1px solid #3f3f46; border-radius:6px; padding:6px; font-weight:700; font-size:0.75rem; cursor:pointer; margin-bottom:10px;">+ Add Ingredient to Meal</button>

        <div style="font-size:0.72rem; font-weight:800; color:#94a3b8; text-transform:uppercase; margin-bottom:6px;">Current Ingredients</div>
        <div id="mb-ingredients-list" style="max-height:120px; overflow-y:auto; margin-bottom:10px; border:1px solid #27272a; border-radius:8px; padding:6px; background:#202023;"></div>

        <div style="background:#131316; border:1px solid #27272a; border-radius:8px; padding:8px 10px; margin-bottom:12px;">
          <div style="font-size:0.7rem; font-weight:800; color:#71717a; margin-bottom:4px;">COMBINED TOTALS</div>
          <div id="mb-totals-display" style="display:flex; justify-content:space-between; font-size:0.78rem; font-weight:800;">
            <span style="color:#f59e0b;">0 kcal</span>
            <span style="color:#10b981;">P: 0g</span>
            <span style="color:#ef4444;">F: 0g</span>
            <span style="color:#0ea5e9;">C: 0g</span>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button id="btn-close-mb-modal" style="padding:6px 14px; background:#27272a; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:700;">Cancel</button>
          <button id="btn-mb-log-meal" style="padding:6px 16px; background:#4338ca; border:none; color:#fff; border-radius:8px; font-weight:800; cursor:pointer;">Log Combined Meal</button>
        </div>
      </div>
    </div>

    <!-- 8. BARCODE SCANNER & OPEN FOOD FACTS MODAL -->
    <div class="ntr-modal-overlay" id="barcode-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>📷 Barcode Product Scanner</span><button class="ntr-del-btn" id="btn-close-bc-x">✕</button></div>
        <div style="font-size:0.75rem; color:#a1a1aa; margin-bottom:8px;">Scan product barcode with camera or enter the number below (Algerian & Global OpenFoodFacts DB).</div>

        <video id="bc-video" class="ntr-video-feed" playsinline></video>
        <div id="bc-status" style="font-size:0.72rem; color:#38bdf8; text-align:center; margin-bottom:8px; font-weight:700;">Point camera at barcode...</div>

        <div style="display:flex; gap:6px; margin-bottom:10px;">
          <input type="text" class="ntr-modal-input" id="bc-manual-input" placeholder="e.g. 6130123456789" style="margin-bottom:0;" />
          <button id="btn-bc-fetch" style="background:#059669; color:#fff; border:none; border-radius:8px; padding:0 14px; font-weight:800; font-size:0.75rem; cursor:pointer;">Lookup</button>
        </div>

        <div id="bc-result-preview" style="display:none; background:#202023; border:1px solid #059669; border-radius:8px; padding:10px; margin-bottom:10px;">
          <div id="bc-prod-name" style="font-weight:800; font-size:0.85rem; color:#fff;"></div>
          <div id="bc-prod-macros" style="font-size:0.75rem; color:#a1a1aa; margin-top:4px;"></div>
          <button id="btn-bc-use-prod" style="width:100%; background:#059669; color:#fff; border:none; border-radius:6px; padding:8px; font-weight:800; font-size:0.78rem; margin-top:8px; cursor:pointer;">Use This Product</button>
        </div>

        <div style="display:flex; justify-content:flex-end;">
          <button id="btn-close-bc-modal" style="padding:6px 14px; background:#27272a; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:700;">Close</button>
        </div>
      </div>
    </div>
  `;

  // Water controls
  container.querySelector("#w-plus-250").onclick = async () => {
    dayData.water = (dayData.water || 0) + 250;
    await saveNutrition();
    renderMacroTracker();
  };
  container.querySelector("#w-plus-500").onclick = async () => {
    dayData.water = (dayData.water || 0) + 500;
    await saveNutrition();
    renderMacroTracker();
  };
  container.querySelector("#w-reset").onclick = async () => {
    dayData.water = 0;
    await saveNutrition();
    renderMacroTracker();
  };

  // Copy yesterday
  container.querySelector("#btn-copy-yesterday").onclick = async () => {
    let parsedD = new Date(noteDateKey);
    if (isNaN(parsedD.getTime())) parsedD = new Date();
    parsedD.setDate(parsedD.getDate() - 1);
    const yesterdayKey = parsedD.toISOString().slice(0, 10);
    const prevEntry = nutritionDB[yesterdayKey];

    if (prevEntry && prevEntry.items && prevEntry.items.length > 0) {
      const cloned = JSON.parse(JSON.stringify(prevEntry.items));
      dayData.items.push(...cloned);
      await saveNutrition();
      renderMacroTracker();
    } else {
      alert(`No logged foods found for yesterday (${yesterdayKey}).`);
    }
  };

  // Goals modal
  const goalsModal = container.querySelector("#goals-modal");
  container.querySelector("#btn-open-goals-modal").onclick = () => { goalsModal.style.display = "flex"; };
  container.querySelector("#btn-close-goals-modal").onclick = () => { goalsModal.style.display = "none"; };
  container.querySelector("#btn-close-goals-x").onclick = () => { goalsModal.style.display = "none"; };

  container.querySelector("#btn-save-goals").onclick = async () => {
    const newGoals = {
      cals: parseFloat(container.querySelector("#inp-goal-cals").value) || defaultGoals.cals,
      protein: parseFloat(container.querySelector("#inp-goal-p").value) || defaultGoals.protein,
      fat: parseFloat(container.querySelector("#inp-goal-f").value) || defaultGoals.fat,
      carbs: parseFloat(container.querySelector("#inp-goal-c").value) || defaultGoals.carbs,
      water: parseFloat(container.querySelector("#inp-goal-water").value) || 3500
    };
    dayData.goals = newGoals;

    if (container.querySelector("#chk-save-default-goals").checked) {
      nutritionDB.__defaultGoals = { ...newGoals };
    }

    await saveNutrition();
    goalsModal.style.display = "none";
    renderMacroTracker();
  };

  // Accordion toggles
  container.querySelector("#toggle-analytics").onclick = async () => {
    dayData.analyticsOpen = !dayData.analyticsOpen;
    await saveNutrition();
    renderMacroTracker();
  };
  container.querySelector("#toggle-summary").onclick = async () => {
    dayData.summaryOpen = !dayData.summaryOpen;
    await saveNutrition();
    renderMacroTracker();
  };
  container.querySelector("#toggle-table").onclick = async () => {
    dayData.tableOpen = !dayData.tableOpen;
    await saveNutrition();
    renderMacroTracker();
  };

  // Delete handlers
  container.querySelectorAll(".ntr-del-btn").forEach(btn => {
    btn.onclick = async () => {
      const idx = parseInt(btn.dataset.idx, 10);
      if (!isNaN(idx)) {
        dayData.items.splice(idx, 1);
        await saveNutrition();
        renderMacroTracker();
      }
    };
  });

  // Log food modal
  const logModal = container.querySelector("#ntr-modal");
  const searchInp = container.querySelector("#ntr-search-food");
  const searchRes = container.querySelector("#ntr-search-res");
  const servInp = container.querySelector("#ntr-custom-serv");
  const unitInp = container.querySelector("#ntr-custom-unit");
  let selectedFoodRef = null;

  function renderSearchList(query) {
    const q = (query || "").toLowerCase();
    const filtered = foodLibrary.filter(f => f.name.toLowerCase().includes(q));
    
    searchRes.innerHTML = filtered.map(f => `
      <div class="ntr-search-item" data-name="${f.name}">
        <div style="font-weight:700; color:#ffffff; font-size:0.8rem;">${f.name} <span style="color:#71717a; font-size:0.7rem;">(${f.serving} ${f.unit || 'g'})</span></div>
        <div style="font-size:0.68rem; color:#a1a1aa;">${f.cals} kcal • P: ${f.p}g | F: ${f.f}g | C: ${f.c}g</div>
      </div>
    `).join("");

    searchRes.querySelectorAll(".ntr-search-item").forEach(item => {
      item.onclick = () => {
        const found = foodLibrary.find(f => f.name === item.dataset.name);
        if (found) {
          selectedFoodRef = found;
          container.querySelector("#ntr-custom-name").value = found.name;
          servInp.value = found.serving;
          unitInp.value = found.unit || "g";
          updateScaledNutrients(found.serving, found);
        }
      };
    });
  }

  function updateScaledNutrients(enteredQty, baseFood) {
    if (!baseFood) return;
    const qty = parseFloat(enteredQty) || baseFood.serving;
    const ratio = qty / baseFood.serving;

    container.querySelector("#ntr-in-cals").value = Math.round(baseFood.cals * ratio * 10) / 10;
    container.querySelector("#ntr-in-p").value = Math.round(baseFood.p * ratio * 10) / 10;
    container.querySelector("#ntr-in-f").value = Math.round(baseFood.f * ratio * 10) / 10;
    container.querySelector("#ntr-in-c").value = Math.round(baseFood.c * ratio * 10) / 10;
  }

  servInp.oninput = () => {
    if (selectedFoodRef) updateScaledNutrients(servInp.value, selectedFoodRef);
  };

  container.querySelector("#btn-open-modal").onclick = () => {
    logModal.style.display = "flex";
    searchInp.value = "";
    selectedFoodRef = null;
    renderSearchList("");
    container.querySelector("#ntr-custom-name").value = "";
    servInp.value = "100";
    unitInp.value = "g";
    container.querySelector("#ntr-in-cals").value = "";
    container.querySelector("#ntr-in-p").value = "";
    container.querySelector("#ntr-in-f").value = "";
    container.querySelector("#ntr-in-c").value = "";
    searchInp.focus();
  };

  searchInp.oninput = () => renderSearchList(searchInp.value);
  container.querySelector("#btn-close-ntr-modal").onclick = () => { logModal.style.display = "none"; };
  container.querySelector("#btn-close-log-x").onclick = () => { logModal.style.display = "none"; };

  container.querySelector("#btn-save-ntr-food").onclick = async () => {
    const name = container.querySelector("#ntr-custom-name").value.trim() || "Food Item";
    const meal = container.querySelector("#ntr-custom-meal").value;
    const serv = `${servInp.value.trim() || "100"} ${unitInp.value.trim() || "g"}`;
    const cals = parseFloat(container.querySelector("#ntr-in-cals").value) || 0;
    const p = parseFloat(container.querySelector("#ntr-in-p").value) || 0;
    const f = parseFloat(container.querySelector("#ntr-in-f").value) || 0;
    const c = parseFloat(container.querySelector("#ntr-in-c").value) || 0;

    dayData.items.push({ name, meal, serving: serv, cals, p, f, c });
    await saveNutrition();
    logModal.style.display = "none";
    renderMacroTracker();
  };

  // Custom food modal
  const cfModal = container.querySelector("#custom-food-modal");
  container.querySelector("#btn-open-custom-food").onclick = () => {
    cfModal.style.display = "flex";
    container.querySelector("#cf-name").value = "";
    container.querySelector("#cf-serving").value = "100";
    container.querySelector("#cf-unit").value = "g";
    container.querySelector("#cf-cals").value = "";
    container.querySelector("#cf-p").value = "";
    container.querySelector("#cf-f").value = "";
    container.querySelector("#cf-c").value = "";
    container.querySelector("#cf-name").focus();
  };
  container.querySelector("#btn-close-cf-modal").onclick = () => { cfModal.style.display = "none"; };
  container.querySelector("#btn-close-cf-x").onclick = () => { cfModal.style.display = "none"; };

  container.querySelector("#btn-save-permanent-cf").onclick = async () => {
    const name = container.querySelector("#cf-name").value.trim();
    if (!name) return;

    const serv = parseFloat(container.querySelector("#cf-serving").value) || 100;
    const unit = container.querySelector("#cf-unit").value.trim() || "g";
    const cals = parseFloat(container.querySelector("#cf-cals").value) || 0;
    const p = parseFloat(container.querySelector("#cf-p").value) || 0;
    const f = parseFloat(container.querySelector("#cf-f").value) || 0;
    const c = parseFloat(container.querySelector("#cf-c").value) || 0;
    const autoLog = container.querySelector("#cf-auto-log").checked;

    const newFood = { name, serving: serv, unit, cals, p, f, c };
    customFoods.push(newFood);
    await saveCustomFoods();

    if (autoLog) {
      dayData.items.push({ name, meal: "Snack", serving: `${serv} ${unit}`, cals, p, f, c });
      await saveNutrition();
    }

    cfModal.style.display = "none";
    renderMacroTracker();
  };

  // Meal builder modal
  const mbModal = container.querySelector("#meal-builder-modal");
  const mbSelect = container.querySelector("#mb-select-food");
  const mbQtyInp = container.querySelector("#mb-add-qty");
  const mbIngList = container.querySelector("#mb-ingredients-list");
  const mbTotalsDisp = container.querySelector("#mb-totals-display");
  let activeMealIngredients = [];

  function updateMealTotals() {
    let totCals = 0, totP = 0, totF = 0, totC = 0;
    mbIngList.innerHTML = activeMealIngredients.map((ing, idx) => {
      totCals += ing.cals; totP += ing.p; totF += ing.f; totC += ing.c;
      return `
        <div class="ntr-meal-ing-row">
          <div style="font-size:0.75rem; font-weight:700; color:#fff;">${ing.name} <span style="color:#a1a1aa;">(${ing.qty}g)</span></div>
          <div style="font-size:0.72rem; color:#f59e0b; text-align:right;">${ing.cals.toFixed(0)} kcal</div>
          <button class="ntr-del-btn btn-del-ing" data-idx="${idx}">✕</button>
        </div>
      `;
    }).join("");

    if (activeMealIngredients.length === 0) {
      mbIngList.innerHTML = '<div style="color:#71717a; font-size:0.72rem; text-align:center;">No ingredients added yet</div>';
    }

    mbTotalsDisp.innerHTML = `
      <span style="color:#f59e0b;">${totCals.toFixed(1)} kcal</span>
      <span style="color:#10b981;">P: ${totP.toFixed(1)}g</span>
      <span style="color:#ef4444;">F: ${totF.toFixed(1)}g</span>
      <span style="color:#0ea5e9;">C: ${totC.toFixed(1)}g</span>
    `;

    mbIngList.querySelectorAll(".btn-del-ing").forEach(b => {
      b.onclick = () => {
        activeMealIngredients.splice(parseInt(b.dataset.idx, 10), 1);
        updateMealTotals();
      };
    });
  }

  container.querySelector("#btn-open-meal-builder").onclick = () => {
    mbModal.style.display = "flex";
    activeMealIngredients = [];
    mbSelect.innerHTML = foodLibrary.map(f => `<option value="${f.name}">${f.name}</option>`).join("");
    updateMealTotals();
  };
  container.querySelector("#btn-close-mb-modal").onclick = () => { mbModal.style.display = "none"; };
  container.querySelector("#btn-close-mb-x").onclick = () => { mbModal.style.display = "none"; };

  container.querySelector("#btn-mb-add-item").onclick = () => {
    const selectedName = mbSelect.value;
    const food = foodLibrary.find(f => f.name === selectedName);
    const qty = parseFloat(mbQtyInp.value) || 100;

    if (food) {
      const ratio = qty / food.serving;
      activeMealIngredients.push({
        name: food.name,
        qty: qty,
        cals: Math.round(food.cals * ratio * 10) / 10,
        p: Math.round(food.p * ratio * 10) / 10,
        f: Math.round(food.f * ratio * 10) / 10,
        c: Math.round(food.c * ratio * 10) / 10
      });
      updateMealTotals();
    }
  };

  container.querySelector("#btn-mb-log-meal").onclick = async () => {
    if (activeMealIngredients.length === 0) return;
    const mealName = container.querySelector("#mb-meal-name").value.trim() || "Combined Meal";
    let totCals = 0, totP = 0, totF = 0, totC = 0, totGrams = 0;

    activeMealIngredients.forEach(i => {
      totCals += i.cals; totP += i.p; totF += i.f; totC += i.c; totGrams += i.qty;
    });

    dayData.items.push({
      name: mealName,
      meal: "Meal Combo",
      serving: `${totGrams} g`,
      cals: Math.round(totCals * 10) / 10,
      p: Math.round(totP * 10) / 10,
      f: Math.round(totF * 10) / 10,
      c: Math.round(totC * 10) / 10
    });

    await saveNutrition();
    mbModal.style.display = "none";
    renderMacroTracker();
  };

  // Barcode scanner modal
  const bcModal = container.querySelector("#barcode-modal");
  const bcVideo = container.querySelector("#bc-video");
  const bcStatus = container.querySelector("#bc-status");
  const bcManualInp = container.querySelector("#bc-manual-input");
  const bcPreview = container.querySelector("#bc-result-preview");
  const bcProdName = container.querySelector("#bc-prod-name");
  const bcProdMacros = container.querySelector("#bc-prod-macros");
  const btnBcUse = container.querySelector("#btn-bc-use-prod");

  let videoStream = null;
  let scanInterval = null;
  let scannedProductData = null;

  async function fetchOpenFoodFacts(barcode) {
    bcStatus.textContent = `Fetching product info (${barcode})...`;
    try {
      const resp = await fetch(`[https://world.openfoodfacts.org/api/v0/product/$](https://world.openfoodfacts.org/api/v0/product/$){barcode}.json`);
      const data = await resp.json();

      if (data.status === 1 && data.product) {
        const prod = data.product;
        const name = prod.product_name || prod.product_name_fr || prod.product_name_en || "Imported Product";
        const nutriments = prod.nutriments || {};

        const cals = nutriments["energy-kcal_100g"] || nutriments["energy-kcal"] || Math.round((nutriments["energy_100g"] || 0) / 4.184) || 0;
        const p = nutriments.proteins_100g || nutriments.proteins || 0;
        const f = nutriments.fat_100g || nutriments.fat || 0;
        const c = nutriments.carbohydrates_100g || nutriments.carbohydrates || 0;

        scannedProductData = {
          name: name,
          serving: 100,
          unit: "g",
          cals: Math.round(cals * 10) / 10,
          p: Math.round(p * 10) / 10,
          f: Math.round(f * 10) / 10,
          c: Math.round(c * 10) / 10
        };

        bcProdName.textContent = `✅ ${name}`;
        bcProdMacros.textContent = `Per 100g: ${scannedProductData.cals} kcal | P: ${scannedProductData.p}g | F: ${scannedProductData.f}g | C: ${scannedProductData.c}g`;
        bcPreview.style.display = "block";
        bcStatus.textContent = "Product identified successfully!";
        stopCamera();
      } else {
        bcStatus.textContent = "❌ Product not found in database. Try manual entry.";
      }
    } catch (err) {
      bcStatus.textContent = "❌ Network error connecting to Open Food Facts.";
    }
  }

  async function startCamera() {
    scannedProductData = null;
    bcPreview.style.display = "none";
    bcStatus.textContent = "Starting camera feed...";
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      bcVideo.srcObject = videoStream;
      await bcVideo.play();
      bcStatus.textContent = "Camera active. Hold barcode in frame.";

      if ('BarcodeDetector' in window) {
        const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'qr_code'] });
        scanInterval = setInterval(async () => {
          try {
            const barcodes = await detector.detect(bcVideo);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              clearInterval(scanInterval);
              bcManualInp.value = code;
              await fetchOpenFoodFacts(code);
            }
          } catch (e) {}
        }, 600);
      } else {
        bcStatus.textContent = "Camera active. (Enter barcode below if scanner is unsupported)";
      }
    } catch (e) {
      bcStatus.textContent = "Camera unavailable. Enter barcode manually:";
    }
  }

  function stopCamera() {
    if (scanInterval) clearInterval(scanInterval);
    if (videoStream) {
      videoStream.getTracks().forEach(t => t.stop());
      videoStream = null;
    }
  }

  container.querySelector("#btn-open-barcode").onclick = () => {
    bcModal.style.display = "flex";
    bcManualInp.value = "";
    startCamera();
  };

  container.querySelector("#btn-close-bc-modal").onclick = () => { stopCamera(); bcModal.style.display = "none"; };
  container.querySelector("#btn-close-bc-x").onclick = () => { stopCamera(); bcModal.style.display = "none"; };
  container.querySelector("#btn-bc-fetch").onclick = () => {
    const code = bcManualInp.value.trim();
    if (code) fetchOpenFoodFacts(code);
  };

  btnBcUse.onclick = () => {
    if (!scannedProductData) return;
    stopCamera();
    bcModal.style.display = "none";
    cfModal.style.display = "flex";

    container.querySelector("#cf-name").value = scannedProductData.name;
    container.querySelector("#cf-serving").value = scannedProductData.serving;
    container.querySelector("#cf-unit").value = scannedProductData.unit;
    container.querySelector("#cf-cals").value = scannedProductData.cals;
    container.querySelector("#cf-p").value = scannedProductData.p;
    container.querySelector("#cf-f").value = scannedProductData.f;
    container.querySelector("#cf-c").value = scannedProductData.c;
  };
}

renderMacroTracker();

} catch (err) {
  dv.paragraph("❌ **Macro Tracker Execution Error:** " + err.message);
}
}
initUnifiedMacroTracker();