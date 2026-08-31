```dataviewjs
const rootEl = dv.el("div", "", { cls: "workout-tracker-root" });

// -------------------------------------------------------------
// COMPREHENSIVE BIOMECHANICS & MICRO-MUSCLE EXERCISE DATABASE
// -------------------------------------------------------------
const exerciseDB = [
  // CHEST
  { name: "Incline Dumbbell Press", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", desc: "Highest clavicular head activation with deep stretch." },
  { name: "Incline Barbell Bench", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier", desc: "Heavy overload for upper chest; watch shoulder flare." },
  { name: "Low-to-High Cable Fly", muscle: "Chest", subTarget: "Upper Pec (Clavicular)", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", desc: "Constant upper chest tension across full adduction." },
  { name: "Flat Barbell Bench Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier", desc: "Classic power builder; strict scapular retraction needed." },
  { name: "Flat Dumbbell Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", desc: "Allows natural converging path and deep eccentric stretch." },
  { name: "Chest Dips", muscle: "Chest", subTarget: "Lower Pec (Costal)", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier", desc: "High costal pec recruitment; keep torso leaned forward." },
  { name: "Cable Chest Fly (Mid)", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier", desc: "Zero joint shear; uninterrupted resistance curve." },
  { name: "Machine Chest Press", muscle: "Chest", subTarget: "Mid/Lower Pec (Sternal)", position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier", desc: "Max stability for pushing sets to absolute failure." },
  { name: "Decline Dumbbell Press", muscle: "Chest", subTarget: "Lower Pec (Costal)", position: "Mid-Range", risk: "Low 🟢", tier: "B-Tier", desc: "Short ROM lower pec builder." },

  // BACK
  { name: "Lat Pulldown (Wide/Neutral)", muscle: "Back", subTarget: "Lats (Vertical Pull)", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", desc: "Primary lat width builder; drive elbows toward hips." },
  { name: "Pull-ups / Weighted Chin-ups", muscle: "Back", subTarget: "Lats (Vertical Pull)", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", desc: "Elite relative strength and vertical back builder." },
  { name: "Single-Arm Lat Cable Row", muscle: "Back", subTarget: "Lats (Iliac / Lower)", position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier", desc: "Aligns perfectly with lat muscle fibers; minimal spine load." },
  { name: "Chest-Supported T-Bar Row", muscle: "Back", subTarget: "Upper Back / Rhomboids", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", desc: "Zero lower back fatigue; maximum rhomboid and trap overload." },
  { name: "Barbell Bent-Over Row", muscle: "Back", subTarget: "Upper Back / Lats", position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier", desc: "Mass builder, but requires strict lower back stability." },
  { name: "Seated Cable Row (Wide)", muscle: "Back", subTarget: "Upper Back / Mid-Traps", position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", desc: "Excellent mid-back thickness and scapular retraction." },
  { name: "Barbell Deadlift", muscle: "Back", subTarget: "Erectors / Posterior Chain", position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier", desc: "Full systemic overload; manage fatigue carefully." },
  { name: "Straight-Arm Lat Pulldown", muscle: "Back", subTarget: "Lats (Isolation)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "B-Tier", desc: "Isolates lats without bicep involvement." },
  { name: "Hyperextensions / 45° Back Extension", muscle: "Back", subTarget: "Lower Back (Erectors)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier", desc: "Safer lower back strengthening without axial compression." },

  // SHOULDERS
  { name: "Standing Overhead Press (OHP)", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", position: "Mid-Range", risk: "High (Axial) 🔴", tier: "A-Tier", desc: "Full body compound front delt builder." },
  { name: "Seated Dumbbell Shoulder Press", muscle: "Shoulders", subTarget: "Front Delt (Anterior)", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "A-Tier", desc: "Stable anterior delt overload with deep range." },
  { name: "Cable Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", desc: "Tension right at the bottom stretch where delts grow best." },
  { name: "Dumbbell Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", desc: "Classic side delt width builder." },
  { name: "Machine Lateral Raise", muscle: "Shoulders", subTarget: "Side Delt (Lateral)", position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier", desc: "Even tension curve with locked-in stability." },
  { name: "Face Pulls", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", desc: "Crucial for shoulder health, rear delts, and external rotators." },
  { name: "Reverse Pec Deck", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", position: "Lengthened & Shortened", risk: "Low 🟢", tier: "S-Tier", desc: "Strict isolated rear delt hypertrophy." },
  { name: "Incline Rear Delt DB Flyes", muscle: "Shoulders", subTarget: "Rear Delt (Posterior)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier", desc: "Great stretch on rear delts without momentum." },
  { name: "Dumbbell Shrugs", muscle: "Shoulders", subTarget: "Upper Traps", position: "Shortened (Peak)", risk: "Low 🟢", tier: "B-Tier", desc: "Direct upper trap elevation." },

  // BICEPS & FOREARMS
  { name: "Incline Dumbbell Curl", muscle: "Biceps", subTarget: "Long Head (Peak)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", desc: "Places shoulder in extension for maximum long head stretch." },
  { name: "Bayesian Cable Curl", muscle: "Biceps", subTarget: "Long Head (Peak)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", desc: "Unbroken stretch tension behind the torso." },
  { name: "Preacher Curl (Machine/EZ)", muscle: "Biceps", subTarget: "Short Head (Inner)", position: "Lengthened (Stretch)", risk: "Moderate (Elbow) 🟡", tier: "A-Tier", desc: "Strict short head builder; avoid hyperextending elbows." },
  { name: "Standing EZ-Bar Curl", muscle: "Biceps", subTarget: "Biceps Overall", position: "Mid-Range", risk: "Low 🟢", tier: "A-Tier", desc: "Heavy progressive overload; easy on the wrists." },
  { name: "Spider Curl", muscle: "Biceps", subTarget: "Short Head (Inner)", position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", desc: "Overloads the top contraction without swinging." },
  { name: "Hammer Curl (Dumbbell/Cable)", muscle: "Biceps", subTarget: "Brachialis & Forearms", position: "Mid-Range", risk: "Low 🟢", tier: "S-Tier", desc: "Builds arm thickness and pushes bicep peak up." },
  { name: "Reverse Barbell / Cable Curl", muscle: "Forearms", subTarget: "Brachioradialis", position: "Mid-Range", risk: "Low 🟢", tier: "A-Tier", desc: "Top forearm builder." },
  { name: "Barbell Wrist Curls", muscle: "Forearms", subTarget: "Forearm Flexors", position: "Shortened (Peak)", risk: "Low 🟢", tier: "B-Tier", desc: "Inner forearm grip and size builder." },
  { name: "Farmer's Walk", muscle: "Forearms", subTarget: "Grip & Core", position: "Isometric", risk: "Moderate 🟡", tier: "A-Tier", desc: "Functional crush grip and trap stabilizer." },

  // TRICEPS
  { name: "Overhead Dual Cable Extension", muscle: "Triceps", subTarget: "Long Head Triceps", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", desc: "Full overhead stretch without elbow impingement." },
  { name: "Incline EZ Skull Crushers", muscle: "Triceps", subTarget: "Long Head Triceps", position: "Lengthened (Stretch)", risk: "Moderate (Elbow) 🟡", tier: "A-Tier", desc: "Heavy long head stretch; lower bar behind head." },
  { name: "Cable Triceps Pushdown (Straight/V)", muscle: "Triceps", subTarget: "Lateral & Medial Head", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", desc: "Isolates the lateral horseshoe with zero shoulder strain." },
  { name: "Cross-Body Cable Extension", muscle: "Triceps", subTarget: "Lateral Head Triceps", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", desc: "Biomechanically aligns with triceps fibers." },
  { name: "Close-Grip Bench Press", muscle: "Triceps", subTarget: "Medial & Lateral Head", position: "Mid-Range", risk: "Moderate 🟡", tier: "A-Tier", desc: "Heavy compound triceps power builder." },

  // LEGS & GLUTES
  { name: "Barbell Back Squat", muscle: "Legs", subTarget: "Quads & Glutes", position: "Lengthened (Stretch)", risk: "High (Axial) 🔴", tier: "A-Tier", desc: "Foundational leg mass compound; high spinal fatigue." },
  { name: "Hack Squat", muscle: "Legs", subTarget: "Quads (Knee Extensors)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", desc: "Massive quad hypertrophy with minimal spinal load." },
  { name: "Leg Press", muscle: "Legs", subTarget: "Quads & Adductors", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", desc: "High quad volume with zero lower back strain." },
  { name: "Leg Extensions", muscle: "Legs", subTarget: "Rectus Femoris", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", desc: "Directly targets rectus femoris in shortened position." },
  { name: "Romanian Deadlift (DB/Barbell)", muscle: "Legs", subTarget: "Hamstrings (Lengthened)", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", desc: "King of hamstring stretch-mediated hypertrophy." },
  { name: "Seated Leg Curl", muscle: "Legs", subTarget: "Hamstrings (Knee Flexion)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier", desc: "Superior to lying curl due to flexed hip stretch." },
  { name: "Lying Leg Curl", muscle: "Legs", subTarget: "Hamstrings (Knee Flexion)", position: "Shortened (Peak)", risk: "Low 🟢", tier: "A-Tier", desc: "Isolates hamstring peak squeeze." },
  { name: "Bulgarian Split Squat", muscle: "Legs", subTarget: "Glutes & Quads", position: "Lengthened (Stretch)", risk: "Moderate 🟡", tier: "S-Tier", desc: "Fixes leg imbalances and tortures the glute stretch." },
  { name: "Barbell / Machine Hip Thrust", muscle: "Legs", subTarget: "Glutes (Maximus)", position: "Shortened (Peak)", risk: "Low 🟢", tier: "S-Tier", desc: "Maximum peak contraction for glute development." },
  { name: "Standing Calf Raises", muscle: "Legs", subTarget: "Calves (Gastrocnemius)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier", desc: "Targets straight-knee gastrocnemius muscle." },
  { name: "Seated Calf Raises", muscle: "Legs", subTarget: "Calves (Soleus)", position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "A-Tier", desc: "Targets bent-knee soleus muscle." }
];

// Presets mapped with micro-balanced targets
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
    { name: "Standing Calf Raises" }
  ]
};

// Core micro-targets expected for balanced splits
const splitRequiredHeads = {
  "Push": ["Upper Pec (Clavicular)", "Mid/Lower Pec (Sternal)", "Side Delt (Lateral)", "Long Head Triceps", "Lateral & Medial Head"],
  "Pull": ["Lats (Vertical Pull)", "Upper Back / Rhomboids", "Rear Delt (Posterior)", "Long Head (Peak)", "Brachialis & Forearms"],
  "Legs": ["Quads (Knee Extensors)", "Hamstrings (Lengthened)", "Hamstrings (Knee Flexion)", "Calves (Gastrocnemius)"]
};

// Styles
const style = document.createElement("style");
style.textContent = [
  ".wk-app { background: #070d19; border: 1px solid #1e293b; border-radius: 20px; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; max-width: 620px; margin: 15px auto; box-shadow: 0 16px 45px rgba(0,0,0,0.65); box-sizing: border-box; position: relative; }",
  ".wk-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }",
  ".wk-badge { background: #2563eb; color: #ffffff; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 9px; border-radius: 999px; }",
  ".wk-live-duration { background: #0f172a; border: 1px solid #1e293b; color: #38bdf8; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; font-variant-numeric: tabular-nums; }",
  
  /* Symmetrical 2x2 Balanced Stats Grid */
  ".wk-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 14px; }",
  ".wk-stat-box { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 10px; text-align: center; }",
  ".wk-stat-lbl { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }",
  ".wk-stat-val { font-size: 1.15rem; font-weight: 800; color: #38bdf8; margin-top: 3px; }",

  /* Gap & Redundancy Banner */
  ".wk-gap-box { background: #111e38; border: 1px solid #1e3a8a; border-radius: 12px; padding: 10px 14px; margin-bottom: 14px; font-size: 0.78rem; }",
  ".wk-gap-title { font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }",
  ".wk-gap-items { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }",
  ".wk-gap-chip { background: #172554; border: 1px solid #2563eb; color: #93c5fd; padding: 3px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; cursor: pointer; }",
  ".wk-gap-chip:hover { background: #2563eb; color: white; }",

  ".wk-timer-dock { display: flex; align-items: center; justify-content: space-between; background: #0c1e3d; border: 1px solid #1d4ed8; border-radius: 14px; padding: 8px 14px; margin-bottom: 14px; }",
  ".wk-timer-title { font-size: 0.78rem; font-weight: 700; color: #93c5fd; }",
  ".wk-timer-display { font-size: 1.2rem; font-weight: 800; color: #ffffff; font-variant-numeric: tabular-nums; }",
  ".wk-timer-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #ffffff; border-radius: 6px; padding: 4px 8px; font-size: 0.72rem; font-weight: 700; cursor: pointer; }",
  
  ".wk-action-row { display: flex; gap: 8px; margin-bottom: 14px; }",
  ".wk-btn { flex: 1; background: #0f172a; color: #ffffff; border: 1px solid #1e293b; border-radius: 10px; padding: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; text-align: center; transition: all 0.15s ease; }",
  ".wk-btn:hover { background: #1e293b; border-color: #334155; }",
  ".wk-btn-save { background: #064e3b; border-color: #059669; color: #a7f3d0; }",
  ".wk-btn-save:hover { background: #047857; color: #ffffff; }",
  
  /* Search & Filter Modal */
  ".wk-selector-card { display: none; background: #0f172a; border: 1px solid #2563eb; border-radius: 14px; padding: 14px; margin-bottom: 14px; }",
  ".wk-search-input { width: 100%; height: 38px; background: #070d19; border: 1px solid #1e3a8a; color: #f8fafc; border-radius: 8px; padding: 6px 12px; font-size: 0.85rem; outline: none; margin-bottom: 8px; box-sizing: border-box; }",
  ".wk-search-results { max-height: 190px; overflow-y: auto; border: 1px solid #1e293b; border-radius: 8px; background: #070d19; margin-bottom: 10px; }",
  ".wk-search-item { padding: 8px 10px; border-bottom: 1px solid #111827; cursor: pointer; font-size: 0.82rem; }",
  ".wk-search-item:hover { background: #1e293b; }",

  /* Exercise Card Elements */
  ".wk-card { background: #0b1324; border: 1px solid #172554; border-radius: 16px; padding: 16px; margin-bottom: 14px; }",
  ".wk-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }",
  ".wk-card-title { font-weight: 800; font-size: 0.95rem; color: #ffffff; }",
  ".wk-tag-container { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 10px; }",
  ".wk-tag { font-size: 0.63rem; font-weight: 700; padding: 2px 7px; border-radius: 5px; }",
  ".wk-tag-sub { background: #172554; color: #38bdf8; }",
  ".wk-tag-pos { background: #1e293b; color: #cbd5e1; }",
  ".wk-tag-risk { background: rgba(239,68,68,0.15); color: #fca5a5; }",
  ".wk-tag-risk.green { background: rgba(16,185,129,0.15); color: #86efac; }",
  ".wk-tag-tier { background: #312e81; color: #c7d2fe; font-weight: 800; }",
  ".wk-tag-warn { background: rgba(245,158,11,0.2); color: #fcd34d; font-weight: 800; }",

  ".wk-set-row { display: grid; grid-template-columns: 24px 1fr 1fr 1fr 34px 22px; gap: 8px; align-items: center; margin-bottom: 7px; padding: 3px 4px; border-radius: 8px; transition: all 0.2s ease; }",
  ".wk-th { font-size: 0.62rem; font-weight: 800; color: #64748b; text-transform: uppercase; text-align: center; }",
  ".wk-input { background: #0f1c38; border: 1px solid #1e3a8a; border-radius: 8px; color: #38bdf8; font-weight: 700; padding: 6px 4px; text-align: center; font-size: 0.88rem; width: 100%; outline: none; box-sizing: border-box; height: 36px; transition: all 0.15s ease; }",
  ".wk-input::placeholder { color: #3b82f6; opacity: 0.45; }",
  ".wk-input:focus { border-color: #60a5fa; background: #172554; box-shadow: 0 0 10px rgba(56, 189, 248, 0.25); color: #ffffff; }",
  ".wk-check { width: 22px; height: 22px; accent-color: #3b82f6; cursor: pointer; margin: 0 auto; }",
  ".wk-set-row.row-done { background: rgba(16, 185, 129, 0.05); }",
  ".wk-set-row.row-done .wk-input { border-color: #059669; color: #34d399; background: #062820; }",
  ".wk-set-row.row-done .wk-check { accent-color: #10b981; }",
  ".wk-btn-del { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.95rem; font-weight: 700; }",
  ".wk-btn-addset { width: 100%; background: rgba(56, 189, 248, 0.04); border: 1px dashed #1e3a8a; border-radius: 8px; color: #38bdf8; font-size: 0.75rem; font-weight: 700; padding: 7px; margin-top: 8px; cursor: pointer; }",
  ".wk-btn-addset:hover { background: rgba(56, 189, 248, 0.1); border-color: #38bdf8; color: #ffffff; }",

  /* Permanent Finished Screen */
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

const trackerApp = document.createElement("div");
trackerApp.className = "wk-app";
rootEl.appendChild(trackerApp);

function renderFinishedScreen(data) {
  if (durationInterval) clearInterval(durationInterval);
  let cardsHtml = "";

  data.exercises.forEach(function(ex) {
    let setsListHtml = "";
    
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

    const info = exerciseDB.find(function(i) { return i.name === ex.name; }) || {};

    cardsHtml += [
      '<div class="wk-recap-card">',
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">',
          '<span style="font-weight:800; font-size:0.95rem; color:#ffffff;">' + ex.name + '</span>',
          '<span class="wk-tag wk-tag-sub">' + (info.subTarget || ex.muscle) + '</span>',
        '</div>',
        '<div style="display:flex; gap:6px; margin-bottom:8px;">',
          '<span class="wk-tag wk-tag-tier">' + (info.tier || "Hypertrophy") + '</span>',
          '<span class="wk-tag wk-tag-pos">' + (info.position || "Dynamic") + '</span>',
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
      '<div>' + cardsHtml + '</div>',
      '<button class="wk-btn-new-session" id="btn-start-new">🔄 Start New Workout</button>',
    '</div>'
  ].join("");

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
        '<span class="wk-badge">PRO Tracker 2.2</span>',
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

    '<div class="wk-timer-dock">',
      '<div><div class="wk-timer-title">⏱️ Rest Countdown</div><div class="wk-timer-display" id="timer-val">01:30</div></div>',
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
    
    '<div class="wk-selector-card" id="routine-selector">',
      '<div style="font-weight:800; font-size:0.95rem; margin-bottom:10px;">Select Routine Split</div>',
      '<select class="wk-dropdown" id="split-select" style="width:100%; height:40px; background:#070d19; border:1px solid #1e3a8a; color:#f8fafc; border-radius:8px; padding:6px 12px; margin-bottom:10px;">' + splitOptionsHtml + '</select>',
      '<div style="display:flex; justify-content:flex-end; gap:8px;">',
        '<button class="wk-btn" id="btn-split-cancel" style="flex:none; padding:6px 14px;">Cancel</button>',
        '<button class="wk-btn" id="btn-split-load" style="flex:none; padding:6px 16px; background:#2563eb; border:none;">Load Split</button>',
      '</div>',
    '</div>',
    
    /* Interactive Exercise Search & Filter Card */
    '<div class="wk-selector-card" id="add-selector">',
      '<div style="font-weight:800; font-size:0.95rem; margin-bottom:8px;">Find & Add Exercise</div>',
      '<input type="text" class="wk-search-input" id="search-box" placeholder="Search by name, sub-target, head..." />',
      '<div class="wk-search-results" id="search-list"></div>',
      '<div style="display:flex; justify-content:flex-end; gap:8px;">',
        '<button class="wk-btn" id="btn-ex-cancel" style="flex:none; padding:6px 14px;">Close</button>',
      '</div>',
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

  function startRestTimer(seconds) {
    clearInterval(timerInterval);
    timerSeconds = seconds;
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
    const m = String(Math.floor(timerSeconds / 60)).padStart(2, '0');
    const s = String(timerSeconds % 60).padStart(2, '0');
    timerDisplay.textContent = m + ":" + s;
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
        '<div class="wk-search-item" data-name="' + ex.name + '">',
          '<div style="font-weight:700; color:#ffffff;">' + ex.name + '</div>',
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

  searchBox.oninput = function() {
    renderSearchList(searchBox.value);
  };

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

  // Evaluate Gap & Redundancy Analysis
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
        '<div style="color:#94a3b8; font-size:0.75rem;">Your routine is missing dedicated volume for:</div>',
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

  function render() {
    cardsContainer.innerHTML = "";

    // Calculate subTarget duplicates for Redundancy flags
    const counts = {};
    sessionExercises.forEach(function(e) {
      if (e.subTarget) counts[e.subTarget] = (counts[e.subTarget] || 0) + 1;
    });

    sessionExercises.forEach(function(ex, exIdx) {
      const card = document.createElement("div");
      card.className = "wk-card";

      const isRedundant = counts[ex.subTarget] > 1;
      const riskClass = (ex.risk && ex.risk.includes("Low")) ? "green" : "";

      let tagsHtml = [
        '<div class="wk-tag-container">',
          ex.subTarget ? '<span class="wk-tag wk-tag-sub">' + ex.subTarget + '</span>' : '',
          ex.position ? '<span class="wk-tag wk-tag-pos">' + ex.position + '</span>' : '',
          ex.tier ? '<span class="wk-tag wk-tag-tier">' + ex.tier + '</span>' : '',
          ex.risk ? '<span class="wk-tag wk-tag-risk ' + riskClass + '">Joint Stress: ' + ex.risk + '</span>' : '',
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
            '<input type="number" class="wk-input set-weight" data-ex="' + exIdx + '" data-set="' + sIdx + '" value="' + s.weight + '" placeholder="80" />',
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
- (workout:: Incline Dumbbell Press) (muscle:: Chest) (subTarget:: Upper Pec (Clavicular)) (weight:: 80) kg × (reps:: 8) reps [fail:: 2] ✅
- (workout:: Incline Dumbbell Press) (muscle:: Chest) (subTarget:: Upper Pec (Clavicular)) (weight:: 80) kg × (reps:: 8) reps [fail:: 2] ✅
- (workout:: Incline Dumbbell Press) (muscle:: Chest) (subTarget:: Upper Pec (Clavicular)) (weight:: 80) kg × (reps:: 8) reps [fail:: 2] ✅

**Flat Dumbbell Press** (Mid/Lower Pec (Sternal))
- (workout:: Flat Dumbbell Press) (muscle:: Chest) (subTarget:: Mid/Lower Pec (Sternal)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Flat Dumbbell Press) (muscle:: Chest) (subTarget:: Mid/Lower Pec (Sternal)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Flat Dumbbell Press) (muscle:: Chest) (subTarget:: Mid/Lower Pec (Sternal)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅

**Cable Lateral Raise** (Side Delt (Lateral))
- (workout:: Cable Lateral Raise) (muscle:: Shoulders) (subTarget:: Side Delt (Lateral)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Cable Lateral Raise) (muscle:: Shoulders) (subTarget:: Side Delt (Lateral)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Cable Lateral Raise) (muscle:: Shoulders) (subTarget:: Side Delt (Lateral)) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅

**Overhead Dual Cable Extension** (Long Head Triceps)
- (workout:: Overhead Dual Cable Extension) (muscle:: Triceps) (subTarget:: Long Head Triceps) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Overhead Dual Cable Extension) (muscle:: Triceps) (subTarget:: Long Head Triceps) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Overhead Dual Cable Extension) (muscle:: Triceps) (subTarget:: Long Head Triceps) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅

**Cable Triceps Pushdown (Straight/V)** (Lateral & Medial Head)
- (workout:: Cable Triceps Pushdown (Straight/V)) (muscle:: Triceps) (subTarget:: Lateral & Medial Head) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Cable Triceps Pushdown (Straight/V)) (muscle:: Triceps) (subTarget:: Lateral & Medial Head) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅
- (workout:: Cable Triceps Pushdown (Straight/V)) (muscle:: Triceps) (subTarget:: Lateral & Medial Head) (weight:: 80) kg × (reps:: 8) reps [fail:: 3] ✅

- [summary:: done] (duration:: 6m 17s) (calories:: 87 kcal) (volume:: 9600 kg) (sets:: 15)
