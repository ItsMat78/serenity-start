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
            // Add screenshot-mode class to body to trigger CSS overrides (hides controls, expands size)
            document.body.classList.add("screenshot-mode");
            // Wait a tiny bit for reflow and animations to finish
            await new Promise(r => setTimeout(r, 150));
            try {
                const container = document.querySelector(".timetable-container");
                if (!container)
                    throw new Error("Could not find grid container");
                let targetWidth = 540;
                let targetOutW = 0, targetOutH = 0;
                if (resMode !== "auto") {
                    const [w, h] = resMode.split("x").map(Number);
                    targetOutW = w;
                    targetOutH = h;
                    targetWidth = w / 2; // Map 1080 target to 540px physical CSS bounds
                    const targetRatio = h / w; // e.g., 2.222
                    let currentHeight = container.scrollHeight;
                    if (currentHeight / targetWidth > targetRatio) {
                        // Timetable is exceptionally tall. Widen the CSS box to match the target phone aspect ratio, completely eliminating horizontal padding/letterboxing.
                        targetWidth = currentHeight / targetRatio;
                        container.style.width = `${targetWidth}px`;
                        container.style.maxWidth = `${targetWidth}px`;
                        // Text reflows could slightly change height, recalc once
                        currentHeight = container.scrollHeight;
                        targetWidth = currentHeight / targetRatio;
                        container.style.width = `${targetWidth}px`;
                        container.style.maxWidth = `${targetWidth}px`;
                        container.style.minHeight = `${currentHeight}px`;
                    }
                    else {
                        // Force container to structurally pad if it is too short natively
                        container.style.minHeight = `${targetWidth * targetRatio}px`;
                        container.style.justifyContent = "space-between";
                    }
                }
                // Capture the full natural height, ignoring strict target boundaries so html2canvas NEVER mathematically truncates overflow.
                const captureHeight = container.scrollHeight;
                const rawCanvas = await html2canvas(container, {
                    width: targetWidth,
                    windowWidth: targetWidth,
                    height: captureHeight,
                    windowHeight: captureHeight,
                    scale: 2, // Up-rez 540px virtual canvas into pristine High DPI Output
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: getComputedStyle(document.body).backgroundColor,
                });
                let finalCanvas = rawCanvas;
                if (resMode !== "auto") {
                    finalCanvas = document.createElement("canvas");
                    finalCanvas.width = targetOutW;
                    finalCanvas.height = targetOutH;
                    const ctx = finalCanvas.getContext("2d");
                    if (ctx) {
                        ctx.fillStyle = getComputedStyle(document.body).backgroundColor || "#000";
                        ctx.fillRect(0, 0, targetOutW, targetOutH);
                        // Object-fit: contain scaling mathematics
                        const scale = Math.min(targetOutW / rawCanvas.width, targetOutH / rawCanvas.height);
                        const scaledW = rawCanvas.width * scale;
                        const scaledH = rawCanvas.height * scale;
                        const offsetX = (targetOutW - scaledW) / 2;
                        const offsetY = (targetOutH - scaledH) / 2;
                        // Draw cleanly centered inside rigid output resolution
                        ctx.drawImage(rawCanvas, 0, 0, rawCanvas.width, rawCanvas.height, offsetX, offsetY, scaledW, scaledH);
                    }
                }
                // Revert layout hacks
                container.style.minHeight = "";
                container.style.justifyContent = "";
                container.style.width = "";
                container.style.maxWidth = "";
                const link = document.createElement("a");
                link.download = "timetable.png";
                link.href = finalCanvas.toDataURL("image/png");
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
                if (loadingSpinner)
                    loadingSpinner.style.display = "none";
            }
        });
    });
}
//# sourceMappingURL=screenshot.js.map