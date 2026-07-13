/**
 * Probe do auto-preset: abre com ?fxauto=1 (+carga opcional via query extra),
 * escuta os logs [fx-auto] por ~30s e imprime o estado final.
 * Uso: node scripts/fx-auto-probe.mjs "grid=64"
 */
import { chromium } from "playwright-core";

const extra = process.argv[2] ? `&${process.argv[2]}` : "";
const url = `http://[::1]:5199/?leva=0&fxauto=1&gravity=1${extra}`;

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("console", (m) => {
  const t = m.text();
  if (t.includes("[fx-auto]") || t.includes("[fx]")) console.log(t);
  if (m.type() === "error") console.log("[console.error]", t);
});
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForFunction("window.__limiarReady === true", null, {
  timeout: 30000,
});
console.log("backend:", await page.evaluate("window.__limiarBackend"));
await page.waitForTimeout(30000);
const s = await page.evaluate("window.__limiarFx");
console.log(
  `final: preset=${s.preset} fps=${s.avgFps.toFixed(0)} frame=${s.avgMs.toFixed(1)}ms (${s.source})`,
);
await browser.close();
