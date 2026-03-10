import { appState } from "./state.js";
import { renderGrid } from "./grid.js";
import { applyTheme, getCurrentTheme } from "./themes.js";
export function saveTimetable() {
    const data = {
        days: appState.days,
        content: {
            subtitle: document.getElementById("subtitleEl").innerText,
            titleLine1: document.getElementById("titleLine1El").innerText,
            titleLine2: document.getElementById("titleLine2El").innerText,
            version: document.getElementById("versionTagEl").innerText,
            footer: document.getElementById("footerEl").innerText,
        },
        settings: {
            themeId: getCurrentTheme().id,
            cornerRounding: parseInt(document.getElementById("cornerRounding").value),
            visibleDays: appState.settings.visibleDays,
            dayLabels: appState.settings.dayLabels,
            hideLunchBreak: appState.settings.hideLunchBreak
        }
    };
    const dataStr = JSON.stringify(data, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "timetable-v3.json";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}
export function loadTimetable(data) {
    if (!data.days || !data.content || !data.settings) {
        alert("Invalid or corrupt timetable file.");
        return;
    }
    // Load Data & Settings
    appState.days = data.days;
    // Merge full settings to handle older versions of save files safely
    appState.settings = { ...appState.settings, ...data.settings };
    // Polyfill Headers directly mapping from legacy content block into auto-save struct
    appState.settings.headers = {
        subtitle: data.content.subtitle,
        title1: data.content.titleLine1,
        title2: data.content.titleLine2,
        version: data.content.version,
        footer: data.content.footer
    };
    // Load Content visually
    document.getElementById("subtitleEl").innerText = data.content.subtitle;
    document.getElementById("titleLine1El").innerText = data.content.titleLine1;
    document.getElementById("titleLine2El").innerText = data.content.titleLine2;
    document.getElementById("versionTagEl").innerText = data.content.version;
    document.getElementById("footerEl").innerText = data.content.footer;
    // Load Settings visually
    applyTheme(data.settings.themeId);
    document.getElementById("cornerRounding").value = data.settings.cornerRounding.toString();
    document.documentElement.style.setProperty("--item-border-radius", `${data.settings.cornerRounding}px`);
    appState.commitState();
    renderGrid();
}
export function initializeStorage() {
    document.getElementById("saveBtn")?.addEventListener("click", saveTimetable);
    const fileInput = document.getElementById("loadFile");
    document.getElementById("loadBtn")?.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result);
                loadTimetable(data);
            }
            catch (err) {
                alert("Failed to parse the file.");
                console.error(err);
            }
        };
        reader.readAsText(file);
        // Reset input so same file can be loaded again if needed
        fileInput.value = "";
    });
}
//# sourceMappingURL=storage.js.map