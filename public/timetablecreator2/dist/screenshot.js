import { getCurrentTheme } from "./themes.js";
function generateScreenshotFilename() {
    const title1 = document.getElementById("titleLine1El")?.innerText?.trim() || "";
    const title2 = document.getElementById("titleLine2El")?.innerText?.trim() || "";
    const version = document.getElementById("versionTagEl")?.innerText?.trim() || "";
    const themeName = getCurrentTheme()?.name || "";
    const now = new Date();
    const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    // Combine parts, filter empties, sanitize for filenames
    const parts = [title1, title2, version, themeName, date]
        .map(s => s.replace(/[^\w\s-]/g, "").trim())
        .filter(Boolean)
        .map(s => s.replace(/\s+/g, "_"));
    return (parts.join("_") || "timetable") + ".png";
}
export function initializeScreenshot() {
    const screenshotBtn = document.getElementById("screenshotBtn");
    const exportModalOverlay = document.getElementById("exportModalOverlay");
    const exportModalDialog = document.getElementById("exportModalDialog");
    const closeExportBtn = document.getElementById("closeExportBtn");
    const generatePreviewBtn = document.getElementById("generatePreviewBtn");
    const downloadScreenshotBtn = document.getElementById("downloadScreenshotBtn");
    const previewContainer = document.getElementById("previewContainer");
    const exportPreviewImage = document.getElementById("exportPreviewImage");
    const exportWidthInput = document.getElementById("exportWidthInput");
    const exportHeightInput = document.getElementById("exportHeightInput");
    const loadingSpinner = document.getElementById("exportLoadingSpinner");
    let currentDataUrl = null;
    function openModal() {
        if (previewContainer)
            previewContainer.style.display = "none";
        if (exportPreviewImage)
            exportPreviewImage.src = "";
        currentDataUrl = null;
        exportModalOverlay?.classList.add("active");
        exportModalDialog?.classList.add("active");
    }
    function closeModal() {
        exportModalOverlay?.classList.remove("active");
        exportModalDialog?.classList.remove("active");
        if (loadingSpinner)
            loadingSpinner.style.display = "none";
    }
    screenshotBtn?.addEventListener("click", openModal);
    exportModalOverlay?.addEventListener("click", closeModal);
    closeExportBtn?.addEventListener("click", closeModal);
    generatePreviewBtn?.addEventListener("click", async () => {
        const w = parseInt(exportWidthInput?.value || "1080", 10);
        const h = parseInt(exportHeightInput?.value || "2400", 10);
        if (loadingSpinner)
            loadingSpinner.style.display = "block";
        if (previewContainer)
            previewContainer.style.display = "none";
        // Add screenshot-mode class to body to trigger CSS overrides
        document.body.classList.add("screenshot-mode");
        // Wait a tiny bit for reflow and animations to finish
        await new Promise(r => setTimeout(r, 150));
        try {
            const container = document.querySelector(".timetable-container");
            if (!container)
                throw new Error("Could not find grid container");
            // Responsiveness Fix: Remove max-width so the container natively takes the exact phone width
            const originalWidth = container.style.width;
            const originalMaxWidth = container.style.maxWidth;
            const originalMinHeight = container.style.minHeight;
            container.style.maxWidth = "none";
            container.style.width = `${w}px`;
            container.style.minHeight = `${h}px`; // Fills entire phone screen lockscreen height automatically if shorter!
            // Let the DOM natively recalculate layouts based on cqw sizes with the new exact pixel width
            await new Promise(r => setTimeout(r, 100));
            // Add screenshot context specifically to container
            container.classList.add("screenshot-mode");
            const captureTarget = container;
            const captureWidth = w;
            const captureHeight = Math.max(h, container.scrollHeight); // Take all the space it needs!
            // Serialize and capture
            const dataUrl = await domtoimage.toPng(captureTarget, {
                width: captureWidth,
                height: captureHeight,
                style: {
                    width: `${captureWidth}px`,
                    height: `${captureHeight}px`,
                    // No transforms! Purely native edge-to-edge!
                },
                filter: (node) => {
                    if (node.classList && (node.classList.contains("ignore-screenshot") ||
                        node.classList.contains("resize-handle"))) {
                        return false;
                    }
                    return true;
                }
            });
            // Cleanup & Revert DOM modifications perfectly
            container.style.width = originalWidth;
            container.style.maxWidth = originalMaxWidth;
            container.style.minHeight = originalMinHeight;
            container.classList.remove("screenshot-mode");
            // Display in explicit preview UI
            currentDataUrl = dataUrl;
            if (exportPreviewImage)
                exportPreviewImage.src = dataUrl;
            if (previewContainer)
                previewContainer.style.display = "flex";
        }
        catch (err) {
            console.error("Screenshot failed", err);
            alert("Failed to generate screenshot.");
            // Revert layout locking on error
            const container = document.querySelector(".timetable-container");
            if (container) {
                container.style.width = "";
                container.style.maxWidth = "480px";
            }
        }
        finally {
            // Revert DOM
            document.body.classList.remove("screenshot-mode");
            const cleanupContainer = document.querySelector(".timetable-container");
            if (cleanupContainer)
                cleanupContainer.classList.remove("screenshot-mode");
            if (loadingSpinner)
                loadingSpinner.style.display = "none";
        }
    });
    downloadScreenshotBtn?.addEventListener("click", () => {
        if (!currentDataUrl)
            return;
        const link = document.createElement("a");
        link.download = generateScreenshotFilename();
        link.href = currentDataUrl;
        link.click();
        closeModal();
    });
}
//# sourceMappingURL=screenshot.js.map