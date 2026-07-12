/**
 * Verificação offline das lentes demográficas: compila src/data/demoLens.ts
 * (rolldown, o bundler do vite 8) e roda a classificação contra
 * public/content/ real — imprime contagem por categoria de cada lente e
 * sanidade dos alvos. Uso: node scripts/demo-lens-check.mjs
 */
import { rolldown } from "rolldown";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const tmp = mkdtempSync(join(tmpdir(), "demolens-"));
const outfile = join(tmp, "demoLens.mjs");

const bundle = await rolldown({
  input: join(root, "src/data/demoLens.ts"),
  logLevel: "silent",
});
await bundle.write({ file: outfile, format: "esm" });
await bundle.close();

const { DEMO_LENS_KEYS, classifyDemoLens, computeDemoTargets } = await import(
  pathToFileURL(outfile).href
);

const read = (f) =>
  JSON.parse(readFileSync(join(root, "public/content", f), "utf8"));
const content = {
  manifest: read("manifest.json"),
  layout: read("layout.json"),
  clusters: read("clusters.json"),
  graph: read("graph.json"),
  taxonomy: read("taxonomy.json"),
  demographics: read("demographics.json"),
};

const N = content.manifest.people.length;
for (const lens of DEMO_LENS_KEYS) {
  const cls = classifyDemoLens(lens, content);
  const total = cls.categories.reduce((s, c) => s + c.count, 0);
  console.log(`\n== ${lens} (${total}/${N}) ==`);
  for (const c of cls.categories) {
    if (c.count > 0) console.log(`  ${c.label}: ${c.count}`);
  }

  const out = new Float32Array(4096 * 4);
  computeDemoTargets(cls, 4096, out, { mapScale: 14, containRadius: 21 });
  let withTarget = 0;
  let bad = 0;
  for (let i = 0; i < 4096; i++) {
    if (out[i * 4 + 3] === 1) {
      withTarget += 1;
      const x = out[i * 4];
      const z = out[i * 4 + 2];
      if (!Number.isFinite(x) || !Number.isFinite(z) || Math.hypot(x, z) > 21) bad += 1;
    }
  }
  console.log(`  alvos: ${withTarget} (fora da contenção/NaN: ${bad})`);

  // Colisões: duas pessoas no MESMO alvo indicariam bug de layout.
  const seen = new Set();
  let dup = 0;
  for (let i = 0; i < N; i++) {
    if (out[i * 4 + 3] !== 1) continue;
    const key = `${out[i * 4].toFixed(2)},${out[i * 4 + 2].toFixed(2)}`;
    if (seen.has(key)) dup += 1;
    seen.add(key);
  }
  if (dup > 0) console.log(`  ALVOS DUPLICADOS: ${dup}`);
}

// Detalhe da lente tempo: quem está em cada arco, ordenado.
const cls = classifyDemoLens("tempo", content);
console.log("\n== tempo: detalhe ==");
content.manifest.people.forEach((p, i) => {
  const t = cls.tempo[i];
  if (t.clin === null && t.subj === null) return;
  const dem = content.demographics[p.id];
  console.log(
    `  ${p.id}: clin=${t.clin?.toFixed(2) ?? "—"} subj=${t.subj?.toFixed(2) ?? "—"}`,
    `| "${dem.tempo_clinico_declarado ?? ""}" / "${dem.tempo_subjetivo_declarado ?? ""}"`,
  );
});

rmSync(tmp, { recursive: true, force: true });
