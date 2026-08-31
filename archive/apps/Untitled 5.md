```dataviewjs
// ============================================================================
// 1. DATA SOURCE LOADING (soma-data.json & muscleRegistry.json)
// ============================================================================
const dataFile = app.vault.getAbstractFileByPath("apps/scripts/soma-data.json");
const registryFile = app.vault.getAbstractFileByPath("apps/scripts/muscleRegistry.json");

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

// Start all muscles at 100% Fresh (Green)
for (const k in muscleRegistry) {
    muscleRegistry[k].recovery = 100;
}

// ============================================================================
// 2. BIOMECHANICS & MICRO-MUSCLE DATABASE
// ============================================================================
const exerciseDB = [
  // CHEST
  { name: "Incline Dumbbell Press", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Incline Barbell Bench", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Smith Machine Incline Press", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Low-to-High Cable Fly", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", targetKeys: ["chest"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Flat Barbell Bench Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Flat Dumbbell Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Pec Deck Fly (Machine)", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Chest Dips", muscle: "Chest", subTarget: "Lower Pec (Costal)", targetKeys: ["chest", "triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Machine Chest Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", targetKeys: ["chest"], position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier" },

  // BACK
  { name: "Lat Pulldown (Wide/Neutral)", muscle: "Back", subTarget: "Lats (Vertical Pull)", targetKeys: ["upper_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Pull-ups / Weighted Chin-ups", muscle: "Back", subTarget: "Lats (Vertical Pull)", targetKeys: ["upper_back", "biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier" },
  { name: "Single-Arm Lat Cable Row", muscle: "Back", subTarget: "Lats (Iliac / Lower)", targetKeys: ["upper_back"], position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Chest-Supported T-Bar Row", muscle: "Back", subTarget: "Upper Back / Rhomboids", targetKeys: ["trapezius_back", "upper_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Meadows Row", muscle: "Back", subTarget: "Upper Lats & Teres Major", targetKeys: ["upper_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Barbell Bent-Over Row", muscle: "Back", subTarget: "Upper Back / Lats", targetKeys: ["upper_back", "trapezius_back", "lower_back"], position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Seated Cable Row (Wide)", muscle: "Back", subTarget: "Upper Back / Mid-Traps", targetKeys: ["trapezius_back", "upper_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier" },
  { name: "Barbell Deadlift", muscle: "Back", subTarget: "Erectors / Posterior Chain", targetKeys: ["lower_back", "hamstring", "gluteal"], position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Hyperextensions", muscle: "Back", subTarget: "Lower Back (Erectors)", targetKeys: ["lower_back", "gluteal"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier" },

  // SHOULDERS
  { name: "Standing Overhead Press (OHP)", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", targetKeys: ["deltoids", "triceps", "triceps_back"], position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Seated Dumbbell Shoulder Press", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", targetKeys: ["deltoids", "triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Cable Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", targetKeys: ["deltoids", "deltoids_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Cable Y-Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", targetKeys: ["deltoids", "deltoids_back"], position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Dumbbell Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", targetKeys: ["deltoids", "deltoids_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier" },
  { name: "Machine Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", targetKeys: ["deltoids", "deltoids_back"], position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Face Pulls", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", targetKeys: ["deltoids_back", "trapezius_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Reverse Pec Deck", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", targetKeys: ["deltoids_back"], position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Incline Rear Delt DB Flyes", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", targetKeys: ["deltoids_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier" },

  // ARMS
  { name: "Incline Dumbbell Curl", muscle: "Biceps", subTarget: "Long Head (Peak)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Bayesian Cable Curl", muscle: "Biceps", subTarget: "Long Head (Peak)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Preacher Curl (Machine/EZ)", muscle: "Biceps", subTarget: "Short Head (Inner)", targetKeys: ["biceps"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Hammer Curl (Dumbbell/Cable)", muscle: "Biceps", subTarget: "Brachialis & Forearms", targetKeys: ["biceps"], position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Overhead Dual Cable Extension", muscle: "Triceps", subTarget: "Long Head Triceps", targetKeys: ["triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Incline EZ Skull Crushers", muscle: "Triceps", subTarget: "Long Head Triceps", targetKeys: ["triceps", "triceps_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Cable Triceps Pushdown (Straight/V)", muscle: "Triceps", subTarget: "Lateral & Medial Head", targetKeys: ["triceps", "triceps_back"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },

  // LEGS & CALVES
  { name: "Hack Squat", muscle: "Legs", subTarget: "Quads (Knee Extensors)", targetKeys: ["quadriceps", "gluteal"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Barbell Back Squat", muscle: "Legs", subTarget: "Quads & Glutes", targetKeys: ["quadriceps", "gluteal", "lower_back"], position: "Lengthened (Stretch)", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Leg Press", muscle: "Legs", subTarget: "Quads & Adductors", targetKeys: ["quadriceps", "adductors"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Leg Extensions", muscle: "Legs", subTarget: "Rectus Femoris", targetKeys: ["quadriceps"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Romanian Deadlift (DB/Barbell)", muscle: "Legs", subTarget: "Hamstrings (Lengthened)", targetKeys: ["hamstring", "gluteal", "lower_back"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier" },
  { name: "Seated Leg Curl", muscle: "Legs", subTarget: "Hamstrings (Knee Flexion)", targetKeys: ["hamstring"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Bulgarian Split Squat", muscle: "Legs", subTarget: "Glutes & Quads", targetKeys: ["gluteal", "quadriceps", "adductors"], position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier" },
  { name: "Barbell / Machine Hip Thrust", muscle: "Legs", subTarget: "Glutes (Maximus)", targetKeys: ["gluteal"], position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Standing Machine Calf Raise", muscle: "Legs", subTarget: "Calves (Gastrocnemius)", targetKeys: ["calves", "calves_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Seated Calf Raise Machine", muscle: "Legs", subTarget: "Calves (Soleus)", targetKeys: ["calves", "calves_back"], position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" }
];

const routinePresets = {
  "Push (Chest/Delts/Triceps)": [
    { name: "Incline Dumbbell Press" },
    { name: "Flat Dumbbell Press" },
    { name: "Cable Lateral Raise" },
    { name: "Overhead Dual Cable Extension" },
    { name: "Cable Triceps Pushdown (Straight/V)" }
  ],
  "Pull (Back/RearDelts/Biceps)": [
    { name: "Lat Pulldown (Wide/Neutral)" },
    { name: "Chest-Supported T-Bar Row" },
    { name: "Face Pulls" },
    { name: "Incline Dumbbell Curl" },
    { name: "Hammer Curl (Dumbbell/Cable)" }
  ],
  "Legs (Quads/Hams/Glutes/Calves)": [
    { name: "Hack Squat" },
    { name: "Romanian Deadlift (DB/Barbell)" },
    { name: "Leg Extensions" },
    { name: "Seated Leg Curl" },
    { name: "Standing Machine Calf Raise" },
    { name: "Seated Calf Raise Machine" }
  ]
};

const splitRequiredHeads = {
  "Push": ["Upper Pec (Clavicular)", "Mid/Lower Pec (Sternal)", "Side Delt (Lateral)", "Long Head Triceps", "Lateral & Medial Head"],
  "Pull": ["Lats (Vertical Pull)", "Upper Back / Rhomboids", "Rear Delt (Posterior)", "Long Head (Peak)", "Brachialis & Forearms"],
  "Legs": ["Quads (Knee Extensors)", "Hamstrings (Lengthened)", "Hamstrings (Knee Flexion)", "Calves (Gastrocnemius)", "Calves (Soleus)"]
};

// ============================================================================
// 3. COLOR TIERS & HEATMAP THEME
// ============================================================================
const HEAT_TIERS = {
    fresh:    { base: "#22c55e", light: "#a7f3c8", dark: "#0f2e1c" },
    low:      { base: "#eab308", light: "#fde68a", dark: "#3f2f08" },
    moderate: { base: "#f97316", light: "#fdc493", dark: "#3f200a" },
    high:     { base: "#ef4444", light: "#fca5a5", dark: "#3f1212" },
};

function getTier(recovery) {
    if (recovery >= 85) return HEAT_TIERS.fresh;
    if (recovery >= 60) return HEAT_TIERS.low;
    if (recovery >= 35) return HEAT_TIERS.moderate;
    return HEAT_TIERS.high;
}

const INACTIVE_FILL = "#3a4150";
const INACTIVE_STROKE = "#20242c";
const SELECT_BLUE = "#38bdf8";

// ============================================================================
// 4. UNIFIED CONTAINER & COMPLETE CSS
// ============================================================================
const masterRoot = dv.el("div", "", { cls: "unified-gym-app" });

const styleSheet = document.createElement("style");
styleSheet.textContent = `
  .unified-gym-app {
    max-width: 680px;
    margin: 0 auto;
    font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    color: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-sizing: border-box;
  }

  .wk-app {
    background: #070d19;
    border: 1px solid #1e293b;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 16px 45px rgba(0,0,0,0.65);
    box-sizing: border-box;
    position: relative;
    width: 100%;
  }
  .wk-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .wk-badge { background: #2563eb; color: #ffffff; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 9px; border-radius: 999px; }
  .wk-live-duration { background: #0f172a; border: 1px solid #1e293b; color: #38bdf8; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; font-variant-numeric: tabular-nums; }
  
  .wk-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
  .wk-stat-box { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 10px; text-align: center; }
  .wk-stat-lbl { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .wk-stat-val { font-size: 1.15rem; font-weight: 800; color: #38bdf8; margin-top: 3px; }

  .wk-timer-radial-dock { display: flex; align-items: center; justify-content: space-between; background: #0c1e3d; border: 1px solid #1d4ed8; border-radius: 16px; padding: 10px 16px; margin-bottom: 14px; }
  .wk-timer-ring-box { position: relative; width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; }
  .wk-timer-ring-svg { transform: rotate(-90deg); }
  .wk-timer-ring-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 4; }
  .wk-timer-ring-bar { fill: none; stroke: #38bdf8; stroke-width: 4; stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
  .wk-timer-ring-txt { position: absolute; font-size: 0.75rem; font-weight: 800; color: #ffffff; font-variant-numeric: tabular-nums; }
  .wk-timer-btn { background: #11264c; border: 1px solid #1e40af; color: #cbd5e1; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
  .wk-timer-btn:hover { background: #1d4ed8; color: #ffffff; }

  .wk-gap-box { background: #111e38; border: 1px solid #1e3a8a; border-radius: 12px; padding: 10px 14px; margin-bottom: 14px; font-size: 0.78rem; }
  .wk-gap-title { font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
  .wk-gap-items { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
  .wk-gap-chip { background: #172554; border: 1px solid #2563eb; color: #93c5fd; padding: 3px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; cursor: pointer; }
  .wk-gap-chip:hover { background: #2563eb; color: white; }

  .wk-action-row { display: flex; gap: 8px; margin-bottom: 14px; }
  .wk-btn { flex: 1; background: #0f172a; color: #ffffff; border: 1px solid #1e293b; border-radius: 10px; padding: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; text-align: center; transition: all 0.15s ease; }
  .wk-btn:hover { background: #1e293b; border-color: #334155; }
  .wk-btn-save { background: #064e3b; border-color: #059669; color: #a7f3d0; }
  .wk-btn-save:hover { background: #047857; color: #ffffff; }

  .wk-card { background: #0b1324; border: 1px solid #172554; border-radius: 16px; padding: 16px; margin-bottom: 14px; }
  .wk-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
  .wk-card-title { font-weight: 800; font-size: 0.95rem; color: #ffffff; }
  .wk-tag-container { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }
  .wk-tag { font-size: 0.63rem; font-weight: 700; padding: 2px 7px; border-radius: 5px; }
  .wk-tag-sub { background: #172554; color: #38bdf8; }
  .wk-tag-pos { background: #1e293b; color: #cbd5e1; }
  .wk-tag-risk { background: rgba(239,68,68,0.15); color: #fca5a5; }
  .wk-tag-risk.green { background: rgba(16,185,129,0.15); color: #86efac; }
  .wk-tag-tier { background: #312e81; color: #c7d2fe; font-weight: 800; }
  .wk-tag-warn { background: rgba(245,158,11,0.2); color: #fcd34d; font-weight: 800; }
  .wk-tag-1rm { background: rgba(56,189,248,0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); }

  .wk-set-row { display: grid; grid-template-columns: 24px 1fr 1fr 1fr 34px 22px; gap: 8px; align-items: center; margin-bottom: 7px; padding: 4px; border-radius: 8px; transition: all 0.25s ease; }
  .wk-th { font-size: 0.62rem; font-weight: 800; color: #64748b; text-transform: uppercase; text-align: center; }
  .wk-input { background: #0f1c38; border: 1px solid #1e3a8a; border-radius: 8px; color: #38bdf8; font-weight: 700; padding: 6px 4px; text-align: center; font-size: 0.88rem; width: 100%; outline: none; box-sizing: border-box; height: 36px; }
  .wk-input.kg-clickable { cursor: pointer; }
  .wk-input:focus { border-color: #60a5fa; background: #172554; color: #ffffff; }
  .wk-check { width: 22px; height: 22px; accent-color: #3b82f6; cursor: pointer; margin: 0 auto; }
  .wk-set-row.row-done { background: rgba(16, 185, 129, 0.08); box-shadow: inset 0 0 0 1px rgba(16,185,129,0.25); }
  .wk-set-row.row-done .wk-input { border-color: #059669; color: #34d399; background: #062820; }
  .wk-set-row.row-done .wk-check { accent-color: #10b981; }
  .wk-btn-del { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.95rem; font-weight: 700; }
  .wk-btn-addset { width: 100%; background: rgba(56, 189, 248, 0.04); border: 1px dashed #1e3a8a; border-radius: 8px; color: #38bdf8; font-size: 0.75rem; font-weight: 700; padding: 7px; margin-top: 8px; cursor: pointer; }

  .wk-recap-screen { background: #070d19; border-radius: 20px; box-sizing: border-box; }
  .wk-recap-head { text-align: center; padding: 10px 0 18px 0; border-bottom: 1px solid #1e293b; margin-bottom: 16px; }
  .wk-recap-title { font-size: 1.4rem; font-weight: 800; color: #ffffff; margin: 6px 0 0 0; }
  .wk-recap-badge { background: #059669; color: #ffffff; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.08em; display: inline-block; }
  .wk-recap-card { background: #0b1324; border: 1px solid #172554; border-radius: 16px; padding: 14px 16px; margin-bottom: 12px; }
  .wk-recap-set-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: #94a3b8; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
  .wk-btn-new-session { width: 100%; background: #2563eb; color: #ffffff; border: none; border-radius: 10px; padding: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; margin-top: 14px; }
  .wk-btn-new-session:hover { background: #1d4ed8; }

  .wk-plate-modal { display: none; position: absolute; z-index: 1100; background: #0b1324; border: 1px solid #3b82f6; border-radius: 14px; padding: 14px; box-shadow: 0 12px 35px rgba(0,0,0,0.85); width: 260px; left: 50%; top: 50%; transform: translate(-50%, -50%); }
  .wk-plate-bar-visual { display: flex; align-items: center; justify-content: center; height: 50px; background: #070d19; border-radius: 8px; margin: 10px 0; padding: 0 8px; border: 1px solid #1e293b; gap: 3px; }
  .wk-plate-sleeve { width: 14px; height: 10px; background: #94a3b8; border-radius: 2px; }
  .wk-plate-disc { border-radius: 3px; display: inline-block; }
  .wk-disc-25 { background: #ef4444; width: 8px; height: 38px; }
  .wk-disc-20 { background: #3b82f6; width: 8px; height: 34px; }
  .wk-disc-15 { background: #eab308; width: 7px; height: 30px; }
  .wk-disc-10 { background: #10b981; width: 7px; height: 26px; }
  .wk-disc-5  { background: #ffffff; width: 6px; height: 22px; }
  .wk-disc-25s{ background: #64748b; width: 5px; height: 18px; }

  .bm3-root {
    background: radial-gradient(circle at 50% 0%, #131c2c 0%, #080b12 65%);
    border: 1px solid rgba(96,165,250,0.14);
    border-radius: 20px;
    padding: 22px 20px;
    box-sizing: border-box;
    width: 100%;
  }
  .bm3-header { text-align: center; margin-bottom: 14px; }
  .bm3-title { font-size: 1.35rem; font-weight: 800; color: #f1f5f9; display: flex; align-items: center; justify-content: center; gap: 8px; }
  .bm3-title .bm3-icon { color: #38bdf8; }
  .bm3-subtitle { color: #64748b; font-size: 0.8rem; margin-top: 4px; }

  .bm3-viewtabs { display: flex; justify-content: center; gap: 6px; margin: 12px 0 14px; }
  .bm3-viewtab {
    background: rgba(148,163,184,0.06);
    border: 1px solid rgba(148,163,184,0.16);
    color: #94a3b8;
    padding: 6px 18px;
    border-radius: 999px;
    font-size: 0.75rem;
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

  .bm3-layout { display: flex; align-items: center; justify-content: center; gap: 14px; flex-wrap: wrap; }
  .bm3-panel {
    background: rgba(15,23,36,0.7);
    border: 1px solid rgba(148,163,184,0.1);
    border-radius: 12px;
    padding: 12px;
    width: 130px;
    flex-shrink: 0;
  }
  .bm3-panel-title { font-size: 0.65rem; letter-spacing: 0.08em; color: #64748b; font-weight: 700; margin-bottom: 10px; }
  .bm3-legend-row { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
  .bm3-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
  .bm3-legend-text { font-size: 0.75rem; line-height: 1.2; }
  .bm3-legend-text .sub { display: block; font-size: 0.65rem; color: #64748b; }

  .bm3-viewport { position: relative; width: 220px; height: 440px; flex-shrink: 0; margin: 0 auto; }
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
    filter: saturate(1.2) brightness(1.2) drop-shadow(0 0 9px currentColor);
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
    margin-top: 18px;
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
  .bm3-detail-name { font-size: 1.05rem; font-weight: 800; color: #f8fafc; }
  .bm3-detail-hours { color: #38bdf8; font-size: 0.78rem; font-weight: 700; margin: 3px 0 6px; display: flex; align-items: center; gap: 6px; }
  .bm3-detail-desc { color: #94a3b8; font-size: 0.8rem; max-width: 460px; line-height: 1.35; }
  .bm3-detail-tag {
    padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.75rem;
    color: #fff; white-space: nowrap; flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .bm3-panel { display: none; }
  }
`;
masterRoot.appendChild(styleSheet);

// ============================================================================
// 5. APPLICATION STATE
// ============================================================================
let activeSplitCategory = "Push";
let sessionExercises = [];
let sessionStartTime = Date.now();
let timerInterval = null;
let timerSeconds = 90;
let timerTotal = 90;
let durationInterval = null;

let currentView = "front";
let selectedKey = null;
let selectedPoint = null;
let activePresetKeys = null;

// ============================================================================
// 6. DYNAMIC FATIGUE ENGINE
// ============================================================================
function recalculateMuscleFatigue() {
  if (activePresetKeys) return;

  for (const k in muscleRegistry) {
    muscleRegistry[k].recovery = 100;
  }

  const setCounts = {};
  sessionExercises.forEach(ex => {
    const doneCount = ex.sets.filter(s => s.done).length;
    if (doneCount > 0 && ex.targetKeys) {
      ex.targetKeys.forEach(k => {
        setCounts[k] = (setCounts[k] || 0) + doneCount;
      });
    }
  });

  for (const k in setCounts) {
    if (muscleRegistry[k]) {
      const c = setCounts[k];
      const baseHours = muscleRegistry[k].defaultHours || 48;
      if (c === 1) {
        muscleRegistry[k].recovery = 65;
      } else if (c === 2) {
        muscleRegistry[k].recovery = 40;
      } else {
        muscleRegistry[k].recovery = baseHours >= 72 ? 15 : 25;
      }
    }
  }

  renderBody(currentView);
  if (selectedKey) renderDetails(selectedKey);
}

// ============================================================================
// 7. WORKOUT TRACKER MOUNT
// ============================================================================
const trackerApp = masterRoot.createDiv({ cls: "wk-app" });

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch (e) {}
}

function calculateCaloriesBurned(minutes, totalVolumeKg, totalSets, avgIntensity) {
  const baseBurnPerMin = 6.0;
  const intensityMultiplier = 0.8 + (avgIntensity * 0.1);
  const volumeBonus = totalVolumeKg * 0.005;
  const estimatedCalories = (minutes * baseBurnPerMin * intensityMultiplier) + volumeBonus;
  return Math.max(15, Math.round(estimatedCalories));
}

function calculatePlates(targetWeight) {
  let perSide = (targetWeight - 20) / 2;
  if (perSide <= 0) return [];
  const plateTypes = [
    { weight: 25, cls: "wk-disc-25" },
    { weight: 20, cls: "wk-disc-20" },
    { weight: 15, cls: "wk-disc-15" },
    { weight: 10, cls: "wk-disc-10" },
    { weight: 5,  cls: "wk-disc-5" },
    { weight: 2.5,cls: "wk-disc-25s" }
  ];
  const plates = [];
  plateTypes.forEach(p => {
    while (perSide >= p.weight) {
      plates.push(p);
      perSide -= p.weight;
    }
  });
  return plates;
}

function renderFinishedScreen(data) {
  if (durationInterval) clearInterval(durationInterval);
  let cardsHtml = "";

  data.exercises.forEach(ex => {
    let setsListHtml = "";
    ex.sets.forEach((s, idx) => {
      const displayWeight = (s.weight !== undefined && s.weight !== "") ? s.weight : (s.done ? "80" : "0");
      const displayReps = (s.reps !== undefined && s.reps !== "") ? s.reps : (s.done ? "8" : "0");
      const failLevel = s.failure || "3";
      
      setsListHtml += `
        <div class="wk-recap-set-item">
          <span>Set ${idx + 1}: <b style="color:#38bdf8;">${displayWeight} kg</b> × <b style="color:#ffffff;">${displayReps} reps</b></span>
          <span style="color:${s.done ? '#34d399' : '#64748b'}; font-weight:700;">Lvl ${failLevel}${s.done ? '✅' : '⏳'}</span>
        </div>
      `;
    });

    cardsHtml += `
      <div class="wk-recap-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-weight:800; font-size:0.95rem; color:#ffffff;">${ex.name}</span>
          <span class="wk-tag wk-tag-sub">${ex.subTarget || ex.muscle}</span>
        </div>
        <div>${setsListHtml}</div>
      </div>
    `;
  });

  trackerApp.innerHTML = `
    <div class="wk-recap-screen">
      <div class="wk-recap-head">
        <span class="wk-recap-badge">Session Complete</span>
        <h2 class="wk-recap-title">Workout Summary & Analysis</h2>
        <div style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">Session completed successfully. Heatmap updated below.</div>
      </div>
      <div class="wk-stats-grid">
        <div class="wk-stat-box"><div class="wk-stat-lbl">Time</div><div class="wk-stat-val" style="color:#a7f3d0;">${data.durationFormatted}</div></div>
        <div class="wk-stat-box"><div class="wk-stat-lbl">Est. Burn</div><div class="wk-stat-val" style="color:#f59e0b;">${data.caloriesBurned} kcal</div></div>
        <div class="wk-stat-box"><div class="wk-stat-lbl">Volume</div><div class="wk-stat-val">${data.totalVol.toLocaleString()} kg</div></div>
        <div class="wk-stat-box"><div class="wk-stat-lbl">Sets Completed</div><div class="wk-stat-val">${data.totalSets}</div></div>
      </div>
      <div>${cardsHtml}</div>
      <button class="wk-btn-new-session" id="btn-start-new">🔄 Start New Workout</button>
    </div>
  `;

  trackerApp.querySelector("#btn-start-new").onclick = () => {
    sessionExercises = [];
    sessionStartTime = Date.now();
    recalculateMuscleFatigue();
    initActiveApp();
  };
}

function initActiveApp() {
  const splitOptionsHtml = Object.keys(routinePresets).map(r => `<option value="${r}">${r}</option>`).join("");

  trackerApp.innerHTML = `
    <div class="wk-topbar">
      <div>
        <span class="wk-badge">PRO Tracker</span>
        <h3 style="margin:4px 0 0 0; font-size:1.25rem; font-weight:800;">Live Workout Logger</h3>
      </div>
      <div class="wk-live-duration" id="live-session-time">⏱️ 00:00</div>
    </div>
    
    <div class="wk-stats-grid">
      <div class="wk-stat-box"><div class="wk-stat-lbl">Est. Burn</div><div class="wk-stat-val" id="stat-cals" style="color:#f59e0b;">0 kcal</div></div>
      <div class="wk-stat-box"><div class="wk-stat-lbl">Volume (kg)</div><div class="wk-stat-val" id="stat-vol">0</div></div>
      <div class="wk-stat-box"><div class="wk-stat-lbl">Sets Done</div><div class="wk-stat-val" id="stat-sets">0</div></div>
      <div class="wk-stat-box"><div class="wk-stat-lbl">Exercises</div><div class="wk-stat-val" id="stat-ex">0</div></div>
    </div>
    
    <div class="wk-gap-box" id="gap-banner" style="display:none;"></div>

    <div class="wk-timer-radial-dock">
      <div style="display:flex; align-items:center; gap:12px;">
        <div class="wk-timer-ring-box">
          <svg class="wk-timer-ring-svg" width="54" height="54">
            <circle class="wk-timer-ring-bg" cx="27" cy="27" r="22" />
            <circle class="wk-timer-ring-bar" id="timer-ring-circle" cx="27" cy="27" r="22" stroke-dasharray="138.23" stroke-dashoffset="0" />
          </svg>
          <div class="wk-timer-ring-txt" id="timer-val">90s</div>
        </div>
        <div>
          <div style="font-weight:800; font-size:0.85rem;">Rest Countdown</div>
          <div style="font-size:0.7rem; color:#94a3b8;">Automatic on set check</div>
        </div>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="wk-timer-btn" id="t-60">+60s</button>
        <button class="wk-timer-btn" id="t-90">+90s</button>
        <button class="wk-timer-btn" id="t-reset" style="background:#ef4444; border-color:#ef4444;">Reset</button>
      </div>
    </div>
    
    <div class="wk-action-row">
      <button class="wk-btn" id="btn-routine">⚡ Load Split</button>
      <button class="wk-btn" id="btn-open-add">🔍 Add / Search</button>
      <button class="wk-btn wk-btn-save" id="btn-save-note">💾 Save Log</button>
    </div>
    
    <div class="wk-selector-card" id="routine-selector" style="display:none; background:#0f172a; border:1px solid #2563eb; border-radius:14px; padding:14px; margin-bottom:14px;">
      <div style="font-weight:800; font-size:0.95rem; margin-bottom:10px;">Select Routine Split</div>
      <select class="wk-dropdown" id="split-select" style="width:100%; height:40px; background:#070d19; border:1px solid #1e3a8a; color:#f8fafc; border-radius:8px; padding:6px 12px; margin-bottom:10px;">
        ${splitOptionsHtml}
      </select>
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="wk-btn" id="btn-split-cancel" style="flex:none; padding:6px 14px;">Cancel</button>
        <button class="wk-btn" id="btn-split-load" style="flex:none; padding:6px 16px; background:#2563eb; border:none;">Load Split</button>
      </div>
    </div>
    
    <div class="wk-selector-card" id="add-selector" style="display:none; background:#0f172a; border:1px solid #2563eb; border-radius:14px; padding:14px; margin-bottom:14px;">
      <div style="font-weight:800; font-size:0.95rem; margin-bottom:8px;">Find & Add Exercise</div>
      <input type="text" class="wk-search-input" id="search-box" style="width:100%; height:38px; background:#070d19; border:1px solid #1e3a8a; color:#f8fafc; border-radius:8px; padding:6px 12px; margin-bottom:8px; box-sizing:border-box;" placeholder="Search exercise, target..." />
      <div class="wk-search-results" id="search-list" style="max-height:190px; overflow-y:auto; border:1px solid #1e293b; border-radius:8px; background:#070d19; margin-bottom:10px;"></div>
      <div style="display:flex; justify-content:flex-end; gap:8px;">
        <button class="wk-btn" id="btn-ex-cancel" style="flex:none; padding:6px 14px;">Close</button>
      </div>
    </div>

    <div class="wk-plate-modal" id="plate-popover">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:800; font-size:0.85rem; color:#38bdf8;">🏋️ Barbell Loading</span>
        <button class="wk-btn-del" id="btn-close-plate">✕</button>
      </div>
      <div id="plate-popover-text" style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">Total Weight: 80 kg</div>
      <div class="wk-plate-bar-visual" id="plate-bar-render"></div>
      <div id="plate-breakdown-list" style="font-size:0.75rem; color:#cbd5e1; text-align:center;"></div>
    </div>
    
    <div id="cards-container"></div>
  `;

  const liveDurationEl = trackerApp.querySelector("#live-session-time");
  function updateLiveSessionTimer() {
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    liveDurationEl.textContent = "⏱️ " + String(mins).padStart(2, '0') + ":" + String(secs).padStart(2, '0');
  }

  if (durationInterval) clearInterval(durationInterval);
  updateLiveSessionTimer();
  durationInterval = setInterval(updateLiveSessionTimer, 1000);

  const cardsContainer = trackerApp.querySelector("#cards-container");
  const timerDisplay = trackerApp.querySelector("#timer-val");
  const timerRing = trackerApp.querySelector("#timer-ring-circle");
  const circumference = 2 * Math.PI * 22;

  function startRestTimer(seconds) {
    clearInterval(timerInterval);
    timerSeconds = seconds;
    timerTotal = seconds;
    updateTimerUI();

    timerInterval = setInterval(() => {
      timerSeconds--;
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        playChime();
      }
      updateTimerUI();
    }, 1000);
  }

  function updateTimerUI() {
    timerDisplay.textContent = timerSeconds + "s";
    const progress = Math.max(0, timerSeconds / timerTotal);
    const offset = circumference - (progress * circumference);
    timerRing.style.strokeDashoffset = offset;
  }

  trackerApp.querySelector("#t-60").onclick = () => startRestTimer(60);
  trackerApp.querySelector("#t-90").onclick = () => startRestTimer(90);
  trackerApp.querySelector("#t-reset").onclick = () => {
    clearInterval(timerInterval);
    timerSeconds = 0;
    updateTimerUI();
  };

  const addSelector = trackerApp.querySelector("#add-selector");
  const routineSelector = trackerApp.querySelector("#routine-selector");
  const searchBox = trackerApp.querySelector("#search-box");
  const searchList = trackerApp.querySelector("#search-list");

  function renderSearchList(query) {
    const q = (query || "").toLowerCase();
    const filtered = exerciseDB.filter(ex => 
      ex.name.toLowerCase().includes(q) ||
      ex.subTarget.toLowerCase().includes(q) ||
      ex.muscle.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      searchList.innerHTML = '<div style="padding:10px; color:#64748b; font-size:0.8rem; text-align:center;">No matching exercises found.</div>';
      return;
    }

    searchList.innerHTML = filtered.map(ex => `
      <div class="wk-search-item" data-name="${ex.name}" style="padding:8px 10px; border-bottom:1px solid #111827; cursor:pointer;">
        <div style="font-weight:700; color:#ffffff; font-size:0.82rem;">${ex.name}</div>
        <div style="font-size:0.7rem; color:#94a3b8; display:flex; gap:6px; margin-top:2px;">
          <span style="color:#38bdf8;">${ex.subTarget}</span> • 
          <span>${ex.position}</span> • 
          <span>${ex.tier}</span>
        </div>
      </div>
    `).join("");

    searchList.querySelectorAll(".wk-search-item").forEach(item => {
      item.onclick = () => {
        addExerciseToSession(item.dataset.name);
        addSelector.style.display = "none";
      };
    });
  }

  searchBox.oninput = () => renderSearchList(searchBox.value);

  trackerApp.querySelector("#btn-open-add").onclick = () => {
    routineSelector.style.display = "none";
    addSelector.style.display = "block";
    searchBox.value = "";
    renderSearchList("");
    searchBox.focus();
  };
  trackerApp.querySelector("#btn-ex-cancel").onclick = () => { addSelector.style.display = "none"; };

  trackerApp.querySelector("#btn-routine").onclick = () => {
    addSelector.style.display = "none";
    routineSelector.style.display = "block";
  };
  trackerApp.querySelector("#btn-split-cancel").onclick = () => { routineSelector.style.display = "none"; };

  trackerApp.querySelector("#btn-split-load").onclick = () => {
    const selected = trackerApp.querySelector("#split-select").value;
    if (selected.includes("Push")) activeSplitCategory = "Push";
    else if (selected.includes("Pull")) activeSplitCategory = "Pull";
    else if (selected.includes("Legs")) activeSplitCategory = "Legs";

    const list = routinePresets[selected] || [];
    sessionExercises = list.map(item => {
      const data = exerciseDB.find(e => e.name === item.name) || {};
      return {
        name: item.name,
        muscle: data.muscle || "Custom",
        subTarget: data.subTarget || "",
        targetKeys: data.targetKeys || [],
        position: data.position || "",
        risk: data.risk || "Low 🟢",
        tier: data.tier || "A-Tier",
        sets: [
          { weight: "", reps: "", failure: "", done: false },
          { weight: "", reps: "", failure: "", done: false },
          { weight: "", reps: "", failure: "", done: false }
        ]
      };
    });
    routineSelector.style.display = "none";
    renderTracker();
    recalculateMuscleFatigue();
  };

  function addExerciseToSession(name) {
    const data = exerciseDB.find(e => e.name === name) || { name: name, muscle: "Custom", targetKeys: [] };
    sessionExercises.push({
      name: data.name,
      muscle: data.muscle,
      subTarget: data.subTarget || "",
      targetKeys: data.targetKeys || [],
      position: data.position || "",
      risk: data.risk || "Low 🟢",
      tier: data.tier || "A-Tier",
      sets: [
        { weight: "", reps: "", failure: "", done: false },
        { weight: "", reps: "", failure: "", done: false },
        { weight: "", reps: "", failure: "", done: false }
      ]
    });
    renderTracker();
    recalculateMuscleFatigue();
  }

  function updateGapAndRedundancy() {
    const gapBanner = trackerApp.querySelector("#gap-banner");
    const required = splitRequiredHeads[activeSplitCategory] || [];
    const currentHeads = sessionExercises.map(e => e.subTarget);
    const missing = required.filter(req => !currentHeads.includes(req));

    if (missing.length > 0 && sessionExercises.length > 0) {
      const chipsHtml = missing.map(m => {
        const reco = exerciseDB.find(e => e.subTarget === m);
        return `<span class="wk-gap-chip" data-name="${reco ? reco.name : ""}">➕ Add ${m}</span>`;
      }).join("");

      gapBanner.innerHTML = `
        <div class="wk-gap-title">⚡ Micro-Muscle Gap Detected (${activeSplitCategory})</div>
        <div style="color:#94a3b8; font-size:0.75rem;">Missing direct volume for:</div>
        <div class="wk-gap-items">${chipsHtml}</div>
      `;
      gapBanner.style.display = "block";

      gapBanner.querySelectorAll(".wk-gap-chip").forEach(chip => {
        chip.onclick = () => {
          if (chip.dataset.name) addExerciseToSession(chip.dataset.name);
        };
      });
    } else {
      gapBanner.style.display = "none";
    }
  }

  function updateStats() {
    let totalVol = 0;
    let totalSets = 0;
    let sumIntensity = 0;

    sessionExercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.done) {
          totalSets++;
          const w = parseFloat(s.weight) || 80;
          const r = parseFloat(s.reps) || 8;
          totalVol += (w * r);
          sumIntensity += (parseFloat(s.failure) || 3);
        }
      });
    });

    const elapsedMins = Math.max(1, Math.round((Date.now() - sessionStartTime) / 60000));
    const avgIntensity = totalSets > 0 ? (sumIntensity / totalSets) : 3;
    const cals = calculateCaloriesBurned(elapsedMins, totalVol, totalSets, avgIntensity);

    trackerApp.querySelector("#stat-cals").textContent = `${cals} kcal`;
    trackerApp.querySelector("#stat-vol").textContent = totalVol.toLocaleString();
    trackerApp.querySelector("#stat-sets").textContent = String(totalSets);
    trackerApp.querySelector("#stat-ex").textContent = String(sessionExercises.length);
  }

  const plateModal = trackerApp.querySelector("#plate-popover");
  const plateRender = trackerApp.querySelector("#plate-bar-render");
  const plateList = trackerApp.querySelector("#plate-breakdown-list");
  const plateText = trackerApp.querySelector("#plate-popover-text");

  trackerApp.querySelector("#btn-close-plate").onclick = () => { plateModal.style.display = "none"; };

  function showPlateCalculator(weight) {
    const w = parseFloat(weight) || 80;
    plateText.textContent = `Bar: 20kg • Per Side: ${Math.max(0, ((w - 20) / 2)).toFixed(1)} kg`;
    const plates = calculatePlates(w);

    let discsHtml = '<div class="wk-plate-sleeve"></div>';
    plates.forEach(p => {
      discsHtml += `<div class="wk-plate-disc ${p.cls}"></div>`;
    });
    plateRender.innerHTML = discsHtml;
    
    if (plates.length > 0) {
      plateList.innerHTML = `Stack per side: <b>${plates.map(p => p.weight + "kg").join(" + ")}</b>`;
    } else {
      plateList.innerHTML = "Olympic Bar Only (20 kg)";
    }
    plateModal.style.display = "block";
  }

  function renderTracker() {
    cardsContainer.innerHTML = "";

    const counts = {};
    sessionExercises.forEach(e => {
      if (e.subTarget) counts[e.subTarget] = (counts[e.subTarget] || 0) + 1;
    });

    sessionExercises.forEach((ex, exIdx) => {
      const card = document.createElement("div");
      card.className = "wk-card";

      const isRedundant = counts[ex.subTarget] > 1;
      const riskClass = (ex.risk && ex.risk.includes("Low")) ? "green" : "";

      let top1RM = 0;
      ex.sets.forEach(s => {
        const w = parseFloat(s.weight) || 0;
        const r = parseFloat(s.reps) || 0;
        if (w > 0 && r > 0) {
          const est = Math.round(w * (1 + r / 30));
          if (est > top1RM) top1RM = est;
        }
      });

      const tagsHtml = `
        <div class="wk-tag-container">
          ${ex.subTarget ? `<span class="wk-tag wk-tag-sub">${ex.subTarget}</span>` : ''}
          ${ex.position ? `<span class="wk-tag wk-tag-pos">${ex.position}</span>` : ''}
          ${ex.tier ? `<span class="wk-tag wk-tag-tier">${ex.tier}</span>` : ''}
          ${ex.risk ? `<span class="wk-tag wk-tag-risk ${riskClass}">Stress: ${ex.risk}</span>` : ''}
          ${top1RM > 0 ? `<span class="wk-tag wk-tag-1rm">⚡ Est. 1RM: ${top1RM} kg</span>` : ''}
          ${isRedundant ? `<span class="wk-tag wk-tag-warn">⚠️ Duplicate Overlap</span>` : ''}
        </div>
      `;

      let rowsHtml = `
        <div class="wk-set-row">
          <div class="wk-th">SET</div>
          <div class="wk-th">KG</div>
          <div class="wk-th">REPS</div>
          <div class="wk-th">FAIL</div>
          <div class="wk-th">DONE</div>
          <div></div>
        </div>
      `;

      ex.sets.forEach((s, sIdx) => {
        rowsHtml += `
          <div class="wk-set-row ${s.done ? 'row-done' : ''}">
            <div style="font-size:0.75rem; text-align:center; color:#64748b; font-weight:800;">${sIdx + 1}</div>
            <input type="number" class="wk-input kg-clickable set-weight" data-ex="${exIdx}" data-set="${sIdx}" value="${s.weight}" placeholder="80" title="Double-click for plates" />
            <input type="number" class="wk-input set-reps" data-ex="${exIdx}" data-set="${sIdx}" value="${s.reps}" placeholder="8" />
            <input type="number" min="1" max="5" class="wk-input set-fail" data-ex="${exIdx}" data-set="${sIdx}" value="${s.failure}" placeholder="1-5" />
            <input type="checkbox" class="wk-check set-done" data-ex="${exIdx}" data-set="${sIdx}" ${s.done ? "checked" : ""} />
            <button class="wk-btn-del btn-del-set" data-ex="${exIdx}" data-set="${sIdx}">✕</button>
          </div>
        `;
      });

      card.innerHTML = `
        <div class="wk-card-top">
          <span class="wk-card-title">${exIdx + 1}. ${ex.name}</span>
          <button class="wk-btn-del btn-del-card" data-ex="${exIdx}">✕</button>
        </div>
        ${tagsHtml}
        ${rowsHtml}
        <button class="wk-btn-addset btn-add-set" data-ex="${exIdx}">+ Add Set</button>
      `;

      cardsContainer.appendChild(card);
    });

    updateStats();
    updateGapAndRedundancy();
    attachTrackerEvents();
  }

  function attachTrackerEvents() {
    trackerApp.querySelectorAll(".set-weight").forEach(inp => {
      inp.oninput = (e) => {
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].weight = e.target.value;
        updateStats();
      };
      inp.ondblclick = (e) => showPlateCalculator(e.target.value || 80);
    });

    trackerApp.querySelectorAll(".set-reps").forEach(inp => {
      inp.oninput = (e) => {
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].reps = e.target.value;
        updateStats();
      };
    });

    trackerApp.querySelectorAll(".set-fail").forEach(inp => {
      inp.oninput = (e) => {
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].failure = e.target.value;
      };
    });

    trackerApp.querySelectorAll(".set-done").forEach(chk => {
      chk.onchange = (e) => {
        const isDone = e.target.checked;
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].done = isDone;
        const row = e.target.closest('.wk-set-row');
        if (row) {
          if (isDone) row.classList.add('row-done');
          else row.classList.remove('row-done');
        }
        if (isDone) startRestTimer(90);
        updateStats();
        recalculateMuscleFatigue();
      };
    });

    trackerApp.querySelectorAll(".btn-del-set").forEach(btn => {
      btn.onclick = () => {
        sessionExercises[btn.dataset.ex].sets.splice(btn.dataset.set, 1);
        renderTracker();
        recalculateMuscleFatigue();
      };
    });

    trackerApp.querySelectorAll(".btn-add-set").forEach(btn => {
      btn.onclick = () => {
        sessionExercises[btn.dataset.ex].sets.push({ weight: "", reps: "", failure: "", done: false });
        renderTracker();
      };
    });

    trackerApp.querySelectorAll(".btn-del-card").forEach(btn => {
      btn.onclick = () => {
        sessionExercises.splice(btn.dataset.ex, 1);
        renderTracker();
        recalculateMuscleFatigue();
      };
    });
  }

  trackerApp.querySelector("#btn-save-note").onclick = () => {
    let totalVol = 0;
    let totalSets = 0;
    let sumIntensity = 0;
    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const durationFormatted = `${mins}m ${secs}s`;
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    sessionExercises.forEach(ex => {
      ex.sets.forEach(s => {
        const w = parseFloat(s.weight) || (s.done ? 80 : 0);
        const r = parseFloat(s.reps) || (s.done ? 8 : 0);
        const failVal = s.failure || "3";
        if (s.done) {
          totalSets++;
          totalVol += (w * r);
          sumIntensity += (parseFloat(failVal) || 3);
        }
      });
    });

    const avgIntensity = totalSets > 0 ? (sumIntensity / totalSets) : 3;
    const caloriesBurned = calculateCaloriesBurned(elapsedMinutes, totalVol, totalSets, avgIntensity);

    const recapData = {
      exercises: sessionExercises,
      totalVol: totalVol,
      totalSets: totalSets,
      durationFormatted: durationFormatted,
      caloriesBurned: caloriesBurned
    };

    renderFinishedScreen(recapData);
  };
}

// ============================================================================
// 8. ANATOMICAL HEATMAP MOUNT
// ============================================================================
const heatmapRoot = masterRoot.createDiv({ cls: "bm3-root" });

const header = heatmapRoot.createDiv({ cls: "bm3-header" });
header.createDiv({ cls: "bm3-title" }).innerHTML = `<span class="bm3-icon">⬡</span> Anatomical Musculoskeletal Heatmap`;
header.createDiv({ cls: "bm3-subtitle", text: "Interactive Recovery HUD • Fatigue updates automatically on logged sets" });

const viewTabs = heatmapRoot.createDiv({ cls: "bm3-viewtabs" });
const frontTab = viewTabs.createEl("button", { cls: "bm3-viewtab active", text: "FRONT" });
const backTab = viewTabs.createEl("button", { cls: "bm3-viewtab", text: "BACK" });

const layout = heatmapRoot.createDiv({ cls: "bm3-layout" });

const legendPanel = layout.createDiv({ cls: "bm3-panel" });
legendPanel.createDiv({ cls: "bm3-panel-title", text: "FATIGUE LEVEL" });
const legendData = [
    { color: "#ef4444", label: "High", sub: "(Severe Fatigue)" },
    { color: "#f97316", label: "Moderate", sub: "(Noticeable Fatigue)" },
    { color: "#eab308", label: "Low", sub: "(Mild Fatigue)" },
    { color: "#22c55e", label: "Fresh", sub: "(Recovered)" }
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
howtoPanel.createDiv({ cls: "bm3-panel-title", text: "HOW TO USE" });
const howtoData = [
    { icon: "⚡", text: "Check sets above to trigger fatigue" },
    { icon: "🖱️", text: "Click any muscle to lock details" },
    { icon: "🔁", text: "Toggle FRONT / BACK to inspect" },
];
howtoData.forEach(item => {
    const row = howtoPanel.createDiv({ cls: "bm3-howto-row", style: "display:flex; align-items:flex-start; gap:8px; margin-bottom:10px;" });
    row.createDiv({ text: item.icon, style: "font-size:0.85rem;" });
    row.createDiv({ cls: "bm3-howto-text", text: item.text, style: "font-size:0.75rem; color:#94a3b8; line-height:1.3;" });
});

const detailCard = heatmapRoot.createDiv({ cls: "bm3-detail-card" });
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
    detailHours.innerHTML = `⏱ ${model.defaultHours} Hours Recovery Window • ${model.recovery}% Readiness`;
    detailDesc.setText(model.desc);
    detailTag.setText(model.tier);
    detailTag.style.background = tier.base;
    detailCard.style.borderColor = tier.base + "80";
}

function buildDefs(view) {
    let defs = `
        <radialGradient id="blueSelectGrad-${INSTANCE_ID}" cx="32%" cy="26%" r="80%">
            <stop offset="0%"  stop-color="#e0f2fe" stop-opacity="1" />
            <stop offset="30%" stop-color="#38bdf8" stop-opacity="1" />
            <stop offset="62%" stop-color="#0ea5e9" stop-opacity="0.97" />
            <stop offset="85%" stop-color="#0c4a6e" stop-opacity="0.98" />
            <stop offset="100%" stop-color="#082f49" stop-opacity="1" />
        </radialGradient>
    `;
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
        const filtered = activePresetKeys && !activePresetKeys.has(key);
        const showAsSelectedInactive = isSelected && filtered;
        const fill = showAsSelectedInactive ? `url(#blueSelectGrad-${INSTANCE_ID})` : (filtered ? INACTIVE_FILL : `url(#${gid})`);
        const stroke = showAsSelectedInactive ? SELECT_BLUE : (filtered ? INACTIVE_STROKE : tier.dark);
        const pathClass = `bm3-muscle-path${isSelected ? " selected" : ""}`;

        pathsHtml += `<g class="bm3-muscle-group${isSelected ? " selected" : ""}">`;
        item.paths.forEach(p => {
            pathsHtml += `<path class="${pathClass}" data-key="${key}" d="${p}" fill="${fill}" stroke="${stroke}" stroke-width="0.6" style="color:${tier.base}" />`;
        });

        if (!filtered || showAsSelectedInactive) {
            const pid = `fiber-${INSTANCE_ID}-${view}-${key}`;
            item.paths.forEach(p => {
                pathsHtml += `<path class="bm3-fiber-overlay${isSelected ? " selected" : ""}" data-key="${key}" d="${p}" fill="url(#${pid})" />`;
            });
        }
        pathsHtml += `</g>`;
    }

    viewport.innerHTML = `
        <svg class="bm3-vector-svg" viewBox="${vb}" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)">
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

// ============================================================================
// 9. INITIAL BOOTSTRAP
// ============================================================================
initActiveApp();
renderBody("front");
renderDetails("chest");
```