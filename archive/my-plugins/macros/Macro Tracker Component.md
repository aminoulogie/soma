```dataviewjs
async function initUnifiedMacroTracker() {
// ============================================================================
// 1. DATA SOURCE & PERSISTENCE (soma-nutrition.json)
// ============================================================================
const nutritionFilePath = "apps/scripts/soma-nutrition.json";
const historyFilePath = "apps/scripts/soma-history.json";
const noteDateKey = dv.current().file.name.slice(0, 10);

let nutritionDB = {};
const nFile = app.vault.getAbstractFileByPath(nutritionFilePath);
if (nFile) {
  try { nutritionDB = JSON.parse(await app.vault.read(nFile)); } catch (e) {}
}

let historyDB = {};
const hFile = app.vault.getAbstractFileByPath(historyFilePath);
if (hFile) {
  try { historyDB = JSON.parse(await app.vault.read(hFile)); } catch (e) {}
}

const todayWorkout = historyDB[noteDateKey] || {};
const exerciseCaloriesBurned = todayWorkout.caloriesBurned || 0;

const foodLibrary = [
  { name: "Whole Eggs", serving: 100, unit: "g", cals: 143, p: 13.0, c: 0.7, f: 9.9 },
  { name: "Chicken Breast (Cooked)", serving: 100, unit: "g", cals: 165, p: 31.0, c: 0.0, f: 3.6 },
  { name: "White Rice (Cooked)", serving: 150, unit: "g", cals: 195, p: 4.1, c: 43.0, f: 0.4 },
  { name: "Egg Whites", serving: 100, unit: "g", cals: 52, p: 11.0, c: 0.7, f: 0.2 },
  { name: "Oatmeal (Dry)", serving: 50, unit: "g", cals: 190, p: 6.5, c: 34.0, f: 3.5 },
  { name: "Whey Protein Isolate", serving: 30, unit: "g", cals: 120, p: 25.0, c: 1.5, f: 1.0 },
  { name: "Greek / Plain Yogurt", serving: 150, unit: "g", cals: 90, p: 15.0, c: 5.0, f: 0.5 },
  { name: "Canned Tuna", serving: 120, unit: "g", cals: 130, p: 29.0, c: 0.0, f: 1.0 },
  { name: "Pasta (Dry)", serving: 80, unit: "g", cals: 280, p: 10.0, c: 58.0, f: 1.2 },
  { name: "Olive Oil", serving: 14, unit: "g", cals: 120, p: 0.0, c: 0.0, f: 14.0 },
  { name: "Peanut Butter", serving: 32, unit: "g", cals: 190, p: 8.0, c: 7.0, f: 16.0 },
  { name: "Banana", serving: 118, unit: "g", cals: 105, p: 1.3, c: 27.0, f: 0.3 }
];

const defaultGoals = {
  cals: 2400,
  protein: 160,
  carbs: 260,
  fat: 70
};

if (!nutritionDB[noteDateKey]) {
  nutritionDB[noteDateKey] = {
    goals: { ...defaultGoals },
    summaryOpen: true,
    tableOpen: true,
    items: []
  };
}

const dayData = nutritionDB[noteDateKey];
if (!dayData.goals) dayData.goals = { ...defaultGoals };
if (dayData.summaryOpen === undefined) dayData.summaryOpen = true;
if (dayData.tableOpen === undefined) dayData.tableOpen = true;
if (!dayData.items) dayData.items = [];

async function saveNutrition() {
  let file = app.vault.getAbstractFileByPath(nutritionFilePath);
  if (!file) {
    await app.vault.create(nutritionFilePath, JSON.stringify(nutritionDB, null, 2));
  } else {
    await app.vault.modify(file, JSON.stringify(nutritionDB, null, 2));
  }
}

// ============================================================================
// 2. STYLES (SLIM FLEXBOX ROWS, NO TABLE BLOAT)
// ============================================================================
const macroRoot = dv.el("div", "", { cls: "ntr-root-container" });

const style = document.createElement("style");
style.textContent = `
  .ntr-root-container {
    max-width: 680px;
    margin: 0 auto;
    font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    color: #f4f4f5;
    display: flex;
    flex-direction: column;
    gap: 8px;
    box-sizing: border-box;
  }

  .ntr-card {
    background: #18181b;
    border: 1px solid #27272a;
    border-radius: 10px;
    overflow: hidden;
  }
  .ntr-accordion-bar {
    background: #202023;
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    user-select: none;
  }
  .ntr-accordion-title {
    font-size: 0.92rem;
    font-weight: 800;
    color: #f4f4f5;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ntr-accordion-cals {
    font-size: 0.8rem;
    font-weight: 700;
    color: #a1a1aa;
    margin-right: 8px;
  }
  .ntr-arrow {
    color: #a1a1aa;
    font-size: 0.75rem;
    transition: transform 0.2s ease;
  }
  .ntr-arrow.closed { transform: rotate(-90deg); }

  .ntr-tiles-body {
    padding: 12px;
    background: #18181b;
  }
  .ntr-tiles-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  .ntr-tile {
    background: #202023;
    border: 1px solid #2e2e32;
    border-radius: 8px;
    padding: 8px 10px;
    position: relative;
    overflow: hidden;
  }
  .ntr-tile-accent {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3.5px;
  }
  .ntr-tile-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .ntr-tile-lbl { font-size: 0.68rem; font-weight: 700; color: #a1a1aa; }
  .ntr-tile-pct { font-size: 0.65rem; font-weight: 700; color: #71717a; }
  .ntr-tile-val {
    font-size: 0.95rem;
    font-weight: 800;
    color: #ffffff;
    margin-top: 3px;
  }
  .ntr-tile-bar-bg {
    height: 4px;
    background: #2e2e34;
    border-radius: 999px;
    overflow: hidden;
    margin-top: 6px;
  }
  .ntr-tile-bar-fill { height: 100%; border-radius: 999px; }

  .acc-cals { background: #f59e0b; color: #f59e0b; }
  .acc-prot { background: #10b981; color: #10b981; }
  .acc-fat  { background: #ef4444; color: #ef4444; }
  .acc-carb { background: #0ea5e9; color: #0ea5e9; }

  /* COMPACT FLEX ROW LIST (REPLACES TABLES) */
  .ntr-list-head {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 30px;
    background: #18181b;
    border-bottom: 1px solid #27272a;
    padding: 6px 10px;
    font-size: 0.7rem;
    font-weight: 800;
    color: #a1a1aa;
  }
  .ntr-row-item {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1fr 30px;
    align-items: center;
    padding: 6px 10px;
    border-bottom: 1px solid #222226;
    font-size: 0.76rem;
    font-weight: 700;
    color: #f4f4f5;
    transition: background 0.15s ease;
  }
  .ntr-row-item:hover { background: #202024; }
  .ntr-row-item:last-child { border-bottom: none; }

  .col-cals { border-left: 2px solid #f59e0b; padding-left: 8px; }
  .col-prot { border-left: 2px solid #10b981; padding-left: 8px; }
  .col-fat  { border-left: 2px solid #ef4444; padding-left: 8px; }
  .col-carb { border-left: 2px solid #0ea5e9; padding-left: 8px; }

  .ntr-sub-bar-bg {
    height: 3px;
    background: #27272a;
    border-radius: 999px;
    width: 100%;
    margin-top: 2px;
    overflow: hidden;
  }
  .ntr-sub-bar-fill { height: 100%; border-radius: 999px; }

  .ntr-del-btn {
    background: #27272a;
    border: none;
    color: #a1a1aa;
    cursor: pointer;
    font-size: 0.7rem;
    border-radius: 4px;
    width: 20px;
    height: 20px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s ease;
  }
  .ntr-del-btn:hover { background: #ef4444; color: #ffffff; }

  .ntr-add-btn {
    width: 100%;
    background: #202023;
    border: none;
    border-top: 1px solid #27272a;
    color: #d4d4d8;
    font-size: 0.75rem;
    font-weight: 800;
    padding: 8px;
    cursor: pointer;
    text-align: center;
    transition: all 0.15s ease;
  }
  .ntr-add-btn:hover { background: #27272a; color: #ffffff; }

  /* MODAL */
  .ntr-modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 3000; align-items: center; justify-content: center; }
  .ntr-modal-box { background: #18181b; border: 1px solid #3f3f46; border-radius: 12px; padding: 18px; width: 92%; max-width: 420px; box-shadow: 0 16px 45px rgba(0,0,0,0.9); }
  .ntr-modal-title { font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 10px; }
  .ntr-modal-input { width: 100%; height: 36px; background: #202023; border: 1px solid #2e2e32; color: #fff; border-radius: 8px; padding: 6px 10px; font-weight: 700; font-size: 0.82rem; box-sizing: border-box; outline: none; margin-bottom: 8px; }
  .ntr-search-results { max-height: 140px; overflow-y: auto; border: 1px solid #27272a; border-radius: 8px; background: #202023; margin-bottom: 12px; }
  .ntr-search-item { padding: 8px 10px; border-bottom: 1px solid #27272a; cursor: pointer; }
  .ntr-search-item:hover { background: #27272a; }

  .ntr-macro-input-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 12px; }
  .ntr-mini-lbl { font-size: 0.62rem; font-weight: 800; color: #71717a; text-transform: uppercase; margin-bottom: 2px; }
  .ntr-mini-inp { width: 100%; height: 34px; background: #202023; border: 1px solid #2e2e32; color: #fff; border-radius: 6px; text-align: center; font-weight: 800; font-size: 0.8rem; box-sizing: border-box; }
`;
macroRoot.appendChild(style);

// ============================================================================
// 3. UI RENDERING & DATA BINDINGS
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

  const goalCals = dayData.goals.cals;
  const calsPct = Math.min(100, Math.round((totalCals / (goalCals + exerciseCaloriesBurned)) * 100));
  const protPct = Math.min(100, Math.round((totalProtein / dayData.goals.protein) * 100));
  const fatPct = Math.min(100, Math.round((totalFat / dayData.goals.fat) * 100));
  const carbsPct = Math.min(100, Math.round((totalCarbs / dayData.goals.carbs) * 100));

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
    <!-- 1. MACROS SUMMARY CARD -->
    <div class="ntr-card">
      <div class="ntr-accordion-bar" id="toggle-summary">
        <span class="ntr-accordion-title">Macros summary</span>
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

    <!-- 2. UNIFIED LOGGED ITEMS CARD -->
    <div class="ntr-card">
      <div class="ntr-accordion-bar" id="toggle-table">
        <span class="ntr-accordion-title">Nutrition Log</span>
        <div style="display: flex; align-items: center;">
          <span class="ntr-accordion-cals">${totalCals.toFixed(1)} kcal</span>
          <span class="ntr-arrow ${dayData.tableOpen ? '' : 'closed'}">▼</span>
        </div>
      </div>
      <div style="display: ${dayData.tableOpen ? 'block' : 'none'};">
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
          ${rowsHtml || `<div style="text-align:center; padding: 12px; color:#52525b; font-size:0.75rem;">No items logged yet today</div>`}
        </div>
        <button class="ntr-add-btn" id="btn-open-modal">+ Add Food</button>
      </div>
    </div>

    <!-- 3. ADD FOOD MODAL -->
    <div class="ntr-modal-overlay" id="ntr-modal">
      <div class="ntr-modal-box">
        <div class="ntr-modal-title">Log Food Item</div>
        <input type="text" class="ntr-modal-input" id="ntr-search-food" placeholder="🔍 Search library (Eggs, Rice, Chicken...)" />
        <div class="ntr-search-results" id="ntr-search-res"></div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px; margin: 8px 0 4px 0;">
          <input type="text" class="ntr-modal-input" id="ntr-custom-name" placeholder="Food Name (e.g. Whole Eggs)" />
          <select class="ntr-modal-input" id="ntr-custom-meal" style="cursor:pointer;">
            <option value="Breakfast">Breakfast</option>
            <option value="Lunch">Lunch</option>
            <option value="Dinner">Dinner</option>
            <option value="Snack">Snack</option>
          </select>
        </div>

        <div style="display:grid; grid-template-columns: 2fr 1fr; gap:6px;">
          <input type="text" class="ntr-modal-input" id="ntr-custom-serv" placeholder="Serving Size (e.g. 100)" />
          <input type="text" class="ntr-modal-input" id="ntr-custom-unit" placeholder="Unit (e.g. g / ml)" value="g" />
        </div>

        <div class="ntr-macro-input-grid">
          <div>
            <div class="ntr-mini-lbl">Calories</div>
            <input type="number" class="ntr-mini-inp" id="ntr-in-cals" placeholder="143" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Protein (g)</div>
            <input type="number" class="ntr-mini-inp" id="ntr-in-p" placeholder="13" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Fat (g)</div>
            <input type="number" class="ntr-mini-inp" id="ntr-in-f" placeholder="9.9" />
          </div>
          <div>
            <div class="ntr-mini-lbl">Carbs (g)</div>
            <input type="number" class="ntr-mini-inp" id="ntr-in-c" placeholder="0.7" />
          </div>
        </div>

        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top: 10px;">
          <button id="btn-close-ntr-modal" style="padding:6px 14px; background:#27272a; border:none; color:#fff; border-radius:8px; cursor:pointer; font-weight:700;">Cancel</button>
          <button id="btn-save-ntr-food" style="padding:6px 16px; background:#3f3f46; border:none; color:#fff; border-radius:8px; font-weight:800; cursor:pointer;">+ Add Item</button>
        </div>
      </div>
    </div>
  `;

  // Accordion Toggles
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

  // Delete item handler
  container.querySelectorAll(".ntr-del-btn").forEach(btn => {
    btn.onclick = async () => {
      const idx = parseInt(btn.dataset.idx, 10);
      dayData.items.splice(idx, 1);
      await saveNutrition();
      renderMacroTracker();
    };
  });

  // Modal handlers
  const modal = container.querySelector("#ntr-modal");
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
    if (selectedFoodRef) {
      updateScaledNutrients(servInp.value, selectedFoodRef);
    }
  };

  container.querySelector("#btn-open-modal").onclick = () => {
    modal.style.display = "flex";
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
  container.querySelector("#btn-close-ntr-modal").onclick = () => { modal.style.display = "none"; };

  container.querySelector("#btn-save-ntr-food").onclick = async () => {
    const name = container.querySelector("#ntr-custom-name").value.trim() || "Food Item";
    const meal = container.querySelector("#ntr-custom-meal").value;
    const serv = `${servInp.value.trim() || "100"} ${unitInp.value.trim() || "g"}`;
    const cals = parseFloat(container.querySelector("#ntr-in-cals").value) || 0;
    const p = parseFloat(container.querySelector("#ntr-in-p").value) || 0;
    const f = parseFloat(container.querySelector("#ntr-in-f").value) || 0;
    const c = parseFloat(container.querySelector("#ntr-in-c").value) || 0;

    dayData.items.push({
      name: name,
      meal: meal,
      serving: serv,
      cals: cals,
      p: p,
      f: f,
      c: c
    });

    await saveNutrition();
    modal.style.display = "none";
    renderMacroTracker();
  };
}

renderMacroTracker();
}
initUnifiedMacroTracker();





```