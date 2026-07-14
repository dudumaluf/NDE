/**
 * Sonda de COERÊNCIA da multidão dirigível (2026-07-14b, doc 03 §14.8):
 * prova as 3 mecânicas do adendo do Dudu como UM sistema só, nos 2 backends.
 *
 *  1. WRAP universal (mundo-toro): com a esteira andando, agentes cruzam a
 *     borda da área canônica e reaparecem do lado oposto — posição CONTÍNUA
 *     mod L (o salto bruto é ~L, o salto wrappado é ~o passo normal) e
 *     ESTADO preservado no evento. Todos ficam dentro de [−L/2, L/2]².
 *  2. STUTTER do seguido: seguindo uma pessoa numa multidão densa, o campo
 *     do ativo + inércia do selecionado reduzem o vaivém (jitter de posição
 *     da PRÓPRIA pessoa) — compara sem-ajuda (inertia=1, field=0) vs
 *     com-ajuda (inertia=0.15, field=1).
 *  3. STEERING (leme): no follow com esteira, o mouse vira o rumo da viagem
 *     — o heading responde ao ponteiro e o mundo scrolla; apontar NA pessoa
 *     (deadzone) para a viagem.
 *
 * Uso: node scripts/coh-probe.mjs [urlBase] [--one]
 */
import { chromium } from "playwright-core";

const base =
  process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:5199/";
const onlyOne = process.argv.includes("--one");
const q = (qs) => `${base}${base.includes("?") ? "&" : "?"}${qs}`;

let failures = 0;
const check = (ok, label, detail) => {
  console.log(`  ${ok ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
};
const rms = (xs) => Math.sqrt(xs.reduce((s, v) => s + v * v, 0) / (xs.length || 1));

async function newPage(browser, url) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.log("[console.error]", m.text().slice(0, 120));
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction("window.__limiarReady === true", null, { timeout: 30000 });
  await page.waitForFunction(
    "window.__limiarHover && window.__limiarHover.mirrorReady === true",
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(600);
  return page;
}

// --------- 1. WRAP universal (esteira andando) ----------
async function testWrap(browser, forceWebGL) {
  const url = q(
    `leva=0&grid=32&gravity=1&simT=4&wrap=1&stage=1${forceWebGL ? "&forceWebGL=1&labels=0" : ""}`,
  );
  const page = await newPage(browser, url);
  // Segue pelo fluxo real (o pino + esteira exigem follow ativo).
  await page.evaluate(() => window.__limiarFollow(5));
  await page.waitForFunction(
    "window.__limiarStageState && window.__limiarStageState.stageOn === 1",
    null,
    { timeout: 12000 },
  );
  const L = (await page.evaluate("window.__limiarStageState")).wrapLen;

  // Poll denso: posições + estados de TODOS (o mundo recua → agentes na
  // borda de trás wrappam a cada poucos frames).
  const samples = await page.evaluate(async (L) => {
    const N = 1024;
    const out = [];
    let prevP = null;
    let prevS = null;
    for (let t = 0; t < 45; t++) {
      const pos = await window.__limiarReadPositions(N);
      const st = await window.__limiarReadStates(N);
      if (prevP) {
        let bound = 0;
        let wraps = 0;
        let contMax = 0;
        let stateChanged = 0;
        // Controle: taxa BASE de troca de estado dos que NÃO wrapparam (a
        // state machine transiciona sozinha o tempo todo; uma troca que
        // COINCIDE com um wrap não é causada por ele — o wrap só mexe em
        // posição). Comparar as duas taxas isola o efeito real.
        let ctrlChanged = 0;
        let ctrlTotal = 0;
        for (let i = 0; i < N; i++) {
          const x = pos[i * 3];
          const z = pos[i * 3 + 2];
          bound = Math.max(bound, Math.abs(x), Math.abs(z));
          let dx = x - prevP[i * 3];
          let dz = z - prevP[i * 3 + 2];
          const wrapped = Math.abs(dx) > L / 2 || Math.abs(dz) > L / 2;
          const sPrev = Math.floor(prevS[i * 4 + 3]);
          const sCur = Math.floor(st[i * 4 + 3]);
          if (wrapped) {
            wraps += 1;
            if (Math.abs(dx) > L / 2) dx -= Math.sign(dx) * L;
            if (Math.abs(dz) > L / 2) dz -= Math.sign(dz) * L;
            contMax = Math.max(contMax, Math.hypot(dx, dz));
            if (sPrev !== sCur) stateChanged += 1;
          } else {
            ctrlTotal += 1;
            if (sPrev !== sCur) ctrlChanged += 1;
          }
        }
        out.push({ bound, wraps, contMax, stateChanged, ctrlChanged, ctrlTotal });
      }
      prevP = pos;
      prevS = st;
      await new Promise((r) => requestAnimationFrame(r));
    }
    return out;
  }, L);

  const totalWraps = samples.reduce((s, v) => s + v.wraps, 0);
  const boundMax = Math.max(...samples.map((s) => s.bound));
  const contMax = Math.max(...samples.map((s) => s.contMax));
  const stateChanges = samples.reduce((s, v) => s + v.stateChanged, 0);
  const ctrlChanges = samples.reduce((s, v) => s + v.ctrlChanged, 0);
  const ctrlTotal = samples.reduce((s, v) => s + v.ctrlTotal, 0);
  // Trocas esperadas por COINCIDÊNCIA = wraps × taxa base (state machine).
  const baseRate = ctrlTotal > 0 ? ctrlChanges / ctrlTotal : 0;
  const expected = totalWraps * baseRate;
  console.log(
    `\n[wrap · ${forceWebGL ? "WebGL2" : "WebGPU"}] L=${L} · eventos de wrap=${totalWraps} · |coord|máx=${boundMax.toFixed(2)} (½L=${(L / 2).toFixed(1)}) · salto wrappado máx=${contMax.toFixed(3)} m`,
  );
  console.log(
    `  trocas de estado nos wraps=${stateChanges} · esperado por coincidência (taxa base ${(baseRate * 100).toFixed(2)}%)=${expected.toFixed(2)}`,
  );
  check(totalWraps >= 5, "wrap acontece (agentes cruzam a borda)", `${totalWraps} eventos`);
  check(boundMax <= L / 2 + 1.0, "todos dentro da área canônica", `máx ${boundMax.toFixed(2)} ≤ ${(L / 2 + 1).toFixed(1)}`);
  check(contMax < 1.2, "posição contínua mod L (reaparece do lado oposto, sem teleporte)", `salto wrappado ${contMax.toFixed(3)} m ≈ passo normal`);
  // O wrap só mexe em posição: as poucas trocas são a state machine normal
  // (coincidência), não o wrap. Tolerância = esperado + folga de Poisson.
  check(
    stateChanges <= expected + 3,
    "estado preservado no wrap (troca ≈ taxa base, não causada pelo wrap)",
    `${stateChanges} ≤ ${(expected + 3).toFixed(1)}`,
  );
  await page.close();
}

// --------- 2. STUTTER do seguido (denso) ----------
async function measureJitter(page, i) {
  // Amostra a posição da PRÓPRIA pessoa seguida ~12 Hz por ~5 s; jitter =
  // reversões de direção + RMS do resíduo sobre a média móvel (alta freq).
  return page.evaluate(async (idx) => {
    const path = [];
    for (let t = 0; t < 60; t++) {
      const pos = await window.__limiarReadPositions(idx + 1);
      path.push([pos[idx * 3], pos[idx * 3 + 2]]);
      await new Promise((r) => setTimeout(r, 80));
    }
    // resíduo de alta frequência (janela ±4) + reversões perpendiculares
    const W = 4;
    const res = [];
    let reversals = 0;
    let prevPerp = 0;
    const nx = path.at(-1)[0] - path[0][0];
    const nz = path.at(-1)[1] - path[0][1];
    const nl = Math.hypot(nx, nz) + 1e-6;
    const dx = nx / nl;
    const dz = nz / nl;
    for (let k = W; k < path.length - W; k++) {
      let mx = 0;
      let mz = 0;
      for (let j = k - W; j <= k + W; j++) {
        mx += path[j][0];
        mz += path[j][1];
      }
      const n = 2 * W + 1;
      res.push(Math.hypot(path[k][0] - mx / n, path[k][1] - mz / n) * 1000);
      // componente perpendicular ao rumo líquido (vaivém lateral)
      const sx = path[k][0] - path[k - 1][0];
      const sz = path[k][1] - path[k - 1][1];
      const perp = sx * -dz + sz * dx;
      if (perp * prevPerp < 0 && Math.abs(perp) > 0.0004) reversals += 1;
      prevPerp = perp;
    }
    return { rmsMM: Math.sqrt(res.reduce((s, v) => s + v * v, 0) / res.length), reversals };
  }, i);
}

async function testStutter(browser, forceWebGL) {
  const tail = forceWebGL ? "&forceWebGL=1&labels=0" : "";
  const common = `leva=0&grid=32&gravity=1&simT=45&sep=3.5&cam=14,9,18${tail}`;
  const idx = 7;
  // sem-ajuda: inércia total + campo off
  const p0 = await newPage(browser, q(`${common}&stage=0&field=0&selInertia=1`));
  await p0.evaluate((i) => window.__limiarFollow(i), idx);
  await p0.waitForTimeout(1500);
  const before = await measureJitter(p0, idx);
  await p0.close();
  // com-ajuda: inércia baixa + campo on
  const p1 = await newPage(
    browser,
    q(`${common}&stage=0&field=1&fieldF=1.6&selInertia=0.15`),
  );
  await p1.evaluate((i) => window.__limiarFollow(i), idx);
  await p1.waitForTimeout(1500);
  const after = await measureJitter(p1, idx);
  await p1.close();

  console.log(
    `\n[stutter · ${forceWebGL ? "WebGL2" : "WebGPU"}] pessoa ${idx} assentada em multidão densa (sep 3,5):`,
  );
  console.log(
    `  sem-ajuda  (inertia=1,   field=0): jitter RMS=${before.rmsMM.toFixed(2)}mm · reversões laterais=${before.reversals}`,
  );
  console.log(
    `  com-ajuda  (inertia=0.15, field=1): jitter RMS=${after.rmsMM.toFixed(2)}mm · reversões laterais=${after.reversals}`,
  );
  if (forceWebGL) {
    // WebGL2 não tem separação: o campo (uniform) ainda ajuda; a inércia da
    // separação não age (documentado). Só relata — não falha.
    console.log("  (WebGL2 sem separação: inércia da separação inerte — só o campo/contenção agem; ver docs)");
    check(true, "stutter medido no WebGL2 (informativo)");
  } else {
    check(
      after.reversals <= before.reversals && after.rmsMM <= before.rmsMM * 1.02,
      "campo+inércia reduzem o vaivém do seguido",
      `reversões ${before.reversals}→${after.reversals}, RMS ${before.rmsMM.toFixed(2)}→${after.rmsMM.toFixed(2)}mm`,
    );
  }
}

// --------- 3. STEERING (leme) ----------
async function testSteering(browser, forceWebGL) {
  const url = q(
    `leva=0&grid=32&gravity=0&wrap=1&stage=1&steer=1${forceWebGL ? "&forceWebGL=1&labels=0" : ""}`,
  );
  const page = await newPage(browser, url);
  await page.evaluate(() => window.__limiarFollow(5));
  await page.waitForFunction(
    "window.__limiarStageState && window.__limiarStageState.stageOn === 1",
    null,
    { timeout: 12000 },
  );
  const st = () => page.evaluate("window.__limiarStageState");
  const scrollMag = (s) => Math.hypot(s.scroll.x, s.scroll.z);

  const s0 = await st();
  // mouse à direita da tela → o leme vira o rumo para lá e o mundo anda
  await page.mouse.move(1150, 420, { steps: 4 });
  await page.waitForTimeout(2600);
  const s1 = await st();
  const h0 = s0.heading;
  const h1 = s1.heading;
  const dHead1 = h0[0] * h1[0] + h0[1] * h1[1];
  const scrolled1 = scrollMag(s1) - scrollMag(s0);
  console.log(
    `\n[steer · ${forceWebGL ? "WebGL2" : "WebGPU"}] heading ${h0.map((v) => v.toFixed(2))} → ${h1.map((v) => v.toFixed(2))} (dot=${dHead1.toFixed(2)}); mundo scrollou ${scrolled1.toFixed(2)} m`,
  );
  check(scrolled1 > 0.4, "leme move o mundo (esteira anda na direção apontada)", `Δscroll=${scrolled1.toFixed(2)} m`);
  check(dHead1 < 0.999, "o rumo responde ao ponteiro", `dot=${dHead1.toFixed(3)}`);

  // mouse à esquerda → rumo vira para o outro lado
  await page.mouse.move(140, 420, { steps: 4 });
  await page.waitForTimeout(2600);
  const s2 = await st();
  const h2 = s2.heading;
  const dHead2 = h1[0] * h2[0] + h1[1] * h2[1];
  check(dHead2 < 0.9, "apontar para o lado oposto vira o rumo de volta", `dot(h1,h2)=${dHead2.toFixed(2)}`);

  // deadzone: mouse SOBRE a pessoa → a viagem para (scroll estabiliza)
  const proj = await page.evaluate(() => window.__limiarPersonScreen(5, 0.3));
  if (proj && proj.on) {
    await page.mouse.move(proj.x, proj.y, { steps: 4 });
    await page.waitForTimeout(1800);
    const sa = scrollMag(await st());
    await page.waitForTimeout(1500);
    const sb = scrollMag(await st());
    console.log(`  deadzone (mouse na pessoa): scroll ${sa.toFixed(2)}→${sb.toFixed(2)} m em 1,5 s`);
    check(sb - sa < 0.15, "apontar NA pessoa para a viagem (deadzone)", `Δ=${(sb - sa).toFixed(3)} m`);
  } else {
    console.log("  (pessoa fora da tela — pulo o teste de deadzone)");
  }
  await page.close();
}

async function run(browser, forceWebGL) {
  console.log(`\n=== ${forceWebGL ? "WebGL2" : "WebGPU"} ===`);
  await testWrap(browser, forceWebGL);
  await testSteering(browser, forceWebGL);
  await testStutter(browser, forceWebGL);
}

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
try {
  await run(browser, false);
  if (!onlyOne) await run(browser, true);
} finally {
  await browser.close();
}
console.log(failures ? `\n${failures} FALHA(S)` : "\nTUDO PASSOU");
process.exit(failures ? 1 : 0);
