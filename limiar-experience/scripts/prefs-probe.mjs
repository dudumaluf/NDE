/**
 * Sonda das preferências persistentes (grupo "Preferências" do leva):
 *  1. carrega o app, muda valores via levaStore (como se fosse no painel),
 *     salva como padrão (__limiarPrefsSave);
 *  2. RECARREGA e confere que os valores salvos venceram os defaults;
 *  3. confere que query param na URL vence o salvo;
 *  4. limpa o localStorage e confere a volta à fábrica.
 * Uso: node scripts/prefs-probe.mjs [urlBase]
 */
import { chromium } from "playwright-core";

const base = process.argv[2] ?? "http://localhost:5199/";
const url = (qs = "") => `${base}${qs ? (base.includes("?") ? "&" : "?") + qs : ""}`;

const browser = await chromium.launch({
  channel: "chrome",
  headless: true,
  args: ["--enable-unsafe-webgpu", "--ignore-gpu-blocklist", "--enable-gpu"],
});
const page = await browser.newPage({ viewport: { width: 900, height: 600 } });

async function boot(qs = "") {
  await page.goto(url(qs), { waitUntil: "domcontentloaded" });
  await page.waitForFunction("window.__limiarReady === true", null, {
    timeout: 20000,
  });
  await page.waitForTimeout(300);
}

const get = (path) =>
  page.evaluate(
    (p) => window.__limiarPrefsCollect?.()[p] ?? null,
    path,
  );

let fail = 0;
const check = (label, got, want) => {
  const ok = got === want;
  if (!ok) fail += 1;
  console.log(`${ok ? "ok " : "FALHOU"} ${label}: ${JSON.stringify(got)} (esperado ${JSON.stringify(want)})`);
};

// --- 1. muda valores e salva ---
await boot();
await page.evaluate(() => {
  window.__limiarFxSet({ nevoaDensidade: 1.25, vinhetaForca: 0.2 });
});
await page.waitForTimeout(250);
const saved = await page.evaluate(() => window.__limiarPrefsSave());
console.log(
  `salvo: ${Object.keys(saved?.values ?? {}).length} valores (v${saved?.version})`,
);
check("salvou densidade", saved?.values["Effects.nevoaDensidade"], 1.25);

// --- 2. reload: salvo vence a fábrica ---
await boot();
check("reload densidade (salvo)", await get("Effects.nevoaDensidade"), 1.25);
check("reload vinheta (salvo)", await get("Effects.vinhetaForca"), 0.2);
check("reload grid (fábrica intacta)", await get("Multidão.grid"), 32);

// --- 3. query param vence o salvo ---
await boot("fogRecuo=33");
check("qp vence salvo (fogRecuo)", await get("Effects.nevoaRecuo"), 33);
check("sem qp, salvo segue (densidade)", await get("Effects.nevoaDensidade"), 1.25);

// --- 4. limpa → fábrica ---
await page.evaluate(() => localStorage.removeItem("limiar.tuning"));
await boot();
check("fábrica de volta (densidade)", await get("Effects.nevoaDensidade"), 0.55);

await browser.close();
console.log(fail === 0 ? "PROBE OK" : `PROBE COM ${fail} FALHAS`);
process.exit(fail === 0 ? 0 : 1);
