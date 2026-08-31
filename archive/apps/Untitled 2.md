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

const STATIC_PARTS = somaData.STATIC_PARTS || "";
const FRONT_OUTLINE = somaData.FRONT_OUTLINE || "";
const BACK_OUTLINE = somaData.BACK_OUTLINE || "";
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
  { name: "Chest-Supported T-Bar Row", muscle: "Back", subTarget: "Upper Back", targetKeys: ["trapezius_back", "upper_back"], hours: 48, position: "Lengthened (Stretch)", risk: "Low 🟢", tier: "S-Tier" },
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
        gap: 16px;
        box-sizing: border-box;
    }
    .wk-app {
        background: #070d19;
        border: 1px solid #142038;
        border-radius: 20px;
        padding: 20px;
        box-shadow: 0 16px 45px rgba(0,0,0,0.65);
        box-sizing: border-box;
        width: 100% !important;
        position: relative;
    }
    .wk-topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
    .wk-badge { background: #2563eb; color: #ffffff; font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 999px; display: inline-block; margin-bottom: 4px; }
    .wk-title { font-size: 1.35rem; font-weight: 800; color: #ffffff; margin: 0; }
    .wk-live-duration { background: #0c1527; border: 1px solid #1e293b; color: #38bdf8; font-size: 0.8rem; font-weight: 800; padding: 5px 12px; border-radius: 8px; font-variant-numeric: tabular-nums; display: flex; align-items: center; gap: 6px; }

    .wk-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 14px; }
    .wk-stat-box { background: #0c1527; border: 1px solid #17243c; border-radius: 12px; padding: 10px; text-align: center; }
    .wk-stat-lbl { font-size: 0.65rem; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
    .wk-stat-val { font-size: 1.15rem; font-weight: 900; color: #38bdf8; margin-top: 3px; }

    .wk-timer-radial-dock { display: flex; align-items: center; justify-content: space-between; background: #0b1c38; border: 1px solid #1d4ed8; border-radius: 16px; padding: 10px 16px; margin-bottom: 14px; }
    .wk-timer-ring-box { position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
    .wk-timer-ring-svg { transform: rotate(-90deg); width: 48px; height: 48px; }
    .wk-timer-ring-bg { fill: none; stroke: rgba(255,255,255,0.08); stroke-width: 4; }
    .wk-timer-ring-bar { fill: none; stroke: #38bdf8; stroke-width: 4; stroke-linecap: round; transition: stroke-dashoffset 1s linear; }
    .wk-timer-ring-txt { position: absolute; font-size: 0.75rem; font-weight: 800; color: #ffffff; font-variant-numeric: tabular-nums; }
    .wk-timer-btn-grp { display: flex; gap: 6px; }
    .wk-timer-btn { background: #11264c; border: 1px solid #1e40af; color: #cbd5e1; padding: 6px 12px; border-radius: 8px; font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.15s ease; }
    .wk-timer-btn:hover { background: #1d4ed8; color: #ffffff; }

    .wk-gap-box { background: #111e38; border: 1px solid #1e3a8a; border-radius: 12px; padding: 10px 14px; margin-bottom: 14px; font-size: 0.78rem; }
    .wk-gap-title { font-weight: 800; color: #38bdf8; display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
    .wk-gap-items { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; }
    .wk-gap-chip { background: #172554; border: 1px solid #2563eb; color: #93c5fd; padding: 3px 8px; border-radius: 6px; font-size: 0.7rem; font-weight: 700; }

    .wk-action-row { display: flex; gap: 8px; margin-bottom: 14px; }
    .wk-btn { flex: 1; background: #172033; color: #ffffff; border: 1px solid #24324c; border-radius: 10px; padding: 9px; font-size: 0.8rem; font-weight: 700; cursor: pointer; text-align: center; transition: all 0.15s ease; }
    .wk-btn:hover { background: #1e293b; border-color: #334155; }
    .wk-btn-save { background: #064e3b; border-color: #059669; color: #a7f3d0; }
    .wk-btn-save:hover { background: #047857; color: #ffffff; }

    .wk-card { background: #0b1324; border: 1px solid #172554; border-radius: 16px; padding: 14px; margin-bottom: 12px; }
    .wk-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
    .wk-card-title { font-weight: 800; font-size: 0.95rem; color: #f8fafc; }
    .wk-card-sub { font-size: 0.72rem; color: #94a3b8; margin-top: 2px; }
    .wk-set-header { display: grid; grid-template-columns: 36px 1fr 1fr 40px 30px; gap: 8px; font-size: 0.65rem; font-weight: 800; color: #64748b; text-align: center; margin-bottom: 4px; }
    .wk-set-row { display: grid; grid-template-columns: 36px 1fr 1fr 40px 30px; gap: 8px; align-items: center; margin-bottom: 6px; }
    .wk-set-idx { font-size: 0.75rem; font-weight: 800; color: #64748b; text-align: center; }
    .wk-input { background: #070d19; border: 1px solid #1e293b; color: #fff; padding: 6px 8px; border-radius: 6px; font-size: 0.8rem; width: 100%; text-align: center; box-sizing: border-box; }
    .wk-input:focus { outline: none; border-color: #38bdf8; }
    .wk-check-btn { background: #1e293b; border: 1px solid #334155; color: #94a3b8; border-radius: 6px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-weight: bold; }
    .wk-check-btn.completed { background: #059669; border-color: #10b981; color: #fff; }
    .wk-del-btn { background: transparent; border: none; color: #ef4444; cursor: pointer; font-size: 0.9rem; padding: 0; }
    .wk-add-set-btn { background: #111e38; border: 1px dashed #2563eb; color: #93c5fd; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; cursor: pointer; width: 100%; margin-top: 6px; font-weight: 700; }
    .wk-add-set-btn:hover { background: #1d4ed8; color: #fff; }

    .soma-wrapper { display: flex; justify-content: center; gap: 10px; background: #070d19; border: 1px solid #142038; border-radius: 20px; padding: 14px; }
    .soma-svg { width: 48%; max-height: 380px; }
    .soma-active-muscle { fill: #38bdf8 !important; opacity: 0.9; filter: drop-shadow(0 0 6px rgba(56,189,248,0.6)); }
`;
masterContainer.appendChild(styleEl);

// ============================================================================
// 4. APP STATE & RENDERING
// ============================================================================
let currentSplit = "Push";
let activeExercises = [
  { ...exerciseDB[0], sets: [{ weight: 30, reps: 10, done: false }, { weight: 30, reps: 8, done: false }] },
  { ...exerciseDB[2], sets: [{ weight: 60, reps: 10, done: false }, { weight: 60, reps: 8, done: false }] },
  { ...exerciseDB[21], sets: [{ weight: 12, reps: 15, done: false }] }
];

let restTimerInterval = null;
let restTimeRemaining = 0;
let restTotalDuration = 90;

const trackerContainer = document.createElement("div");
trackerContainer.className = "wk-app";
masterContainer.appendChild(trackerContainer);

const somaWrapper = document.createElement("div");
somaWrapper.className = "soma-wrapper";
masterContainer.appendChild(somaWrapper);

function startTimer(seconds) {
    clearInterval(restTimerInterval);
    restTotalDuration = seconds;
    restTimeRemaining = seconds;
    updateTimerDisplay();

    restTimerInterval = setInterval(() => {
        restTimeRemaining--;
        updateTimerDisplay();
        if (restTimeRemaining <= 0) {
            clearInterval(restTimerInterval);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const ring = trackerContainer.querySelector(".wk-timer-ring-bar");
    const txt = trackerContainer.querySelector(".wk-timer-ring-txt");
    if (!ring || !txt) return;

    const circumference = 2 * Math.PI * 18;
    const offset = circumference - (restTimeRemaining / (restTotalDuration || 1)) * circumference;
    ring.style.strokeDasharray = `${circumference}`;
    ring.style.strokeDashoffset = `${offset}`;
    txt.textContent = `${restTimeRemaining}s`;
}

function renderSomaVisualizer() {
    somaWrapper.innerHTML = "";
    
    // Collect active targetKeys from selected exercises
    const activeKeys = new Set();
    activeExercises.forEach(ex => (ex.targetKeys || []).forEach(k => activeKeys.add(k)));

    function createSvg(viewBox, outline, isBack = false) {
        const svg = document.createElementNS("[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)", "svg");
        svg.setAttribute("viewBox", viewBox);
        svg.setAttribute("class", "soma-svg");
        svg.innerHTML = outline + STATIC_PARTS;

        // Apply dynamic highlighting on muscle groups
        svg.querySelectorAll("[data-muscle]").forEach(el => {
            const muscleKey = el.getAttribute("data-muscle");
            if (activeKeys.has(muscleKey)) {
                el.classList.add("soma-active-muscle");
            }
        });
        return svg;
    }

    somaWrapper.appendChild(createSvg(FRONT_VIEWBOX, FRONT_OUTLINE, false));
    somaWrapper.appendChild(createSvg(BACK_VIEWBOX, BACK_OUTLINE, true));
}

function renderApp() {
    const totalSets = activeExercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completedSets = activeExercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.done).length, 0);
    const totalVolume = activeExercises.reduce((acc, ex) => {
        return acc + ex.sets.filter(s => s.done).reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0);
    }, 0);

    // Identify muscle coverage gaps
    const hitSubTargets = new Set(activeExercises.map(e => e.subTarget));
    const targetRequirements = splitRequiredHeads[currentSplit] || [];
    const missingHeads = targetRequirements.filter(h => !hitSubTargets.has(h));

    trackerContainer.innerHTML = `
        <div class="wk-topbar">
            <div>
                <span class="wk-badge">${currentSplit} Day</span>
                <h2 class="wk-title">Live Workout Logger</h2>
            </div>
            <div class="wk-live-duration">⏱ Active Session</div>
        </div>

        <div class="wk-stats-grid">
            <div class="wk-stat-box">
                <div class="wk-stat-lbl">Completed Sets</div>
                <div class="wk-stat-val">${completedSets} /${totalSets}</div>
            </div>
            <div class="wk-stat-box">
                <div class="wk-stat-lbl">Volume (kg)</div>
                <div class="wk-stat-val">${totalVolume}</div>
            </div>
            <div class="wk-stat-box">
                <div class="wk-stat-lbl">Exercises</div>
                <div class="wk-stat-val">${activeExercises.length}</div>
            </div>
        </div>

        <div class="wk-timer-radial-dock">
            <div style="display:flex; align-items:center; gap:12px;">
                <div class="wk-timer-ring-box">
                    <svg class="wk-timer-ring-svg">
                        <circle class="wk-timer-ring-bg" cx="24" cy="24" r="18"></circle>
                        <circle class="wk-timer-ring-bar" cx="24" cy="24" r="18"></circle>
                    </svg>
                    <span class="wk-timer-ring-txt">0s</span>
                </div>
                <div>
                    <div style="font-size:0.75rem; font-weight:800; color:#cbd5e1;">Rest Timer</div>
                    <div style="font-size:0.65rem; color:#64748b;">Quick auto-recovery</div>
                </div>
            </div>
            <div class="wk-timer-btn-grp">
                <button class="wk-timer-btn" data-sec="60">+60s</button>
                <button class="wk-timer-btn" data-sec="90">+90s</button>
                <button class="wk-timer-btn" data-sec="120">+120s</button>
            </div>
        </div>

        ${missingHeads.length > 0 ? `
            <div class="wk-gap-box">
                <div class="wk-gap-title">⚠️ Micro-Muscle Gaps Detected</div>
                <div style="color: #cbd5e1; font-size: 0.72rem;">Target heads not yet hit in this ${currentSplit} session:</div>
                <div class="wk-gap-items">
                    ${missingHeads.map(h => `<span class="wk-gap-chip">${h}</span>`).join("")}
                </div>
            </div>
        ` : ''}

        <div class="wk-action-row">
            <button class="wk-btn" id="wk-btn-push">Push</button>
            <button class="wk-btn" id="wk-btn-pull">Pull</button>
            <button class="wk-btn" id="wk-btn-legs">Legs</button>
            <button class="wk-btn wk-btn-save" id="wk-btn-save">💾 Save Log</button>
        </div>

        <div id="wk-exercise-list"></div>
    `;

    // Bind split buttons
    trackerContainer.querySelector("#wk-btn-push").onclick = () => loadPreset("Push (Chest/Delts/Triceps)", "Push");
    trackerContainer.querySelector("#wk-btn-pull").onclick = () => loadPreset("Pull (Back/RearDelts/Biceps)", "Pull");
    trackerContainer.querySelector("#wk-btn-legs").onclick = () => loadPreset("Legs (Quads/Hams/Glutes/Calves)", "Legs");

    // Bind rest timers
    trackerContainer.querySelectorAll(".wk-timer-btn").forEach(btn => {
        btn.onclick = () => startTimer(parseInt(btn.dataset.sec));
    });

    // Bind save log
    trackerContainer.querySelector("#wk-btn-save").onclick = async () => {
        const today = new Date().toISOString().slice(0, 10);
        let logMd = `\n### Workout Log - ${today} (${currentSplit})\n`;
        logMd += `**Total Volume:** ${totalVolume} kg | **Sets:** ${completedSets}/${totalSets}\n\n`;
        activeExercises.forEach(ex => {
            logMd += `- **${ex.name}** (${ex.subTarget})\n`;
            ex.sets.forEach((s, idx) => {
                logMd += `  - Set ${idx + 1}:${s.weight}kg x ${s.reps} reps${s.done ? "✅" : "❌"}\n`;
            });
        });
        await app.vault.append(dv.current().file, logMd);
        new Notice("✅ Workout saved to current note!");
    };

    // Render exercises
    const listContainer = trackerContainer.querySelector("#wk-exercise-list");
    activeExercises.forEach((ex, exIdx) => {
        const card = document.createElement("div");
        card.className = "wk-card";
        card.innerHTML = `
            <div class="wk-card-header">
                <div>
                    <div class="wk-card-title">${ex.name}</div>
                    <div class="wk-card-sub">${ex.subTarget} • ${ex.position} •${ex.tier}</div>
                </div>
                <button class="wk-del-btn" data-del-ex="${exIdx}">✕</button>
            </div>
            <div class="wk-set-header">
                <div>SET</div>
                <div>KG</div>
                <div>REPS</div>
                <div>DONE</div>
                <div></div>
            </div>
            <div class="wk-sets-container">
                ${ex.sets.map((set, sIdx) => `
                    <div class="wk-set-row">
                        <span class="wk-set-idx">${sIdx + 1}</span>
                        <input type="number" class="wk-input wk-inp-w" data-ex="${exIdx}" data-set="${sIdx}" value="${set.weight}">
                        <input type="number" class="wk-input wk-inp-r" data-ex="${exIdx}" data-set="${sIdx}" value="${set.reps}">
                        <button class="wk-check-btn ${set.done ? "completed" : ""}" data-toggle-done="${exIdx},${sIdx}">✓</button>
                        <button class="wk-del-btn" data-del-set="${exIdx},${sIdx}">–</button>
                    </div>
                `).join("")}
            </div>
            <button class="wk-add-set-btn" data-add-set="${exIdx}">+ Add Set</button>
        `;

        // Event bindings inside exercise card
        card.querySelector(`[data-del-ex="${exIdx}"]`).onclick = () => {
            activeExercises.splice(exIdx, 1);
            renderApp();
        };

        card.querySelector(`[data-add-set="${exIdx}"]`).onclick = () => {
            const lastSet = ex.sets[ex.sets.length - 1] || { weight: 20, reps: 10 };
            ex.sets.push({ weight: lastSet.weight, reps: lastSet.reps, done: false });
            renderApp();
        };

        card.querySelectorAll(".wk-inp-w").forEach(inp => {
            inp.onchange = (e) => { ex.sets[e.target.dataset.set].weight = parseFloat(e.target.value) || 0; };
        });

        card.querySelectorAll(".wk-inp-r").forEach(inp => {
            inp.onchange = (e) => { ex.sets[e.target.dataset.set].reps = parseInt(e.target.value) || 0; };
        });

        card.querySelectorAll("[data-toggle-done]").forEach(btn => {
            btn.onclick = () => {
                const [eI, sI] = btn.dataset.toggleDone.split(",").map(Number);
                activeExercises[eI].sets[sI].done = !activeExercises[eI].sets[sI].done;
                if (activeExercises[eI].sets[sI].done) startTimer(90);
                renderApp();
            };
        });

        card.querySelectorAll("[data-del-set]").forEach(btn => {
            btn.onclick = () => {
                const [eI, sI] = btn.dataset.delSet.split(",").map(Number);
                activeExercises[eI].sets.splice(sI, 1);
                renderApp();
            };
        });

        listContainer.appendChild(card);
    });

    renderSomaVisualizer();
}

function loadPreset(presetKey, splitName) {
    currentSplit = splitName;
    const names = routinePresets[presetKey].map(p => p.name);
    activeExercises = exerciseDB
        .filter(ex => names.includes(ex.name))
        .map(ex => ({
            ...ex,
            sets: [
                { weight: 20, reps: 10, done: false },
                { weight: 20, reps: 10, done: false },
                { weight: 20, reps: 8, done: false }
            ]
        }));
    renderApp();
}

renderApp();
```