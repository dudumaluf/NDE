/**
 * Screenshot da timeline COM interação (hover num ponto / extremo) — o
 * screenshot.mjs não move o mouse. Uso:
 *   node scripts/tl-shot.mjs "<url>" out.png [hover]
 * hover: "dot:N" (n-ésimo ponto), "in" | "out" (extremos), "none".
 */
import { chromium } from "playwright-core";

const url = process.argv[2];
const out = process.argv[3] ?? "tl-shot.png";
const hover = process.argv[4] ?? "none";

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForFunction("window.__limiarReady === true", null, {
  timeout: 30000,
});
// Espera a timeline montar (o fetch do people/<id>.json chega depois do boot).
await page.waitForSelector("svg [data-dot]", { timeout: 15000 }).catch(() => {
  console.log("[warn] timeline sem pontos (modo elemento sem o elemento?)");
});
await page.waitForTimeout(1200);

if (hover.startsWith("dot:")) {
  const n = Number(hover.slice(4));
  // O alvo de clique é o 3º círculo de cada grupo (r=10, transparent).
  const box = await page.evaluate((idx) => {
    const gs = [...document.querySelectorAll("svg g g")];
    const g = gs[idx];
    if (!g) return null;
    const hit = [...g.querySelectorAll("circle")].find(
      (c) => c.getAttribute("fill") === "transparent",
    );
    const r = (hit ?? g).getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  }, n);
  if (box) {
    await page.mouse.move(box.x, box.y, { steps: 4 });
    await page.waitForTimeout(600);
  } else console.log("[warn] ponto", n, "não encontrado");
} else if (hover === "in" || hover === "out") {
  const box = await page.evaluate((side) => {
    const rects = [...document.querySelectorAll("svg rect")];
    const r = (side === "in" ? rects[0] : rects[1])?.getBoundingClientRect();
    return r ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null;
  }, hover);
  if (box) {
    await page.mouse.move(box.x, box.y, { steps: 4 });
    await page.waitForTimeout(600);
  } else console.log("[warn] extremo sem rect");
}

await page.screenshot({ path: out });
console.log("backend:", await page.evaluate("window.__limiarBackend"));
console.log("dots:", await page.evaluate('document.querySelectorAll("svg g g").length'));
console.log("screenshot:", out);
await browser.close();
