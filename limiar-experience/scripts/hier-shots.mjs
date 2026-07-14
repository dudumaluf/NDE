/**
 * Verificação headless da camada de HIERARQUIA VISUAL (2026-07-14):
 *  1. anti-colisão dos rótulos (screen-space) — mede pares sobrepostos
 *     com/sem a feature (câmera longe, núcleos vizinhos);
 *  2. foco num núcleo (voo + painel + destaque);
 *  3. contornos dos núcleos;
 *  4. LOD "vista de dados" (discos de cima).
 *
 * Uso: node scripts/hier-shots.mjs [--webgl] [urlBase]
 * Requer dev server no ar. Rode nos DOIS backends.
 */
import { chromium } from "playwright-core";

const forceWebGL = process.argv.includes("--webgl");
const base =
  process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:5199";
const tag = forceWebGL ? "webgl" : "webgpu";
const wg = forceWebGL ? "&forceWebGL=1" : "";

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});

async function open(url) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on("pageerror", (e) => console.log(`[${tag}] pageerror:`, e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.log(`[${tag}] console.error:`, m.text());
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction("window.__limiarReady === true", null, {
    timeout: 40000,
  });
  return page;
}

/** Conta pares de rótulos com AABB sobreposto na tela. */
function overlapPairs(rects) {
  let n = 0;
  for (let i = 0; i < rects.length; i++)
    for (let j = i + 1; j < rects.length; j++) {
      const a = rects[i];
      const b = rects[j];
      if (
        Math.abs(a.x - b.x) < a.hw + b.hw &&
        Math.abs(a.y - b.y) < a.hh + b.hh
      )
        n++;
    }
  return n;
}

const clusters = await fetch(`${base}/content/clusters.json`).then((r) => r.json());
const biggest = clusters.slice().sort((a, b) => b.size - a.size)[0].id;

// ---------- 1. anti-colisão: núcleos vizinhos, vista do alto ----------
// mapScale menor + formRaio maior aproxima e forma os 13 núcleos; a vista do
// alto empilha os rótulos vizinhos (o problema real do Dudo).
const farUrl = (anti) =>
  `${base}/?leva=0&gravity=1&simT=12&grid=32&mapScale=8&formRaio=5&cam=0,15,24&labelAnti=${anti}${wg}`;

{
  const page = await open(farUrl(0));
  await page.waitForTimeout(6000);
  const rectsOff = await page.evaluate("window.__limiarLabelScreen?.() ?? []");
  await page.screenshot({ path: `shots/hier-labels-overlap-${tag}.png` });
  console.log(
    `[${tag}] anti-overlap OFF: ${rectsOff.length} rótulos, ${overlapPairs(rectsOff)} pares sobrepostos`,
  );
  await page.close();
}
{
  const page = await open(farUrl(1));
  await page.waitForTimeout(6000); // deixa as springs assentarem
  const rectsOn = await page.evaluate("window.__limiarLabelScreen?.() ?? []");
  await page.screenshot({ path: `shots/hier-labels-antioverlap-${tag}.png` });
  console.log(
    `[${tag}] anti-overlap ON:  ${rectsOn.length} rótulos, ${overlapPairs(rectsOn)} pares sobrepostos`,
  );
  const labels = await page.evaluate("window.__limiarLabels");
  console.log(`[${tag}] formados: ${labels?.formed?.filter(Boolean).length}/${labels?.formed?.length}`);
  await page.close();
}

// ---------- 2. foco num núcleo (voo + painel + destaque) ----------
{
  const page = await open(
    `${base}/?leva=0&gravity=1&simT=12&grid=32&mapScale=12&formRaio=4&cam=18,12,24${wg}`,
  );
  await page.waitForTimeout(4500); // formação
  await page.evaluate((id) => window.__limiarFocusCluster?.(id), biggest);
  await page.waitForTimeout(2200); // voo 1,4 s + folga
  await page.screenshot({ path: `shots/hier-focus-${tag}.png` });
  const focus = await page.evaluate("window.__limiarFocus");
  console.log(`[${tag}] focus:`, JSON.stringify(focus));
  // sublente: clica no 1º chip de assinatura (se houver)
  const chip = await page.$("div[style*='z-index: 45'] button[title*='corpus']");
  if (chip) {
    await chip.click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `shots/hier-focus-sublens-${tag}.png` });
    console.log(`[${tag}] sublente: chip clicado`);
  } else {
    console.log(`[${tag}] sublente: nenhum chip encontrado`);
  }
  await page.close();
}

// ---------- 3. contornos dos núcleos (alpha reforçado p/ o shot) ----------
{
  const page = await open(
    `${base}/?leva=0&gravity=1&simT=12&grid=32&mapScale=9&formRaio=4.5&cam=0,34,26&outlineAlpha=0.45&dataView=0${wg}`,
  );
  await page.waitForTimeout(6000);
  await page.screenshot({ path: `shots/hier-outlines-${tag}.png` });
  const o = await page.evaluate("window.__limiarOutlines");
  console.log(`[${tag}] outlines:`, JSON.stringify(o));
  await page.close();
}

// ---------- 4. LOD vista de dados (câmera alta → discos) ----------
{
  const page = await open(
    `${base}/?leva=0&gravity=1&simT=12&grid=32&mapScale=9&formRaio=4.5&cam=0,62,1&discSize=2.4&wires=0${wg}`,
  );
  await page.waitForTimeout(4500);
  await page.screenshot({ path: `shots/hier-dataview-${tag}.png` });
  const dv = await page.evaluate("window.__limiarDataView");
  console.log(`[${tag}] data view:`, JSON.stringify(dv));
  await page.close();
}

await browser.close();
console.log(`[${tag}] done.`);
