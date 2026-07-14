/**
 * Sincroniza os cortes de áudio do acervo/export para o bucket público
 * `audio-cortes` do Supabase (projeto NDE, knqseuknuihqwlkfgesi) — a VOZ
 * do LIMIAR (doc 03 §14.8, doc 04 §4.2).
 *
 * Pipeline em 2 fases, AMBAS incrementais por arquivo (idempotente — pode
 * re-rodar depois de qualquer lote novo do acervo; só faz o que falta):
 *
 *  1. COMPRESSÃO — mp3 96 kbps do export → Opus mono 32 kbps VBR
 *     (`-application audio`; medido: SDR 16–18 dB vs original, banda cheia,
 *     ~34% do tamanho) num staging FORA do repo (default /tmp/limiar-opus —
 *     gitignored por natureza; ~/Documents sincroniza no iCloud e milhares
 *     de arquivos pequenos viram "dataless", ver STATUS). Escrita atômica
 *     (tmp+rename): interrupção nunca deixa .opus truncado.
 *
 *  2. UPLOAD — sobe pro bucket só o que a listagem remota não tem. Auth =
 *     anon key + policy TEMPORÁRIA de INSERT/UPDATE em storage.objects
 *     (abrir via MCP/SQL antes, derrubar depois — ritual no doc 03 §14.8).
 *     Ao final, regenera o `_index.json` GLOBAL no root do bucket
 *     (pessoa → lista de cortes disponíveis) — é ele que o app baixa (1
 *     fetch) para saber "tem áudio / não tem" sem HEAD nem 404 por arquivo.
 *
 * A fonte da verdade dos arquivos é o bloco `audio` dos people/<id>.json
 * (audio.beats[].file alinhado 1:1 com beats[], audio.quotes[elemento][i]
 * casando por posição com elements[].quotes, audio.whisper) — NUNCA o ls
 * do diretório (o disco tem órfãos de exports antigos que não devem subir).
 *
 * Uso:
 *   node scripts/audio-sync.mjs --dry-run          # só conta/mede
 *   node scripts/audio-sync.mjs                    # comprime o que falta
 *   node scripts/audio-sync.mjs --upload           # comprime + sobe
 *   node scripts/audio-sync.mjs --upload --only-beats   # subconjunto beats
 * Flags: --staging=<dir>  --jobs=<n ffmpeg>  --net=<n uploads>
 * Env:   SUPABASE_ANON_KEY sobrepõe a anon key embutida (que é pública por
 *        design — só funciona para ESCREVER enquanto a policy estiver aberta).
 */
import { spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  renameSync,
  statSync,
} from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const EXPORT = resolve(here, "../../acervo/export");

const SUPABASE_URL = "https://knqseuknuihqwlkfgesi.supabase.co";
const BUCKET = "audio-cortes";
// anon key (pública por design; escrita só com a policy temporária aberta)
const ANON_KEY =
  process.env.SUPABASE_ANON_KEY ??
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtucXNldWtudWlocXdsa2ZnZXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5Mzg2ODcsImV4cCI6MjA5NjUxNDY4N30._mEf67eEqJZNpwPV_qJxGytifqQH8FrfaJR8TowjdaM";

const args = process.argv.slice(2);
const flag = (name) => args.includes(`--${name}`);
const opt = (name, def) => {
  const a = args.find((x) => x.startsWith(`--${name}=`));
  return a ? a.slice(name.length + 3) : def;
};

const DRY = flag("dry-run");
const UPLOAD = flag("upload");
const ONLY_BEATS = flag("only-beats");
const STAGING = resolve(opt("staging", "/tmp/limiar-opus"));
const JOBS = Number(opt("jobs", "6"));
const NET_JOBS = Number(opt("net", "8"));
const OPUS_ARGS = ["-ac", "1", "-c:a", "libopus", "-b:a", "32k", "-application", "audio"];
/** Razão medida mp3 96k → opus 32k (para estimativas do dry-run). */
const EST_RATIO = 0.34;

const gb = (bytes) => `${(bytes / 1e9).toFixed(2)} GB`;
const mb = (bytes) => `${(bytes / 1e6).toFixed(1)} MB`;

// ---------------------------------------------------------------- 1. scan
if (!existsSync(join(EXPORT, "manifest.json"))) {
  console.error("audio-sync: acervo/export ausente nesta máquina — nada a fazer.");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(join(EXPORT, "manifest.json"), "utf8"));

/** @type {{personId:string,kind:"beat"|"quote"|"whisper",mp3:string,src:string,srcSize:number,out:string,dst:string}[]} */
const entries = [];
let missingOnDisk = 0;
for (const f of readdirSync(join(EXPORT, "people"))) {
  if (!f.endsWith(".json")) continue;
  const doc = JSON.parse(readFileSync(join(EXPORT, "people", f), "utf8"));
  const audio = doc.audio;
  if (!audio) continue;
  const files = [];
  for (const b of audio.beats ?? []) files.push({ mp3: b.file, kind: "beat" });
  if (!ONLY_BEATS) {
    for (const list of Object.values(audio.quotes ?? {}))
      for (const q of list) files.push({ mp3: q, kind: "quote" });
    if (audio.whisper) files.push({ mp3: audio.whisper, kind: "whisper" });
  }
  for (const { mp3, kind } of files) {
    const src = join(EXPORT, "audio", doc.id, mp3);
    if (!existsSync(src)) {
      missingOnDisk += 1;
      continue;
    }
    const out = mp3.replace(/\.mp3$/, ".opus");
    entries.push({
      personId: doc.id,
      kind,
      mp3,
      src,
      srcSize: statSync(src).size,
      out,
      dst: join(STAGING, doc.id, out),
    });
  }
}
const people = new Set(entries.map((e) => e.personId));
const byKind = (kind) => entries.filter((e) => e.kind === kind);
const sum = (list, get) => list.reduce((s, e) => s + get(e), 0);

console.log(
  `audio-sync: manifest ${manifest.content_hash} · ${people.size} pessoas · ` +
    `${entries.length} cortes referenciados (${byKind("beat").length} beats, ` +
    `${byKind("quote").length} quotes, ${byKind("whisper").length} whisper) · ` +
    `fonte ${gb(sum(entries, (e) => e.srcSize))}` +
    (missingOnDisk ? ` · AVISO: ${missingOnDisk} referenciados sem arquivo no disco` : ""),
);
if (ONLY_BEATS) console.log("audio-sync: --only-beats (quotes/whisper ficam de fora)");

// ------------------------------------------------------------ 2. compress
const staged = (e) => existsSync(e.dst) && statSync(e.dst).size > 0;
const toCompress = entries.filter((e) => !staged(e));
console.log(
  `\n[compressão] staging ${STAGING}\n` +
    `  já no staging: ${entries.length - toCompress.length} · a comprimir: ${toCompress.length}` +
    (toCompress.length
      ? ` (~${gb(sum(toCompress, (e) => e.srcSize) * EST_RATIO)} estimado)`
      : ""),
);

async function ffmpeg(e) {
  mkdirSync(dirname(e.dst), { recursive: true });
  const tmp = `${e.dst}.tmp-${process.pid}`;
  await new Promise((resolveP, rejectP) => {
    const p = spawn(
      "ffmpeg",
      ["-y", "-v", "error", "-i", e.src, ...OPUS_ARGS, "-f", "opus", tmp],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    let err = "";
    p.stderr.on("data", (d) => (err += d));
    p.on("close", (code) =>
      code === 0 ? resolveP() : rejectP(new Error(`ffmpeg ${e.src}: ${err}`)),
    );
  });
  renameSync(tmp, e.dst);
}

async function pool(items, n, worker, label) {
  let i = 0;
  let done = 0;
  let failed = 0;
  const t0 = Date.now();
  const errors = [];
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const item = items[i++];
        try {
          await worker(item);
        } catch (err) {
          failed += 1;
          if (errors.length < 5) errors.push(err.message ?? String(err));
        }
        done += 1;
        if (done % 250 === 0 || done === items.length) {
          const rate = done / ((Date.now() - t0) / 1000);
          process.stdout.write(
            `\r  [${label}] ${done}/${items.length} (${rate.toFixed(0)}/s)${failed ? ` · ${failed} FALHAS` : ""}   `,
          );
        }
      }
    }),
  );
  if (items.length) process.stdout.write("\n");
  for (const e of errors) console.error(`  ERRO: ${e}`);
  return failed;
}

if (!DRY && toCompress.length) {
  const failed = await pool(toCompress, JOBS, ffmpeg, "opus");
  if (failed) {
    console.error(`audio-sync: ${failed} compressões falharam — abortando.`);
    process.exit(1);
  }
}

// Medição do staging (SEMPRE antes de qualquer upload — guardrail de quota).
const stagedEntries = entries.filter(staged);
const stagedBytes = sum(stagedEntries, (e) => statSync(e.dst).size);
const kindBytes = (kind) =>
  sum(
    stagedEntries.filter((e) => e.kind === kind),
    (e) => statSync(e.dst).size,
  );
console.log(
  `  staging agora: ${stagedEntries.length}/${entries.length} cortes · ${gb(stagedBytes)}` +
    ` (beats ${gb(kindBytes("beat"))} · quotes ${gb(kindBytes("quote"))} · whisper ${mb(kindBytes("whisper"))})`,
);

// -------------------------------------------------------------- 3. upload
const HEADERS = {
  Authorization: `Bearer ${ANON_KEY}`,
  apikey: ANON_KEY,
};

/** fetch com retry também para erros de REDE (fetch failed lança, não responde). */
async function fetchRetry(url, init, tries = 4) {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fetch(url, init);
    } catch (err) {
      if (attempt >= tries) throw err;
      await new Promise((r) => setTimeout(r, 600 * attempt * attempt));
    }
  }
}

/** Lista TODOS os objetos de um prefixo (paginado). */
async function listRemote(prefix) {
  const names = new Map(); // name -> size
  for (let offset = 0; ; offset += 1000) {
    const res = await fetchRetry(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: "POST",
      headers: { ...HEADERS, "Content-Type": "application/json" },
      body: JSON.stringify({ prefix, limit: 1000, offset }),
    });
    if (!res.ok) throw new Error(`list ${prefix}: HTTP ${res.status} ${await res.text()}`);
    const items = await res.json();
    for (const it of items)
      if (it.id) names.set(it.name, it.metadata?.size ?? 0);
    if (items.length < 1000) break;
  }
  return names;
}

async function put(path, body, contentType, upsert = false) {
  for (let attempt = 1; ; attempt++) {
    const res = await fetchRetry(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`, {
      method: "POST",
      headers: {
        ...HEADERS,
        "Content-Type": contentType,
        "x-upsert": String(upsert),
        "cache-control": "max-age=31536000",
      },
      body,
    });
    if (res.ok) return;
    const text = await res.text();
    // 409 = já existe (corrida benigna entre re-runs) — idempotência ok.
    if (res.status === 409) return;
    if (res.status === 403)
      throw new Error(
        `HTTP 403 em ${path} — a policy temporária de INSERT/UPDATE do bucket ` +
          `está fechada. Abrir via MCP/SQL antes do sync (doc 03 §14.8).`,
      );
    if (attempt >= 3) throw new Error(`upload ${path}: HTTP ${res.status} ${text}`);
    await new Promise((r) => setTimeout(r, 500 * attempt * attempt));
  }
}

if (UPLOAD && !DRY) {
  console.log(`\n[upload] bucket ${BUCKET} @ ${SUPABASE_URL}`);
  const peopleList = [...people].sort();
  let uploadedFiles = 0;
  let uploadedBytes = 0;
  let skipped = 0;
  /** pessoa → nomes .opus PRESENTES no bucket após esta rodada. */
  const remoteIndex = {};

  for (const pid of peopleList) {
    const mine = stagedEntries.filter((e) => e.personId === pid);
    const remote = await listRemote(pid);
    const todo = mine.filter((e) => !remote.has(e.out));
    if (todo.length) {
      const failed = await pool(
        todo,
        NET_JOBS,
        async (e) => {
          await put(`${pid}/${e.out}`, await readFile(e.dst), "audio/ogg");
          uploadedFiles += 1;
          uploadedBytes += statSync(e.dst).size;
        },
        pid,
      );
      if (failed) {
        console.error(`audio-sync: uploads falharam em ${pid} — abortando.`);
        process.exit(1);
      }
    } else {
      skipped += mine.length;
    }
    remoteIndex[pid] = [
      ...new Set([...remote.keys(), ...todo.map((e) => e.out)]),
    ].sort();
  }

  // Índice global (o app baixa 1 vez): só o que o bucket REALMENTE tem.
  await put(
    "_index.json",
    JSON.stringify({
      generated_at: new Date().toISOString(),
      manifest: manifest.content_hash,
      people: remoteIndex,
    }),
    "application/json",
    true,
  );
  const nIndexed = Object.values(remoteIndex).reduce((s, l) => s + l.length, 0);
  console.log(
    `  subidos: ${uploadedFiles} (${gb(uploadedBytes)}) · já estavam lá: ${skipped} · _index.json: ${nIndexed} cortes`,
  );
  console.log(
    "\nLembrete: DERRUBAR a policy temporária de INSERT/UPDATE agora (doc 03 §14.8).",
  );
} else if (UPLOAD && DRY) {
  console.log(`\n[upload dry-run] consultando o bucket ${BUCKET}…`);
  try {
    let missing = 0;
    let missingBytes = 0;
    for (const pid of [...people].sort()) {
      const remote = await listRemote(pid);
      for (const e of stagedEntries.filter((x) => x.personId === pid))
        if (!remote.has(e.out)) {
          missing += 1;
          missingBytes += statSync(e.dst).size;
        }
    }
    console.log(`  a subir: ${missing} cortes · ${gb(missingBytes)}`);
  } catch (err) {
    console.log(`  listagem indisponível (${err.message}) — assumindo bucket vazio: ` +
      `${stagedEntries.length} cortes · ${gb(stagedBytes)}`);
  }
}

if (DRY) console.log("\n(dry-run: nada foi comprimido nem subido)");
