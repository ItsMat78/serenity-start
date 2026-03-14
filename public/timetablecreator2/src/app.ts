import { appState } from "./state.js";
import { renderGrid } from "./grid.js";
import { applyTheme, themes, renderPresetTray } from "./themes.js";
import { initializeDragAndDrop } from "./dragDrop.js";
import { initializeEventEditor } from "./eventEditor.js";
import { initializeStorage } from "./storage.js";
import { initializeScreenshot } from "./screenshot.js";

function getNextAvailableDayIndex(eventDuration: number): number {
    for (const dayIndex of appState.settings.visibleDays) {
        const dayData = appState.days[dayIndex];
        if (!dayData) continue;
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
    } else {
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
            id: "evt_" + Date.now(),
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

    // Global listener for state changes (history traversal)
    document.addEventListener("stateChanged", () => {
        renderGrid();
        // Update UI of undo/redo buttons if needed (disabled states)
        const undoBtn = document.getElementById("undoBtn") as HTMLButtonElement;
        const redoBtn = document.getElementById("redoBtn") as HTMLButtonElement;
        if (undoBtn) undoBtn.disabled = appState.historyIndex <= 0;
        if (redoBtn) redoBtn.disabled = appState.historyIndex >= appState.history.length - 1;

        // Refresh preset tray dynamically on state change so new subjects appear
        renderPresetTray();
    });

    // Dedicated listener for theme UI updates
    document.addEventListener("themeChanged", () => {
        renderPresetTray();
    });

    // Run first layout
    renderGrid();
}

function renderThemeSettingsSelector() {
    const selector = document.getElementById("themeSelector")!;
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

    // Active state
    const cards = selector.querySelectorAll(".theme-option-card");
    cards[0].classList.add("active"); // evergreen is default in html

    cards.forEach(card => {
        card.addEventListener('click', (e) => {
            const target = (e.currentTarget as HTMLElement);
            const id = target.dataset.id!;

            // Reapply theme and save to state
            applyTheme(id);
            appState.settings.themeId = id;
            appState.commitState();

            // Visual refresh
            cards.forEach(c => c.classList.remove("active"));
            target.classList.add("active");
            renderGrid(); // Refresh colors on grid
        });
    });
}

function setupHeaderEditors() {
    const editBtn = document.getElementById("editHeaderBtn");
    const modal = document.getElementById("headerEditorModal");

    // Inputs
    const sub = document.getElementById("editSubtitle") as HTMLInputElement;
    const t1 = document.getElementById("editTitle1") as HTMLInputElement;
    const t2 = document.getElementById("editTitle2") as HTMLInputElement;
    const vers = document.getElementById("editVersion") as HTMLInputElement;
    const foot = document.getElementById("editFooter") as HTMLTextAreaElement;

    // Output Elements
    const subEl = document.getElementById("subtitleEl")!;
    const t1El = document.getElementById("titleLine1El")!;
    const t2El = document.getElementById("titleLine2El")!;
    const versEl = document.getElementById("versionTagEl")!;
    const footEl = document.getElementById("footerEl")!;

    // Initial render from state if it exists
    if (appState.settings.headers) {
        subEl.innerText = appState.settings.headers.subtitle;
        t1El.innerText = appState.settings.headers.title1;
        t2El.innerText = appState.settings.headers.title2;
        versEl.innerText = appState.settings.headers.version;
        footEl.innerText = appState.settings.headers.footer;
    }

    editBtn?.addEventListener("click", () => {
        sub.value = subEl.innerText;
        t1.value = t1El.innerText;
        t2.value = t2El.innerText;
        vers.value = versEl.innerText;
        foot.value = footEl.innerText;
        modal?.classList.add("active");
    });

    document.getElementById("cancelHeaderEdit")?.addEventListener("click", () => {
        modal?.classList.remove("active");
    });

    document.getElementById("saveHeaderEdit")?.addEventListener("click", () => {
        subEl.innerText = sub.value;
        t1El.innerText = t1.value;
        t2El.innerText = t2.value;
        versEl.innerText = vers.value;
        footEl.innerText = foot.value;
        modal?.classList.remove("active");

        appState.settings.headers = {
            subtitle: sub.value,
            title1: t1.value,
            title2: t2.value,
            version: vers.value,
            footer: foot.value
        };
        appState.commitState();
    });
}

function setupSettingsPanel() {
    const btn = document.getElementById("settingsBtn");
    const panel = document.getElementById("settingsPanel");
    const closeBtn = document.getElementById("closeSettingsBtn");

    btn?.addEventListener('click', () => panel?.classList.toggle('open'));
    closeBtn?.addEventListener('click', () => panel?.classList.remove('open'));

    // Corner rounding slider
    document.getElementById("cornerRounding")?.addEventListener('input', (e) => {
        const val = (e.target as HTMLInputElement).value;
        document.documentElement.style.setProperty("--item-border-radius", `${val}px`);
    });

    // Visible Days Checkboxes
    const daysContainer = document.getElementById("visibleDaysCheckboxes");
    if (daysContainer) {
        const checkboxes = daysContainer.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');

        // Initialize from state (on load)
        checkboxes.forEach(cb => {
            const dayIndex = parseInt(cb.value);
            cb.checked = appState.settings.visibleDays.includes(dayIndex);
        });

        daysContainer.addEventListener('change', () => {
            const selected: number[] = [];
            checkboxes.forEach(cb => {
                if (cb.checked) selected.push(parseInt(cb.value));
            });

            // Ensure at least 1 day is visible to prevent breaking
            if (selected.length === 0) {
                const first = checkboxes[0];
                first.checked = true;
                selected.push(parseInt(first.value));
            }

            appState.settings.visibleDays = selected.sort(); // Keep Mon-Sun order
            appState.commitState();
            renderGrid();
        });
    }

    // Lunch Break Configuration
    const enableLunchToggle = document.getElementById("enableLunchToggle") as HTMLInputElement;
    const lunchStartTime = document.getElementById("lunchStartTimeInput") as HTMLInputElement;
    const lunchDuration = document.getElementById("lunchDurationInput") as HTMLSelectElement;

    if (enableLunchToggle && lunchStartTime && lunchDuration) {
        // Hydrate from State Object (backwards compatibility mapping)
        const lunchConfig = appState.settings.lunch || {
            enabled: !appState.settings.hideLunchBreak,
            startTime: "13:00",
            duration: 60
        };

        enableLunchToggle.checked = lunchConfig.enabled;
        lunchStartTime.value = lunchConfig.startTime;
        lunchDuration.value = lunchConfig.duration.toString();

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
        if (e.ctrlKey && e.key.toLowerCase() === "z") {
            e.preventDefault();
            document.getElementById("undoBtn")?.click();
        }
        if (e.ctrlKey && e.key.toLowerCase() === "y") {
            e.preventDefault();
            document.getElementById("redoBtn")?.click();
        }
    });
}

function setupPresetTray() {
    // Event delegation for the dynamically injected preset buttons
    document.getElementById("presetTray")?.addEventListener("click", (e) => {
        const target = e.target as HTMLElement;
        const btn = target.closest(".preset-btn") as HTMLElement;
        if (!btn) return;

        const subject = btn.dataset.subject!;
        const colorHex = btn.dataset.color!;

        const duration = 2; // 1 hour
        const targetDay = getNextAvailableDayIndex(duration);
        appState.addEvent(targetDay, {
            id: "evt_" + Date.now() + Math.floor(Math.random() * 100),
            subject,
            duration: duration,
            colorHex
        });

        renderGrid();
    });
}

// Bootstrap
document.addEventListener("DOMContentLoaded", initApp);
