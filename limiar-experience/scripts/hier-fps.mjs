/** FPS médio headless (antes/depois da camada de hierarquia). */
import { chromium } from "playwright-core";

const base = "http://localhost:5199";
const cases = [
  ["webgpu-1024", `${base}/?leva=0&gravity=1&simT=4&grid=32`],
  ["webgpu-4096", `${base}/?leva=0&gravity=1&simT=4&grid=64`],
  ["webgl-1024", `${base}/?leva=0&gravity=1&simT=4&grid=32&forceWebGL=1`],
  ["webgl-4096", `${base}/?leva=0&gravity=1&simT=4&grid=64&forceWebGL=1`],
  // birdseye: câmera alta → discos LOD ativos (crossfade da vista de dados)
  ["webgpu-1024-birdseye", `${base}/?leva=0&gravity=1&simT=4&grid=32&cam=0,80,1`],
  ["webgpu-4096-birdseye", `${base}/?leva=0&gravity=1&simT=4&grid=64&cam=0,80,1`],
  ["webgl-4096-birdseye", `${base}/?leva=0&gravity=1&simT=4&grid=64&cam=0,80,1&forceWebGL=1`],
];

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});

for (const [name, url] of cases) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on("pageerror", (e) => console.log(`[${name}] pageerror:`, e.message));
  await page.goto(url, { waitUntil: "domcontentloaded" });
  try {
    await page.waitForFunction("window.__limiarReady === true", null, { timeout: 40000 });
  } catch {
    console.log(`${name}: TIMEOUT esperando ready`);
    await page.close();
    continue;
  }
  await page.waitForTimeout(4000); // assentar
  const samples = [];
  for (let i = 0; i < 12; i++) {
    await page.waitForTimeout(500);
    const f = await page.evaluate("window.__limiarFps ?? null");
    if (typeof f === "number") samples.push(f);
  }
  const avg = samples.reduce((a, b) => a + b, 0) / Math.max(samples.length, 1);
  const backend = await page.evaluate("window.__limiarBackend");
  console.log(`${name}: ${avg.toFixed(1)} fps (${samples.length} amostras, ${backend})`);
  await page.close();
}
await browser.close();
