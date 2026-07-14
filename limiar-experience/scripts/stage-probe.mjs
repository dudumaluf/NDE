/**
 * Sonda do palco/esteira (2026-07-14): 2 screenshots com ~3 s de intervalo,
 * compara o scroll do heightfield (Δ ≈ treadmill speed × 3 s), o pino
 * (pessoa seguida NÃO desloca) e o walking forçado (stateId=1).
 * Uso: node scripts/stage-probe.mjs "<url>" [prefixo] [followIdx]
 */
import { chromium } from "playwright-core";

const url = process.argv[2];
const prefix = process.argv[3] ?? "shots/mech-stage";
const followIdx = Number(process.argv[4] ?? 5);

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));
await page.goto(url, { waitUntil: "domcontentloaded" });
await page.waitForFunction("window.__limiarReady === true", null, { timeout: 30000 });
console.log("backend:", await page.evaluate("window.__limiarBackend"));
// espera o palco engatar (espelho pronto → stageOn=1) + corredor formar
await page.waitForFunction(
  "window.__limiarStageState && window.__limiarStageState.stageOn === 1",
  null,
  { timeout: 20000 },
);
await page.waitForTimeout(12000);

const read = () =>
  page.evaluate(`(async () => {
    const st = window.__limiarStageState;
    const pos = await window.__limiarReadPositions(${followIdx + 1});
    const states = await window.__limiarReadStates(${followIdx + 1});
    return {
      scroll: st.scroll,
      heading: st.heading,
      person: pos.slice(${followIdx} * 3, ${followIdx} * 3 + 3),
      state: states.slice(${followIdx} * 4, ${followIdx} * 4 + 4),
    };
  })()`);

const a = await read();
await page.screenshot({ path: `${prefix}-t0.png` });
await page.waitForTimeout(3000);
const b = await read();
await page.screenshot({ path: `${prefix}-t3.png` });

const dScroll = Math.hypot(b.scroll.x - a.scroll.x, b.scroll.z - a.scroll.z);
const dPerson = Math.hypot(b.person[0] - a.person[0], b.person[2] - a.person[2]);
console.log(`scroll t0=(${a.scroll.x.toFixed(2)}, ${a.scroll.z.toFixed(2)}) t3=(${b.scroll.x.toFixed(2)}, ${b.scroll.z.toFixed(2)}) → Δ=${dScroll.toFixed(2)} m em 3 s`);
console.log(`pessoa seguida: deslocou ${dPerson.toFixed(3)} m em 3 s (pino: esperado ~0)`);
console.log(`estado da pessoa: stateId=${Math.floor(b.state[3])} (esperado 1=andando) clipA=${b.state[0]} clipB=${b.state[1]}`);
console.log(`heading do palco: (${b.heading[0].toFixed(2)}, ${b.heading[1].toFixed(2)})`);
console.log(`screenshots: ${prefix}-t0.png ${prefix}-t3.png`);
await browser.close();
