const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:8080/index.html');

    // Make it load the JSON from the server by mocking a file upload
    await page.evaluate(async () => {
        const res = await fetch('ECE4.2.json');
        const jsonStr = await res.text();
        const file = new File([jsonStr], "ECE4.2.json", { type: "application/json" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        const fileInput = document.getElementById('loadFile');
        fileInput.files = dataTransfer.files;

        const changeEvent = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(changeEvent);
    });

    await page.waitForTimeout(1000); // let UI update

    const stats = await page.evaluate(() => {
        // Find Monday day-bg 
        const dayBg = document.querySelector('.day-bg[data-day="0"]');
        const items = Array.from(dayBg.querySelectorAll('.schedule-item'));

        const getRect = el => {
            const r = el.getBoundingClientRect();
            return { height: r.height, top: r.top, bottom: r.bottom };
        };

        return {
            dayBgStyle: dayBg.style.gridRow,
            dayBgRect: getRect(dayBg),
            itemRects: items.map(i => ({
                id: i.dataset.id,
                time: i.querySelector('.time').innerText,
                subject: i.querySelector('.subject').innerText,
                rect: getRect(i),
                styleHeight: i.style.height,
                styleFlex: i.style.flex
            }))
        };
    });

    console.log(JSON.stringify(stats, null, 2));

    await browser.close();
})();
