/**
 * Meta de qualidade do anti-jitter (bug M4, doc 03 §14.6): seguindo uma
 * pessoa ASSENTADA no meio do grid denso com separação alta, a câmera não
 * pode TREMER visivelmente. A pessoa pode DERIVAR (a separação espreme e o
 * corpo escorrega devagar — movimento real que a câmera deve seguir), então
 * a métrica é o RESÍDUO de ALTA FREQUÊNCIA (>~4 Hz: média móvel ±5 frames
 * re-amostrados a 60 Hz): p95 < 2 mm = nenhum tremor perceptível — deriva
 * e balanço lento (~1 Hz, físico: a multidão espreme) passam; a escada do
 * readback e o ruído de colisão cru não passam. Reversões de direção
 * (vaivém por frame > 0,5 mm) também são contadas: tremor reverte, deriva
 * não.
 * Uso: node scripts/follow-settled-check.mjs [urlBase]
 */
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:5199/";
const PARAMS =
  "leva=0&simT=45&gravity=1&grid=32&sep=3.5&cam=14,9,18&labels=0";

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
let fail = false;
for (const forceWebGL of [false, true]) {
  const url = `${base}${base.includes("?") ? "&" : "?"}${PARAMS}${forceWebGL ? "&forceWebGL=1" : ""}`;
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction("window.__limiarReady === true", null, { timeout: 30000 });
  await page.waitForFunction(
    "window.__limiarHover && window.__limiarHover.mirrorReady === true",
    null,
    { timeout: 15000 },
  );
  // Pessoa ASSENTADA de verdade (estado 3/4 na máquina §5.5, via readback
  // de `states`): é quem só se move pelos empurrões de separação — o pior
  // caso puro de ruído. No WebGL2 o readback concorre com o do mirror e
  // pode voltar vazio (nota do AGENTS.md) — retenta.
  const pick = await page.evaluate(async () => {
    const n = (await (await fetch("/content/manifest.json")).json()).counts.people;
    let states = [];
    for (let tries = 0; tries < 10 && states.length < n * 4; tries++) {
      states = await window.__limiarReadStates(n);
      if (states.length < n * 4) await new Promise((r) => setTimeout(r, 300));
    }
    let best = -1;
    let bestDist = Infinity;
    let fallback = -1;
    let fallbackMove = Infinity;
    const before = [];
    for (let i = 0; i < n; i++) before.push(window.__limiarPersonScreen(i, 0));
    await new Promise((r) => setTimeout(r, 800));
    for (let i = 0; i < n; i++) {
      const s = window.__limiarPersonScreen(i, 0);
      if (!s || !before[i]) continue;
      const stId = states.length ? Math.floor(states[i * 4 + 3]) : -1;
      if (stId === 3 || stId === 4) {
        // Assentada mais próxima da câmera (bem cercada e visível).
        if (s.dist < bestDist) {
          bestDist = s.dist;
          best = i;
        }
      }
      const move = Math.hypot(s.x - before[i].x, s.y - before[i].y);
      if (move < fallbackMove) {
        fallbackMove = move;
        fallback = i;
      }
    }
    return best >= 0
      ? { i: best, how: "assentada (estado 3/4)" }
      : { i: fallback, how: `mais parada (${fallbackMove.toFixed(0)}px/0,8s)` };
  });
  await page.evaluate((i) => window.__limiarFollow(i), pick.i);
  await page.waitForFunction(
    "window.__limiarFollowState && window.__limiarFollowState.settled === true",
    null,
    { timeout: 10000 },
  );
  await page.waitForTimeout(500);
  // Posições absolutas da câmera + timestamp por frame (rAF na página).
  await page.evaluate(() => {
    const w = window;
    w.__camPath = [];
    const tick = () => {
      const f = w.__limiarFollowState;
      if (f && f.cam) w.__camPath.push([performance.now(), ...f.cam]);
      if (w.__camPath.length < 400) requestAnimationFrame(tick);
    };
    tick();
  });
  await page.waitForTimeout(4500);
  const raw = await page.evaluate("window.__camPath");
  // Headless tem dt irregular (~50 fps com buracos): re-amostra o caminho
  // numa grade UNIFORME de 16,7 ms (interp linear em t) — movimento correto
  // por wall-clock não pode contar como tremor.
  const STEP = 16.7;
  const path = [];
  let j = 0;
  for (let t = raw[0][0]; t <= raw.at(-1)[0]; t += STEP) {
    while (j < raw.length - 2 && raw[j + 1][0] < t) j++;
    const a = raw[j];
    const b = raw[j + 1];
    const f = Math.min(1, Math.max(0, (t - a[0]) / Math.max(b[0] - a[0], 1e-3)));
    path.push([
      a[1] + (b[1] - a[1]) * f,
      a[2] + (b[2] - a[2]) * f,
      a[3] + (b[3] - a[3]) * f,
    ]);
  }
  // Resíduo = |posição − média móvel ±W amostras| (isola tremor da deriva
  // e do balanço lento; W=5 a 60 Hz ≈ passa-altas de ~4 Hz).
  const W = 5;
  const res = [];
  for (let i = W; i < path.length - W; i++) {
    let mx = 0;
    let my = 0;
    let mz = 0;
    for (let k = i - W; k <= i + W; k++) {
      mx += path[k][0];
      my += path[k][1];
      mz += path[k][2];
    }
    const n = 2 * W + 1;
    res.push(
      Math.hypot(path[i][0] - mx / n, path[i][1] - my / n, path[i][2] - mz / n) *
        1000,
    );
  }
  const mean = res.reduce((s, v) => s + v, 0) / res.length;
  const max = Math.max(...res);
  const p95 = [...res].sort((a, b) => a - b)[Math.floor(res.length * 0.95)];
  // Reversões de direção com deslocamento real (>0,5 mm): vaivém = tremor.
  let reversals = 0;
  for (let i = 2; i < path.length; i++) {
    const ax = path[i - 1][0] - path[i - 2][0];
    const ay = path[i - 1][1] - path[i - 2][1];
    const az = path[i - 1][2] - path[i - 2][2];
    const bx = path[i][0] - path[i - 1][0];
    const by = path[i][1] - path[i - 1][1];
    const bz = path[i][2] - path[i - 1][2];
    const dot = ax * bx + ay * by + az * bz;
    const mag = Math.hypot(bx, by, bz);
    if (dot < 0 && mag > 0.0005) reversals += 1;
  }
  // Deriva (informativo): deslocamento total / tempo.
  const drift =
    (Math.hypot(
      path.at(-1)[0] - path[0][0],
      path.at(-1)[1] - path[0][1],
      path.at(-1)[2] - path[0][2],
    ) /
      (path.length / 60)) *
    1000;
  const backend = await page.evaluate("window.__limiarBackend");
  const revPct = (100 * reversals) / (path.length - 2);
  const ok = p95 < 2 && revPct < 10;
  if (!ok) fail = true;
  console.log(
    `${backend} · pessoa ${pick.i} [${pick.how}] · ${res.length} frames · tremor: média=${mean.toFixed(2)}mm p95=${p95.toFixed(2)}mm máx=${max.toFixed(2)}mm · reversões=${revPct.toFixed(0)}% · deriva=${drift.toFixed(1)}mm/s → ${ok ? "PASS (tremor p95 <2mm, sem vaivém)" : "FAIL"}`,
  );
  await page.close();
}
await browser.close();
process.exit(fail ? 1 : 0);
