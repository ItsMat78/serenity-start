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
    const exportTriggers = document.querySelectorAll(".export-trigger");
    const loadingSpinner = document.getElementById("exportLoadingSpinner");
    function openModal() {
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
    exportTriggers.forEach(btn => {
        btn.addEventListener("click", async (e) => {
            const target = e.currentTarget;
            const resMode = target.getAttribute("data-res") || "auto";
            if (loadingSpinner)
                loadingSpinner.style.display = "block";
            // Add screenshot-mode class to body to trigger CSS overrides
            document.body.classList.add("screenshot-mode");
            // Wait a tiny bit for reflow and animations to finish
            await new Promise(r => setTimeout(r, 150));
            try {
                const container = document.querySelector(".timetable-container");
                if (!container)
                    throw new Error("Could not find grid container");
                // Add screenshot context specifically to container
                container.classList.add("screenshot-mode");
                const originalParent = container.parentNode;
                const originalNextSibling = container.nextSibling;
                let captureTarget;
                let frame = null;
                let captureWidth;
                let captureHeight;
                let exportScale = 1;
                if (resMode === "auto") {
                    // AUTO-CROP: Capture the container directly — no frame, no extra padding.
                    // The timetable fills the entire screenshot edge-to-edge.
                    captureTarget = container;
                    captureWidth = container.scrollWidth;
                    captureHeight = container.scrollHeight;
                    exportScale = 2; // High DPI
                }
                else {
                    // WALLPAPER / FULL DEVICE RESOLUTION — use a frame to center on canvas
                    frame = document.createElement("div");
                    frame.style.backgroundColor = getComputedStyle(document.body).backgroundColor;
                    frame.style.display = "flex";
                    frame.style.justifyContent = "center";
                    frame.style.alignItems = "center";
                    frame.style.boxSizing = "border-box";
                    const [w, h] = resMode.split("x").map(Number);
                    captureWidth = w;
                    captureHeight = h;
                    exportScale = 1; // 1:1 Pixel Mapping for the target device
                    frame.style.width = `${captureWidth}px`;
                    frame.style.height = `${captureHeight}px`;
                    frame.style.position = "relative";
                    frame.style.overflow = "hidden"; // Act exactly like a rigid phone screen
                    // Calculate optical scale factor so timetable perfectly fills the screen
                    const BASE_WIDTH = 540;
                    const timetableRawHeight = container.scrollHeight;
                    // How much to scale it to fill width
                    const scaleToWidth = captureWidth / BASE_WIDTH;
                    // How much to scale it to fit height without clipping
                    const scaleToHeight = captureHeight / timetableRawHeight;
                    // Pick the smallest scale so it fits on screens without overflowing, keeping a 8% aesthetic safety margin
                    const finalScale = Math.min(scaleToWidth, scaleToHeight) * 0.92;
                    container.style.transform = `scale(${finalScale})`;
                    container.style.transformOrigin = "center center";
                    // Inject wrapper structurally
                    if (originalParent)
                        originalParent.insertBefore(frame, container);
                    frame.appendChild(container);
                    captureTarget = frame;
                }
                // Measure the actual rendered size
                const renderWidth = captureWidth;
                const renderHeight = resMode === "auto" ? captureTarget.scrollHeight : captureHeight;
                // Use dom-to-image-more — it serializes the DOM into SVG foreignObject
                // and lets the browser render it natively, so ALL CSS features work:
                // box-shadow, mix-blend-mode, backdrop-filter, etc.
                const dataUrl = await domtoimage.toPng(captureTarget, {
                    width: renderWidth * exportScale,
                    height: renderHeight * exportScale,
                    style: {
                        transform: `scale(${exportScale})`,
                        transformOrigin: "top left",
                        width: `${renderWidth}px`,
                        height: `${renderHeight}px`,
                    },
                    // Filter out elements we don't want in the screenshot
                    filter: (node) => {
                        if (node.classList && (node.classList.contains("ignore-screenshot") ||
                            node.classList.contains("resize-handle"))) {
                            return false;
                        }
                        return true;
                    }
                });
                // Cleanup & Revert DOM modifications perfectly
                container.style.transform = "";
                container.style.transformOrigin = "";
                if (frame) {
                    if (originalParent) {
                        if (originalNextSibling) {
                            originalParent.insertBefore(container, originalNextSibling);
                        }
                        else {
                            originalParent.appendChild(container);
                        }
                    }
                    frame.remove();
                }
                const link = document.createElement("a");
                link.download = generateScreenshotFilename();
                link.href = dataUrl;
                link.click();
                closeModal();
            }
            catch (err) {
                console.error("Screenshot failed", err);
                alert("Failed to generate screenshot.");
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
    });
}
//# sourceMappingURL=screenshot.js.map