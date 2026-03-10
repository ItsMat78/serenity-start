import { ThemePreset } from "./types.js";
import { appState } from "./state.js";

export const themes: Record<string, ThemePreset> = {
    evergreen: {
        id: "evergreen",
        name: "Evergreen",
        bgColor: "#0f4a38",
        textColor: "#e8f2d9",
        headerColor: "#d9e47a",
        dayBgColor: "rgba(0,0,0,0.12)",
        dayBgHover: "rgba(255,255,255,0.05)",
        uiBgColor: "rgba(255, 255, 255, 0.95)",
        uiTextColor: "#1a1a1a",
        subjectColors: {
            break: "#e8f2d9",
            subject1: "#9bc55f",
            subject2: "#86a8ae",
            subject3: "#b8cc6a",
            subject4: "#66c064",
            subject5: "#eadf8a",
            subject6: "#f4a261",
            subject7: "#e76f51",
            subject8: "#2a9d8f",
            subject9: "#e9c46a",
            subject10: "#264653"
        }
    },
    midnightGlass: {
        id: "midnightGlass",
        name: "Midnight Glass",
        bgColor: "#0b1021",
        textColor: "#e2e8f0",
        headerColor: "#93c5fd",
        dayBgColor: "rgba(255,255,255,0.03)",
        dayBgHover: "rgba(255,255,255,0.1)",
        uiBgColor: "rgba(11, 16, 33, 0.95)",
        uiTextColor: "#e2e8f0",
        subjectColors: {
            break: "#1e293b",
            subject1: "#3b82f6",
            subject2: "#8b5cf6",
            subject3: "#ec4899",
            subject4: "#10b981",
            subject5: "#f59e0b",
            subject6: "#ef4444",
            subject7: "#06b6d4",
            subject8: "#6366f1",
            subject9: "#14b8a6",
            subject10: "#f43f5e"
        }
    },
    pastelMinimal: {
        id: "pastelMinimal",
        name: "Pastel Minimalist",
        bgColor: "#faf9f6",
        textColor: "#4b5563",
        headerColor: "#8b5cf6",
        dayBgColor: "rgba(0,0,0,0.02)",
        dayBgHover: "rgba(0,0,0,0.05)",
        uiBgColor: "rgba(255, 255, 255, 0.95)",
        uiTextColor: "#4b5563",
        subjectColors: {
            break: "#f3f4f6",
            subject1: "#fdba74",
            subject2: "#a7f3d0",
            subject3: "#bfdbfe",
            subject4: "#fbcfe8",
            subject5: "#d9f99d",
            subject6: "#fde047",
            subject7: "#c4b5fd",
            subject8: "#99f6e4",
            subject9: "#fecaca",
            subject10: "#fed7aa"
        }
    },
    neobrutalism: {
        id: "neobrutalism",
        name: "Neobrutalism",
        bgColor: "#f4f0e1",
        textColor: "#111111",
        headerColor: "#ff3b30",
        dayBgColor: "#ffffff",
        dayBgHover: "#fbe8e6",
        uiBgColor: "#ffffff",
        uiTextColor: "#111111",
        subjectColors: {
            break: "#e5e5e5",
            subject1: "#ff90e8",
            subject2: "#ffe227",
            subject3: "#4ade80",
            subject4: "#60a5fa",
            subject5: "#c084fc",
            subject6: "#fb923c",
            subject7: "#2dd4bf",
            subject8: "#f472b6",
            subject9: "#a3e635",
            subject10: "#818cf8"
        }
    },
    deepSpace: {
        id: "deepSpace",
        name: "Deep Space",
        bgColor: "#09090b",
        textColor: "#f4f4f5",
        headerColor: "#c084fc",
        dayBgColor: "rgba(255, 255, 255, 0.05)",
        dayBgHover: "rgba(255, 255, 255, 0.08)",
        uiBgColor: "rgba(9, 9, 11, 0.95)",
        uiTextColor: "#f4f4f5",
        subjectColors: {
            break: "#27272a",
            subject1: "#3b82f6",
            subject2: "#8b5cf6",
            subject3: "#eab308",
            subject4: "#ec4899",
            subject5: "#06b6d4",
            subject6: "#10b981",
            subject7: "#f59e0b",
            subject8: "#84cc16",
            subject9: "#6366f1",
            subject10: "#f43f5e"
        }
    },
    cloudSoft: {
        id: "cloudSoft",
        name: "Cloud Soft",
        bgColor: "#f0fdfa",
        textColor: "#334155",
        headerColor: "#0ea5e9",
        dayBgColor: "rgba(241, 245, 249, 0.7)",
        dayBgHover: "rgba(241, 245, 249, 1)",
        uiBgColor: "rgba(255, 255, 255, 0.95)",
        uiTextColor: "#334155",
        subjectColors: {
            break: "#f8fafc",
            subject1: "#bae6fd",
            subject2: "#fed7aa",
            subject3: "#a7f3d0",
            subject4: "#e9d5ff",
            subject5: "#fecdd3",
            subject6: "#fef08a",
            subject7: "#bbf7d0",
            subject8: "#c7d2fe",
            subject9: "#fbcfe8",
            subject10: "#99f6e4"
        }
    },
    monochrome: {
        id: "monochrome",
        name: "Monochrome e-Ink",
        bgColor: "#ffffff",
        textColor: "#000000",
        headerColor: "#000000",
        dayBgColor: "#f4f4f5",
        dayBgHover: "#e4e4e7",
        uiBgColor: "#ffffff",
        uiTextColor: "#000000",
        subjectColors: {
            break: "#ffffff",
            subject1: "#18181b",
            subject2: "#3f3f46",
            subject3: "#71717a",
            subject4: "#a1a1aa",
            subject5: "#d4d4d8",
            subject6: "#27272a",
            subject7: "#52525b",
            subject8: "#e4e4e7",
            subject9: "#f4f4f5",
            subject10: "#fafafa"
        }
    },
    cyberpunk: {
        id: "cyberpunk",
        name: "Cyberpunk 2077",
        bgColor: "#09090b",
        textColor: "#fcee0a",
        headerColor: "#00f0ff",
        dayBgColor: "rgba(252, 238, 10, 0.05)",
        dayBgHover: "rgba(252, 238, 10, 0.1)",
        uiBgColor: "rgba(9, 9, 11, 0.95)",
        uiTextColor: "#fcee0a",
        subjectColors: {
            break: "#27272a",
            subject1: "#ff003c",
            subject2: "#00f0ff",
            subject3: "#fcee0a",
            subject4: "#bf00ff",
            subject5: "#ff00a0",
            subject6: "#00ff66",
            subject7: "#ff5500",
            subject8: "#00ccff",
            subject9: "#ccff00",
            subject10: "#ff0055"
        }
    },
    glassmorphism: {
        id: "glassmorphism",
        name: "Frosted Glass",
        bgColor: "#e0c3fc",
        textColor: "#ffffff",
        headerColor: "#ffffff",
        dayBgColor: "rgba(255, 255, 255, 0.1)",
        dayBgHover: "rgba(255, 255, 255, 0.2)",
        uiBgColor: "rgba(255, 255, 255, 0.25)",
        uiTextColor: "#333333",
        subjectColors: {
            break: "rgba(255, 255, 255, 0.15)",
            subject1: "rgba(255, 255, 255, 0.25)",
            subject2: "rgba(255, 255, 255, 0.35)",
            subject3: "rgba(255, 255, 255, 0.45)",
            subject4: "rgba(255, 255, 255, 0.55)",
            subject5: "rgba(255, 255, 255, 0.65)",
            subject6: "rgba(255, 255, 255, 0.75)",
            subject7: "rgba(200, 200, 255, 0.45)",
            subject8: "rgba(255, 200, 255, 0.45)",
            subject9: "rgba(200, 255, 200, 0.45)",
            subject10: "rgba(255, 255, 200, 0.45)"
        }
    },
    vintage: {
        id: "vintage",
        name: "Vintage Academic",
        bgColor: "#f4ecd8",
        textColor: "#3e2723",
        headerColor: "#5d4037",
        dayBgColor: "rgba(93, 64, 55, 0.05)",
        dayBgHover: "rgba(93, 64, 55, 0.1)",
        uiBgColor: "#f4ecd8",
        uiTextColor: "#3e2723",
        subjectColors: {
            break: "#ebd5b3",
            subject1: "#d7ccc8",
            subject2: "#bcaaa4",
            subject3: "#a1887f",
            subject4: "#8d6e63",
            subject5: "#795548",
            subject6: "#5d4037",
            subject7: "#feebd9",
            subject8: "#e6c8a6",
            subject9: "#cbb092",
            subject10: "#b0997f"
        }
    }
};

let currentThemeId = "evergreen";

export function getTheme(id: string): ThemePreset {
    return themes[id] || themes.evergreen;
}

export function getCurrentTheme(): ThemePreset {
    return themes[currentThemeId];
}

export function applyTheme(id: string) {
    const oldTheme = getTheme(appState.settings.themeId || currentThemeId);
    const newTheme = getTheme(id);
    currentThemeId = newTheme.id;
    appState.settings.themeId = newTheme.id;

    // Dynamically Shift Event Colors based on mappings
    let stateChanged = false;
    appState.days.forEach(day => {
        day.events.forEach(evt => {
            const oldHex = evt.colorHex.toLowerCase();
            let matchedKey: string | null = null;

            // Look up the exact token key (subject1, break, etc) in the OLD theme that matches this hex
            for (const [key, hexValue] of Object.entries(oldTheme.subjectColors)) {
                if ((hexValue as string).toLowerCase() === oldHex) {
                    matchedKey = key;
                    break;
                }
            }

            // Apply the new theme's respective token hex to this event
            if (matchedKey && (newTheme.subjectColors as any)[matchedKey]) {
                const newHex = (newTheme.subjectColors as any)[matchedKey];
                if (evt.colorHex !== newHex) {
                    evt.colorHex = newHex;
                    stateChanged = true;
                }
            }
        });
    });

    if (stateChanged) {
        // Just directly trigger the data snapshot because we mutated events safely
        // Wait, app.ts already fires commitState immediately after applyTheme in the selector button, 
        // so we don't need to recursively commit here. 
    }

    const root = document.documentElement;
    root.style.setProperty("--bg-color", newTheme.bgColor);
    root.style.setProperty("--text-color", newTheme.textColor);
    root.style.setProperty("--header-color", newTheme.headerColor);
    root.style.setProperty("--day-bg-color", newTheme.dayBgColor);
    root.style.setProperty("--day-bg-hover", newTheme.dayBgHover);
    root.style.setProperty("--ui-bg", newTheme.uiBgColor);
    root.style.setProperty("--ui-text", newTheme.uiTextColor);

    // Set a data-attribute for CSS to hook into structural theme changes
    root.setAttribute("data-theme", newTheme.id);

    // Give the DOM a tiny specific repaint moment before doing heavy operations
    setTimeout(() => {
        // Also re-render preset tray buttons with new colors
        renderPresetTray(newTheme);

        // Dispatch theme change event so other components know colors changed
        document.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme.id }));
    }, 0);
}

export function renderPresetTray(theme?: ThemePreset) {
    if (!theme) theme = getCurrentTheme();
    const tray = document.getElementById("presetTray");
    if (!tray) return;

    const uniqueSubjects = appState.getUniqueSubjects();

    let presetHtml = `<p class="tray-label">Quick Add:</p><div class="preset-scroll">`;

    // If the timetable is completely empty, offer themes' default subjects
    if (uniqueSubjects.length === 0) {
        presetHtml += `
           <button class="preset-btn" data-subject="Break" data-color="${theme.subjectColors.break}" style="background-color: ${theme.subjectColors.break}; color: ${getContrastTextColor(theme.subjectColors.break)}">Break</button>
           <button class="preset-btn" data-subject="Data Structures" data-color="${theme.subjectColors.subject1}" style="background-color: ${theme.subjectColors.subject1}; color: ${getContrastTextColor(theme.subjectColors.subject1)}">Data Structures</button>
           <button class="preset-btn" data-subject="DBMS" data-color="${theme.subjectColors.subject2}" style="background-color: ${theme.subjectColors.subject2}; color: ${getContrastTextColor(theme.subjectColors.subject2)}">DBMS</button>
        `;
    } else {
        // Render buttons for every unique subject found in the grid
        uniqueSubjects.forEach(s => {
            presetHtml += `<button class="preset-btn" data-subject="${s.subject}" data-color="${s.colorHex}" style="background-color: ${s.colorHex}; color: ${getContrastTextColor(s.colorHex)}">${s.subject}</button>`;
        });
    }

    presetHtml += `</div>`;
    tray.innerHTML = presetHtml;
}

/** Utility to generate accessible text color */
export function getContrastTextColor(hexColor: string): string {
    let DARK = "#1a2a2a";
    let LIGHT = "#f6f9ef";

    try {
        const theme = getCurrentTheme();
        if (theme) {
            if (theme.id === "cyberpunk") {
                DARK = "#09090b";
                LIGHT = "#ffffff";
            } else if (theme.id === "vintage") {
                DARK = "#111111";
                LIGHT = "#ffffff";
            } else if (theme.id === "neobrutalism") {
                DARK = "#111111";
                LIGHT = "#ffffff";
            } else if (theme.id === "midnightGlass" || theme.id === "deepSpace") {
                DARK = "#0f172a";
                LIGHT = "#f8fafc";
            } else if (theme.id === "monochrome") {
                DARK = "#000000";
                LIGHT = "#ffffff";
            } else {
                LIGHT = theme.textColor;
            }
        }
    } catch (e) { }

    // Simple hex to rgb
    let h = hexColor.replace("#", "").toLowerCase();
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);

    const relLuminance = (r: number, g: number, b: number) => {
        const [R, G, B] = [r, g, b].map((v) => {
            const s = v / 255;
            return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * R + 0.7152 * G + 0.0722 * B;
    };

    const bgL = relLuminance(r, g, b);
    return bgL < 0.5 ? LIGHT : DARK;
}
