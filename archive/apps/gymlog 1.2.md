```dataviewjs
const rootEl = dv.el("div", "", { cls: "workout-tracker-root" });

// -------------------------------------------------------------
// COMPREHENSIVE BIOMECHANICS & MICRO-MUSCLE DATABASE
// -------------------------------------------------------------
const exerciseDB = [
  // CHEST
  { name: "Incline Dumbbell Press", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", bodyPart: "chest_upper", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Incline Barbell Bench", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", bodyPart: "chest_upper", position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Smith Machine Incline Press", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", bodyPart: "chest_upper", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Low-to-High Cable Fly", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", bodyPart: "chest_upper", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Flat Barbell Bench Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", bodyPart: "chest_lower", position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Flat Dumbbell Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", bodyPart: "chest_lower", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Pec Deck Fly (Machine)", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", bodyPart: "chest_lower", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Chest Dips", muscle: "Chest", subTarget: "Lower Pec (Costal)", bodyPart: "chest_lower", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Machine Chest Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", bodyPart: "chest_lower", position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier" },

  // BACK
  { name: "Lat Pulldown (Wide/Neutral)", muscle: "Back", subTarget: "Lats (Vertical Pull)", bodyPart: "lats", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Pull-ups / Weighted Chin-ups", muscle: "Back", subTarget: "Lats (Vertical Pull)", bodyPart: "lats", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier" },
  { name: "Single-Arm Lat Cable Row", muscle: "Back", subTarget: "Lats (Iliac / Lower)", bodyPart: "lats", position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Chest-Supported T-Bar Row", muscle: "Back", subTarget: "Upper Back / Rhomboids", bodyPart: "traps_upper", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Meadows Row", muscle: "Back", subTarget: "Upper Lats & Teres Major", bodyPart: "lats", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Barbell Bent-Over Row", muscle: "Back", subTarget: "Upper Back / Lats", bodyPart: "traps_upper", position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Seated Cable Row (Wide)", muscle: "Back", subTarget: "Upper Back / Mid-Traps", bodyPart: "traps_upper", position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier" },
  { name: "Barbell Deadlift", muscle: "Back", subTarget: "Erectors / Posterior Chain", bodyPart: "lower_back", position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Hyperextensions", muscle: "Back", subTarget: "Lower Back (Erectors)", bodyPart: "lower_back", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier" },

  // SHOULDERS
  { name: "Standing Overhead Press (OHP)", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", bodyPart: "delts_front", position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Seated Dumbbell Shoulder Press", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", bodyPart: "delts_front", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Cable Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", bodyPart: "delts_side", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Cable Y-Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", bodyPart: "delts_side", position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Dumbbell Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", bodyPart: "delts_side", position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier" },
  { name: "Machine Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", bodyPart: "delts_side", position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Face Pulls", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", bodyPart: "delts_rear", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Reverse Pec Deck", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", bodyPart: "delts_rear", position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Incline Rear Delt DB Flyes", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", bodyPart: "delts_rear", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier" },

  // ARMS
  { name: "Incline Dumbbell Curl", muscle: "Biceps", subTarget: "Long Head (Peak)", bodyPart: "biceps", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Bayesian Cable Curl", muscle: "Biceps", subTarget: "Long Head (Peak)", bodyPart: "biceps", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Preacher Curl (Machine/EZ)", muscle: "Biceps", subTarget: "Short Head (Inner)", bodyPart: "biceps", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Hammer Curl (Dumbbell/Cable)", muscle: "Biceps", subTarget: "Brachialis & Forearms", bodyPart: "forearms", position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Overhead Dual Cable Extension", muscle: "Triceps", subTarget: "Long Head Triceps", bodyPart: "triceps", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Incline EZ Skull Crushers", muscle: "Triceps", subTarget: "Long Head Triceps", bodyPart: "triceps", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Cable Triceps Pushdown (Straight/V)", muscle: "Triceps", subTarget: "Lateral & Medial Head", bodyPart: "triceps", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Barbell Wrist Curls", muscle: "Forearms", subTarget: "Forearm Flexors", bodyPart: "forearms", position: "Shortened (Peak)", risk: "Low 🟢", tier: "B-Tier" },
  { name: "Reverse Barbell Curl", muscle: "Forearms", subTarget: "Brachioradialis", bodyPart: "forearms", position: "Mid-Range", risk: "Low 🟢", tier: "A-Tier" },

  // LEGS & CALVES
  { name: "Barbell Back Squat", muscle: "Legs", subTarget: "Quads & Glutes", bodyPart: "quads", position: "Lengthened (Stretch)", risk: "High (Axial) 🔴", tier: "A-Tier" },
  { name: "Hack Squat", muscle: "Legs", subTarget: "Quads (Knee Extensors)", bodyPart: "quads", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Leg Press", muscle: "Legs", subTarget: "Quads & Adductors", bodyPart: "quads", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Leg Extensions", muscle: "Legs", subTarget: "Rectus Femoris", bodyPart: "quads", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Romanian Deadlift (DB/Barbell)", muscle: "Legs", subTarget: "Hamstrings (Lengthened)", bodyPart: "hamstrings", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier" },
  { name: "Seated Leg Curl", muscle: "Legs", subTarget: "Hamstrings (Knee Flexion)", bodyPart: "hamstrings", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Nordic Hamstring Curl", muscle: "Legs", subTarget: "Hamstrings (Eccentric)", bodyPart: "hamstrings", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier" },
  { name: "Bulgarian Split Squat", muscle: "Legs", subTarget: "Glutes & Quads", bodyPart: "glutes", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier" },
  { name: "Barbell / Machine Hip Thrust", muscle: "Legs", subTarget: "Glutes (Maximus)", bodyPart: "glutes", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Standing Machine Calf Raise", muscle: "Legs", subTarget: "Calves (Gastrocnemius)", bodyPart: "calves", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Seated Calf Raise Machine", muscle: "Legs", subTarget: "Calves (Soleus)", bodyPart: "calves", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Leg Press Calf Extension", muscle: "Legs", subTarget: "Calves (Gastrocnemius)", bodyPart: "calves", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Donkey Calf Raise Machine", muscle: "Legs", subTarget: "Calves (Gastrocnemius)", bodyPart: "calves", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Smith Machine Calf Raise", muscle: "Legs", subTarget: "Calves (Gastrocnemius)", bodyPart: "calves", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier" }
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

// Styles
const style = document.createElement("style");
style.textContent = [
  ".wk-app { background: #070d19; border: 1px solid #1e293b; border-radius: 20px; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; max-width: 640px; margin: 15px auto; box-shadow: 0 16px 45px rgba(0,0,0,0.65); box-sizing: border-box; position: relative; }",
  ".wk-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }",
  ".wk-badge { background: #2563eb; color: #ffffff; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 9px; border-radius: 999px; }",
  ".wk-live-duration { background: #0f172a; border: 1px solid #1e293b; color: #38bdf8; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; font-variant-numeric: tabular-nums; }",
  
  /* Symmetrical 2x2 Stats Grid */
  ".wk-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }",
  ".wk-stat-box { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 10px; text-align: center; }",
  ".wk-stat-lbl { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }",
  ".wk-stat-val { font-size: 1.15rem; font-weight: 800; color: #38bdf8; margin-top: 3px; }",

  /* Circular Animated Rest Timer */
  ".wk-timer-radial-dock { display: flex; align-items: center; justify-content: space-between; background: #0c1e3d; border: 1px solid #1d4ed8; border-radius: 16px; padding: 10px 16px; margin-bottom: 14px; }",
  ".wk-timer-ring-box { position: relative; width: 54px; height: 54px; display: flex; align-items: center; justify-content: center; }",
  ".wk-timer-ring-svg { transform: rotate(-90deg); }",
  ".wk-timer-ring-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 4; }",
  ".wk-timer-ring-bar { fill: none; stroke: #38bdf8; stroke-width: 4; stroke-linecap: round; transition: stroke-dashoffset 1s linear; }",
  ".wk-timer-ring-txt { position: absolute; font-size: 0.75rem; font-weight: 800; color: #ffffff; font-variant-numeric: tabular-nums; }",

  /* Gap & Redundancy Banner */
  ".wk-gap-box { background: #111e38; border: 1px solid #1e3a8a; border-radius: 12px; padding: 10px 14px; margin-bottom: 14px; font-size: 0.78rem; }",
  ".wk-gap-title { font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }",
  ".wk-gap-items { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }",
  ".wk-gap-chip { background: #172554; border: 1px solid #2563eb; color: #93c5fd; padding: 3px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; cursor: pointer; }",
  ".wk-gap-chip:hover { background: #2563eb; color: white; }",

  ".wk-action-row { display: flex; gap: 8px; margin-bottom: 14px; }",
  ".wk-btn { flex: 1; background: #0f172a; color: #ffffff; border: 1px solid #1e293b; border-radius: 10px; padding: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; text-align: center; transition: all 0.15s ease; }",
  ".wk-btn:hover { background: #1e293b; border-color: #334155; }",
  ".wk-btn-save { background: #064e3b; border-color: #059669; color: #a7f3d0; }",
  ".wk-btn-save:hover { background: #047857; color: #ffffff; }",

  /* Exercise Card Elements */
  ".wk-card { background: #0b1324; border: 1px solid #172554; border-radius: 16px; padding: 16px; margin-bottom: 14px; transition: transform 0.15s ease; }",
  ".wk-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }",
  ".wk-card-title { font-weight: 800; font-size: 0.95rem; color: #ffffff; }",
  ".wk-tag-container { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }",
  ".wk-tag { font-size: 0.63rem; font-weight: 700; padding: 2px 7px; border-radius: 5px; }",
  ".wk-tag-sub { background: #172554; color: #38bdf8; }",
  ".wk-tag-pos { background: #1e293b; color: #cbd5e1; }",
  ".wk-tag-risk { background: rgba(239,68,68,0.15); color: #fca5a5; }",
  ".wk-tag-risk.green { background: rgba(16,185,129,0.15); color: #86efac; }",
  ".wk-tag-tier { background: #312e81; color: #c7d2fe; font-weight: 800; }",
  ".wk-tag-warn { background: rgba(245,158,11,0.2); color: #fcd34d; font-weight: 800; }",
  ".wk-tag-1rm { background: rgba(56,189,248,0.12); color: #38bdf8; border: 1px solid rgba(56,189,248,0.3); }",

  ".wk-set-row { display: grid; grid-template-columns: 24px 1fr 1fr 1fr 34px 22px; gap: 8px; align-items: center; margin-bottom: 7px; padding: 4px; border-radius: 8px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }",
  ".wk-th { font-size: 0.62rem; font-weight: 800; color: #64748b; text-transform: uppercase; text-align: center; }",
  ".wk-input { background: #0f1c38; border: 1px solid #1e3a8a; border-radius: 8px; color: #38bdf8; font-weight: 700; padding: 6px 4px; text-align: center; font-size: 0.88rem; width: 100%; outline: none; box-sizing: border-box; height: 36px; transition: all 0.15s ease; }",
  ".wk-input.kg-clickable { cursor: pointer; }",
  ".wk-input:focus { border-color: #60a5fa; background: #172554; box-shadow: 0 0 10px rgba(56, 189, 248, 0.25); color: #ffffff; }",
  ".wk-check { width: 22px; height: 22px; accent-color: #3b82f6; cursor: pointer; margin: 0 auto; transition: transform 0.15s ease; }",
  ".wk-check:hover { transform: scale(1.15); }",
  ".wk-set-row.row-done { background: rgba(16, 185, 129, 0.08); transform: scale(1.005); box-shadow: inset 0 0 0 1px rgba(16,185,129,0.25); }",
  ".wk-set-row.row-done .wk-input { border-color: #059669; color: #34d399; background: #062820; }",
  ".wk-set-row.row-done .wk-check { accent-color: #10b981; }",
  ".wk-btn-del { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.95rem; font-weight: 700; }",
  ".wk-btn-addset { width: 100%; background: rgba(56, 189, 248, 0.04); border: 1px dashed #1e3a8a; border-radius: 8px; color: #38bdf8; font-size: 0.75rem; font-weight: 700; padding: 7px; margin-top: 8px; cursor: pointer; }",

  /* Barbell Plate Popover */
  ".wk-plate-modal { display: none; position: absolute; z-index: 1100; background: #0b1324; border: 1px solid #3b82f6; border-radius: 14px; padding: 14px; box-shadow: 0 12px 35px rgba(0,0,0,0.85); width: 260px; left: 50%; top: 50%; transform: translate(-50%, -50%); }",
  ".wk-plate-bar-visual { display: flex; align-items: center; justify-content: center; height: 50px; background: #070d19; border-radius: 8px; margin: 10px 0; padding: 0 8px; border: 1px solid #1e293b; gap: 3px; }",
  ".wk-plate-sleeve { width: 14px; height: 10px; background: #94a3b8; border-radius: 2px; }",
  ".wk-plate-disc { border-radius: 3px; display: inline-block; }",
  ".wk-disc-25 { background: #ef4444; width: 8px; height: 38px; }",
  ".wk-disc-20 { background: #3b82f6; width: 8px; height: 34px; }",
  ".wk-disc-15 { background: #eab308; width: 7px; height: 30px; }",
  ".wk-disc-10 { background: #10b981; width: 7px; height: 26px; }",
  ".wk-disc-5  { background: #ffffff; width: 6px; height: 22px; }",
  ".wk-disc-25s{ background: #64748b; width: 5px; height: 18px; }",

  /* High-End Anatomical Dashboard & Grid */
  ".wk-body-dock { background: #0b1324; border: 1px solid #172554; border-radius: 16px; padding: 16px 14px; margin: 16px 0; }",
  ".wk-anatomy-wrap { display: flex; justify-content: center; align-items: center; gap: 24px; margin-top: 10px; }",
  ".wk-muscle-path { fill: #172033; stroke: #070d19; stroke-width: 1.2; cursor: pointer; transition: all 0.25s ease; }",
  ".wk-muscle-path:hover { filter: drop-shadow(0 0 6px #38bdf8); }",
  ".wk-muscle-path.sore-high { fill: #ef4444 !important; filter: drop-shadow(0 0 6px rgba(239,68,68,0.85)); }",
  ".wk-muscle-path.sore-med { fill: #f97316 !important; filter: drop-shadow(0 0 5px rgba(249,115,22,0.75)); }",
  ".wk-muscle-path.sore-fast { fill: #eab308 !important; filter: drop-shadow(0 0 5px rgba(234,179,8,0.75)); }",
  
  /* Muscle Status Badges Grid */
  ".wk-hud-pills-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(135px, 1fr)); gap: 8px; margin-top: 14px; border-top: 1px solid #1e293b; padding-top: 14px; }",
  ".wk-hud-pill { background: #070d19; border: 1px solid #1e3a8a; border-radius: 8px; padding: 8px 10px; cursor: pointer; transition: all 0.15s ease; text-align: left; }",
  ".wk-hud-pill:hover { border-color: #38bdf8; transform: translateY(-2px); }",
  ".wk-hud-pill-name { font-size: 0.8rem; font-weight: 800; color: #ffffff; }",
  ".wk-hud-pill-time { font-size: 0.72rem; font-weight: 800; color: #38bdf8; margin-top: 2px; }",

  /* Recovery Detail Card */
  ".wk-recovery-pop { display: none; background: #0f1c38; border: 1px solid #38bdf8; border-radius: 12px; padding: 12px; margin-top: 14px; text-align: left; animation: wkFadeIn 0.2s ease-out; }",
  "@keyframes wkFadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }",
  
  /* Finished Recap Screen */
  ".wk-recap-screen { background: #070d19; border-radius: 20px; box-sizing: border-box; }",
  ".wk-recap-head { text-align: center; padding: 10px 0 18px 0; border-bottom: 1px solid #1e293b; margin-bottom: 16px; }",
  ".wk-recap-title { font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 6px 0 0 0; }",
  ".wk-recap-badge { background: #059669; color: #ffffff; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.08em; display: inline-block; }",
  ".wk-recap-card { background: #0b1324; border: 1px solid #172554; border-radius: 16px; padding: 16px; margin-bottom: 14px; }",
  ".wk-badge-pr { background: linear-gradient(135deg, #f59e0b, #ef4444); color: white; font-size: 0.68rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; display: inline-block; }",
  ".wk-pr-bar-bg { background: #1e293b; border-radius: 999px; height: 8px; width: 100%; margin-top: 8px; overflow: hidden; }",
  ".wk-pr-bar-fill { background: linear-gradient(90deg, #38bdf8, #3b82f6); height: 100%; border-radius: 999px; }",
  ".wk-recap-set-item { display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; color: #94a3b8; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }",
  ".wk-btn-new-session { width: 100%; background: #2563eb; color: #ffffff; border: none; border-radius: 10px; padding: 12px; font-weight: 800; font-size: 0.9rem; cursor: pointer; margin-top: 10px; }",
  ".wk-btn-new-session:hover { background: #1d4ed8; }"
].join("\n");
rootEl.appendChild(style);

let savedRecap = null;
try {
  const cached = sessionStorage.getItem("wk_active_recap_data");
  if (cached) savedRecap = JSON.parse(cached);
} catch(e) {}

let sessionStartTime = null;
try {
  const storedStart = sessionStorage.getItem("wk_session_start_time");
  if (storedStart) sessionStartTime = parseInt(storedStart, 10);
} catch(e) {}
if (!sessionStartTime) {
  sessionStartTime = Date.now();
  try { sessionStorage.setItem("wk_session_start_time", sessionStartTime.toString()); } catch(e) {}
}

let activeSplitCategory = "Push";
let sessionExercises = [];
let timerInterval = null;
let timerSeconds = 90;
let timerTotal = 90;
let durationInterval = null;

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

function getVaultHistory() {
  const prs = {};
  try {
    const pages = dv.pages();
    for (let page of pages) {
      if (!page.file || !page.file.lists) continue;
      for (let item of page.file.lists) {
        if (item.workout && item.weight) {
          const name = String(item.workout).trim().toLowerCase();
          const w = parseFloat(item.weight) || 0;
          const r = parseFloat(item.reps) || 0;
          if (!prs[name] || w > prs[name].weight) {
            prs[name] = { weight: w, reps: r };
          }
        }
      }
    }
  } catch(e) {}
  return prs;
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

const trackerApp = document.createElement("div");
trackerApp.className = "wk-app";
rootEl.appendChild(trackerApp);

function renderFinishedScreen(data) {
  if (durationInterval) clearInterval(durationInterval);
  let cardsHtml = "";
  const soreMuscles = {};

  data.exercises.forEach(function(ex) {
    let setsListHtml = "";
    const info = exerciseDB.find(function(i) { return i.name === ex.name; }) || {};
    if (info.bodyPart) soreMuscles[info.bodyPart] = true;
    
    ex.sets.forEach(function(s, idx) {
      const displayWeight = (s.weight !== undefined && s.weight !== "") ? s.weight : (s.done ? "80" : "0");
      const displayReps = (s.reps !== undefined && s.reps !== "") ? s.reps : (s.done ? "8" : "0");
      const failLevel = s.failure || "3";
      
      setsListHtml += [
        '<div class="wk-recap-set-item">',
          '<span>Set ' + (idx + 1) + ': <b style="color:#38bdf8;">' + displayWeight + ' kg</b> × <b style="color:#ffffff;">' + displayReps + ' reps</b></span>',
          '<span style="color:' + (s.done ? '#34d399' : '#64748b') + '; font-weight:700;">Lvl ' + failLevel + ' ' + (s.done ? '✅' : '⏳') + '</span>',
        '</div>'
      ].join("");
    });

    let prSectionHtml = "";
    if (ex.prAnalysis) {
      if (ex.prAnalysis.type === "new_pr") {
        prSectionHtml = '<div style="margin-top:10px;"><span class="wk-badge-pr">🏆 NEW ALL-TIME PR!</span><div style="font-size:0.8rem; color:#34d399; margin-top:4px; font-weight:700;">' + ex.prAnalysis.topWeight + ' kg (+' + ex.prAnalysis.diff + ' kg over old ' + ex.prAnalysis.oldWeight + ' kg PR)</div></div>';
      } else if (ex.prAnalysis.type === "near_pr") {
        prSectionHtml = [
          '<div style="margin-top:10px;">',
            '<div style="display:flex; justify-content:space-between; font-size:0.78rem; color:#94a3b8;">',
              '<span>Today: <b style="color:#ffffff;">' + ex.prAnalysis.topWeight + ' kg</b></span>',
              '<span>All-time PR: <b style="color:#38bdf8;">' + ex.prAnalysis.oldWeight + ' kg</b></span>',
            '</div>',
            '<div class="wk-pr-bar-bg"><div class="wk-pr-bar-fill" style="width:' + ex.prAnalysis.pct + '%;"></div></div>',
            '<div style="font-size:0.75rem; color:#38bdf8; font-weight:700; margin-top:4px;">Hit ' + ex.prAnalysis.pct + '% of your all-time PR</div>',
          '</div>'
        ].join("");
      } else if (ex.prAnalysis.type === "baseline") {
        prSectionHtml = '<div style="margin-top:10px;"><span class="wk-badge-pr">🔥 Baseline Set</span><div style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">First time logged: <b style="color:#ffffff;">' + ex.prAnalysis.topWeight + ' kg</b> × ' + ex.prAnalysis.topReps + ' reps</div></div>';
      }
    }

    cardsHtml += [
      '<div class="wk-recap-card">',
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">',
          '<span style="font-weight:800; font-size:0.95rem; color:#ffffff;">' + ex.name + '</span>',
          '<span class="wk-tag wk-tag-sub">' + (info.subTarget || ex.muscle) + '</span>',
        '</div>',
        '<div>' + setsListHtml + '</div>',
        prSectionHtml,
      '</div>'
    ].join("");
  });

  trackerApp.innerHTML = [
    '<div class="wk-recap-screen">',
      '<div class="wk-recap-head">',
        '<span class="wk-recap-badge">Session Complete</span>',
        '<h2 class="wk-recap-title">Workout Summary & Analysis</h2>',
        '<div style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">Saved to vault successfully.</div>',
      '</div>',
      '<div class="wk-stats-grid">',
        '<div class="wk-stat-box"><div class="wk-stat-lbl">Time</div><div class="wk-stat-val" style="color:#a7f3d0;">' + data.durationFormatted + '</div></div>',
        '<div class="wk-stat-box"><div class="wk-stat-lbl">Est. Burn</div><div class="wk-stat-val" style="color:#f59e0b;">' + data.caloriesBurned + ' kcal</div></div>',
        '<div class="wk-stat-box"><div class="wk-stat-lbl">Volume</div><div class="wk-stat-val">' + data.totalVol.toLocaleString() + ' kg</div></div>',
        '<div class="wk-stat-box"><div class="wk-stat-lbl">Sets Completed</div><div class="wk-stat-val">' + data.totalSets + '</div></div>',
      '</div>',
      buildBodyMapSVG(soreMuscles),
      '<div>' + cardsHtml + '</div>',
      '<button class="wk-btn-new-session" id="btn-start-new">🔄 Start New Workout</button>',
    '</div>'
  ].join("");

  attachBodyMapEvents(trackerApp, soreMuscles);

  trackerApp.querySelector("#btn-start-new").onclick = function() {
    try {
      sessionStorage.removeItem("wk_active_recap_data");
      sessionStorage.removeItem("wk_session_start_time");
    } catch(e) {}
    sessionStartTime = Date.now();
    try { sessionStorage.setItem("wk_session_start_time", sessionStartTime.toString()); } catch(e) {}
    sessionExercises = [];
    initActiveApp();
  };
}

function initActiveApp() {
  let splitOptionsHtml = Object.keys(routinePresets).map(function(r) {
    return '<option value="' + r + '">' + r + '</option>';
  }).join("");

  trackerApp.innerHTML = [
    '<div class="wk-topbar">',
      '<div>',
        '<span class="wk-badge">PRO Tracker 2.6</span>',
        '<h3 style="margin:4px 0 0 0; font-size:1.25rem; font-weight:800;">Workout Session</h3>',
      '</div>',
      '<div class="wk-live-duration" id="live-session-time">⏱️ 00:00</div>',
    '</div>',
    
    /* Symmetrical 2x2 Balanced Stats Grid */
    '<div class="wk-stats-grid">',
      '<div class="wk-stat-box"><div class="wk-stat-lbl">Est. Burn</div><div class="wk-stat-val" id="stat-cals" style="color:#f59e0b;">0 kcal</div></div>',
      '<div class="wk-stat-box"><div class="wk-stat-lbl">Volume (kg)</div><div class="wk-stat-val" id="stat-vol">0</div></div>',
      '<div class="wk-stat-box"><div class="wk-stat-lbl">Sets Done</div><div class="wk-stat-val" id="stat-sets">0</div></div>',
      '<div class="wk-stat-box"><div class="wk-stat-lbl">Exercises</div><div class="wk-stat-val" id="stat-ex">0</div></div>',
    '</div>',
    
    /* Live Gap Detection Banner */
    '<div class="wk-gap-box" id="gap-banner" style="display:none;"></div>',

    /* Circular SVG Rest Countdown Dock */
    '<div class="wk-timer-radial-dock">',
      '<div style="display:flex; align-items:center; gap:12px;">',
        '<div class="wk-timer-ring-box">',
          '<svg class="wk-timer-ring-svg" width="54" height="54">',
            '<circle class="wk-timer-ring-bg" cx="27" cy="27" r="22" />',
            '<circle class="wk-timer-ring-bar" id="timer-ring-circle" cx="27" cy="27" r="22" stroke-dasharray="138.23" stroke-dashoffset="0" />',
          '</svg>',
          '<div class="wk-timer-ring-txt" id="timer-val">90s</div>',
        '</div>',
        '<div><div style="font-weight:800; font-size:0.85rem;">Rest Countdown</div><div style="font-size:0.7rem; color:#94a3b8;">Automatic on set check</div></div>',
      '</div>',
      '<div style="display:flex; gap:6px;">',
        '<button class="wk-timer-btn" id="t-60">+60s</button>',
        '<button class="wk-timer-btn" id="t-90">+90s</button>',
        '<button class="wk-timer-btn" id="t-reset" style="background:#ef4444; border-color:#ef4444;">Reset</button>',
      '</div>',
    '</div>',
    
    '<div class="wk-action-row">',
      '<button class="wk-btn" id="btn-routine">⚡ Load Split</button>',
      '<button class="wk-btn" id="btn-open-add">🔍 Add / Search</button>',
      '<button class="wk-btn wk-btn-save" id="btn-save-note">💾 Finish & Save</button>',
    '</div>',
    
    '<div class="wk-selector-card" id="routine-selector" style="display:none; background:#0f172a; border:1px solid #2563eb; border-radius:14px; padding:14px; margin-bottom:14px;">',
      '<div style="font-weight:800; font-size:0.95rem; margin-bottom:10px;">Select Routine Split</div>',
      '<select class="wk-dropdown" id="split-select" style="width:100%; height:40px; background:#070d19; border:1px solid #1e3a8a; color:#f8fafc; border-radius:8px; padding:6px 12px; margin-bottom:10px;">' + splitOptionsHtml + '</select>',
      '<div style="display:flex; justify-content:flex-end; gap:8px;">',
        '<button class="wk-btn" id="btn-split-cancel" style="flex:none; padding:6px 14px;">Cancel</button>',
        '<button class="wk-btn" id="btn-split-load" style="flex:none; padding:6px 16px; background:#2563eb; border:none;">Load Split</button>',
      '</div>',
    '</div>',
    
    '<div class="wk-selector-card" id="add-selector" style="display:none; background:#0f172a; border:1px solid #2563eb; border-radius:14px; padding:14px; margin-bottom:14px;">',
      '<div style="font-weight:800; font-size:0.95rem; margin-bottom:8px;">Find & Add Exercise</div>',
      '<input type="text" class="wk-search-input" id="search-box" style="width:100%; height:38px; background:#070d19; border:1px solid #1e3a8a; color:#f8fafc; border-radius:8px; padding:6px 12px; margin-bottom:8px; box-sizing:border-box;" placeholder="Search exercise, calves, target..." />',
      '<div class="wk-search-results" id="search-list" style="max-height:190px; overflow-y:auto; border:1px solid #1e293b; border-radius:8px; background:#070d19; margin-bottom:10px;"></div>',
      '<div style="display:flex; justify-content:flex-end; gap:8px;">',
        '<button class="wk-btn" id="btn-ex-cancel" style="flex:none; padding:6px 14px;">Close</button>',
      '</div>',
    '</div>',

    /* Barbell Plate Popover */
    '<div class="wk-plate-modal" id="plate-popover">',
      '<div style="display:flex; justify-content:space-between; align-items:center;">',
        '<span style="font-weight:800; font-size:0.85rem; color:#38bdf8;">🏋️ Barbell Loading</span>',
        '<button class="wk-btn-del" id="btn-close-plate">✕</button>',
      '</div>',
      '<div id="plate-popover-text" style="font-size:0.8rem; color:#94a3b8; margin-top:4px;">Total Weight: 80 kg</div>',
      '<div class="wk-plate-bar-visual" id="plate-bar-render"></div>',
      '<div id="plate-breakdown-list" style="font-size:0.75rem; color:#cbd5e1; text-align:center;"></div>',
    '</div>',
    
    '<div id="cards-container"></div>'
  ].join("");

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

    timerInterval = setInterval(function() {
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

  trackerApp.querySelector("#t-60").onclick = function() { startRestTimer(60); };
  trackerApp.querySelector("#t-90").onclick = function() { startRestTimer(90); };
  trackerApp.querySelector("#t-reset").onclick = function() {
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
    const filtered = exerciseDB.filter(function(ex) {
      return ex.name.toLowerCase().includes(q) ||
             ex.subTarget.toLowerCase().includes(q) ||
             ex.muscle.toLowerCase().includes(q);
    });

    if (filtered.length === 0) {
      searchList.innerHTML = '<div style="padding:10px; color:#64748b; font-size:0.8rem; text-align:center;">No matching exercises found.</div>';
      return;
    }

    searchList.innerHTML = filtered.map(function(ex) {
      return [
        '<div class="wk-search-item" data-name="' + ex.name + '" style="padding:8px 10px; border-bottom:1px solid #111827; cursor:pointer;">',
          '<div style="font-weight:700; color:#ffffff; font-size:0.82rem;">' + ex.name + '</div>',
          '<div style="font-size:0.7rem; color:#94a3b8; display:flex; gap:6px; margin-top:2px;">',
            '<span style="color:#38bdf8;">' + ex.subTarget + '</span> • ',
            '<span>' + ex.position + '</span> • ',
            '<span>' + ex.tier + '</span>',
          '</div>',
        '</div>'
      ].join("");
    }).join("");

    searchList.querySelectorAll(".wk-search-item").forEach(function(item) {
      item.onclick = function() {
        addExerciseToSession(item.dataset.name);
        addSelector.style.display = "none";
      };
    });
  }

  searchBox.oninput = function() { renderSearchList(searchBox.value); };

  trackerApp.querySelector("#btn-open-add").onclick = function() {
    routineSelector.style.display = "none";
    addSelector.style.display = "block";
    searchBox.value = "";
    renderSearchList("");
    searchBox.focus();
  };
  trackerApp.querySelector("#btn-ex-cancel").onclick = function() { addSelector.style.display = "none"; };

  trackerApp.querySelector("#btn-routine").onclick = function() {
    addSelector.style.display = "none";
    routineSelector.style.display = "block";
  };
  trackerApp.querySelector("#btn-split-cancel").onclick = function() { routineSelector.style.display = "none"; };

  trackerApp.querySelector("#btn-split-load").onclick = function() {
    const selected = trackerApp.querySelector("#split-select").value;
    if (selected.includes("Push")) activeSplitCategory = "Push";
    else if (selected.includes("Pull")) activeSplitCategory = "Pull";
    else if (selected.includes("Legs")) activeSplitCategory = "Legs";

    const list = routinePresets[selected] || [];
    sessionExercises = list.map(function(item) {
      const data = exerciseDB.find(function(e) { return e.name === item.name; }) || {};
      return {
        name: item.name,
        muscle: data.muscle || "Custom",
        subTarget: data.subTarget || "",
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
    render();
  };

  function addExerciseToSession(name) {
    const data = exerciseDB.find(function(e) { return e.name === name; }) || { name: name, muscle: "Custom" };
    sessionExercises.push({
      name: data.name,
      muscle: data.muscle,
      subTarget: data.subTarget || "",
      position: data.position || "",
      risk: data.risk || "Low 🟢",
      tier: data.tier || "A-Tier",
      sets: [
        { weight: "", reps: "", failure: "", done: false },
        { weight: "", reps: "", failure: "", done: false },
        { weight: "", reps: "", failure: "", done: false }
      ]
    });
    render();
  }

  function updateGapAndRedundancy() {
    const gapBanner = trackerApp.querySelector("#gap-banner");
    const required = splitRequiredHeads[activeSplitCategory] || [];
    const currentHeads = sessionExercises.map(function(e) { return e.subTarget; });
    const missing = required.filter(function(req) { return !currentHeads.includes(req); });

    if (missing.length > 0 && sessionExercises.length > 0) {
      let chipsHtml = missing.map(function(m) {
        const reco = exerciseDB.find(function(e) { return e.subTarget === m; });
        return '<span class="wk-gap-chip" data-name="' + (reco ? reco.name : "") + '">➕ Add ' + m + '</span>';
      }).join("");

      gapBanner.innerHTML = [
        '<div class="wk-gap-title">⚡ Micro-Muscle Gap Detected (' + activeSplitCategory + ')</div>',
        '<div style="color:#94a3b8; font-size:0.75rem;">Missing direct volume for:</div>',
        '<div class="wk-gap-items">' + chipsHtml + '</div>'
      ].join("");

      gapBanner.style.display = "block";

      gapBanner.querySelectorAll(".wk-gap-chip").forEach(function(chip) {
        chip.onclick = function() {
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

    sessionExercises.forEach(function(ex) {
      ex.sets.forEach(function(s) {
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

    trackerApp.querySelector("#stat-cals").textContent = cals + " kcal";
    trackerApp.querySelector("#stat-vol").textContent = totalVol.toLocaleString();
    trackerApp.querySelector("#stat-sets").textContent = String(totalSets);
    trackerApp.querySelector("#stat-ex").textContent = String(sessionExercises.length);
  }

  const plateModal = trackerApp.querySelector("#plate-popover");
  const plateRender = trackerApp.querySelector("#plate-bar-render");
  const plateList = trackerApp.querySelector("#plate-breakdown-list");
  const plateText = trackerApp.querySelector("#plate-popover-text");

  trackerApp.querySelector("#btn-close-plate").onclick = function() { plateModal.style.display = "none"; };

  function showPlateCalculator(weight) {
    const w = parseFloat(weight) || 80;
    plateText.textContent = "Bar: 20kg • Per Side: " + Math.max(0, ((w - 20) / 2)).toFixed(1) + " kg";
    const plates = calculatePlates(w);

    let discsHtml = '<div class="wk-plate-sleeve"></div>';
    plates.forEach(p => {
      discsHtml += '<div class="wk-plate-disc ' + p.cls + '"></div>';
    });
    plateRender.innerHTML = discsHtml;
    
    if (plates.length > 0) {
      plateList.innerHTML = "Stack per side: <b>" + plates.map(p => p.weight + "kg").join(" + ") + "</b>";
    } else {
      plateList.innerHTML = "Olympic Bar Only (20 kg)";
    }
    plateModal.style.display = "block";
  }

  function render() {
    cardsContainer.innerHTML = "";

    const counts = {};
    sessionExercises.forEach(function(e) {
      if (e.subTarget) counts[e.subTarget] = (counts[e.subTarget] || 0) + 1;
    });

    sessionExercises.forEach(function(ex, exIdx) {
      const card = document.createElement("div");
      card.className = "wk-card";

      const isRedundant = counts[ex.subTarget] > 1;
      const riskClass = (ex.risk && ex.risk.includes("Low")) ? "green" : "";

      let top1RM = 0;
      ex.sets.forEach(function(s) {
        const w = parseFloat(s.weight) || 0;
        const r = parseFloat(s.reps) || 0;
        if (w > 0 && r > 0) {
          const est = Math.round(w * (1 + r / 30));
          if (est > top1RM) top1RM = est;
        }
      });

      let tagsHtml = [
        '<div class="wk-tag-container">',
          ex.subTarget ? '<span class="wk-tag wk-tag-sub">' + ex.subTarget + '</span>' : '',
          ex.position ? '<span class="wk-tag wk-tag-pos">' + ex.position + '</span>' : '',
          ex.tier ? '<span class="wk-tag wk-tag-tier">' + ex.tier + '</span>' : '',
          ex.risk ? '<span class="wk-tag wk-tag-risk ' + riskClass + '">Joint Stress: ' + ex.risk + '</span>' : '',
          top1RM > 0 ? '<span class="wk-tag wk-tag-1rm">⚡ Est. 1RM: ' + top1RM + ' kg</span>' : '',
          isRedundant ? '<span class="wk-tag wk-tag-warn">⚠️ Duplicate Target Overlap</span>' : '',
        '</div>'
      ].join("");

      let rowsHtml = [
        '<div class="wk-set-row">',
          '<div class="wk-th">SET</div>',
          '<div class="wk-th">KG</div>',
          '<div class="wk-th">REPS</div>',
          '<div class="wk-th">FAIL (1-5)</div>',
          '<div class="wk-th">DONE</div>',
          '<div></div>',
        '</div>'
      ].join("");

      ex.sets.forEach(function(s, sIdx) {
        rowsHtml += [
          '<div class="wk-set-row' + (s.done ? ' row-done' : '') + '">',
            '<div style="font-size:0.75rem; text-align:center; color:#64748b; font-weight:800;">' + (sIdx + 1) + '</div>',
            '<input type="number" class="wk-input kg-clickable set-weight" data-ex="' + exIdx + '" data-set="' + sIdx + '" value="' + s.weight + '" placeholder="80" title="Click for barbell plate loader" />',
            '<input type="number" class="wk-input set-reps" data-ex="' + exIdx + '" data-set="' + sIdx + '" value="' + s.reps + '" placeholder="8" />',
            '<input type="number" min="1" max="5" class="wk-input set-fail" data-ex="' + exIdx + '" data-set="' + sIdx + '" value="' + s.failure + '" placeholder="1-5" />',
            '<input type="checkbox" class="wk-check set-done" data-ex="' + exIdx + '" data-set="' + sIdx + '" ' + (s.done ? "checked" : "") + ' />',
            '<button class="wk-btn-del btn-del-set" data-ex="' + exIdx + '" data-set="' + sIdx + '">✕</button>',
          '</div>'
        ].join("");
      });

      card.innerHTML = [
        '<div class="wk-card-top">',
          '<span class="wk-card-title">' + (exIdx + 1) + '. ' + ex.name + '</span>',
          '<button class="wk-btn-del btn-del-card" data-ex="' + exIdx + '">✕</button>',
        '</div>',
        tagsHtml,
        rowsHtml,
        '<button class="wk-btn-addset btn-add-set" data-ex="' + exIdx + '">+ Add Set</button>'
      ].join("");

      cardsContainer.appendChild(card);
    });

    updateStats();
    updateGapAndRedundancy();
    attachEvents();
  }

  function attachEvents() {
    trackerApp.querySelectorAll(".set-weight").forEach(function(inp) {
      inp.oninput = function(e) {
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].weight = e.target.value;
        updateStats();
      };
      inp.ondblclick = function(e) {
        showPlateCalculator(e.target.value || 80);
      };
    });

    trackerApp.querySelectorAll(".set-reps").forEach(function(inp) {
      inp.oninput = function(e) {
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].reps = e.target.value;
        updateStats();
      };
    });

    trackerApp.querySelectorAll(".set-fail").forEach(function(inp) {
      inp.oninput = function(e) {
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].failure = e.target.value;
      };
    });

    trackerApp.querySelectorAll(".set-done").forEach(function(chk) {
      chk.onchange = function(e) {
        const isDone = e.target.checked;
        sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].done = isDone;
        const row = e.target.closest('.wk-set-row');
        if (row) {
          if (isDone) row.classList.add('row-done');
          else row.classList.remove('row-done');
        }
        if (isDone) startRestTimer(90);
        updateStats();
      };
    });

    trackerApp.querySelectorAll(".btn-del-set").forEach(function(btn) {
      btn.onclick = function() {
        sessionExercises[btn.dataset.ex].sets.splice(btn.dataset.set, 1);
        render();
      };
    });

    trackerApp.querySelectorAll(".btn-add-set").forEach(function(btn) {
      btn.onclick = function() {
        sessionExercises[btn.dataset.ex].sets.push({ weight: "", reps: "", failure: "", done: false });
        render();
      };
    });

    trackerApp.querySelectorAll(".btn-del-card").forEach(function(btn) {
      btn.onclick = function() {
        sessionExercises.splice(btn.dataset.ex, 1);
        render();
      };
    });
  }

  trackerApp.querySelector("#btn-save-note").onclick = async function() {
    const activeFile = app.workspace.getActiveFile();
    if (!activeFile) return;

    const vaultHistory = getVaultHistory();
    let totalVol = 0;
    let totalSets = 0;
    let sumIntensity = 0;

    const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStartTime) / 1000));
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    const durationFormatted = mins + "m " + secs + "s";
    const elapsedMinutes = Math.max(1, Math.round(elapsedSeconds / 60));

    let fileContent = await app.vault.read(activeFile);
    let markdownLog = "\n\n### 🏋️ Saved Workout Log\n";

    sessionExercises.forEach(function(ex) {
      let topWeightToday = 0;
      let topRepsToday = 0;

      markdownLog += "\n**" + ex.name + "** (" + (ex.subTarget || ex.muscle) + ")\n";
      ex.sets.forEach(function(s) {
        const w = parseFloat(s.weight) || (s.done ? 80 : 0);
        const r = parseFloat(s.reps) || (s.done ? 8 : 0);
        const failVal = s.failure || "3";

        if (w > topWeightToday) {
          topWeightToday = w;
          topRepsToday = r;
        }
        if (s.done) {
          totalSets++;
          totalVol += (w * r);
          sumIntensity += (parseFloat(failVal) || 3);
        }

        markdownLog += "- (workout:: " + ex.name + ") (muscle:: " + ex.muscle + ") (subTarget:: " + ex.subTarget + ") (weight:: " + w + ") kg × (reps:: " + r + ") reps [fail:: " + failVal + "] " + (s.done ? "✅" : "⏳") + "\n";
      });

      const oldPR = vaultHistory[ex.name.toLowerCase()];
      if (topWeightToday > 0) {
        if (!oldPR || oldPR.weight === 0) {
          ex.prAnalysis = { type: "baseline", topWeight: topWeightToday, topReps: topRepsToday };
        } else if (topWeightToday > oldPR.weight) {
          ex.prAnalysis = { type: "new_pr", topWeight: topWeightToday, diff: (topWeightToday - oldPR.weight).toFixed(1), oldWeight: oldPR.weight };
        } else {
          const pct = Math.min(100, Math.round((topWeightToday / oldPR.weight) * 100));
          ex.prAnalysis = { type: "near_pr", topWeight: topWeightToday, oldWeight: oldPR.weight, pct: pct };
        }
      }
    });

    const avgIntensity = totalSets > 0 ? (sumIntensity / totalSets) : 3;
    const caloriesBurned = calculateCaloriesBurned(elapsedMinutes, totalVol, totalSets, avgIntensity);

    markdownLog += "\n- [summary:: done] (duration:: " + durationFormatted + ") (calories:: " + caloriesBurned + " kcal) (volume:: " + totalVol + " kg) (sets:: " + totalSets + ")\n";

    const recapData = {
      exercises: sessionExercises,
      totalVol: totalVol,
      totalSets: totalSets,
      durationFormatted: durationFormatted,
      caloriesBurned: caloriesBurned
    };

    try {
      sessionStorage.setItem("wk_active_recap_data", JSON.stringify(recapData));
    } catch(e) {}

    await app.vault.modify(activeFile, fileContent + markdownLog);
    renderFinishedScreen(recapData);
  };
}


// ####################################################################################################
// ####################################################################################################
// ######################### [ START OF ISOLATED MUSCLE HEATMAP / BODY SVG ] ##########################
// ####################################################################################################
// ####################################################################################################

const recoveryProfiles = {
  chest_upper: { name: "Upper Pectorals", hours: 48, rate: "Standard", desc: "Clavicular head fibers fatigued from incline presses/flyes." },
  chest_lower: { name: "Mid / Lower Pecs", hours: 48, rate: "Standard", desc: "Sternal/costal chest fibers under high micro-damage." },
  delts_front: { name: "Anterior Deltoids", hours: 36, rate: "Fast", desc: "Front delts heavily engaged during pressing movements." },
  delts_side: { name: "Lateral Deltoids", hours: 24, rate: "Ultra-Fast", desc: "Side delts recover quickly; ready for frequent weekly loading." },
  biceps: { name: "Biceps Brachii", hours: 36, rate: "Fast", desc: "Long and short bicep heads under direct pulling strain." },
  forearms: { name: "Forearms & Grip", hours: 24, rate: "Ultra-Fast", desc: "Brachioradialis & wrist flexors with rapid recovery capacity." },
  quads: { name: "Quadriceps", hours: 72, rate: "High Systemic", desc: "Deep knee extension fatigue; requires 48-72h for max output." },
  
  traps_upper: { name: "Traps & Upper Back", hours: 48, rate: "Fast", desc: "Rhomboids and mid/upper traps under heavy eccentric row load." },
  delts_rear: { name: "Posterior Deltoids", hours: 24, rate: "Ultra-Fast", desc: "Rear delts recover very fast; tolerate high frequency." },
  lats: { name: "Latissimus Dorsi", hours: 48, rate: "Standard", desc: "V-taper lat width fibers under high metabolic stretch." },
  triceps: { name: "Triceps Brachii", hours: 48, rate: "Standard", desc: "Long and lateral triceps heads fatigued from lockouts." },
  lower_back: { name: "Spinal Erectors", hours: 72, rate: "High Axial", desc: "High central nervous system fatigue; avoid heavy axial loads." },
  glutes: { name: "Glute Complex", hours: 48, rate: "Standard", desc: "Gluteus maximus under high hip-thrust & squat tension." },
  hamstrings: { name: "Hamstrings", hours: 72, rate: "High Systemic", desc: "High stretch-induced damage from RDLs and leg curls." },
  calves: { name: "Calves (Gastro/Soleus)", hours: 24, rate: "Ultra-Fast", desc: "Dense calf muscle fibers built for rapid daily recovery." }
};

function buildBodyMapSVG(soreMuscles) {
  function getSoreClass(part) {
    if (!soreMuscles[part]) return "";
    const hours = recoveryProfiles[part] ? recoveryProfiles[part].hours : 48;
    if (hours >= 72) return "sore-high";
    if (hours >= 48) return "sore-med";
    return "sore-fast";
  }

  // Generate interactive fatigue status chips
  let statusPillsHtml = "";
  Object.keys(soreMuscles).forEach(part => {
    const prof = recoveryProfiles[part];
    if (!prof) return;
    statusPillsHtml += [
      '<div class="wk-hud-pill" data-part="' + part + '">',
        '<div class="wk-hud-pill-name">' + prof.name + '</div>',
        '<div class="wk-hud-pill-time">⏳ ' + prof.hours + ' Hours Rest</div>',
      '</div>'
    ].join("");
  });

  return [
    '<div class="wk-body-dock">',
      '<div style="font-size:0.95rem; font-weight:800; color:#ffffff;">🧬 Musculoskeletal Recovery HUD</div>',
      '<div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">Anatomically mapped muscle groups. Tap any highlighted muscle or chip for full fatigue details.</div>',
      '<div class="wk-anatomy-wrap">',
        // ANTERIOR MODEL (Front)
        '<svg viewBox="0 0 200 320" width="130" height="208">',
          '<g id="anterior-view">',
            // Head & Neck
            '<path d="M92 20 C92 10 108 10 108 20 C108 30 92 30 92 20 Z" fill="#172033" stroke="#070d19" />',
            '<path d="M96 30 L95 44 L105 44 L104 30 Z" fill="#172033" stroke="#070d19" />',
            // Front Deltoids
            '<path id="delts_front_l" class="wk-muscle-path ' + getSoreClass('delts_front') + '" data-part="delts_front" d="M72 46 C55 48 50 64 58 80 C65 76 72 64 74 50 Z" />',
            '<path id="delts_front_r" class="wk-muscle-path ' + getSoreClass('delts_front') + '" data-part="delts_front" d="M128 46 C145 48 150 64 142 80 C135 76 128 64 126 50 Z" />',
            // Side Deltoids
            '<path id="delts_side_l" class="wk-muscle-path ' + getSoreClass('delts_side') + '" data-part="delts_side" d="M52 58 C40 70 44 90 50 98 C55 88 58 72 56 62 Z" />',
            '<path id="delts_side_r" class="wk-muscle-path ' + getSoreClass('delts_side') + '" data-part="delts_side" d="M148 58 C160 70 156 90 150 98 C145 88 142 72 144 62 Z" />',
            // Upper Pecs (Clavicular)
            '<path id="chest_upper_l" class="wk-muscle-path ' + getSoreClass('chest_upper') + '" data-part="chest_upper" d="M76 48 C98 48 98 64 98 68 C78 70 66 64 74 50 Z" />',
            '<path id="chest_upper_r" class="wk-muscle-path ' + getSoreClass('chest_upper') + '" data-part="chest_upper" d="M124 48 C102 48 102 64 102 68 C122 70 134 64 126 50 Z" />',
            // Lower Pecs (Sternal/Costal)
            '<path id="chest_lower_l" class="wk-muscle-path ' + getSoreClass('chest_lower') + '" data-part="chest_lower" d="M75 69 C98 68 98 92 98 94 C75 96 64 84 72 70 Z" />',
            '<path id="chest_lower_r" class="wk-muscle-path ' + getSoreClass('chest_lower') + '" data-part="chest_lower" d="M125 69 C102 68 102 92 102 94 C125 96 136 84 128 70 Z" />',
            // Biceps
            '<path id="biceps_l" class="wk-muscle-path ' + getSoreClass('biceps') + '" data-part="biceps" d="M56 100 C44 112 48 136 58 142 C64 132 64 114 60 102 Z" />',
            '<path id="biceps_r" class="wk-muscle-path ' + getSoreClass('biceps') + '" data-part="biceps" d="M144 100 C156 112 152 136 142 142 C136 132 136 114 140 102 Z" />',
            // Forearms
            '<path id="forearms_l" class="wk-muscle-path ' + getSoreClass('forearms') + '" data-part="forearms" d="M56 144 C40 158 30 186 38 202 C48 192 58 166 58 146 Z" />',
            '<path id="forearms_r" class="wk-muscle-path ' + getSoreClass('forearms') + '" data-part="forearms" d="M144 144 C160 158 170 186 162 202 C152 192 142 166 142 146 Z" />',
            // Core
            '<path d="M82 98 C100 96 118 98 116 164 C100 168 84 164 82 98 Z" fill="#172033" stroke="#070d19" />',
            // Quads
            '<path id="quads_l" class="wk-muscle-path ' + getSoreClass('quads') + '" data-part="quads" d="M78 168 C62 186 54 231 70 258 C88 256 95 231 94 170 Z" />',
            '<path id="quads_r" class="wk-muscle-path ' + getSoreClass('quads') + '" data-part="quads" d="M122 168 C138 186 146 231 130 258 C112 256 105 231 106 170 Z" />',
            // Calves Front
            '<path id="calves_fl" class="wk-muscle-path ' + getSoreClass('calves') + '" data-part="calves" d="M72 262 C62 276 68 296 76 306 C86 300 88 284 86 262 Z" />',
            '<path id="calves_fr" class="wk-muscle-path ' + getSoreClass('calves') + '" data-part="calves" d="M128 262 C138 276 132 296 124 306 C114 300 112 284 114 262 Z" />',
          '</g>',
        '</svg>',

        // POSTERIOR MODEL (Back)
        '<svg viewBox="0 0 200 320" width="130" height="208">',
          '<g id="posterior-view">',
            // Head Back
            '<path d="M92 20 C92 10 108 10 108 20 C108 30 92 30 92 20 Z" fill="#172033" stroke="#070d19" />',
            // Trapezius & Upper Back
            '<path id="traps_upper" class="wk-muscle-path ' + getSoreClass('traps_upper') + '" data-part="traps_upper" d="M80 40 C100 32 120 40 135 58 C115 70 100 92 100 92 C100 92 85 70 65 58 Z" />',
            // Rear Delts
            '<path id="delts_rear_l" class="wk-muscle-path ' + getSoreClass('delts_rear') + '" data-part="delts_rear" d="M64 50 C48 54 44 70 52 84 C62 80 68 66 68 52 Z" />',
            '<path id="delts_rear_r" class="wk-muscle-path ' + getSoreClass('delts_rear') + '" data-part="delts_rear" d="M136 50 C152 54 156 70 148 84 C138 80 132 66 132 52 Z" />',
            // Lats
            '<path id="lats_l" class="wk-muscle-path ' + getSoreClass('lats') + '" data-part="lats" d="M68 84 C52 106 62 134 82 144 C90 130 95 106 92 88 Z" />',
            '<path id="lats_r" class="wk-muscle-path ' + getSoreClass('lats') + '" data-part="lats" d="M132 84 C148 106 138 134 118 144 C110 130 105 106 108 88 Z" />',
            // Triceps
            '<path id="triceps_l" class="wk-muscle-path ' + getSoreClass('triceps') + '" data-part="triceps" d="M52 88 C40 102 42 132 54 142 C60 130 62 110 58 90 Z" />',
            '<path id="triceps_r" class="wk-muscle-path ' + getSoreClass('triceps') + '" data-part="triceps" d="M148 88 C160 102 158 132 146 142 C140 130 138 110 142 90 Z" />',
            // Lower Back (Erectors)
            '<path id="lower_back" class="wk-muscle-path ' + getSoreClass('lower_back') + '" data-part="lower_back" d="M84 136 C100 132 116 136 114 164 C100 166 86 164 84 136 Z" />',
            // Glutes
            '<path id="glutes_l" class="wk-muscle-path ' + getSoreClass('glutes') + '" data-part="glutes" d="M74 166 C65 194 92 204 98 170 Z" />',
            '<path id="glutes_r" class="wk-muscle-path ' + getSoreClass('glutes') + '" data-part="glutes" d="M126 166 C135 194 108 204 102 170 Z" />',
            // Hamstrings
            '<path id="hamstrings_l" class="wk-muscle-path ' + getSoreClass('hamstrings') + '" data-part="hamstrings" d="M76 204 C66 226 74 252 92 256 C98 240 98 216 96 204 Z" />',
            '<path id="hamstrings_r" class="wk-muscle-path ' + getSoreClass('hamstrings') + '" data-part="hamstrings" d="M124 204 C134 226 126 252 108 256 C102 240 102 216 104 204 Z" />',
            // Calves Back
            '<path id="calves_bl" class="wk-muscle-path ' + getSoreClass('calves') + '" data-part="calves" d="M76 262 C62 280 72 301 84 306 C94 300 94 282 90 262 Z" />',
            '<path id="calves_br" class="wk-muscle-path ' + getSoreClass('calves') + '" data-part="calves" d="M124 262 C138 280 128 301 116 306 C106 300 106 282 110 262 Z" />',
          '</g>',
        '</svg>',
      '</div>',
      '<div class="wk-hud-pills-grid">' + statusPillsHtml + '</div>',
      '<div class="wk-recovery-pop" id="recovery-info-box"></div>',
    '</div>'
  ].join("");
}

function attachBodyMapEvents(container, soreMuscles) {
  const infoBox = container.querySelector("#recovery-info-box");
  
  function showMuscleDetail(part) {
    const isHit = soreMuscles[part];
    const prof = recoveryProfiles[part] || { name: part, hours: 48, rate: "Standard", desc: "" };

    if (isHit) {
      infoBox.innerHTML = [
        '<div style="font-weight:800; font-size:0.95rem; color:#ef4444;">⚡ ' + prof.name + ' (Direct Hypertrophy Stimulus)</div>',
        '<div style="font-size:0.85rem; color:#ffffff; margin-top:4px;">⏳ <b>' + prof.hours + ' Hours</b> Estimated Full Recovery Window</div>',
        '<div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">' + prof.desc + ' Metabolic Rate: ' + prof.rate + '.</div>'
      ].join("");
    } else {
      infoBox.innerHTML = [
        '<div style="font-weight:800; font-size:0.95rem; color:#38bdf8;">🟢 ' + prof.name + ' (Fresh & Fully Recovered)</div>',
        '<div style="font-size:0.85rem; color:#ffffff; margin-top:4px;">Zero residual fatigue from this session. Prime candidate for upcoming targeted volume!</div>'
      ].join("");
    }
    infoBox.style.display = "block";
  }

  container.querySelectorAll(".wk-muscle-path").forEach(p => {
    p.onclick = function() { showMuscleDetail(p.dataset.part); };
  });

  container.querySelectorAll(".wk-hud-pill").forEach(pill => {
    pill.onclick = function() { showMuscleDetail(pill.dataset.part); };
  });
}

// ####################################################################################################
// ####################################################################################################
// ########################## [ END OF ISOLATED MUSCLE HEATMAP / BODY SVG ] ###########################
// ####################################################################################################
// ####################################################################################################


if (savedRecap) {
  renderFinishedScreen(savedRecap);
} else {
  initActiveApp();
}
```

```dataviewjs
// 1. LOAD JSON DATA
const dataFile = app.vault.getAbstractFileByPath("apps/scripts/soma-data.json");
const registryFile = app.vault.getAbstractFileByPath("apps/scripts/muscleRegistry.json");

if (!dataFile || !registryFile) {
    if (!dataFile) dv.paragraph("❌ soma-data.json not found");
    if (!registryFile) dv.paragraph("❌ muscleRegistry.json not found");
    return;
}

const dataContent = await app.vault.read(dataFile);
const registryContent = await app.vault.read(registryFile);
const data = JSON.parse(dataContent);
const muscleRegistry = JSON.parse(registryContent);

const STATIC_PARTS = data.STATIC_PARTS;
const FRONT_OUTLINE = data.FRONT_OUTLINE;
const BACK_OUTLINE = data.BACK_OUTLINE;
const FRONT_VIEWBOX = "0 0 724 1448";
const BACK_VIEWBOX = "724 0 724 1448";

const INSTANCE_ID = Math.random().toString(36).slice(2, 9);

// 2. HEAT COLOR MAPPING
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

// 3. STATE
let currentView = "front";
let selectedKey = null;
let selectedPoint = null;
let activePresetKeys = null;

// 4. MOUNT ROOT & CSS
const rootEl = dv.el("div", "", { cls: "bm3-root" });
const styleEl = document.createElement("style");
styleEl.textContent = `
    .bm3-root {
        background: radial-gradient(circle at 50% 0%, #131c2c 0%, #080b12 65%);
        border: 1px solid rgba(96,165,250,0.14);
        border-radius: 20px;
        padding: 26px 24px;
        font-family: var(--font-interface);
        color: #e2e8f0;
        width: 100%;
        max-width: 1440px;
        margin: 0 auto;
        box-sizing: border-box;
    }
    .bm3-header { text-align: center; margin-bottom: 20px; position: relative; }
    .bm3-title { font-size: 1.55rem; font-weight: 800; color: #f1f5f9; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .bm3-title .bm3-icon { color: #38bdf8; }
    .bm3-subtitle { color: #64748b; font-size: 0.85rem; margin-top: 6px; }

    .bm3-viewtabs { display: flex; justify-content: center; gap: 6px; margin: 18px 0 6px; }
    .bm3-viewtab {
        background: rgba(148,163,184,0.06);
        border: 1px solid rgba(148,163,184,0.16);
        color: #94a3b8;
        padding: 7px 22px;
        border-radius: 999px;
        font-size: 0.78rem;
        font-weight: 700;
        letter-spacing: 0.04em;
        cursor: pointer;
        transition: all 0.18s ease;
    }
    .bm3-viewtab:hover { color: #cbd5e1; border-color: rgba(148,163,184,0.3); }
    .bm3-viewtab.active {
        background: linear-gradient(180deg, #1d4ed8, #1e3a8a);
        border-color: #3b82f6;
        color: #f8fafc;
        box-shadow: 0 0 16px rgba(59,130,246,0.35);
    }

    .bm3-layout { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; padding: 8px 0 8px; }

    .bm3-panel {
        background: rgba(15,23,36,0.7);
        border: 1px solid rgba(148,163,184,0.1);
        border-radius: 14px;
        padding: 16px 14px;
        width: 142px;
        flex-shrink: 0;
        align-self: center;
    }
    .bm3-panel-title { font-size: 0.68rem; letter-spacing: 0.09em; color: #64748b; font-weight: 700; margin-bottom: 16px; }
    .bm3-legend-row { display: flex; align-items: center; gap: 10px; margin-bottom: 13px; }
    .bm3-dot { width: 11px; height: 11px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 8px currentColor; }
    .bm3-legend-text { font-size: 0.8rem; line-height: 1.2; }
    .bm3-legend-text .sub { display: block; font-size: 0.68rem; color: #64748b; }

    .bm3-howto-row { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 16px; }
    .bm3-howto-icon { width: 26px; height: 26px; border-radius: 8px; background: rgba(56,189,248,0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.85rem; }
    .bm3-howto-text { font-size: 0.78rem; color: #94a3b8; line-height: 1.35; }

    .bm3-viewport { position: relative; width: 236px; height: 472px; flex-shrink: 0; margin: 0 auto; }
    .bm3-vector-svg { width: 100%; height: 100%; filter: drop-shadow(0 18px 30px rgba(0,0,0,0.65)); overflow: visible; }
    .bm3-base-body { fill: #1a2030; stroke: #2c3646; stroke-width: 2.5; }
    .bm3-static-part { fill: #1a2030; }

    .bm3-muscle-path {
        cursor: pointer;
        transition: filter 0.22s ease, opacity 0.22s ease;
        filter: saturate(0.85) brightness(0.9);
        opacity: 0.95;
        transform-box: fill-box;
        transform-origin: center;
    }
    .bm3-muscle-path:hover {
        filter: saturate(1.2) brightness(1.2) drop-shadow(0 0 9px currentColor);
        opacity: 1;
    }
    .bm3-muscle-path.inactive:hover {
        filter: brightness(1.08) drop-shadow(0 0 7px rgba(56,189,248,0.55));
        opacity: 1;
    }
    .bm3-muscle-path.selected {
        filter: saturate(1.3) brightness(1.32) drop-shadow(0 0 16px currentColor);
        opacity: 1;
    }
    .bm3-muscle-path.selected-inactive {
        filter: saturate(1.3) brightness(1.3) drop-shadow(0 0 16px #38bdf8);
        stroke: #38bdf8 !important;
        stroke-width: 1.4;
        opacity: 1;
    }
    .bm3-fiber-overlay {
        pointer-events: none;
        mix-blend-mode: overlay;
        transition: opacity 0.22s ease;
        opacity: 0.45;
        transform-box: fill-box;
        transform-origin: center;
    }
    .bm3-muscle-path:hover + .bm3-fiber-overlay,
    .bm3-fiber-overlay.selected { opacity: 0.65; }

    @keyframes bm3-pulse {
        0%   { transform: scale(1.018); }
        100% { transform: scale(1); }
    }
    .bm3-muscle-path.selected,
    .bm3-fiber-overlay.selected {
        animation: bm3-pulse 0.24s ease-out;
    }

    .bm3-annot-group text { user-select: none; }
    .bm3-annot-dot { filter: drop-shadow(0 0 6px #38bdf8); }
    .bm3-annot-backdrop { fill: rgba(11, 18, 32, 0.94); rx: 6; ry: 6; }

    .bm3-detail-card {
        margin-top: 30px;
        background: rgba(15,23,36,0.85);
        border: 1px solid rgba(56,189,248,0.35);
        border-radius: 14px;
        padding: 22px 28px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
        box-shadow: 0 0 30px rgba(56,189,248,0.06);
    }
    .bm3-detail-name { font-size: 1.15rem; font-weight: 800; color: #f8fafc; }
    .bm3-detail-hours { color: #38bdf8; font-size: 0.82rem; font-weight: 700; margin: 4px 0 8px; display: flex; align-items: center; gap: 6px; }
    .bm3-detail-desc { color: #94a3b8; font-size: 0.85rem; max-width: 560px; line-height: 1.4; }
    .bm3-detail-tag {
        padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 0.82rem;
        color: #fff; white-space: nowrap; flex-shrink: 0;
    }

    .bm3-presets { margin-top: 24px; }
    .bm3-presets-label { font-size: 0.68rem; letter-spacing: 0.08em; color: #64748b; font-weight: 700; margin-bottom: 10px; }
    .bm3-preset-row { display: flex; gap: 10px; flex-wrap: wrap; }
    .bm3-preset-btn {
        background: rgba(148,163,184,0.08); border: 1px solid rgba(148,163,184,0.15);
        color: #cbd5e1; padding: 10px 16px; border-radius: 10px; font-size: 0.82rem; font-weight: 600;
        cursor: pointer; transition: background 0.15s ease;
    }
    .bm3-preset-btn:hover { background: rgba(148,163,184,0.16); }
    .bm3-preset-btn.active { background: rgba(56,189,248,0.18); border-color: rgba(56,189,248,0.5); color: #f8fafc; }

    @media (max-width: 640px) {
        .bm3-panel { display: none; }
    }
`;
rootEl.appendChild(styleEl);

// 5. HEADER
const header = rootEl.createDiv({ cls: "bm3-header" });
header.createDiv({ cls: "bm3-title" }).innerHTML = `<span class="bm3-icon">⬡</span> Anatomical Musculoskeletal Heatmap`;
header.createDiv({ cls: "bm3-subtitle", text: "Click any muscle to lock details • hover to preview" });

const viewTabs = rootEl.createDiv({ cls: "bm3-viewtabs" });
const frontTab = viewTabs.createEl("button", { cls: "bm3-viewtab active", text: "FRONT" });
const backTab = viewTabs.createEl("button", { cls: "bm3-viewtab", text: "BACK" });

// 6. LAYOUT
const layout = rootEl.createDiv({ cls: "bm3-layout" });

const legendPanel = layout.createDiv({ cls: "bm3-panel" });
legendPanel.createDiv({ cls: "bm3-panel-title", text: "FATIGUE LEVEL" });
const legendData = [
    { color: "#ef4444", label: "High", sub: "(Severe Fatigue)" },
    { color: "#f97316", label: "Moderate", sub: "(Noticeable Fatigue)" },
    { color: "#eab308", label: "Low", sub: "(Mild Fatigue)" },
    { color: "#22c55e", label: "Fresh", sub: "(Recovered)" },
    { color: "#64748b", label: "Inactive", sub: "(Not in split)" },
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
    { icon: "🖱️", text: "Click a muscle to lock it" },
    { icon: "✨", text: "Hover to preview fatigue instantly" },
    { icon: "🔁", text: "Toggle FRONT / BACK to flip view" },
];
howtoData.forEach(item => {
    const row = howtoPanel.createDiv({ cls: "bm3-howto-row" });
    row.createDiv({ cls: "bm3-howto-icon", text: item.icon });
    row.createDiv({ cls: "bm3-howto-text", text: item.text });
});

// 7. DETAIL CARD
const detailCard = rootEl.createDiv({ cls: "bm3-detail-card" });
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
    detailHours.innerHTML = `⏱ ${model.defaultHours} Hours Estimated Recovery Window`;
    detailDesc.setText(model.desc);
    detailTag.setText(model.tier);
    detailTag.style.background = tier.base;
    detailCard.style.borderColor = tier.base + "80";
}

// 8. DEFS
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

// 9. ANNOTATION
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

// 10. GEOMETRY HELPERS
function unionBBox(elements) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    elements.forEach(el => {
        const b = el.getBBox();
        minX = Math.min(minX, b.x); minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.width); maxY = Math.max(maxY, b.y + b.height);
    });
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// 11. RENDER BODY
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
        const isInactiveHoverable = filtered && !isSelected;
        const fill = showAsSelectedInactive ? `url(#blueSelectGrad-${INSTANCE_ID})` : (filtered ? INACTIVE_FILL : `url(#${gid})`);
        const stroke = showAsSelectedInactive ? SELECT_BLUE : (filtered ? INACTIVE_STROKE : tier.dark);
        const pathClass = `bm3-muscle-path${isSelected ? (showAsSelectedInactive ? " selected selected-inactive" : " selected") : ""}${isInactiveHoverable ? " inactive" : ""}`;

        pathsHtml += `<g class="bm3-muscle-group${isSelected ? " selected" : ""}">`;
        item.paths.forEach(p => {
            pathsHtml += `<path class="${pathClass}" data-key="${key}" d="${p}" fill="${fill}" stroke="${stroke}" stroke-width="0.6" style="color:${tier.base}" />`;
        });

        if ((!filtered || showAsSelectedInactive)) {
            const pid = `fiber-${INSTANCE_ID}-${view}-${key}`;
            item.paths.forEach(p => {
                pathsHtml += `<path class="bm3-fiber-overlay${isSelected ? " selected" : ""}" data-key="${key}" d="${p}" fill="url(#${pid})" />`;
            });
        }
        pathsHtml += `</g>`;
    }

    viewport.innerHTML = `
        <svg class="bm3-vector-svg" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">
            <defs>${defsHtml}</defs>
            <path class="bm3-base-body" d="${outline}" />
            ${pathsHtml}
        </svg>
    `;

    void viewport.offsetHeight;
    const svgEl = viewport.querySelector(".bm3-vector-svg");
    if (svgEl) {
        requestAnimationFrame(() => {
            svgEl.style.display = "none";
            void svgEl.offsetHeight;
            svgEl.style.display = "";
        });
    }
    if (!svgEl) return;

    // --- Attach listeners: whole-muscle paths ---
    svgEl.querySelectorAll(".bm3-muscle-path").forEach((p) => {
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

    // Re-draw annotation if something is selected
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

requestAnimationFrame(() => {
    renderBody("front");
    renderDetails("chest");
});

// 12. PRESETS
const presetsWrap = rootEl.createDiv({ cls: "bm3-presets" });
presetsWrap.createDiv({ cls: "bm3-presets-label", text: "QUICK PRESET DEMOS:" });
const presetRow = presetsWrap.createDiv({ cls: "bm3-preset-row" });

function applyPreset(keys, level, isReset, btn) {
    keys.forEach(k => {
        if (muscleRegistry[k]) muscleRegistry[k].recovery = level;
    });
    activePresetKeys = isReset ? null : new Set(keys);
    presetRow.querySelectorAll(".bm3-preset-btn").forEach(b => b.classList.remove("active"));
    if (!isReset && btn) btn.classList.add("active");
    renderBody(currentView);
    if (selectedKey) renderDetails(selectedKey);
}

const presets = [
    { label: "💪 Push Day Fatigue", keys: ["chest", "triceps", "deltoids", "triceps_back", "deltoids_back"], level: 20 },
    { label: "🎣 Pull Day Fatigue", keys: ["upper_back", "biceps", "trapezius", "trapezius_back", "lower_back"], level: 20 },
    { label: "🦵 Leg Day Fatigue", keys: ["quadriceps", "hamstring", "gluteal", "calves", "calves_back", "adductors"], level: 15 },
    { label: "🔄 Reset All Fresh", keys: Object.keys(muscleRegistry), level: 95, isReset: true },
];
presets.forEach(preset => {
    const btn = presetRow.createEl("button", { cls: "bm3-preset-btn", text: preset.label });
    btn.addEventListener("click", () => applyPreset(preset.keys, preset.level, !!preset.isReset, btn));
});

### 🏋️ Saved Workout Log

**Hack Squat** (Quads (Knee Extensors))
- (workout:: Hack Squat) (muscle:: Legs) (subTarget:: Quads (Knee Extensors)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳
- (workout:: Hack Squat) (muscle:: Legs) (subTarget:: Quads (Knee Extensors)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳
- (workout:: Hack Squat) (muscle:: Legs) (subTarget:: Quads (Knee Extensors)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳

**Romanian Deadlift (DB/Barbell)** (Hamstrings (Lengthened))
- (workout:: Romanian Deadlift (DB/Barbell)) (muscle:: Legs) (subTarget:: Hamstrings (Lengthened)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳
- (workout:: Romanian Deadlift (DB/Barbell)) (muscle:: Legs) (subTarget:: Hamstrings (Lengthened)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳
- (workout:: Romanian Deadlift (DB/Barbell)) (muscle:: Legs) (subTarget:: Hamstrings (Lengthened)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳

**Leg Extensions** (Rectus Femoris)
- (workout:: Leg Extensions) (muscle:: Legs) (subTarget:: Rectus Femoris) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Leg Extensions) (muscle:: Legs) (subTarget:: Rectus Femoris) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Leg Extensions) (muscle:: Legs) (subTarget:: Rectus Femoris) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅

**Seated Leg Curl** (Hamstrings (Knee Flexion))
- (workout:: Seated Leg Curl) (muscle:: Legs) (subTarget:: Hamstrings (Knee Flexion)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Seated Leg Curl) (muscle:: Legs) (subTarget:: Hamstrings (Knee Flexion)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Seated Leg Curl) (muscle:: Legs) (subTarget:: Hamstrings (Knee Flexion)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅

**Standing Machine Calf Raise** (Calves (Gastrocnemius))
- (workout:: Standing Machine Calf Raise) (muscle:: Legs) (subTarget:: Calves (Gastrocnemius)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳
- (workout:: Standing Machine Calf Raise) (muscle:: Legs) (subTarget:: Calves (Gastrocnemius)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳
- (workout:: Standing Machine Calf Raise) (muscle:: Legs) (subTarget:: Calves (Gastrocnemius)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳

**Seated Calf Raise Machine** (Calves (Soleus))
- (workout:: Seated Calf Raise Machine) (muscle:: Legs) (subTarget:: Calves (Soleus)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳
- (workout:: Seated Calf Raise Machine) (muscle:: Legs) (subTarget:: Calves (Soleus)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳
- (workout:: Seated Calf Raise Machine) (muscle:: Legs) (subTarget:: Calves (Soleus)) (weight:: 0) kg × (reps:: 0) reps [fail:: 3] ⏳

- [summary:: done] (duration:: 0m 37s) (calories:: 26 kcal) (volume:: 3840 kg) (sets:: 6)
