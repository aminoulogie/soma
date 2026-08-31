```dataviewjs
// ============================================================================
// 1. DATA ACCESS & CONTEXT (soma-nutrition.json)
// ============================================================================
const nutritionFilePath = "apps/scripts/soma-nutrition.json";
let nutritionDB = {};
const nFile = app.vault.getAbstractFileByPath(nutritionFilePath);
if (nFile) {
  try { nutritionDB = JSON.parse(await app.vault.read(nFile)); } catch (e) { nutritionDB = {}; }
}

const fileName = dv.current()?.file?.name || "";
const dateMatch = fileName.match(/\d{4}-\d{2}-\d{2}/);
const todayKey = dateMatch ? dateMatch[0] : new Date().toISOString().slice(0, 10);

if (!nutritionDB[todayKey]) nutritionDB[todayKey] = {};
if (!nutritionDB[todayKey].recovery) {
  nutritionDB[todayKey].recovery = {
    hours: 7.5,
    quality: 4,      // 1-5
    soreness: 2,     // 1-5
    supps: { mg: true, gly: false, mel: false, zn: true }
  };
}
if (!nutritionDB[todayKey].recovery.supps) {
  nutritionDB[todayKey].recovery.supps = { mg: true, gly: false, mel: false, zn: true };
}

async function saveDB() {
  let file = app.vault.getAbstractFileByPath(nutritionFilePath);
  const dataStr = JSON.stringify(nutritionDB, null, 2);
  if (!file) { try { await app.vault.create(nutritionFilePath, dataStr); } catch (e) {} }
  else { await app.vault.modify(file, dataStr); }
}

// ============================================================================
// 2. ROOT CONTAINER & NATIVE DASHBOARD STYLING
// ============================================================================
const root = dv.el("div", "", { cls: "soma-recovery-suite-container" });
const style = document.createElement("style");
style.textContent = `
  .soma-recovery-suite-container {
    max-width: 660px;
    margin: 0 auto;
    font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif);
    color: #f4f4f5;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
    user-select: none;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  /* Primary Module Card */
  .soma-native-card {
    background: #141417;
    border: 1px solid #27272a;
    border-radius: 12px;
    padding: 12px 14px;
    box-sizing: border-box;
  }

  /* Metric Breakdown Boxes (1:1 with Macro Cards) */
  .soma-metric-box {
    background: #18181c;
    border-radius: 8px;
    padding: 9px 10px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 86px;
    touch-action: manipulation;
    cursor: pointer;
    transition: transform 0.08s ease, background 0.12s ease;
  }
  .soma-metric-box:active { transform: scale(0.97); }
  
  .box-c-purple { border: 1.5px solid #a855f7; }
  .box-c-blue   { border: 1.5px solid #38bdf8; }
  .box-c-yellow { border: 1.5px solid #fbbf24; }
  .box-c-red    { border: 1.5px solid #ef4444; }

  .soma-track-bg {
    height: 4px;
    background: #27272a;
    border-radius: 999px;
    overflow: hidden;
    margin-top: 6px;
  }

  /* Rounded Action Buttons (Hydration / Target Button Style) */
  .soma-action-btn {
    cursor: pointer;
    touch-action: manipulation;
    background: #1c1c21;
    border: 1px solid #2e2e33;
    border-radius: 8px;
    font-size: 0.72rem;
    font-weight: 700;
    color: #d4d4d8;
    padding: 8px 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    flex: 1;
    transition: background 0.12s ease, border-color 0.12s ease, color 0.12s ease;
  }
  .soma-action-btn:active { transform: scale(0.96); }
  .soma-action-btn.active {
    background: #251638;
    border-color: #c084fc;
    color: #ffffff;
    font-weight: 800;
    box-shadow: 0 0 10px rgba(192, 132, 252, 0.2);
  }

  .soma-spark-bar {
    height: 28px;
    background: #1c1c21;
    border-radius: 2px;
    overflow: hidden;
    display: flex;
    align-items: flex-end;
  }
`;
root.appendChild(style);

// ============================================================================
// 3. RENDER FUNCTION
// ============================================================================
function render() {
  const r = nutritionDB[todayKey].recovery;
  const hours = parseFloat(r.hours) || 7.5;
  const quality = parseInt(r.quality) || 4;
  const soreness = parseInt(r.soreness) || 2;
  const supps = r.supps || { mg: true, gly: false, mel: false, zn: true };

  // Core Math
  const hoursPct = Math.min(100, Math.round((hours / 8.0) * 100));
  const qualityPct = Math.min(100, Math.round((quality / 5.0) * 100));
  const freshnessScore = Math.round(((6 - soreness) / 5.0) * 100);

  const totalReadiness = Math.round(
    (hoursPct * 0.40) + 
    (qualityPct * 0.35) + 
    (freshnessScore * 0.25)
  );

  const hoursLeft = +(8.0 - hours).toFixed(1);
  const hoursLeftText = hoursLeft > 0 ? `${hoursLeft}h left` : "Goal met";
  const qualityLeft = 5 - quality;
  const qualityLeftText = qualityLeft > 0 ? `${qualityLeft} left` : "Optimal";

  const qualityLabels = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Deep", 5: "Pristine" };
  const sorenessLabels = { 1: "Fresh", 2: "Mild", 3: "Mod", 4: "High", 5: "Severe" };

  // 14-Day Rolling History
  const history14d = [];
  let total7d = 0;
  const ref = new Date(todayKey);

  for (let i = 13; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    const dKey = d.toISOString().slice(0, 10);
    const pastH = nutritionDB[dKey]?.recovery ? parseFloat(nutritionDB[dKey].recovery.hours) || 0 : (i === 0 ? hours : 0);
    if (i < 7) total7d += pastH;
    history14d.push({ date: dKey, hours: pastH });
  }

  const sleepDebt = +(56.0 - total7d).toFixed(1);
  const debtColor = sleepDebt > 3 ? "#ef4444" : sleepDebt > 0 ? "#fbbf24" : "#10b981";

  root.innerHTML = `
    <!-- ================================================================= -->
    <!-- SECTION 1: RECOVERY BREAKDOWN (MATCHES MACROS BREAKDOWN 1:1)       -->
    <!-- ================================================================= -->
    <div class="soma-native-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.75rem;">📊</span>
          <span style="font-size:0.75rem; font-weight:800; color:#ffffff; text-transform:uppercase; letter-spacing:0.04em;">RECOVERY BREAKDOWN</span>
        </div>
        <span style="font-size:0.75rem; font-weight:800; color:#a1a1aa;">
          ${totalReadiness}% Readiness ⌄
        </span>
      </div>

      <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:6px; margin-bottom:10px;">
        
        <!-- BOX 1: READINESS -->
        <div class="soma-metric-box box-c-purple">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <span style="font-size:0.60rem; font-weight:800; color:#c084fc; text-transform:uppercase;">READINESS</span>
              <span style="font-size:0.58rem; font-weight:800; color:#c084fc;">${totalReadiness}%</span>
            </div>
            <div style="font-size:0.95rem; font-weight:900; color:#ffffff; margin-top:2px;">
              ${totalReadiness} <span style="font-size:0.62rem; font-weight:700; color:#a1a1aa;">pts</span>
            </div>
            <div style="font-size:0.58rem; font-weight:700; color:#c084fc; margin-top:1px;">
              ${totalReadiness >= 82 ? 'Primed' : totalReadiness >= 65 ? 'Steady' : 'Fatigued'}
            </div>
          </div>
          <div class="soma-track-bg">
            <div style="width:${totalReadiness}%; height:100%; background:#c084fc;"></div>
          </div>
        </div>

        <!-- BOX 2: SLEEP HOURS -->
        <div class="soma-metric-box box-c-blue" id="tap-hours" title="Tap +0.5h">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <span style="font-size:0.60rem; font-weight:800; color:#38bdf8; text-transform:uppercase;">SLEEP</span>
              <span style="font-size:0.58rem; font-weight:800; color:#38bdf8;">${hoursPct}%</span>
            </div>
            <div style="font-size:0.95rem; font-weight:900; color:#ffffff; margin-top:2px;">
              ${hours}<span style="font-size:0.62rem; font-weight:700; color:#a1a1aa;">/8h</span>
            </div>
            <div style="font-size:0.58rem; font-weight:700; color:#38bdf8; margin-top:1px;">
              ${hoursLeftText}
            </div>
          </div>
          <div class="soma-track-bg">
            <div style="width:${hoursPct}%; height:100%; background:#38bdf8;"></div>
          </div>
        </div>

        <!-- BOX 3: QUALITY -->
        <div class="soma-metric-box box-c-yellow" id="tap-quality" title="Tap cycle 1-5">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <span style="font-size:0.60rem; font-weight:800; color:#fbbf24; text-transform:uppercase;">QUALITY</span>
              <span style="font-size:0.58rem; font-weight:800; color:#fbbf24;">${qualityPct}%</span>
            </div>
            <div style="font-size:0.95rem; font-weight:900; color:#ffffff; margin-top:2px;">
              ${quality}<span style="font-size:0.62rem; font-weight:700; color:#a1a1aa;">/5</span>
            </div>
            <div style="font-size:0.58rem; font-weight:700; color:#fbbf24; margin-top:1px;">
              ${qualityLeftText}
            </div>
          </div>
          <div class="soma-track-bg">
            <div style="width:${qualityPct}%; height:100%; background:#fbbf24;"></div>
          </div>
        </div>

        <!-- BOX 4: SORENESS -->
        <div class="soma-metric-box box-c-red" id="tap-soreness" title="Tap cycle 1-5">
          <div>
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <span style="font-size:0.60rem; font-weight:800; color:#ef4444; text-transform:uppercase;">SORENESS</span>
              <span style="font-size:0.58rem; font-weight:800; color:#ef4444;">${freshnessScore}%</span>
            </div>
            <div style="font-size:0.95rem; font-weight:900; color:#ffffff; margin-top:2px;">
              ${soreness}<span style="font-size:0.62rem; font-weight:700; color:#a1a1aa;">/5</span>
            </div>
            <div style="font-size:0.58rem; font-weight:700; color:#ef4444; margin-top:1px;">
              ${sorenessLabels[soreness]}
            </div>
          </div>
          <div class="soma-track-bg">
            <div style="width:${freshnessScore}%; height:100%; background:#ef4444;"></div>
          </div>
        </div>

      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; background:#18181c; border:1px solid #27272a; border-radius:6px; padding:6px 9px;">
        <span style="font-size:0.66rem; color:#a1a1aa; font-weight:700;">CNS Loading Target:</span>
        <span style="font-size:0.67rem; font-weight:800; color:#ffffff;">
          ${totalReadiness >= 82 ? '0–1 RIR (Heavy PRs)' : totalReadiness >= 65 ? '1–2 RIR (Clean Volume)' : '3+ RIR (Deload)'}
        </span>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- SECTION 2: NIGHT SUPPLEMENT DOCK (MATCHES ACTION BUTTON SYSTEM)    -->
    <!-- ================================================================= -->
    <div class="soma-native-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.75rem;">💊</span>
          <span style="font-size:0.75rem; font-weight:800; color:#ffffff; text-transform:uppercase; letter-spacing:0.04em;">PRE-BED PROTOCOL</span>
        </div>
        <span style="font-size:0.68rem; font-weight:700; color:#71717a;">Tap to toggle</span>
      </div>

      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:6px;">
        <div class="soma-action-btn ${supps.mg ? 'active' : ''}" id="btn-mg">💊 Magnesium</div>
        <div class="soma-action-btn ${supps.gly ? 'active' : ''}" id="btn-gly">🧪 Glycine</div>
        <div class="soma-action-btn ${supps.zn ? 'active' : ''}" id="btn-zn">⚡ Zinc</div>
        <div class="soma-action-btn ${supps.mel ? 'active' : ''}" id="btn-mel">🌙 Melatonin</div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- SECTION 3: 14-DAY SLEEP & RECOVERY TREND                           -->
    <!-- ================================================================= -->
    <div class="soma-native-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div style="display:flex; align-items:center; gap:6px;">
          <span style="font-size:0.75rem;">📈</span>
          <span style="font-size:0.75rem; font-weight:800; color:#ffffff; text-transform:uppercase; letter-spacing:0.04em;">14-DAY SLEEP TREND</span>
        </div>
        <span style="font-size:0.68rem; font-weight:800; color:${debtColor};">
          7d Debt: ${sleepDebt > 0 ? `-${sleepDebt}h` : `+${Math.abs(sleepDebt)}h`}
        </span>
      </div>

      <div style="display:grid; grid-template-columns: repeat(14, 1fr); gap:3px; align-items:end;">
        ${history14d.map((d, idx) => {
          const h = Math.min(100, Math.max(15, (d.hours / 10.0) * 100));
          const isToday = idx === 13;
          return `
            <div style="display:flex; flex-direction:column; align-items:center; gap:2px;">
              <div class="soma-spark-bar" style="width:100%;" title="${d.date}:${d.hours}h">
                <div style="width:100%; height:${h}\%; background:${isToday ? '#38bdf8' : '#a855f7'}; border-radius:2px;"></div>
              </div>
              <span style="font-size:0.48rem; font-weight:700; color:${isToday ? '#38bdf8' : '#71717a'};">${isToday ? 'Now' : d.date.slice(8)}</span>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // Attach Event Listeners
  root.querySelector("#tap-hours").onclick = async () => {
    let h = (parseFloat(nutritionDB[todayKey].recovery.hours) || 7.5) + 0.5;
    if (h > 10.0) h = 5.0;
    nutritionDB[todayKey].recovery.hours = h;
    await saveDB();
    render();
  };

  root.querySelector("#tap-quality").onclick = async () => {
    let q = (parseInt(nutritionDB[todayKey].recovery.quality) || 4) + 1;
    if (q > 5) q = 1;
    nutritionDB[todayKey].recovery.quality = q;
    await saveDB();
    render();
  };

  root.querySelector("#tap-soreness").onclick = async () => {
    let s = (parseInt(nutritionDB[todayKey].recovery.soreness) || 2) + 1;
    if (s > 5) s = 1;
    nutritionDB[todayKey].recovery.soreness = s;
    await saveDB();
    render();
  };

  root.querySelector("#btn-mg").onclick = async () => {
    nutritionDB[todayKey].recovery.supps.mg = !nutritionDB[todayKey].recovery.supps.mg;
    await saveDB();
    render();
  };

  root.querySelector("#btn-gly").onclick = async () => {
    nutritionDB[todayKey].recovery.supps.gly = !nutritionDB[todayKey].recovery.supps.gly;
    await saveDB();
    render();
  };

  root.querySelector("#btn-zn").onclick = async () => {
    nutritionDB[todayKey].recovery.supps.zn = !nutritionDB[todayKey].recovery.supps.zn;
    await saveDB();
    render();
  };

  root.querySelector("#btn-mel").onclick = async () => {
    nutritionDB[todayKey].recovery.supps.mel = !nutritionDB[todayKey].recovery.supps.mel;
    await saveDB();
    render();
  };
}

render();