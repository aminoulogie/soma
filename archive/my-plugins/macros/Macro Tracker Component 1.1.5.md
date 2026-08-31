---
calories_consumed: 629
protein_grams: 27
carbs_grams: 11
fat_grams: 53
water_ml: 800
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
const workoutSplitName = todayWorkout.split || null;

const baseFoodLibrary = [
  { name: "Whole Eggs", serving: 100, unit: "g", cals: 143, p: 13.0, c: 0.7, f: 9.9, fiber: 0, sodium: 142, potassium: 138, calcium: 56, iron: 1.8, magnesium: 12, zinc: 1.3, isBase: true, usageCount: 15 },
  { name: "Chicken Breast (Cooked)", serving: 100, unit: "g", cals: 165, p: 31.0, c: 0.0, f: 3.6, fiber: 0, sodium: 74, potassium: 256, calcium: 15, iron: 1.0, magnesium: 29, zinc: 1.0, isBase: true, usageCount: 20 },
  { name: "White Rice (Cooked)", serving: 150, unit: "g", cals: 195, p: 4.1, c: 43.0, f: 0.4, fiber: 0.6, sodium: 1, potassium: 55, calcium: 16, iron: 1.8, magnesium: 19, zinc: 0.8, isBase: true, usageCount: 18 },
  { name: "Egg Whites", serving: 100, unit: "g", cals: 52, p: 11.0, c: 0.7, f: 0.2, fiber: 0, sodium: 166, potassium: 163, calcium: 7, iron: 0.1, magnesium: 11, zinc: 0.0, isBase: true, usageCount: 12 },
  { name: "Oatmeal (Dry)", serving: 50, unit: "g", cals: 190, p: 6.5, c: 34.0, f: 3.5, fiber: 5.0, sodium: 2, potassium: 180, calcium: 26, iron: 2.1, magnesium: 69, zinc: 1.5, isBase: true, usageCount: 14 },
  { name: "Whey Protein Isolate", serving: 30, unit: "g", cals: 120, p: 25.0, c: 1.5, f: 1.0, fiber: 0, sodium: 140, potassium: 160, calcium: 130, iron: 0.4, magnesium: 20, zinc: 0.5, isBase: true, usageCount: 16 },
  { name: "Greek / Plain Yogurt", serving: 150, unit: "g", cals: 90, p: 15.0, c: 5.0, f: 0.5, fiber: 0, sodium: 55, potassium: 210, calcium: 165, iron: 0.1, magnesium: 17, zinc: 0.9, isBase: true, usageCount: 10 },
  { name: "Canned Tuna (Drained)", serving: 120, unit: "g", cals: 130, p: 29.0, c: 0.0, f: 1.0, fiber: 0, sodium: 380, potassium: 280, calcium: 12, iron: 1.6, magnesium: 34, zinc: 0.9, isBase: true, usageCount: 11 },
  { name: "Pasta (Dry)", serving: 80, unit: "g", cals: 280, p: 10.0, c: 58.0, f: 1.2, fiber: 2.5, sodium: 5, potassium: 180, calcium: 18, iron: 1.4, magnesium: 42, zinc: 1.1, isBase: true, usageCount: 8 },
  { name: "Olive Oil", serving: 14, unit: "g", cals: 120, p: 0.0, c: 0.0, f: 14.0, fiber: 0, sodium: 0, potassium: 0, calcium: 0, iron: 0.1, magnesium: 0, zinc: 0.0, isBase: true, usageCount: 9 },
  { name: "Peanut Butter", serving: 32, unit: "g", cals: 190, p: 8.0, c: 7.0, f: 16.0, fiber: 2.0, sodium: 140, potassium: 210, calcium: 14, iron: 0.6, magnesium: 54, zinc: 0.9, isBase: true, usageCount: 6 },
  { name: "Banana", serving: 118, unit: "g", cals: 105, p: 1.3, c: 27.0, f: 0.3, fiber: 3.1, sodium: 1, potassium: 422, calcium: 6, iron: 0.3, magnesium: 32, zinc: 0.2, isBase: true, usageCount: 10 }
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
    microOpen: false,
    water: 0,
    mealCollapse: {},
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
if (!dayData.mealCollapse) dayData.mealCollapse = {};
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

async function incrementFoodUsage(foodName) {
  const match = customFoods.find(f => f.name === foodName);
  if (match) {
    match.usageCount = (match.usageCount || 0) + 1;
    await saveCustomFoods();
  } else {
    const baseMatch = baseFoodLibrary.find(f => f.name === foodName);
    if (baseMatch) baseMatch.usageCount = (baseMatch.usageCount || 0) + 1;
  }
}

// ============================================================================
// 2. MINIMALIST UI STYLES (CLEAN DARK DESIGN, NO BROKEN GLYPHS)
// ============================================================================
const macroRoot = dv.el("div", "", { cls: "ntr-root-container" });

const style = document.createElement("style");
style.textContent = `
  .ntr-root-container {
    max-width: 660px;
    margin: 0 auto;
    font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif);
    color: #e4e4e7;
    display: flex;
    flex-direction: column;
    gap: 10px;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
  }
  .ntr-card { background: #141417; border: 1px solid #27272a; border-radius: 10px; overflow: hidden; }

  .ntr-root-container input,
  .ntr-root-container select,
  .ntr-root-container textarea {
    font-size: 16px !important;
    font-family: inherit;
    -webkit-appearance: none;
  }

  .ntr-btn, .ntr-btn-tool, .ntr-btn-water, .ntr-chip, .ntr-del-btn, .ntr-water-node {
    touch-action: manipulation;
    cursor: pointer;
    user-select: none;
    transition: transform 0.08s ease, background 0.15s ease;
  }
  .ntr-btn:active, .ntr-btn-tool:active, .ntr-btn-water:active, .ntr-chip:active, .ntr-water-node:active {
    transform: scale(0.97);
  }

  /* TOP TARGET BAR */
  .ntr-goals-widget { background: #18181b; border: 1px solid #27272a; border-radius: 10px; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
  .ntr-goals-info { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ntr-goals-title { font-size: 0.72rem; font-weight: 700; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; }
  .ntr-goal-pill { font-size: 0.74rem; font-weight: 700; padding: 3px 8px; border-radius: 6px; background: #202023; display: inline-flex; align-items: center; gap: 4px; }
  .ntr-btn-edit-goals { background: #202023; border: 1px solid #2e2e32; color: #a1a1aa; border-radius: 6px; padding: 4px 10px; font-size: 0.72rem; font-weight: 700; }
  .ntr-btn-edit-goals:hover { background: #27272a; color: #ffffff; }

  /* WORKOUT SYNERGY */
  .ntr-synergy-banner { background: #181c24; border: 1px solid #1e293b; border-radius: 8px; padding: 7px 12px; font-size: 0.74rem; font-weight: 700; color: #60a5fa; display: flex; align-items: center; justify-content: space-between; }

  /* REMAINING CALORIES BANNER */
  .ntr-mfp-banner { background: #141417; border: 1px solid #27272a; border-radius: 10px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center; }
  .ntr-mfp-equation { display: flex; align-items: center; gap: 8px; font-size: 0.74rem; font-weight: 700; color: #71717a; flex-wrap: wrap; }
  .ntr-mfp-unit { text-align: center; }
  .ntr-mfp-num { font-size: 1.05rem; font-weight: 800; color: #f4f4f5; }
  .ntr-mfp-sub { font-size: 0.62rem; text-transform: uppercase; color: #71717a; margin-top: 1px; }
  .ntr-mfp-sym { font-size: 0.85rem; font-weight: 800; color: #3f3f46; margin: 0 1px; }
  .ntr-mfp-rem-box { background: #18181b; border: 1px solid #27272a; padding: 6px 14px; border-radius: 8px; text-align: center; }
  .ntr-mfp-rem-val { font-size: 1.2rem; font-weight: 900; line-height: 1.1; }

  /* SEGMENTED CALORIE TRACK */
  .ntr-stacked-bar-container { background: #141417; border: 1px solid #27272a; border-radius: 10px; padding: 10px 14px; }
  .ntr-stacked-bar-track { height: 6px; border-radius: 999px; background: #27272a; display: flex; overflow: hidden; margin-top: 6px; }
  .ntr-stack-seg { height: 100%; transition: width 0.3s ease; }
  .ntr-stack-over { background: repeating-linear-gradient(45deg, #ef4444, #ef4444 4px, #991b1b 4px, #991b1b 8px); }

  /* HYDRATION PROGRESSION */
  .ntr-water-dock { background: #141417; border: 1px solid #27272a; border-radius: 10px; padding: 10px 14px; }
  .ntr-water-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
  .ntr-water-label { font-size: 0.74rem; font-weight: 700; color: #71717a; display: flex; align-items: center; gap: 6px; text-transform: uppercase; letter-spacing: 0.04em; }
  .ntr-water-nodes-row { display: flex; gap: 6px; justify-content: space-between; align-items: center; }
  .ntr-water-node { flex: 1; height: 8px; background: #202023; border-radius: 999px; border: 1px solid #27272a; }
  .ntr-water-node.filled { background: #0284c7; border-color: #38bdf8; }
  .ntr-btn-water { background: #18181b; border: 1px solid #2e2e32; color: #a1a1aa; font-size: 0.68rem; font-weight: 700; padding: 4px 8px; border-radius: 6px; }
  .ntr-btn-water:hover { background: #27272a; color: #ffffff; }

  /* ACCORDIONS */
  .ntr-accordion-bar { background: #18181b; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; }
  .ntr-accordion-title { font-size: 0.82rem; font-weight: 800; color: #f4f4f5; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.04em; }
  .ntr-accordion-cals { font-size: 0.76rem; font-weight: 700; color: #71717a; margin-right: 8px; }
  .ntr-chevron { width: 6px; height: 6px; border-right: 2px solid #71717a; border-bottom: 2px solid #71717a; transform: rotate(45deg); transition: transform 0.2s ease; display: inline-block; }
  .ntr-chevron.closed { transform: rotate(-45deg); }

  /* MEAL GROUPS */
  .ntr-meal-card { background: #141417; border-bottom: 1px solid #202023; }
  .ntr-meal-header { padding: 8px 14px; background: #18181b; display: flex; justify-content: space-between; align-items: center; cursor: pointer; user-select: none; border-top: 1px solid #202023; }
  .ntr-meal-title { font-size: 0.78rem; font-weight: 800; color: #d4d4d8; display: flex; align-items: center; gap: 8px; }
  .ntr-meal-badge { font-size: 0.7rem; font-weight: 700; color: #71717a; }
  .ntr-btn-quick-add-meal { background: #202023; border: 1px solid #2e2e32; color: #38bdf8; border-radius: 5px; padding: 2px 7px; font-size: 0.68rem; font-weight: 700; }

  /* ROW ITEMS */
  .ntr-row-item { display: grid; grid-template-columns: 2.2fr 1fr 1fr 1fr 1fr 24px; align-items: center; padding: 8px 14px; border-bottom: 1px solid #1c1c20; font-size: 0.75rem; font-weight: 700; color: #f4f4f5; cursor: pointer; }
  .ntr-row-item:hover, .ntr-row-item:active { background: #1a1a1e; }
  .ntr-row-item:last-child { border-bottom: none; }

  .col-cals { border-left: 2px solid #f59e0b; padding-left: 6px; font-weight: 800; }
  .col-prot { border-left: 2px solid #10b981; padding-left: 6px; }
  .col-fat  { border-left: 2px solid #ef4444; padding-left: 6px; }
  .col-carb { border-left: 2px solid #0ea5e9; padding-left: 6px; }

  /* TOOLBAR */
  .ntr-action-bar { display: flex; gap: 6px; padding: 8px 10px; background: #141417; border-bottom: 1px solid #27272a; flex-wrap: wrap; }
  .ntr-btn-tool { background: #18181b; color: #d4d4d8; border: 1px solid #27272a; border-radius: 6px; padding: 6px 10px; font-size: 0.72rem; font-weight: 700; }
  .ntr-btn-tool:hover { background: #202023; color: #ffffff; }

  /* SUMMARY TILES */
  .ntr-tiles-body { padding: 12px; background: #141417; }
  .ntr-tiles-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .ntr-tile { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 8px 10px; position: relative; overflow: hidden; }
  .ntr-tile-accent { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; }
  .ntr-tile-top { display: flex; justify-content: space-between; align-items: center; }
  .ntr-tile-lbl { font-size: 0.65rem; font-weight: 700; color: #71717a; text-transform: uppercase; }
  .ntr-tile-pct { font-size: 0.65rem; font-weight: 800; }
  .ntr-tile-val { font-size: 0.92rem; font-weight: 800; color: #ffffff; margin-top: 3px; }
  .ntr-tile-sub { font-size: 0.65rem; font-weight: 700; margin-top: 2px; }
  .ntr-tile-bar-bg { height: 3px; background: #27272a; border-radius: 999px; overflow: hidden; margin-top: 6px; }
  .ntr-tile-bar-fill { height: 100%; border-radius: 999px; }

  .acc-cals { background: #f59e0b; color: #f59e0b; }
  .acc-prot { background: #10b981; color: #10b981; }
  .acc-fat  { background: #ef4444; color: #ef4444; }
  .acc-carb { background: #0ea5e9; color: #0ea5e9; }

  /* QUICK PORTION MULTIPLIER CHIPS */
  .ntr-chips-row { display: flex; gap: 6px; margin: 6px 0 10px 0; overflow-x: auto; padding-bottom: 2px; }
  .ntr-chip { background: #18181b; border: 1px solid #27272a; color: #a1a1aa; font-size: 0.72rem; font-weight: 700; padding: 5px 9px; border-radius: 6px; white-space: nowrap; }
  .ntr-chip:hover { background: #202023; color: #ffffff; }

  /* MICRONUTRIENTS GRID */
  .ntr-micro-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; padding: 12px; background: #141417; }
  .ntr-micro-card { background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 8px 10px; }
  .ntr-micro-head { display: flex; justify-content: space-between; align-items: center; font-size: 0.72rem; font-weight: 700; }
  .ntr-micro-bar-bg { height: 3px; background: #27272a; border-radius: 999px; overflow: hidden; margin-top: 6px; }
  .ntr-micro-bar-fill { height: 100%; border-radius: 999px; }

  /* MODALS */
  .ntr-modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.82); z-index: 3000; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
  .ntr-modal-box { background: #141417; border: 1px solid #27272a; border-radius: 12px; padding: 18px; width: 92%; max-width: 480px; box-shadow: 0 18px 50px rgba(0,0,0,0.95); max-height: 90vh; overflow-y: auto; -webkit-overflow-scrolling: touch; }
  .ntr-modal-title { font-size: 0.95rem; font-weight: 800; color: #ffffff; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; }
  .ntr-modal-input { width: 100%; height: 38px; background: #18181b; border: 1px solid #27272a; color: #fff; border-radius: 6px; padding: 6px 10px; font-weight: 700; box-sizing: border-box; outline: none; margin-bottom: 8px; }
  .ntr-search-results { max-height: 180px; overflow-y: auto; border: 1px solid #27272a; border-radius: 6px; background: #18181b; margin-bottom: 10px; -webkit-overflow-scrolling: touch; }
  .ntr-search-item { padding: 8px 10px; border-bottom: 1px solid #202023; cursor: pointer; display: flex; justify-content: space-between; align-items: center; }
  .ntr-search-item:hover, .ntr-search-item:active { background: #202024; }

  .ntr-macro-input-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px; }
  .ntr-micro-input-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin-bottom: 12px; }
  .ntr-mini-lbl { font-size: 0.62rem; font-weight: 700; color: #71717a; text-transform: uppercase; margin-bottom: 2px; }
  .ntr-mini-inp { width: 100%; height: 36px; background: #18181b; border: 1px solid #27272a; color: #fff; border-radius: 6px; text-align: center; font-weight: 700; box-sizing: border-box; }

  .ntr-del-btn { background: #202023; border: none; color: #71717a; border-radius: 4px; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; font-size: 0.7rem; }
  .ntr-del-btn:hover { background: #ef4444; color: #ffffff; }
  .ntr-video-feed { width: 100%; height: 210px; background: #000; border-radius: 8px; object-fit: cover; margin-bottom: 8px; border: 1px solid #27272a; }
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

  const pBarW = (pCal / (effectiveGoalCals || 1)) * 100;
  const fBarW = (fCal / (effectiveGoalCals || 1)) * 100;
  const cBarW = (cCal / (effectiveGoalCals || 1)) * 100;
  const isOverCals = totalCals > effectiveGoalCals;

  // Minimalist Hydration Nodes (10 step nodes)
  const waterTarget = dayData.goals.water || 3500;
  const currentWater = dayData.water || 0;
  const nodeVol = Math.round(waterTarget / 10);
  let waterNodesHtml = "";
  for (let n = 1; n <= 10; n++) {
    const isFilled = currentWater >= (n * nodeVol);
    waterNodesHtml += `<div class="ntr-water-node ${isFilled ? 'filled' : ''}" data-vol="${n * nodeVol}" title="${n * nodeVol} ml"></div>`;
  }

  // Meal Grouping
  const mealCategories = ["Breakfast", "Lunch", "Dinner", "Post-Workout", "Snacks"];
  let mealGroupsHtml = "";

  mealCategories.forEach(mealCat => {
    const mealItems = (dayData.items || []).filter(i => (i.meal || "Snacks").toLowerCase() === mealCat.toLowerCase());
    let mCals = 0, mProt = 0;
    mealItems.forEach(i => { mCals += (i.cals || 0); mProt += (i.p || 0); });

    const isCollapsed = !!dayData.mealCollapse[mealCat];

    let itemsInMealHtml = mealItems.map((item) => {
      const globalIdx = dayData.items.indexOf(item);
      return `
        <div class="ntr-row-item" data-idx="${globalIdx}">
          <div>
            <div style="font-weight: 700; color: #f4f4f5;">${item.name}</div>
            <div style="font-size:0.68rem; color:#71717a;">${item.serving || "100 g"}</div>
          </div>
          <div class="col-cals">${item.cals.toFixed(0)} kcal</div>
          <div class="col-prot">${item.p.toFixed(1)}g</div>
          <div class="col-fat">${item.f.toFixed(1)}g</div>
          <div class="col-carb">${item.c.toFixed(1)}g</div>
          <div style="text-align: right;">
            <button class="ntr-del-btn btn-direct-del" data-idx="${globalIdx}" title="Delete">✕</button>
          </div>
        </div>
      `;
    }).join("");

    mealGroupsHtml += `
      <div class="ntr-meal-card">
        <div class="ntr-meal-header" data-meal="${mealCat}">
          <div class="ntr-meal-title">
            <span class="ntr-chevron ${isCollapsed ? 'closed' : ''}"></span>
            <span>${mealCat}</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="ntr-meal-badge">${mCals.toFixed(0)} kcal • ${mProt.toFixed(0)}g P</span>
            <button class="ntr-btn-quick-add-meal btn-quick-add" data-meal="${mealCat}">+ Add</button>
          </div>
        </div>
        <div style="display: ${isCollapsed ? 'none' : 'block'};">
          ${itemsInMealHtml || `<div style="padding:8px 14px; font-size:0.72rem; color:#52525b; text-align:center;">No items logged</div>`}
        </div>
      </div>
    `;
  });

  // Micronutrients List
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
      ? (left >= 0 ? `${left.toFixed(0)}${m.unit} under` : `${Math.abs(left).toFixed(0)}${m.unit} over`)
      : (left > 0 ? `${left.toFixed(0)}${m.unit} left` : `Goal reached`);

    return `
      <div class="ntr-micro-card">
        <div class="ntr-micro-head">
          <span style="color:#a1a1aa;">${m.name}</span>
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

  container.innerHTML = `
    <!-- 0. CURRENT GOALS TOP WIDGET -->
    <div class="ntr-goals-widget">
      <div class="ntr-goals-info">
        <span class="ntr-goals-title">Targets</span>
        <span class="ntr-goal-pill" style="color:#f59e0b;"><b style="color:#fff;">${dayData.goals.cals}</b> kcal ${exerciseCaloriesBurned > 0 ? `<span style="font-size:0.65rem; color:#34d399;">(+${exerciseCaloriesBurned})</span>` : ''}</span>
        <span class="ntr-goal-pill" style="color:#10b981;">P: <b style="color:#fff;">${dayData.goals.protein}g</b></span>
        <span class="ntr-goal-pill" style="color:#ef4444;">F: <b style="color:#fff;">${dayData.goals.fat}g</b></span>
        <span class="ntr-goal-pill" style="color:#0ea5e9;">C: <b style="color:#fff;">${dayData.goals.carbs}g</b></span>
      </div>
      <button class="ntr-btn-edit-goals ntr-btn" id="btn-open-goals-modal">Edit Targets</button>
    </div>

    <!-- WORKOUT SYNERGY (IF DETECTED) -->
    ${workoutSplitName ? `
      <div class="ntr-synergy-banner">
        <span><b>Workout:</b> ${workoutSplitName} (${exerciseCaloriesBurned} kcal)</span>
        <span style="color:#93c5fd;">Ceiling adjusted</span>
      </div>
    ` : ''}

    <!-- CALORIE REMAINING SUMMARY -->
    <div class="ntr-mfp-banner">
      <div class="ntr-mfp-equation">
        <div class="ntr-mfp-unit">
          <div class="ntr-mfp-num">${dayData.goals.cals}</div>
          <div class="ntr-mfp-sub">Goal</div>
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
        <div class="ntr-mfp-sub" style="font-weight:700; color:${remCals >= 0 ? '#34d399' : '#ef4444'};">
          ${remCals >= 0 ? 'Remaining' : 'Over Limit'}
        </div>
      </div>
    </div>

    <!-- STACKED SEGMENTED MACRO BAR -->
    <div class="ntr-stacked-bar-container">
      <div style="display:flex; justify-content:space-between; font-size:0.72rem; font-weight:700; color:#71717a;">
        <span>Macro Calorie Distribution</span>
        <span style="color:#d4d4d8;">${totalCals.toFixed(0)} / ${effectiveGoalCals} kcal</span>
      </div>
      <div class="ntr-stacked-bar-track">
        <div class="ntr-stack-seg" style="width:${Math.min(100, pBarW)}%; background:#10b981;" title="Protein (${pRatio}%)"></div>
        <div class="ntr-stack-seg" style="width:${Math.min(100 - pBarW, fBarW)}%; background:#ef4444;" title="Fat (${fRatio}%)"></div>
        <div class="ntr-stack-seg" style="width:${Math.min(100 - pBarW - fBarW, cBarW)}%; background:#0ea5e9;" title="Carbs (${cRatio}%)"></div>
        ${isOverCals ? `<div class="ntr-stack-seg ntr-stack-over" style="width:100%;" title="Over Target"></div>` : ''}
      </div>
    </div>

    <!-- HYDRATION PROGRESSION -->
    <div class="ntr-water-dock">
      <div class="ntr-water-top">
        <div class="ntr-water-label">
          <span>Hydration</span>
          <b style="color:#ffffff;">${currentWater}</b> / ${waterTarget} ml
        </div>
        <div style="display:flex; gap:6px;">
          <button class="ntr-btn-water ntr-btn" id="w-plus-250">+250ml</button>
          <button class="ntr-btn-water ntr-btn" id="w-plus-500">+500ml</button>
          <button class="ntr-btn-water ntr-btn" id="w-reset" style="background:#18181b; border-color:#27272a; color:#71717a;">Reset</button>
        </div>
      </div>
      <div class="ntr-water-nodes-row">${waterNodesHtml}</div>
    </div>

    <!-- 1. MACROS SUMMARY CARD -->
    <div class="ntr-card">
      <div class="ntr-accordion-bar" id="toggle-summary">
        <span class="ntr-accordion-title">Macros Breakdown</span>
        <div style="display: flex; align-items: center;">
          <span class="ntr-accordion-cals">${totalCals.toFixed(0)} kcal</span>
          <span class="ntr-chevron ${dayData.summaryOpen ? '' : 'closed'}"></span>
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
            <div class="ntr-tile-val">${totalCals.toFixed(0)} <span style="font-size:0.62rem; color:#71717a;">kcal</span></div>
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
            <div class="ntr-tile-val">${totalProtein.toFixed(0)} <span style="font-size:0.62rem; color:#71717a;">/ ${dayData.goals.protein}g</span></div>
            <div class="ntr-tile-sub" style="color:${remProtein > 0 ? '#71717a' : '#10b981'};">
              ${remProtein > 0 ? `${remProtein.toFixed(0)}g left` : `Goal Met`}
            </div>
            <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-prot" style="width: ${protPct}%;"></div></div>
          </div>

          <div class="ntr-tile">
            <div class="ntr-tile-accent acc-fat"></div>
            <div class="ntr-tile-top">
              <span class="ntr-tile-lbl">Fat</span>
              <span class="ntr-tile-pct" style="color:#ef4444;">${fatPct}%</span>
            </div>
            <div class="ntr-tile-val">${totalFat.toFixed(0)} <span style="font-size:0.62rem; color:#71717a;">/ ${dayData.goals.fat}g</span></div>
            <div class="ntr-tile-sub" style="color:${remFat >= 0 ? '#71717a' : '#ef4444'};">
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
            <div class="ntr-tile-val">${totalCarbs.toFixed(0)} <span style="font-size:0.62rem; color:#71717a;">/ ${dayData.goals.carbs}g</span></div>
            <div class="ntr-tile-sub" style="color:${remCarbs >= 0 ? '#71717a' : '#ef4444'};">
              ${remCarbs >= 0 ? `${remCarbs.toFixed(0)}g left` : `+${Math.abs(remCarbs).toFixed(0)}g over`}
            </div>
            <div class="ntr-tile-bar-bg"><div class="ntr-tile-bar-fill acc-carb" style="width: ${carbsPct}%;"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. MEAL-BY-MEAL GROUPED DIARY -->
    <div class="ntr-card">
      <div class="ntr-accordion-bar" id="toggle-table">
        <span class="ntr-accordion-title">Food Diary</span>
        <div style="display: flex; align-items: center;">
          <span class="ntr-accordion-cals">${totalCals.toFixed(0)} kcal</span>
          <span class="ntr-chevron ${dayData.tableOpen ? '' : 'closed'}"></span>
        </div>
      </div>
      <div style="display: ${dayData.tableOpen ? 'block' : 'none'};">
        <div class="ntr-action-bar">
          <button class="ntr-btn-tool ntr-btn" id="btn-open-modal">Search Food</button>
          <button class="ntr-btn-tool ntr-btn" id="btn-open-food-library">Food Library</button>
          <button class="ntr-btn-tool ntr-btn" id="btn-open-meal-builder">Combine Meal</button>
          <button class="ntr-btn-tool ntr-btn" id="btn-copy-yesterday">Copy Yesterday</button>
          <button class="ntr-btn-tool ntr-btn" id="btn-open-barcode">Scan Barcode</button>
        </div>

        <div>${mealGroupsHtml}</div>
      </div>
    </div>

    <!-- 3. MICRONUTRIENTS CARD (CLEAN ACCORDION, HIDDEN BY DEFAULT) -->
    <div class="ntr-card">
      <div class="ntr-accordion-bar" id="toggle-micro">
        <span class="ntr-accordion-title">Micronutrients & Minerals</span>
        <div style="display: flex; align-items: center;">
          <span class="ntr-accordion-cals" style="color:#a855f7;">${totalCalcium.toFixed(0)}mg Ca • ${totalIron.toFixed(1)}mg Fe</span>
          <span class="ntr-chevron ${dayData.microOpen ? '' : 'closed'}"></span>
        </div>
      </div>
      <div style="display: ${dayData.microOpen ? 'block' : 'none'};">
        <div class="ntr-micro-grid">${microCardsHtml}</div>
      </div>
    </div>

    <!-- 4. EDIT TARGETS & MICROS MODAL -->
    <div class="ntr-modal-overlay" id="goals-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>Edit Daily Targets</span><button class="ntr-del-btn" id="btn-close-goals-x">✕</button></div>
        
        <div style="font-size:0.72rem; font-weight:700; color:#38bdf8; text-transform:uppercase; margin-bottom:6px;">Macronutrients & Water</div>
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

        <div style="font-size:0.72rem; font-weight:700; color:#a855f7; text-transform:uppercase; margin:10px 0 6px 0;">Micronutrients Target</div>
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

        <label style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:#a1a1aa; margin-bottom:14px; cursor:pointer;">
          <input type="checkbox" id="chk-save-default-goals" checked /> Set as default for all future days
        </label>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button id="btn-close-goals-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Cancel</button>
          <button id="btn-save-goals" class="ntr-btn" style="padding:8px 16px; background:#2563eb; border:none; color:#fff; border-radius:6px; font-weight:700;">Save Targets</button>
        </div>
      </div>
    </div>

    <!-- 5. SEARCH & LOG FOOD MODAL -->
    <div class="ntr-modal-overlay" id="ntr-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>Log Food</span><button class="ntr-del-btn" id="btn-close-log-x">✕</button></div>
        <input type="text" class="ntr-modal-input" id="ntr-search-food" placeholder="Search food library..." />
        <div class="ntr-search-results" id="ntr-search-res"></div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px; margin: 8px 0 4px 0;">
          <input type="text" class="ntr-modal-input" id="ntr-custom-name" placeholder="Food Name" />
          <select class="ntr-modal-input" id="ntr-custom-meal">
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Post-Workout">Post-Workout</option>
            <option value="Snacks">Snacks</option>
          </select>
        </div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px;">
          <input type="number" class="ntr-modal-input" id="ntr-custom-serv" placeholder="Serving / Grams" />
          <input type="text" class="ntr-modal-input" id="ntr-custom-unit" placeholder="Unit" value="g" />
        </div>

        <div class="ntr-chips-row">
          <button class="ntr-chip" data-mult="0.5">0.5×</button>
          <button class="ntr-chip" data-mult="1.0">1.0×</button>
          <button class="ntr-chip" data-mult="1.5">1.5×</button>
          <button class="ntr-chip" data-mult="2.0">2.0×</button>
          <button class="ntr-chip" data-add="50">+50g</button>
          <button class="ntr-chip" data-add="100">+100g</button>
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

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button id="btn-close-ntr-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Cancel</button>
          <button id="btn-save-ntr-food" class="ntr-btn" style="padding:8px 16px; background:#2563eb; border:none; color:#fff; border-radius:6px; font-weight:700;">+ Log Item</button>
        </div>
      </div>
    </div>

    <!-- 6. INLINE ROW EDIT MODAL -->
    <div class="ntr-modal-overlay" id="edit-row-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>Edit Entry</span><button class="ntr-del-btn" id="btn-close-edit-x">✕</button></div>
        
        <input type="text" class="ntr-modal-input" id="edit-food-name" />
        
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px;">
          <select class="ntr-modal-input" id="edit-food-meal">
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Post-Workout">Post-Workout</option>
            <option value="Snacks">Snacks</option>
          </select>
          <input type="text" class="ntr-modal-input" id="edit-food-serving" />
        </div>

        <div class="ntr-macro-input-grid">
          <div>
            <div class="ntr-mini-lbl">Calories</div>
            <input type="number" class="ntr-mini-inp" id="edit-food-cals" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Protein (g)</div>
            <input type="number" class="ntr-mini-inp" id="edit-food-p" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Fat (g)</div>
            <input type="number" class="ntr-mini-inp" id="edit-food-f" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Carbs (g)</div>
            <input type="number" class="ntr-mini-inp" id="edit-food-c" />
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; gap:8px; margin-top:8px;">
          <button id="btn-delete-active-row" class="ntr-btn" style="padding:8px 12px; background:#450a0a; border:1px solid #7f1d1d; color:#fca5a5; border-radius:6px; font-weight:700;">Delete</button>
          <div style="display:flex; gap:8px;">
            <button id="btn-close-edit-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Cancel</button>
            <button id="btn-save-edited-row" class="ntr-btn" style="padding:8px 16px; background:#2563eb; border:none; color:#fff; border-radius:6px; font-weight:700;">Save</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 7. FOOD LIBRARY BROWSING MODAL -->
    <div class="ntr-modal-overlay" id="food-library-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title">
          <span>Food Library</span>
          <button class="ntr-del-btn" id="btn-close-lib-x">✕</button>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; margin-bottom:8px;">
          <input type="text" class="ntr-modal-input" id="lib-filter-input" placeholder="Search library..." style="margin-bottom:0;" />
          <button id="btn-lib-create-new" class="ntr-btn" style="background:#27272a; border:1px solid #3f3f46; color:#fff; border-radius:6px; padding:0 12px; font-weight:700; font-size:0.75rem; height:38px; white-space:nowrap;">+ New</button>
        </div>
        <div class="ntr-search-results" id="lib-foods-list" style="max-height:260px;"></div>
        <div style="display:flex; justify-content:flex-end; margin-top:8px;">
          <button id="btn-close-lib-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Close</button>
        </div>
      </div>
    </div>

    <!-- 8. PERMANENT CUSTOM FOOD CREATOR MODAL -->
    <div class="ntr-modal-overlay" id="custom-food-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>Save Food to Library</span><button class="ntr-del-btn" id="btn-close-cf-x">✕</button></div>
        
        <input type="text" class="ntr-modal-input" id="cf-name" placeholder="Food Name (e.g. Soummam 0%)" />
        
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px;">
          <input type="number" class="ntr-modal-input" id="cf-serving" placeholder="Serving Base" value="100" />
          <input type="text" class="ntr-modal-input" id="cf-unit" placeholder="Unit" value="g" />
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

        <label style="display:flex; align-items:center; gap:8px; font-size:0.75rem; color:#a1a1aa; margin-bottom:12px; cursor:pointer;">
          <input type="checkbox" id="cf-auto-log" checked /> Log to diary today
        </label>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button id="btn-close-cf-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Cancel</button>
          <button id="btn-save-permanent-cf" class="ntr-btn" style="padding:8px 16px; background:#2563eb; border:none; color:#fff; border-radius:6px; font-weight:700;">Save Food</button>
        </div>
      </div>
    </div>

    <!-- 9. MEAL BUILDER & COMBINER MODAL -->
    <div class="ntr-modal-overlay" id="meal-builder-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>Combine Foods</span><button class="ntr-del-btn" id="btn-close-mb-x">✕</button></div>
        
        <input type="text" class="ntr-modal-input" id="mb-meal-name" placeholder="Meal Name (e.g. Tuna Pasta Bowl)" />
        
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px; margin-bottom:8px;">
          <select class="ntr-modal-input" id="mb-select-food" style="margin-bottom:0;"></select>
          <input type="number" class="ntr-modal-input" id="mb-add-qty" placeholder="Grams" value="100" style="margin-bottom:0;" />
        </div>
        <button id="btn-mb-add-item" class="ntr-btn" style="width:100%; background:#18181b; color:#cbd5e1; border:1px solid #27272a; border-radius:6px; padding:7px; font-weight:700; font-size:0.74rem; margin-bottom:10px;">+ Add Ingredient</button>

        <div id="mb-ingredients-list" style="max-height:120px; overflow-y:auto; margin-bottom:10px; border:1px solid #27272a; border-radius:6px; padding:6px; background:#18181b;"></div>

        <div style="background:#18181b; border:1px solid #27272a; border-radius:6px; padding:8px 10px; margin-bottom:12px;">
          <div style="font-size:0.68rem; font-weight:700; color:#71717a; margin-bottom:4px;">COMBINED TOTALS</div>
          <div id="mb-totals-display" style="display:flex; justify-content:space-between; font-size:0.78rem; font-weight:800;">
            <span style="color:#f59e0b;">0 kcal</span>
            <span style="color:#10b981;">P: 0g</span>
            <span style="color:#ef4444;">F: 0g</span>
            <span style="color:#0ea5e9;">C: 0g</span>
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button id="btn-close-mb-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Cancel</button>
          <button id="btn-mb-log-meal" class="ntr-btn" style="padding:8px 16px; background:#2563eb; border:none; color:#fff; border-radius:6px; font-weight:700;">Log Meal</button>
        </div>
      </div>
    </div>

    <!-- 10. BARCODE SCANNER (AUTO-CACHED) -->
    <div class="ntr-modal-overlay" id="barcode-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title"><span>Barcode Scanner</span><button class="ntr-del-btn" id="btn-close-bc-x">✕</button></div>
        <video id="bc-video" class="ntr-video-feed" playsinline muted></video>
        <div id="bc-status" style="font-size:0.74rem; color:#38bdf8; text-align:center; margin-bottom:8px; font-weight:700;">Point camera at barcode...</div>

        <div style="display:flex; gap:6px; margin-bottom:10px;">
          <input type="text" class="ntr-modal-input" id="bc-manual-input" placeholder="Enter barcode number" style="margin-bottom:0;" />
          <button id="btn-bc-fetch" class="ntr-btn" style="background:#2563eb; color:#fff; border:none; border-radius:6px; padding:0 14px; font-weight:700; font-size:0.75rem;">Lookup</button>
        </div>

        <div id="bc-result-preview" style="display:none; background:#18181b; border:1px solid #27272a; border-radius:6px; padding:10px; margin-bottom:10px;">
          <div id="bc-prod-name" style="font-weight:800; font-size:0.85rem; color:#fff;"></div>
          <div id="bc-prod-macros" style="font-size:0.75rem; color:#a1a1aa; margin-top:4px;"></div>
          <button id="btn-bc-use-prod" class="ntr-btn" style="width:100%; background:#059669; color:#fff; border:none; border-radius:6px; padding:8px; font-weight:700; font-size:0.78rem; margin-top:8px;">Add to Library</button>
        </div>

        <div style="display:flex; justify-content:flex-end;">
          <button id="btn-close-bc-modal" class="ntr-btn" style="padding:8px 14px; background:#18181b; border:1px solid #27272a; color:#fff; border-radius:6px; font-weight:700;">Close</button>
        </div>
      </div>
    </div>
  `;

  // Water interactions
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
  container.querySelectorAll(".ntr-water-node").forEach(node => {
    node.onclick = async () => {
      dayData.water = parseInt(node.dataset.vol, 10);
      await saveNutrition();
      renderMacroTracker();
    };
  });

  // Meal collapse & quick add
  container.querySelectorAll(".ntr-meal-header").forEach(mh => {
    mh.onclick = async (e) => {
      if (e.target.classList.contains('btn-quick-add')) return;
      const meal = mh.dataset.meal;
      dayData.mealCollapse[meal] = !dayData.mealCollapse[meal];
      await saveNutrition();
      renderMacroTracker();
    };
  });

  container.querySelectorAll(".btn-quick-add").forEach(qa => {
    qa.onclick = (e) => {
      e.stopPropagation();
      const targetMeal = qa.dataset.meal;
      logModal.style.display = "flex";
      container.querySelector("#ntr-custom-meal").value = targetMeal;
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
  });

  // Tap-to-edit row
  let activeEditingIndex = -1;
  const editModal = container.querySelector("#edit-row-modal");

  container.querySelectorAll(".ntr-row-item").forEach(row => {
    row.onclick = (e) => {
      if (e.target.classList.contains('btn-direct-del')) return;
      const idx = parseInt(row.dataset.idx, 10);
      if (isNaN(idx) || !dayData.items[idx]) return;
      activeEditingIndex = idx;
      const item = dayData.items[idx];

      container.querySelector("#edit-food-name").value = item.name;
      container.querySelector("#edit-food-meal").value = item.meal || "Snacks";
      container.querySelector("#edit-food-serving").value = item.serving || "100 g";
      container.querySelector("#edit-food-cals").value = item.cals;
      container.querySelector("#edit-food-p").value = item.p;
      container.querySelector("#edit-food-f").value = item.f;
      container.querySelector("#edit-food-c").value = item.c;

      editModal.style.display = "flex";
    };
  });

  container.querySelector("#btn-close-edit-modal").onclick = () => { editModal.style.display = "none"; };
  container.querySelector("#btn-close-edit-x").onclick = () => { editModal.style.display = "none"; };

  container.querySelector("#btn-save-edited-row").onclick = async () => {
    if (activeEditingIndex < 0 || !dayData.items[activeEditingIndex]) return;
    const item = dayData.items[activeEditingIndex];
    item.name = container.querySelector("#edit-food-name").value.trim() || item.name;
    item.meal = container.querySelector("#edit-food-meal").value;
    item.serving = container.querySelector("#edit-food-serving").value.trim() || item.serving;
    item.cals = parseFloat(container.querySelector("#edit-food-cals").value) || 0;
    item.p = parseFloat(container.querySelector("#edit-food-p").value) || 0;
    item.f = parseFloat(container.querySelector("#edit-food-f").value) || 0;
    item.c = parseFloat(container.querySelector("#edit-food-c").value) || 0;

    await saveNutrition();
    editModal.style.display = "none";
    renderMacroTracker();
  };

  container.querySelector("#btn-delete-active-row").onclick = async () => {
    if (activeEditingIndex >= 0) {
      dayData.items.splice(activeEditingIndex, 1);
      await saveNutrition();
      editModal.style.display = "none";
      renderMacroTracker();
    }
  };

  container.querySelectorAll(".btn-direct-del").forEach(btn => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.idx, 10);
      if (!isNaN(idx)) {
        dayData.items.splice(idx, 1);
        await saveNutrition();
        renderMacroTracker();
      }
    };
  });

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
      alert(`No entries found for yesterday (${yesterdayKey}).`);
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

  // Search & log modal
  const logModal = container.querySelector("#ntr-modal");
  const searchInp = container.querySelector("#ntr-search-food");
  const searchRes = container.querySelector("#ntr-search-res");
  const servInp = container.querySelector("#ntr-custom-serv");
  const unitInp = container.querySelector("#ntr-custom-unit");
  let selectedFoodRef = null;

  function renderSearchList(query) {
    const q = (query || "").toLowerCase();
    const sorted = [...foodLibrary].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    const filtered = sorted.filter(f => f.name.toLowerCase().includes(q));
    
    searchRes.innerHTML = filtered.map(f => `
      <div class="ntr-search-item" data-name="${f.name}">
        <div>
          <div style="font-weight:700; color:#ffffff; font-size:0.8rem;">
            ${f.name} ${!f.isBase ? '<span style="color:#fde68a; font-size:0.65rem; background:#27272a; padding:1px 4px; border-radius:3px;">Custom</span>' : ''}
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
  }

  servInp.oninput = () => {
    if (selectedFoodRef) updateScaledNutrients(servInp.value, selectedFoodRef);
  };

  container.querySelectorAll(".ntr-chip").forEach(ch => {
    ch.onclick = () => {
      if (!selectedFoodRef) return;
      let cur = parseFloat(servInp.value) || selectedFoodRef.serving;
      if (ch.dataset.mult) {
        cur = selectedFoodRef.serving * parseFloat(ch.dataset.mult);
      } else if (ch.dataset.add) {
        cur += parseFloat(ch.dataset.add);
      }
      servInp.value = Math.round(cur);
      updateScaledNutrients(servInp.value, selectedFoodRef);
    };
  });

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

    let microObj = {};
    if (selectedFoodRef) {
      const ratio = (parseFloat(servInp.value) || selectedFoodRef.serving) / selectedFoodRef.serving;
      microObj = {
        fiber: Math.round((selectedFoodRef.fiber || 0) * ratio * 10) / 10,
        calcium: Math.round((selectedFoodRef.calcium || 0) * ratio * 10) / 10,
        iron: Math.round((selectedFoodRef.iron || 0) * ratio * 10) / 10,
        magnesium: Math.round((selectedFoodRef.magnesium || 0) * ratio * 10) / 10,
        potassium: Math.round((selectedFoodRef.potassium || 0) * ratio * 10) / 10,
        sodium: Math.round((selectedFoodRef.sodium || 0) * ratio * 10) / 10,
        zinc: Math.round((selectedFoodRef.zinc || 0) * ratio * 10) / 10
      };
      await incrementFoodUsage(selectedFoodRef.name);
    }

    dayData.items.push({ name, meal, serving: serv, cals, p, f, c, ...microObj });
    await saveNutrition();
    logModal.style.display = "none";
    renderMacroTracker();
  };

  // Food library modal
  const libModal = container.querySelector("#food-library-modal");
  const libFilterInp = container.querySelector("#lib-filter-input");
  const libFoodsList = container.querySelector("#lib-foods-list");

  function renderLibraryList(query) {
    const q = (query || "").toLowerCase();
    const sorted = [...foodLibrary].sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0));
    const filtered = sorted.filter(f => f.name.toLowerCase().includes(q));

    if (filtered.length === 0) {
      libFoodsList.innerHTML = '<div style="padding:10px; color:#71717a; text-align:center; font-size:0.75rem;">No foods found. Click "+ New" to add.</div>';
      return;
    }

    libFoodsList.innerHTML = filtered.map(f => `
      <div class="ntr-search-item lib-item" data-name="${f.name}">
        <div style="flex:1;">
          <div style="font-weight:700; color:#ffffff; font-size:0.8rem;">
            ${f.name} ${!f.isBase ? '<span style="color:#fde68a; font-size:0.65rem; background:#202023; padding:1px 5px; border-radius:3px;">Custom</span>' : ''}
            <span style="color:#71717a; font-size:0.7rem;">(${f.serving} ${f.unit || 'g'})</span>
          </div>
          <div style="font-size:0.68rem; color:#a1a1aa;">${f.cals} kcal • P: ${f.p}g | F: ${f.f}g | C: ${f.c}g</div>
        </div>
        ${!f.isBase ? `<button class="ntr-del-btn btn-del-cf" data-name="${f.name}" title="Delete">✕</button>` : ''}
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

  // Custom food creator
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
    const autoLog = container.querySelector("#cf-auto-log").checked;

    const newFood = { name, serving: serv, unit, cals, p, f, c, isBase: false, usageCount: 1 };
    customFoods.push(newFood);
    await saveCustomFoods();

    if (autoLog) {
      dayData.items.push({ name, meal: "Snacks", serving: `${serv} ${unit}`, cals, p, f, c });
      await saveNutrition();
    }

    cfModal.style.display = "none";
    renderMacroTracker();
  };

  // Meal builder
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
        <div class="ntr-row-item" style="grid-template-columns: 2fr 1fr 20px; padding: 4px 0;">
          <div style="font-size:0.75rem; color:#fff;">${ing.name} <span style="color:#71717a;">(${ing.qty}g)</span></div>
          <div style="font-size:0.72rem; color:#f59e0b; text-align:right;">${ing.cals.toFixed(0)} kcal</div>
          <button class="ntr-del-btn btn-del-ing" data-idx="${idx}">✕</button>
        </div>
      `;
    }).join("");

    if (activeMealIngredients.length === 0) {
      mbIngList.innerHTML = '<div style="color:#71717a; font-size:0.72rem; text-align:center;">No ingredients added</div>';
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
      meal: "Lunch",
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

  // Barcode scanner
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
    const cached = customFoods.find(f => f.barcode === barcode);
    if (cached) {
      scannedProductData = { ...cached };
      bcProdName.textContent = `${cached.name} (Cached)`;
      bcProdMacros.textContent = `Per ${cached.serving}${cached.unit}: ${cached.cals} kcal | P: ${cached.p}g | F: ${cached.f}g | C: ${cached.c}g`;
      bcPreview.style.display = "block";
      bcStatus.textContent = "Product loaded from offline cache";
      stopCamera();
      return;
    }

    bcStatus.textContent = `Connecting to database (${barcode})...`;
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
          barcode: barcode,
          serving: 100,
          unit: "g",
          cals: Math.round(cals * 10) / 10,
          p: Math.round(p * 10) / 10,
          f: Math.round(f * 10) / 10,
          c: Math.round(c * 10) / 10,
          isBase: false,
          usageCount: 1
        };

        if (!customFoods.some(f => f.name === name)) {
          customFoods.push(scannedProductData);
          await saveCustomFoods();
        }

        bcProdName.textContent = name;
        bcProdMacros.textContent = `Per 100g: ${scannedProductData.cals} kcal | P: ${scannedProductData.p}g | F: ${scannedProductData.f}g | C: ${scannedProductData.c}g`;
        bcPreview.style.display = "block";
        bcStatus.textContent = "Product identified & cached";
        stopCamera();
      } else {
        bcStatus.textContent = "Product not found. Try manual entry.";
      }
    } catch (err) {
      bcStatus.textContent = "Network error connecting to database.";
    }
  }

  async function startCamera() {
    scannedProductData = null;
    bcPreview.style.display = "none";
    bcStatus.textContent = "Starting camera...";
    try {
      videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      bcVideo.srcObject = videoStream;
      await bcVideo.play();
      bcStatus.textContent = "Camera active. Center barcode.";

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
        bcStatus.textContent = "Camera active. (Enter barcode below if browser lacks scanner API)";
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
    logModal.style.display = "flex";

    selectedFoodRef = scannedProductData;
    container.querySelector("#ntr-custom-name").value = scannedProductData.name;
    servInp.value = scannedProductData.serving;
    unitInp.value = scannedProductData.unit;
    updateScaledNutrients(scannedProductData.serving, scannedProductData);
  };
}

renderMacroTracker();

} catch (err) {
  dv.paragraph("Daily Macro Tracker Error: " + err.message);
}
}
initDailyMacroTracker();