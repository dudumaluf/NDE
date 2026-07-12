/**
 * Sincroniza os JSONs do export do acervo para public/content/.
 *
 * Por que cópia e não symlink (decisão do M3): o `vite build` copia public/
 * inteiro para dist/ SEGUINDO symlinks — um link para acervo/export
 * arrastaria os ~GB de audio/ para cada build; e em máquinas sem o export
 * o symlink pendurado quebraria a cópia. Os JSONs são ~2 MB, a cópia é
 * instantânea, vira snapshot estável (o export pode estar re-rodando em
 * paralelo) e se auto-cura via predev/prebuild. O áudio fica de fora até o
 * M4 (que decidirá streaming direto vs cópia parcial).
 *
 * Sem acervo/export na máquina → sai em silêncio (o app roda procedural).
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SRC = resolve(here, "../../acervo/export");
const DST = resolve(here, "../public/content");

const DOCS = [
  "manifest.json",
  "layout.json",
  "graph.json",
  "clusters.json",
  "stats.json",
  "taxonomy.json",
];

if (!existsSync(join(SRC, "manifest.json"))) {
  console.log("sync-content: acervo/export ausente — app segue procedural.");
  process.exit(0);
}

mkdirSync(DST, { recursive: true });
for (const f of DOCS) {
  if (existsSync(join(SRC, f))) copyFileSync(join(SRC, f), join(DST, f));
}

// people/: recria do zero para não sobrar pessoa de um export anterior.
rmSync(join(DST, "people"), { recursive: true, force: true });
mkdirSync(join(DST, "people"), { recursive: true });
let nPeople = 0;
// demographics.json (derivado): o app só precisa de um punhado de campos por
// pessoa para as lentes demográficas — destilar aqui evita 46 fetches no boot.
const demographics = {};
let nDemo = 0;
if (existsSync(join(SRC, "people"))) {
  for (const f of readdirSync(join(SRC, "people"))) {
    if (!f.endsWith(".json")) continue;
    copyFileSync(join(SRC, "people", f), join(DST, "people", f));
    nPeople += 1;
    const doc = JSON.parse(readFileSync(join(SRC, "people", f), "utf8"));
    const dem = doc.demographics ?? {};
    demographics[doc.id] = {
      sexo: dem.sexo ?? null,
      religiao_contexto: dem.religiao_contexto ?? null,
      local_evento: dem.local_evento ?? null,
      ano_evento: dem.ano_evento ?? null,
      tempo_clinico_declarado: dem.tempo_clinico_declarado ?? null,
      tempo_subjetivo_declarado: dem.tempo_subjetivo_declarado ?? null,
      cause_category: doc.cause_category ?? null,
    };
    if (doc.demographics) nDemo += 1;
  }
}
writeFileSync(join(DST, "demographics.json"), JSON.stringify(demographics));

const manifest = JSON.parse(readFileSync(join(DST, "manifest.json"), "utf8"));
console.log(
  `sync-content: ${manifest.counts?.people ?? "?"} pessoas (${nPeople} docs, ` +
    `${nDemo} com demographics) · manifest ${manifest.content_hash ?? "?"} → public/content/`,
);
