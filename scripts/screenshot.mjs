/**
 * Screenshot headless da cena para verificação (usa o Chrome instalado).
 * Uso: node scripts/screenshot.mjs [url] [saida.png] [timeoutMs]
 */
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5199/?leva=0";
const out = process.argv[3] ?? "shot.png";
const timeoutMs = Number(process.argv[4] ?? 15000);

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});

const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const logs = [];
page.on("console", (m) => {
  if (m.type() === "error" || m.type() === "warning") logs.push(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto(url, { waitUntil: "domcontentloaded" });
try {
  await page.waitForFunction("window.__limiarReady === true", null, { timeout: timeoutMs });
} catch {
  logs.push("[warn] timeout esperando __limiarReady — capturando mesmo assim");
}
await page.waitForTimeout(700);
await page.screenshot({ path: out });

const backend = await page.evaluate("window.__limiarBackend ?? null");
console.log("backend:", backend);
console.log("screenshot:", out);
if (logs.length) console.log(logs.join("\n"));

await browser.close();
