```dataviewjs
const rootEl = dv.el("div", "", { cls: "workout-tracker-root" });

const exerciseData = {
  "Chest": ["Barbell Bench Press", "Incline Dumbbell Press", "Cable Chest Fly", "Dips", "Chest Press Machine", "Push-ups"],
  "Back": ["Barbell Deadlift", "Lat Pulldown", "Barbell Row", "Seated Cable Row", "Pull-ups", "T-Bar Row"],
  "Legs": ["Barbell Back Squat", "Leg Press", "Romanian Deadlift", "Leg Extensions", "Lying Leg Curls", "Standing Calf Raises"],
  "Shoulders": ["Overhead Barbell Press", "Dumbbell Lateral Raise", "Cable Lateral Raise", "Face Pulls", "Rear Delt Flyes"],
  "Biceps": ["Barbell Bicep Curl", "Incline Dumbbell Curl", "Hammer Curl", "Preacher Curl", "Cable Curl"],
  "Triceps": ["Cable Triceps Pushdown", "Skull Crushers", "Overhead Cable Extension", "Close-Grip Bench Press"],
  "Forearms": ["Barbell Wrist Curls", "Reverse Barbell Curls", "Farmer's Walk", "Dead Hangs"]
};

const routinePresets = {
  "Push (Chest/Delts/Triceps)": [
    { muscle: "Chest", name: "Barbell Bench Press" },
    { muscle: "Chest", name: "Incline Dumbbell Press" },
    { muscle: "Shoulders", name: "Dumbbell Lateral Raise" },
    { muscle: "Triceps", name: "Cable Triceps Pushdown" }
  ],
  "Pull (Back/Biceps/Forearms)": [
    { muscle: "Back", name: "Lat Pulldown" },
    { muscle: "Back", name: "Seated Cable Row" },
    { muscle: "Biceps", name: "Incline Dumbbell Curl" },
    { muscle: "Forearms", name: "Reverse Barbell Curls" }
  ],
  "Legs (Quads/Hams/Calves)": [
    { muscle: "Legs", name: "Barbell Back Squat" },
    { muscle: "Legs", name: "Romanian Deadlift" },
    { muscle: "Legs", name: "Leg Extensions" },
    { muscle: "Legs", name: "Standing Calf Raises" }
  ]
};

// Styles
const style = document.createElement("style");
style.textContent = [
  ".wk-app { background: #070d19; border: 1px solid #1e293b; border-radius: 20px; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f8fafc; max-width: 620px; margin: 15px auto; box-shadow: 0 16px 45px rgba(0,0,0,0.65); box-sizing: border-box; position: relative; }",
  ".wk-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }",
  ".wk-badge { background: #2563eb; color: #ffffff; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 9px; border-radius: 999px; }",
  ".wk-live-duration { background: #0f172a; border: 1px solid #1e293b; color: #38bdf8; font-size: 0.75rem; font-weight: 800; padding: 4px 10px; border-radius: 8px; font-variant-numeric: tabular-nums; }",
  
  /* Symmetrical 2x2 Balanced Stats Grid */
  ".wk-stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }",
  ".wk-stat-box { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 12px 10px; text-align: center; }",
  ".wk-stat-lbl { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }",
  ".wk-stat-val { font-size: 1.15rem; font-weight: 800; color: #38bdf8; margin-top: 3px; }",
  
  ".wk-timer-dock { display: flex; align-items: center; justify-content: space-between; background: #0c1e3d; border: 1px solid #1d4ed8; border-radius: 14px; padding: 8px 14px; margin-bottom: 16px; }",
  ".wk-timer-title { font-size: 0.78rem; font-weight: 700; color: #93c5fd; }",
  ".wk-timer-display { font-size: 1.2rem; font-weight: 800; color: #ffffff; font-variant-numeric: tabular-nums; }",
  ".wk-timer-btn { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); color: #ffffff; border-radius: 6px; padding: 4px 8px; font-size: 0.72rem; font-weight: 700; cursor: pointer; }",
  ".wk-action-row { display: flex; gap: 8px; margin-bottom: 16px; }",
  ".wk-btn { flex: 1; background: #0f172a; color: #ffffff; border: 1px solid #1e293b; border-radius: 10px; padding: 8px; font-size: 0.8rem; font-weight: 700; cursor: pointer; text-align: center; transition: all 0.15s ease; }",
  ".wk-btn:hover { background: #1e293b; border-color: #334155; }",
  ".wk-btn-save { background: #064e3b; border-color: #059669; color: #a7f3d0; }",
  ".wk-btn-save:hover { background: #047857; color: #ffffff; }",
  ".wk-selector-card { display: none; background: #0f172a; border: 1px solid #2563eb; border-radius: 14px; padding: 16px; margin-bottom: 16px; }",
  ".wk-dropdown { width: 100%; height: 40px; background: #070d19; border: 1px solid #1e3a8a; color: #f8fafc; border-radius: 8px; padding: 6px 12px; font-size: 0.88rem; outline: none; margin-bottom: 10px; box-sizing: border-box; }",
  ".wk-card { background: #0b1324; border: 1px solid #172554; border-radius: 16px; padding: 16px; margin-bottom: 14px; }",
  ".wk-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }",
  ".wk-card-title { font-weight: 800; font-size: 0.95rem; color: #ffffff; }",
  ".wk-group-pill { background: #172554; color: #38bdf8; font-size: 0.65rem; font-weight: 700; padding: 2px 8px; border-radius: 6px; margin-left: 6px; }",
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

  /* Permanent Recap Screen Styles */
  ".wk-recap-screen { background: #070d19; border-radius: 20px; box-sizing: border-box; }",
  ".wk-recap-head { text-align: center; padding: 10px 0 20px 0; border-bottom: 1px solid #1e293b; margin-bottom: 18px; }",
  ".wk-recap-title { font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 6px 0 0 0; letter-spacing: -0.02em; }",
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

    cardsHtml += [
      '<div class="wk-recap-card">',
        '<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">',
          '<span style="font-weight:800; font-size:0.95rem; color:#ffffff;">' + ex.name + '</span>',
          '<span class="wk-group-pill">' + ex.muscle + '</span>',
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
  let muscleOptionsHtml = Object.keys(exerciseData).map(function(m) {
    return '<option value="' + m + '">' + m + '</option>';
  }).join("");

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
    '<div class="wk-stats-grid">',
      '<div class="wk-stat-box"><div class="wk-stat-lbl">Est. Burn</div><div class="wk-stat-val" id="stat-cals" style="color:#f59e0b;">0 kcal</div></div>',
      '<div class="wk-stat-box"><div class="wk-stat-lbl">Volume (kg)</div><div class="wk-stat-val" id="stat-vol">0</div></div>',
      '<div class="wk-stat-box"><div class="wk-stat-lbl">Sets Done</div><div class="wk-stat-val" id="stat-sets">0</div></div>',
      '<div class="wk-stat-box"><div class="wk-stat-lbl">Exercises</div><div class="wk-stat-val" id="stat-ex">0</div></div>',
    '</div>',
    '<div class="wk-timer-dock">',
      '<div><div class="wk-timer-title">⏱️ Rest Countdown</div><div class="wk-timer-display" id="timer-val">01:30</div></div>',
      '<div style="display:flex; gap:6px;">',
        '<button class="wk-timer-btn" id="t-60">+60s</button>',
        '<button class="wk-timer-btn" id="t-90">+90s</button>',
        '<button class="wk-timer-btn" id="t-reset" style="background:#ef4444; border-color:#ef4444;">Reset</button>',
      '</div>',
    '</div>',
    '<div class="wk-action-row">',
      '<button class="wk-btn" id="btn-routine">⚡ Split Routine</button>',
      '<button class="wk-btn" id="btn-open-add">➕ Add Exercise</button>',
      '<button class="wk-btn wk-btn-save" id="btn-save-note">💾 Finish & Save</button>',
    '</div>',
    '<div class="wk-selector-card" id="routine-selector">',
      '<div style="font-weight:800; font-size:0.95rem; margin-bottom:10px;">Select Routine Split</div>',
      '<select class="wk-dropdown" id="split-select">' + splitOptionsHtml + '</select>',
      '<div style="display:flex; justify-content:flex-end; gap:8px;">',
        '<button class="wk-btn" id="btn-split-cancel" style="flex:none; padding:6px 14px;">Cancel</button>',
        '<button class="wk-btn" id="btn-split-load" style="flex:none; padding:6px 16px; background:#2563eb; border:none;">Load Split</button>',
      '</div>',
    '</div>',
    '<div class="wk-selector-card" id="add-selector">',
      '<div style="font-weight:800; font-size:0.95rem; margin-bottom:10px;">Select Exercise</div>',
      '<label class="wk-th" style="display:block; text-align:left; margin-bottom:4px;">1. Muscle Group</label>',
      '<select class="wk-dropdown" id="modal-muscle">' + muscleOptionsHtml + '</select>',
      '<label class="wk-th" style="display:block; text-align:left; margin-bottom:4px;">2. Exercise</label>',
      '<select class="wk-dropdown" id="modal-ex"></select>',
      '<div style="display:flex; justify-content:flex-end; gap:8px;">',
        '<button class="wk-btn" id="btn-ex-cancel" style="flex:none; padding:6px 14px;">Cancel</button>',
        '<button class="wk-btn" id="btn-ex-add" style="flex:none; padding:6px 16px; background:#2563eb; border:none;">Add</button>',
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

  const modalMuscle = trackerApp.querySelector("#modal-muscle");
  const modalEx = trackerApp.querySelector("#modal-ex");
  const addSelector = trackerApp.querySelector("#add-selector");
  const routineSelector = trackerApp.querySelector("#routine-selector");

  function updateModalOptions() {
    const list = exerciseData[modalMuscle.value] || [];
    modalEx.innerHTML = list.map(function(e) {
      return '<option value="' + e + '">' + e + '</option>';
    }).join("");
  }
  modalMuscle.onchange = updateModalOptions;
  updateModalOptions();

  trackerApp.querySelector("#btn-open-add").onclick = function() {
    routineSelector.style.display = "none";
    addSelector.style.display = "block";
  };
  trackerApp.querySelector("#btn-ex-cancel").onclick = function() { addSelector.style.display = "none"; };

  trackerApp.querySelector("#btn-routine").onclick = function() {
    addSelector.style.display = "none";
    routineSelector.style.display = "block";
  };
  trackerApp.querySelector("#btn-split-cancel").onclick = function() { routineSelector.style.display = "none"; };

  trackerApp.querySelector("#btn-split-load").onclick = function() {
    const selected = trackerApp.querySelector("#split-select").value;
    const list = routinePresets[selected] || [];
    sessionExercises = list.map(function(item) {
      return {
        muscle: item.muscle,
        name: item.name,
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

  trackerApp.querySelector("#btn-ex-add").onclick = function() {
    sessionExercises.push({
      muscle: modalMuscle.value,
      name: modalEx.value,
      sets: [
        { weight: "", reps: "", failure: "", done: false },
        { weight: "", reps: "", failure: "", done: false },
        { weight: "", reps: "", failure: "", done: false }
      ]
    });
    addSelector.style.display = "none";
    render();
  };

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

    sessionExercises.forEach(function(ex, exIdx) {
      const card = document.createElement("div");
      card.className = "wk-card";

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
          '<div>',
            '<span class="wk-card-title">' + (exIdx + 1) + '. ' + ex.name + '</span>',
            '<span class="wk-group-pill">' + ex.muscle + '</span>',
          '</div>',
          '<button class="wk-btn-del btn-del-card" data-ex="' + exIdx + '">✕</button>',
        '</div>',
        rowsHtml,
        '<button class="wk-btn-addset btn-add-set" data-ex="' + exIdx + '">+ Add Set</button>'
      ].join("");

      cardsContainer.appendChild(card);
    });

    updateStats();
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
        updateStats();
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

      markdownLog += "\n**" + ex.name + "** (" + ex.muscle + ")\n";
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

        markdownLog += "- (workout:: " + ex.name + ") (muscle:: " + ex.muscle + ") (weight:: " + w + ") kg × (reps:: " + r + ") reps [fail:: " + failVal + "] " + (s.done ? "✅" : "⏳") + "\n";
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
