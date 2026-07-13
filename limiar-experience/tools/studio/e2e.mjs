/**
 * E2E do VAT Studio: sobe a página, envia o Soldier e exercita o fluxo v2 —
 * deletar clipe, combinar clipes em um track, decimar, renomear, assar e
 * validar (selftest + aviso de morfabilidade entre VATs) — e os diagnósticos
 * de artefato (pose de descanso, membro congelado).
 */
import { chromium } from "playwright-core";
import { resolve, join } from "node:path";
import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";

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

// ---------------------------------------------------------------------------
// Parte 2 — FBX do Mixamo direto (sem Blender): personagem "With Skin"
// (samba.fbx, do repo do three.js), animação "Without Skin" (samba-anim.fbx,
// derivada via Blender) e o erro claro para FBX ASCII antigo.

console.log("--- parte 2: FBX Mixamo direto ---");
const page2 = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page2.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
const dialogs = [];
page2.on("dialog", (d) => {
  dialogs.push(d.message());
  d.accept();
});
await page2.goto("http://localhost:5198/", { waitUntil: "domcontentloaded" });

// 9. FBX ASCII antigo → alerta claro, nada é adicionado
await page2.setInputFiles("#filepick", resolve("tools/fixtures/old-ascii.fbx"));
await page2.waitForFunction(() => true, null, { timeout: 1000 }).catch(() => {});
await page2.waitForTimeout(800);
check(
  dialogs.some((m) => /FBX ASCII não suportado/.test(m)),
  `FBX ASCII recusado com mensagem clara: "${(dialogs[0] ?? "").slice(0, 90)}…"`,
);

// 10. personagem FBX (com skin) + animação FBX (sem skin)
await page2.setInputFiles("#filepick", [
  resolve("tools/fixtures/samba.fbx"),
  resolve("tools/fixtures/samba-anim.fbx"),
]);
await page2.waitForFunction(() => document.querySelectorAll("#clips .clip").length >= 2, null, { timeout: 60000 });
const fbxClips = await page2.$$eval("#clips .clip input.name", (els) => els.map((e) => e.value));
const meshinfo = (await page2.textContent("#meshinfo")).trim();
console.log("clipes FBX:", fbxClips.join(" | "), "·", meshinfo);
check(
  fbxClips.includes("samba") && fbxClips.includes("samba-anim"),
  `clipes do FBX renomeados ("mixamo.com" → nome do arquivo): ${fbxClips.join(", ")}`,
);
check(/altura 1\.[78]/.test(meshinfo), `escala cm→m aplicada (${meshinfo.match(/altura [\d.]+/)?.[0]})`);
await page2.screenshot({ path: "shots/studio-5-fbx-analise.png" });

// 11. malha densa do FBX → correção de 1 clique (reduzir) e bake
await page2.waitForSelector("#lights button[data-action=decimate]", { timeout: 5000 });
await page2.click("#lights button[data-action=decimate]");
await page2.waitForFunction(
  () => document.querySelector("#lights")?.textContent.includes("Redução aplicada"),
  null,
  { timeout: 120000 },
);
await page2.fill("#assetName", "samba-e2e");
await page2.click("#bakeBtn");
await page2.waitForFunction(
  () => {
    const r = document.getElementById("result");
    const log = document.getElementById("log")?.textContent ?? "";
    return (r && !r.classList.contains("hidden")) || log.includes("FALHOU");
  },
  null,
  { timeout: 180000 },
);
const fbxResult = (await page2.textContent("#result")).trim().replace(/\s+/g, " ");
console.log("resultado FBX:", fbxResult.slice(0, 240));
check(!fbxResult.includes("✗") && !fbxResult.includes("FALHOU"), "bake do FBX validado (selftest)");
check(/samba(?!-e2e)/.test(fbxResult) && fbxResult.includes("samba-anim"), "os 2 clipes FBX (com e sem skin) assados");
await page2.screenshot({ path: "shots/studio-6-fbx-resultado.png" });

// ---------------------------------------------------------------------------
// Parte 3 — regressão do bug "base GLB + anim FBX afunda (chão na cintura)":
// xbot.glb (rig GLB do Blender: ossos em cm/Z-up sob nó 0,01 — a convenção
// do fluxo do criador) + samba-anim.fbx (m/Y-up). Sem o rebase de tracks no
// retarget, o preview mostrava o corpo ~0,9 m abaixo do chão. Também
// exercita o offset Y manual por clipe.

console.log("--- parte 3: base GLB + anim FBX (regressão do afundamento) ---");
const page3 = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page3.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page3.on("dialog", (d) => d.accept());
await page3.goto("http://localhost:5198/", { waitUntil: "domcontentloaded" });
await page3.setInputFiles("#filepick", [
  resolve("tools/fixtures/xbot.glb"),
  resolve("tools/fixtures/samba-anim.fbx"),
]);
await page3.waitForFunction(() => document.querySelectorAll("#clips .clip").length >= 1, null, { timeout: 60000 });

// toca o clipe FBX e mede o menor Y skinado do preview
const names3 = await page3.$$eval("#clips .clip input.name", (els) => els.map((e) => e.value));
const idxFbx = names3.indexOf("samba-anim");
check(idxFbx >= 0, `clipe FBX presente na lista (${names3.join(", ")})`);
const alturaOk = /altura 1\.[78]/.test((await page3.textContent("#meshinfo")).trim());
check(alturaOk, `altura da base GLB medida via skinning (${(await page3.textContent("#meshinfo")).trim().slice(-12)})`);
await page3.click(`#clips .clip[data-i="${idxFbx}"] [data-k=play]`);
await page3.waitForTimeout(1200);
const minY = await page3.evaluate(() => window.__studio.skinnedMinY());
check(
  minY !== null && minY > -0.15 && minY < 0.4,
  `preview do clipe FBX com pés no chão (min Y skinado = ${minY?.toFixed(3)}; antes do fix ≈ −0,9)`,
);
// diagnóstico de pose de descanso: o rest da anim (1º frame da dança, via
// Blender) difere do bind do personagem → aviso com recomendação Mixamo
const filesPanel = (await page3.textContent("#files")).replace(/\s+/g, " ");
check(
  /pose de descanso difere/.test(filesPanel) && /retarget no Mixamo/.test(filesPanel),
  "aviso de pose de descanso + recomendação de retarget no Mixamo visíveis no painel de arquivos",
);
await page3.screenshot({ path: "shots/bug-depois-fix.png" });
await page3.screenshot({ path: "shots/studio-7-restpose.png" });

// offset Y manual por clipe: +0.3 sobe o personagem no preview
await page3.fill(`#clips .clip[data-i="${idxFbx}"] [data-k=yoff]`, "0.3");
await page3.dispatchEvent(`#clips .clip[data-i="${idxFbx}"] [data-k=yoff]`, "change");
await page3.waitForTimeout(300);
const minYOff = await page3.evaluate(() => window.__studio.skinnedMinY());
check(
  minYOff !== null && minYOff - minY > 0.2,
  `offset Y manual aplicado no preview (min Y ${minY?.toFixed(3)} → ${minYOff?.toFixed(3)})`,
);
// volta para auto e assa
await page3.fill(`#clips .clip[data-i="${idxFbx}"] [data-k=yoff]`, "");
await page3.dispatchEvent(`#clips .clip[data-i="${idxFbx}"] [data-k=yoff]`, "change");
await page3.waitForSelector("#lights button[data-action=decimate]", { timeout: 5000 });
await page3.click("#lights button[data-action=decimate]");
await page3.waitForFunction(
  () => document.querySelector("#lights")?.textContent.includes("Redução aplicada"),
  null,
  { timeout: 180000 },
);
await page3.fill("#assetName", "bugfix-e2e");
await page3.click("#bakeBtn");
await page3.waitForFunction(
  () => {
    const r = document.getElementById("result");
    const log = document.getElementById("log")?.textContent ?? "";
    return (r && !r.classList.contains("hidden")) || log.includes("FALHOU");
  },
  null,
  { timeout: 180000 },
);
const mixResult = (await page3.textContent("#result")).trim().replace(/\s+/g, " ");
check(
  !mixResult.includes("✗") && !mixResult.includes("FALHOU"),
  "bake GLB+FBX validado (selftest com pé no chão POR CLIPE)",
);

// ---------------------------------------------------------------------------
// Parte 4 — diagnóstico de MEMBRO CONGELADO ("perna manca"): um clipe de
// locomoção cuja fonte não anima a perna esquerda deve ser acusado na lista
// de clipes ANTES do bake. A fixture é gerada aqui (Walk do Soldier sem as
// tracks da perna esquerda).

console.log("--- parte 4: membro congelado (perna manca) ---");
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((ab) => {
      this.result = ab;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((ab) => {
      this.result = "data:application/octet-stream;base64," + Buffer.from(ab).toString("base64");
      this.onloadend?.();
    });
  }
};
const { loadModelFile } = await import("../vat-core.mjs");
const { GLTFExporter } = await import("three/addons/exporters/GLTFExporter.js");
const soldierG = await loadModelFile(resolve("tools/fixtures/Soldier.glb"), () => {});
const walkClip = soldierG.animations.find((a) => a.name === "Walk").clone();
walkClip.name = "walk-semperna";
walkClip.tracks = walkClip.tracks.filter((t) => !/Left(UpLeg|Leg|Foot|Toe)/i.test(t.name));
const frozenGlbPath = join(tmpdir(), "walk-semperna.glb");
writeFileSync(
  frozenGlbPath,
  Buffer.from(
    await new Promise((res, rej) =>
      new GLTFExporter().parse(soldierG.scene, res, rej, { binary: true, animations: [walkClip] }),
    ),
  ),
);

const page4 = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page4.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page4.on("dialog", (d) => d.accept());
await page4.goto("http://localhost:5198/", { waitUntil: "domcontentloaded" });
await page4.setInputFiles("#filepick", [resolve("tools/fixtures/Soldier.glb"), frozenGlbPath]);
await page4.waitForFunction(() => document.querySelectorAll("#clips .clip").length >= 5, null, { timeout: 60000 });
const clipsPanel = (await page4.textContent("#clips")).replace(/\s+/g, " ");
check(
  /sem movimento: perna esq\./.test(clipsPanel) && /LeftUpLeg/.test(clipsPanel),
  `aviso "sem movimento: perna esq. (LeftUpLeg…)" visível no clipe de locomoção`,
);
check(
  !/Walk[^-].*sem movimento|sem movimento.*"Walk"/.test(clipsPanel.replace(/walk-semperna/g, "")),
  "clipes saudáveis (Walk/Run/Idle) sem falso positivo",
);
await page4.screenshot({ path: "shots/studio-8-perna.png" });

// ---------------------------------------------------------------------------
// Parte 5 — REGRESSÃO DO FLUXO CLÁSSICO (permanente): base GLB + anim GLB
// sem skin do MESMO rig, com os nós do arquivo de animação POSADOS num frame
// do clipe (como o Blender exporta) — o retarget deve aplicar DIRETO:
// os valores entregues têm de ser IDÊNTICOS aos crus (delta 0.0, não
// "pequeno"). Regressão real: o rebase por pose de descanso inferia o rest
// do frame posado e cruzava os braços.

console.log("--- parte 5: regressão do fluxo clássico (GLB + GLB sem skin, mesmo rig) ---");
{
  const THREE = await import("three");
  const { loadModelFile: loadM, buildModel, selectClips } = await import("../vat-core.mjs");

  // fixture gerada na hora: Walk do Soldier como anim-only, nós POSADOS em t=0.4s
  const src = await loadM(resolve("tools/fixtures/Soldier.glb"), () => {});
  const clip = src.animations.find((a) => a.name === "Walk").clone();
  clip.name = "andar";
  const mixer = new THREE.AnimationMixer(src.scene);
  mixer.clipAction(clip).play();
  mixer.setTime(0.4);
  src.scene.updateMatrixWorld(true);
  const holder = new THREE.Group();
  src.scene.traverse((o) => {
    if (o.isBone && !o.parent?.isBone) holder.add(o.clone(true));
  });
  const noskinPath = join(tmpdir(), "soldier-andar-noskin.glb");
  writeFileSync(
    noskinPath,
    Buffer.from(
      await new Promise((res, rej) =>
        new GLTFExporter().parse(holder, res, rej, { binary: true, animations: [clip] }),
      ),
    ),
  );

  const files = [
    { path: resolve("tools/fixtures/Soldier.glb"), gltf: await loadM(resolve("tools/fixtures/Soldier.glb"), () => {}) },
    { path: noskinPath, gltf: await loadM(noskinPath, () => {}) },
  ];
  const model = buildModel(files[0].gltf, "Soldier.glb", () => {});
  const raw = files[1].gltf.animations[0];
  const entries = selectClips(files, model, [{ file: 1, clip: 0, name: "andar", mode: "loop", inPlace: false }], () => {});
  let worst = 0;
  let compared = 0;
  for (const t of raw.tracks) {
    const r = entries[0].clip.tracks.find((x) => x.name === t.name);
    if (!r) continue;
    compared += 1;
    for (let i = 0; i < t.values.length; i++) worst = Math.max(worst, Math.abs(t.values[i] - r.values[i]));
  }
  check(
    compared > 100 && worst === 0,
    `fluxo clássico aplicado DIRETO: delta ${worst} em ${compared} tracks (exigido: 0.0 exato)`,
  );

  // e o caso FBX×GLB legítimo (mesmo personagem) segue rebaseado e no chão
  const files2 = [
    { path: resolve("tools/fixtures/xbot.glb"), gltf: await loadM(resolve("tools/fixtures/xbot.glb"), () => {}) },
    { path: resolve("tools/fixtures/samba-anim.fbx"), gltf: await loadM(resolve("tools/fixtures/samba-anim.fbx"), () => {}) },
  ];
  const model2 = buildModel(files2[0].gltf, "xbot.glb", () => {});
  const entries2 = selectClips(files2, model2, [{ file: 1, clip: 0, name: "samba", mode: "loop", inPlace: false }], () => {});
  const mx = new THREE.AnimationMixer(files2[0].gltf.scene);
  mx.clipAction(entries2[0].clip).play();
  let minFoot = Infinity;
  const v = new THREE.Vector3();
  for (const t of [0.5, 2.0, 7.5]) {
    mx.setTime(t);
    files2[0].gltf.scene.updateMatrixWorld(true);
    files2[0].gltf.scene.traverse((o) => {
      if (o.isBone && /LeftFoot$|RightFoot$/.test(o.name)) {
        o.getWorldPosition(v);
        if (v.y < minFoot) minFoot = v.y;
      }
    });
  }
  check(
    minFoot > -0.1 && minFoot < 0.35,
    `FBX×GLB (mesmo personagem) segue com pés no chão (menor pé Y = ${minFoot.toFixed(3)})`,
  );
}

console.log(failed ? "E2E: FALHOU" : "E2E: OK");
if (logs.some((l) => l.startsWith("[pageerror]"))) console.log(logs.filter((l) => l.startsWith("[pageerror]")).join("\n"));

await browser.close();
process.exit(failed ? 1 : 0);
