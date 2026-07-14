/**
 * Prova headless da VOZ (Voz v1, doc 03 §14.8): abre o app em follow, clica
 * numa estação da timeline (fluxo real de clique no SVG) e confere que:
 *
 *  1. o áudio ENTROU em playing com a URL do corte CERTO — validado contra o
 *     mapeamento do people/<id>.json (beats[pos] ↔ audio.beats[pos].file);
 *  2. o tempo anda (t cresce entre duas amostras do __limiarAudioBeat);
 *  3. clicar noutro ponto TROCA o corte (última chamada vence);
 *  4. clicar no ponto ativo PARA (playing null);
 *  5. ESC (sai do follow) cala a voz.
 *
 * Screenshot do ponto pulsando com anel de progresso → shots/voz-<backend>.png.
 * Autoplay liberado por flag (headless não tem gesto).
 *
 * Uso: node scripts/voz-probe.mjs [urlBase] [--one] [--person=<id>]
 */
import { chromium } from "playwright-core";
import { mkdirSync } from "node:fs";

const baseArg =
  process.argv.find((a) => a.startsWith("http")) ?? "http://localhost:5199/";
const onlyOne = process.argv.includes("--one");
const personArg =
  process.argv.find((a) => a.startsWith("--person="))?.slice(9) ??
  "altair-machado";

let failures = 0;
const check = (ok, label, detail) => {
  console.log(`  ${ok ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
  if (!ok) failures += 1;
};

async function probeBackend(browser, forceWebGL) {
  const qp = `leva=0&simT=2${forceWebGL ? "&forceWebGL=1&labels=0" : ""}`;
  const name = forceWebGL ? "webgl" : "webgpu";
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleErrors = [];
  page.on("pageerror", (e) => consoleErrors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });

  // Descobre o índice de follow da pessoa-alvo pelo manifest.
  await page.goto(`${baseArg}?${qp}`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction("window.__limiarReady === true", null, {
    timeout: 30000,
  });
  const { follow, personDoc } = await page.evaluate(async (pid) => {
    const man = await (await fetch("/content/manifest.json")).json();
    const idx = man.people.findIndex((p) => p.id === pid);
    const doc = await (await fetch(`/content/people/${pid}.json`)).json();
    return { follow: idx, personDoc: doc };
  }, personArg);
  console.log(`\n=== ${name} · follow=${follow} (${personArg})`);
  if (follow < 0) {
    check(false, `pessoa ${personArg} no manifest`);
    await page.close();
    return;
  }

  await page.goto(`${baseArg}?${qp}&follow=${follow}`, {
    waitUntil: "domcontentloaded",
  });
  await page.waitForFunction("window.__limiarReady === true", null, {
    timeout: 30000,
  });
  await page.waitForSelector("circle[data-dot-click]", { timeout: 15000 });
  await page.waitForTimeout(600);

  const dotKeys = await page.evaluate(() =>
    [...document.querySelectorAll("circle[data-dot-click]")].map(
      (el) => el.dataset.dotClick,
    ),
  );
  console.log(`  pontos na linha: ${dotKeys.join(", ")}`);

  const clickDot = async (key) => {
    await page.evaluate((k) => {
      const el = document.querySelector(`circle[data-dot-click="${k}"]`);
      el.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    }, key);
  };

  // ---------- 1+2. clique numa estação → playing com a URL certa, t anda ----------
  // O corte vem da CDN do Supabase: primeira carga pode bufferizar por
  // segundos — espera generosa por t > 0 (playing de verdade, não só play()).
  await clickDot(dotKeys[0]);
  let beat = null;
  try {
    await page.waitForFunction(
      "window.__limiarAudioBeat && window.__limiarAudioBeat.t > 0",
      null,
      { timeout: 25000 },
    );
    beat = await page.evaluate("window.__limiarAudioBeat");
  } catch {
    /* fica null */
  }
  check(Boolean(beat), `clique em ${dotKeys[0]} → áudio playing`, beat?.url);
  if (beat) {
    const pos = personDoc.beats.findIndex((b) => b.beat_index === beat.beatIndex);
    const expected = personDoc.audio.beats[pos]?.file.replace(/\.mp3$/, ".opus");
    check(
      beat.url.endsWith(`/${personArg}/${expected}`),
      "URL do corte casa com o mapeamento do JSON",
      `esperado …/${expected}`,
    );
    await page.waitForTimeout(1200);
    const beat2 = await page.evaluate("window.__limiarAudioBeat");
    check(
      beat2 && beat2.t > beat.t,
      "tempo do corte avança",
      beat2 ? `t ${beat.t.toFixed(2)} → ${beat2.t.toFixed(2)}s de ${beat2.duration.toFixed(0)}s` : "morreu",
    );
    // Screenshot do ponto pulsando + anel de progresso (seek a 55% para o
    // anel aparecer preenchido — cortes de beat duram minutos).
    await page.evaluate("window.__limiarAudioSeek && window.__limiarAudioSeek(0.55)");
    await page.waitForTimeout(400);
    mkdirSync("shots", { recursive: true });
    await page.screenshot({ path: `shots/voz-${name}.png` });
    console.log(`  screenshot → shots/voz-${name}.png`);
  }

  // ---------- 3. trocar de ponto crossfada para o novo corte ----------
  const other = dotKeys.find((k) => k !== dotKeys[0]);
  if (other && beat) {
    await clickDot(other);
    try {
      await page.waitForFunction(
        (oldUrl) =>
          window.__limiarAudioBeat && window.__limiarAudioBeat.url !== oldUrl,
        beat.url,
        { timeout: 8000 },
      );
      const b3 = await page.evaluate("window.__limiarAudioBeat");
      check(true, `trocar de ponto troca o corte`, b3.file);

      // ---------- 4. clicar no ponto ativo para ----------
      await clickDot(other);
      await page.waitForFunction("window.__limiarAudioBeat === null", null, {
        timeout: 5000,
      });
      check(true, "clicar de novo para o áudio");

      // ---------- 5. ESC cala a voz ----------
      await clickDot(dotKeys[0]);
      await page.waitForFunction(
        "window.__limiarAudioBeat && window.__limiarAudioBeat.t >= 0",
        null,
        { timeout: 8000 },
      );
      await page.keyboard.press("Escape");
      await page.waitForFunction("window.__limiarAudioBeat === null", null, {
        timeout: 5000,
      });
      check(true, "ESC (sai do follow) cala a voz");
    } catch (err) {
      check(false, "troca/para/ESC", err.message.split("\n")[0]);
    }
  }

  const audioErrors = consoleErrors.filter(
    (e) => !/WebGPU|GPU|three|Clock/i.test(e),
  );
  check(
    audioErrors.length === 0,
    "sem erros de console (áudio)",
    audioErrors.slice(0, 2).join(" · "),
  );
  await page.close();
}

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: [
    "--enable-unsafe-webgpu",
    "--ignore-gpu-blocklist",
    "--enable-gpu",
    "--autoplay-policy=no-user-gesture-required",
  ],
});
try {
  await probeBackend(browser, false);
  if (!onlyOne) await probeBackend(browser, true);
} finally {
  await browser.close();
}
console.log(failures ? `\n${failures} FALHA(S)` : "\nTUDO PASSOU");
process.exit(failures ? 1 : 0);
