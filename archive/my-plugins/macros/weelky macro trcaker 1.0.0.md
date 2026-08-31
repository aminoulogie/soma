```dataviewjs
async function initWeeklyMacroDashboard() {
try {
// ============================================================================
// 1. DATA SOURCE & SAFE DATE EXTRACTION
// ============================================================================
const nutritionFilePath = "apps/scripts/soma-nutrition.json";
const historyFilePath = "apps/scripts/soma-history.json";

// Safe extraction from file name or fallback to current date
const fileName = dv.current()?.file?.name || "";
const dateMatch = fileName.match(/\d{4}-\d{2}-\d{2}/);
const baseDate = dateMatch ? new Date(dateMatch[0]) : new Date();
const refDate = isNaN(baseDate.getTime()) ? new Date() : baseDate;

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

const defaultGoals = { cals: 2400, protein: 160, carbs: 260, fat: 70, water: 3500 };
const fallbackGoalCals = nutritionDB.__defaultGoals?.cals || defaultGoals.cals;

// ============================================================================
// 2. 7-DAY ROLLING METRICS, BANKING & STREAKS
// ============================================================================
const days = [];
let totalWeekCals = 0;
let totalWeekP = 0;
let totalWeekF = 0;
let totalWeekC = 0;
let totalWeekWater = 0;
let totalWeekBurn = 0;
let totalWeekTarget = 0;
let loggedCount = 0;

for (let i = 6; i >= 0; i--) {
  const d = new Date(refDate);
  d.setDate(d.getDate() - i);
  const dStr = d.toISOString().slice(0, 10);
  const entry = nutritionDB[dStr];
  const workout = historyDB[dStr] || {};

  const goal = (entry && entry.goals) ? entry.goals.cals : fallbackGoalCals;
  const burn = workout.caloriesBurned || 0;
  const maintenance = goal + burn;
  const waterLogged = entry?.water || 0;

  let cals = 0, p = 0, f = 0, c = 0;
  let hasData = false;

  if (entry && entry.items && entry.items.length > 0) {
    hasData = true;
    loggedCount++;
    entry.items.forEach(it => {
      cals += (it.cals || 0);
      p += (it.p || 0);
      f += (it.f || 0);
      c += (it.c || 0);
    });
  }

  const diff = hasData ? (cals - maintenance) : 0;

  totalWeekCals += cals;
  totalWeekP += p;
  totalWeekF += f;
  totalWeekC += c;
  totalWeekWater += waterLogged;
  totalWeekBurn += burn;
  totalWeekTarget += maintenance;

  days.push({
    dateStr: dStr,
    dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
    cals: Math.round(cals),
    p: Math.round(p),
    f: Math.round(f),
    c: Math.round(c),
    water: Math.round(waterLogged),
    burn: Math.round(burn),
    target: maintenance,
    diff: Math.round(diff),
    hasData
  });
}

// Streaks calculation (up to 90 days back)
let logStreak = 0;
let goalStreak = 0;
let checkDate = new Date(refDate);

for (let s = 0; s < 90; s++) {
  const dStr = checkDate.toISOString().slice(0, 10);
  const entry = nutritionDB[dStr];
  if (entry && entry.items && entry.items.length > 0) {
    logStreak++;
    const totC = entry.items.reduce((acc, it) => acc + (it.cals || 0), 0);
    const tgt = (entry.goals ? entry.goals.cals : defaultGoals.cals) + ((historyDB[dStr]?.caloriesBurned) || 0);
    if (Math.abs(totC - tgt) <= tgt * 0.08 || (totC <= tgt && totC >= tgt * 0.85)) {
      goalStreak++;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    break;
  }
}

const netBank = days.reduce((sum, d) => sum + d.diff, 0);
const avgDailyIntake = loggedCount > 0 ? Math.round(totalWeekCals / loggedCount) : 0;
const avgDailyP = loggedCount > 0 ? Math.round(totalWeekP / loggedCount) : 0;
const avgDailyF = loggedCount > 0 ? Math.round(totalWeekF / loggedCount) : 0;
const avgDailyC = loggedCount > 0 ? Math.round(totalWeekC / loggedCount) : 0;
const avgDailyWater = loggedCount > 0 ? Math.round(totalWeekWater / loggedCount) : 0;

// Macro energy distribution %
const pCal = totalWeekP * 4;
const fCal = totalWeekF * 9;
const cCal = totalWeekC * 4;
const totalMacroCals = pCal + fCal + cCal;

const pRatio = totalMacroCals > 0 ? Math.round((pCal / totalMacroCals) * 100) : 30;
const fRatio = totalMacroCals > 0 ? Math.round((fCal / totalMacroCals) * 100) : 25;
const cRatio = totalMacroCals > 0 ? Math.max(0, 100 - pRatio - fRatio) : 45;

const circumference = 2 * Math.PI * 26;
const pDash = (pRatio / 100) * circumference;
const fDash = (fRatio / 100) * circumference;
const cDash = (cRatio / 100) * circumference;

const pOffset = 0;
const fOffset = -pDash;
const cOffset = -(pDash + fDash);

// Visual Intake vs Target Bars
const maxScale = Math.max(...days.map(d => Math.max(d.cals, d.target)), 2800);
const sparkBarsHtml = days.map(d => {
  const heightPct = Math.max(8, Math.min(100, Math.round((d.cals / maxScale) * 100)));
  const barColor = d.hasData ? (d.diff > 150 ? '#ef4444' : d.diff < -150 ? '#38bdf8' : '#10b981') : '#27272a';
  return `
    <div style="flex:1; display:flex; flex-direction:column; align-items:center; height:100%; justify-content:flex-end;" title="${d.dateStr}: ${d.cals} / ${d.target} kcal (${d.diff >= 0 ? '+' : ''}${d.diff})">
      <div style="width:100%; max-width:24px; height:${heightPct}%; background:${barColor}; border-radius:4px 4px 0 0;"></div>
      <div style="font-size:0.68rem; font-weight:800; color:#a1a1aa; margin-top:4px;">${d.dayName}</div>
      <div style="font-size:0.62rem; font-weight:700; color:${!d.hasData ? '#52525b' : d.diff >= 0 ? '#fca5a5' : '#7dd3fc'};">${d.hasData ? (d.diff >= 0 ? '+' : '') + d.diff : '-'}</div>
    </div>
  `;
}).join("");

const breakdownRowsHtml = days.map(d => `
  <div style="display:grid; grid-template-columns: 1.2fr 1.2fr 1fr 1fr 1fr 1fr 1.2fr; padding:7px 10px; border-bottom:1px solid #222226; font-size:0.75rem; font-weight:700; align-items:center;">
    <div><b style="color:#fff;">${d.dayName}</b> <span style="color:#71717a; font-size:0.68rem;">${d.dateStr.slice(5)}</span></div>
    <div style="color:${d.hasData ? '#f59e0b' : '#52525b'}; font-weight:800;">${d.hasData ? d.cals + ' kcal' : '—'}</div>
    <div style="color:#10b981;">${d.hasData ? d.p + 'g' : '—'}</div>
    <div style="color:#ef4444;">${d.hasData ? d.f + 'g' : '—'}</div>
    <div style="color:#0ea5e9;">${d.hasData ? d.c + 'g' : '—'}</div>
    <div style="color:#38bdf8;">${d.hasData && d.water > 0 ? d.water + 'ml' : '—'}</div>
    <div style="font-weight:800; color:${!d.hasData ? '#52525b' : d.diff > 0 ? '#ef4444' : '#10b981'}; text-align:right;">
      ${d.hasData ? (d.diff >= 0 ? '+' : '') + d.diff + ' kcal' : '—'}
    </div>
  </div>
`).join("");

// ============================================================================
// 3. RENDER CONTAINER
// ============================================================================
const root = dv.el("div", "", { cls: "wk-macro-analytics-root" });

const style = document.createElement("style");
style.textContent = `
  .wk-macro-analytics-root { max-width: 680px; margin: 0 auto; font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif); color: #f4f4f5; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box; }
  .wk-card { background: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 14px; box-sizing: border-box; }
  .wk-top-pills { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  .wk-pill { font-size: 0.74rem; font-weight: 800; padding: 3px 8px; border-radius: 6px; display: inline-flex; align-items: center; gap: 4px; }
  .wk-stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px; }
  .wk-stat-box { background: #202023; border: 1px solid #2e2e32; border-radius: 8px; padding: 10px; text-align: center; }
  .wk-stat-lbl { font-size: 0.65rem; font-weight: 800; color: #71717a; text-transform: uppercase; }
  .wk-stat-val { font-size: 1.05rem; font-weight: 800; margin-top: 3px; }
  .wk-avg-pills { display: flex; justify-content: space-between; background: #202023; border: 1px solid #2e2e32; border-radius: 8px; padding: 8px 12px; margin-bottom: 12px; font-size: 0.75rem; font-weight: 800; }
`;
root.appendChild(style);

root.createDiv().innerHTML = `
  <div class="wk-card">
    <div class="wk-top-pills">
      <div style="display:flex; gap:8px; align-items:center;">
        <span style="font-weight:800; font-size:0.95rem; color:#ffffff;">📊 7-Day Nutrition & Banking Review</span>
        <span class="wk-pill" style="background:#27272a; color:#a1a1aa;">${days[0].dateStr} → ${days[6].dateStr}</span>
      </div>
      <div style="display:flex; gap:6px;">
        <span class="wk-pill" style="background:rgba(245, 158, 11, 0.15); border:1px solid rgba(245, 158, 11, 0.35); color:#f59e0b;">🔥 ${logStreak}d Logging Streak</span>
        <span class="wk-pill" style="background:rgba(16, 185, 129, 0.15); border:1px solid rgba(16, 185, 129, 0.35); color:#34d399;">🎯 ${goalStreak}d Target Streak</span>
      </div>
    </div>

    <div class="wk-stat-grid">
      <div class="wk-stat-box">
        <div class="wk-stat-lbl">7-Day Avg Intake</div>
        <div class="wk-stat-val" style="color:#f59e0b;">${avgDailyIntake} kcal</div>
      </div>
      <div class="wk-stat-box">
        <div class="wk-stat-lbl">Net Calorie Bank</div>
        <div class="wk-stat-val" style="color:${netBank > 0 ? '#ef4444' : '#10b981'};">${netBank >= 0 ? '+' : ''}${netBank} kcal</div>
      </div>
      <div class="wk-stat-box">
        <div class="wk-stat-lbl">Weekly Status</div>
        <div class="wk-stat-val" style="color:#38bdf8;">${netBank > 350 ? 'Surplus (+)' : netBank < -350 ? 'Deficit (-)' : 'Maintenance'}</div>
      </div>
    </div>

    <!-- DAILY AVERAGE MACROS STRIP -->
    <div class="wk-avg-pills">
      <span style="color:#a1a1aa;">Daily Averages:</span>
      <span style="color:#10b981;">Protein: ${avgDailyP}g</span>
      <span style="color:#ef4444;">Fat: ${avgDailyF}g</span>
      <span style="color:#0ea5e9;">Carbs: ${avgDailyC}g</span>
      <span style="color:#38bdf8;">Water: ${avgDailyWater}ml</span>
    </div>

    <!-- 7-DAY INTAKE TRENDLINE BARS -->
    <div style="background:#202023; border:1px solid #2e2e32; border-radius:8px; padding:12px; margin-bottom:12px;">
      <div style="font-size:0.68rem; font-weight:800; color:#a1a1aa; text-transform:uppercase; margin-bottom:6px;">7-Day Intake Trend vs Daily Baseline (+ Delta)</div>
      <div style="display:flex; justify-content:space-between; align-items:flex-end; height:75px; gap:8px;">${sparkBarsHtml}</div>
    </div>

    <!-- 7-DAY MACRO ENERGY RATIO DONUT -->
    <div style="display:flex; align-items:center; justify-content:space-around; background:#202023; border:1px solid #2e2e32; border-radius:8px; padding:12px; margin-bottom:12px;">
      <div style="position:relative; width:68px; height:68px; display:flex; align-items:center; justify-content:center;">
        <svg width="68" height="68" viewBox="0 0 64 64" style="transform: rotate(-90deg);">
          <circle cx="32" cy="32" r="26" fill="none" stroke="#27272a" stroke-width="7" />
          <circle cx="32" cy="32" r="26" fill="none" stroke="#10b981" stroke-width="7" stroke-dasharray="${pDash} ${circumference}" stroke-dashoffset="${pOffset}" />
          <circle cx="32" cy="32" r="24" fill="none" stroke="#ef4444" stroke-width="7" stroke-dasharray="${fDash} ${circumference}" stroke-dashoffset="${fOffset}" />
          <circle cx="32" cy="32" r="24" fill="none" stroke="#0ea5e9" stroke-width="7" stroke-dasharray="${cDash} ${circumference}" stroke-dashoffset="${cOffset}" />
        </svg>
        <div style="position:absolute; font-size:0.65rem; font-weight:800; color:#fff;">7D Ratio</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:5px; font-size:0.75rem; font-weight:700;">
        <div><span style="display:inline-block; width:8px; height:8px; border-radius:999px; background:#10b981;"></span> Protein: <b style="color:#fff;">${pRatio}%</b> (${Math.round(totalWeekP)}g total)</div>
        <div><span style="display:inline-block; width:8px; height:8px; border-radius:999px; background:#ef4444;"></span> Fat: <b style="color:#fff;">${fRatio}%</b> (${Math.round(totalWeekF)}g total)</div>
        <div><span style="display:inline-block; width:8px; height:8px; border-radius:999px; background:#0ea5e9;"></span> Carbs: <b style="color:#fff;">${cRatio}%</b> (${Math.round(totalWeekC)}g total)</div>
      </div>
    </div>

    <!-- DAILY BREAKDOWN LOG TABLE -->
    <div style="background:#202023; border:1px solid #2e2e32; border-radius:8px; overflow:hidden;">
      <div style="display:grid; grid-template-columns: 1.2fr 1.2fr 1fr 1fr 1fr 1fr 1.2fr; padding:7px 10px; background:#18181b; border-bottom:1px solid #27272a; font-size:0.7rem; font-weight:800; color:#a1a1aa;">
        <div>Day</div>
        <div>Calories</div>
        <div>Protein</div>
        <div>Fat</div>
        <div>Carbs</div>
        <div>Water</div>
        <div style="text-align:right;">Bank Delta</div>
      </div>
      <div>${breakdownRowsHtml}</div>
    </div>
  </div>
`;

} catch (err) {
  dv.paragraph("❌ **Weekly Macro Tracker Error:** " + err.message);
}
}
initWeeklyMacroDashboard();