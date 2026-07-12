/**
 * Sonda headless de depuração: abre a URL, espera a cena e imprime
 * window.__limiarSim (estado do seek/targets do M3) + posições de agentes.
 * Uso: node scripts/probe.mjs "<url>"
 */
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5199/?leva=0";

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const page = await browser.newPage();
page.on("console", (m) => {
  if (m.type() === "error") console.log("[console.error]", m.text());
});
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForFunction("window.__limiarReady === true", null, { timeout: 20000 });
await page.waitForTimeout(1200);

console.log("backend:", await page.evaluate("window.__limiarBackend"));
console.log("sim:", JSON.stringify(await page.evaluate("window.__limiarSim")));

const read = async () => {
  const pos = await page.evaluate("window.__limiarReadPositions(8)");
  const tgt = await page.evaluate("window.__limiarSim.tgt0");
  return { pos, tgt };
};
const a = await read();
console.log("pos[0..7] t0:", a.pos.map((v) => v.toFixed(2)).join(","));
await page.waitForTimeout(4000);
const b = await read();
console.log("pos[0..7] t4:", b.pos.map((v) => v.toFixed(2)).join(","));
console.log("tgt0:", b.tgt.map((v) => v.toFixed(2)).join(","));
// distância do agente 0 ao alvo, antes e depois
const d = (p, t) => Math.hypot(p[0] - t[0], p[2] - t[2]);
console.log("dist agente0→alvo: t0", d(a.pos, b.tgt).toFixed(2), "→ t4", d(b.pos, b.tgt).toFixed(2));

await browser.close();
