/**
 * Sonda das formações dos dormentes (2026-07-14): mede o CHURN dos alvos
 * (âncora do corridor não pode re-ancorar em loop), a convergência
 * posição→alvo e o histograma de estados (assentam ao chegar?).
 * Uso: node scripts/formation-probe.mjs "<url>"
 * (no WebGL2 usar &labels=0 — nota no states-probe)
 */
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5199/?leva=0";
const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForFunction("window.__limiarReady === true", null, { timeout: 30000 });
await page.waitForTimeout(6000);

const read = () =>
  page.evaluate(`(async () => {
  const st = window.__limiarStageState;
  const sim = window.__limiarSim;
  const pos = await window.__limiarReadPositions(220);
  const tgts = window.__limiarReadTargets(86, 130);
  const states = await window.__limiarReadStates(220);
  return { st, seekWeight: sim.seekWeight, pos, tgts, states };
})()`);

const a = await read();
await page.waitForTimeout(5000);
const b = await read();

console.log("stage:", JSON.stringify(b.st));
console.log("seekWeight:", b.seekWeight);
// Alvos mudaram entre as leituras? (churn de âncora)
let moved = 0;
let maxMove = 0;
for (let i = 0; i < 130; i++) {
  const dx = b.tgts[i * 4] - a.tgts[i * 4];
  const dz = b.tgts[i * 4 + 2] - a.tgts[i * 4 + 2];
  const d = Math.hypot(dx, dz);
  if (d > 0.01) moved += 1;
  maxMove = Math.max(maxMove, d);
}
console.log(`alvos dormentes que MUDARAM em 5 s: ${moved}/130 (máx ${maxMove.toFixed(2)} m)`);
// Distância posição→alvo dos primeiros 60 dormentes + histograma de estados
let far = 0;
let sumD = 0;
const hist = [0, 0, 0, 0, 0];
for (let i = 86; i < 206; i++) {
  const t = b.tgts.slice((i - 86) * 4, (i - 86) * 4 + 4);
  const dx = b.pos[i * 3] - t[0];
  const dz = b.pos[i * 3 + 2] - t[2];
  const d = Math.hypot(dx, dz);
  sumD += d;
  if (d > 2.5) far += 1;
  const id = Math.floor(b.states[i * 4 + 3]);
  if (id >= 0 && id < 5) hist[id] += 1;
}
console.log(`dormentes 86..205: dist média ao alvo ${(sumD / 120).toFixed(2)} m; longe(>2,5m): ${far}/120`);
console.log(`estados: parado=${hist[0]} andando=${hist[1]} correndo=${hist[2]} assentado=${hist[3]} rezando=${hist[4]}`);
await browser.close();
