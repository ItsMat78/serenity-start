import { appState } from "./state.js";
import { getContrastTextColor } from "./themes.js";

const GRID_START_ROW = 2;

export function renderGrid() {
    const grid = document.getElementById("timetableGrid")!;
    const settings = appState.settings;

    grid.innerHTML = "";

    const colCount = settings.visibleDays.length;
    grid.style.gridTemplateColumns = `repeat(${colCount}, minmax(0, 1fr))`;

    settings.visibleDays.forEach((targetDayIndex, loopIndex) => {
        const colIndex = loopIndex + 1; // 1-indexed for CSS Grid
        const labelName = settings.dayLabels[targetDayIndex] || `Day ${targetDayIndex + 1}`;

        // Header
        const header = document.createElement("div");
        header.className = "day-header";
        header.dataset.day = targetDayIndex.toString();
        header.style.gridColumn = colIndex.toString();
        header.style.gridRow = "1";
        header.innerText = labelName;
        grid.appendChild(header);

        // Count this column's total size locally to hug specifically
        const dayData = appState.days[targetDayIndex];
        if (!dayData) return;

        let totalDurationThisDay = 0;
        let cumulativeRow = GRID_START_ROW;
        dayData.events.forEach(evt => {
            cumulativeRow += evt.duration;
            totalDurationThisDay += evt.duration;
        });

        // Background Dropzone - BECOMES OUR FLEX COLUMN CONTAINER
        const bg = document.createElement("div");
        bg.className = "day-bg dropzone";
        bg.dataset.day = targetDayIndex.toString();
        bg.style.gridColumn = colIndex.toString();
        // Ensure the column always extends to at least 6 PM (16 slots + row offset 2 = 18)
        // to make dragging into empty columns easy.
        const endRow = Math.max(18, cumulativeRow);
        bg.style.gridRow = `2 / ${endRow}`;

        // Turn into flex column container to work natively with SortableJS
        bg.style.display = "flex";
        bg.style.flexDirection = "column";
        bg.style.gap = "var(--grid-row-gap)";
        bg.style.position = "relative";

        let currentRow = GRID_START_ROW;
        dayData.events.forEach((evt) => {

            const itemEl = document.createElement("div");
            itemEl.className = "schedule-item";
            itemEl.dataset.id = evt.id;
            itemEl.dataset.day = targetDayIndex.toString();

            // Sizing via flex base instead of CSS grid start/end
            const heightCalc = `calc(var(--grid-row-height) * ${evt.duration} + var(--grid-row-gap) * ${evt.duration - 1})`;
            itemEl.style.flex = `0 0 ${heightCalc}`;
            itemEl.style.height = heightCalc;
            itemEl.style.maxHeight = heightCalc;
            itemEl.style.backgroundColor = evt.colorHex;
            itemEl.style.color = getContrastTextColor(evt.colorHex);

            if (evt.duration <= 1) {
                itemEl.classList.add("is-small");
            }

            const rowOffset = currentRow - GRID_START_ROW;
            let totalMinutes = rowOffset * 30;

            const lunchObj = appState.settings.lunch || { enabled: !appState.settings.hideLunchBreak, startTime: "13:00", duration: 60 };

            let [lh, lm] = lunchObj.startTime.split(":").map(Number);
            let lunchStartMins = (lh * 60 + lm) - 540; // Min from 9am

            // If this event mathematically starts at or after the lunch line, jump the clock unconditionally!
            // The University timetable physics skips 1-2pm regardless of if the graphical Red Line is visible.
            if (totalMinutes >= lunchStartMins) {
                totalMinutes += lunchObj.duration;
            }

            let hours = 9 + Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            const ampm = hours >= 12 ? "pm" : "am";
            if (hours > 12) hours -= 12;
            if (hours === 0) hours = 12;

            const timeStr = mins === 0 ? `${hours} ${ampm}` : `${hours}:${mins.toString().padStart(2, '0')} ${ampm}`;

            // English Dictionary / Windows Chrome hyphenation fail-safe injection
            const safeSubjectHyphenated = evt.subject.split(' ').map(word => {
                if (word.length > 9 && !word.includes('-')) {
                    const mid = Math.floor(word.length / 2);
                    return word.slice(0, mid) + '&shy;' + word.slice(mid);
                }
                return word;
            }).join(' ');

            itemEl.innerHTML = `
                 <span class="time">${timeStr}</span>
                 <span class="subject" lang="en" style="white-space: normal;">${safeSubjectHyphenated}</span>
                 <div class="resize-handle"></div>
             `;

            bg.appendChild(itemEl);
            currentRow += evt.duration;
        });

        // Overflow Warning Background Color (If a day breaches standard 6pm shift, i.e. 16 valid slots + 1 hr lunch = 9 hours)
        if (totalDurationThisDay > 16) {
            bg.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
            bg.style.border = "1px solid rgba(239, 68, 68, 0.3)";
        }

        grid.appendChild(bg);
    });

    // Render Global Horizontal Lunch Divider
    const lunchObj = appState.settings.lunch || { enabled: !appState.settings.hideLunchBreak, startTime: "13:00", duration: 60 };
    if (lunchObj.enabled) {
        let [lh, lm] = lunchObj.startTime.split(":").map(Number);
        let lunchStartMins = (lh * 60 + lm) - 540;
        const lineOffset = lunchStartMins / 30; // 30min slot units

        const lunchLine = document.createElement("div");
        lunchLine.className = "lunch-line";

        // Use pure absolute top from the bounding box of .timetable-grid, factoring in +1 for the header row
        lunchLine.style.top = `calc(var(--grid-row-height) * ${lineOffset + 1} + var(--grid-row-gap) * ${lineOffset + 1})`;

        const label = document.createElement("div");
        label.className = "lunch-label";
        label.innerText = "LUNCH BREAK";
        lunchLine.appendChild(label);

        grid.appendChild(lunchLine);
    }

    // Auto-shrink text routine so text never overflows vertically, but allows horizontal hyphenation
    requestAnimationFrame(() => {
        document.querySelectorAll('.schedule-item').forEach((node) => {
            const container = node as HTMLElement;
            const textEl = container.querySelector('.subject') as HTMLElement;
            if (!textEl) return;

            let currentSize = 16; // Start at 1rem 
            // Only shrink if it physically breaches the vertical or horizontal bounds
            while ((container.scrollHeight > container.clientHeight || container.scrollWidth > container.clientWidth) && currentSize > 8) {
                currentSize--;
                textEl.style.fontSize = `${currentSize}px`;
            }
        });

        // Trigger drag-and-drop library rebinding now that DOM is completely generated
        document.dispatchEvent(new CustomEvent("gridRendered"));
    });
}
