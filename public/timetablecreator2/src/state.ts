import { TimetableEvent, DaySchedule, SavedTimetable } from "./types.js";
import { getContrastTextColor } from "./themes.js";

export class StateManager {
    days: DaySchedule[] = [];

    settings: {
        themeId: string;
        cornerRounding: number;
        visibleDays: number[];
        dayLabels: string[];
        hideLunchBreak: boolean;
        lunch?: {
            enabled: boolean;
            startTime: string;
            duration: number;
        };
        headers?: {
            subtitle: string;
            title1: string;
            title2: string;
            version: string;
            footer: string;
        };
    } = {
            themeId: "evergreen", // Default 
            cornerRounding: 12,
            visibleDays: [0, 1, 2, 3, 4], // Mon to Fri
            dayLabels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], // Full dictionary
            hideLunchBreak: false,
            lunch: {
                enabled: false,
                startTime: "13:00",
                duration: 60
            },
            headers: {
                subtitle: "B.Tech. Sixth Semester (AI & DS)",
                title1: "TIMETABLE",
                title2: "Spring 2026",
                version: "Ver 1.0 (Feb 2026)",
                footer: "for the DSAI baddies"
            }
        };

    history: string[] = [];
    historyIndex = -1;
    isUndoing = false;

    constructor() {
        this.initEmptyDays();
    }

    initEmptyDays() {
        this.days = [
            { dayIndex: 0, events: [] },
            { dayIndex: 1, events: [] },
            { dayIndex: 2, events: [] },
            { dayIndex: 3, events: [] },
            { dayIndex: 4, events: [] },
            { dayIndex: 5, events: [] }, // Sat
            { dayIndex: 6, events: [] }  // Sun
        ];
    }

    // --- History & Auto-Save ---

    commitState() {
        if (this.isUndoing) return;

        // Take snapshot (deep copy via JSON)
        const snapshot = JSON.stringify({
            days: this.days,
            settings: this.settings
        });

        // If we are not at end of history stack, truncate the future
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }

        this.history.push(snapshot);
        this.historyIndex++;

        // Auto-save to localStorage
        localStorage.setItem("timetable_autosave", snapshot);

        // Dispatch event so UI can re-render if needed
        document.dispatchEvent(new CustomEvent('stateChanged'));
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.restoreSnapshot(this.history[this.historyIndex]);
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.restoreSnapshot(this.history[this.historyIndex]);
        }
    }

    private restoreSnapshot(snapshotStr: string) {
        this.isUndoing = true;
        const snapshot = JSON.parse(snapshotStr);
        this.days = snapshot.days;
        this.settings = snapshot.settings;
        this.isUndoing = false;

        // Save to local storage as the new actual current state
        localStorage.setItem("timetable_autosave", snapshotStr);
        document.dispatchEvent(new CustomEvent('stateChanged'));
    }

    loadAutoSave() {
        const saved = localStorage.getItem("timetable_autosave");
        if (saved) {
            const snapshot = JSON.parse(saved);
            this.days = snapshot.days;
            this.settings = snapshot.settings;

            this.history = [saved];
            this.historyIndex = 0;
            return true;
        }
        return false;
    }

    // Ensures events don't overlap by packing them
    packDay(dayIndex: number) {
        // ... omitted
    }

    addEvent(dayIndex: number, event: TimetableEvent, insertIndex?: number) {
        const day = this.days[dayIndex];
        if (insertIndex !== undefined) {
            day.events.splice(insertIndex, 0, event);
        } else {
            day.events.push(event);
        }
        this.commitState();
    }

    removeEvent(dayIndex: number, eventId: string) {
        const day = this.days[dayIndex];
        const initialLen = day.events.length;
        day.events = day.events.filter(e => e.id !== eventId);
        if (day.events.length < initialLen) this.commitState();
    }

    updateEvent(dayIndex: number, eventId: string, updates: Partial<TimetableEvent>) {
        const day = this.days[dayIndex];
        const evt = day.events.find(e => e.id === eventId);
        if (evt) {
            Object.assign(evt, updates);
            this.commitState();
        }
    }

    getEvent(dayIndex: number, eventId: string): TimetableEvent | undefined {
        return this.days[dayIndex].events.find(e => e.id === eventId);
    }

    moveEvent(fromDay: number, toDay: number, eventId: string, newIndex: number) {
        const sourceDay = this.days[fromDay];
        const evtIndex = sourceDay.events.findIndex(e => e.id === eventId);
        if (evtIndex === -1) return;

        const [evt] = sourceDay.events.splice(evtIndex, 1);

        const destDay = this.days[toDay];
        destDay.events.splice(newIndex, 0, evt);
        this.commitState();
    }

    // --- Dynamic Quick Add Helper ---
    getUniqueSubjects(): { subject: string, colorHex: string }[] {
        const unique = new Map<string, string>();
        this.days.forEach(day => {
            day.events.forEach(evt => {
                const standardized = evt.subject.trim().toLowerCase();
                if (!unique.has(standardized)) {
                    unique.set(standardized, evt.colorHex);
                }
            });
        });

        const result: { subject: string, colorHex: string }[] = [];
        unique.forEach((colorHex, subjectRaw) => {
            // Find the original capitalized version from the DOM or just use the first map entry.
            // Actually, best to iterate again or store the original casing in the map.
        });

        // Let's refine the map logic above.
        const perfectUnique = new Map<string, { subject: string, colorHex: string }>();
        this.days.forEach(day => {
            day.events.forEach(evt => {
                const standardized = evt.subject.trim().toLowerCase();
                if (!perfectUnique.has(standardized)) {
                    perfectUnique.set(standardized, { subject: evt.subject, colorHex: evt.colorHex });
                }
            });
        });

        return Array.from(perfectUnique.values());
    }
}

export const appState = new StateManager();
