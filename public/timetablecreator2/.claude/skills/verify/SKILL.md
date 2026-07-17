---
name: verify
description: Build, launch, and drive the timetable creator app to verify changes end-to-end.
---

# Verifying timetablecreator2

Static vanilla-TS app. No bundler: `src/*.ts` compiles to `dist/*.js` (ES modules) which `index.html` loads directly. `dist/` is committed — always rebuild after src edits.

## Build

```
npx tsc          # from this directory; emits dist/
```

## Launch

Any static file server rooted here works (needs `./dist`, `./styles.css`, `./*.otf`). SortableJS + dom-to-image-more come from jsdelivr CDN, so internet is required.

```js
// Node one-liner pattern: http.createServer + fs.readFile, listen(0, "127.0.0.1")
```

## Drive (Playwright)

`playwright` v1.58 is in this package's node_modules and Chromium binaries are installed in `%LOCALAPPDATA%\ms-playwright`. Require it directly:

```js
const { chromium } = require("<this-dir>/node_modules/playwright");
```

Useful handles:
- App state: `JSON.parse(localStorage.getItem("timetable_autosave"))` — days/events/settings snapshot, updated on every commit.
- Reset between scenarios: `localStorage.clear()` + reload.
- Settings panel: `#settingsBtn` opens; theme cards are `.theme-option-card[data-id=...]`.
- Add events: `#addEventBtn` (2 slots each, packs into first day with ≤16 total).
- Resize: mouse-drag `.schedule-item .resize-handle` vertically (~62px per half-hour row).
- Edit sheet: click a `.schedule-item` (top area, away from the handle) → `#eventEditorSheet.active`.
- Export JSON: click `#saveBtn` + `page.waitForEvent("download")`.
- Import JSON: `#loadFile` setInputFiles (sample legacy file: `ECE4.2.json`).
- Screenshot flow: `#screenshotBtn` → `#generatePreviewBtn`; to test the failure path, monkeypatch `window.domtoimage.toPng` to reject and accept the alert dialog.
- Touch/mobile behavior: context with `hasTouch: true` + CDP `Input.dispatchTouchEvent` for drags (SortableJS uses its touch fallback there; desktop uses native DnD).

## Gotchas

- Sortable rebinds on the custom `gridRendered` event after every render — wait ~300-400ms after actions before asserting.
- Slider changes need both `input` and `change` events dispatched when set programmatically.
- Time labels (`.schedule-item .time`) only shift for events *starting* at/after the lunch line (13:00 default) and only when lunch is enabled.
