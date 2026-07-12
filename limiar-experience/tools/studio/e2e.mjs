/** E2E do VAT Studio: sobe a página, envia o Soldier, decima, assa e valida. */
import { chromium } from "playwright-core";
import { resolve } from "node:path";

const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto("http://localhost:5198/", { waitUntil: "domcontentloaded" });

// 1. envia o GLB pelo input de arquivo
await page.setInputFiles("#filepick", resolve("tools/fixtures/Soldier.glb"));

// 2. espera a análise materializar clipes e orçamento
await page.waitForFunction(() => document.querySelectorAll("#clips .clip").length >= 4, null, { timeout: 30000 });
await page.waitForFunction(() => document.querySelectorAll("#budgetStats .stat").length >= 4);
const clipNames = await page.$$eval("#clips .clip .name", (els) => els.map((e) => e.value));
const stats = await page.$$eval("#budgetStats .stat", (els) => els.map((e) => e.textContent.trim()));
console.log("clipes:", clipNames.join(" | "));
console.log("orçamento:", stats.join(" | "));
await page.screenshot({ path: "shots/studio-1-analise.png" });

// 3. desabilita o clipe TPose (estático, não serve)
const idxTPose = clipNames.findIndex((n) => /tpose/i.test(n));
if (idxTPose >= 0) {
  await page.click(`#clips .clip[data-i="${idxTPose}"] input[data-k=enabled]`);
  console.log("TPose desabilitado");
}

// 4. clica na correção sugerida (reduzir malha) e espera a estimativa
await page.waitForSelector("#lights button[data-action=decimate]", { timeout: 5000 });
await page.click("#lights button[data-action=decimate]");
await page.waitForFunction(
  () => document.querySelector("#lights")?.textContent.includes("Redução aplicada"),
  null,
  { timeout: 60000 },
);
const verdict = await page.textContent("#verdict");
console.log("veredito pós-redução:", verdict.trim());
await page.screenshot({ path: "shots/studio-2-reduzida.png" });

// 5. testa renome de clipe: Run → corrida
const idxRun = clipNames.findIndex((n) => n === "Run");
if (idxRun >= 0) {
  await page.fill(`#clips .clip[data-i="${idxRun}"] input.name`, "corrida");
  await page.press(`#clips .clip[data-i="${idxRun}"] input.name`, "Enter");
}

// 6. nome do export + gerar
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
console.log("resultado:", resultText.slice(0, 400));
await page.screenshot({ path: "shots/studio-3-resultado.png" });

const failed = resultText.includes("✗") || resultText.includes("FALHOU");
console.log(failed ? "E2E: FALHOU" : "E2E: OK");
if (logs.some((l) => l.startsWith("[pageerror]"))) console.log(logs.filter((l) => l.startsWith("[pageerror]")).join("\n"));

await browser.close();
process.exit(failed ? 1 : 0);
