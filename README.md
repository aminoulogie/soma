# SOMA — fitness system

Training, nutrition, sleep and habits. Two front ends over one shared model:
an Obsidian plugin, and a PWA for the iPhone home screen.

The Obsidian vault lives in iCloud; **this repo does not.** That is deliberate — iCloud
has produced conflict copies in this vault before (`main(1).js`, `2026-08-23(1..9).md`),
and a `.git` directory inside iCloud would make that far worse.

## Architecture

```
              packages/core          data model, migrations, all calculations
                    │                no DOM, no Obsidian, no platform API
                    │
        ┌───────────┴───────────┐
        │                       │
  apps/obsidian            apps/pwa
  plugin → vault           static site → GitHub Pages
  reads/writes             reads/writes IndexedDB
  apps/scripts/*.json
```

`packages/browser` sits alongside core for things that need browser APIs but not
Obsidian — theming, audio, photo capture — so the PWA reuses them unchanged.

The boundary is enforced, not just documented: `apps/obsidian/test/test-modules.js`
fails the build if anything in `core` reaches for `document` or `obsidian`.

## Working on it

```bash
npm install              # workspace root, installs everything

npm run test             # 259 tests, against the built plugin bundle
npm run typecheck        # PWA
npm run build:obsidian   # src → main.js
npm run build:pwa        # → apps/pwa/dist
npm run verify:pwa       # build + assert the service worker is deployable
npm run deploy           # build, test, then copy the plugin into the vault
```

Close Obsidian on **both** desktop and iPhone before deploying. Reopening the phone app
may need a force-quit to pick up a changed plugin folder.

## The plugin

`main.js` is a **generated bundle** — edit `apps/obsidian/src/`, never `main.js`.
The test runner refuses to run if the bundle is older than its source.

| Block | Tabs |
|---|---|
| `soma-workout` | Workout · Heatmap · Calendar · Insights · Settings |
| `soma-macros` / `macro-tracker` | Macros · Weight · Measure · Creatine · Settings |
| `soma-sleep` | Sleep · Settings |
| `habittracker` | Habits · Settings |
| `soma-coach` | all-in-one; shows only what no other widget owns |
| `macro-weekly`, `weekly-gym`, `creatine-tracker`, `soma-progress`, `weekly-audit`, `monthly-audit` | standalone widgets |

`habit-radar` is **not** a valid block — it was an older name and is the most common
source of "my daily note is blank here".

## The PWA

Vanilla TypeScript + Vite, no framework. Five routes on a bottom nav:
**Train · Food · Habits · Sleep · Review**.

Storage is IndexedDB, keyed per day rather than per file — the plugin rewrote a 225 KB
JSON blob to tick one habit. The File System Access API is not implemented in Safari on
any platform, and OPFS on iOS needs a Worker plus `createSyncAccessHandle`; neither buys
anything here.

The service worker is hand-rolled (`apps/pwa/src/sw.ts`) and built as a **classic**
script — module service workers are not supported in Safari, so a module worker would
register on Chromium and fail on every iPhone.

Deployed to GitHub Pages by `.github/workflows/deploy-pwa.yml` on push to `main`.

## Data

Live JSON in the vault at `apps/scripts/`:

`soma-history` · `soma-nutrition` · `soma-settings` · `soma-data` · `muscleRegistry`
· `custom-foods` · `weekly-gym-data` · `soma-habits`

Every read runs through the migration layer in `packages/core`, so both front ends
normalise to the same schema and cannot drift apart.

## Layout

- `packages/core/` — the shared model. Pure.
- `packages/browser/` — theming, audio, photo. Browser APIs, no Obsidian.
- `apps/obsidian/` — the plugin. Deployed to `.obsidian/plugins/soma-smart-coach/`.
- `apps/pwa/` — the PWA.
- `dashboards/`, `templates/` — copies of vault notes.
- `data-snapshots/<date>/` — point-in-time JSON backups.
- `archive/` — 80 superseded version files, reference only; nothing loads them.
