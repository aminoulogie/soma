```dataviewjs
async function initPRMilestoneDashboard() {
// ============================================================================
// 1. DATA SOURCE LOADING & PR EXTRACTION
// ============================================================================
const historyFilePath = "apps/scripts/soma-history.json";
const historyFile = app.vault.getAbstractFileByPath(historyFilePath);

let history = {};
if (historyFile) {
  try {
    const raw = await app.vault.read(historyFile);
    history = JSON.parse(raw);
  } catch (e) {}
}

const prMap = {};

// Parse all sessions across history
for (const [dateKey, session] of Object.entries(history)) {
  const sessionDate = session.dateStr ? session.dateStr.slice(0, 10) : dateKey.slice(0, 10);
  const sessionTimestamp = session.timestamp || 0;

  (session.exercises || []).forEach(ex => {
    const name = ex.name.trim();
    if (!prMap[name]) {
      prMap[name] = {
        name: name,
        muscle: ex.muscle || "Custom",
        subTarget: ex.subTarget || "",
        maxWeight: 0,
        maxReps: 0,
        best1RM: 0,
        prDate: sessionDate,
        timestamp: sessionTimestamp,
        totalTimesLogged: 0
      };
    }

    prMap[name].totalTimesLogged++;

    (ex.sets || []).forEach(s => {
      const w = parseFloat(s.weight) || 0;
      const r = parseFloat(s.reps) || 0;
      if (w > 0 && r > 0) {
        const est1RM = Math.round(w * (1 + r / 30));
        
        // Check for new weight PR or higher 1RM
        if (w > prMap[name].maxWeight || (w === prMap[name].maxWeight && r > prMap[name].maxReps)) {
          prMap[name].maxWeight = w;
          prMap[name].maxReps = r;
          prMap[name].best1RM = Math.max(prMap[name].best1RM, est1RM);
          prMap[name].prDate = sessionDate;
          prMap[name].timestamp = sessionTimestamp;
        } else if (est1RM > prMap[name].best1RM) {
          prMap[name].best1RM = est1RM;
        }
      }
    });
  });
}

const prList = Object.values(prMap).filter(p => p.maxWeight > 0);

// Sort by most recently achieved PR
prList.sort((a, b) => b.timestamp - a.timestamp);

// ============================================================================
// 2. GAMIFIED MILESTONE & RANK GENERATOR
// ============================================================================
function calculateStrengthTier(maxWeight, best1RM) {
  const val = Math.max(maxWeight, best1RM);
  
  if (val >= 140) {
    return { rank: "👑 Mythic Master", cls: "tier-mythic", color: "#ec4899", nextTarget: 160, base: 140 };
  } else if (val >= 100) {
    return { rank: "💎 Diamond Tier", cls: "tier-diamond", color: "#38bdf8", nextTarget: 140, base: 100 };
  } else if (val >= 70) {
    return { rank: "🥇 Gold Elite", cls: "tier-gold", color: "#fbbf24", nextTarget: 100, base: 70 };
  } else if (val >= 40) {
    return { rank: "🥈 Silver Pro", cls: "tier-silver", color: "#94a3b8", nextTarget: 70, base: 40 };
  } else {
    return { rank: "🥉 Bronze Novice", cls: "tier-bronze", color: "#cd7f32", nextTarget: 40, base: 0 };
  }
}

// Calculate Trophy Level & Total Score
let totalScore = 0;
prList.forEach(p => {
  totalScore += Math.round(p.best1RM * 1.5 + p.totalTimesLogged * 10);
});
const trophyLevel = Math.max(1, Math.floor(totalScore / 250));
const levelProgress = Math.min(100, Math.round(((totalScore % 250) / 250) * 100));

// ============================================================================
// 3. UI ROOT CONTAINER & CSS
// ============================================================================
const dashboardRoot = dv.el("div", "", { cls: "wk-pr-root" });

const style = document.createElement("style");
style.textContent = `
  .wk-pr-root {
    max-width: 680px;
    margin: 0 auto;
    font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif);
    color: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-sizing: border-box;
  }
  .wk-pr-card {
    background: #070d19;
    border: 1px solid #1e293b;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 16px 45px rgba(0,0,0,0.65);
    box-sizing: border-box;
    width: 100%;
  }
  .wk-pr-topbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; }
  .wk-pr-badge { background: #2563eb; color: #ffffff; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; padding: 3px 10px; border-radius: 999px; }
  .wk-pr-title { font-size: 1.35rem; font-weight: 800; color: #ffffff; margin: 4px 0 0 0; }
  
  /* GAMIFIED TROPHY BANNER */
  .wk-trophy-banner {
    background: linear-gradient(135deg, rgba(37, 99, 235, 0.22), rgba(236, 72, 153, 0.15));
    border: 1px solid #2563eb;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .wk-trophy-lvl { font-size: 1.85rem; font-weight: 900; color: #fbbf24; }
  .wk-xp-bar-bg { background: #1e293b; height: 8px; border-radius: 999px; width: 100%; margin-top: 6px; overflow: hidden; }
  .wk-xp-bar-fill { background: linear-gradient(90deg, #38bdf8, #fbbf24); height: 100%; border-radius: 999px; }

  /* STATS GRID */
  .wk-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 16px; }
  .wk-stat-box { background: #0c1527; border: 1px solid #17243c; border-radius: 12px; padding: 10px; text-align: center; }
  .wk-stat-lbl { font-size: 0.65rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
  .wk-stat-val { font-size: 1.15rem; font-weight: 800; color: #38bdf8; margin-top: 3px; }

  /* FILTER BAR */
  .wk-filter-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }
  .wk-filter-btn {
    background: #0b1324;
    border: 1px solid #1e293b;
    color: #94a3b8;
    padding: 6px 14px;
    border-radius: 8px;
    font-size: 0.75rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  .wk-filter-btn:hover { color: #fff; border-color: #38bdf8; }
  .wk-filter-btn.active { background: #2563eb; color: #fff; border-color: #60a5fa; }

  /* PR ITEM CARDS */
  .wk-pr-grid { display: flex; flex-direction: column; gap: 10px; }
  .wk-pr-item {
    background: #0b1324;
    border: 1px solid #172554;
    border-radius: 14px;
    padding: 14px 16px;
    transition: transform 0.15s ease, border-color 0.15s ease;
  }
  .wk-pr-item:hover { border-color: #38bdf8; transform: translateY(-2px); }
  .wk-pr-item-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .wk-pr-name { font-weight: 800; font-size: 0.95rem; color: #ffffff; }
  .wk-pr-sub { font-size: 0.72rem; color: #94a3b8; margin-top: 2px; }
  
  .wk-rank-pill { font-size: 0.68rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; }
  .tier-mythic { background: rgba(236,72,153,0.18); color: #f472b6; border: 1px solid #ec4899; }
  .tier-diamond { background: rgba(56,189,248,0.18); color: #7dd3fc; border: 1px solid #38bdf8; }
  .tier-gold { background: rgba(251,191,36,0.18); color: #fde047; border: 1px solid #fbbf24; }
  .tier-silver { background: rgba(148,163,184,0.18); color: #cbd5e1; border: 1px solid #94a3b8; }
  .tier-bronze { background: rgba(205,127,50,0.18); color: #fca5a5; border: 1px solid #cd7f32; }

  .wk-pr-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; background: #070d19; border: 1px solid #1e293b; border-radius: 10px; padding: 8px 12px; margin-bottom: 8px; text-align: center; }
  .wk-metric-lbl { font-size: 0.62rem; font-weight: 800; color: #64748b; text-transform: uppercase; }
  .wk-metric-val { font-size: 0.95rem; font-weight: 900; color: #38bdf8; margin-top: 2px; }

  .wk-milestone-bar-wrap { display: flex; align-items: center; gap: 10px; margin-top: 4px; }
  .wk-milestone-txt { font-size: 0.68rem; font-weight: 700; color: #94a3b8; width: 140px; }
  .wk-milestone-bar { flex: 1; height: 6px; background: #1e293b; border-radius: 999px; overflow: hidden; }
  .wk-milestone-fill { height: 100%; border-radius: 999px; }
`;
dashboardRoot.appendChild(style);

// ============================================================================
// 4. VIEW RENDERING & EVENT HANDLERS
// ============================================================================
const container = dashboardRoot.createDiv({ cls: "wk-pr-card" });

let activeFilter = "ALL";

function renderPRDashboard() {
  const filteredList = prList.filter(p => {
    if (activeFilter === "ALL") return true;
    return p.muscle.toUpperCase().includes(activeFilter) || p.subTarget.toUpperCase().includes(activeFilter);
  });

  const bestOverall1RM = prList.reduce((max, p) => p.best1RM > max ? p.best1RM : max, 0);

  let prCardsHtml = "";
  if (filteredList.length > 0) {
    prCardsHtml = filteredList.map(p => {
      const tier = calculateStrengthTier(p.maxWeight, p.best1RM);
      const span = tier.nextTarget - tier.base;
      const progressToNext = Math.min(100, Math.max(0, Math.round(((p.maxWeight - tier.base) / span) * 100)));

      return `
        <div class="wk-pr-item">
          <div class="wk-pr-item-top">
            <div>
              <div class="wk-pr-name">${p.name}</div>
              <div class="wk-pr-sub">${p.subTarget || p.muscle} • Logged ${p.totalTimesLogged} Sessions</div>
            </div>
            <span class="wk-rank-pill ${tier.cls}">${tier.rank}</span>
          </div>

          <div class="wk-pr-metrics">
            <div>
              <div class="wk-metric-lbl">Max Working PR</div>
              <div class="wk-metric-val">${p.maxWeight} kg × ${p.maxReps} r</div>
            </div>
            <div>
              <div class="wk-metric-lbl">Est. 1RM Peak</div>
              <div class="wk-metric-val" style="color: #34d399;">${p.best1RM} kg</div>
            </div>
            <div>
              <div class="wk-metric-lbl">Achieved Date</div>
              <div class="wk-metric-val" style="color: #fbbf24; font-size: 0.82rem;">📅 ${p.prDate}</div>
            </div>
          </div>

          <div class="wk-milestone-bar-wrap">
            <div class="wk-milestone-txt">Target: <b>${tier.nextTarget} kg</b></div>
            <div class="wk-milestone-bar">
              <div class="wk-milestone-fill" style="width: ${progressToNext}%; background: ${tier.color};"></div>
            </div>
            <div style="font-size: 0.68rem; font-weight: 800; color: ${tier.color}; width: 34px; text-align: right;">${progressToNext}%</div>
          </div>
        </div>
      `;
    }).join("");
  } else {
    prCardsHtml = `<div style="text-align:center; padding: 24px; color:#64748b; font-size:0.85rem;">No PRs logged yet. Finish workouts in the daily logger to unlock milestone trophies!</div>`;
  }

  container.innerHTML = `
    <div class="wk-pr-topbar">
      <div>
        <span class="wk-pr-badge">Trophy Room</span>
        <h3 class="wk-pr-title">Strength PR Hall of Fame</h3>
      </div>
      <div style="font-size: 0.75rem; color: #38bdf8; font-weight: 800;">⚡ Lifetime Records</div>
    </div>

    <div class="wk-trophy-banner">
      <div style="flex: 1; margin-right: 16px;">
        <div style="font-size: 0.7rem; font-weight: 800; color: #cbd5e1; text-transform: uppercase; letter-spacing: 0.06em;">Lifter Strength Tier</div>
        <div style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin-top: 2px;">Level ${trophyLevel} Master Athlete</div>
        <div class="wk-xp-bar-bg">
          <div class="wk-xp-bar-fill" style="width: ${levelProgress}%;"></div>
        </div>
        <div style="font-size: 0.68rem; color: #94a3b8; margin-top: 4px;">${totalScore} Lifetime Trophy Points • ${levelProgress}% to Level ${trophyLevel + 1}</div>
      </div>
      <div class="wk-trophy-lvl">🏆 Lvl ${trophyLevel}</div>
    </div>

    <div class="wk-stats-grid">
      <div class="wk-stat-box">
        <div class="wk-stat-lbl">Trophies Unlocked</div>
        <div class="wk-stat-val">${prList.length}</div>
      </div>
      <div class="wk-stat-box">
        <div class="wk-stat-lbl">Peak 1RM</div>
        <div class="wk-stat-val" style="color:#34d399;">${bestOverall1RM} kg</div>
      </div>
      <div class="wk-stat-box">
        <div class="wk-stat-lbl">Latest PR Date</div>
        <div class="wk-stat-val" style="color:#fbbf24; font-size: 0.85rem;">${prList[0] ? prList[0].prDate : "None"}</div>
      </div>
    </div>

    <div class="wk-filter-row">
      <button class="wk-filter-btn ${activeFilter === 'ALL' ? 'active' : ''}" data-cat="ALL">All Exercises</button>
      <button class="wk-filter-btn ${activeFilter === 'CHEST' ? 'active' : ''}" data-cat="CHEST">Chest</button>
      <button class="wk-filter-btn ${activeFilter === 'BACK' ? 'active' : ''}" data-cat="BACK">Back</button>
      <button class="wk-filter-btn ${activeFilter === 'SHOULDER' ? 'active' : ''}" data-cat="SHOULDER">Shoulders</button>
      <button class="wk-filter-btn ${activeFilter === 'ARMS' ? 'active' : ''}" data-cat="ARMS">Arms</button>
      <button class="wk-filter-btn ${activeFilter === 'LEGS' ? 'active' : ''}" data-cat="LEGS">Legs</button>
    </div>

    <div class="wk-pr-grid">${prCardsHtml}</div>
  `;

  // Bind filter buttons
  container.querySelectorAll(".wk-filter-btn").forEach(btn => {
    btn.onclick = () => {
      activeFilter = btn.dataset.cat;
      renderPRDashboard();
    };
  });
}

renderPRDashboard();
}
initPRMilestoneDashboard();