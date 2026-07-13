/**
 * Screenshot com um tuning salvo INJETADO no localStorage antes do boot —
 * prova visual de que (a) o blob de preferências sobrescreve os defaults no
 * boot e (b) o grupo Aparência atinge fundo/névoa/chão/grid + HSB das pessoas.
 * Uso: node scripts/appearance-shot.mjs [url] [saida.png] [valoresJson]
 */
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5199/?leva=0";
const out = process.argv[3] ?? "shots/appearance.png";
// Paths ANTIGOS (pré-tradução) de propósito: provam a migração de grupos
// do prefs.ts (Aparência.* → Appearance.*) junto com o override visual.
const values = process.argv[4]
  ? JSON.parse(process.argv[4])
  : {
      "Aparência.fundo": "#232833",
      "Aparência.chao": "#2c3038",
      "Aparência.gridCor": "#4a5568",
      "Aparência.gridAlpha": 0.55,
      "Aparência.matiz": 36,
      "Aparência.saturacao": 1.35,
      "Aparência.brilho": 1.1,
    };

const blob = {
  app: "limiar-tuning",
  version: 1,
  savedAt: new Date().toISOString(),
  values,
};

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
await page.addInitScript((b) => {
  localStorage.setItem("limiar.tuning", JSON.stringify(b));
}, blob);

await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForFunction("window.__limiarReady === true", null, {
  timeout: 20000,
});
await page.waitForTimeout(Number(process.env.SETTLE ?? 1200));
await page.screenshot({ path: out });
console.log("backend:", await page.evaluate("window.__limiarBackend ?? null"));
console.log("screenshot:", out);
await browser.close();
