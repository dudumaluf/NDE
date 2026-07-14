/**
 * Sonda de hover + continuidade do follow (fix M4c/d, doc 03 §14.6).
 *
 * Simula o FLUXO REAL (nada de ?follow= — o qp pula a pose de overview):
 *  1. HOVER: projeta pessoas na tela (__limiarPersonScreen), move o mouse
 *     DE VERDADE ao pixel do tronco e da cabeça da pessoa mais próxima da
 *     câmera e confere hoverStore.hovered === i (antes do picking em
 *     screen-space, a cabeça falhava: o ray atingia o chão ATRÁS).
 *  2. FOLLOW overview→pessoa: __limiarFollow(i) e lê __limiarCamTrace
 *     (deltas de POSIÇÃO e ÂNGULO por frame, priority 0.5). Anti-snap =
 *     DESCONTINUIDADE: nenhum frame isolado pode destoar dos vizinhos
 *     (d[i] > 3×máx(vizinhos)+piso). Springs têm pico de velocidade — pico
 *     suave não é snap; o snap da v1 era 7,8° num frame após 0,00°/frame.
 *  3. LOCK 5 s: média/desvio/mediana/máx dos deltas + fração de frames
 *     congelados — anti-jitter (a escada do readback congelava e saltava).
 *  4. Pessoa→pessoa: mesma transição contínua (springs re-alvejadas).
 *  5. ESC: solta sem teleporte.
 *
 * Roda nos DOIS backends por padrão (WebGPU e &forceWebGL=1&labels=0).
 * Uso: node scripts/follow-probe.mjs [urlBase] [--one]
 */
import { chromium } from "playwright-core";

const baseArg =
  process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:5199/";
const onlyOne = process.argv.includes("--one");

// Estresse do relato do Dudu: multidão grande + separação alta (só o WebGPU
// tem separação; no WebGL2 o jitter viria das rajadas do readback).
const PARAMS = "leva=0&simT=6&cam=14,9,18&grid=64&sep=2.2";
/** Piso de descontinuidade: salto posicional isolado tolerado (m/frame). */
const D_SPIKE_FLOOR = 0.012;
/** Piso angular (rad/frame): ~0,3° — o snap da v1 era 0,14 rad (7,8°). */
const A_SPIKE_FLOOR = 0.005;

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : 0;
};
const stats = (xs) => {
  const mean = xs.reduce((s, v) => s + v, 0) / (xs.length || 1);
  const std = Math.sqrt(
    xs.reduce((s, v) => s + (v - mean) ** 2, 0) / (xs.length || 1),
  );
  return { mean, std, med: median(xs), max: Math.max(0, ...xs), n: xs.length };
};
const mm = (v) => `${(v * 1000).toFixed(1)}mm`;
const deg = (v) => `${((v * 180) / Math.PI).toFixed(2)}°`;

/**
 * Descontinuidades numa série de deltas por frame: frame i cujo delta salta
 * acima de 3× o MAIOR vizinho + piso. Curva de spring (rampa suave) passa;
 * snap (outlier isolado) não.
 */
const spikes = (xs, floor) => {
  const out = [];
  for (let i = 1; i < xs.length - 1; i++) {
    const nb = Math.max(xs[i - 1], xs[i + 1]);
    if (xs[i] > 3 * nb + floor) out.push({ i, v: xs[i], nb });
  }
  return out;
};

let failures = 0;
const check = (ok, label, detail) => {
  console.log(`  ${ok ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
};

async function probeBackend(browser, forceWebGL) {
  const url = `${baseArg}${baseArg.includes("?") ? "&" : "?"}${PARAMS}${
    forceWebGL ? "&forceWebGL=1&labels=0" : ""
  }`;
  console.log(`\n=== ${forceWebGL ? "WebGL2" : "WebGPU"} · ${url}`);
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  page.on("console", (m) => {
    if (m.type() === "error") console.log("[console.error]", m.text());
  });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForFunction("window.__limiarReady === true", null, {
    timeout: 30000,
  });
  await page.waitForFunction(
    "window.__limiarHover && window.__limiarHover.mirrorReady === true",
    null,
    { timeout: 15000 },
  );
  await page.waitForTimeout(800);
  console.log("backend:", await page.evaluate("window.__limiarBackend"));

  const nPeople = await page.evaluate(async () => {
    const r = await fetch("/content/manifest.json");
    return (await r.json()).counts.people;
  });

  // Pessoa i visível mais próxima da câmera (ninguém pode ocluí-la).
  const frontmost = async (skip = -1) =>
    page.evaluate(
      ([n, sk]) => {
        const w = window;
        let best = null;
        for (let i = 0; i < n; i++) {
          if (i === sk) continue;
          const s = w.__limiarPersonScreen(i, 0.5);
          if (s && s.on && (!best || s.dist < best.dist)) best = { i, ...s };
        }
        return best;
      },
      [nPeople, skip],
    );

  const hoverAt = async (i, frac) => {
    const s = await page.evaluate(
      ([idx, f]) => window.__limiarPersonScreen(idx, f),
      [i, frac],
    );
    if (!s) return { hovered: null, s: null };
    await page.mouse.move(s.x, s.y, { steps: 3 });
    await page.waitForTimeout(120);
    // Pessoa anda: re-projeta e corrige o pixel uma vez.
    const s2 = await page.evaluate(
      ([idx, f]) => window.__limiarPersonScreen(idx, f),
      [i, frac],
    );
    if (s2) await page.mouse.move(s2.x, s2.y, { steps: 2 });
    await page.waitForTimeout(250);
    const hovered = await page.evaluate("window.__limiarHover.hovered");
    // O debug publica o índice cru (-1 = ninguém) — normaliza para null.
    return { hovered: hovered === -1 ? null : hovered, s: s2 ?? s };
  };

  // ---------- 1. HOVER ----------
  console.log(`\n[hover] pessoas no manifest: ${nPeople}`);
  const target = await frontmost();
  if (!target) {
    check(false, "hover: nenhuma pessoa visível na tela");
    await page.close();
    return;
  }
  const torso = await hoverAt(target.i, 0.5);
  check(
    torso.hovered === target.i,
    `hover no TRONCO da pessoa ${target.i}`,
    `hovered=${torso.hovered} @ (${torso.s?.x.toFixed(0)},${torso.s?.y.toFixed(0)}) dist=${target.dist.toFixed(1)}u`,
  );
  const head = await hoverAt(target.i, 0.88);
  check(
    head.hovered === target.i,
    `hover na CABEÇA da pessoa ${target.i} (caso que falhava)`,
    `hovered=${head.hovered}`,
  );
  // Pixel vazio: canto superior da tela (céu/chão longe de todos).
  await page.mouse.move(30, 30, { steps: 2 });
  await page.waitForTimeout(250);
  const emptyHoverRaw = await page.evaluate("window.__limiarHover.hovered");
  const emptyHover = emptyHoverRaw === -1 ? null : emptyHoverRaw;
  check(emptyHover === null, "pixel vazio não hovera ninguém", `hovered=${emptyHoverRaw}`);

  // ---------- 2. FOLLOW overview→pessoa (anti-snap = descontinuidade) ----------
  const runTransition = async (i, label) => {
    await page.evaluate("window.__limiarCamTrace = []");
    await page.evaluate((idx) => window.__limiarFollow(idx), i);
    await page.waitForFunction(
      `window.__limiarFollowState && window.__limiarFollowState.following === ${i}`,
      null,
      { timeout: 8000 },
    );
    await page.waitForFunction(
      "window.__limiarFollowState && window.__limiarFollowState.settled === true",
      null,
      { timeout: 8000 },
    );
    await page.waitForTimeout(300);
    const trace = (await page.evaluate("window.__limiarCamTrace")).filter(
      (e) => e.f === i,
    );
    // Normaliza por Δt REAL do frame: headless tem hitches de 50–100 ms e um
    // frame longo com velocidade CONTÍNUA dobraria o delta sem ser snap.
    const ds = trace.map((e) => (e.d * 16.7) / Math.max(e.ms, 4));
    const as = trace.map((e) => (e.a * 16.7) / Math.max(e.ms, 4));
    const dSpk = spikes(ds, D_SPIKE_FLOOR);
    const aSpk = spikes(as, A_SPIKE_FLOOR);
    console.log(
      `\n[${label}] viagem+assentamento: ${trace.length} frames · dΔ pico=${mm(Math.max(...ds))}/f16,7ms mediana=${mm(median(ds))} · aΔ pico=${deg(Math.max(...as))}`,
    );
    const fmt = (list, f) =>
      list
        .slice(0, 3)
        .map((s) => `#${s.i}=${f(s.v)} (viz ${f(s.nb)})`)
        .join(" ");
    check(
      dSpk.length === 0 && aSpk.length === 0,
      `${label}: contínuo (nenhum frame destoa 3× dos vizinhos)`,
      dSpk.length || aSpk.length
        ? `posição: ${fmt(dSpk, mm) || "ok"} · ângulo: ${fmt(aSpk, deg) || "ok"}`
        : `maior razão suave — spring sem costura`,
    );
  };
  await runTransition(target.i, "follow overview→pessoa");

  // ---------- 3. LOCK 5 s (anti-jitter) ----------
  await page.evaluate("window.__limiarCamTrace = []");
  await page.waitForTimeout(5000);
  const lockTrace = (await page.evaluate("window.__limiarCamTrace")).filter(
    (e) => e.f !== null,
  );
  const ds = lockTrace.map((e) => e.d);
  const st = stats(ds);
  const fracZero = ds.filter((d) => d < 0.0005).length / (ds.length || 1);
  const moving = st.mean > 0.004; // pessoa andou no trecho?
  console.log(
    `\n[lock 5s] ${st.n} frames · dΔ média=${mm(st.mean)} desvio=${mm(st.std)} mediana=${mm(st.med)} máx=${mm(st.max)} · congelados=${(fracZero * 100).toFixed(0)}%`,
  );
  check(
    st.max <= Math.max(4 * st.med, D_SPIKE_FLOOR),
    "lock: sem saltos (máx ≤ 4×mediana)",
    `máx=${mm(st.max)} lim=${mm(Math.max(4 * st.med, D_SPIKE_FLOOR))}`,
  );
  check(
    !moving || fracZero < 0.15,
    "lock: sem stutter (câmera não congela entre readbacks)",
    `frames congelados=${(fracZero * 100).toFixed(0)}% (pessoa ${moving ? "andando" : "parada"})`,
  );

  // ---------- 3.5 órbita durante o follow continua viva ----------
  const beforeOrbit = await page.evaluate("window.__limiarFollowState");
  await page.mouse.move(640, 400);
  await page.mouse.down();
  await page.mouse.move(760, 360, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(600);
  const afterOrbit = await page.evaluate("window.__limiarFollowState");
  const offBefore = beforeOrbit.cam.map((v, ix) => v - beforeOrbit.target[ix]);
  const offAfter = afterOrbit.cam.map((v, ix) => v - afterOrbit.target[ix]);
  const offDelta = Math.hypot(
    offAfter[0] - offBefore[0],
    offAfter[1] - offBefore[1],
    offAfter[2] - offBefore[2],
  );
  check(
    afterOrbit.following !== null && offDelta > 0.3,
    "órbita durante o follow gira o enquadre (sem soltar)",
    `Δoffset=${offDelta.toFixed(2)}u following=${afterOrbit.following}`,
  );

  // ---------- 4. pessoa→pessoa (springs re-alvejadas, sem reset) ----------
  const second = await frontmost(target.i);
  if (second) {
    await runTransition(second.i, `follow pessoa ${target.i}→${second.i}`);
  } else {
    console.log("(sem segunda pessoa visível — pulo pessoa→pessoa)");
  }

  // ---------- 5. ESC solta sem teleporte ----------
  await page.evaluate("window.__limiarCamTrace = []");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  const escTrace = await page.evaluate("window.__limiarCamTrace");
  const escMax = Math.max(...escTrace.map((e) => e.d));
  const still = await page.evaluate("window.__limiarFollowState.following");
  check(
    still === null && escMax <= 0.05,
    "ESC: solta sem teleporte",
    `following=${still} dΔmáx pós-ESC=${mm(escMax)}`,
  );

  console.log("fps:", (await page.evaluate("window.__limiarFps"))?.toFixed?.(0));
  await page.close();
}

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
try {
  await probeBackend(browser, false);
  if (!onlyOne) await probeBackend(browser, true);
} finally {
  await browser.close();
}
console.log(failures ? `\n${failures} FALHA(S)` : "\nTUDO PASSOU");
process.exit(failures ? 1 : 0);
