# SOMA — fitness system for the `amine database` vault

Source of truth for the SOMA Smart Coach plugin, its dashboards, and its templates.
The Obsidian vault lives in iCloud; **this repo does not.** That is deliberate — iCloud
has produced conflict copies in this vault before (`main(1).js`, `2026-08-23(1..9).md`),
and a `.git` directory inside iCloud would make that far worse.

## Architecture

```
data      apps/scripts/*.json        (in vault — live, changes daily)
  ^
logic     plugin/main.js             (this repo — 5.4k lines, hand-written, no build step)
  ^
views     daily notes                ```soma-coach, ```macro-tracker, ```habittracker
          Health/Dashboard/*.md      dataviewjs, reads the same JSON directly
```

`main.js` is plain CommonJS requiring `obsidian` at runtime. There is no compile step:
edit it here, run `scripts/deploy.sh`, reload Obsidian.

## Code blocks the plugin registers

| Block | Purpose |
|---|---|
| `soma-coach` | daily workout logger |
| `macro-tracker` | daily macro diary |
| `macro-weekly` | weekly macro rollup |
| `weekly-gym` / `weekly-gym-tracker` | weekly planner + adherence |
| `creatine-tracker` | creatine saturation |
| `habittracker` | habit grid |
| `soma-progress` | progress charts |
| `weekly-audit` / `monthly-audit` | period reviews |

Anything else in a fence renders as nothing. `habit-radar` is **not** a valid block —
it was an older name and is the most common source of "my daily note is blank here".

## Data files (`apps/scripts/`)

`soma-history` · `soma-nutrition` · `soma-settings` · `soma-data` · `muscleRegistry`
· `custom-foods` · `weekly-gym-data`

`soma-habits.json` and `custom-exercises.json` are declared in `main.js` but created
lazily on first write — `readVaultJson(path, fallback)` returns the fallback when the
file is absent, so their absence is normal, not an error.

## Workflow

```bash
scripts/deploy.sh         # repo -> vault (after editing main.js here)
scripts/pull.sh           # vault -> repo (if you edited via Obsidian)
scripts/snapshot-data.sh  # dated backup of the live JSON data
```

Close Obsidian on **both** desktop and iPhone before deploying. Reopening the phone app
may need a force-quit to pick up a changed plugin folder.

## Layout

- `plugin/` — deployed to `.obsidian/plugins/soma-smart-coach/`
- `dashboards/` — copies of `Health/Dashboard/*.md`
- `templates/` — copies of `templates/`
- `data-snapshots/<date>/` — point-in-time JSON backups
- `archive/` — 80 superseded version files (`bm1.0`–`bm24`, `gymlog 1.0`–`2.5`,
  `bodymap 1.0`–`1.8`, macro/sleep iterations) pulled out of the vault. Kept for
  reference only; nothing loads them.
