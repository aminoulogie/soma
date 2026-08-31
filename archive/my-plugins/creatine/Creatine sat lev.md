```dataviewjs
// Creatine Saturation Engine & Widget
const historyFilePath = "apps/scripts/soma-nutrition.json";
let nutritionDB = {};
const nFile = app.vault.getAbstractFileByPath(historyFilePath);
if (nFile) {
  try { nutritionDB = JSON.parse(await app.vault.read(nFile)); } catch (e) {}
}

const fileName = dv.current()?.file?.name || "";
const dateMatch = fileName.match(/\d{4}-\d{2}-\d{2}/);
const todayKey = dateMatch ? dateMatch[0] : new Date().toISOString().slice(0, 10);

if (!nutritionDB[todayKey]) nutritionDB[todayKey] = { creatine: 0 };
if (nutritionDB[todayKey].creatine === undefined) nutritionDB[todayKey].creatine = 0;

// Simulate saturation across past 30 days
let saturation = 60.0; // Baseline non-supplemented %
let streak = 0;

const refDate = new Date(todayKey);
for (let i = 30; i >= 0; i--) {
  const d = new Date(refDate);
  d.setDate(d.getDate() - i);
  const dStr = d.toISOString().slice(0, 10);
  const dose = (nutritionDB[dStr]?.creatine) || 0;

  if (dose > 0) {
    streak++;
    // Accumulation: +1.8% per 5g dose, tapering asymptotically as it hits 100%
    const gain = (dose / 5.0) * (100 - saturation) * 0.08;
    saturation = Math.min(100, saturation + Math.max(1.2, gain));
  } else {
    streak = 0;
    // Decay: loss of ~1.5% of total per day without intake down to 60%
    if (saturation > 60.0) {
      saturation = Math.max(60.0, saturation - (saturation * 0.016));
    }
  }
}

const currentSat = Math.round(saturation);
const todayDose = nutritionDB[todayKey].creatine || 0;

// Color grading based on saturation tier
const satColor = currentSat >= 90 ? "#10b981" : currentSat >= 75 ? "#38bdf8" : "#f59e0b";
const statusText = currentSat >= 92 
  ? "Optimal Saturation • Peak ATP & Cell Swelling" 
  : currentSat >= 75 
  ? "Accumulating • Steady Glycogen Support" 
  : "Below Optimal • Daily Intake Recommended";

const root = dv.el("div", "");
root.innerHTML = `
  <div style="background:#141417; border:1px solid #27272a; border-radius:10px; padding:12px 14px; font-family:var(--font-interface, sans-serif); color:#f4f4f5; margin-bottom:8px;">
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
      <span style="font-size:0.75rem; font-weight:800; color:#a1a1aa; text-transform:uppercase; letter-spacing:0.04em;">⚡ Creatine Intracellular Saturation</span>
      <span style="font-size:0.78rem; font-weight:800; color:${satColor};">${currentSat}% • ${currentSat >= 90 ? 'Saturated' : 'Loading'}</span>
    </div>
    <div style="height:6px; background:#202023; border-radius:999px; overflow:hidden; border:1px solid #27272a;">
      <div style="width:${currentSat}%; height:100%; background:${satColor}; border-radius:999px; transition:width 0.4s ease;"></div>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; flex-wrap:wrap; gap:6px;">
      <span style="font-size:0.68rem; color:#71717a; font-weight:700;">${statusText} ${streak > 0 ? `(${streak}d streak)` : ''}</span>
      <div style="display:flex; gap:6px; align-items:center;">
        <span style="font-size:0.7rem; font-weight:800; color:#d4d4d8;">Today: <b>${todayDose}g</b></span>
        <button id="cr-add-5g" style="background:#1e293b; border:1px solid #38bdf8; color:#bae6fd; font-size:0.68rem; font-weight:800; padding:3px 8px; border-radius:5px; cursor:pointer;">+5g</button>
        <button id="cr-reset" style="background:#18181b; border:1px solid #27272a; color:#71717a; font-size:0.68rem; padding:3px 6px; border-radius:5px; cursor:pointer;">↺</button>
      </div>
    </div>
  </div>
`;

root.querySelector("#cr-add-5g").onclick = async () => {
  nutritionDB[todayKey].creatine = (nutritionDB[todayKey].creatine || 0) + 5;
  if (nFile) await app.vault.modify(nFile, JSON.stringify(nutritionDB, null, 2));
};

root.querySelector("#cr-reset").onclick = async () => {
  nutritionDB[todayKey].creatine = 0;
  if (nFile) await app.vault.modify(nFile, JSON.stringify(nutritionDB, null, 2));
};