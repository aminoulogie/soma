```dataviewjs
// ============================================================================
// SOMA RECOVERY SUITE v3 — fully inline-styled (no injected <style> block),
// so it renders correctly even where dynamically-injected stylesheets get
// ignored. Five stacked widgets: Ring, Inputs, Protocol, Trend, Insight.
// ============================================================================

// ---- 1. DATA ACCESS & CONTEXT ----------------------------------------------
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
    quality: 4,
    soreness: 2,
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

function vibrate(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

function computeStreak(suppKey) {
  let streak = 0;
  let cursor = new Date(todayKey + "T00:00:00");
  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    const day = nutritionDB[key];
    if (day && day.recovery && day.recovery.supps && day.recovery.supps[suppKey]) {
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    } else break;
  }
  return streak;
}

function formatShort(ds) {
  const d = new Date(ds + "T00:00:00");
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Wires a light "press" scale effect via JS instead of a :active CSS rule,
// since this environment isn't applying the injected stylesheet.
function addPress(el) {
  if (!el) return;
  el.style.transition = "transform .08s ease";
  const down = () => { el.style.transform = "scale(0.94)"; };
  const up = () => { el.style.transform = "scale(1)"; };
  el.addEventListener("touchstart", down, { passive: true });
  el.addEventListener("touchend", up);
  el.addEventListener("touchcancel", up);
  el.addEventListener("mousedown", down);
  el.addEventListener("mouseup", up);
  el.addEventListener("mouseleave", up);
}

// ---- 2. ROOT CONTAINER (all styling below is inline) ------------------------
const root = dv.el("div", "", { cls: "soma-suite" });
root.style.cssText = [
  "max-width:660px", "margin:0 auto",
  "font-family: var(--font-interface, -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', Roboto, sans-serif)",
  "color:#f4f4f5", "-webkit-tap-highlight-color:transparent", "user-select:none",
  "display:flex", "flex-direction:column", "gap:12px", "box-sizing:border-box"
].join(";");

let mounted = false;

// ---- 3. RENDER --------------------------------------------------------------
function render() {
  const r = nutritionDB[todayKey].recovery;
  const hours = parseFloat(r.hours) || 7.5;
  const quality = parseInt(r.quality) || 4;
  const soreness = parseInt(r.soreness) || 2;
  const supps = r.supps || { mg: true, gly: false, mel: false, zn: true };

  const hoursPct = Math.min(100, Math.round((hours / 8.0) * 100));
  const qualityPct = Math.min(100, Math.round((quality / 5.0) * 100));
  const freshnessScore = Math.round(((6 - soreness) / 5.0) * 100);
  const totalReadiness = Math.round(hoursPct * 0.40 + qualityPct * 0.35 + freshnessScore * 0.25);

  const qualityLabels = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Deep", 5: "Pristine" };
  const sorenessLabels = { 1: "Fresh", 2: "Mild", 3: "Mod", 4: "High", 5: "Severe" };
  const sorenessColors = ["#22c55e", "#84cc16", "#fbbf24", "#f97316", "#ef4444"];

  const statusColor = totalReadiness >= 82 ? "#22c55e" : totalReadiness >= 65 ? "#fbbf24" : "#ef4444";
  const statusLabel = totalReadiness >= 82 ? "Primed" : totalReadiness >= 65 ? "Steady" : "Fatigued";
  const cnsTarget = totalReadiness >= 82 ? "0–1 RIR (Heavy PRs)" : totalReadiness >= 65 ? "1–2 RIR (Clean Volume)" : "3+ RIR (Deload)";

  const ringR = 54;
  const ringCirc = 2 * Math.PI * ringR;
  const ringOffset = ringCirc * (1 - totalReadiness / 100);

  const headerDateObj = new Date(todayKey + "T00:00:00");
  const prettyDate = headerDateObj.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });

  // ---- 14-day history + weekly-best readiness ----
  const history14d = [];
  let total7d = 0;
  let weeklyBest = { score: -1, date: null };
  const ref = new Date(todayKey + "T00:00:00");

  for (let i = 13; i >= 0; i--) {
    const d = new Date(ref);
    d.setDate(d.getDate() - i);
    const dKey = d.toISOString().slice(0, 10);
    const rec = nutritionDB[dKey] && nutritionDB[dKey].recovery;
    let h = 0, q = 3, s = 3, hasData = false;
    if (rec) {
      h = parseFloat(rec.hours) || 0;
      q = parseInt(rec.quality) || 3;
      s = parseInt(rec.soreness) || 3;
      hasData = true;
    }
    if (i < 7) {
      total7d += h;
      if (hasData) {
        const dh = Math.min(100, Math.round((h / 8.0) * 100));
        const dq = Math.min(100, Math.round((q / 5.0) * 100));
        const df = Math.round(((6 - s) / 5.0) * 100);
        const dScore = Math.round(dh * 0.40 + dq * 0.35 + df * 0.25);
        if (dScore > weeklyBest.score) weeklyBest = { score: dScore, date: dKey };
      }
    }
    history14d.push({ date: dKey, hours: h });
  }

  const sleepDebt = +(56.0 - total7d).toFixed(1);
  const debtColor = sleepDebt > 3 ? "#ef4444" : sleepDebt > 0 ? "#fbbf24" : "#10b981";

  // ---- trend chart geometry ----
  const chartW = 300, chartH = 70, chartPad = 4, maxScale = 12;
  const xAt = (i) => (i / (history14d.length - 1)) * (chartW - chartPad * 2) + chartPad;
  const yAt = (h) => chartH - (Math.max(0, Math.min(maxScale, h)) / maxScale) * chartH;
  const pointsArr = history14d.map((d, i) => ({ x: xAt(i), y: yAt(d.hours), d }));
  const linePath = pointsArr.map((p, i) => (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)).join(" ");
  const last = pointsArr[pointsArr.length - 1];
  const first = pointsArr[0];
  const areaPath = linePath + ` L${last.x.toFixed(1)},${chartH} L${first.x.toFixed(1)},${chartH} Z`;
  const circlesHtml = pointsArr.map((p, i) => {
    const isToday = i === pointsArr.length - 1;
    const rad = isToday ? 4 : 2.4;
    const fill = isToday ? "#38bdf8" : "#a855f7";
    const stroke = isToday ? "#ffffff" : "none";
    return `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${rad}" fill="${fill}" stroke="${stroke}" stroke-width="1.5"><title>${p.d.date}: ${p.d.hours}h</title></circle>`;
  }).join("");
  const labelsHtml = history14d.map((d, i) => {
    const isToday = i === history14d.length - 1;
    return `<span style="flex:1;text-align:center;font-size:0.48rem;font-weight:700;color:${isToday ? "#38bdf8" : "#71717a"};">${isToday ? "Now" : d.date.slice(8)}</span>`;
  }).join("");

  // ---- insight copy ----
  let primaryTip;
  if (totalReadiness >= 82) primaryTip = "🔥 You're primed — today's a green light for heavy singles or PR attempts.";
  else if (totalReadiness >= 65) primaryTip = "✅ Steady state — solid volume day, keep working sets around 1–2 RIR.";
  else primaryTip = "⚠️ Recovery is lagging — favor 3+ RIR today or take a planned deload.";

  let secondaryTip;
  if (sleepDebt > 3) secondaryTip = `😴 Running a ${sleepDebt}h sleep debt over 7 days — an earlier night would pay off.`;
  else if (sleepDebt < -2) secondaryTip = `💤 You're sleep-banked (+${Math.abs(sleepDebt)}h over 7 days) — nice buffer.`;
  else secondaryTip = "Sleep debt is balanced this week.";

  const statLine = weeklyBest.date ? `This week's best readiness: ${weeklyBest.score}% on ${formatShort(weeklyBest.date)}` : "";

  // ---- small inline-styled component builders ----
  const CARD = "background:#141417;border:1px solid #27272a;border-radius:14px;padding:14px 16px;box-sizing:border-box;";
  function cardOpen(cls) { return `<div class="soma-card ${cls || ""}" style="${CARD}">`; }
  function cardTitle(icon, label, meta) {
    return `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
      <span style="display:flex;align-items:center;gap:6px;font-size:.75rem;font-weight:800;color:#fff;text-transform:uppercase;letter-spacing:.04em;">${icon} ${label}</span>
      ${meta ? `<span style="font-size:.68rem;font-weight:700;color:#71717a;">${meta}</span>` : ""}
    </div>`;
  }
  function stepBtn(id, label) {
    return `<div id="${id}" style="width:34px;height:34px;border-radius:9px;flex-shrink:0;background:#1c1c21;border:1px solid #2e2e33;color:#f4f4f5;font-size:1.1rem;font-weight:800;display:flex;align-items:center;justify-content:center;cursor:pointer;touch-action:manipulation;">${label}</div>`;
  }
  function dotEl(value, filled, color) {
    return `<div class="soma-dot" data-value="${value}" style="flex:1;height:28px;border-radius:8px;border:1.5px solid ${filled ? color : "#2e2e33"};background:${filled ? color : "#1c1c21"};cursor:pointer;touch-action:manipulation;"></div>`;
  }

  // ---- supplement config ----
  const suppConfig = [
    { key: "mg", label: "Magnesium", icon: "💊" },
    { key: "gly", label: "Glycine", icon: "🧪" },
    { key: "zn", label: "Zinc", icon: "⚡" },
    { key: "mel", label: "Melatonin", icon: "🌙" }
  ];
  const suppButtonsHtml = suppConfig.map((s) => {
    const active = !!supps[s.key];
    const streak = computeStreak(s.key);
    const badge = streak >= 2
      ? `<span style="position:absolute;top:-6px;right:-6px;background:#f97316;color:#fff;font-size:.55rem;font-weight:900;border-radius:999px;padding:1px 5px;border:2px solid #141417;">🔥${streak}</span>`
      : "";
    return `<div class="soma-supp-btn" data-supp="${s.key}" style="position:relative;cursor:pointer;touch-action:manipulation;background:${active ? "#251638" : "#1c1c21"};border:1px solid ${active ? "#c084fc" : "#2e2e33"};border-radius:9px;font-size:.72rem;font-weight:${active ? 800 : 700};color:${active ? "#fff" : "#d4d4d8"};padding:9px 12px;display:flex;align-items:center;justify-content:center;gap:5px;${active ? "box-shadow:0 0 10px rgba(192,132,252,.2);" : ""}">${badge}${s.icon} ${s.label}</div>`;
  }).join("");

  const qualityDotsHtml = [1, 2, 3, 4, 5].map((n) => dotEl(n, n <= quality, "#fbbf24")).join("");
  const sorenessDotsHtml = [1, 2, 3, 4, 5].map((n) => dotEl(n, n <= soreness, sorenessColors[n - 1])).join("");

  root.innerHTML = `
    ${cardOpen()}
      <div style="font-size:.7rem;color:#a1a1aa;font-weight:700;margin-bottom:12px;">${prettyDate} · Recovery</div>
      <div style="display:flex;align-items:center;gap:18px;">
        <div style="position:relative;width:120px;height:120px;flex-shrink:0;">
          <svg width="120" height="120" viewBox="0 0 120 120" style="transform:rotate(-90deg);display:block;">
            <circle cx="60" cy="60" r="${ringR}" fill="none" stroke="#27272a" stroke-width="10"></circle>
            <circle cx="60" cy="60" r="${ringR}" fill="none" stroke="${statusColor}" stroke-width="10" stroke-linecap="round"
              stroke-dasharray="${ringCirc.toFixed(1)}" stroke-dashoffset="${ringOffset.toFixed(1)}"
              style="transition:stroke-dashoffset .7s cubic-bezier(.22,1,.36,1), stroke .4s ease;"></circle>
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <div style="font-size:1.55rem;font-weight:900;color:#fff;line-height:1;">${totalReadiness}%</div>
            <div style="font-size:.58rem;font-weight:700;color:#a1a1aa;text-transform:uppercase;margin-top:2px;letter-spacing:.03em;">Readiness</div>
          </div>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;gap:8px;min-width:0;">
          <span style="display:inline-flex;align-items:center;gap:5px;font-size:.72rem;font-weight:800;padding:5px 10px;border-radius:999px;width:fit-content;background:${statusColor}22;color:${statusColor};">● ${statusLabel}</span>
          <div style="display:flex;justify-content:space-between;align-items:center;background:#18181c;border:1px solid #27272a;border-radius:8px;padding:7px 10px;gap:8px;">
            <span style="font-size:.62rem;color:#a1a1aa;font-weight:700;flex-shrink:0;">CNS Loading Target</span>
            <span style="font-size:.65rem;font-weight:800;color:#fff;text-align:right;">${cnsTarget}</span>
          </div>
        </div>
      </div>
    </div>

    ${cardOpen()}
      ${cardTitle("📊", "Recovery Inputs")}

      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
          <span style="font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.03em;color:#38bdf8;">Sleep</span>
          <span style="font-size:.68rem;font-weight:700;color:#a1a1aa;">${hoursPct}% of goal</span>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          ${stepBtn("soma-hours-minus", "–")}
          <div style="flex:1;text-align:center;font-size:1.15rem;font-weight:900;color:#fff;">${hours}<span style="font-size:.65rem;font-weight:700;color:#a1a1aa;"> h</span></div>
          ${stepBtn("soma-hours-plus", "+")}
        </div>
        <div style="height:6px;background:#27272a;border-radius:999px;overflow:hidden;margin-top:8px;">
          <div style="height:100%;border-radius:999px;transition:width .4s ease;width:${hoursPct}%;background:#38bdf8;"></div>
        </div>
      </div>

      <div style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
          <span style="font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.03em;color:#fbbf24;">Quality</span>
          <span style="font-size:.68rem;font-weight:700;color:#a1a1aa;">${qualityLabels[quality]}</span>
        </div>
        <div class="soma-dots" data-target="quality" style="display:flex;gap:6px;">${qualityDotsHtml}</div>
      </div>

      <div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
          <span style="font-size:.66rem;font-weight:800;text-transform:uppercase;letter-spacing:.03em;color:#ef4444;">Soreness</span>
          <span style="font-size:.68rem;font-weight:700;color:#a1a1aa;">${sorenessLabels[soreness]}</span>
        </div>
        <div class="soma-dots" data-target="soreness" style="display:flex;gap:6px;">${sorenessDotsHtml}</div>
      </div>
    </div>

    ${cardOpen()}
      ${cardTitle("💊", "Pre-Bed Protocol", "Tap to log")}
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:7px;">${suppButtonsHtml}</div>
    </div>

    ${cardOpen()}
      ${cardTitle("📈", "14-Day Sleep Trend")}
      <svg viewBox="0 0 ${chartW} ${chartH}" style="width:100%;height:70px;display:block;">
        <defs>
          <linearGradient id="somaAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.35"/>
            <stop offset="100%" stop-color="#38bdf8" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#somaAreaGrad)" stroke="none"></path>
        <path d="${linePath}" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
        ${circlesHtml}
      </svg>
      <div style="display:flex;margin-top:4px;">${labelsHtml}</div>
      <div style="display:flex;justify-content:space-between;align-items:center;background:#18181c;border:1px solid #27272a;border-radius:8px;padding:7px 10px;margin-top:10px;">
        <span style="font-size:.66rem;color:#a1a1aa;font-weight:700;">7-Day Sleep Debt</span>
        <span style="font-size:.68rem;font-weight:800;color:${debtColor};">${sleepDebt > 0 ? `-${sleepDebt}h` : `+${Math.abs(sleepDebt)}h`}</span>
      </div>
    </div>

    ${cardOpen()}
      ${cardTitle("💡", "Insight")}
      <div style="font-size:.78rem;line-height:1.5;color:#e4e4e7;margin-bottom:6px;">${primaryTip}</div>
      <div style="font-size:.78rem;line-height:1.5;color:#e4e4e7;">${secondaryTip}</div>
      ${statLine ? `<div style="font-size:.66rem;color:#71717a;font-weight:700;margin-top:8px;padding-top:8px;border-top:1px dashed #27272a;">${statLine}</div>` : ""}
    </div>
  `;

  // ---- one-time entrance animation (inline transition, no stylesheet) ----
  const cards = root.querySelectorAll(".soma-card");
  if (!mounted) {
    mounted = true;
    cards.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(6px)";
      el.style.transition = `opacity .35s ease ${i * 0.05}s, transform .35s ease ${i * 0.05}s`;
    });
    requestAnimationFrame(() => {
      cards.forEach((el) => { el.style.opacity = "1"; el.style.transform = "translateY(0)"; });
    });
  }

  // ---- event wiring ----
  const minusBtn = root.querySelector("#soma-hours-minus");
  const plusBtn = root.querySelector("#soma-hours-plus");
  addPress(minusBtn);
  addPress(plusBtn);
  minusBtn.onclick = async () => {
    let h = (parseFloat(nutritionDB[todayKey].recovery.hours) || 7.5) - 0.25;
    h = Math.max(3, h);
    nutritionDB[todayKey].recovery.hours = h;
    vibrate(6);
    await saveDB();
    render();
  };
  plusBtn.onclick = async () => {
    let h = (parseFloat(nutritionDB[todayKey].recovery.hours) || 7.5) + 0.25;
    h = Math.min(12, h);
    nutritionDB[todayKey].recovery.hours = h;
    vibrate(6);
    await saveDB();
    render();
  };

  root.querySelectorAll(".soma-dots").forEach((group) => {
    const target = group.dataset.target;
    group.querySelectorAll(".soma-dot").forEach((dot) => {
      addPress(dot);
      dot.onclick = async () => {
        const val = parseInt(dot.dataset.value);
        nutritionDB[todayKey].recovery[target] = val;
        vibrate(6);
        await saveDB();
        render();
      };
    });
  });

  root.querySelectorAll("[data-supp]").forEach((btn) => {
    addPress(btn);
    btn.onclick = async () => {
      const k = btn.dataset.supp;
      nutritionDB[todayKey].recovery.supps[k] = !nutritionDB[todayKey].recovery.supps[k];
      vibrate(8);
      await saveDB();
      render();
    };
  });
}

render();
