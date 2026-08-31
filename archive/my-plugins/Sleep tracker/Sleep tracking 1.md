```dataviewjs
async function initSleepRecoveryWidget() {
try {
// ============================================================================
// 1. DATA ACCESS & CONTEXT
// ============================================================================
const nutritionFilePath = "apps/scripts/soma-nutrition.json";
let nutritionDB = {};
const nFile = app.vault.getAbstractFileByPath(nutritionFilePath);
if (nFile) {
  try { nutritionDB = JSON.parse(await app.vault.read(nFile)); } catch (e) {}
}

const fileName = dv.current()?.file?.name || "";
const dateMatch = fileName.match(/\d{4}-\d{2}-\d{2}/);
const todayKey = dateMatch ? dateMatch[0] : new Date().toISOString().slice(0, 10);

if (!nutritionDB[todayKey]) nutritionDB[todayKey] = {};
if (!nutritionDB[todayKey].recovery) {
  nutritionDB[todayKey].recovery = {
    hours: 7.5,
    quality: 4,      // 1 to 5
    soreness: 2      // 1 (Fresh) to 5 (Sore)
  };
}

async function saveRecoveryData() {
  let file = app.vault.getAbstractFileByPath(nutritionFilePath);
  if (!file) {
    try { await app.vault.create(nutritionFilePath, JSON.stringify(nutritionDB, null, 2)); } catch (e) {}
  } else {
    await app.vault.modify(file, JSON.stringify(nutritionDB, null, 2));
  }
}

// ============================================================================
// 2. RECOVERY & READINESS ENGINE
// ============================================================================
function computeMetrics() {
  const rec = nutritionDB[todayKey].recovery;
  const hours = parseFloat(rec.hours) || 7.5;
  const quality = parseInt(rec.quality) || 4;
  const soreness = parseInt(rec.soreness) || 2;

  const sleepDurationScore = Math.min(100, (hours / 8.0) * 100);
  const qualityScore = (quality / 5.0) * 100;
  const freshnessScore = ((6 - soreness) / 5.0) * 100;

  const totalScore = Math.round(
    (sleepDurationScore * 0.40) + 
    (qualityScore * 0.35) + 
    (freshnessScore * 0.25)
  );

  const estDeepSleepMins = Math.round(hours * 60 * (0.16 + (quality * 0.015)));
  const ghPeakUnits = (hours >= 7.0 && quality >= 4) ? "Optimal (GH Peak)" : "Sub-Optimal";

  const history7d = [];
  const refDate = new Date(todayKey);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const dayRec = nutritionDB[dStr]?.recovery;
    const h = dayRec ? parseFloat(dayRec.hours) || 0 : (i === 0 ? hours : 0);
    history7d.push({ date: dStr, hours: h });
  }

  let badgeText = "";
  let badgeClass = "badge-cyan";
  let targetRirAdvice = "";

  if (totalScore >= 85) {
    badgeText = "CNS PRIMED • RIR 0–1";
    badgeClass = "badge-cyan";
    targetRirAdvice = "Ready for heavy compound PRs & high intensity.";
  } else if (totalScore >= 68) {
    badgeText = "STEADY • RIR 1–2";
    badgeClass = "badge-yellow";
    targetRirAdvice = "Solid baseline. Match targets and maintain clean volume.";
  } else {
    badgeText = "FATIGUED • RIR 3+";
    badgeClass = "badge-purple";
    targetRirAdvice = "High neural strain. Prioritize pump or active recovery.";
  }

  return {
    score: totalScore,
    hours,
    quality,
    soreness,
    estDeepSleepMins,
    ghPeakUnits,
    history7d,
    badgeText,
    badgeClass,
    targetRirAdvice
  };
}

// ============================================================================
// 3. UI RENDERING (ZERO-OVERRIDE CSS WITH STRICT RECTANGLES)
// ============================================================================
const widgetContainer = dv.el("div", "", { cls: "soma-recovery-night-root" });

const style = document.createElement("style");
style.textContent = `
  .soma-recovery-night-root {
    max-width: 660px;
    margin: 0 auto;
    font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif);
    color: #f4f4f5;
    box-sizing: border-box;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
  }
  .rec-night-card {
    background: #110d1a;
    border: 1px solid #281d3d;
    border-radius: 8px;
    padding: 12px 14px;
    box-sizing: border-box;
  }
  .pill-title {
    font-size: 0.74rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #c084fc;
  }
  .badge-cyan {
    background: rgba(56, 189, 248, 0.12);
    border: 1px solid rgba(56, 189, 248, 0.35);
    color: #38bdf8;
  }
  .badge-yellow {
    background: rgba(251, 191, 36, 0.12);
    border: 1px solid rgba(251, 191, 36, 0.35);
    color: #fbbf24;
  }
  .badge-purple {
    background: rgba(192, 132, 252, 0.15);
    border: 1px solid rgba(192, 132, 252, 0.35);
    color: #e879f9;
  }
  .rec-sq-cell {
    touch-action: manipulation;
    cursor: pointer;
    user-select: none;
    background: #191226 !important;
    border: 1px solid #332350 !important;
    border-radius: 4px !important;
    color: #d8b4fe !important;
    font-size: 0.70rem !important;
    font-weight: 700 !important;
    height: 24px !important;
    min-height: 24px !important;
    max-height: 24px !important;
    padding: 0 !important;
    margin: 0 !important;
    display: inline-flex !important;
    align-items: center !important;
    justify-content: center !important;
    box-sizing: border-box !important;
    transition: background 0.1s ease, border-color 0.1s ease;
  }
  .rec-sq-cell:active {
    transform: scale(0.95);
  }
  .rec-sq-cell.active {
    background: #6b21a8 !important;
    border-color: #a855f7 !important;
    color: #ffffff !important;
    font-weight: 800 !important;
  }
  .spark-col {
    height: 20px;
    background: #191226;
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
  }
`;
widgetContainer.appendChild(style);

function renderUI() {
  const { score, hours, quality, soreness, estDeepSleepMins, ghPeakUnits, history7d, badgeText, badgeClass, targetRirAdvice } = computeMetrics();
  const scoreColor = score >= 85 ? "#38bdf8" : score >= 68 ? "#fbbf24" : "#c084fc";

  widgetContainer.innerHTML = `
    <div class="rec-night-card">
      <!-- HEADER -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="pill-title">🌙 Sleep & CNS Recovery</span>
          <span style="font-size:0.62rem; font-weight:800; padding:2px 6px; border-radius:4px;" class="${badgeClass}">
            ${badgeText}
          </span>
        </div>
        <div style="display:flex; align-items:baseline; gap:4px;">
          <span style="font-size:0.92rem; font-weight:900; color:${scoreColor};">${score}%</span>
          <span style="font-size:0.65rem; font-weight:700; color:#a1a1aa;">Readiness</span>
        </div>
      </div>

      <!-- PROGRESS BAR -->
      <div style="height:6px; background:#191226; border-radius:3px; overflow:hidden; border:1px solid #281d3d; margin-bottom:10px;">
        <div style="width:${score}%; height:100%; background:linear-gradient(90deg, #9333ea 0%, #38bdf8 70%, #fbbf24 100%); border-radius:3px; transition:width 0.3s ease;"></div>
      </div>

      <!-- CONTROLS ROW -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap:6px; margin-bottom:9px;">
        
        <!-- Sleep Hours -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#150e21; padding:5px 8px; border-radius:5px; border:1px solid #281d3d;">
          <span style="font-size:0.68rem; color:#a78bfa; font-weight:700;">Duration:</span>
          <div style="display:flex; align-items:center; gap:4px;">
            <div class="rec-sq-cell" id="btn-hrs-minus" style="width:22px;">-</div>
            <span style="font-size:0.75rem; font-weight:800; color:#ffffff; width:30px; text-align:center;">${hours}h</span>
            <div class="rec-sq-cell" id="btn-hrs-plus" style="width:22px;">+</div>
          </div>
        </div>

        <!-- Sleep Quality (1-5) -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#150e21; padding:5px 8px; border-radius:5px; border:1px solid #281d3d;">
          <span style="font-size:0.68rem; color:#a78bfa; font-weight:700;">Quality:</span>
          <div style="display:flex; gap:3px;">
            ${[1, 2, 3, 4, 5].map(q => `
              <div class="rec-sq-cell btn-quality ${quality === q ? 'active' : ''}" data-q="${q}" style="width:20px;">${q}</div>
            `).join('')}
          </div>
        </div>

        <!-- Soreness State -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#150e21; padding:5px 8px; border-radius:5px; border:1px solid #281d3d;">
          <span style="font-size:0.68rem; color:#a78bfa; font-weight:700;">State:</span>
          <div style="display:flex; gap:3px;">
            ${[1, 2, 3, 4, 5].map(s => `
              <div class="rec-sq-cell btn-soreness ${soreness === s ? 'active' : ''}" data-s="${s}" style="width:20px;">${s === 1 ? '1' : s === 5 ? '5' : s}</div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- 7-DAY TREND -->
      <div style="background:#0c0814; border:1px solid #231838; border-radius:5px; padding:6px 9px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <span style="font-size:0.64rem; font-weight:700; color:#94a3b8;">7-Day Sleep Trend</span>
          <span style="font-size:0.64rem; font-weight:700; color:#38bdf8;">~${estDeepSleepMins}m Deep/REM • <b style="color:#fbbf24;">${ghPeakUnits}</b></span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:4px; align-items:end;">
          ${history7d.map((d, idx) => {
            const barHeight = Math.min(100, Math.max(15, (d.hours / 9.0) * 100));
            const isToday = idx === 6;
            return `
              <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
                <div class="spark-col" style="width:100%;">
                  <div style="width:100%; height:${barHeight}\%; background:${isToday ? '#38bdf8' : '#7e22ce'}; border-radius:2px;"></div>
                </div>
                <span style="font-size:0.56rem; font-weight:700; color:${isToday ? '#38bdf8' : '#71717a'};">
                  ${isToday ? 'Today' : d.date.slice(8)}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- CNS DIRECTIVE -->
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-size:0.66rem; color:#a78bfa; font-weight:700;">Directive:</span>
        <span style="font-size:0.66rem; color:#f4f4f5; font-weight:700; text-align:right;">${targetRirAdvice}</span>
      </div>
    </div>
  `;

  // Duration Handlers
  widgetContainer.querySelector("#btn-hrs-minus").onclick = async () => {
    nutritionDB[todayKey].recovery.hours = Math.max(3.0, (parseFloat(nutritionDB[todayKey].recovery.hours) - 0.5));
    await saveRecoveryData();
    renderUI();
  };

  widgetContainer.querySelector("#btn-hrs-plus").onclick = async () => {
    nutritionDB[todayKey].recovery.hours = Math.min(14.0, (parseFloat(nutritionDB[todayKey].recovery.hours) + 0.5));
    await saveRecoveryData();
    renderUI();
  };

  // Quality Handlers
  widgetContainer.querySelectorAll(".btn-quality").forEach(el => {
    el.onclick = async () => {
      nutritionDB[todayKey].recovery.quality = parseInt(el.getAttribute("data-q"));
      await saveRecoveryData();
      renderUI();
    };
  });

  // Soreness Handlers
  widgetContainer.querySelectorAll(".btn-soreness").forEach(el => {
    el.onclick = async () => {
      nutritionDB[todayKey].recovery.soreness = parseInt(el.getAttribute("data-s"));
      await saveRecoveryData();
      renderUI();
    };
  });
}

renderUI();

} catch (err) {
  dv.paragraph("Recovery Widget Error: " + err.message);
}
}
initSleepRecoveryWidget();