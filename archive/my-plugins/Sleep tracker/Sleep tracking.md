```dataviewjs
async function initSleepRecoveryWidget() {
try {
// ============================================================================
// 1. DATA ACCESS & CONTEXT (Self-contained in soma-nutrition.json)
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
    soreness: 2,     // 1 (Fresh) to 5 (Sore)
    bedtime: "23:30",
    wakeTime: "07:00"
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
// 2. RECOVERY & PHYSIOLOGICAL READINESS ENGINE
// ============================================================================
function computeMetrics() {
  const rec = nutritionDB[todayKey].recovery;
  const hours = parseFloat(rec.hours) || 7.5;
  const quality = parseInt(rec.quality) || 4;
  const soreness = parseInt(rec.soreness) || 2;

  // 1. Weighted Readiness Scoring (Duration 40%, Quality 35%, Freshness 25%)
  const sleepDurationScore = Math.min(100, (hours / 8.0) * 100);
  const qualityScore = (quality / 5.0) * 100;
  const freshnessScore = ((6 - soreness) / 5.0) * 100;

  const totalScore = Math.round(
    (sleepDurationScore * 0.40) + 
    (qualityScore * 0.35) + 
    (freshnessScore * 0.25)
  );

  // 2. Anabolic Deep/REM Sleep & Growth Hormone Pulse Estimator
  const estDeepSleepMins = Math.round(hours * 60 * (0.16 + (quality * 0.015)));
  const ghPeakUnits = (hours >= 7.0 && quality >= 4) ? "Optimal (Peak Nocturnal GH)" : "Sub-Optimal Pulse";

  // 3. 7-Day Sleep History Sparkline Array
  const history7d = [];
  const refDate = new Date(todayKey);
  for (let i = 6; i >= 0; i--) {
    const d = new Date(refDate);
    d.setDate(d.getDate() - i);
    const dStr = d.toISOString().slice(0, 10);
    const dayRec = nutritionDB[dStr]?.recovery;
    const h = dayRec ? parseFloat(dayRec.hours) || 0 : (i === 0 ? hours : 0);
    const q = dayRec ? parseInt(dayRec.quality) || 3 : (i === 0 ? quality : 3);
    history7d.push({ date: dStr, hours: h, quality: q });
  }

  // 4. CNS Target Load Classification
  let badgeText = "";
  let badgeClass = "badge-emerald";
  let targetRirAdvice = "";

  if (totalScore >= 85) {
    badgeText = "CNS PRIMED • RIR 0–1";
    badgeClass = "badge-cyan";
    targetRirAdvice = "Ready for heavy compound PRs & peak intensity sets.";
  } else if (totalScore >= 68) {
    badgeText = "STEADY • RIR 1–2";
    badgeClass = "badge-yellow";
    targetRirAdvice = "Solid baseline. Match targets and maintain clean volume.";
  } else {
    badgeText = "FATIGUED • RIR 3+";
    badgeClass = "badge-purple";
    targetRirAdvice = "High neural strain. Prioritize pump/accessories or active recovery.";
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
// 3. PURPLE-NEON NIGHT THEME & DOCK RENDERER
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
    background: linear-gradient(180deg, #130f1e 0%, #0d0a15 100%);
    border: 1px solid #2e2448;
    box-shadow: 0 4px 20px rgba(10, 6, 20, 0.4), inset 0 1px 0 rgba(168, 85, 247, 0.1);
    border-radius: 12px;
    padding: 13px 15px;
    position: relative;
    overflow: hidden;
  }
  .rec-night-card::before {
    content: '';
    position: absolute;
    top: 0; left: 10%; right: 10%; height: 1px;
    background: linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.4), rgba(56, 189, 248, 0.4), transparent);
  }
  .pill-title {
    font-size: 0.73rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #c084fc;
    display: flex;
    align-items: center;
    gap: 6px;
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
  .rec-pill-btn {
    touch-action: manipulation;
    cursor: pointer;
    user-select: none;
    background: #1c152e;
    border: 1px solid #362955;
    color: #d8b4fe;
    font-size: 0.68rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    transition: all 0.12s ease;
  }
  .rec-pill-btn:active {
    transform: scale(0.94);
  }
  .rec-pill-btn:hover {
    background: #271d42;
    border-color: #a855f7;
    color: #ffffff;
  }
  .rec-pill-btn.active {
    background: linear-gradient(135deg, #7e22ce 0%, #6b21a8 100%);
    border-color: #c084fc;
    color: #ffffff;
    font-weight: 800;
    box-shadow: 0 0 8px rgba(168, 85, 247, 0.35);
  }
  .sparkline-bar {
    width: 100%;
    background: #251b3d;
    border-radius: 3px;
    position: relative;
    overflow: hidden;
    height: 20px;
    display: flex;
    align-items: flex-end;
  }
  .sparkline-fill {
    width: 100%;
    border-radius: 3px;
    transition: height 0.3s ease;
  }
`;
widgetContainer.appendChild(style);

function renderUI() {
  const { score, hours, quality, soreness, estDeepSleepMins, ghPeakUnits, history7d, badgeText, badgeClass, targetRirAdvice } = computeMetrics();

  // Color palette for gauge & score
  const scoreColor = score >= 85 ? "#38bdf8" : score >= 68 ? "#fbbf24" : "#c084fc";

  widgetContainer.innerHTML = `
    <div class="rec-night-card">
      <!-- TOP DOCK HEADER -->
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="pill-title">🌙 Sleep & CNS Recovery</span>
          <span style="font-size:0.64rem; font-weight:800; padding:1px 7px; border-radius:4px; letter-spacing:0.02em;" class="${badgeClass}">
            ${badgeText}
          </span>
        </div>
        <div style="display:flex; align-items:baseline; gap:3px;">
          <span style="font-size:0.95rem; font-weight:900; color:${scoreColor};">${score}%</span>
          <span style="font-size:0.67rem; font-weight:700; color:#a1a1aa;">Readiness</span>
        </div>
      </div>

      <!-- GRADIENT GLOW READINESS BAR -->
      <div style="height:7px; background:#181126; border-radius:999px; overflow:hidden; border:1px solid #31234f; margin-bottom:11px;">
        <div style="width:${score}%; height:100%; background:linear-gradient(90deg, #a855f7 0%, #38bdf8 70%, #fbbf24 100%); border-radius:999px; box-shadow:0 0 10px rgba(56, 189, 248, 0.4); transition:width 0.4s ease;"></div>
      </div>

      <!-- 3-WAY INTERACTIVE CONTROLS DOCK -->
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap:7px; margin-bottom:10px;">
        
        <!-- Sleep Hours Stepper -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#161026; padding:4px 8px; border-radius:7px; border:1px solid #2d204d;">
          <span style="font-size:0.67rem; color:#a78bfa; font-weight:700;">Duration:</span>
          <div style="display:flex; align-items:center; gap:5px;">
            <button class="rec-pill-btn" id="btn-hrs-minus" style="padding:1px 6px;">-</button>
            <span style="font-size:0.75rem; font-weight:800; color:#ffffff; min-width:32px; text-align:center;">${hours}h</span>
            <button class="rec-pill-btn" id="btn-hrs-plus" style="padding:1px 6px;">+</button>
          </div>
        </div>

        <!-- Sleep Quality Selector -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#161026; padding:4px 8px; border-radius:7px; border:1px solid #2d204d;">
          <span style="font-size:0.67rem; color:#a78bfa; font-weight:700;">Quality:</span>
          <div style="display:flex; gap:3px;">
            ${[1, 2, 3, 4, 5].map(q => `
              <button class="rec-pill-btn btn-quality ${quality === q ? 'active' : ''}" data-q="${q}" style="padding:2px 5px; font-size:0.65rem;">${q}★</button>
            `).join('')}
          </div>
        </div>

        <!-- Muscle Freshness Level -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#161026; padding:4px 8px; border-radius:7px; border:1px solid #2d204d;">
          <span style="font-size:0.67rem; color:#a78bfa; font-weight:700;">State:</span>
          <div style="display:flex; gap:3px;">
            ${[1, 2, 3, 4, 5].map(s => `
              <button class="rec-pill-btn btn-soreness ${soreness === s ? 'active' : ''}" data-s="${s}" style="padding:2px 5px; font-size:0.65rem;">
                ${s === 1 ? 'Fresh' : s === 5 ? 'Sore' : s}
              </button>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- 7-DAY SLEEP TREND SPARKLINE & ANABOLIC STATS -->
      <div style="background:#0f0b1a; border:1px solid #24193d; border-radius:8px; padding:7px 9px; margin-bottom:9px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
          <span style="font-size:0.65rem; font-weight:700; color:#94a3b8;">7-Day Sleep Trend</span>
          <span style="font-size:0.65rem; font-weight:700; color:#38bdf8;">~${estDeepSleepMins}m Deep/REM • <b style="color:#fbbf24;">${ghPeakUnits}</b></span>
        </div>
        <div style="display:grid; grid-template-columns: repeat(7, 1fr); gap:4px; align-items:end;">
          ${history7d.map((d, idx) => {
            const barHeight = Math.min(100, Math.max(15, (d.hours / 9.0) * 100));
            const isToday = idx === 6;
            const barFillColor = isToday 
              ? "linear-gradient(180deg, #38bdf8 0%, #7e22ce 100%)" 
              : d.hours >= 7.0 
              ? "linear-gradient(180deg, #c084fc 0%, #4c1d95 100%)" 
              : "#2a1e45";
            return `
              <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
                <div class="sparkline-bar" title="${d.date}:${d.hours} hrs">
                  <div class="sparkline-fill" style="height:${barHeight}\%; background:${barFillColor};"></div>
                </div>
                <span style="font-size:0.58rem; font-weight:700; color:${isToday ? '#38bdf8' : '#71717a'};">
                  ${isToday ? 'Today' : d.date.slice(8)}
                </span>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- WORKOUT CNS GUIDANCE STRIP -->
      <div style="display:flex; justify-content:space-between; align-items:center; padding-top:2px;">
        <span style="font-size:0.67rem; color:#a78bfa; font-weight:700;">Lifting Directive:</span>
        <span style="font-size:0.67rem; color:#f4f4f5; font-weight:700; text-align:right;">${targetRirAdvice}</span>
      </div>
    </div>
  `;

  // Duration handlers
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

  // Quality handlers
  widgetContainer.querySelectorAll(".btn-quality").forEach(btn => {
    btn.onclick = async () => {
      nutritionDB[todayKey].recovery.quality = parseInt(btn.getAttribute("data-q"));
      await saveRecoveryData();
      renderUI();
    };
  });

  // Soreness handlers
  widgetContainer.querySelectorAll(".btn-soreness").forEach(btn => {
    btn.onclick = async () => {
      nutritionDB[todayKey].recovery.soreness = parseInt(btn.getAttribute("data-s"));
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