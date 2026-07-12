#!/usr/bin/env node
/**
 * vat-studio — interface visual do vat-bake (GLB/Mixamo → texturas VAT).
 *
 *   node tools/vat-studio.mjs   (ou: npm run studio)
 *   → http://localhost:5198
 *
 * Servidor Node puro (sem build step): serve a página (tools/studio/),
 * o three.js de node_modules para o preview 3D, e expõe uma API mínima:
 *
 *   POST /api/session                cria sessão de trabalho
 *   PUT  /api/upload?session&name    recebe um GLB (corpo raw)
 *   POST /api/analyze?session        analisa malha + clipes (sem assar)
 *   POST /api/bake?session           inicia o bake (JSON de config) → { job }
 *   GET  /api/events?job             progresso do bake via SSE
 *   GET  /api/devserver              o app (5199) está de pé?
 *   GET  /api/assets                 exports já existentes em public/vat/
 *
 * O bake em si é o mesmo motor do CLI (tools/vat-core.mjs) — a UI só decide
 * os números. Saída: public/vat/<nome>/ (carregada no app com ?vat=<nome>).
 */

import { createServer, get as httpGet } from "node:http";
import { existsSync, mkdirSync, readdirSync, readFileSync, createWriteStream } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { randomBytes } from "node:crypto";
import {
  BakeError,
  bakeToDir,
  analyzeFiles,
  buildModel,
  decimateModel,
  findCharacterIndex,
  loadGltf,
  selectClips,
  runSelftest,
} from "./vat-core.mjs";

const PORT = 5198;
const APP_URL = "http://localhost:5199";
const MAX_UPLOAD = 200 * 1024 * 1024;

const TOOLS_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(TOOLS_DIR); // limiar-experience/
const STUDIO_DIR = join(TOOLS_DIR, "studio");
const VENDOR = {
  "/vendor/three.module.js": join(ROOT, "node_modules/three/build/three.module.js"),
  "/vendor/three.core.js": join(ROOT, "node_modules/three/build/three.core.js"),
  "/vendor/meshopt_simplifier.js": join(ROOT, "node_modules/meshoptimizer/meshopt_simplifier.js"),
};
const ADDONS_DIR = join(ROOT, "node_modules/three/examples/jsm");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".glb": "model/gltf-binary",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

// ---------------------------------------------------------------------------
// Estado em memória: sessões (uploads) e jobs (bakes em andamento)

const sessions = new Map(); // id → { dir, files: [{ name, path, size }] }
const jobs = new Map(); // id → { events: [], listeners: Set<res>, done: boolean }

const newId = () => randomBytes(8).toString("hex");

function jobEmit(job, event) {
  job.events.push(event);
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of job.listeners) res.write(data);
  if (event.type === "done" || event.type === "error") {
    job.done = true;
    for (const res of job.listeners) res.end();
    job.listeners.clear();
  }
}

// ---------------------------------------------------------------------------
// Helpers HTTP

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  res.end(body);
}

function sendFile(res, path) {
  try {
    const body = readFileSync(path);
    res.writeHead(200, {
      "content-type": MIME[extname(path).toLowerCase()] ?? "application/octet-stream",
      "cache-control": "no-cache",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("não encontrado");
  }
}

function readBody(req, limit = MAX_UPLOAD) {
  return new Promise((resolvePromise, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error(`corpo maior que ${Math.round(limit / 1048576)} MB`));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolvePromise(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

const cleanFileName = (name) =>
  (name ?? "arquivo.glb").replace(/[^\w.\- ]+/g, "_").slice(0, 120);

const validAssetName = (name) => /^[a-z0-9][a-z0-9_-]{0,40}$/i.test(name ?? "");

// ---------------------------------------------------------------------------
// Rotas da API

async function handleApi(req, res, url) {
  const q = url.searchParams;

  if (req.method === "POST" && url.pathname === "/api/session") {
    const id = newId();
    const dir = join(tmpdir(), `vat-studio-${id}`);
    mkdirSync(dir, { recursive: true });
    sessions.set(id, { dir, files: [] });
    return sendJson(res, 200, { session: id });
  }

  const session = sessions.get(q.get("session"));

  if (req.method === "PUT" && url.pathname === "/api/upload") {
    if (!session) return sendJson(res, 400, { error: "sessão inválida (recarregue a página)" });
    const name = cleanFileName(q.get("name"));
    if (![".glb", ".gltf"].includes(extname(name).toLowerCase()))
      return sendJson(res, 400, { error: `só GLB/GLTF (recebi "${name}") — FBX do Mixamo: converta antes (guia no rodapé)` });
    const body = await readBody(req);
    if (body.length < 20) return sendJson(res, 400, { error: "arquivo vazio" });
    // subdiretório por índice: o basename fica limpo (ele vira nome de clipe
    // quando o clipe é genérico tipo "mixamo.com")
    const dir = join(session.dir, String(session.files.length));
    mkdirSync(dir, { recursive: true });
    const path = join(dir, name);
    await new Promise((ok, bad) => {
      const w = createWriteStream(path);
      w.on("error", bad);
      w.on("finish", ok);
      w.end(body);
    });
    session.files.push({ name, path, size: body.length });
    return sendJson(res, 200, { ok: true, index: session.files.length - 1, size: body.length });
  }

  if (req.method === "POST" && url.pathname === "/api/analyze") {
    if (!session) return sendJson(res, 400, { error: "sessão inválida (recarregue a página)" });
    if (session.files.length === 0) return sendJson(res, 400, { error: "nenhum arquivo enviado" });
    const warnings = [];
    try {
      const analysis = await analyzeFiles(
        session.files.map((f) => f.path),
        (m) => warnings.push(String(m)),
      );
      return sendJson(res, 200, { ...analysis, warnings, files: session.files.map((f) => ({ name: f.name, size: f.size })) });
    } catch (e) {
      if (e instanceof BakeError) return sendJson(res, 422, { error: e.message });
      throw e;
    }
  }

  // Decimação para preview/orçamento: roda o MESMO decimateModel do bake numa
  // cópia recém-carregada e devolve contagens exatas + os índices reduzidos
  // (no espaço de vértices original de cada mesh) para o browser desenhar o
  // antes/depois — uma implementação só, sem estimativa divergente.
  if (req.method === "POST" && url.pathname === "/api/estimate") {
    if (!session) return sendJson(res, 400, { error: "sessão inválida (recarregue a página)" });
    if (session.files.length === 0) return sendJson(res, 400, { error: "nenhum arquivo enviado" });
    let cfg;
    try {
      cfg = JSON.parse((await readBody(req, 1 << 20)).toString("utf8"));
    } catch {
      return sendJson(res, 400, { error: "config inválida" });
    }
    const maxVerts = Math.max(0, Math.round(Number(cfg.maxVerts) || 0));
    try {
      // recarrega o arquivo do personagem (o 1º com SkinnedMesh) do zero:
      // decimateModel muta o modelo, e cada estimativa parte do original
      const files = [];
      for (const f of session.files) files.push({ path: f.path, gltf: await loadGltf(f.path) });
      const charIdx = findCharacterIndex(files);
      if (charIdx < 0) return sendJson(res, 422, { error: "nenhum arquivo tem SkinnedMesh" });
      const model = buildModel(files[charIdx].gltf, files[charIdx].path, () => {});
      const before = { uniqueVerts: model.uniqueCount, soupVerts: model.drawIndices.length };
      const decimation =
        maxVerts > 0 && maxVerts < model.uniqueCount
          ? await decimateModel(model, maxVerts, () => {})
          : null;
      // índice local → original: pick[local]; sem decimação, indexArray já é original
      const meshes = model.meshInfos.map((mi, i) => ({
        order: i, // ordem de traversal dos SkinnedMesh — igual no browser
        name: mi.mesh.name ?? "",
        indices: Array.from(mi.indexArray, (v) => (mi.pick ? mi.pick[v] : v)),
      }));
      return sendJson(res, 200, {
        before,
        after: {
          uniqueVerts: model.uniqueCount,
          triangles: model.drawIndices.length / 3,
        },
        decimation,
        meshes: decimation ? meshes : null,
      });
    } catch (e) {
      if (e instanceof BakeError) return sendJson(res, 422, { error: e.message });
      throw e;
    }
  }

  if (req.method === "POST" && url.pathname === "/api/bake") {
    if (!session) return sendJson(res, 400, { error: "sessão inválida (recarregue a página)" });
    let cfg;
    try {
      cfg = JSON.parse((await readBody(req, 1 << 20)).toString("utf8"));
    } catch {
      return sendJson(res, 400, { error: "config inválida" });
    }
    if (!validAssetName(cfg.name))
      return sendJson(res, 400, { error: "nome do export inválido (use letras/números/hífen, ex.: meu-heroi)" });
    if (!Array.isArray(cfg.selection) || cfg.selection.length === 0)
      return sendJson(res, 400, { error: "selecione ao menos um clipe" });
    const frames = Math.round(Number(cfg.frames));
    const fps = Number(cfg.fps);
    if (!Number.isInteger(frames) || frames < 2 || frames > 512)
      return sendJson(res, 400, { error: "frames por clipe deve estar entre 2 e 512" });
    if (!Number.isFinite(fps) || fps <= 0 || fps > 120)
      return sendJson(res, 400, { error: "fps inválido" });

    const jobId = newId();
    const job = { events: [], listeners: new Set(), done: false };
    jobs.set(jobId, job);
    const outDir = join(ROOT, "public/vat", cfg.name);

    // roda em background; o cliente acompanha via /api/events?job=
    (async () => {
      const t0 = Date.now();
      let lastProgress = 0;
      try {
        jobEmit(job, { type: "start", name: cfg.name, out: `public/vat/${cfg.name}` });
        const result = await bakeToDir(
          {
            inputs: session.files.map((f) => f.path),
            out: outDir,
            frames,
            fps,
            height: Number.isFinite(Number(cfg.height)) ? Number(cfg.height) : 0.7,
            topology: "auto",
            maxVerts: Math.max(0, Math.round(Number(cfg.maxVerts) || 0)),
          },
          {
            selectEntries: (files, model) =>
              selectClips(files, model, cfg.selection, (m) => jobEmit(job, { type: "warn", message: String(m) })),
            warn: (m) => jobEmit(job, { type: "warn", message: String(m) }),
            info: (ev) => jobEmit(job, ev),
            onProgress: (p) => {
              const now = Date.now();
              if (now - lastProgress > 120 || p.done === p.total) {
                lastProgress = now;
                jobEmit(job, { type: "progress", ...p });
              }
            },
          },
        );
        const { checks, problems } = runSelftest(outDir);
        jobEmit(job, {
          type: "done",
          seconds: +((Date.now() - t0) / 1000).toFixed(1),
          name: cfg.name,
          out: `public/vat/${cfg.name}`,
          descriptor: result.descriptor,
          bytes: result.bytes,
          decimation: result.decimation,
          selftest: { checks, ok: problems.length === 0 },
          appUrl: `${APP_URL}/?vat=${encodeURIComponent(cfg.name)}&scene=personagem`,
        });
      } catch (e) {
        jobEmit(job, {
          type: "error",
          message: e instanceof BakeError ? e.message : `erro inesperado: ${e?.message ?? e}`,
        });
        if (!(e instanceof BakeError)) console.error(e);
      }
    })();

    return sendJson(res, 200, { job: jobId });
  }

  if (req.method === "GET" && url.pathname === "/api/events") {
    const job = jobs.get(q.get("job"));
    if (!job) return sendJson(res, 404, { error: "job desconhecido" });
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "cache-control": "no-cache",
      connection: "keep-alive",
    });
    for (const ev of job.events) res.write(`data: ${JSON.stringify(ev)}\n\n`);
    if (job.done) return res.end();
    job.listeners.add(res);
    req.on("close", () => job.listeners.delete(res));
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/devserver") {
    const up = await new Promise((resolvePromise) => {
      const r = httpGet(APP_URL, { timeout: 800 }, (rr) => {
        rr.resume();
        resolvePromise(true);
      });
      r.on("error", () => resolvePromise(false));
      r.on("timeout", () => {
        r.destroy();
        resolvePromise(false);
      });
    });
    return sendJson(res, 200, { up, url: APP_URL });
  }

  if (req.method === "GET" && url.pathname === "/api/assets") {
    const base = join(ROOT, "public/vat");
    const out = [];
    if (existsSync(base))
      for (const entry of readdirSync(base, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue;
        const descPath = join(base, entry.name, "vat.json");
        if (!existsSync(descPath)) continue;
        try {
          const d = JSON.parse(readFileSync(descPath, "utf8"));
          out.push({
            name: entry.name,
            clips: d.clips?.map((c) => c.name) ?? [],
            width: d.textureWidth,
            height: d.textureHeight,
            created: d.created,
          });
        } catch {
          /* vat.json ilegível — ignora */
        }
      }
    return sendJson(res, 200, { assets: out });
  }

  sendJson(res, 404, { error: "rota desconhecida" });
}

// ---------------------------------------------------------------------------
// Servidor

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  try {
    if (url.pathname.startsWith("/api/")) return await handleApi(req, res, url);

    if (url.pathname === "/" || url.pathname === "/index.html")
      return sendFile(res, join(STUDIO_DIR, "index.html"));
    if (url.pathname === "/app.js") return sendFile(res, join(STUDIO_DIR, "app.js"));

    if (VENDOR[url.pathname]) return sendFile(res, VENDOR[url.pathname]);
    if (url.pathname.startsWith("/vendor/addons/")) {
      const rel = url.pathname.slice("/vendor/addons/".length);
      const path = normalize(join(ADDONS_DIR, rel));
      if (!path.startsWith(resolve(ADDONS_DIR))) {
        res.writeHead(403);
        return res.end();
      }
      return sendFile(res, path);
    }

    res.writeHead(404);
    res.end("não encontrado");
  } catch (e) {
    console.error(`[vat-studio] ${req.method} ${url.pathname}:`, e?.message ?? e);
    if (!res.headersSent) sendJson(res, 500, { error: String(e?.message ?? e) });
    else res.end();
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`vat-studio no ar → http://localhost:${PORT}`);
  console.log(`  saída dos bakes: ${join(ROOT, "public/vat")}/<nome>/`);
  console.log(`  app para testar: ${APP_URL}/?vat=<nome>  (rode npm run dev na 5199)`);
});
