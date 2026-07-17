import { appState } from "./state.js";
import { renderGrid } from "./grid.js";
import { applyTheme, syncThemeVisuals, getCurrentTheme, themes, renderPresetTray } from "./themes.js";
import { initializeDragAndDrop } from "./dragDrop.js";
import { initializeEventEditor } from "./eventEditor.js";
import { initializeStorage } from "./storage.js";
import { initializeScreenshot } from "./screenshot.js";
// Monotonic counter guarantees unique IDs even within the same millisecond
let eventIdCounter = 0;
function generateEventId() {
    return `evt_${Date.now()}_${eventIdCounter++}`;
}
function getNextAvailableDayIndex(eventDuration) {
    for (const dayIndex of appState.settings.visibleDays) {
        const dayData = appState.days[dayIndex];
        if (!dayData)
            continue;
        const totalDuration = dayData.events.reduce((sum, e) => sum + e.duration, 0);
        if (totalDuration + eventDuration <= 16) {
            return dayIndex;
        }
    }
    return appState.settings.visibleDays[0] ?? 0;
}
function initApp() {
    // 1. Setup default theme & render swatches in settings
    applyTheme("evergreen");
    renderThemeSettingsSelector();
    // 2. Initialize storage/history first to restore auto-save
    initializeStorage();
    if (appState.loadAutoSave()) {
        console.log("Restored from Auto-Save");
        // Ensure Theme is reapplied correctly from saved settings
        applyTheme(appState.settings.themeId);
    }
    else {
        // Initial commit for new schedules
        appState.commitState();
    }
    // 3. Initialize modules
    initializeDragAndDrop();
    initializeEventEditor();
    initializeScreenshot();
    // 3. UI Event Listeners
    setupHeaderEditors();
    setupSettingsPanel();
    setupPresetTray();
    // Add generic event button
    document.getElementById("addEventBtn")?.addEventListener("click", () => {
        const duration = 2; // 1 hour
        const targetDay = getNextAvailableDayIndex(duration);
        appState.addEvent(targetDay, {
            id: generateEventId(),
            subject: "New Event",
            duration: duration,
            colorHex: themes[appState.settings.themeId]?.subjectColors.subject1 || "#9bc55f"
        });
        renderGrid();
    });
    // Undo / Redo buttons
    document.getElementById("undoBtn")?.addEventListener("click", () => {
        appState.undo();
    });
    document.getElementById("redoBtn")?.addEventListener("click", () => {
        appState.redo();
    });
    // Global listener for state changes (commits AND history traversal)
    document.addEventListener("stateChanged", syncUIFromState);
    // Dedicated listener for theme UI updates
    document.addEventListener("themeChanged", () => {
        renderPresetTray();
    });
    // Run first layout & sync all UI from the (possibly restored) state
    syncUIFromState();
}
/**
 * Single sync point that makes ALL visual state match appState. Runs after every
 * commit and after undo/redo, so restored snapshots fully re-apply theme,
 * header text, corner rounding and settings controls — not just the grid.
 */
function syncUIFromState() {
    // Re-apply theme visuals if the restored state uses a different theme
    if (appState.settings.themeId !== getCurrentTheme().id) {
        syncThemeVisuals(appState.settings.themeId);
    }
    renderHeaders();
    applyCornerRounding(appState.settings.cornerRounding);
    hydrateLunchControls();
    hydrateVisibleDayCheckboxes();
    updateActiveThemeCard();
    renderGrid();
    // Update UI of undo/redo buttons if needed (disabled states)
    const undoBtn = document.getElementById("undoBtn");
    const redoBtn = document.getElementById("redoBtn");
    if (undoBtn)
        undoBtn.disabled = appState.historyIndex <= 0;
    if (redoBtn)
        redoBtn.disabled = appState.historyIndex >= appState.history.length - 1;
    // Refresh preset tray dynamically on state change so new subjects appear
    renderPresetTray();
}
/** Renders the header/footer text elements from state */
function renderHeaders() {
    const headers = appState.settings.headers;
    if (!headers)
        return;
    const subEl = document.getElementById("subtitleEl");
    const t1El = document.getElementById("titleLine1El");
    const t2El = document.getElementById("titleLine2El");
    const versEl = document.getElementById("versionTagEl");
    const footEl = document.getElementById("footerEl");
    if (subEl)
        subEl.innerText = headers.subtitle;
    if (t1El)
        t1El.innerText = headers.title1;
    if (t2El)
        t2El.innerText = headers.title2;
    if (versEl)
        versEl.innerText = headers.version;
    if (footEl)
        footEl.innerText = headers.footer;
}
/**
 * Applies corner rounding to the container and syncs the slider position.
 * NOTE: the CSS variable must be set on .timetable-container (not :root) because
 * the container declares its own --item-border-radius-raw, which would shadow
 * any value set higher up the tree.
 */
function applyCornerRounding(value) {
    if (!Number.isFinite(value))
        return;
    const container = document.querySelector(".timetable-container");
    container?.style.setProperty("--item-border-radius-raw", value.toString());
    const slider = document.getElementById("cornerRounding");
    if (slider)
        slider.value = value.toString();
}
/** Syncs the lunch settings controls from state (with legacy-flag fallback) */
function hydrateLunchControls() {
    const enableLunchToggle = document.getElementById("enableLunchToggle");
    const lunchStartTime = document.getElementById("lunchStartTimeInput");
    const lunchDuration = document.getElementById("lunchDurationInput");
    if (!enableLunchToggle || !lunchStartTime || !lunchDuration)
        return;
    // Backwards compatibility mapping for states saved before the lunch object existed
    const lunchConfig = appState.settings.lunch || {
        enabled: !appState.settings.hideLunchBreak,
        startTime: "13:00",
        duration: 60
    };
    enableLunchToggle.checked = lunchConfig.enabled;
    lunchStartTime.value = lunchConfig.startTime;
    lunchDuration.value = lunchConfig.duration.toString();
}
/** Syncs the visible-days checkboxes from state */
function hydrateVisibleDayCheckboxes() {
    const daysContainer = document.getElementById("visibleDaysCheckboxes");
    if (!daysContainer)
        return;
    daysContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = appState.settings.visibleDays.includes(parseInt(cb.value));
    });
}
/** Highlights the theme card matching the current state */
function updateActiveThemeCard() {
    document.querySelectorAll("#themeSelector .theme-option-card").forEach(card => {
        card.classList.toggle("active", card.dataset.id === appState.settings.themeId);
    });
}
function renderThemeSettingsSelector() {
    const selector = document.getElementById("themeSelector");
    let html = "";
    Object.values(themes).forEach(t => {
        html += `
        <div class="theme-option-card" data-id="${t.id}" style="background-color: ${t.bgColor}; color: ${t.textColor}; border-color: ${t.headerColor}">
            <span class="theme-name">${t.name}</span>
            <div class="theme-palette">
               <div class="swatch" style="background-color: ${t.subjectColors.subject1}"></div>
               <div class="swatch" style="background-color: ${t.subjectColors.subject2}"></div>
               <div class="swatch" style="background-color: ${t.subjectColors.subject3}"></div>
            </div>
        </div>`;
    });
    selector.innerHTML = html;
    // Active state reflects whatever theme the (possibly restored) state uses
    updateActiveThemeCard();
    selector.querySelectorAll(".theme-option-card").forEach(card => {
        card.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const id = target.dataset.id;
            // Reapply theme and save to state.
            // commitState triggers syncUIFromState, which refreshes the grid & active card.
            applyTheme(id);
            appState.settings.themeId = id;
            appState.commitState();
        });
    });
}
function setupHeaderEditors() {
    const editBtn = document.getElementById("editHeaderBtn");
    const modal = document.getElementById("headerEditorModal");
    // Inputs
    const sub = document.getElementById("editSubtitle");
    const t1 = document.getElementById("editTitle1");
    const t2 = document.getElementById("editTitle2");
    const vers = document.getElementById("editVersion");
    const foot = document.getElementById("editFooter");
    // Initial render from state if it exists
    renderHeaders();
    editBtn?.addEventListener("click", () => {
        sub.value = document.getElementById("subtitleEl").innerText;
        t1.value = document.getElementById("titleLine1El").innerText;
        t2.value = document.getElementById("titleLine2El").innerText;
        vers.value = document.getElementById("versionTagEl").innerText;
        foot.value = document.getElementById("footerEl").innerText;
        modal?.classList.add("active");
    });
    document.getElementById("cancelHeaderEdit")?.addEventListener("click", () => {
        modal?.classList.remove("active");
    });
    document.getElementById("saveHeaderEdit")?.addEventListener("click", () => {
        modal?.classList.remove("active");
        appState.settings.headers = {
            subtitle: sub.value,
            title1: t1.value,
            title2: t2.value,
            version: vers.value,
            footer: foot.value
        };
        // commitState triggers syncUIFromState, which renders the header text
        appState.commitState();
    });
}
function setupSettingsPanel() {
    const btn = document.getElementById("settingsBtn");
    const panel = document.getElementById("settingsPanel");
    const closeBtn = document.getElementById("closeSettingsBtn");
    btn?.addEventListener('click', () => panel?.classList.toggle('open'));
    closeBtn?.addEventListener('click', () => panel?.classList.remove('open'));
    // Corner rounding slider: live-preview while dragging, commit to history on release
    const roundingSlider = document.getElementById("cornerRounding");
    roundingSlider?.addEventListener('input', () => {
        applyCornerRounding(parseInt(roundingSlider.value));
    });
    roundingSlider?.addEventListener('change', () => {
        const val = parseInt(roundingSlider.value);
        if (!Number.isFinite(val))
            return;
        appState.settings.cornerRounding = val;
        appState.commitState();
    });
    // Visible Days Checkboxes
    const daysContainer = document.getElementById("visibleDaysCheckboxes");
    if (daysContainer) {
        const checkboxes = daysContainer.querySelectorAll('input[type="checkbox"]');
        // Initialize from state (on load)
        hydrateVisibleDayCheckboxes();
        daysContainer.addEventListener('change', () => {
            const selected = [];
            checkboxes.forEach(cb => {
                if (cb.checked)
                    selected.push(parseInt(cb.value));
            });
            // Ensure at least 1 day is visible to prevent breaking
            if (selected.length === 0) {
                const first = checkboxes[0];
                first.checked = true;
                selected.push(parseInt(first.value));
            }
            appState.settings.visibleDays = selected.sort((a, b) => a - b); // Keep Mon-Sun order
            appState.commitState();
            renderGrid();
        });
    }
    // Lunch Break Configuration
    const enableLunchToggle = document.getElementById("enableLunchToggle");
    const lunchStartTime = document.getElementById("lunchStartTimeInput");
    const lunchDuration = document.getElementById("lunchDurationInput");
    if (enableLunchToggle && lunchStartTime && lunchDuration) {
        // Hydrate from State Object (backwards compatibility mapping)
        hydrateLunchControls();
        const updateLunchConfig = () => {
            appState.settings.lunch = {
                enabled: enableLunchToggle.checked,
                startTime: lunchStartTime.value,
                duration: parseInt(lunchDuration.value)
            };
            appState.settings.hideLunchBreak = !enableLunchToggle.checked; // preserve legacy flag
            appState.commitState();
            renderGrid();
        };
        enableLunchToggle.addEventListener('change', updateLunchConfig);
        lunchStartTime.addEventListener('change', updateLunchConfig);
        lunchDuration.addEventListener('change', updateLunchConfig);
    }
    // Global Action Buttons
    document.getElementById("clearAllBtn")?.addEventListener('click', () => {
        appState.days.forEach(day => {
            day.events = [];
        });
        appState.commitState();
        renderGrid();
    });
    // Global Keybinds
    document.addEventListener("keydown", (e) => {
        // Don't hijack undo/redo while the user is typing in a form field —
        // the browser's native text undo must keep working there.
        const target = e.target;
        if (target && (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.tagName === "SELECT" ||
            target.isContentEditable)) {
            return;
        }
        const mod = e.ctrlKey || e.metaKey; // metaKey covers Cmd on macOS
        if (!mod)
            return;
        const key = e.key.toLowerCase();
        if (key === "z" && e.shiftKey) {
            e.preventDefault();
            document.getElementById("redoBtn")?.click();
        }
        else if (key === "z") {
            e.preventDefault();
            document.getElementById("undoBtn")?.click();
        }
        else if (key === "y") {
            e.preventDefault();
            document.getElementById("redoBtn")?.click();
        }
    });
}
function setupPresetTray() {
    // Event delegation for the dynamically injected preset buttons
    document.getElementById("presetTray")?.addEventListener("click", (e) => {
        const target = e.target;
        const btn = target.closest(".preset-btn");
        if (!btn)
            return;
        const subject = btn.dataset.subject;
        const colorHex = btn.dataset.color;
        const duration = 2; // 1 hour
        const targetDay = getNextAvailableDayIndex(duration);
        appState.addEvent(targetDay, {
            id: generateEventId(),
            subject,
            duration: duration,
            colorHex
        });
        renderGrid();
    });
}
// Bootstrap
document.addEventListener("DOMContentLoaded", initApp);
//# sourceMappingURL=app.js.map