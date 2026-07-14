/**
 * Sonda do campo do ativo (2026-07-14): conta agentes dentro do raio em
 * volta da pessoa seguida — comparar a URL com e sem &field=1.
 * Uso: node scripts/field-probe.mjs "<url>" [followIdx] [raio]
 */
import { chromium } from "playwright-core";

const url = process.argv[2];
const followIdx = Number(process.argv[3] ?? 5);
const radius = Number(process.argv[4] ?? 3);

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForFunction("window.__limiarReady === true", null, { timeout: 30000 });
await page.waitForTimeout(15000);

const res = await page.evaluate(`(async () => {
  const st = window.__limiarStageState;
  const pos = await window.__limiarReadPositions(1024);
  const px = pos[${followIdx} * 3];
  const pz = pos[${followIdx} * 3 + 2];
  let within = 0;
  let nearest = 1e9;
  for (let i = 0; i < 1024; i++) {
    if (i === ${followIdx}) continue;
    const dx = pos[i * 3] - px;
    const dz = pos[i * 3 + 2] - pz;
    const d = Math.hypot(dx, dz);
    if (d < ${radius}) within += 1;
    if (d < nearest) nearest = d;
  }
  return { fieldOn: st.fieldOn, within, nearest };
})()`);
console.log("backend:", await page.evaluate("window.__limiarBackend"));
console.log(
  `fieldOn=${res.fieldOn} — agentes a <${radius} m da pessoa: ${res.within}; mais próximo: ${res.nearest.toFixed(2)} m`,
);
await browser.close();
