#!/usr/bin/env node
/**
 * vat-bake — gera texturas VAT (Vertex Animation Texture) a partir de arquivos
 * GLB/GLTF com skinned mesh + animações (fluxo típico: Mixamo → GLB), no
 * formato que o app LIMIAR consome: .bin float16 raw + vat.json (doc 03 §3).
 * Elimina a dependência do Houdini para personagens/clipes novos.
 *
 * Uso:
 *   node tools/vat-bake.mjs char.glb [anim2.glb ...] --out public/vat/<nome> \
 *     [--fps 18] [--frames 60] [--clip Nome:loop|oneshot ...] [--skip Nome ...] \
 *     [--height 0.7] [--topology auto|soup|indexed] [--in-place] [--selftest]
 *
 * - O personagem/esqueleto vem do PRIMEIRO arquivo; os seguintes podem conter
 *   só animações (mesmo esqueleto — padrão Mixamo, um arquivo por clipe).
 * - Clipes são empilhados verticalmente na textura NA ORDEM em que aparecem
 *   (ordem dos argumentos; dentro de um arquivo, ordem do arquivo).
 * - Os dados nascem Y-up do three → basis "identity" no descriptor (nada do
 *   x_negz_y do Houdini), pés no y=0, centro XZ na origem.
 *
 * Ver tools/README.md para o fluxo completo (exportar do Mixamo, limites).
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/** Largura máxima de textura segura no WebGPU com limites default do three. */
const MAX_TEXTURE_WIDTH = 8192;

// ---------------------------------------------------------------------------
// CLI

function fail(msg) {
  console.error(`vat-bake: ${msg}`);
  process.exit(1);
}

function printHelp() {
  console.log(`vat-bake — GLB/GLTF (skinned + animações) → texturas VAT (.bin f16 + vat.json)

uso: node tools/vat-bake.mjs <char.glb> [anims.glb ...] --out <dir> [opções]

opções:
  --out <dir>          diretório de saída (ex.: public/vat/soldier) [obrigatório]
  --frames <n>         frames por clipe (default 60, igual ao asset atual)
  --fps <n>            fps de playback no descriptor (default 18 — paridade)
  --clip <Nome:modo>   modo de playback do clipe: loop | oneshot (default loop)
  --skip <Nome>        não assar este clipe (ex.: --skip TPose)
  --height <h>         normaliza a altura (frame 0 do 1º clipe) para h unidades
                       (default 0.7 = convenção do asset atual; 0 = manter metros)
  --topology <t>       soup | indexed | auto (default auto: soup se couber em
                       ${MAX_TEXTURE_WIDTH} colunas, senão indexed)
  --in-place           remove translação XZ do osso raiz (anda no lugar)
  --selftest           valida o resultado assado (dimensões, NaN, loops, ranges)
  -h, --help           esta ajuda

exemplo:
  node tools/vat-bake.mjs tools/fixtures/Soldier.glb --out public/vat/soldier \\
    --skip TPose --selftest
  → app: http://localhost:5199/?vat=soldier&scene=personagem`);
}

function parseArgs(argv) {
  const args = {
    inputs: [],
    out: null,
    fps: 18,
    frames: 60,
    clipModes: new Map(), // nome minúsculo → "loop" | "oneshot"
    skip: new Set(),
    height: 0.7,
    topology: "auto",
    inPlace: false,
    selftest: false,
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const next = () => {
      i += 1;
      if (i >= argv.length) fail(`falta valor para ${a}`);
      return argv[i];
    };
    switch (a) {
      case "--out":
        args.out = next();
        break;
      case "--fps":
        args.fps = Number(next());
        break;
      case "--frames":
        args.frames = Math.round(Number(next()));
        break;
      case "--clip": {
        const raw = next();
        const ci = raw.lastIndexOf(":");
        const name = ci >= 0 ? raw.slice(0, ci) : "";
        const mode = ci >= 0 ? raw.slice(ci + 1) : "";
        if (!name || (mode !== "loop" && mode !== "oneshot"))
          fail(`--clip espera Nome:loop ou Nome:oneshot (recebi "${raw}")`);
        args.clipModes.set(name.toLowerCase(), mode);
        break;
      }
      case "--skip":
        args.skip.add(next().toLowerCase());
        break;
      case "--height":
        args.height = Number(next());
        break;
      case "--topology": {
        const t = next();
        if (!["soup", "indexed", "auto"].includes(t)) fail(`--topology inválida: ${t}`);
        args.topology = t;
        break;
      }
      case "--in-place":
        args.inPlace = true;
        break;
      case "--selftest":
        args.selftest = true;
        break;
      case "-h":
      case "--help":
        printHelp();
        process.exit(0);
        break;
      default:
        if (a.startsWith("--")) fail(`flag desconhecida: ${a} (use --help)`);
        args.inputs.push(a);
    }
  }
  if (!args.out) fail("--out é obrigatório");
  if (!Number.isFinite(args.fps) || args.fps <= 0) fail("--fps inválido");
  if (!Number.isInteger(args.frames) || args.frames < 2) fail("--frames deve ser ≥ 2");
  if (!Number.isFinite(args.height) || args.height < 0) fail("--height inválido");
  return args;
}

// ---------------------------------------------------------------------------
// Carregamento GLB/GLTF em Node
// O GLTFLoader funciona em Node desde que nada tente criar imagens/texturas
// (não há DOM). Removemos images/textures/materials do JSON antes do parse —
// só malha, skin e animações importam para o bake.

function stripVisualJson(json) {
  delete json.images;
  delete json.textures;
  delete json.samplers;
  json.materials = [];
  for (const mesh of json.meshes ?? [])
    for (const prim of mesh.primitives ?? []) delete prim.material;
  return json;
}

function sanitizeGlb(buf) {
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error("não é um GLB válido");
  const jsonLen = dv.getUint32(12, true);
  const json = stripVisualJson(
    JSON.parse(new TextDecoder().decode(buf.subarray(20, 20 + jsonLen))),
  );
  let jsonText = JSON.stringify(json);
  while (new TextEncoder().encode(jsonText).length % 4 !== 0) jsonText += " ";
  const jsonBytes = new TextEncoder().encode(jsonText);
  const rest = buf.subarray(20 + jsonLen); // chunks seguintes (BIN) intactos
  const total = 12 + 8 + jsonBytes.length + rest.length;
  const out = new Uint8Array(total);
  const odv = new DataView(out.buffer);
  odv.setUint32(0, 0x46546c67, true); // magic "glTF"
  odv.setUint32(4, 2, true); // versão
  odv.setUint32(8, total, true);
  odv.setUint32(12, jsonBytes.length, true);
  odv.setUint32(16, 0x4e4f534a, true); // "JSON"
  out.set(jsonBytes, 20);
  out.set(rest, 20 + jsonBytes.length);
  return out.buffer;
}

async function loadGltf(path) {
  const ext = extname(path).toLowerCase();
  if (![".glb", ".gltf"].includes(ext))
    fail(`formato não suportado: ${path} (use .glb/.gltf — Mixamo FBX: converta antes, ver tools/README.md)`);
  let payload;
  if (ext === ".glb") {
    payload = sanitizeGlb(readFileSync(path));
  } else {
    const json = stripVisualJson(JSON.parse(readFileSync(path, "utf8")));
    // Inline dos buffers externos como data URI (FileLoader do Node não lê file://)
    for (const buf of json.buffers ?? []) {
      if (buf.uri && !buf.uri.startsWith("data:")) {
        const p = resolve(dirname(path), decodeURIComponent(buf.uri));
        buf.uri =
          "data:application/octet-stream;base64," + readFileSync(p).toString("base64");
      }
    }
    payload = JSON.stringify(json);
  }
  const loader = new GLTFLoader();
  try {
    return await new Promise((res, rej) => loader.parse(payload, "", res, rej));
  } catch (e) {
    fail(
      `falha ao carregar ${path}: ${e?.message ?? e}\n` +
        `  (dica: re-exporte sem compressão Draco/Meshopt — o bake não usa decoders externos)`,
    );
  }
}

// ---------------------------------------------------------------------------
// Modelo: skinned meshes + pool de vértices únicos + soup (ordem de desenho)

function buildModel(gltf, sourceName) {
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);

  const meshes = [];
  scene.traverse((o) => {
    if (o.isSkinnedMesh) meshes.push(o);
  });
  if (meshes.length === 0)
    fail(`${sourceName}: nenhum SkinnedMesh encontrado (o 1º arquivo precisa do personagem)`);
  let skipped = 0;
  scene.traverse((o) => {
    if (o.isMesh && !o.isSkinnedMesh) skipped += 1;
  });
  if (skipped > 0)
    console.warn(`  aviso: ${skipped} mesh(es) sem skinning ignorados (só skinned entra no bake)`);

  const meshInfos = [];
  let uniqueCount = 0;
  let indexTotal = 0;
  for (const mesh of meshes) {
    const g = mesh.geometry;
    if (!g.attributes.normal) g.computeVertexNormals();
    const count = g.attributes.position.count;
    const indexArray = g.index
      ? g.index.array
      : Uint32Array.from({ length: count }, (_, i) => i);
    meshInfos.push({ mesh, base: uniqueCount, indexArray });
    uniqueCount += count;
    indexTotal += indexArray.length;
  }

  // Ordem de desenho (soup): concatenação dos índices com offset por mesh.
  const drawIndices = new Uint32Array(indexTotal);
  let k = 0;
  for (const mi of meshInfos)
    for (let i = 0; i < mi.indexArray.length; i++) drawIndices[k++] = mi.indexArray[i] + mi.base;

  // Nomes de nós (para casar tracks de animação de outros arquivos).
  const nodeNames = new Set();
  scene.traverse((o) => {
    if (o.name) nodeNames.add(o.name);
  });

  // Pose de descanso (restaurada antes de cada clipe — evita vazamento entre clipes
  // quando um clipe não anima todos os ossos).
  const restPose = [];
  scene.traverse((o) => {
    restPose.push({
      node: o,
      position: o.position.clone(),
      quaternion: o.quaternion.clone(),
      scale: o.scale.clone(),
    });
  });

  // Ossos raiz (para --in-place): bone cujo pai não é bone.
  const rootBoneNames = new Set();
  for (const mesh of meshes)
    for (const b of mesh.skeleton.bones)
      if (!b.parent?.isBone) rootBoneNames.add(b.name);

  return { scene, meshInfos, uniqueCount, drawIndices, nodeNames, restPose, rootBoneNames };
}

function restorePose(model) {
  for (const r of model.restPose) {
    r.node.position.copy(r.position);
    r.node.quaternion.copy(r.quaternion);
    r.node.scale.copy(r.scale);
  }
  model.scene.updateMatrixWorld(true);
}

// ---------------------------------------------------------------------------
// Coleta de clipes (com renomeio de nomes genéricos e retarget de tracks por nome)

const GENERIC_CLIP_NAME = /^(mixamo\.com|take ?\d+|armature.*|animation ?\d*|clip ?\d*|unnamed.*)$/i;

const normalizeName = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

function collectClips(files, model, args) {
  const used = new Set();
  const entries = [];

  // Mapa de nomes normalizados → nome real (tolera "mixamorig:Hips" vs "mixamorigHips")
  const normMap = new Map();
  for (const n of model.nodeNames) {
    const key = normalizeName(n);
    normMap.set(key, normMap.has(key) ? null : n); // null = ambíguo
  }

  for (const { path, gltf } of files) {
    for (const clip of gltf.animations ?? []) {
      let name = (clip.name ?? "").trim();
      if (!name || GENERIC_CLIP_NAME.test(name) || used.has(name.toLowerCase())) {
        const base = basename(path, extname(path));
        name = used.has(base.toLowerCase()) ? `${base}_${entries.length}` : base;
      }
      if (args.skip.has(name.toLowerCase()) || args.skip.has((clip.name ?? "").toLowerCase()))
        continue;
      used.add(name.toLowerCase());

      // Retarget leve: mantém só tracks cujo nó existe na cena base
      const kept = [];
      let dropped = 0;
      for (const track of clip.tracks) {
        const { nodeName } = THREE.PropertyBinding.parseTrackName(track.name);
        if (!nodeName || model.nodeNames.has(nodeName)) {
          kept.push(track);
          continue;
        }
        const remap = normMap.get(normalizeName(nodeName));
        if (remap) {
          track.name = remap + track.name.slice(nodeName.length);
          kept.push(track);
        } else {
          dropped += 1;
        }
      }
      if (kept.length === 0) {
        console.warn(`  aviso: clipe "${name}" descartado — nenhum track casa com o esqueleto base`);
        continue;
      }
      if (dropped > 0)
        console.warn(`  aviso: clipe "${name}": ${dropped}/${clip.tracks.length} tracks sem nó correspondente (esqueleto diferente?)`);
      clip.tracks = kept;

      if (args.inPlace) stripRootTranslation(clip, model.rootBoneNames);

      const mode = args.clipModes.get(name.toLowerCase()) ??
        args.clipModes.get((clip.name ?? "").toLowerCase()) ?? "loop";
      entries.push({ name, mode, clip, source: basename(path) });
    }
  }

  for (const key of args.clipModes.keys())
    if (!entries.some((e) => e.name.toLowerCase() === key))
      console.warn(`  aviso: --clip "${key}" não casa com nenhum clipe (disponíveis: ${entries.map((e) => e.name).join(", ")})`);

  if (entries.length === 0) fail("nenhum clipe de animação para assar");
  return entries;
}

/** --in-place: congela a translação XZ do(s) osso(s) raiz no 1º keyframe (Y fica: bounce do passo). */
function stripRootTranslation(clip, rootBoneNames) {
  for (const track of clip.tracks) {
    const parsed = THREE.PropertyBinding.parseTrackName(track.name);
    if (parsed.propertyName !== "position" || !rootBoneNames.has(parsed.nodeName)) continue;
    const v = track.values;
    const x0 = v[0] ?? 0;
    const z0 = v[2] ?? 0;
    for (let i = 0; i < v.length; i += 3) {
      v[i] = x0;
      v[i + 2] = z0;
    }
  }
}

// ---------------------------------------------------------------------------
// Bake: amostra a pose skinned a N frames fixos por clipe

function bakeClips(model, entries, frames) {
  const { scene, meshInfos, uniqueCount } = model;
  const rows = entries.length * frames;
  const pos = new Float32Array(rows * uniqueCount * 3);
  const nrm = new Float32Array(rows * uniqueCount * 3);

  const v = new THREE.Vector3();
  const n4 = new THREE.Vector4();
  const nv = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();

  entries.forEach((entry, ci) => {
    restorePose(model);
    const mixer = new THREE.AnimationMixer(scene);
    const action = mixer.clipAction(entry.clip);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    const dur = Math.max(entry.clip.duration, 1e-6);

    for (let f = 0; f < frames; f++) {
      // loop: [0, dur) — o wrap 59→0 fecha o ciclo no shader (lerp interframe).
      // oneshot: [0, dur] — o último frame é a pose final (hold).
      const t =
        entry.mode === "loop"
          ? (f * dur) / frames
          : Math.min((f * dur) / (frames - 1), dur * (1 - 1e-6));
      mixer.setTime(t);
      scene.updateMatrixWorld(true);

      const row = ci * frames + f;
      for (const mi of meshInfos) {
        const posAttr = mi.mesh.geometry.attributes.position;
        const nrmAttr = mi.mesh.geometry.attributes.normal;
        normalMatrix.getNormalMatrix(mi.mesh.matrixWorld);
        for (let i = 0; i < posAttr.count; i++) {
          const o = (row * uniqueCount + mi.base + i) * 3;

          v.fromBufferAttribute(posAttr, i);
          mi.mesh.applyBoneTransform(i, v);
          v.applyMatrix4(mi.mesh.matrixWorld);
          pos[o] = v.x;
          pos[o + 1] = v.y;
          pos[o + 2] = v.z;

          // w=0 → applyBoneTransform trata como direção (sem translação)
          n4.set(nrmAttr.getX(i), nrmAttr.getY(i), nrmAttr.getZ(i), 0);
          mi.mesh.applyBoneTransform(i, n4);
          nv.set(n4.x, n4.y, n4.z).applyMatrix3(normalMatrix);
          const len = nv.length() || 1;
          nrm[o] = nv.x / len;
          nrm[o + 1] = nv.y / len;
          nrm[o + 2] = nv.z / len;
        }
      }
    }
    mixer.stopAllAction();
    mixer.uncacheRoot(scene);
  });

  restorePose(model);
  return { pos, nrm, rows };
}

// ---------------------------------------------------------------------------
// Normalização: pés no y=0, centro XZ na origem, escala opcional de altura

function normalizeBake(pos, rows, uniqueCount, targetHeight) {
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3)
    for (let c = 0; c < 3; c++) {
      const val = pos[i + c];
      if (val < min[c]) min[c] = val;
      if (val > max[c]) max[c] = val;
    }

  // Altura medida no frame 0 do 1º clipe (pose "em pé" por convenção).
  let y0min = Infinity;
  let y0max = -Infinity;
  for (let i = 0; i < uniqueCount; i++) {
    const y = pos[i * 3 + 1];
    if (y < y0min) y0min = y;
    if (y > y0max) y0max = y;
  }
  const sourceHeight = y0max - y0min;

  const scale =
    targetHeight > 0 && sourceHeight > 1e-6 ? targetHeight / sourceHeight : 1;
  const translate = [-(min[0] + max[0]) / 2, -min[1], -(min[2] + max[2]) / 2];

  for (let i = 0; i < pos.length; i += 3) {
    pos[i] = (pos[i] + translate[0]) * scale;
    pos[i + 1] = (pos[i + 1] + translate[1]) * scale;
    pos[i + 2] = (pos[i + 2] + translate[2]) * scale;
  }

  const bounds = {
    min: min.map((m, c) => (m + translate[c]) * scale),
    max: max.map((m, c) => (m + translate[c]) * scale),
  };
  return { translate, scale, sourceHeight, bounds };
}

// ---------------------------------------------------------------------------
// Empacotamento float16 (RGB por texel; o app expande para RGBA no load)

function packHalf(f32, rows, uniqueCount, columns) {
  const width = columns ? columns.length : uniqueCount;
  const out = new Uint16Array(rows * width * 3);
  const toHalf = THREE.DataUtils.toHalfFloat;
  let k = 0;
  for (let r = 0; r < rows; r++) {
    const rowBase = r * uniqueCount;
    for (let c = 0; c < width; c++) {
      const o = (rowBase + (columns ? columns[c] : c)) * 3;
      out[k++] = toHalf(f32[o]);
      out[k++] = toHalf(f32[o + 1]);
      out[k++] = toHalf(f32[o + 2]);
    }
  }
  return out;
}

const fmtBytes = (n) =>
  n >= 1 << 20 ? `${(n / (1 << 20)).toFixed(1)} MB` : `${(n / 1024).toFixed(0)} KB`;
const fmtV3 = (v) => `[${v.map((n) => (+n).toFixed(4)).join(", ")}]`;

// ---------------------------------------------------------------------------
// Selftest: valida o diretório assado lendo os arquivos de volta

function readTyped(path, Ctor) {
  const b = readFileSync(path);
  // copia exata: Buffers pequenos do Node compartilham um pool (offset ≠ 0)
  return new Ctor(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
}

function selftest(outDir) {
  const problems = [];
  const ok = (label) => console.log(`  ok  ${label}`);
  const bad = (label) => {
    problems.push(label);
    console.log(`  FALHOU  ${label}`);
  };

  const desc = JSON.parse(readFileSync(join(outDir, "vat.json"), "utf8"));
  const posBin = readTyped(join(outDir, desc.files.positions), Uint16Array);
  const nrmBin = readTyped(join(outDir, desc.files.normals), Uint16Array);

  const { textureWidth: w, textureHeight: h } = desc;
  const expected = w * h * 3;

  // 1. dimensões
  h === desc.clipCount * desc.framesPerClip &&
  posBin.length === expected &&
  nrmBin.length === expected
    ? ok(`dimensões ${w}×${h} (${desc.clipCount} clipes × ${desc.framesPerClip} frames), bins ${expected} valores`)
    : bad(`dimensões: esperava ${expected} valores, positions=${posBin.length} normals=${nrmBin.length} h=${h}`);
  if (w > MAX_TEXTURE_WIDTH)
    bad(`largura ${w} > ${MAX_TEXTURE_WIDTH} (limite WebGPU default)`);

  // 2. NaN/Inf (float16: expoente 0x7c00 = inf/nan)
  let badHalf = 0;
  for (const arr of [posBin, nrmBin])
    for (let i = 0; i < arr.length; i++) if ((arr[i] & 0x7c00) === 0x7c00) badHalf += 1;
  badHalf === 0 ? ok("sem NaN/Inf") : bad(`${badHalf} valores NaN/Inf nos bins`);

  // 3. índices (topologia indexed)
  if (desc.topology === "indexed") {
    const idx = readTyped(join(outDir, desc.files.indices), Uint32Array);
    let maxIdx = 0;
    for (let i = 0; i < idx.length; i++) if (idx[i] > maxIdx) maxIdx = idx[i];
    idx.length === desc.indexCount && idx.length % 3 === 0 && maxIdx < desc.vertexCount
      ? ok(`índices: ${idx.length} (${idx.length / 3} triângulos), máx ${maxIdx} < ${desc.vertexCount}`)
      : bad(`índices inconsistentes (len=${idx.length}, máx=${maxIdx}, vertexCount=${desc.vertexCount})`);
  }

  // Decodifica posições para as checagens geométricas
  const fromHalf = THREE.DataUtils.fromHalfFloat;
  const posF = new Float32Array(posBin.length);
  for (let i = 0; i < posBin.length; i++) posF[i] = fromHalf(posBin[i]);

  // 4. ranges plausíveis + pé no chão
  let mn = [Infinity, Infinity, Infinity];
  let mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < posF.length; i += 3)
    for (let c = 0; c < 3; c++) {
      if (posF[i + c] < mn[c]) mn[c] = posF[i + c];
      if (posF[i + c] > mx[c]) mx[c] = posF[i + c];
    }
  const spread = Math.max(...mx.map((v, c) => v - mn[c]));
  spread > 1e-4 && spread < 100
    ? ok(`bounds ${fmtV3(mn)} → ${fmtV3(mx)}`)
    : bad(`bounds implausíveis: ${fmtV3(mn)} → ${fmtV3(mx)}`);
  Math.abs(mn[1]) <= 0.01
    ? ok(`pé no chão (ymin=${mn[1].toFixed(4)})`)
    : bad(`ymin=${mn[1].toFixed(4)} — esperava ≈0 (pés no y=0)`);

  // 5. continuidade de loop: wrap (último→primeiro frame) comparável ao passo interframe
  const rowDelta = (rowA, rowB) => {
    let worst = 0;
    const a = rowA * w * 3;
    const b = rowB * w * 3;
    for (let cIdx = 0; cIdx < w; cIdx++) {
      const o = cIdx * 3;
      const dx = posF[a + o] - posF[b + o];
      const dy = posF[a + o + 1] - posF[b + o + 1];
      const dz = posF[a + o + 2] - posF[b + o + 2];
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      if (d > worst) worst = d;
    }
    return worst;
  };
  for (const clip of desc.clips) {
    if (clip.mode !== "loop") continue;
    let ref = 0;
    for (let f = clip.rowStart; f < clip.rowEnd - 1; f++)
      ref = Math.max(ref, rowDelta(f, f + 1));
    const wrap = rowDelta(clip.rowEnd - 1, clip.rowStart);
    const limit = Math.max(ref * 2.5, 0.005);
    wrap <= limit
      ? ok(`loop "${clip.name}": wrap ${wrap.toFixed(4)} ≤ ${limit.toFixed(4)} (passo máx interframe ${ref.toFixed(4)})`)
      : bad(`loop "${clip.name}" não fecha: wrap ${wrap.toFixed(4)} > ${limit.toFixed(4)} — fonte não é cíclica? marque :oneshot ou use outro clipe`);
  }

  // 6. normais unitárias (amostra)
  let worstLen = 1;
  const step = Math.max(1, Math.floor(nrmBin.length / 3 / 2000));
  for (let i = 0; i < nrmBin.length / 3; i += step) {
    const o = i * 3;
    const len = Math.hypot(fromHalf(nrmBin[o]), fromHalf(nrmBin[o + 1]), fromHalf(nrmBin[o + 2]));
    if (Math.abs(len - 1) > Math.abs(worstLen - 1)) worstLen = len;
  }
  Math.abs(worstLen - 1) < 0.05
    ? ok(`normais unitárias (pior |n| amostrado: ${worstLen.toFixed(4)})`)
    : bad(`normais fora do unitário (pior |n|: ${worstLen.toFixed(4)})`);

  return problems;
}

// ---------------------------------------------------------------------------
// main

async function main() {
  const args = parseArgs(process.argv.slice(2));

  // --selftest sem inputs: só valida um diretório já assado
  if (args.inputs.length === 0) {
    if (!args.selftest) fail("nenhum arquivo de entrada (use --help)");
    if (!existsSync(join(args.out, "vat.json"))) fail(`sem vat.json em ${args.out}`);
    console.log(`selftest ${args.out}:`);
    const problems = selftest(args.out);
    process.exit(problems.length ? 1 : 0);
  }

  const t0 = Date.now();
  const name = basename(args.out);
  console.log(`vat-bake — "${name}"`);

  // 1. carrega arquivos (personagem = 1º; demais podem ser só animação)
  const files = [];
  for (const input of args.inputs) {
    if (!existsSync(input)) fail(`arquivo não existe: ${input}`);
    files.push({ path: input, gltf: await loadGltf(input) });
  }
  const model = buildModel(files[0].gltf, files[0].path);

  // 2. clipes na ordem dos argumentos (dentro do arquivo, ordem do arquivo)
  const entries = collectClips(files, model, args);

  // 3. topologia
  const soupCount = model.drawIndices.length;
  let topology = args.topology;
  if (topology === "auto") topology = soupCount <= MAX_TEXTURE_WIDTH ? "soup" : "indexed";
  if (topology === "soup" && soupCount > MAX_TEXTURE_WIDTH)
    fail(
      `soup teria ${soupCount} colunas > ${MAX_TEXTURE_WIDTH} (limite de textura do WebGPU). ` +
        `Use --topology indexed (ou auto), ou decime a malha.`,
    );
  if (model.uniqueCount > MAX_TEXTURE_WIDTH)
    fail(
      `malha grande demais mesmo indexada: ${model.uniqueCount} vértices únicos > ${MAX_TEXTURE_WIDTH}. ` +
        `Decime a malha (ex.: modifier Decimate no Blender).`,
    );
  const width = topology === "soup" ? soupCount : model.uniqueCount;

  console.log(
    `  malha: ${model.meshInfos.length} skinned mesh(es) · ${model.uniqueCount} vértices únicos · ` +
      `${soupCount / 3} triângulos → topologia ${topology} (${width} colunas)`,
  );
  console.log(`  clipes (${entries.length} × ${args.frames} frames @ ${args.fps} fps):`);
  entries.forEach((e, i) =>
    console.log(
      `    ${i} ${e.name} (${e.mode})  fonte ${e.clip.duration.toFixed(3)}s · ${e.source}`,
    ),
  );

  // 4. bake + normalização
  const { pos, nrm, rows } = bakeClips(model, entries, args.frames);
  const norm = normalizeBake(pos, rows, model.uniqueCount, args.height);
  console.log(
    `  normalização: translate ${fmtV3(norm.translate)} · escala ${norm.scale.toFixed(4)}` +
      ` (altura fonte ${norm.sourceHeight.toFixed(3)} → ${(norm.sourceHeight * norm.scale).toFixed(3)})`,
  );

  // 5. empacota e escreve
  const columns = topology === "soup" ? model.drawIndices : null;
  const posBin = packHalf(pos, rows, model.uniqueCount, columns);
  const nrmBin = packHalf(nrm, rows, model.uniqueCount, columns);

  mkdirSync(args.out, { recursive: true });
  writeFileSync(join(args.out, "positions_f16.bin"), Buffer.from(posBin.buffer));
  writeFileSync(join(args.out, "normals_f16.bin"), Buffer.from(nrmBin.buffer));
  if (topology === "indexed")
    writeFileSync(join(args.out, "indices_u32.bin"), Buffer.from(model.drawIndices.buffer));

  const descriptor = {
    format: "vat-bake/1",
    created: new Date().toISOString(),
    sources: args.inputs.map((p) => basename(p)),
    topology,
    vertexCount: width,
    indexCount: topology === "indexed" ? model.drawIndices.length : 0,
    textureWidth: width,
    textureHeight: rows,
    channels: 3,
    dtype: "float16",
    clipCount: entries.length,
    framesPerClip: args.frames,
    fps: args.fps,
    // Dados já nascem Y-up (three) e centrados: nada do basis x_negz_y do Houdini.
    basis: "identity",
    bakeOffset: [0, 0, 0],
    clips: entries.map((e, i) => ({
      name: e.name,
      mode: e.mode,
      rowStart: i * args.frames,
      rowEnd: (i + 1) * args.frames,
      sourceDuration: +e.clip.duration.toFixed(6),
    })),
    files: {
      positions: "positions_f16.bin",
      normals: "normals_f16.bin",
      ...(topology === "indexed" ? { indices: "indices_u32.bin" } : {}),
    },
    normalization: {
      translate: norm.translate.map((v) => +v.toFixed(6)),
      scale: +norm.scale.toFixed(6),
      sourceHeight: +norm.sourceHeight.toFixed(6),
      targetHeight: args.height,
    },
    bounds: {
      min: norm.bounds.min.map((v) => +v.toFixed(6)),
      max: norm.bounds.max.map((v) => +v.toFixed(6)),
    },
  };
  writeFileSync(join(args.out, "vat.json"), JSON.stringify(descriptor, null, 2) + "\n");

  console.log(
    `  out: ${args.out} (positions ${fmtBytes(posBin.byteLength)}, normals ${fmtBytes(nrmBin.byteLength)}` +
      (topology === "indexed" ? `, indices ${fmtBytes(model.drawIndices.byteLength)}` : "") +
      `, vat.json) em ${((Date.now() - t0) / 1000).toFixed(1)}s`,
  );
  console.log(`  app: http://localhost:5199/?vat=${encodeURIComponent(name)}&scene=personagem`);

  if (args.selftest) {
    console.log("selftest:");
    const problems = selftest(args.out);
    if (problems.length) {
      console.error(`selftest FALHOU (${problems.length} problema(s))`);
      process.exit(1);
    }
    console.log("selftest passou.");
  }
}

await main();
