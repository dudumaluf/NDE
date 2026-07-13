/**
 * Sonda da máquina de estados por agente (doc 04 §5.5): abre a URL, espera a
 * cena, lê o buffer `states` de N agentes via readback GPU e imprime o
 * histograma de estados + amostras (clipA/clipB/blend/stateId).
 * Uso: node scripts/states-probe.mjs "<url>" [nAgentes]
 * NOTA: no WebGL2, use &labels=0 na URL — o readback amostrado das palavras
 * dos núcleos concorre com o getArrayBufferAsync e o buffer volta vazio.
 */
import { chromium } from "playwright-core";

const url = process.argv[2] ?? "http://localhost:5199/?leva=0";
const nAgents = Number(process.argv[3] ?? 256);

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
page.on("console", (m) => {
  if (m.type() === "error") console.log("[console.error]", m.text());
});

await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForFunction("window.__limiarReady === true", null, { timeout: 30000 });
await page.waitForTimeout(1500);

console.log("backend:", await page.evaluate("window.__limiarBackend"));
const states = await page.evaluate(`window.__limiarReadStates(${nAgents})`);

const nomes = ["parado", "andando", "correndo", "assentado-idle", "rezando"];
const hist = [0, 0, 0, 0, 0];
const clips = new Map();
for (let i = 0; i < nAgents; i++) {
  const id = Math.floor(states[i * 4 + 3]);
  if (id >= 0 && id < 5) hist[id] += 1;
  const key = `${states[i * 4 + 0]}→${states[i * 4 + 1]}`;
  clips.set(key, (clips.get(key) ?? 0) + 1);
}
console.log(`estados (${nAgents} agentes):`);
nomes.forEach((n, i) =>
  console.log(`  ${n.padEnd(15)} ${hist[i]} (${((100 * hist[i]) / nAgents).toFixed(0)}%)`),
);
console.log("pares clipA→clipB mais comuns:");
[...clips.entries()]
  .sort((a, b) => b[1] - a[1])
  .slice(0, 8)
  .forEach(([k, v]) => console.log(`  ${k}: ${v}`));
console.log(
  "amostras [clipA,clipB,blend,w]:",
  [0, 1, 7, 46, 200]
    .map((i) => `#${i}=[${states.slice(i * 4, i * 4 + 4).map((v) => v.toFixed(2)).join(",")}]`)
    .join(" "),
);
const fps = await page.evaluate("window.__limiarFps");
console.log("fps:", fps?.toFixed?.(0) ?? fps);
await browser.close();
