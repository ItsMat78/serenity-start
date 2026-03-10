import { appState } from "./state.js";
import { renderGrid } from "./grid.js";
import { getCurrentTheme, getTheme } from "./themes.js";

let currentEditingEventId: string | null = null;
let currentEditingDayIndex: number = -1;

export function initializeEventEditor() {
    const overlay = document.getElementById("eventEditorOverlay")!;
    const sheet = document.getElementById("eventEditorSheet")!;

    // Close handlers
    overlay.addEventListener('click', closeEditor);
    document.getElementById("cancelEditBtn")?.addEventListener('click', closeEditor);

    // Save Handler
    document.getElementById("saveEditBtn")?.addEventListener('click', saveEditor);
    document.getElementById("deleteEventBtn")?.addEventListener('click', deleteCurrentEvent);

    // Custom Color Click
    document.getElementById("colorPickerTrigger")?.addEventListener('click', () => {
        document.getElementById("eventColor")?.click();
    });

    // Color Input Change
    document.getElementById("eventColor")?.addEventListener('input', (e) => {
        const val = (e.target as HTMLInputElement).value;
        const box = document.getElementById("colorPreviewBox")!;
        box.style.backgroundColor = val;

        // Deselect swatches
        document.querySelectorAll(".theme-swatch").forEach(s => s.classList.remove("selected"));
    });

    // Listen for custom event from dragDrop.ts
    document.addEventListener('openEventEditor', (e: any) => {
        openEditor(e.detail.eventId, e.detail.dayIndex);
    });
}

function openEditor(eventId: string, dayIndex: number) {
    currentEditingEventId = eventId;
    currentEditingDayIndex = dayIndex;

    const evt = appState.getEvent(dayIndex, eventId);
    if (!evt) return;

    // Populate Fields
    (document.getElementById("eventSubject") as HTMLInputElement).value = evt.subject;
    (document.getElementById("eventDuration") as HTMLSelectElement).value = evt.duration.toString();

    // Populate Color
    (document.getElementById("eventColor") as HTMLInputElement).value = evt.colorHex;
    document.getElementById("colorPreviewBox")!.style.backgroundColor = evt.colorHex;

    // Render Swatches
    renderSwatches(evt.colorHex);

    // Show Sheet
    document.getElementById("eventEditorOverlay")!.classList.add('active');
    document.getElementById("eventEditorSheet")!.classList.add('active');
}

function renderSwatches(activeHex: string) {
    const container = document.getElementById("editorSwatches")!;
    const theme = getCurrentTheme();

    let html = '';
    Object.values(theme.subjectColors).forEach((hex) => {
        const isSelected = hex.toLowerCase() === activeHex.toLowerCase() ? "selected" : "";
        html += `<div class="theme-swatch ${isSelected}" data-color="${hex}" style="background-color: ${hex}"></div>`;
    });
    container.innerHTML = html;

    // Attach Listeners
    container.querySelectorAll('.theme-swatch').forEach(sw => {
        sw.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const color = target.dataset.color!;

            // Update custom picker
            (document.getElementById("eventColor") as HTMLInputElement).value = color;
            document.getElementById("colorPreviewBox")!.style.backgroundColor = color;

            // Update UI selection
            container.querySelectorAll('.theme-swatch').forEach(s => s.classList.remove("selected"));
            target.classList.add("selected");
        });
    });
}

function closeEditor() {
    document.getElementById("eventEditorOverlay")!.classList.remove('active');
    document.getElementById("eventEditorSheet")!.classList.remove('active');
    currentEditingEventId = null;
    currentEditingDayIndex = -1;
}

function saveEditor() {
    if (!currentEditingEventId) return;

    const evt = appState.getEvent(currentEditingDayIndex, currentEditingEventId);
    if (!evt) return;

    const subject = (document.getElementById("eventSubject") as HTMLInputElement).value;
    const duration = parseInt((document.getElementById("eventDuration") as HTMLSelectElement).value);
    const colorHex = (document.getElementById("eventColor") as HTMLInputElement).value;

    const oldSubject = evt.subject.trim();
    const newSubject = subject.trim();
    const isSubjectColorChanged = oldSubject !== newSubject || evt.colorHex !== colorHex;

    if (isSubjectColorChanged) {
        let matchingCount = 0;
        appState.days.forEach(day => {
            day.events.forEach(existingEvt => {
                if (existingEvt.subject.trim() === oldSubject && existingEvt.id !== currentEditingEventId) {
                    matchingCount++;
                }
            });
        });

        if (matchingCount > 0) {
            const updateCheck = document.getElementById("updateAllCheck") as HTMLInputElement;
            if (updateCheck && updateCheck.checked) {
                appState.days.forEach(day => {
                    day.events.forEach(existingEvt => {
                        if (existingEvt.subject.trim() === oldSubject && existingEvt.id !== currentEditingEventId) {
                            existingEvt.subject = newSubject;
                            existingEvt.colorHex = colorHex;
                        }
                    });
                });
            }
        }
    }

    // Apply the save
    appState.updateEvent(currentEditingDayIndex, currentEditingEventId, {
        subject: newSubject, duration, colorHex
    });

    renderGrid();
    closeEditor();
}

function deleteCurrentEvent() {
    if (!currentEditingEventId) return;

    appState.removeEvent(currentEditingDayIndex, currentEditingEventId);
    renderGrid();
    closeEditor();
}
