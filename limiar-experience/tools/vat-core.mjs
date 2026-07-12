/**
 * vat-core — núcleo do bake VAT (GLB/GLTF → texturas .bin f16 + vat.json),
 * compartilhado entre o CLI (tools/vat-bake.mjs) e o VAT Studio
 * (tools/vat-studio.mjs). Formato de saída: doc 03 §3; consumo no app:
 * src/vat/runtime.ts (?vat=<nome>).
 *
 * Nenhuma função aqui chama process.exit: erros de validação lançam
 * BakeError e cada frontend (CLI/servidor) decide como reportar.
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { createHash } from "node:crypto";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { mergeClips, DEFAULT_MERGE_FADE } from "./merge-clips.mjs";
import { isFbxBinary, normalizeFbxResult, translateFbxError } from "./fbx-normalize.mjs";

/** Largura máxima de textura segura no WebGPU com limites default do three. */
export const MAX_TEXTURE_WIDTH = 8192;

/** Erro de validação/entrada (mensagem já em linguagem de usuário). */
export class BakeError extends Error {}

const err = (msg) => {
  throw new BakeError(msg);
};

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
    err(
      `falha ao carregar ${basename(path)}: ${e?.message ?? e}` +
        ` (dica: re-exporte sem compressão Draco/Meshopt — o bake não usa decoders externos)`,
    );
  }
}

// ---------------------------------------------------------------------------
// FBX (fluxo Mixamo direto, sem Blender). O FBXLoader roda em Node com dois
// cuidados: (1) `window.URL` para texturas EMBUTIDAS (createObjectURL) e
// (2) um handler de textura inerte no LoadingManager — sem ele o
// TextureLoader tentaria criar <img> (não há DOM). Materiais/texturas são
// irrelevantes para o bake (no GLB eles são removidos do JSON; aqui são
// neutralizados no load).

function withDomShims(fn) {
  const hadWindow = Object.prototype.hasOwnProperty.call(globalThis, "window");
  const prev = globalThis.window;
  // câmeras FBX leem window.innerWidth/Height; embutidos usam window.URL
  globalThis.window = { URL: globalThis.URL, innerWidth: 1024, innerHeight: 768 };
  try {
    return fn();
  } finally {
    if (hadWindow) globalThis.window = prev;
    else delete globalThis.window;
  }
}

function loadFbx(path, warn) {
  const buf = readFileSync(path);
  const arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  const name = basename(path);
  // O parse até trata ASCII moderno (7.x), mas o caso dominante de ASCII na
  // prática é o 6.x antigo, que o loader recusa — detectamos binário para
  // dar a mensagem certa no erro; se passar, deixamos o loader decidir.
  const wasBinary = isFbxBinary(arrayBuffer);
  if (!wasBinary)
    warn(`${name}: não é FBX binário — tentando como ASCII (só FBX 7.x ASCII funciona)`);
  const loader = new FBXLoader();
  loader.manager.addHandler(/.*/i, {
    path: "",
    setPath() {
      return this;
    },
    load: () => new THREE.Texture(),
  });
  let group;
  try {
    group = withDomShims(() => loader.parse(arrayBuffer, ""));
  } catch (e) {
    if (!wasBinary)
      err(
        `${name}: FBX ASCII não suportado (${String(e?.message ?? e).slice(0, 80)}) — ` +
          `re-exporte como FBX binário (padrão do Mixamo atual) ou converta para GLB`,
      );
    err(translateFbxError(e, name));
  }
  const norm = normalizeFbxResult(group, (m) => warn(`${name}: ${m}`));
  // shape compatível com o retorno do GLTFLoader ({ scene, animations })
  return { scene: norm.scene, animations: norm.animations };
}

/** Extensões aceitas pelo pipeline (CLI, Studio e uploads). */
export const SUPPORTED_EXTENSIONS = [".glb", ".gltf", ".fbx"];

/** Carrega GLB/GLTF/FBX e devolve `{ scene, animations }` (forma do GLTFLoader). */
export async function loadModelFile(path, warn = console.warn) {
  const ext = extname(path).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(ext))
    err(
      `formato não suportado: ${basename(path)} (aceitos: GLB/GLTF/FBX binário — ver tools/README.md)`,
    );
  if (ext === ".fbx") return loadFbx(path, warn);
  return loadGltf(path);
}

// ---------------------------------------------------------------------------
// Modelo: skinned meshes + pool de vértices únicos + soup (ordem de desenho)

/** Avisa sobre arquivos que não contribuem nada (sem skin E sem animação). */
function warnUselessFiles(files, warn) {
  for (const f of files) {
    let hasSkin = false;
    f.gltf.scene.traverse((o) => {
      if (o.isSkinnedMesh) hasSkin = true;
    });
    if (!hasSkin && (f.gltf.animations ?? []).length === 0)
      warn(
        `${basename(f.path)}: sem skinned mesh e sem animação — não contribui para o bake ` +
          `(Mixamo: personagem = 'With Skin'; animações = 'Without Skin')`,
      );
  }
}

/** Índice do primeiro arquivo que contém um SkinnedMesh (o "personagem"). */
export function findCharacterIndex(files) {
  for (let i = 0; i < files.length; i++) {
    let has = false;
    files[i].gltf.scene.traverse((o) => {
      if (o.isSkinnedMesh) has = true;
    });
    if (has) return i;
  }
  return -1;
}

export function buildModel(gltf, sourceName, warn = console.warn) {
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);

  const meshes = [];
  scene.traverse((o) => {
    if (o.isSkinnedMesh) meshes.push(o);
  });
  if (meshes.length === 0)
    err(`${basename(sourceName)}: nenhum SkinnedMesh encontrado (o 1º arquivo precisa do personagem com skin)`);
  let skipped = 0;
  scene.traverse((o) => {
    if (o.isMesh && !o.isSkinnedMesh) skipped += 1;
  });
  if (skipped > 0)
    warn(`${skipped} mesh(es) sem skinning ignorados (só skinned entra no bake)`);

  const meshInfos = [];
  let uniqueCount = 0;
  for (const mesh of meshes) {
    const g = mesh.geometry;
    if (!g.attributes.normal) g.computeVertexNormals();
    const count = g.attributes.position.count;
    const indexArray = g.index
      ? Uint32Array.from(g.index.array)
      : Uint32Array.from({ length: count }, (_, i) => i);
    // pick: null = todos os vértices originais; a decimação troca por uma
    // seleção compacta (novo índice local → índice original do atributo).
    meshInfos.push({ mesh, base: uniqueCount, indexArray, pick: null });
    uniqueCount += count;
  }

  const model = { scene, meshInfos, uniqueCount, drawIndices: null, nodeNames: null, restPose: null, rootBoneNames: null, rootBone: null };
  rebuildDrawIndices(model);

  // Nomes de nós (para casar tracks de animação de outros arquivos).
  const nodeNames = new Set();
  scene.traverse((o) => {
    if (o.name) nodeNames.add(o.name);
  });
  model.nodeNames = nodeNames;

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
  model.restPose = restPose;

  // Ossos raiz (para in-place): bone cujo pai não é bone.
  const rootBoneNames = new Set();
  let rootBone = null;
  for (const mesh of meshes)
    for (const b of mesh.skeleton.bones)
      if (!b.parent?.isBone) {
        rootBoneNames.add(b.name);
        if (!rootBone) rootBone = b;
      }
  model.rootBoneNames = rootBoneNames;
  // Referência para medir a trajetória da raiz (root motion) durante o bake.
  model.rootBone = rootBone;

  return model;
}

/** Ordem de desenho (soup): concatenação dos índices locais com offset por mesh. */
function rebuildDrawIndices(model) {
  let total = 0;
  for (const mi of model.meshInfos) total += mi.indexArray.length;
  const draw = new Uint32Array(total);
  let k = 0;
  for (const mi of model.meshInfos)
    for (let i = 0; i < mi.indexArray.length; i++) draw[k++] = mi.indexArray[i] + mi.base;
  model.drawIndices = draw;
}

export function restorePose(model) {
  for (const r of model.restPose) {
    r.node.position.copy(r.position);
    r.node.quaternion.copy(r.quaternion);
    r.node.scale.copy(r.scale);
  }
  model.scene.updateMatrixWorld(true);
}

/** Nº de vértices por mesh sob a seleção corrente (pick da decimação, se houver). */
const pickCount = (mi) => (mi.pick ? mi.pick.length : mi.mesh.geometry.attributes.position.count);

/**
 * Identidade da malha para o morph entre VATs: hash das posições de bind dos
 * vértices que entram na textura (pós-decimação) + ordem de desenho. Dois
 * bakes do MESMO personagem com a MESMA decimação produzem o mesmo hash —
 * é isso que autoriza o app a cruzar texturas (?vat=a&vatB=b) com segurança:
 * a coluna N da VAT A e da VAT B são o mesmo vértice.
 */
export function computeMeshHash(model) {
  const h = createHash("sha1");
  h.update(`v${model.uniqueCount}`);
  for (const mi of model.meshInfos) {
    const attr = mi.mesh.geometry.attributes.position;
    const n = pickCount(mi);
    const buf = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const src = mi.pick ? mi.pick[i] : i;
      buf[i * 3] = attr.getX(src);
      buf[i * 3 + 1] = attr.getY(src);
      buf[i * 3 + 2] = attr.getZ(src);
    }
    h.update(Buffer.from(buf.buffer));
  }
  h.update(Buffer.from(model.drawIndices.buffer));
  return h.digest("hex").slice(0, 16);
}

/** Bounding box da bind pose em espaço de mundo (altura "natural" do modelo). */
export function measureBindPose(model) {
  const v = new THREE.Vector3();
  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  for (const mi of model.meshInfos) {
    const attr = mi.mesh.geometry.attributes.position;
    for (let i = 0; i < attr.count; i++) {
      v.fromBufferAttribute(attr, i).applyMatrix4(mi.mesh.matrixWorld);
      min.min(v);
      max.max(v);
    }
  }
  return {
    min: [min.x, min.y, min.z].map((n) => +n.toFixed(4)),
    max: [max.x, max.y, max.z].map((n) => +n.toFixed(4)),
    height: +(max.y - min.y).toFixed(4),
  };
}

// ---------------------------------------------------------------------------
// Decimação (meshoptimizer): reduz a malha até ≤ maxVerts vértices únicos.
// Feita POR MESH (targets proporcionais) — mesma estratégia que o preview do
// Studio roda no browser, então a contagem estimada bate com a assada.
//
// Detalhes que importam (medidos com o Soldier):
// - Malhas de jogo têm costuras de UV (vértices duplicados por posição). Sem
//   soldar por posição, o simplificador trata a costura como borda e trava
//   muito antes do alvo. generatePositionRemap dá a solda só para a
//   CONECTIVIDADE; os índices de saída seguem válidos no espaço original.
// - O modo default ainda preserva borda de topologia; a flag "Permissive"
//   destrava malhas típicas do Mixamo com erro ~10× menor no mesmo alvo
//   (8601 → 1488 cantos no teste). Escalamos as flags só se precisar.

const DECIMATE_FLAG_SETS = [[], ["Permissive"], ["Permissive", "Prune"]];

export async function decimateModel(model, maxVerts, warn = console.warn) {
  if (!Number.isFinite(maxVerts) || maxVerts < 24)
    err(`alvo de decimação inválido: ${maxVerts} (mínimo 24 vértices)`);
  if (maxVerts >= model.uniqueCount) return null;

  const { MeshoptSimplifier } = await import("meshoptimizer/simplifier");
  await MeshoptSimplifier.ready;

  const fromVerts = model.uniqueCount;
  const fromTris = model.drawIndices.length / 3;
  let worstError = 0;
  let base = 0;

  for (const mi of model.meshInfos) {
    if (mi.pick) err("decimação dupla não suportada (recarregue o modelo)");
    const posAttr = mi.mesh.geometry.attributes.position;
    const count = posAttr.count;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = posAttr.getX(i);
      positions[i * 3 + 1] = posAttr.getY(i);
      positions[i * 3 + 2] = posAttr.getZ(i);
    }
    const srcIdx = mi.indexArray;
    const remap = MeshoptSimplifier.generatePositionRemap(positions, 3);
    const welded = new Uint32Array(srcIdx.length);
    for (let i = 0; i < srcIdx.length; i++) welded[i] = remap[srcIdx[i]];

    const targetVerts = Math.max(8, Math.round((count / fromVerts) * maxVerts));
    const idxPerVert = srcIdx.length / count;
    const idealIdx = Math.max(3, Math.floor((targetVerts * idxPerVert) / 3) * 3);

    // error=1 (sem teto de desvio): prioridade é caber no orçamento; se os
    // vértices únicos usados ainda passarem do alvo, aperta o target, e se a
    // topologia travar, escala as flags.
    const uniqueOf = (idx) => new Set(idx).size;
    let best = { indices: srcIdx, unique: count, error: 0 };
    const consider = (idx, error) => {
      if (idx.length < 3) return;
      const unique = uniqueOf(idx);
      if (unique < best.unique) best = { indices: idx, unique, error };
    };
    outer: for (const flags of DECIMATE_FLAG_SETS) {
      let targetIdx = Math.min(idealIdx, welded.length);
      for (let attempt = 0; attempt < 10; attempt++) {
        const [simplified, error] = MeshoptSimplifier.simplify(welded, positions, 3, targetIdx, 1, flags);
        consider(simplified, error);
        if (best.unique <= targetVerts) break outer;
        if (targetIdx <= 3) break;
        targetIdx = Math.max(3, Math.floor((targetIdx * 0.8) / 3) * 3);
      }
    }
    // Último recurso: sloppy (não preserva topologia, mas atinge o alvo).
    if (best.unique > targetVerts * 1.5) {
      try {
        const [sloppy, error] = MeshoptSimplifier.simplifySloppy(
          welded, positions, 3, null, Math.min(idealIdx, welded.length), 1.0,
        );
        consider(sloppy, error);
      } catch {
        // sloppy é frágil em malhas minúsculas — fica o melhor que temos
      }
    }
    const indices = best.indices;
    worstError = Math.max(worstError, best.error);

    // Compacta: só os vértices usados entram na textura (ordem original — estável).
    const usedSorted = [...new Set(indices)].sort((a, b) => a - b);
    const localOf = new Map(usedSorted.map((orig, i) => [orig, i]));
    const newLocal = new Uint32Array(indices.length);
    for (let i = 0; i < indices.length; i++) newLocal[i] = localOf.get(indices[i]);
    mi.pick = Uint32Array.from(usedSorted);
    mi.indexArray = newLocal;
    mi.base = base;
    base += usedSorted.length;
  }

  model.uniqueCount = base;
  rebuildDrawIndices(model);
  if (model.uniqueCount > maxVerts)
    warn(`decimação parou em ${model.uniqueCount} vértices (alvo ${maxVerts}) — topologia não permitiu mais colapsos`);
  return {
    from: fromVerts,
    to: model.uniqueCount,
    fromTriangles: fromTris,
    triangles: model.drawIndices.length / 3,
    error: +worstError.toFixed(4),
  };
}

// ---------------------------------------------------------------------------
// Clipes: coleta automática (CLI) e seleção explícita (Studio), com renomeio
// de nomes genéricos e retarget de tracks por nome de nó.

export const GENERIC_CLIP_NAME = /^(mixamo\.com|take ?\d+|armature.*|animation ?\d*|clip ?\d*|unnamed.*)$/i;

const normalizeName = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Mapa nome normalizado → nome real (tolera "mixamorig:Hips" vs "mixamorigHips"). */
function buildNormMap(model) {
  const normMap = new Map();
  for (const n of model.nodeNames) {
    const key = normalizeName(n);
    normMap.set(key, normMap.has(key) ? null : n); // null = ambíguo
  }
  return normMap;
}

/**
 * Retarget leve: mantém só tracks cujo nó existe na cena base (com tolerância
 * de nomenclatura). Retorna false se o clipe ficou sem nenhum track útil.
 */
function retargetTracks(clip, clipLabel, model, normMap, warn) {
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
    warn(`clipe "${clipLabel}" descartado — nenhum track casa com o esqueleto base`);
    return false;
  }
  if (dropped > 0)
    warn(`clipe "${clipLabel}": ${dropped}/${clip.tracks.length} tracks sem nó correspondente (esqueleto diferente?)`);
  clip.tracks = kept;
  return true;
}

/** In-place: congela a translação XZ do(s) osso(s) raiz no 1º keyframe (Y fica: bounce do passo). */
export function stripRootTranslation(clip, rootBoneNames) {
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

/** Deslocamento XZ do osso raiz entre o 1º e o último keyframe (unidades da fonte). */
export function measureRootTravel(clip, rootBoneNames) {
  let travel = 0;
  for (const track of clip.tracks) {
    const parsed = THREE.PropertyBinding.parseTrackName(track.name);
    if (parsed.propertyName !== "position" || !rootBoneNames.has(parsed.nodeName)) continue;
    const v = track.values;
    if (v.length < 6) continue;
    const dx = v[v.length - 3] - v[0];
    const dz = v[v.length - 1] - v[2];
    travel = Math.max(travel, Math.hypot(dx, dz));
  }
  return travel;
}

/** Nome sugerido para um clipe (renomeia genéricos tipo "mixamo.com" para o nome do arquivo). */
function suggestClipName(clip, path, usedLower, fallbackIndex) {
  let name = (clip.name ?? "").trim();
  if (!name || GENERIC_CLIP_NAME.test(name) || usedLower.has(name.toLowerCase())) {
    const base = basename(path, extname(path));
    name = usedLower.has(base.toLowerCase()) ? `${base}_${fallbackIndex}` : base;
  }
  return name;
}

/**
 * Coleta automática (CLI): todos os clipes na ordem dos arquivos, com --skip
 * e --clip Nome:modo. args = { skip:Set, clipModes:Map, inPlace:boolean }.
 */
export function collectClips(files, model, args, warn = console.warn) {
  const used = new Set();
  const entries = [];
  const normMap = buildNormMap(model);

  for (const { path, gltf } of files) {
    for (const clip of gltf.animations ?? []) {
      const name = suggestClipName(clip, path, used, entries.length);
      if (args.skip.has(name.toLowerCase()) || args.skip.has((clip.name ?? "").toLowerCase()))
        continue;
      used.add(name.toLowerCase());

      if (!retargetTracks(clip, name, model, normMap, warn)) continue;
      let sourceClip = null;
      if (args.inPlace) {
        sourceClip = clip.clone();
        stripRootTranslation(clip, model.rootBoneNames);
      }

      const mode = args.clipModes.get(name.toLowerCase()) ??
        args.clipModes.get((clip.name ?? "").toLowerCase()) ?? "loop";
      entries.push({ name, mode, clip, sourceClip, source: basename(path) });
    }
  }

  for (const key of args.clipModes.keys())
    if (!entries.some((e) => e.name.toLowerCase() === key))
      warn(`--clip "${key}" não casa com nenhum clipe (disponíveis: ${entries.map((e) => e.name).join(", ")})`);

  if (entries.length === 0) err("nenhum clipe de animação para assar");
  return entries;
}

/**
 * Seleção explícita (Studio): ordem, nome, modo e in-place vêm da UI.
 * selection = [{ file, clip, name, mode, inPlace }] (índices em files/animations)
 * ou, para clipes combinados (2+ fontes mescladas em um track contínuo):
 * [{ parts: [{file, clip}, ...], fade, name, mode, inPlace }].
 *
 * Os clipes fonte NUNCA são mutados (clone antes de retarget/strip): o mesmo
 * clipe pode aparecer em um combo E sozinho na mesma seleção.
 */
export function selectClips(files, model, selection, warn = console.warn) {
  const used = new Set();
  const entries = [];
  const normMap = buildNormMap(model);

  const resolvePart = (ref, label) => {
    const file = files[ref.file];
    const clip = file?.gltf.animations?.[ref.clip];
    if (!clip) err(`seleção inválida: clipe ${ref.clip} do arquivo ${ref.file}${label ? ` (em "${label}")` : ""}`);
    return { clip: clip.clone(), source: basename(file.path) };
  };

  for (const sel of selection) {
    const name = String(sel.name ?? "").trim();
    if (!name) err("clipe sem nome na seleção");
    if (used.has(name.toLowerCase())) err(`nome de clipe duplicado: "${name}"`);
    used.add(name.toLowerCase());

    let clip;
    let source;
    if (Array.isArray(sel.parts)) {
      if (sel.parts.length < 2) err(`combinado "${name}" precisa de 2+ clipes`);
      const parts = sel.parts.map((p) => resolvePart(p, name));
      const kept = [];
      for (const p of parts)
        if (retargetTracks(p.clip, name, model, normMap, warn)) kept.push(p);
      if (kept.length < 2) {
        warn(`combinado "${name}" descartado — menos de 2 partes casam com o esqueleto`);
        continue;
      }
      const fade = Number.isFinite(Number(sel.fade)) ? Math.max(0, Number(sel.fade)) : DEFAULT_MERGE_FADE;
      clip = mergeClips(kept.map((p) => p.clip), { name, fade });
      source = [...new Set(kept.map((p) => p.source))].join(" + ");
    } else {
      const part = resolvePart(sel);
      if (!retargetTracks(part.clip, name, model, normMap, warn)) continue;
      clip = part.clip;
      source = part.source;
    }

    // In-place: a trajetória sai do skinning, mas fica guardada (sourceClip)
    // para o bake exportar como rootMotion no descriptor.
    let sourceClip = null;
    if (sel.inPlace) {
      sourceClip = clip.clone();
      stripRootTranslation(clip, model.rootBoneNames);
    }

    entries.push({
      name,
      mode: sel.mode === "oneshot" ? "oneshot" : "loop",
      clip,
      sourceClip,
      source,
    });
  }

  if (entries.length === 0) err("nenhum clipe selecionado para assar");
  return entries;
}

// ---------------------------------------------------------------------------
// Bake: amostra a pose skinned a N frames fixos por clipe.
// Async: cede o event loop a cada poucos frames para o servidor do Studio
// conseguir enviar progresso enquanto assa.

export async function bakeClips(model, entries, frames, onProgress) {
  const { scene, meshInfos, uniqueCount } = model;
  const rows = entries.length * frames;
  const pos = new Float32Array(rows * uniqueCount * 3);
  const nrm = new Float32Array(rows * uniqueCount * 3);

  const v = new THREE.Vector3();
  const n4 = new THREE.Vector4();
  const nv = new THREE.Vector3();
  const normalMatrix = new THREE.Matrix3();

  for (let ci = 0; ci < entries.length; ci++) {
    const entry = entries[ci];
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
        const n = pickCount(mi);
        for (let i = 0; i < n; i++) {
          const src = mi.pick ? mi.pick[i] : i;
          const o = (row * uniqueCount + mi.base + i) * 3;

          v.fromBufferAttribute(posAttr, src);
          mi.mesh.applyBoneTransform(src, v);
          v.applyMatrix4(mi.mesh.matrixWorld);
          pos[o] = v.x;
          pos[o + 1] = v.y;
          pos[o + 2] = v.z;

          // w=0 → applyBoneTransform trata como direção (sem translação)
          n4.set(nrmAttr.getX(src), nrmAttr.getY(src), nrmAttr.getZ(src), 0);
          mi.mesh.applyBoneTransform(src, n4);
          nv.set(n4.x, n4.y, n4.z).applyMatrix3(normalMatrix);
          const len = nv.length() || 1;
          nrm[o] = nv.x / len;
          nrm[o + 1] = nv.y / len;
          nrm[o + 2] = nv.z / len;
        }
      }

      if (onProgress) {
        onProgress({ clip: ci, clipName: entry.name, frame: f, done: row + 1, total: rows });
        if (f % 8 === 7) await new Promise((r) => setImmediate(r));
      }
    }
    mixer.stopAllAction();
    mixer.uncacheRoot(scene);
  }

  restorePose(model);
  return { pos, nrm, rows };
}

/**
 * Trajetória removida pelo "andar no lugar": para cada frame, a posição do
 * osso raiz tocando o clipe ORIGINAL menos a posição tocando o clipe assado
 * (in-place) — em espaço de mundo pré-normalização (o caller multiplica pela
 * escala da normalização). Mesma grade temporal do bake: samples[f] casa 1:1
 * com a linha f do clipe na textura.
 *
 * A raiz translada rígido a hierarquia inteira, então este delta é exatamente
 * o deslocamento que o personagem inteiro perdeu no skinning — a experiência
 * pode reaplicá-lo como translate do mesh (one-shots dirigidos/cinemáticos).
 */
export function sampleRootMotion(model, entry, frames) {
  if (!entry.sourceClip || !model.rootBone) return null;

  const worldPositions = (clip) => {
    restorePose(model);
    const mixer = new THREE.AnimationMixer(model.scene);
    const action = mixer.clipAction(clip);
    action.setLoop(THREE.LoopOnce, 1);
    action.clampWhenFinished = true;
    action.play();
    const dur = Math.max(clip.duration, 1e-6);
    const out = [];
    const v = new THREE.Vector3();
    for (let f = 0; f < frames; f++) {
      const t =
        entry.mode === "loop"
          ? (f * dur) / frames
          : Math.min((f * dur) / (frames - 1), dur * (1 - 1e-6));
      mixer.setTime(t);
      model.scene.updateMatrixWorld(true);
      model.rootBone.getWorldPosition(v);
      out.push([v.x, v.y, v.z]);
    }
    mixer.stopAllAction();
    mixer.uncacheRoot(model.scene);
    return out;
  };

  const src = worldPositions(entry.sourceClip);
  const baked = worldPositions(entry.clip);
  restorePose(model);
  return src.map((p, f) => [p[0] - baked[f][0], p[1] - baked[f][1], p[2] - baked[f][2]]);
}

// ---------------------------------------------------------------------------
// Normalização: pés no y=0, centro XZ na origem, escala opcional de altura

export function normalizeBake(pos, rows, uniqueCount, targetHeight) {
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

export function packHalf(f32, rows, uniqueCount, columns) {
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

// ---------------------------------------------------------------------------
// Topologia e escrita do resultado

export function decideTopology(model, requested = "auto") {
  const soupCount = model.drawIndices.length;
  let topology = requested;
  // auto: a largura da textura manda no download — indexed sempre que a malha
  // compartilha vértices (unique < soup); soup só quando não há ganho (fonte
  // já é soup pura, como o asset legado do Houdini).
  if (topology === "auto")
    topology = model.uniqueCount < soupCount ? "indexed" : "soup";
  if (topology === "soup" && soupCount > MAX_TEXTURE_WIDTH)
    err(
      `soup teria ${soupCount} colunas > ${MAX_TEXTURE_WIDTH} (limite de textura do WebGPU). ` +
        `Use --topology indexed (ou auto), ou decime a malha.`,
    );
  if (model.uniqueCount > MAX_TEXTURE_WIDTH)
    err(
      `malha grande demais mesmo indexada: ${model.uniqueCount} vértices únicos > ${MAX_TEXTURE_WIDTH}. ` +
        `Decime a malha (--max-verts no CLI, ou a sugestão do Studio).`,
    );
  return { topology, width: topology === "soup" ? soupCount : model.uniqueCount };
}

/** Escreve bins + vat.json e retorna o descriptor (formato "vat-bake/2"). */
export function writeOutput({
  outDir,
  model,
  entries,
  topology,
  width,
  rows,
  frames,
  fps,
  height,
  norm,
  posBin,
  nrmBin,
  sources,
  decimation = null,
  meshHash = null,
  rootMotion = null,
}) {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "positions_f16.bin"), Buffer.from(posBin.buffer));
  writeFileSync(join(outDir, "normals_f16.bin"), Buffer.from(nrmBin.buffer));
  if (topology === "indexed")
    writeFileSync(join(outDir, "indices_u32.bin"), Buffer.from(model.drawIndices.buffer));

  const descriptor = {
    format: "vat-bake/2",
    created: new Date().toISOString(),
    sources: sources.map((p) => basename(p)),
    topology,
    vertexCount: width,
    indexCount: topology === "indexed" ? model.drawIndices.length : 0,
    textureWidth: width,
    textureHeight: rows,
    channels: 3,
    dtype: "float16",
    clipCount: entries.length,
    framesPerClip: frames,
    fps,
    // Dados já nascem Y-up (three) e centrados: nada do basis x_negz_y do Houdini.
    basis: "identity",
    bakeOffset: [0, 0, 0],
    // Identidade da malha (bind pose pós-decimação + ordem de desenho):
    // VATs com o MESMO meshHash endereçam os mesmos vértices por coluna e
    // podem cruzar crossfade no app (?vat=a&vatB=b). Hash diferente = malha
    // diferente = morph entre elas não faz sentido geométrico.
    ...(meshHash ? { meshHash } : {}),
    clips: entries.map((e, i) => ({
      name: e.name,
      mode: e.mode,
      rowStart: i * frames,
      rowEnd: (i + 1) * frames,
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
      targetHeight: height,
    },
    bounds: {
      min: norm.bounds.min.map((v) => +v.toFixed(6)),
      max: norm.bounds.max.map((v) => +v.toFixed(6)),
    },
    ...(decimation ? { decimation } : {}),
    // Trajetória da raiz REMOVIDA pelo "andar no lugar", por clipe que a tinha.
    // samples[f] = deslocamento [x,y,z] no frame f (mesma grade dos frames da
    // textura), já na escala do bake — some ao translate do mesh para
    // reproduzir o deslocamento original (one-shots dirigidos). Para a
    // multidão simulada, ignore: o movimento vem da simulação.
    ...(rootMotion && rootMotion.length ? { rootMotion } : {}),
  };
  writeFileSync(join(outDir, "vat.json"), JSON.stringify(descriptor, null, 2) + "\n");
  return descriptor;
}

// ---------------------------------------------------------------------------
// Fluxo completo (CLI e Studio compartilham): load → decima → clipes → bake
// → normaliza → empacota → escreve. hooks: selectEntries (obrigatório),
// onProgress, info, warn.

export async function bakeToDir(cfg, hooks) {
  const {
    inputs,
    out,
    frames = 60,
    fps = 18,
    height = 0.7,
    topology: requestedTopology = "auto",
    maxVerts = 0,
  } = cfg;
  const warn = hooks.warn ?? console.warn;
  const info = hooks.info ?? (() => {});

  const files = [];
  for (const p of inputs) {
    if (!existsSync(p)) err(`arquivo não existe: ${p}`);
    files.push({ path: p, gltf: await loadModelFile(p, warn) });
  }
  warnUselessFiles(files, warn);
  const charIdx = findCharacterIndex(files);
  if (charIdx < 0)
    err("nenhum dos arquivos tem SkinnedMesh — baixe o personagem do Mixamo com 'Skin: With Skin'");
  const model = buildModel(files[charIdx].gltf, files[charIdx].path, warn);

  let decimation = null;
  if (maxVerts > 0 && maxVerts < model.uniqueCount) {
    decimation = await decimateModel(model, maxVerts, warn);
    if (decimation) info({ type: "decimate", ...decimation });
  }

  const entries = hooks.selectEntries(files, model);
  const { topology, width } = decideTopology(model, requestedTopology);
  const meshHash = computeMeshHash(model);
  info({
    type: "plan",
    topology,
    width,
    rows: entries.length * frames,
    meshes: model.meshInfos.length,
    uniqueVerts: model.uniqueCount,
    triangles: model.drawIndices.length / 3,
    meshHash,
    entries: entries.map((e) => ({
      name: e.name,
      mode: e.mode,
      source: e.source,
      duration: +e.clip.duration.toFixed(3),
      inPlace: Boolean(e.sourceClip),
    })),
  });

  const { pos, nrm, rows } = await bakeClips(model, entries, frames, hooks.onProgress);
  const norm = normalizeBake(pos, rows, model.uniqueCount, height);
  info({
    type: "normalize",
    translate: norm.translate.map((v) => +v.toFixed(4)),
    scale: +norm.scale.toFixed(4),
    sourceHeight: +norm.sourceHeight.toFixed(4),
  });

  // Root motion dos clipes in-place: delta em espaço de mundo × escala da
  // normalização = mesma unidade das posições assadas. Porta de ruído: só
  // exporta se o deslocamento total passar de 1% da altura do personagem
  // (clipes já autorados no lugar produzem drift numérico desprezível).
  const bakedHeight = norm.sourceHeight * norm.scale;
  const rootMotion = [];
  for (const e of entries) {
    const samples = sampleRootMotion(model, e, frames);
    if (!samples) continue;
    const travel = Math.hypot(...samples[frames - 1]) * norm.scale;
    if (travel < bakedHeight * 0.01) continue;
    rootMotion.push({
      clip: e.name,
      samples: samples.map((s) => s.map((v) => +(v * norm.scale).toFixed(5))),
    });
    info({ type: "rootmotion", clip: e.name, travel: +travel.toFixed(4) });
  }

  const columns = topology === "soup" ? model.drawIndices : null;
  const posBin = packHalf(pos, rows, model.uniqueCount, columns);
  const nrmBin = packHalf(nrm, rows, model.uniqueCount, columns);

  const descriptor = writeOutput({
    outDir: out,
    model,
    entries,
    topology,
    width,
    rows,
    frames,
    fps,
    height,
    norm,
    posBin,
    nrmBin,
    sources: inputs,
    decimation,
    meshHash,
    rootMotion,
  });

  return {
    descriptor,
    topology,
    width,
    rows,
    norm,
    decimation,
    bytes: {
      positions: posBin.byteLength,
      normals: nrmBin.byteLength,
      indices: topology === "indexed" ? model.drawIndices.byteLength : 0,
    },
  };
}

// ---------------------------------------------------------------------------
// Análise (Studio): o que o modelo e os clipes são, ANTES de qualquer bake.

export async function analyzeFiles(paths, warn = console.warn) {
  const files = [];
  for (const p of paths) {
    if (!existsSync(p)) err(`arquivo não existe: ${p}`);
    files.push({ path: p, gltf: await loadModelFile(p, warn) });
  }
  warnUselessFiles(files, warn);
  const charIndex = findCharacterIndex(files);
  if (charIndex < 0)
    err("nenhum dos arquivos tem SkinnedMesh — baixe o personagem do Mixamo com 'Skin: With Skin'");
  const model = buildModel(files[charIndex].gltf, files[charIndex].path, warn);
  const bind = measureBindPose(model);

  // Compatibilidade de esqueleto por clipe: quantas tracks casam com nós do
  // personagem (com a tolerância de nomenclatura do retarget). 0 = esqueleto
  // incompatível — a UI avisa antes de qualquer bake.
  const normMap = buildNormMap(model);
  const countMatched = (clip) => {
    let n = 0;
    for (const track of clip.tracks) {
      const { nodeName } = THREE.PropertyBinding.parseTrackName(track.name);
      if (!nodeName || model.nodeNames.has(nodeName) || normMap.get(normalizeName(nodeName))) n += 1;
    }
    return n;
  };

  const clips = [];
  const used = new Set();
  files.forEach((f, fi) => {
    (f.gltf.animations ?? []).forEach((clip, ci) => {
      const name = suggestClipName(clip, f.path, used, clips.length);
      used.add(name.toLowerCase());
      clips.push({
        file: fi,
        clip: ci,
        rawName: clip.name ?? "",
        name,
        duration: +clip.duration.toFixed(3),
        tracks: clip.tracks.length,
        matchedTracks: countMatched(clip),
        rootTravel: +measureRootTravel(clip, model.rootBoneNames).toFixed(4),
        source: basename(f.path),
      });
    });
  });

  const bones = new Set();
  for (const mi of model.meshInfos) for (const b of mi.mesh.skeleton.bones) bones.add(b.name);

  return {
    sources: paths.map((p) => basename(p)),
    charIndex,
    meshes: model.meshInfos.length,
    uniqueVerts: model.uniqueCount,
    soupVerts: model.drawIndices.length,
    triangles: model.drawIndices.length / 3,
    bones: bones.size,
    bindHeight: bind.height,
    bindMin: bind.min,
    bindMax: bind.max,
    // Identidade da malha SEM decimação (a decimação muda o hash — o
    // /api/estimate devolve o hash pós-redução).
    meshHash: computeMeshHash(model),
    clips,
  };
}

// ---------------------------------------------------------------------------
// Selftest: valida um diretório assado lendo os arquivos de volta.
// Retorna { checks: [{ok, label}], problems: [labels] } — quem imprime é o caller.

function readTyped(path, Ctor) {
  const b = readFileSync(path);
  // cópia exata: Buffers pequenos do Node compartilham um pool (offset ≠ 0)
  return new Ctor(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength));
}

const fmtV3 = (v) => `[${v.map((n) => (+n).toFixed(4)).join(", ")}]`;

export function runSelftest(outDir) {
  const checks = [];
  const ok = (label) => checks.push({ ok: true, label });
  const bad = (label) => checks.push({ ok: false, label });

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

  // 4b. escala coerente ENTRE clipes: diagonal do frame 0 de cada clipe vs a
  // do 1º clipe — pega fontes com unidades mistas (ex.: um FBX em cm no meio
  // de arquivos em metros, que sairia 100× maior).
  const clipDiag = (clip) => {
    const rowBase = clip.rowStart * w * 3;
    const cmin = [Infinity, Infinity, Infinity];
    const cmax = [-Infinity, -Infinity, -Infinity];
    for (let cIdx = 0; cIdx < w; cIdx++)
      for (let ch = 0; ch < 3; ch++) {
        const val = posF[rowBase + cIdx * 3 + ch];
        if (val < cmin[ch]) cmin[ch] = val;
        if (val > cmax[ch]) cmax[ch] = val;
      }
    return Math.hypot(cmax[0] - cmin[0], cmax[1] - cmin[1], cmax[2] - cmin[2]);
  };
  const diag0 = clipDiag(desc.clips[0]);
  for (const clip of desc.clips.slice(1)) {
    const d = clipDiag(clip);
    const ratio = d / Math.max(diag0, 1e-6);
    ratio > 0.2 && ratio < 5
      ? ok(`escala do clipe "${clip.name}" coerente (diagonal ${d.toFixed(3)} vs ${diag0.toFixed(3)} do 1º)`)
      : bad(
          `clipe "${clip.name}" com escala ${ratio > 1 ? ratio.toFixed(1) + "× maior" : (1 / ratio).toFixed(1) + "× menor"} ` +
            `que o 1º clipe — fontes com unidades diferentes (cm vs m)? re-exporte ou converta para GLB`,
        );
  }

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
      : bad(`loop "${clip.name}" não fecha: wrap ${wrap.toFixed(4)} > ${limit.toFixed(4)} — fonte não é cíclica? marque one-shot ou use outro clipe`);
  }

  // 6. rootMotion (se exportado): 1 amostra [x,y,z] por frame, clipes existem
  if (Array.isArray(desc.rootMotion)) {
    for (const rm of desc.rootMotion) {
      const clipOk = desc.clips.some((c) => c.name === rm.clip);
      const samplesOk =
        Array.isArray(rm.samples) &&
        rm.samples.length === desc.framesPerClip &&
        rm.samples.every((s) => Array.isArray(s) && s.length === 3 && s.every(Number.isFinite));
      clipOk && samplesOk
        ? ok(`rootMotion "${rm.clip}": ${rm.samples.length} amostras (deslocamento total ${Math.hypot(...rm.samples[rm.samples.length - 1]).toFixed(3)})`)
        : bad(`rootMotion "${rm.clip}" inválido (clipe existe: ${clipOk}; amostras: ${rm.samples?.length ?? 0}/${desc.framesPerClip})`);
    }
  }

  // 7. normais unitárias (amostra)
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

  return { checks, problems: checks.filter((c) => !c.ok).map((c) => c.label) };
}
