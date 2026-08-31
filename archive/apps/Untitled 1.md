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
const rawMuscleRegistry = JSON.parse(registryContent);

const STATIC_PARTS = somaData.STATIC_PARTS;
const FRONT_OUTLINE = somaData.FRONT_OUTLINE;
const BACK_OUTLINE = somaData.BACK_OUTLINE;
const FRONT_VIEWBOX = "0 0 724 1448";
const BACK_VIEWBOX = "724 0 724 1448";

// ============================================================================
// 2. BIOMECHANICS & MICRO-MUSCLE DATABASE
// ============================================================================
const exerciseDB = [
  // CHEST
  { name: "Incline Dumbbell Press", muscle: "Chest", subTarget: "Upper Pec", targetKeys: ["chest"], hours: 48, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Incline Barbell Bench", muscle: "Chest", subTarget: "Upper Pec", targetKeys: ["chest"], hours: 48, position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Smith Machine Incline Press", muscle: "Chest", subTarget: "Upper Pec", targetKeys: ["chest"], hours: 48, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Low-to-High Cable Fly", muscle: "Chest", subTarget: "Upper Pec", targetKeys: ["chest"], hours: 36, position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Flat Barbell Bench Press", muscle: "Chest", subTarget: "Mid/Lower Pec", targetKeys: ["chest"], hours: 48, position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Flat Dumbbell Press", muscle: "Chest", subTarget: "Mid/Lower Pec", targetKeys: ["chest"], hours: 48, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Pec Deck Fly (Machine)", muscle: "Chest", subTarget: "Mid/Lower Pec", targetKeys: ["chest"], hours: 36, position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Chest Dips", muscle: "Chest", subTarget: "Lower Pec", targetKeys: ["chest", "triceps"], hours: 48, position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Machine Chest Press", muscle: "Chest", subTarget: "Mid/Lower Pec", targetKeys: ["chest"], hours: 48, position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier" },

  // BACK
  { name: "Lat Pulldown (Wide/Neutral)", muscle: "Back", subTarget: "Lats", targetKeys: ["upper_back"], hours: 48, position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Pull-ups / Weighted Chin-ups", muscle: "Back", subTarget: "Lats", targetKeys: ["upper_back", "biceps"], hours: 48, position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier" },
  { name: "Single-Arm Lat Cable Row", muscle: "Back", subTarget: "Lower Lats", targetKeys: ["upper_back"], hours: 48, position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Chest-Supported T-Bar Row", muscle: "Back", subTarget: "Upper Back", targetKeys: ["upper_back", "trapezius_back"], hours: 48, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Meadows Row", muscle: "Back", subTarget: "Upper Lats", targetKeys: ["upper_back"], hours: 48, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Barbell Bent-Over Row", muscle: "Back", subTarget: "Upper Back", targetKeys: ["upper_back", "trapezius_back", "lower_back"], hours: 48, position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Seated Cable Row (Wide)", muscle: "Back", subTarget: "Mid-Traps", targetKeys: ["trapezius_back", "upper_back"], hours: 48, position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier" },
  { name: "Barbell Deadlift", muscle: "Back", subTarget: "Posterior Chain", targetKeys: ["lower_back", "hamstring", "gluteal"], hours: 72, position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Hyperextensions", muscle: "Back", subTarget: "Lower Back", targetKeys: ["lower_back", "gluteal"], hours: 48, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier" },

  // SHOULDERS
  { name: "Standing Overhead Press (OHP)", muscle: "Shoulders", subTarget: "Front Delt", targetKeys: ["deltoids", "triceps"], hours: 36, position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Seated Dumbbell Shoulder Press", muscle: "Shoulders", subTarget: "Front Delt", targetKeys: ["deltoids", "triceps"], hours: 36, position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Cable Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt", targetKeys: ["deltoids", "deltoids_back"], hours: 24, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Cable Y-Raise", muscle: "Shoulders", subTarget: "Side Delt", targetKeys: ["deltoids", "deltoids_back"], hours: 24, position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Dumbbell Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt", targetKeys: ["deltoids", "deltoids_back"], hours: 24, position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier" },
  { name: "Machine Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt", targetKeys: ["deltoids", "deltoids_back"], hours: 24, position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Face Pulls", muscle: "Shoulders", subTarget: "Rear Delt", targetKeys: ["deltoids_back", "trapezius_back"], hours: 24, position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Reverse Pec Deck", muscle: "Shoulders", subTarget: "Rear Delt", targetKeys: ["deltoids_back"], hours: 24, position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Incline Rear Delt DB Flyes", muscle: "Shoulders", subTarget: "Rear Delt", targetKeys: ["deltoids_back"], hours: 24, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier" },

  // ARMS
  { name: "Incline Dumbbell Curl", muscle: "Biceps", subTarget: "Biceps Long Head", targetKeys: ["biceps"], hours: 36, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Bayesian Cable Curl", muscle: "Biceps", subTarget: "Biceps Long Head", targetKeys: ["biceps"], hours: 36, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Preacher Curl (Machine/EZ)", muscle: "Biceps", subTarget: "Biceps Short Head", targetKeys: ["biceps"], hours: 36, position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Hammer Curl (Dumbbell/Cable)", muscle: "Biceps", subTarget: "Brachialis", targetKeys: ["biceps"], hours: 24, position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Overhead Dual Cable Extension", muscle: "Triceps", subTarget: "Triceps Long Head", targetKeys: ["triceps", "triceps_back"], hours: 36, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Incline EZ Skull Crushers", muscle: "Triceps", subTarget: "Triceps Long Head", targetKeys: ["triceps", "triceps_back"], hours: 48, position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Cable Triceps Pushdown (Straight/V)", muscle: "Triceps", subTarget: "Triceps Lateral Head", targetKeys: ["triceps", "triceps_back"], hours: 36, position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },

  // LEGS & CALVES
  { name: "Hack Squat", muscle: "Legs", subTarget: "Quads", targetKeys: ["quadriceps", "gluteal"], hours: 72, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Barbell Back Squat", muscle: "Legs", subTarget: "Quads & Glutes", targetKeys: ["quadriceps", "gluteal", "lower_back"], hours: 72, position: "Lengthened (Stretch)", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Leg Press", muscle: "Legs", subTarget: "Quads", targetKeys: ["quadriceps", "adductors"], hours: 48, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Leg Extensions", muscle: "Legs", subTarget: "Rectus Femoris", targetKeys: ["quadriceps"], hours: 48, position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Romanian Deadlift (DB/Barbell)", muscle: "Legs", subTarget: "Hamstrings", targetKeys: ["hamstring", "gluteal", "lower_back"], hours: 72, position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier" },
  { name: "Seated Leg Curl", muscle: "Legs", subTarget: "Hamstrings", targetKeys: ["hamstring"], hours: 48, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Bulgarian Split Squat", muscle: "Legs", subTarget: "Glutes & Quads", targetKeys: ["gluteal", "quadriceps", "adductors"], hours: 48, position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier" },
  { name: "Barbell / Machine Hip Thrust", muscle: "Legs", subTarget: "Glutes", targetKeys: ["gluteal"], hours: 48, position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Standing Machine Calf Raise", muscle: "Legs", subTarget: "Calves", targetKeys: ["calves", "calves_back"], hours: 24, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Seated Calf Raise Machine", muscle: "Legs", subTarget: "Calves", targetKeys: ["calves", "calves_back"], hours: 24, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" }
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
  "Push": ["Upper Pec", "Mid/Lower Pec", "Side Delt", "Triceps Long Head", "Triceps Lateral Head"],
  "Pull": ["Lats", "Upper Back", "Rear Delt", "Biceps Long Head", "Brachialis"],
  "Legs": ["Quads", "Hamstrings", "Glutes", "Calves"]
};

// ============================================================================
// 3. UNIFIED CONTAINER & MATCHING 640PX WIDTH CSS
// ============================================================================
const masterContainer = dv.el("div", "", { cls: "gym-main-wrapper" });

const styleEl = document.createElement("style");
styleEl.textContent = `
    .gym-main-wrapper {
        font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
        color: #f8fafc;
        max-width: 640px !important;
        width: 100% !important;
        margin: 0 auto !important;
        display: flex;
        flex-direction: column;
        gap: 20px;
        box-sizing: border-box;
    }

    /* TOP TRACKER CARD */
    .wk-app {
        background: #070d19;
        border: 1px solid #142038;
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 16px 45px rgba(0,0,0,0.65);
        box-sizing: border-box;
        width: 100% !important;
        max-width: 640px !important;
        position: relative;
    }
    .wk-topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
    .wk-badge { background: #2563eb; color: #ffffff; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 999px; display: inline-block; margin-bottom: 4px; }
    .wk-title { font-size: 1.35rem; font-weight: 800; color: #ffffff; margin: 0; }
    .wk-live-duration { background: #0c1527; border: 1px solid #1e293b; color: #38bdf8; font-size: 0.8rem; font-weight: 800; padding: 5px 12px; border-radius: 8px; font-variant-numeric: tabular-nums; display: flex; align-items: center; gap: 6px; }

    .wk-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }
    .wk-stat-box { background: #0c1527; border: 1px solid #17243c; border-radius: 12px; padding: 12px; text-align: center; }
    .wk-stat-lbl { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .wk-stat-val { font-size: 1.25rem; font-weight: 900; color: #38bdf8; margin-top: 3px; }

    .wk-timer-radial-dock { display: flex; align-items: center; justify-content: space-between; background: #0b1c38; border: 1px solid #1d4ed8; border-radius: 16px; padding: 10px 16px; margin-bottom: 14px; }
    .wk-timer-ring-box { position: relative; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; }
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
    .wk-btn { flex: 1; background: #172033; color: #ffffff; border: 1px solid #24324c; border-radius: 10px; padding: 10px; font-size: 0.82rem; font-weight: 700; cursor: pointer; text-align: center; transition: all 0.15s ease; }
    .wk-btn:hover { background: #1e293b; border-color: #334155; }
    .wk-btn-save { background: #064e3b; border-color: #059669; color: #a7f3d0; }
    .wk-btn-save:hover { background: #047857; color: #ffffff; }

    .wk-card { background: #0b1324; border: 1px solid #172554; border-