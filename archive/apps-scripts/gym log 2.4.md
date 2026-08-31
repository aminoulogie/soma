```dataviewjs
const rootEl = dv.el("div", "", { cls: "workout-tracker-root" });

// -------------------------------------------------------------
// COMPREHENSIVE BIOMECHANICS & MICRO-MUSCLE DATABASE (v2.4)
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
  { name: "Cable Chest Fly (Mid)", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", bodyPart: "chest_lower", position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier" },
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
  { name: "JM Press", muscle: "Triceps", subTarget: "Lateral & Medial Head", bodyPart: "triceps", position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier" },
  { name: "Cable Triceps Pushdown (Straight/V)", muscle: "Triceps", subTarget: "Lateral & Medial Head", bodyPart: "triceps", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier" },
  { name: "Barbell Wrist Curls", muscle: "Forearms", subTarget: "Forearm Flexors", bodyPart: "forearms", position: "Shortened (Peak)", risk: "Low 🟢", tier: "B-Tier" },

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
  { name: "Donkey Calf Raise", muscle: "Legs", subTarget: "Calves (Gastrocnemius)", bodyPart: "calves", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier" }
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

// Muscle Anchor Coordinates for HUD Leader Lines (Front: x=140, Back: x=360)
const recoveryProfiles = {
  chest_upper: { name: "Upper Pecs", hours: 48, rate: "Fast", side: "left", ax: 120, ay: 62, lx: 15, ly: 55 },
  chest_lower: { name: "Mid/Lower Pecs", hours: 48, rate: "Standard", side: "left", ax: 122, ay: 78, lx: 15, ly: 82 },
  delts_front: { name: "Front Delts", hours: 36, rate: "Fast", side: "left", ax: 104, ay: 56, lx: 15, ly: 35 },
  delts_side: { name: "Side Delts", hours: 24, rate: "Ultra-Fast", side: "left", ax: 98, ay: 68, lx: 15, ly: 105 },
  biceps: { name: "Biceps", hours: 36, rate: "Fast", side: "left", ax: 102, ay: 92, lx: 15, ly: 128 },
  forearms: { name: "Forearms", hours: 24, rate: "Ultra-Fast", side: "left", ax: 92, ay: 135, lx: 15, ly: 150 },
  quads: { name: "Quadriceps", hours: 72, rate: "High Demand", side: "left", ax: 122, ay: 165, lx: 15, ly: 185 },
  
  traps_upper: { name: "Traps & Upper Back", hours: 48, rate: "Fast", side: "right", ax: 360, ay: 50, lx: 485, ly: 45 },
  delts_rear: { name: "Rear Delts", hours: 24, rate: "Ultra-Fast", side: "right", ax: 398, ay: 62, lx: 485, ly: 70 },
  lats: { name: "Latissimus Dorsi", hours: 48, rate: "Standard", side: "right", ax: 382, ay: 90, lx: 485, ly: 98 },
  triceps: { name: "Triceps", hours: 48, rate: "Standard", side: "right", ax: 405, ay: 88, lx: 485, ly: 125 },
  lower_back: { name: "Spinal Erectors", hours: 72, rate: "Axial Fatigue", side: "right", ax: 360, ay: 115, lx: 485, ly: 148 },
  glutes: { name: "Glute Complex", hours: 48, rate: "Standard", side: "right", ax: 378, ay: 145, lx: 485, ly: 172 },
  hamstrings: { name: "Hamstrings", hours: 72, rate: "High Demand", side: "right", ax: 378, ay: 185, lx: 485, ly: 200 },
  calves: { name: "Calves (Gastro/Soleus)", hours: 24, rate: "Ultra-Fast", side: "right", ax: 378, ay: 232, lx: 485, ly: 235 }
};

// Styles
const style = document.createElement("style");
style.textContent = [
  ".wk-app { background: #070d19; border: 1px solid #1e293b; border-radius: 20px; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; max-width: 620px; margin: 15px auto; box-shadow: 0 16px 45px rgba(0,0,0,0.65); box-sizing: border-box; position: relative; overflow: hidden; }",
  ".wk-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }",
  ".wk-badge { background: #2563eb; color: #ffffff; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 9px; border-radius: 999px; }",
  ".wk-live-duration { background: #0f172a; border: 1px solid #1e293b; color: #38bdf8; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; font-variant-numeric: tabular-nums; }",
  
  /* Symmetrical 2x2 Balanced Stats Grid */
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
  ".wk-input.kg-clickable { cursor: pointer; position: relative; }",
  ".wk-input:focus { border-color: #60a5fa; background: #172554; box-shadow: 0 0 10px rgba(56, 189, 248, 0.25); color: #ffffff; }",
  ".wk-check { width: 22px; height: 22px; accent-color: #3b82f6; cursor: pointer; margin: 0 auto; transition: transform 0.15s ease; }",
  ".wk-check:hover { transform: scale(1.15); }",
  ".wk-set-row.row-done { background: rgba(16, 185, 129, 0.08); transform: scale(1.005); box-shadow: inset 0 0 0 1px rgba(16,185,129,0.25); }",
  ".wk-set-row.row-done .wk-input { border-color: #059669; color: #34d399; background: #062820; }",
  ".wk-set-row.row-done .wk-check { accent-color: #10b981; }",
  ".wk-btn-del { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.95rem; font-weight: 700; }",
  ".wk-btn-addset { width: 100%; background: rgba(56, 189, 248, 0.04); border: 1px dashed #1e3a8a; border-radius: 8px; color: #38bdf8; font-size: 0.75rem; font-weight: 700; padding: 7px; margin-top: 8px; cursor: pointer; }",

  /* Interactive Barbell Plate Calculator Popover */
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

  /* High-End Anatomical HUD Recovery Map */
  ".wk-body-dock { background: #0b1324; border: 1px solid #172554; border-radius: 16px; padding: 16px; margin: 16px 0; text-align: center; }",
  ".wk-hud-svg-container { width: 100%; display: flex; justify-content: center; overflow-x: auto; margin-top: 6px; }",
  ".wk-muscle-path { fill: #172033; stroke: #0b1324; stroke-width: 1.2; cursor: pointer; transition: all 0.25s ease; }",
  ".wk-muscle-path:hover { filter: drop-shadow(0 0 6px #38bdf8); }",
  ".wk-muscle-path.sore-high { fill: #ef4444 !important; filter: drop-shadow(0 0 5px rgba(239,68,68,0.8)); }",
  ".wk-muscle-path.sore-med { fill: #f97316 !important; filter: drop-shadow(0 0 4px rgba(249,115,22,0.7)); }",
  ".wk-muscle-path.sore-fast { fill: #eab308 !important; filter: drop-shadow(0 0 4px rgba(234,179,8,0.7)); }",
  
  /* HUD Leader Annotation Line Styling */
  ".wk-hud-line { fill: none; stroke: #38bdf8; stroke-width: 1.2; stroke-dasharray: 2 2; opacity: 0.85; }",
  ".wk-hud-pin { fill: #38bdf8; }",
  ".wk-hud-text { font-family: inherit; font-size: 8px; font-weight: 800; fill: #ffffff; }",
  ".wk-hud-badge-txt { font-family: inherit; font-size: 7.5px; font-weight: 800; fill: #38bdf8; }",
  ".wk-hud-box { fill: #070d19; stroke: #1e3a8a; stroke-width: 0.8; rx: 3; ry: 3; }",
  
  /* Recovery Detail Card */
  ".wk-recovery-pop { display: none; background: #0f1c38; border: 1px solid #38bdf8; border-radius: 12px; padding: 12px; margin-top: 12px; text-align: left; animation: wkFadeIn 0.2s ease-out; }",
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

// -------------------------------------------------------------
// ANATOMICAL HUD BODY MAP WITH CALLOUT LEADER LINES
// -------------------------------------------------------------
function buildBodyMapSVG(soreMuscles) {
  function getSoreClass(part) {
    if (!soreMuscles[part]) return "";
    const hours = recoveryProfiles[part] ? recoveryProfiles[part].hours : 48;
    if (hours >= 72) return "sore-high";
    if (hours >= 48) return "sore-med";
    return "sore-fast";
  }

  // Generate aesthetic HUD Callout Lines for sore muscles
  let hudCalloutsHtml = "";
  Object.keys(soreMuscles).forEach(part => {
    const prof = recoveryProfiles[part];
    if (!prof) return;

    if (prof.side === "left") {
      const linePath = "M " + prof.ax + " " + prof.ay + " L " + (prof.lx + 90) + " " + prof.ly + " L " + prof.lx + " " + prof.ly;
      hudCalloutsHtml += [
        '<g class="wk-hud-callout">',
          '<circle cx="' + prof.ax + '" cy="' + prof.ay + '" r="2" class="wk-hud-pin" />',
          '<path d="' + linePath + '" class="wk-hud-line" />',
          '<rect x="' + prof.lx + '" y="' + (prof.ly - 10) + '" width="85" height="13" class="wk-hud-box" />',
          '<text x="' + (prof.lx + 4) + '" y="' + (prof.ly - 1) + '" class="wk-hud-text">' + prof.name + '</text>',
          '<text x="' + (prof.lx + 68) + '" y="' + (prof.ly - 1) + '" class="wk-hud-badge-txt">' + prof.hours + 'h</text>',
        '</g>'
      ].join("");
    } else {
      const linePath = "M " + prof.ax + " " + prof.ay + " L " + (prof.lx - 90) + " " + prof.ly + " L " + prof.lx + " " + prof.ly;
      hudCalloutsHtml += [
        '<g class="wk-hud-callout">',
          '<circle cx="' + prof.ax + '" cy="' + prof.ay + '" r="2" class="wk-hud-pin" />',
          '<path d="' + linePath + '" class="wk-hud-line" />',
          '<rect x="' + (prof.lx - 85) + '" y="' + (prof.ly - 10) + '" width="85" height="13" class="wk-hud-box" />',
          '<text x="' + (prof.lx - 81) + '" y="' + (prof.ly - 1) + '" class="wk-hud-text">' + prof.name + '</text>',
          '<text x="' + (prof.lx - 18) + '" y="' + (prof.ly - 1) + '" class="wk-hud-badge-txt">' + prof.hours + 'h</text>',
        '</g>'
      ].join("");
    }
  });

  return [
    '<div class="wk-body-dock">',
      '<div style="font-size:0.95rem; font-weight:800; color:#ffffff;">🧬 Musculoskeletal Soreness & Recovery HUD</div>',
      '<div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">Dynamic rest leader lines active. Tap any muscle for full physiological fatigue breakdown.</div>',
      '<div class="wk-hud-svg-container">',
        '<svg viewBox="0 0 500 270" width="100%" height="270">',
          // FRONT BODY SILHOUETTE (Center x=140)
          '<g id="front-body">',
            '<circle cx="140" cy="22" r="10" fill="#172033" stroke="#0b1324" />',
            '<path id="delts_front_l" class="wk-muscle-path ' + getSoreClass('delts_front') + '" data-part="delts_front" d="M116 38 Q100 48 106 62 Q118 52 120 40 Z" />',
            '<path id="delts_front_r" class="wk-muscle-path ' + getSoreClass('delts_front') + '" data-part="delts_front" d="M164 38 Q180 48 174 62 Q162 52 160 40 Z" />',
            '<path id="delts_side_l" class="wk-muscle-path ' + getSoreClass('delts_side') + '" data-part="delts_side" d="M104 48 Q95 62 100 74 Q106 66 106 54 Z" />',
            '<path id="delts_side_r" class="wk-muscle-path ' + getSoreClass('delts_side') + '" data-part="delts_side" d="M176 48 Q185 62 180 74 Q174 66 174 54 Z" />',
            '<path id="chest_upper_l" class="wk-muscle-path ' + getSoreClass('chest_upper') + '" data-part="chest_upper" d="M120 44 Q140 43 140 54 Q122 58 118 46 Z" />',
            '<path id="chest_upper_r" class="wk-muscle-path ' + getSoreClass('chest_upper') + '" data-part="chest_upper" d="M160 44 Q140 43 140 54 Q158 58 162 46 Z" />',
            '<path id="chest_lower_l" class="wk-muscle-path ' + getSoreClass('chest_lower') + '" data-part="chest_lower" d="M120 56 Q140 55 140 72 Q120 74 118 58 Z" />',
            '<path id="chest_lower_r" class="wk-muscle-path ' + getSoreClass('chest_lower') + '" data-part="chest_lower" d="M160 56 Q140 55 140 72 Q160 74 162 58 Z" />',
            '<path id="biceps_l" class="wk-muscle-path ' + getSoreClass('biceps') + '" data-part="biceps" d="M105 76 Q98 96 106 110 Q112 98 110 78 Z" />',
            '<path id="biceps_r" class="wk-muscle-path ' + getSoreClass('biceps') + '" data-part="biceps" d="M175 76 Q182 96 174 110 Q168 98 170 78 Z" />',
            '<path id="forearms_l" class="wk-muscle-path ' + getSoreClass('forearms') + '" data-part="forearms" d="M104 112 Q94 135 98 155 Q108 140 108 114 Z" />',
            '<path id="forearms_r" class="wk-muscle-path ' + getSoreClass('forearms') + '" data-part="forearms" d="M176 112 Q186 135 182 155 Q172 140 172 114 Z" />',
            '<path d="M125 76 Q140 75 155 76 L150 130 Q140 135 130 130 Z" fill="#172033" stroke="#0b1324" />',
            '<path id="quads_l" class="wk-muscle-path ' + getSoreClass('quads') + '" data-part="quads" d="M122 135 Q112 178 122 205 Q136 200 136 138 Z" />',
            '<path id="quads_r" class="wk-muscle-path ' + getSoreClass('quads') + '" data-part="quads" d="M158 135 Q168 178 158 205 Q144 200 144 138 Z" />',
            '<path id="calves_fl" class="wk-muscle-path ' + getSoreClass('calves') + '" data-part="calves" d="M122 210 Q115 235 122 258 Q132 250 130 210 Z" />',
            '<path id="calves_fr" class="wk-muscle-path ' + getSoreClass('calves') + '" data-part="calves" d="M158 210 Q165 235 158 258 Q148 250 150 210 Z" />',
          '</g>',

          // BACK BODY SILHOUETTE (Center x=360)
          '<g id="back-body">',
            '<circle cx="360" cy="22" r="10" fill="#172033" stroke="#0b1324" />',
            '<path id="traps_upper" class="wk-muscle-path ' + getSoreClass('traps_upper') + '" data-part="traps_upper" d="M344 36 Q360 32 376 36 Q388 54 360 68 Q332 54 344 36 Z" />',
            '<path id="delts_rear_l" class="wk-muscle-path ' + getSoreClass('delts_rear') + '" data-part="delts_rear" d="M336 38 Q320 48 326 62 Q338 52 340 40 Z" />',
            '<path id="delts_rear_r" class="wk-muscle-path ' + getSoreClass('delts_rear') + '" data-part="delts_rear" d="M384 38 Q400 48 394 62 Q382 52 380 40 Z" />',
            '<path id="lats_l" class="wk-muscle-path ' + getSoreClass('lats') + '" data-part="lats" d="M338 66 Q326 95 344 112 Q354 90 350 68 Z" />',
            '<path id="lats_r" class="wk-muscle-path ' + getSoreClass('lats') + '" data-part="lats" d="M382 66 Q394 95 376 112 Q366 90 370 68 Z" />',
            '<path id="triceps_l" class="wk-muscle-path ' + getSoreClass('triceps') + '" data-part="triceps" d="M325 76 Q318 96 326 110 Q332 98 330 78 Z" />',
            '<path id="triceps_r" class="wk-muscle-path ' + getSoreClass('triceps') + '" data-part="triceps" d="M395 76 Q402 96 394 110 Q388 98 390 78 Z" />',
            '<path id="lower_back" class="wk-muscle-path ' + getSoreClass('lower_back') + '" data-part="lower_back" d="M346 110 Q360 108 374 110 L370 134 Q360 136 350 134 Z" />',
            '<path id="glutes_l" class="wk-muscle-path ' + getSoreClass('glutes') + '" data-part="glutes" d="M338 135 Q335 160 358 160 Q360 136 342 135 Z" />',
            '<path id="glutes_r" class="wk-muscle-path ' + getSoreClass('glutes') + '" data-part="glutes" d="M382 135 Q385 160 362 160 Q360 136 378 135 Z" />',
            '<path id="hamstrings_l" class="wk-muscle-path ' + getSoreClass('hamstrings') + '" data-part="hamstrings" d="M342 164 Q334 192 342 205 Q356 200 356 164 Z" />',
            '<path id="hamstrings_r" class="wk-muscle-path ' + getSoreClass('hamstrings') + '" data-part="hamstrings" d="M378 164 Q386 192 378 205 Q364 200 364 164 Z" />',
            '<path id="calves_bl" class="wk-muscle-path ' + getSoreClass('calves') + '" data-part="calves" d="M342 210 Q332 235 342 258 Q352 250 350 210 Z" />',
            '<path id="calves_br" class="wk-muscle-path ' + getSoreClass('calves') + '" data-part="calves" d="M378 210 Q388 235 378 258 Q368 250 370 210 Z" />',
          '</g>',
          hudCalloutsHtml,
        '</svg>',
      '</div>',
      '<div class="wk-recovery-pop" id="recovery-info-box"></div>',
    '</div>'
  ].join("");
}

function attachBodyMapEvents(container, soreMuscles) {
  const infoBox = container.querySelector("#recovery-info-box");
  container.querySelectorAll(".wk-muscle-path").forEach(p => {
    p.onclick = function() {
      const part = p.dataset.part;
      const isHit = soreMuscles[part];
      const prof = recoveryProfiles[part] || { name: part, hours: 48, rate: "Standard" };

      if (isHit) {
        infoBox.innerHTML = [
          '<div style="font-weight:800; font-size:0.9rem; color:#ef4444;">⚡ ' + prof.name + ' (Direct Hypertrophy Stimulus)</div>',
          '<div style="font-size:0.8rem; color:#ffffff; margin-top:3px;">⏳ <b>' + prof.hours + ' Hours</b> Recommended Recovery Period</div>',
          '<div style="font-size:0.75rem; color:#94a3b8; margin-top:2px;">Metabolic Demand: ' + prof.rate + ' • Allow myofibrillar protein synthesis to complete before next loading session.</div>'
        ].join("");
      } else {
        infoBox.innerHTML = [
          '<div style="font-weight:800; font-size:0.9rem; color:#38bdf8;">🟢 ' + prof.name + ' (Fresh & Fully Recovered)</div>',
          '<div style="font-size:0.8rem; color:#ffffff; margin-top:3px;">No fatigue accumulated this session. Prime candidate for upcoming targeted volume!</div>'
        ].join("");
      }
      infoBox.style.display = "block";
    };
  });
}

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
        '<span class="wk-badge">PRO Tracker 2.4</span>',
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

if (savedRecap) {
  renderFinishedScreen(savedRecap);
} else {
  initActiveApp();
}
```


### 🏋️ Saved Workout Log

**Incline Dumbbell Press** (Upper Pec (Clavicular))
- (workout:: Incline Dumbbell Press) (muscle:: Chest) (subTarget:: Upper Pec (Clavicular)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Incline Dumbbell Press) (muscle:: Chest) (subTarget:: Upper Pec (Clavicular)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Incline Dumbbell Press) (muscle:: Chest) (subTarget:: Upper Pec (Clavicular)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅

**Cable Lateral Raise** (Side Delt (Lateral))
- (workout:: Cable Lateral Raise) (muscle:: Shoulders) (subTarget:: Side Delt (Lateral)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Cable Lateral Raise) (muscle:: Shoulders) (subTarget:: Side Delt (Lateral)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Cable Lateral Raise) (muscle:: Shoulders) (subTarget:: Side Delt (Lateral)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅

**Lat Pulldown (Wide/Neutral)** (Lats (Vertical Pull))
- (workout:: Lat Pulldown (Wide/Neutral)) (muscle:: Back) (subTarget:: Lats (Vertical Pull)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Lat Pulldown (Wide/Neutral)) (muscle:: Back) (subTarget:: Lats (Vertical Pull)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Lat Pulldown (Wide/Neutral)) (muscle:: Back) (subTarget:: Lats (Vertical Pull)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅

- [summary:: done] (duration:: 1m 10s) (calories:: 35 kcal) (volume:: 5760 kg) (sets:: 9)
