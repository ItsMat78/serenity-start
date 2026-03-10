export interface TimetableEvent {
    id: string;
    subject: string;
    duration: number; // in 30 minute chunks (e.g., 2 = 1 hour)
    colorHex: string;
}

export interface DaySchedule {
    dayIndex: number; // 0 = Mon, 4 = Fri
    events: TimetableEvent[];
}

export interface SavedTimetable {
    days: DaySchedule[];
    content: {
        subtitle: string;
        titleLine1: string;
        titleLine2: string;
        version: string;
        footer: string;
    };
    settings: {
        themeId: string;
        cornerRounding: number;
        visibleDays: number[]; // e.g. [0, 1, 2, 3, 4] for Mon-Fri
        dayLabels: string[];
        hideLunchBreak: boolean;
        headers?: {
            subtitle: string;
            title1: string;
            title2: string;
            version: string;
            footer: string;
        };
    };
}

export interface ThemePreset {
    id: string;
    name: string;
    bgColor: string;
    textColor: string;
    headerColor: string;
    dayBgColor: string;
    dayBgHover: string;
    uiBgColor: string;
    uiTextColor: string;
    subjectColors: {
        break: string;
        subject1: string;
        subject2: string;
        subject3: string;
        subject4: string;
        subject5: string;
        subject6: string;
        subject7: string;
        subject8: string;
        subject9: string;
        subject10: string;
    };
}
