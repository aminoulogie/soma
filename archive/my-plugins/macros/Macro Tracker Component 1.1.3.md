---
calories_consumed: 629
protein_grams: 27
carbs_grams: 11
fat_grams: 53
water_ml: 1000
---
```dataviewjs
async function initDailyMacroTracker() {
try {
// ============================================================================
// 1. DATA SOURCE & SAFE DATE EXTRACTION
// ============================================================================
const nutritionFilePath = "apps/scripts/soma-nutrition.json";
const customFoodsFilePath = "apps/scripts/custom-foods.json";
const savedMealsFilePath = "apps/scripts/saved-meals.json";
const historyFilePath = "apps/scripts/soma-history.json";

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

// Base food library preloaded with essential micronutrients
const baseFoodLibrary = [
  { name: "Whole Eggs", serving: 100, unit: "g", cals: 143, p: 13.0, c: 0.7, f: 9.9, fiber: 0, sodium: 142, potassium: 138, calcium: 56, iron: 1.8, magnesium: 12, zinc: 1.3, isBase: true },
  { name: "Chicken Breast (Cooked)", serving: 100, unit: "g", cals: 165, p: 31.0, c: 0.0, f: 3.6, fiber: 0, sodium: 74, potassium: 256, calcium: 15, iron: 1.0, magnesium: 29, zinc: 1.0, isBase: true },
  { name: "White Rice (Cooked)", serving: 150, unit: "g", cals: 195, p: 4.1, c: 43.0, f: 0.4, fiber: 0.6, sodium: 1, potassium: 55, calcium: 16, iron: 1.8, magnesium: 19, zinc: 0.8, isBase: true },
  { name: "Egg Whites", serving: 100, unit: "g", cals: 52, p: 11.0, c: 0.7, f: 0.2, fiber: 0, sodium: 166, potassium: 163, calcium: 7, iron: 0.1, magnesium: 11, zinc: 0.0, isBase: true },
  { name: "Oatmeal (Dry)", serving: 50, unit: "g", cals: 190, p: 6.5, c: 34.0, f: 3.5, fiber: 5.0, sodium: 2, potassium: 180, calcium: 26, iron: 2.1, magnesium: 69, zinc: 1.5, isBase: true },
  { name: "Whey Protein Isolate", serving: 30, unit: "g", cals: 120, p: 25.0, c: 1.5, f: 1.0, fiber: 0, sodium: 140, potassium: 160, calcium: 130, iron: 0.4, magnesium: 20, zinc: 0.5, isBase: true },
  { name: "Greek / Plain Yogurt", serving: 150, unit: "g", cals: 90, p: 15.0, c: 5.0, f: 0.5, fiber: 0, sodium: 55, potassium: 210, calcium: 165, iron: 0.1, magnesium: 17, zinc: 0.9, isBase: true },
  { name: "Canned Tuna (Drained)", serving: 120, unit: "g", cals: 130, p: 29.0, c: 0.0, f: 1.0, fiber: 0, sodium: 380, potassium: 280, calcium: 12, iron: 1.6, magnesium: 34, zinc: 0.9, isBase: true },
  { name: "Pasta (Dry)", serving: 80, unit: "g", cals: 280, p: 10.0, c: 58.0, f: 1.2, fiber: 2.5, sodium: 5, potassium: 180, calcium: 18, iron: 1.4, magnesium: 42, zinc: 1.1, isBase: true },
  { name: "Olive Oil", serving: 14, unit: "g", cals: 120, p: 0.0, c: 0.0, f: 14.0, fiber: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0.1, magnesium: 0, zinc: 0.0, isBase: true },
  { name: "Peanut Butter", serving: 32, unit: "g", cals: 190, p: 8.0, c: 7.0, f: 16.0, fiber: 2.0, sodium: 140, potassium: 210, calcium: 14, iron: 0.6, magnesium: 54, zinc: 0.9, isBase: true },
  { name: "Banana", serving: 118, unit: "g", cals: 105, p: 1.3, c: 27.0, f: 0.3, fiber: 3.1, sodium: 1, potassium: 422, calcium: 6, iron: 0.3, magnesium: 32, zinc: 0.2, isBase: true }
];

let foodLibrary = [...baseFoodLibrary, ...customFoods];

const defaultGoals = {
  cals: 2400,
  protein: 160,
  carbs: 260,
  fat: 70,
  water: 3500,
  fiber: 35,
  calcium: 1000,
  iron: 18,
  magnesium: 400,
  potassium: 3500,
  sodium: 2300,
  zinc: 11
};

if (!nutritionDB[noteDateKey]) {
  nutritionDB[noteDateKey] = {
    goals: { ...(nutritionDB.__defaultGoals || defaultGoals) },
    summaryOpen: true,
    tableOpen: true,
    microOpen: false, // Hidden / collapsed by default
    water: 0,
    items: []
  };
}

const dayData = nutritionDB[noteDateKey];
if (!dayData.goals) dayData.goals = { ...(nutritionDB.__defaultGoals || defaultGoals) };
if (dayData.goals.water === undefined) dayData.goals.water = 3500;
if (dayData.goals.fiber === undefined) dayData.goals.fiber = 35;
if (dayData.goals.calcium === undefined) dayData.goals.calcium = 1000;
if (dayData.goals.iron === undefined) dayData.goals.iron = 18;
if (dayData.goals.magnesium === undefined) dayData.goals.magnesium = 400;
if (dayData.goals.potassium === undefined) dayData.goals.potassium = 3500;
if (dayData.goals.sodium === undefined) dayData.goals.sodium = 2300;
if (dayData.goals.zinc === undefined) dayData.goals.zinc = 11;

if (dayData.summaryOpen === undefined) dayData.summaryOpen = true;
if (dayData.tableOpen === undefined) dayData.tableOpen = true;
if (dayData.microOpen === undefined) dayData.microOpen = false;
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
// 2. UI STYLES
// ============================================================================
const macroRoot = dv.el("div", "", { cls: "ntr-root-container" });

const style = document.createElement("style");
style.textContent = `
  .ntr-root-container { max-width: 680px; margin: 0 auto; font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif); color: #f4f4f5; display: flex; flex-direction: column; gap: 8px; box-sizing: border-box; }
  .ntr-card { background: #18181b; border: 1px solid #27272a; border-radius: 10px; overflow: hidden; }
  
  /* MFP REMAINING CALORIE HERO BANNER */
  .ntr-mfp-banner { background: #131316; border: 1px solid #27272a; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
  .ntr-mfp-equation { display: flex; align-items: center; gap: 8px; font-size: 0.76rem; font-weight: 700; color: #a1a1aa; flex-wrap: wrap; }
  .ntr-mfp-unit { text-align: center; }
  .ntr-mfp-num { font-size: 1.05rem; font-weight: 800; color: #ffffff; }
  .ntr-mfp-sub { font-size: 0.62rem; text-transform: uppercase; color: #71717a; }
  .ntr-mfp-sym { font-size: 0.95rem; font-weight: 800; color: #52525b; margin: 0 2px; }
  .ntr-mfp-rem-box { background: #202023; border: 1px solid #2e2e34; padding: 6px 12px; border-radius: 8px; text-align: center; }
  .ntr-mfp-rem-val { font-size: 1.25rem; font-weight: 900; }
  
  .ntr-goals-widget { background: linear-gradient(145deg, #18181b, #202024); border: 1px solid #2e2e34; border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .ntr-goals-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ntr-goals-title { font-size: 0.72rem; font-weight: 800; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.06em; }
  .ntr-goal-pill { font-size: 0.74rem; font-weight: 800; padding: 2px 7px; border-radius: 6px; background: #27272a; display: inline-flex; align-items: center; gap: 4px; }
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

  .ntr-tiles-body { padding: 12px; background: #18181b; }
  .ntr-tiles-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .ntr-tile { background: #202023; border: 1px solid #2e2e32; border-radius: 8px; padding: 8px 10px; position: relative; overflow: hidden; }
  .ntr-tile-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 3.5px; }
  .ntr-tile-top { display: flex; justify-content: space-between; align-items: center; }
  .ntr-tile-lbl { font-size: 0.68rem; font-weight: 700; color: #a1a1aa; }
  .ntr-tile-pct { font-size: 0.65rem; font-weight: 800; }
  .ntr-tile-val { font-size: 0.95rem; font-weight: 800; color: #ffffff; margin-top: 3px; }
  .ntr-tile-sub { font-size: 0.66rem; font-weight: 800; margin-top: 2px; }
  .ntr-tile-bar-bg { height: 4px; background: #2e2e34; border-radius: 999px; overflow: hidden; margin-top: 6px; }
  .ntr-tile-bar-fill { height: 100%; border-radius: 999px; }

  .ntr-donut-card { display: flex; align-items: center; justify-content: space-around; background: #202023; border: 1px solid #2e2e32; border-radius: 8px; padding: 10px 14px; margin-top: 8px; }
  .ntr-donut-legend { display: flex; flex-direction: column; gap: 4px; font-size: 0.72rem; font-weight: 700; }
  .ntr-donut-legend-row { display: flex; align-items: center; gap: 6px; }
  .ntr-dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }

  /* MICRONUTRIENTS GRID */
  .ntr-micro-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 12px; background: #18181b; }
  .ntr-micro-card { background: #202023; border: 1px solid #2e2e32; border-radius: 8px; padding: 8px 10px; }
  .ntr-micro-head { display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; font-weight: 800; }
  .ntr-micro-bar-bg { height: 4px; background: #2e2e34; border-radius: 999px; overflow: hidden; margin-top: 6px; }
  .ntr-micro-bar-fill { height: 100%; border-radius: 999px; background: #a855f7; }

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
  .ntr-modal-box { background: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 18px; width: 92%; max-width: 490px; box-shadow: 0 16px 45px rgba(0,0,0,0.9); max-height: 90vh; overflow-y: auto; }
  .ntr-modal-title { font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
  .ntr-modal-input { width: 100%; height: 36px; background: #202023; border: 1px solid #2e2e32; color: #fff; border-radius: 8px; padding: 6px 10px; font-weight: 700; font-size: 0.82rem; box-sizing: border-box; outline: none; margin-bottom: 8px; }
  .ntr-search-results { max-height: 180px; overflow-y: auto; border: 1px solid #27272a; border-radius: 8px; background: #202023; margin-bottom: 10px; }
  .ntr-search-item { padding: 8px 10px; border-bottom: 1px solid #27272a; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
  .ntr-search-item:hover { background: #27272a; }

  .ntr-macro-input-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px; }
  .ntr-micro-input-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 12px; }
  .ntr-mini-lbl { font-size: 0.62rem; font-weight: 800; color: #71717a; text-transform: uppercase; margin-bottom: 2px; }
  .ntr-mini-inp { width: 100%; height: 34px; background: #202023; border: 1px solid #2e2e32; color: #fff; border-radius: 6px; text-align: center; font-weight: 800; font-size: 0.8rem; box-sizing: border-box; }

  .ntr-meal-ing-row { display: grid; grid-template-columns: 2fr 1fr 24px; gap: 6px; align-items: center; margin-bottom: 6px; }
  .ntr-video-feed { width: 100%; height: 210px; background: #000; border-radius: 8px; object-fit: cover; margin-bottom: 8px; border: 1px solid #3f3f46; }
`;
macroRoot.appendChild(style);

// ============================================================================
// 3. UI RENDERING & LOGIC
// ============================================================================
const container = macroRoot.createDiv();

function renderMacroTracker() {
  let totalCals = 0, totalProtein = 0, totalCarbs = 0, totalFat = 0;
  let totalFiber = 0, totalCalcium = 0, totalIron = 0, totalMagnesium = 0, totalPotassium = 0, totalSodium = 0, totalZinc = 0;

  (dayData.items || []).forEach(item => {
    totalCals += (item.cals || 0);
    totalProtein += (item.p || 0);
    totalCarbs += (item.c || 0);
    totalFat += (item.f || 0);
    totalFiber += (item.fiber || 0);
    totalCalcium += (item.calcium || 0);
    totalIron += (item.iron || 0);
    totalMagnesium += (item.magnesium || 0);
    totalPotassium += (item.potassium || 0);
    totalSodium += (item.sodium || 0);
    totalZinc += (item.zinc || 0);
  });

  const effectiveGoalCals = dayData.goals.cals + exerciseCaloriesBurned;
  const remCals = effectiveGoalCals - totalCals;
  const remProtein = dayData.goals.protein - totalProtein;
  const remFat = dayData.goals.fat - totalFat;
  const remCarbs = dayData.goals.carbs - totalCarbs;

  const calsPct = Math.min(100, Math.round((totalCals / effectiveGoalCals) * 100));
  const protPct = Math.min(100, Math.round((totalProtein / dayData.goals.protein) * 100));
  const fatPct = Math.min(100, Math.round((totalFat / dayData.goals.fat) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbs / dayData.goals.carbs) * 100));

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

  // Micro items helper
  const microsList = [
    { name: "Fiber", cur: totalFiber, goal: dayData.goals.fiber || 35, unit: "g", color: "#10b981" },
    { name: "Calcium", cur: totalCalcium, goal: dayData.goals.calcium || 1000, unit: "mg", color: "#38bdf8" },
    { name: "Iron", cur: totalIron, goal: dayData.goals.iron || 18, unit: "mg", color: "#f87171" },
    { name: "Magnesium", cur: totalMagnesium, goal: dayData.goals.magnesium || 400, unit: "mg", color: "#a855f7" },
    { name: "Potassium", cur: totalPotassium, goal: dayData.goals.potassium || 3500, unit: "mg", color: "#fb923c" },
    { name: "Sodium", cur: totalSodium, goal: dayData.goals.sodium || 2300, unit: "mg", color: "#fbbf24", isLimit: true },
    { name: "Zinc", cur: totalZinc, goal: dayData.goals.zinc || 11, unit: "mg", color: "#34d399" }
  ];

  const microCardsHtml = microsList.map(m => {
    const pct = Math.min(100, Math.round((m.cur / m.goal) * 100));
    const left = m.goal - m.cur;
    const subText = m.isLimit
      ? (left >= 0 ? `${left.toFixed(0)}${m.unit} under limit` : `${Math.abs(left).toFixed(0)}${m.unit} over limit`)
      : (left > 0 ? `${left.toFixed(0)}${m.unit} left` : `Target reached ✅`);

    return `
      <div class="ntr-micro-card">
        <div class="ntr-micro-head">
          <span>${m.name}</span>
          <span style="color:${m.color};">${m.cur.toFixed(0)} / ${m.goal}${m.unit}</span>
        </div>
        <div class="ntr-micro-bar-bg"><div class="ntr-micro-bar-fill" style="width:${pct}%; background:${m.color};"></div></div>
        <div style="font-size:0.63rem; font-weight:700; color:#71717a; margin-top:3px; display:flex; justify-content:space-between;">
          <span>${pct}%</span>
          <span style="color:${left < 0 && m.isLimit ? '#ef4444' : '#a1a1aa'};">${subText}</span>
        </div>
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
    <!-- 0. CURRENT GOALS TOP WIDGET -->
    <div class="ntr-goals-widget">
      <div class="ntr-goals-info">
        <span class="ntr-goals-title">🎯 Daily Targets</span>
        <span class="ntr-goal-pill" style="color:#f59e0b;"><b style="color:#fff;">${dayData.goals.cals}</b> kcal ${exerciseCaloriesBurned > 0 ? `<span style="font-size:0.65rem; color:#34d399;">(+${exerciseCaloriesBurned})</span>` : ''}</span>
        <span class="ntr-goal-pill" style="color:#10b981;">P: <b style="color:#fff;">${dayData.goals.protein}g</b></span>
        <span class="ntr-goal-pill" style="color:#ef4444;">F: <b style="color:#fff;">${dayData.goals.fat}g</b></span>
        <span class="ntr-goal-pill" style="color:#0ea5e9;">C: <b style="color:#fff;">${dayData.goals.carbs}g</b></span>
      </div>
      <button class="ntr-btn-edit-goals" id="btn-open-goals-modal">⚙️ Targets & Micros</button>
    </div>

    <!-- MYFITNESSPAL HERO BANNER: REMAINING FORMULA -->
    <div class="ntr-mfp-banner">
      <div class="ntr-mfp-equation">
        <div class="ntr-mfp-unit">
          <div class="ntr-mfp-num">${dayData.goals.cals}</div>
          <div class="ntr-mfp-sub">Base Goal</div>
        </div>
        <span class="ntr-mfp-sym">−</span>
        <div class="ntr-mfp-unit">
          <div class="ntr-mfp-num" style="color:#f59e0b;">${Math.round(totalCals)}</div>
          <div class="ntr-mfp-sub">Food</div>
        </div>
        <span class="ntr-mfp-sym">+</span>
        <div class="ntr-mfp-unit">
          <div class="ntr-mfp-num" style="color:#34d399;">${Math.round(exerciseCaloriesBurned)}</div>
          <div class="ntr-mfp-sub">Exercise</div>
        </div>
        <span class="ntr-mfp-sym">=</span>
      </div>
      <div class="ntr-mfp-rem-box">
        <div class="ntr-mfp-rem-val" style="color:${remCals >= 0 ? '#34d399' : '#ef4444'};">
          ${remCals >= 0 ? remCals.toFixed(0) : `+${Math.abs(remCals).toFixed(0)}`}
        </div>
        <div class="ntr-mfp-sub" style="font-weight:800; color:${remCals >= 0 ? '#34d399' : '#ef4444'};">
          ${remCals >= 0 ? 'Calories Remaining' : 'Calories Over'}
        </div>
      </div>
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

    <!-- 1. MACROS SUMMARY CARD (WITH MFP "HOW FAR I AM" COUNTER) -->
    <div class="ntr-card">
      <div class="ntr-accordion-bar" id="toggle-summary">
        <span class="ntr-accordion-title">Macros Summary & Ratio</span>
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
              <span class="ntr-tile-pct" style="color:#f59e0b;">${calsPct}%</span>
            </div>
            <div class="ntr-tile-val">${totalCals.toFixed(0)} <span style="font-size:0.65rem; color:#71717a;">kcal</span></div>
            <div class="ntr-tile-sub" style="color:${remCals >= 0 ? '#34d399' : '#ef4444'};">
              ${remCals >= 0 ? `${remCals.toFixed(0)} left` : `+${Math.abs(remCals).toFixed(0)} over`}
            </div>
            <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-cals" style="width: ${calsPct}%;"></div></div>
          </div>

          <div class="ntr-tile">
            <div class="ntr-tile-accent acc-prot"></div>
            <div class="ntr-tile-top">
              <span class="ntr-tile-lbl">Protein</span>
              <span class="ntr-tile-pct" style="color:#10b981;">${protPct}%</span>
            </div>
            <div class="ntr-tile-val">${totalProtein.toFixed(0)} <span style="font-size:0.65rem; color:#71717a;">/ ${dayData.goals.protein}g</span></div>
            <div class="ntr-tile-sub" style="color:${remProtein > 0 ? '#a1a1aa' : '#10b981'};">
              ${remProtein > 0 ? `${remProtein.toFixed(0)}g left` : `Goal Met ✅`}
            </div>
            <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-prot" style="width: ${protPct}%;"></div></div>
          </div>

          <div class="ntr-tile">
            <div class="ntr-tile-accent acc-fat"></div>
            <div class="ntr-tile-top">
              <span class="ntr-tile-lbl">Fat</span>
              <span class="ntr-tile-pct" style="color:#ef4444;">${fatPct}%</span>
            </div>
            <div class="ntr-tile-val">${totalFat.toFixed(0)} <span style="font-size:0.65rem; color:#71717a;">/ ${dayData.goals.fat}g</span></div>
            <div class="ntr-tile-sub" style="color:${remFat >= 0 ? '#a1a1aa' : '#ef4444'};">
              ${remFat >= 0 ? `${remFat.toFixed(0)}g left` : `+${Math.abs(remFat).toFixed(0)}g over`}
            </div>
            <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-fat" style="width: ${fatPct}%;"></div></div>
          </div>

          <div class="ntr-tile">
            <div class="ntr-tile-accent acc-carb"></div>
            <div class="ntr-tile-top">
              <span class="ntr-tile-lbl">Carbs</span>
              <span class="ntr-tile-pct" style="color:#0ea5e9;">${carbsPct}%</span>
            </div>
            <div class="ntr-tile-val">${totalCarbs.toFixed(0)} <span style="font-size:0.65rem; color:#71717a;">/ ${dayData.goals.carbs}g</span></div>
            <div class="ntr-tile-sub" style="color:${remCarbs >= 0 ? '#a1a1aa' : '#ef4444'};">
              ${remCarbs >= 0 ? `${remCarbs.toFixed(0)}g left` : `+${Math.abs(remCarbs).toFixed(0)}g over`}
            </div>
            <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-carb" style="width: ${carbsPct}%;"></div></div>
          </div>
        </div>

        <div class="ntr-donut-card">
          <div style="position:relative; width:58px; height:58px; display:flex; align-items:center; justify-content:center;">
            <svg width="58" height="58" viewBox="0 0 64 64" style="transform: rotate(-90deg);">
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

    <!-- 2. NUTRITION LOG CARD -->
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
          <button class="ntr-btn-tool" id="btn-open-modal">🔍 Search & Log</button>
          <button class="ntr-btn-tool" id="btn-open-food-library" style="background:#3b2308; border-color:#d97706; color:#fde68a;">📚 Food Library</button>
          <button class="ntr-btn-tool" id="btn-open-meal-builder" style="background:#1e1b4b; border-color:#4338ca; color:#c7d2fe;">🍱 Combine Meal</button>
          <button class="ntr-btn-tool" id="btn-copy-yesterday" style="background:#172554; border-color:#1d4ed8; color:#bae6fd;">📋 Copy Yesterday</button>
          <button class="ntr-btn-tool" id="btn-open-barcode" style="background:#064e3b; border-color:#059669; color:#a7f3d0;">📷 Scan Barcode</button>
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

    <!-- 3. MICRONUTRIENTS CARD (COLLAPSED / HIDDEN BY DEFAULT) -->
    <div class="ntr-card">
      <div class="ntr-accordion-bar" id="toggle-micro">
        <span class="ntr-accordion-title">🧪 Micronutrients & Minerals</span>
        <div style="display: flex; align-items: center;">
          <span class="ntr-accordion-cals" style="color:#a855f7;">${totalCalcium.toFixed(0)}mg Ca • ${totalIron.toFixed(1)}mg Fe</span>
          <span class="ntr-arrow ${dayData.microOpen ? '' : 'closed'}">▼</span>
        </div>
      </div>
      <div style="display: ${dayData.microOpen ? 'block' : 'none'};">
        <div class="ntr-micro-grid">${microCardsHtml}</div>
      </div>
    </div>

    <!-- 4. EDIT GOALS & MICROS MODAL -->
    <div class="ntr-modal-overlay" id="goals-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>🎯 Edit Nutrition & Micro Targets</span><button class="ntr-del-btn" id="btn-close-goals-x">✕</button></div>
        
        <div style="font-size:0.75rem; font-weight:800; color:#38bdf8; text-transform:uppercase; margin-bottom:6px;">Macronutrients & Water</div>
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

        <div style="font-size:0.75rem; font-weight:800; color:#a855f7; text-transform:uppercase; margin:10px 0 6px 0;">Micronutrients & Minerals Target</div>
        <div class="ntr-micro-input-grid">
          <div>
            <div class="ntr-mini-lbl">Fiber (g)</div>
            <input type="number" class="ntr-mini-inp" id="inp-goal-fiber" value="${dayData.goals.fiber || 35}" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Calcium (mg)</div>
            <input type="number" class="ntr-mini-inp" id="inp-goal-calcium" value="${dayData.goals.calcium || 1000}" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Iron (mg)</div>
            <input type="number" class="ntr-mini-inp" id="inp-goal-iron" value="${dayData.goals.iron || 18}" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Magnesium (mg)</div>
            <input type="number" class="ntr-mini-inp" id="inp-goal-magnesium" value="${dayData.goals.magnesium || 400}" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Potassium (mg)</div>
            <input type="number" class="ntr-mini-inp" id="inp-goal-potassium" value="${dayData.goals.potassium || 3500}" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Sodium Limit (mg)</div>
            <input type="number" class="ntr-mini-inp" id="inp-goal-sodium" value="${dayData.goals.sodium || 2300}" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Zinc (mg)</div>
            <input type="number" class="ntr-mini-inp" id="inp-goal-zinc" value="${dayData.goals.zinc || 11}" />
          </div>
        </div>

        <label style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:#cbd5e1; margin-bottom:14px; cursor:pointer;">
          <input type="checkbox" id="chk-save-default-goals" checked /> Set as default for all future days
        </label>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button id="btn-close-goals-modal" style="padding:6px 14px; background:#27272a; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:700;">Cancel</button>
          <button id="btn-save-goals" style="padding:6px 16px; background:#2563eb; border:none; color:#fff; border-radius:8px; font-weight:800; cursor:pointer;">Save Targets</button>
        </div>
      </div>
    </div>

    <!-- 5. ADD / LOG FOOD MODAL -->
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

        <div style="font-size:0.68rem; font-weight:800; color:#a1a1aa; text-transform:uppercase; margin:6px 0 3px 0;">Base Macros</div>
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

        <details style="margin-bottom:10px; cursor:pointer;">
          <summary style="font-size:0.75rem; font-weight:800; color:#a855f7; margin-bottom:6px;">+ Edit Micronutrients (Calcium, Iron...)</summary>
          <div class="ntr-micro-input-grid" style="margin-top:6px;">
            <div>
              <div class="ntr-mini-lbl">Fiber (g)</div>
              <input type="number" class="ntr-mini-inp" id="ntr-in-fiber" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Calcium (mg)</div>
              <input type="number" class="ntr-mini-inp" id="ntr-in-calcium" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Iron (mg)</div>
              <input type="number" class="ntr-mini-inp" id="ntr-in-iron" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Magnesium (mg)</div>
              <input type="number" class="ntr-mini-inp" id="ntr-in-magnesium" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Potassium (mg)</div>
              <input type="number" class="ntr-mini-inp" id="ntr-in-potassium" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Sodium (mg)</div>
              <input type="number" class="ntr-mini-inp" id="ntr-in-sodium" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Zinc (mg)</div>
              <input type="number" class="ntr-mini-inp" id="ntr-in-zinc" placeholder="0" />
            </div>
          </div>
        </details>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button id="btn-close-ntr-modal" style="padding:6px 14px; background:#27272a; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:700;">Cancel</button>
          <button id="btn-save-ntr-food" style="padding:6px 16px; background:#2563eb; border:none; color:#fff; border-radius:8px; font-weight:800; cursor:pointer;">+ Log Item</button>
        </div>
      </div>
    </div>

    <!-- 6. FOOD LIBRARY BROWSING & MANAGER MODAL -->
    <div class="ntr-modal-overlay" id="food-library-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title">
          <span>📚 Complete Food Library</span>
          <button class="ntr-del-btn" id="btn-close-lib-x">✕</button>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
          <input type="text" class="ntr-modal-input" id="lib-filter-input" placeholder="🔍 Search library..." style="margin-bottom:0;" />
          <button id="btn-lib-create-new" style="background:#d97706; color:#fff; border:none; border-radius:8px; padding:0 12px; font-weight:800; font-size:0.75rem; height:36px; white-space:nowrap; cursor:pointer;">+ New Food</button>
        </div>
        <div class="ntr-search-results" id="lib-foods-list" style="max-height:240px;"></div>
        <div style="display:flex; justify-content:flex-end; margin-top:8px;">
          <button id="btn-close-lib-modal" style="padding:6px 14px; background:#27272a; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:700;">Close</button>
        </div>
      </div>
    </div>

    <!-- 7. PERMANENT CUSTOM FOOD CREATOR MODAL -->
    <div class="ntr-modal-overlay" id="custom-food-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>✨ Save Custom Food to Library</span><button class="ntr-del-btn" id="btn-close-cf-x">✕</button></div>
        
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

        <details style="margin-bottom:12px; cursor:pointer;">
          <summary style="font-size:0.75rem; font-weight:800; color:#a855f7; margin-bottom:6px;">+ Add Micronutrients (per serving)</summary>
          <div class="ntr-micro-input-grid" style="margin-top:6px;">
            <div>
              <div class="ntr-mini-lbl">Fiber (g)</div>
              <input type="number" class="ntr-mini-inp" id="cf-fiber" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Calcium (mg)</div>
              <input type="number" class="ntr-mini-inp" id="cf-calcium" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Iron (mg)</div>
              <input type="number" class="ntr-mini-inp" id="cf-iron" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Magnesium (mg)</div>
              <input type="number" class="ntr-mini-inp" id="cf-magnesium" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Potassium (mg)</div>
              <input type="number" class="ntr-mini-inp" id="cf-potassium" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Sodium (mg)</div>
              <input type="number" class="ntr-mini-inp" id="cf-sodium" placeholder="0" />
            </div>
            <div>
              <div class="ntr-mini-lbl">Zinc (mg)</div>
              <input type="number" class="ntr-mini-inp" id="cf-zinc" placeholder="0" />
            </div>
          </div>
        </details>

        <label style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:#cbd5e1; margin-bottom:12px; cursor:pointer;">
          <input type="checkbox" id="cf-auto-log" checked /> Also log this to today's diary immediately
        </label>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button id="btn-close-cf-modal" style="padding:6px 14px; background:#27272a; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:700;">Cancel</button>
          <button id="btn-save-permanent-cf" style="padding:6px 16px; background:#d97706; border:none; color:#fff; border-radius:8px; font-weight:800; cursor:pointer;">Save Food</button>
        </div>
      </div>
    </div>

    <!-- 8. MEAL BUILDER & COMBINER MODAL -->
    <div class="ntr-modal-overlay" id="meal-builder-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>🍱 Combine Foods / Meal Builder</span><button class="ntr-del-btn" id="btn-close-mb-x">✕</button></div>
        
        <input type="text" class="ntr-modal-input" id="mb-meal-name" placeholder="Meal Name (e.g. Tuna Pasta Bowl)" />
        
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px; margin-bottom:8px;">
          <select class="ntr-modal-input" id="mb-select-food" style="margin-bottom:0;"></select>
          <input type="number" class="ntr-modal-input" id="mb-add-qty" placeholder="Grams" value="100" style="margin-bottom:0;" />
        </div>
        <button id="btn-mb-add-item" style="width:100%; background:#27272a; color:#cbd5e1; border:1px solid #3f3f46; border-radius:6px; padding:6px; font-weight:700; font-size:0.75rem; cursor:pointer; margin-bottom:10px;">+ Add Ingredient to Meal</button>

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

    <!-- 9. BARCODE SCANNER & OPEN FOOD FACTS MODAL -->
    <div class="ntr-modal-overlay" id="barcode-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>📷 Barcode Product Scanner</span><button class="ntr-del-btn" id="btn-close-bc-x">✕</button></div>
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
      water: parseFloat(container.querySelector("#inp-goal-water").value) || 3500,
      fiber: parseFloat(container.querySelector("#inp-goal-fiber").value) || 35,
      calcium: parseFloat(container.querySelector("#inp-goal-calcium").value) || 1000,
      iron: parseFloat(container.querySelector("#inp-goal-iron").value) || 18,
      magnesium: parseFloat(container.querySelector("#inp-goal-magnesium").value) || 400,
      potassium: parseFloat(container.querySelector("#inp-goal-potassium").value) || 3500,
      sodium: parseFloat(container.querySelector("#inp-goal-sodium").value) || 2300,
      zinc: parseFloat(container.querySelector("#inp-goal-zinc").value) || 11
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
  container.querySelector("#toggle-micro").onclick = async () => {
    dayData.microOpen = !dayData.microOpen;
    await saveNutrition();
    renderMacroTracker();
  };

  // Delete log item handlers
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

  // ==========================================================================
  // MODAL: LOG FOOD (SEARCH & SCALE)
  // ==========================================================================
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
        <div>
          <div style="font-weight:700; color:#ffffff; font-size:0.8rem;">
            ${f.name} ${!f.isBase ? '<span style="color:#fde68a; font-size:0.65rem;">✨ Custom</span>' : ''}
            <span style="color:#71717a; font-size:0.7rem;">(${f.serving} ${f.unit || 'g'})</span>
          </div>
          <div style="font-size:0.68rem; color:#a1a1aa;">${f.cals} kcal • P: ${f.p}g | F: ${f.f}g | C: ${f.c}g</div>
        </div>
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

    container.querySelector("#ntr-in-fiber").value = Math.round((baseFood.fiber || 0) * ratio * 10) / 10;
    container.querySelector("#ntr-in-calcium").value = Math.round((baseFood.calcium || 0) * ratio * 10) / 10;
    container.querySelector("#ntr-in-iron").value = Math.round((baseFood.iron || 0) * ratio * 10) / 10;
    container.querySelector("#ntr-in-magnesium").value = Math.round((baseFood.magnesium || 0) * ratio * 10) / 10;
    container.querySelector("#ntr-in-potassium").value = Math.round((baseFood.potassium || 0) * ratio * 10) / 10;
    container.querySelector("#ntr-in-sodium").value = Math.round((baseFood.sodium || 0) * ratio * 10) / 10;
    container.querySelector("#ntr-in-zinc").value = Math.round((baseFood.zinc || 0) * ratio * 10) / 10;
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
    container.querySelector("#ntr-in-fiber").value = "";
    container.querySelector("#ntr-in-calcium").value = "";
    container.querySelector("#ntr-in-iron").value = "";
    container.querySelector("#ntr-in-magnesium").value = "";
    container.querySelector("#ntr-in-potassium").value = "";
    container.querySelector("#ntr-in-sodium").value = "";
    container.querySelector("#ntr-in-zinc").value = "";
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

    const fiber = parseFloat(container.querySelector("#ntr-in-fiber").value) || 0;
    const calcium = parseFloat(container.querySelector("#ntr-in-calcium").value) || 0;
    const iron = parseFloat(container.querySelector("#ntr-in-iron").value) || 0;
    const magnesium = parseFloat(container.querySelector("#ntr-in-magnesium").value) || 0;
    const potassium = parseFloat(container.querySelector("#ntr-in-potassium").value) || 0;
    const sodium = parseFloat(container.querySelector("#ntr-in-sodium").value) || 0;
    const zinc = parseFloat(container.querySelector("#ntr-in-zinc").value) || 0;

    dayData.items.push({ name, meal, serving: serv, cals, p, f, c, fiber, calcium, iron, magnesium, potassium, sodium, zinc });
    await saveNutrition();
    logModal.style.display = "none";
    renderMacroTracker();
  };

  // ==========================================================================
  // MODAL: FOOD LIBRARY BROWSER & MANAGER
  // ==========================================================================
  const libModal = container.querySelector("#food-library-modal");
  const libFilterInp = container.querySelector("#lib-filter-input");
  const libFoodsList = container.querySelector("#lib-foods-list");

  function renderLibraryList(query) {
    const q = (query || "").toLowerCase();
    const filtered = foodLibrary.filter(f => f.name.toLowerCase().includes(q));

    if (filtered.length === 0) {
      libFoodsList.innerHTML = '<div style="padding:10px; color:#71717a; text-align:center; font-size:0.75rem;">No foods found. Click "+ New Food" to create one.</div>';
      return;
    }

    libFoodsList.innerHTML = filtered.map(f => `
      <div class="ntr-search-item lib-item" data-name="${f.name}">
        <div style="flex:1;">
          <div style="font-weight:700; color:#ffffff; font-size:0.8rem;">
            ${f.name} ${!f.isBase ? '<span style="color:#fde68a; font-size:0.65rem; background:#3b2308; padding:1px 5px; border-radius:4px;">✨ Custom</span>' : ''}
            <span style="color:#71717a; font-size:0.7rem;">(${f.serving} ${f.unit || 'g'})</span>
          </div>
          <div style="font-size:0.68rem; color:#a1a1aa;">${f.cals} kcal • P: ${f.p}g | F: ${f.f}g | C: ${f.c}g</div>
        </div>
        ${!f.isBase ? `<button class="ntr-del-btn btn-del-cf" data-name="${f.name}" title="Delete custom food">✕</button>` : ''}
      </div>
    `).join("");

    libFoodsList.querySelectorAll(".lib-item").forEach(item => {
      item.onclick = (e) => {
        if (e.target.classList.contains('btn-del-cf')) return;
        const found = foodLibrary.find(f => f.name === item.dataset.name);
        if (found) {
          libModal.style.display = "none";
          logModal.style.display = "flex";
          selectedFoodRef = found;
          container.querySelector("#ntr-custom-name").value = found.name;
          servInp.value = found.serving;
          unitInp.value = found.unit || "g";
          updateScaledNutrients(found.serving, found);
        }
      };
    });

    libFoodsList.querySelectorAll(".btn-del-cf").forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const foodName = btn.dataset.name;
        customFoods = customFoods.filter(f => f.name !== foodName);
        await saveCustomFoods();
        renderLibraryList(libFilterInp.value);
      };
    });
  }

  container.querySelector("#btn-open-food-library").onclick = () => {
    libModal.style.display = "flex";
    libFilterInp.value = "";
    renderLibraryList("");
    libFilterInp.focus();
  };
  libFilterInp.oninput = () => renderLibraryList(libFilterInp.value);
  container.querySelector("#btn-close-lib-modal").onclick = () => { libModal.style.display = "none"; };
  container.querySelector("#btn-close-lib-x").onclick = () => { libModal.style.display = "none"; };

  container.querySelector("#btn-lib-create-new").onclick = () => {
    libModal.style.display = "none";
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

  // ==========================================================================
  // MODAL: PERMANENT CUSTOM FOOD CREATOR
  // ==========================================================================
  const cfModal = container.querySelector("#custom-food-modal");
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

    const fiber = parseFloat(container.querySelector("#cf-fiber").value) || 0;
    const calcium = parseFloat(container.querySelector("#cf-calcium").value) || 0;
    const iron = parseFloat(container.querySelector("#cf-iron").value) || 0;
    const magnesium = parseFloat(container.querySelector("#cf-magnesium").value) || 0;
    const potassium = parseFloat(container.querySelector("#cf-potassium").value) || 0;
    const sodium = parseFloat(container.querySelector("#cf-sodium").value) || 0;
    const zinc = parseFloat(container.querySelector("#cf-zinc").value) || 0;
    const autoLog = container.querySelector("#cf-auto-log").checked;

    const newFood = { name, serving: serv, unit, cals, p, f, c, fiber, calcium, iron, magnesium, potassium, sodium, zinc, isBase: false };
    customFoods.push(newFood);
    await saveCustomFoods();

    if (autoLog) {
      dayData.items.push({ name, meal: "Snack", serving: `${serv} ${unit}`, cals, p, f, c, fiber, calcium, iron, magnesium, potassium, sodium, zinc });
      await saveNutrition();
    }

    cfModal.style.display = "none";
    renderMacroTracker();
  };

  // ==========================================================================
  // MODAL: MEAL / RECIPE BUILDER
  // ==========================================================================
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
    mbSelect.innerHTML = foodLibrary.map(f => `<option value="${f.name}">${f.name} (${f.serving}${f.unit || 'g'})</option>`).join("");
    updateMealTotals();
  };
  container.querySelector("#btn-close-mb-modal").onclick = () => { mbModal.style.display = "none"; };
  container.querySelector("#btn-close-mb-x").onclick = () => { mbModal.style.display = "none"; };

  container.querySelector("#btn-mb-add-item").onclick = () => {
    const selectedName = mbSelect.value.split(" (")[0];
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
        c: Math.round(food.c * ratio * 10) / 10,
        fiber: Math.round((food.fiber || 0) * ratio * 10) / 10,
        calcium: Math.round((food.calcium || 0) * ratio * 10) / 10,
        iron: Math.round((food.iron || 0) * ratio * 10) / 10,
        magnesium: Math.round((food.magnesium || 0) * ratio * 10) / 10,
        potassium: Math.round((food.potassium || 0) * ratio * 10) / 10,
        sodium: Math.round((food.sodium || 0) * ratio * 10) / 10,
        zinc: Math.round((food.zinc || 0) * ratio * 10) / 10
      });
      updateMealTotals();
    }
  };

  container.querySelector("#btn-mb-log-meal").onclick = async () => {
    if (activeMealIngredients.length === 0) return;
    const mealName = container.querySelector("#mb-meal-name").value.trim() || "Combined Meal";
    let totCals = 0, totP = 0, totF = 0, totC = 0, totGrams = 0;
    let totFiber = 0, totCalcium = 0, totIron = 0, totMag = 0, totPot = 0, totSod = 0, totZinc = 0;

    activeMealIngredients.forEach(i => {
      totCals += i.cals; totP += i.p; totF += i.f; totC += i.c; totGrams += i.qty;
      totFiber += i.fiber || 0; totCalcium += i.calcium || 0; totIron += i.iron || 0;
      totMag += i.magnesium || 0; totPot += i.potassium || 0; totSod += i.sodium || 0; totZinc += i.zinc || 0;
    });

    dayData.items.push({
      name: mealName,
      meal: "Meal Combo",
      serving: `${totGrams} g`,
      cals: Math.round(totCals * 10) / 10,
      p: Math.round(totP * 10) / 10,
      f: Math.round(totF * 10) / 10,
      c: Math.round(totC * 10) / 10,
      fiber: Math.round(totFiber * 10) / 10,
      calcium: Math.round(totCalcium * 10) / 10,
      iron: Math.round(totIron * 10) / 10,
      magnesium: Math.round(totMag * 10) / 10,
      potassium: Math.round(totPot * 10) / 10,
      sodium: Math.round(totSod * 10) / 10,
      zinc: Math.round(totZinc * 10) / 10
    });

    await saveNutrition();
    mbModal.style.display = "none";
    renderMacroTracker();
  };

  // ==========================================================================
  // MODAL: BARCODE SCANNER (OPEN FOOD FACTS)
  // ==========================================================================
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

        const fiber = nutriments.fiber_100g || nutriments.fiber || 0;
        const sodium = (nutriments.sodium_100g ? nutriments.sodium_100g * 1000 : (nutriments.salt_100g ? nutriments.salt_100g * 400 : 0));
        const potassium = nutriments.potassium_100g ? nutriments.potassium_100g * 1000 : 0;
        const calcium = nutriments.calcium_100g ? nutriments.calcium_100g * 1000 : 0;
        const iron = nutriments.iron_100g ? nutriments.iron_100g * 1000 : 0;
        const magnesium = nutriments.magnesium_100g ? nutriments.magnesium_100g * 1000 : 0;
        const zinc = nutriments.zinc_100g ? nutriments.zinc_100g * 1000 : 0;

        scannedProductData = {
          name: name,
          serving: 100,
          unit: "g",
          cals: Math.round(cals * 10) / 10,
          p: Math.round(p * 10) / 10,
          f: Math.round(f * 10) / 10,
          c: Math.round(c * 10) / 10,
          fiber: Math.round(fiber * 10) / 10,
          sodium: Math.round(sodium),
          potassium: Math.round(potassium),
          calcium: Math.round(calcium),
          iron: Math.round(iron * 10) / 10,
          magnesium: Math.round(magnesium),
          zinc: Math.round(zinc * 10) / 10
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
    container.querySelector("#cf-fiber").value = scannedProductData.fiber;
    container.querySelector("#cf-calcium").value = scannedProductData.calcium;
    container.querySelector("#cf-iron").value = scannedProductData.iron;
    container.querySelector("#cf-magnesium").value = scannedProductData.magnesium;
    container.querySelector("#cf-potassium").value = scannedProductData.potassium;
    container.querySelector("#cf-sodium").value = scannedProductData.sodium;
    container.querySelector("#cf-zinc").value = scannedProductData.zinc;
  };
}

renderMacroTracker();

} catch (err) {
  dv.paragraph("❌ **Daily Macro Tracker Error:** " + err.message);
}
}
initDailyMacroTracker();