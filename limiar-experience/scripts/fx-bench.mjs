/**
 * Bench headless dos post effects: custo medido por efeito (delta da média
 * móvel no toggle, GPU-time quando o backend suporta) + fps médio por preset.
 *
 * Uso: node scripts/fx-bench.mjs [--webgl] [urlBase]
 * Requer dev server no ar. AVISO: fps headless SUBESTIMA o navegador real
 * (STATUS.md) — os custos em ms de GPU são a métrica confiável aqui.
 */
import { chromium } from "playwright-core";

const forceWebGL = process.argv.includes("--webgl");
const base =
  process.argv.find((a) => a.startsWith("http")) ?? "http://[::1]:5199";
const url = `${base}/?leva=0&gravity=1&simT=4${forceWebGL ? "&forceWebGL=1" : ""}`;

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("[console.error]", m.text());
});

await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForFunction("window.__limiarReady === true", null, {
  timeout: 30000,
});
console.log("backend:", await page.evaluate("window.__limiarBackend"));

const set = (partial) =>
  page.evaluate((p) => window.__limiarFxSet(p), partial);
const fx = () => page.evaluate("window.__limiarFx");

// ---------- 1. custo por efeito (toggle individual sobre o mínimo) ----------
await set({ preset: "minimo" });
await page.waitForTimeout(3000);

const costs = {};
for (const effect of ["nevoa", "vinheta", "bloom", "ao"]) {
  await set({ [effect]: true });
  await page.waitForTimeout(3400); // settle 0.6s + coleta 2s + folga
  const s = await fx();
  costs[effect] = s.costs[effect];
  console.log(
    `custo ${effect}: ${s.costs[effect] !== undefined ? "~" + s.costs[effect].toFixed(2) + "ms" : "(não medido)"} · fonte: ${s.source}`,
  );
  await set({ [effect]: false });
  await page.waitForTimeout(1200);
}

// ---------- 2. fps médio por preset ----------
const fps = {};
for (const preset of ["minimo", "leve", "medio", "alto"]) {
  await set({ preset });
  await page.waitForTimeout(1500); // recompilação + assentar
  await page.waitForTimeout(4000); // janela de medição
  const s = await fx();
  fps[preset] = { fps: s.avgFps, ms: s.avgMs, source: s.source };
  console.log(
    `preset ${preset}: ${s.avgFps.toFixed(0)} fps · frame ${s.avgMs.toFixed(2)}ms (${s.source})`,
  );
}

console.log("\nJSON:", JSON.stringify({ forceWebGL, costs, fps }));
await browser.close();
