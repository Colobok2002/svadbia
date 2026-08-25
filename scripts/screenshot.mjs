import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";

const port = 4173;
const baseUrl = `http://127.0.0.1:${port}`;
const server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", String(port)], {
  stdio: "inherit",
});

const stopServer = () => server.kill("SIGTERM");
process.on("exit", stopServer);
process.on("SIGINT", () => {
  stopServer();
  process.exit(130);
});

try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      ready = response.ok;
      if (ready) break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  if (!ready) throw new Error(`Vite не запустился на ${baseUrl}`);

  await mkdir("screenshots", { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const viewports = {
    mobile: { width: 390, height: 844 },
    desktop: { width: 1440, height: 900 },
  };

  for (const [name, viewport] of Object.entries(viewports)) {
    await page.setViewportSize(viewport);
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts?.ready);

    const ids = await page.locator(".chapter-nav [data-target]").evaluateAll(
      (elements) => elements.map((element) => element.dataset.target),
    );
    for (const id of ids) {
      // Query parameter forces a fresh React mount; hash-only navigation would
      // keep the previous active slide because the app owns slide state.
      await page.goto(`${baseUrl}/?capture=${encodeURIComponent(id)}#${id}`, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForTimeout(id === "grow" ? 2200 : 650);
      await page.screenshot({ path: `screenshots/${name}-${id || "slide"}.png` });
    }
  }

  await browser.close();
  console.log("Скриншоты сохранены в screenshots/");
} finally {
  stopServer();
}
