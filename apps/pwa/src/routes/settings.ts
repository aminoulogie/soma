// ============================================================================
// Settings — body weight, unit, and default rest.
//
// These three lived nowhere: getMeta("bodyWeight", 75), getMeta("unit", "kg")
// and getMeta("restDefault", 90) were read all over the coach and the logger,
// but nothing ever wrote them, so every user was silently assumed to weigh
// 75kg and rest 90s. This is the write side of those three reads.
//
// Body weight has two homes on purpose. Food's per-day record (day.bodyWeight)
// is a weigh-in history — it feeds the measured-maintenance calculation, which
// needs the actual sequence of readings, not just the latest one. The global
// meta value here is "what you currently weigh", the fallback the coach uses
// for volume and PRs on days you have not weighed in. Saving here does not
// fabricate a weigh-in for today; Food's own "Save weight" already keeps the
// global value in sync when you log one there.
// ============================================================================

import type { Route } from "../lib/router";
import { getMeta, setMeta } from "../lib/db";
import { toast } from "../lib/toast";

async function view(host: HTMLElement): Promise<void> {
  const [weight, unit, restDefault] = await Promise.all([
    getMeta<number>("bodyWeight", 75),
    getMeta<string>("unit", "kg"),
    getMeta<number>("restDefault", 90)
  ]);

  host.innerHTML = `
    <h1>Settings</h1>

    <div class="card">
      <div class="card-title">⚖️ Body weight</div>
      <p class="faint" style="margin:0 0 10px">
        Used to estimate volume and protein when you have not weighed in today.
        Weighing in on the Food tab updates this too.
      </p>
      <div class="stepper">
        <button class="btn" data-act="w" data-d="-0.5">−</button>
        <input class="in big" id="set-weight" type="number" step="0.5" min="1" inputmode="decimal"
               value="${weight}"/>
        <button class="btn" data-act="w" data-d="0.5">+</button>
      </div>
      <button class="btn accent wide" data-act="save-weight" style="margin-top:12px">Save</button>
    </div>

    <div class="card">
      <div class="card-title">📏 Unit</div>
      <div class="quality-row">
        <button class="q-dot ${unit === "kg" ? "on" : ""}" data-act="unit" data-u="kg">kg</button>
        <button class="q-dot ${unit === "lb" ? "on" : ""}" data-act="unit" data-u="lb">lb</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">⏱️ Default rest</div>
      <p class="faint" style="margin:0 0 10px">
        Used between working sets when the autoregulator has no more specific reason to rest longer or shorter.
      </p>
      <div class="stepper">
        <button class="btn" data-act="r" data-d="-15">−</button>
        <input class="in big" id="set-rest" type="number" step="15" min="0" inputmode="numeric"
               value="${restDefault}"/>
        <button class="btn" data-act="r" data-d="15">+</button>
      </div>
      <button class="btn accent wide" data-act="save-rest" style="margin-top:12px">Save</button>
    </div>`;
}

export const settingsRoute: Route = {
  id: "settings",
  label: "Settings",
  icon: "⚙️",
  async render(host) {
    void setMeta("lastTab", "settings");
    await view(host);

    // Wired once per host, like every other route — render() only replaces
    // innerHTML, so re-wiring on every repaint would stack a new listener on
    // the same element each time.
    if (!(host as any).__settingsWired) {
      (host as any).__settingsWired = true;

      host.addEventListener("click", (e) => {
        void (async () => {
          const b = (e.target as HTMLElement).closest<HTMLElement>("[data-act]");
          if (!b) return;
          const act = b.dataset.act;

          if (act === "w") {
            const input = host.querySelector<HTMLInputElement>("#set-weight");
            if (input) {
              const next = Math.max(1, (parseFloat(input.value) || 0) + Number(b.dataset.d));
              input.value = (Math.round(next * 10) / 10).toFixed(1);
            }
            return;
          }

          if (act === "save-weight") {
            const v = parseFloat(host.querySelector<HTMLInputElement>("#set-weight")?.value ?? "");
            if (isNaN(v) || v <= 0) { toast("Enter a valid weight."); return; }
            await setMeta("bodyWeight", Math.round(v * 10) / 10);
            toast(`Body weight saved: ${v}`);
            return;
          }

          if (act === "unit") {
            const u = b.dataset.u;
            if (u !== "kg" && u !== "lb") return;
            // A stored kg or lb figure is not converted here — the number the
            // coach reads is whatever you last saved, and swapping the label
            // without swapping the number would quietly change what you lift.
            // Re-enter body weight in the new unit afterward if you switch.
            await setMeta("unit", u);
            toast(`Unit set to ${u}`);
            await view(host);
            return;
          }

          if (act === "r") {
            const input = host.querySelector<HTMLInputElement>("#set-rest");
            if (input) {
              const next = Math.max(0, (parseInt(input.value, 10) || 0) + Number(b.dataset.d));
              input.value = String(next);
            }
            return;
          }

          if (act === "save-rest") {
            const v = parseInt(host.querySelector<HTMLInputElement>("#set-rest")?.value ?? "", 10);
            if (isNaN(v) || v < 0) { toast("Enter a valid number of seconds."); return; }
            await setMeta("restDefault", v);
            toast(`Default rest saved: ${v}s`);
          }
        })();
      });
    }
  }
};
