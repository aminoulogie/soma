```dataviewjs
const root = dv.el("div", "", { cls: "workout-tracker-root" });

const exerciseData = {
  "Chest": ["Barbell Bench Press", "Incline Dumbbell Press", "Cable Chest Fly", "Dips", "Chest Press Machine", "Push-ups"],
  "Back": ["Barbell Deadlift", "Lat Pulldown", "Barbell Row", "Seated Cable Row", "Pull-ups", "T-Bar Row"],
  "Legs": ["Barbell Back Squat", "Leg Press", "Romanian Deadlift", "Leg Extensions", "Lying Leg Curls", "Standing Calf Raises"],
  "Shoulders": ["Overhead Barbell Press", "Dumbbell Lateral Raise", "Cable Lateral Raise", "Face Pulls", "Rear Delt Flyes"],
  "Biceps": ["Barbell Bicep Curl", "Incline Dumbbell Curl", "Hammer Curl", "Preacher Curl", "Cable Curl"],
  "Triceps": ["Cable Triceps Pushdown", "Skull Crushers", "Overhead Cable Extension", "Close-Grip Bench Press"],
  "Forearms": ["Barbell Wrist Curls", "Reverse Barbell Curls", "Farmer's Walk", "Dead Hangs"]
};

// Styles
const style = document.createElement("style");
style.textContent = `
  .wk-app {
    background: #0b0f19;
    border: 1px solid #1e293b;
    border-radius: 18px;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #f8fafc;
    max-width: 620px;
    margin: 15px auto;
    box-shadow: 0 12px 35px rgba(0,0,0,0.5);
    box-sizing: border-box;
  }
  .wk-topbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  }
  .wk-title-group h3 {
    margin: 4px 0 0 0;
    font-size: 1.25rem;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.02em;
  }
  .wk-badge {
    background: #2563eb;
    color: white;
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 3px 8px;
    border-radius: 999px;
  }
  .wk-btn-main {
    background: #1e293b;
    color: #ffffff;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .wk-btn-main:hover {
    background: #2563eb;
    border-color: #2563eb;
  }

  /* Inline Add Exercise Card (No clipping, perfectly aligned) */
  .wk-selector-card {
    display: none;
    background: #111827;
    border: 1px solid #3b82f6;
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 16px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  }
  .wk-selector-header {
    font-size: 1.05rem;
    font-weight: 800;
    margin-bottom: 14px;
    color: #ffffff;
  }
  .wk-field-group {
    margin-bottom: 12px;
  }
  .wk-label {
    display: block;
    font-size: 0.72rem;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    margin-bottom: 6px;
    letter-spacing: 0.04em;
  }
  .wk-dropdown {
    width: 100%;
    height: 40px;
    background: #1f2937;
    border: 1px solid #374151;
    color: #f8fafc;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 0.88rem;
    outline: none;
    box-sizing: border-box;
  }
  .wk-dropdown:focus { border-color: #38bdf8; }
  .wk-selector-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 16px;
  }
  .wk-btn-cancel {
    background: #1e293b;
    border: 1px solid #334155;
    color: #94a3b8;
    border-radius: 8px;
    padding: 7px 15px;
    font-size: 0.82rem;
    font-weight: 600;
    cursor: pointer;
  }
  .wk-btn-confirm {
    background: #2563eb;
    border: none;
    color: #ffffff;
    border-radius: 8px;
    padding: 7px 18px;
    font-size: 0.82rem;
    font-weight: 700;
    cursor: pointer;
  }
  .wk-btn-confirm:hover { background: #1d4ed8; }

  /* Exercise Card */
  .wk-card {
    background: #111827;
    border: 1px solid #1f2937;
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 14px;
  }
  .wk-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .wk-card-title {
    font-weight: 800;
    font-size: 0.95rem;
    color: #ffffff;
  }
  .wk-group-pill {
    background: #1e293b;
    color: #38bdf8;
    font-size: 0.65rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 6px;
    margin-left: 6px;
  }
  .wk-btn-del {
    background: transparent;
    border: none;
    color: #ef4444;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 700;
  }

  /* Set Row */
  .wk-set-row {
    display: grid;
    grid-template-columns: 26px 1fr 1fr 1fr 32px 20px;
    gap: 8px;
    align-items: center;
    margin-bottom: 6px;
  }
  .wk-th {
    font-size: 0.65rem;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    text-align: center;
  }
  .wk-input {
    background: #1f2937;
    border: 1px solid #374151;
    border-radius: 6px;
    color: #ffffff;
    padding: 6px;
    text-align: center;
    font-size: 0.85rem;
    width: 100%;
    outline: none;
    box-sizing: border-box;
    height: 36px;
  }
  .wk-input:focus {
    border-color: #38bdf8;
    background: #172033;
  }
  .wk-check {
    width: 18px;
    height: 18px;
    accent-color: #38bdf8;
    cursor: pointer;
    margin: 0 auto;
  }
  .wk-btn-addset {
    width: 100%;
    background: rgba(255, 255, 255, 0.03);
    border: 1px dashed #374151;
    border-radius: 8px;
    color: #94a3b8;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 7px;
    margin-top: 10px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .wk-btn-addset:hover {
    background: rgba(255, 255, 255, 0.07);
    color: #ffffff;
  }
`;
root.appendChild(style);

// UI App Component
const app = document.createElement("div");
app.className = "wk-app";
app.innerHTML = `
  <div class="wk-topbar">
    <div class="wk-title-group">
      <span class="wk-badge">Tracker</span>
      <h3>Workout Session</h3>
    </div>
    <button class="wk-btn-main" id="btn-open-modal">+ Add Exercise</button>
  </div>

  <!-- Inline Selector (Smooth & Perfectly Aligned) -->
  <div class="wk-selector-card" id="add-selector">
    <div class="wk-selector-header">Select Exercise</div>
    
    <div class="wk-field-group">
      <label class="wk-label">1. Muscle Group</label>
      <select class="wk-dropdown" id="modal-muscle-select">
        ${Object.keys(exerciseData).map(m => `<option value="${m}">${m}</option>`).join("")}
      </select>
    </div>

    <div class="wk-field-group">
      <label class="wk-label">2. Exercise</label>
      <select class="wk-dropdown" id="modal-exercise-select"></select>
    </div>

    <div class="wk-selector-actions">
      <button class="wk-btn-cancel" id="btn-modal-cancel">Cancel</button>
      <button class="wk-btn-confirm" id="btn-modal-add">Add to Log</button>
    </div>
  </div>

  <div id="exercise-cards-list"></div>
`;
root.appendChild(app);

// State
let sessionExercises = [];

// Selector Logic
const selectorCard = app.querySelector("#add-selector");
const muscleSelect = app.querySelector("#modal-muscle-select");
const exerciseSelect = app.querySelector("#modal-exercise-select");

function updateModalExercises() {
  const selectedMuscle = muscleSelect.value;
  const list = exerciseData[selectedMuscle] || [];
  exerciseSelect.innerHTML = list.map(ex => `<option value="${ex}">${ex}</option>`).join("");
}

muscleSelect.onchange = updateModalExercises;
updateModalExercises();

app.querySelector("#btn-open-modal").onclick = () => {
  selectorCard.style.display = "block";
};

app.querySelector("#btn-modal-cancel").onclick = () => {
  selectorCard.style.display = "none";
};

app.querySelector("#btn-modal-add").onclick = () => {
  sessionExercises.push({
    muscle: muscleSelect.value,
    name: exerciseSelect.value,
    sets: [
      { weight: "", reps: "", failure: "", done: false },
      { weight: "", reps: "", failure: "", done: false },
      { weight: "", reps: "", failure: "", done: false }
    ]
  });
  selectorCard.style.display = "none";
  render();
};

// Render Cards
function render() {
  const container = app.querySelector("#exercise-cards-list");
  container.innerHTML = "";

  sessionExercises.forEach((ex, exIdx) => {
    const card = document.createElement("div");
    card.className = "wk-card";

    let rowsHtml = `
      <div class="wk-set-row">
        <div class="wk-th">SET</div>
        <div class="wk-th">KG</div>
        <div class="wk-th">REPS</div>
        <div class="wk-th">FAIL (1-5)</div>
        <div class="wk-th">DONE</div>
        <div></div>
      </div>
    `;

    ex.sets.forEach((s, sIdx) => {
      rowsHtml += `
        <div class="wk-set-row">
          <div style="font-size:0.75rem; text-align:center; color:#64748b; font-weight:800;">${sIdx + 1}</div>
          <input type="number" class="wk-input set-weight" data-ex="${exIdx}" data-set="${sIdx}" value="${s.weight}" placeholder="80" />
          <input type="number" class="wk-input set-reps" data-ex="${exIdx}" data-set="${sIdx}" value="${s.reps}" placeholder="8" />
          <input type="number" min="1" max="5" class="wk-input set-failure" data-ex="${exIdx}" data-set="${sIdx}" value="${s.failure}" placeholder="1-5" />
          <input type="checkbox" class="wk-check set-done" data-ex="${exIdx}" data-set="${sIdx}" ${s.done ? "checked" : ""} />
          <button class="wk-btn-del btn-del-set" data-ex="${exIdx}" data-set="${sIdx}">✕</button>
        </div>
      `;
    });

    card.innerHTML = `
      <div class="wk-card-header">
        <div>
          <span class="wk-card-title">${exIdx + 1}.${ex.name}</span>
          <span class="wk-group-pill">${ex.muscle}</span>
        </div>
        <button class="wk-btn-del btn-del-ex" data-ex="${exIdx}">✕</button>
      </div>
      ${rowsHtml}
      <button class="wk-btn-addset btn-add-set" data-ex="${exIdx}">+ Add Set</button>
    `;

    container.appendChild(card);
  });

  attachEvents();
}

function attachEvents() {
  app.querySelectorAll(".set-weight").forEach(inp => {
    inp.oninput = (e) => {
      sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].weight = e.target.value;
    };
  });

  app.querySelectorAll(".set-reps").forEach(inp => {
    inp.oninput = (e) => {
      sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].reps = e.target.value;
    };
  });

  app.querySelectorAll(".set-failure").forEach(inp => {
    inp.oninput = (e) => {
      sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].failure = e.target.value;
    };
  });

  app.querySelectorAll(".set-done").forEach(chk => {
    chk.onchange = (e) => {
      sessionExercises[e.target.dataset.ex].sets[e.target.dataset.set].done = e.target.checked;
    };
  });

  app.querySelectorAll(".btn-del-set").forEach(btn => {
    btn.onclick = () => {
      sessionExercises[btn.dataset.ex].sets.splice(btn.dataset.set, 1);
      render();
    };
  });

  app.querySelectorAll(".btn-add-set").forEach(btn => {
    btn.onclick = () => {
      sessionExercises[btn.dataset.ex].sets.push({ weight: "", reps: "", failure: "", done: false });
      render();
    };
  });

  app.querySelectorAll(".btn-del-ex").forEach(btn => {
    btn.onclick = () => {
      sessionExercises.splice(btn.dataset.ex, 1);
      render();
    };
  });
}
```
