/**
 * E2E do VAT Studio: sobe a página, envia o Soldier e exercita o fluxo v2 —
 * deletar clipe, combinar clipes em um track, decimar, renomear, assar e
 * validar (selftest + aviso de morfabilidade entre VATs).
 */
import { chromium } from "playwright-core";
import { resolve } from "node:path";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

const clipRows = () =>
  page.$$eval("#clips .clip", (els) =>
    els.map((el) => ({
      name: el.querySelector("input.name")?.value ?? "",
      combo: Boolean(el.querySelector(".combadge")),
    })),
  );
const rowIndexOf = async (name) => (await clipRows()).findIndex((r) => r.name === name);

let failed = false;
const check = (ok, label) => {
  console.log(`${ok ? "ok " : "FALHOU"}  ${label}`);
  if (!ok) failed = true;
};

await page.goto("http://localhost:5198/", { waitUntil: "domcontentloaded" });

// 1. envia o GLB pelo input de arquivo
await page.setInputFiles("#filepick", resolve("tools/fixtures/Soldier.glb"));

// 2. espera a análise materializar clipes e orçamento
await page.waitForFunction(() => document.querySelectorAll("#clips .clip").length >= 4, null, { timeout: 30000 });
await page.waitForFunction(() => document.querySelectorAll("#budgetStats .stat").length >= 4);
let names = (await clipRows()).map((r) => r.name);
console.log("clipes:", names.join(" | "));
console.log("orçamento:", (await page.$$eval("#budgetStats .stat", (els) => els.map((e) => e.textContent.trim()))).join(" | "));
await page.screenshot({ path: "shots/studio-1-analise.png" });

// 3. DELETAR o clipe TPose (v2: botão × remove da lista e recalcula orçamento)
const framesBefore = await page.$eval("#budgetStats .stat:nth-child(2) b", (e) => e.textContent);
const idxTPose = await rowIndexOf("TPose");
check(idxTPose >= 0, `TPose está na lista (linha ${idxTPose})`);
await page.click(`#clips .clip[data-i="${idxTPose}"] [data-k=del]`);
await page.waitForFunction(() => document.querySelectorAll("#clips .clip").length === 3);
const framesAfter = await page.$eval("#budgetStats .stat:nth-child(2) b", (e) => e.textContent);
check(
  (await clipRows()).every((r) => r.name !== "TPose") && framesBefore !== framesAfter,
  `TPose deletado — orçamento recalculado (${framesBefore} → ${framesAfter} frames)`,
);

// 4. clica na correção sugerida (reduzir malha) e espera a estimativa
await page.waitForSelector("#lights button[data-action=decimate]", { timeout: 5000 });
await page.click("#lights button[data-action=decimate]");
await page.waitForFunction(
  () => document.querySelector("#lights")?.textContent.includes("Redução aplicada"),
  null,
  { timeout: 60000 },
);
console.log("veredito pós-redução:", (await page.textContent("#verdict")).trim());
await page.screenshot({ path: "shots/studio-2-reduzida.png" });

// 5. COMBINAR Idle + Walk + Idle (v2: ⧉ duplica, multi-seleção na ordem → combinar)
//    idle no início e no fim = o loop combinado fecha (micro-variação típica)
await page.click(`#clips .clip[data-i="${await rowIndexOf("Idle")}"] [data-k=dup]`);
await page.waitForFunction(() => document.querySelectorAll("#clips .clip").length === 4);
check((await rowIndexOf("Idle_2")) >= 0, "Idle duplicado (Idle_2) para fechar o loop do combinado");
for (const nm of ["Idle", "Walk", "Idle_2"]) {
  const i = await rowIndexOf(nm);
  await page.click(`#clips .clip[data-i="${i}"] [data-k=sel]`);
}
await page.waitForSelector("#comboBar:not(.hidden)", { timeout: 5000 });
await page.fill("#comboFade", "0.25");
await page.dispatchEvent("#comboFade", "change");
await page.click("#comboGo");
await page.waitForFunction(() => document.querySelector("#clips .combadge") !== null, null, { timeout: 10000 });
const rows = await clipRows();
const combo = rows.find((r) => r.combo);
check(rows.length === 2 && Boolean(combo), `combinado criado: "${combo?.name}" (${rows.length} linhas na lista)`);
const comboDur = await page.$eval("#clips .combadge", (el) =>
  el.closest(".clip").querySelector(".meta span").textContent,
);
check(
  /4[,.][45]s/.test(comboDur),
  `duração do combinado ${comboDur.trim()} (1.97+1.03+1.97 − 2×0.25 ≈ 4.5s — igual ao que o bake assa)`,
);
await page.screenshot({ path: "shots/studio-3-combinado.png" });

// 6. renomeia: combo → idle-walk, Run → corrida
const idxCombo = (await clipRows()).findIndex((r) => r.combo);
await page.fill(`#clips .clip[data-i="${idxCombo}"] input.name`, "idle-walk");
await page.press(`#clips .clip[data-i="${idxCombo}"] input.name`, "Enter");
const idxRun = await rowIndexOf("Run");
if (idxRun >= 0) {
  await page.fill(`#clips .clip[data-i="${idxRun}"] input.name`, "corrida");
  await page.press(`#clips .clip[data-i="${idxRun}"] input.name`, "Enter");
}

// 7. nome do export + gerar
await page.fill("#assetName", "soldier-e2e");
await page.click("#bakeBtn");
await page.waitForFunction(
  () => {
    const r = document.getElementById("result");
    const log = document.getElementById("log")?.textContent ?? "";
    return (r && !r.classList.contains("hidden")) || log.includes("FALHOU");
  },
  null,
  { timeout: 180000 },
);
const resultText = (await page.textContent("#result")).trim().replace(/\s+/g, " ");
console.log("resultado:", resultText.slice(0, 300));
check(!resultText.includes("✗") && !resultText.includes("FALHOU"), "bake validado (selftest)");
check(resultText.includes("idle-walk"), "clipe combinado está no descriptor");
check(!/TPose/.test(resultText), "clipe deletado não foi assado");

// 8. morfabilidade: soldier-a/soldier-b (mesma malha, mesma redução) devem aparecer
if (resultText.includes("Morfável com")) {
  check(true, `aviso de morfabilidade presente: ${resultText.match(/Morfável com[^.]*/)?.[0] ?? ""}`);
} else {
  check(resultText.includes("Não-morfável"), "aviso de morfabilidade presente (não-morfável)");
}
await page.screenshot({ path: "shots/studio-4-resultado.png" });

console.log(failed ? "E2E: FALHOU" : "E2E: OK");
if (logs.some((l) => l.startsWith("[pageerror]"))) console.log(logs.filter((l) => l.startsWith("[pageerror]")).join("\n"));

await browser.close();
process.exit(failed ? 1 : 0);
