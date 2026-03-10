import { appState } from "./state.js";
import { renderGrid } from "./grid.js";
let sortables = [];
export function initializeDragAndDrop() {
    setupResizeAndClickLogic();
    // Re-bind Sortable instances every time the grid completes a render phase
    document.addEventListener("gridRendered", () => {
        sortables.forEach(s => s.destroy());
        sortables = [];
        document.querySelectorAll('.day-bg').forEach((bgEl) => {
            const s = new Sortable(bgEl, {
                group: 'shared',
                animation: 150,
                onEnd: (evt) => {
                    const fromDayIndex = parseInt(evt.from.dataset.day);
                    const toDayIndex = parseInt(evt.to.dataset.day);
                    const oldIndex = evt.oldIndex;
                    const newIndex = evt.newIndex;
                    if (oldIndex === undefined || newIndex === undefined)
                        return;
                    const dayArray = appState.days[fromDayIndex];
                    if (!dayArray)
                        return;
                    const movedEvent = dayArray.events[oldIndex];
                    if (movedEvent) {
                        // Remove from old context
                        dayArray.events.splice(oldIndex, 1);
                        // Insert into new context at the mathematically sorted index
                        appState.days[toDayIndex].events.splice(newIndex, 0, movedEvent);
                        // Commit layout change. (This triggers renderGrid again via stateChanged)
                        appState.commitState();
                    }
                }
            });
            sortables.push(s);
        });
    });
}
function setupResizeAndClickLogic() {
    const container = document.getElementById("timetableGrid");
    let isResizing = false;
    let initialDuration = 0;
    let startY = 0;
    let activeItem = null;
    let _sourceId = "";
    let _sourceDayIndex = -1;
    const ROW_HEIGHT = 62; // roughly 56px height + 6px gap (from styles.css)
    container.addEventListener('pointerdown', (e) => {
        const target = e.target;
        const resizeHandle = target.closest('.resize-handle');
        const item = target.closest('.schedule-item');
        if (!item)
            return;
        _sourceId = item.dataset.id || "";
        _sourceDayIndex = parseInt(item.dataset.day || "-1");
        // If clicking on resize handle directly
        if (resizeHandle) {
            isResizing = true;
            activeItem = item;
            startY = e.clientY;
            const evt = appState.getEvent(_sourceDayIndex, _sourceId);
            initialDuration = evt ? evt.duration : 2;
            container.setPointerCapture(e.pointerId);
            e.preventDefault(); // Stop Sortable from triggering drag when resizing
        }
    });
    container.addEventListener('pointermove', (e) => {
        if (!isResizing || !activeItem)
            return;
        const dy = e.clientY - startY;
        const rowsAdded = Math.round(dy / ROW_HEIGHT);
        let newDuration = initialDuration + rowsAdded;
        if (newDuration < 1)
            newDuration = 1;
        if (newDuration > 10)
            newDuration = 10;
        // Visual morph directly
        const heightCalc = `calc(var(--grid-row-height) * ${newDuration} + var(--grid-row-gap) * ${newDuration - 1})`;
        activeItem.style.flex = `0 0 ${heightCalc}`;
        activeItem.style.height = heightCalc;
        activeItem.style.maxHeight = heightCalc;
        // Give flex container infinite stretching room dynamically during drag
        const parentBg = activeItem.closest('.day-bg');
        if (parentBg)
            parentBg.style.gridRow = `2 / 50`;
    });
    container.addEventListener('pointerup', (e) => {
        if (isResizing && activeItem) {
            container.releasePointerCapture(e.pointerId);
            const dy = e.clientY - startY;
            const rowsAdded = Math.round(dy / ROW_HEIGHT);
            let newDuration = initialDuration + rowsAdded;
            if (newDuration < 1)
                newDuration = 1;
            if (newDuration > 10)
                newDuration = 10;
            appState.updateEvent(_sourceDayIndex, _sourceId, { duration: newDuration });
            isResizing = false;
            activeItem = null;
            renderGrid();
            return;
        }
        // Tap editing logic (Sortable absorbs dragging, so remaining pointerups that aren't dragged map to edits)
        const target = e.target;
        const item = target.closest('.schedule-item');
        // We ensure we didn't just drop from a drag
        if (!isResizing && item && !target.closest('.resize-handle')) {
            const dropTag = item.dataset.id || "";
            const dayTag = parseInt(item.dataset.day || "-1");
            openEditor(dropTag, dayTag);
        }
    });
}
function openEditor(eventId, dayIndex) {
    const evt = new CustomEvent('openEventEditor', { detail: { eventId, dayIndex } });
    document.dispatchEvent(evt);
}
//# sourceMappingURL=dragDrop.js.map