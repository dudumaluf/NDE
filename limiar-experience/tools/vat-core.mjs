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
import { rebaseTracksToRig, restPoseMaps, worldScaleOf } from "./retarget-units.mjs";

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

  // Nomes de nós (para casar tracks de animação de outros arquivos) e de
  // OSSOS (tracks vindas de outros arquivos só podem mirar ossos: nós de
  // container tipo "Armature" carregam rotação/escala do export — 0,01 no
  // GLB do Blender — e uma track estrangeira ali explode o rig 100×).
  const nodeNames = new Set();
  const boneNames = new Set();
  scene.traverse((o) => {
    if (o.name) nodeNames.add(o.name);
    if (o.isBone && o.name) boneNames.add(o.name);
  });
  model.nodeNames = nodeNames;
  model.boneNames = boneNames;

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

/**
 * Bounding box da bind pose em espaço de mundo (altura "natural" do modelo).
 * Passa pelo SKINNING (applyBoneTransform), não pela geometria crua: em rigs
 * GLB do Blender os vértices moram no espaço do armature (cm sob nó 0,01) e
 * a matrixWorld do mesh sozinha dá alturas absurdas — o mesmo caminho do
 * bake garante a medida certa em qualquer convenção.
 */
export function measureBindPose(model) {
  model.scene.updateMatrixWorld(true);
  const v = new THREE.Vector3();
  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  for (const mi of model.meshInfos) {
    const attr = mi.mesh.geometry.attributes.position;
    const step = Math.max(1, Math.floor(attr.count / 20000));
    for (let i = 0; i < attr.count; i += step) {
      v.fromBufferAttribute(attr, i);
      mi.mesh.applyBoneTransform(i, v);
      v.applyMatrix4(mi.mesh.matrixWorld);
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

/** Osso de maior peso de um vértice (índice no skeleton). −1 = sem skin. */
function dominantBone(geometry, i) {
  const si = geometry.attributes.skinIndex;
  const sw = geometry.attributes.skinWeight;
  if (!si || !sw) return -1;
  let best = -Infinity;
  let bone = -1;
  for (let c = 0; c < 4; c++) {
    const w = c === 0 ? sw.getX(i) : c === 1 ? sw.getY(i) : c === 2 ? sw.getZ(i) : sw.getW(i);
    if (w > best) {
      best = w;
      bone = c === 0 ? si.getX(i) : c === 1 ? si.getY(i) : c === 2 ? si.getZ(i) : si.getW(i);
    }
  }
  return bone;
}

/**
 * Solda por posição RESPEITANDO o osso dominante: vértices coincidentes de
 * ossos diferentes (pernas encostadas na bind pose, espelhos no x=0) NÃO se
 * fundem — sem isso o simplificador pode colapsar através de membros e a
 * animação "puxa" a perna/braço errado. Mesma semântica de igualdade exata
 * do generatePositionRemap do meshopt, com o osso no critério.
 */
function weldByPositionAndBone(positions, geometry, count) {
  const bits = new Uint32Array(positions.buffer, positions.byteOffset, count * 3);
  const first = new Map();
  const remap = new Uint32Array(count);
  for (let i = 0; i < count; i++) {
    const key = `${bits[i * 3]},${bits[i * 3 + 1]},${bits[i * 3 + 2]},${dominantBone(geometry, i)}`;
    const seen = first.get(key);
    if (seen === undefined) {
      first.set(key, i);
      remap[i] = i;
    } else {
      remap[i] = seen;
    }
  }
  return remap;
}

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
  // contagem de vértices por região ANTES/DEPOIS (região = osso dominante):
  // detecta redução desproporcional num membro ("a perna sumiu")
  const regionBefore = new Map();
  const regionAfter = new Map();

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
    const bones = mi.mesh.skeleton?.bones ?? [];
    const regionOf = (i) => {
      const b = dominantBone(mi.mesh.geometry, i);
      return b >= 0 ? boneRegion(bones[b]?.name ?? "") : null;
    };
    for (let i = 0; i < count; i++) {
      const r = regionOf(i);
      if (r) regionBefore.set(r, (regionBefore.get(r) ?? 0) + 1);
    }

    const srcIdx = mi.indexArray;
    const remap = weldByPositionAndBone(positions, mi.mesh.geometry, count);
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
    for (const orig of usedSorted) {
      const r = regionOf(orig);
      if (r) regionAfter.set(r, (regionAfter.get(r) ?? 0) + 1);
    }
    mi.pick = Uint32Array.from(usedSorted);
    mi.indexArray = newLocal;
    mi.base = base;
    base += usedSorted.length;
  }

  model.uniqueCount = base;
  rebuildDrawIndices(model);
  if (model.uniqueCount > maxVerts)
    warn(`decimação parou em ${model.uniqueCount} vértices (alvo ${maxVerts}) — topologia não permitiu mais colapsos`);

  // Sobrevivência por região vs geral: um membro reduzido muito além do
  // resto perde silhueta/skinning ("perna manca" pós-redução) — aviso.
  const overall = model.uniqueCount / fromVerts;
  const regionWarnings = [];
  for (const [region, before] of regionBefore) {
    if (before < 60) continue; // região minúscula — estatística sem valor
    const after = regionAfter.get(region) ?? 0;
    const ratio = after / before;
    if (ratio < overall * 0.45)
      regionWarnings.push(
        `redução desproporcional em ${region}: sobraram ${after} de ${before} vértices ` +
          `(${(ratio * 100).toFixed(1)}% vs ${(overall * 100).toFixed(1)}% no geral) — ` +
          `considere reduzir menos ou re-exportar com malha mais uniforme`,
      );
  }
  for (const w of regionWarnings) warn(w);

  return {
    from: fromVerts,
    to: model.uniqueCount,
    fromTriangles: fromTris,
    triangles: model.drawIndices.length / 3,
    error: +worstError.toFixed(4),
    ...(regionWarnings.length ? { regionWarnings } : {}),
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
 * Pose de descanso (translações locais + matrizes de mundo dos pais) de uma
 * cena, memoizada — insumo do rebase de posições no retarget entre arquivos.
 */
function restMapsFor(scene, cache) {
  let maps = cache.get(scene);
  if (!maps) {
    maps = restPoseMaps(scene);
    cache.set(scene, maps);
  }
  return maps;
}

/**
 * Rebaseia tracks de POSIÇÃO e ROTAÇÃO à convenção do rig do personagem.
 * Tracks são expressas no espaço local do PAI de cada osso, e esse espaço
 * difere entre exports do mesmo esqueleto (bug real: rig GLB do Blender com
 * ossos em cm/Z-up sob nó 0,01×−90°X + anim FBX em m/Y-up → o corpo afunda
 * — "chão na cintura" — e tomba de lado). Ver tools/retarget-units.mjs.
 */
function adaptPositionUnits(clip, clipLabel, srcScene, model, normMap, cache, warn) {
  if (!srcScene || srcScene === model.scene) return; // clipes do próprio personagem
  const srcMaps = restMapsFor(srcScene, cache);
  const dstMaps = restMapsFor(model.scene, cache);
  const r = rebaseTracksToRig(clip, srcMaps, dstMaps, (srcName) =>
    model.nodeNames.has(srcName) ? srcName : normMap.get(normalizeName(srcName)) ?? null,
  );
  if (r.rebased > 0 && !cache.warnedScenes?.has(srcScene)) {
    (cache.warnedScenes ??= new Set()).add(srcScene);
    warn(
      `tracks rebasedas para o espaço do rig do personagem (${r.rebased} track(s), proporção ×${r.s.toFixed(3)}, ` +
        `${r.matched} ossos medidos) — fonte com unidades/eixos próprios, ex.: anim FBX sobre rig GLB (clipe "${clipLabel}")`,
    );
  }
}

/**
 * Retarget leve: mantém só tracks cujo nó existe na cena base (com tolerância
 * de nomenclatura). `bonesOnly` (clipes de OUTRO arquivo) restringe a ossos —
 * tracks de containers ("Armature" do Blender) sobrescreveriam a rotação e a
 * ESCALA (0,01) do nó homônimo no rig destino. Retorna false se o clipe
 * ficou sem nenhum track útil.
 */
function retargetTracks(clip, clipLabel, model, normMap, warn, bonesOnly = false) {
  const allowed = bonesOnly ? model.boneNames : model.nodeNames;
  const kept = [];
  let dropped = 0;
  for (const track of clip.tracks) {
    const { nodeName } = THREE.PropertyBinding.parseTrackName(track.name);
    if (!nodeName || allowed.has(nodeName)) {
      kept.push(track);
      continue;
    }
    const remap = normMap.get(normalizeName(nodeName));
    if (remap && allowed.has(remap)) {
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
    warn(`clipe "${clipLabel}": ${dropped}/${clip.tracks.length} tracks sem osso correspondente (containers/esqueleto diferente — ignoradas)`);
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
  const unitsCache = new Map();

  for (const { path, gltf } of files) {
    for (const clip of gltf.animations ?? []) {
      const name = suggestClipName(clip, path, used, entries.length);
      if (args.skip.has(name.toLowerCase()) || args.skip.has((clip.name ?? "").toLowerCase()))
        continue;
      used.add(name.toLowerCase());

      if (!retargetTracks(clip, name, model, normMap, warn, gltf.scene !== model.scene)) continue;
      adaptPositionUnits(clip, name, gltf.scene, model, normMap, unitsCache, warn);
      let sourceClip = null;
      if (args.inPlace) {
        sourceClip = clip.clone();
        stripRootTranslation(clip, model.rootBoneNames);
      }

      const mode = args.clipModes.get(name.toLowerCase()) ??
        args.clipModes.get((clip.name ?? "").toLowerCase()) ?? "loop";
      const yOffsetSrc = Number(args.yOffsets?.get(name.toLowerCase())) || 0;
      entries.push({ name, mode, clip, sourceClip, source: basename(path), yOffsetSrc });
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
  const unitsCache = new Map();

  const resolvePart = (ref, label) => {
    const file = files[ref.file];
    const clip = file?.gltf.animations?.[ref.clip];
    if (!clip) err(`seleção inválida: clipe ${ref.clip} do arquivo ${ref.file}${label ? ` (em "${label}")` : ""}`);
    return { clip: clip.clone(), source: basename(file.path), scene: file.gltf.scene };
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
        if (retargetTracks(p.clip, name, model, normMap, warn, p.scene !== model.scene)) {
          adaptPositionUnits(p.clip, name, p.scene, model, normMap, unitsCache, warn);
          kept.push(p);
        }
      if (kept.length < 2) {
        warn(`combinado "${name}" descartado — menos de 2 partes casam com o esqueleto`);
        continue;
      }
      const fade = Number.isFinite(Number(sel.fade)) ? Math.max(0, Number(sel.fade)) : DEFAULT_MERGE_FADE;
      clip = mergeClips(kept.map((p) => p.clip), { name, fade });
      source = [...new Set(kept.map((p) => p.source))].join(" + ");
    } else {
      const part = resolvePart(sel);
      if (!retargetTracks(part.clip, name, model, normMap, warn, part.scene !== model.scene)) continue;
      adaptPositionUnits(part.clip, name, part.scene, model, normMap, unitsCache, warn);
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
      // offset Y manual da UI (unidades da FONTE, ex.: +0,05 = 5 cm num
      // personagem de 1,8 m) — escape hatch por clipe, soma ao aterramento
      yOffsetSrc: Number(sel.yOffset) || 0,
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
// Normalização: pés no y=0 POR CLIPE, centro XZ na origem, escala opcional
// de altura. O aterramento por clipe importa quando as fontes vêm de rigs
// diferentes (ex.: anim FBX retargetada num rig GLB): proporções distintas
// deixam um clipe flutuando ou afundando em relação aos outros — cada clipe
// ganha o próprio offset (documentado no descriptor), e o offset MANUAL da
// UI (yOffsetSrc, em unidades da fonte) soma por cima como escape hatch.

export function normalizeBake(pos, rows, uniqueCount, targetHeight, clips = null) {
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

  // Aterramento por clipe: o menor Y skinado do clipe vai para 0 (+ offset
  // manual). groundOffset registrado em unidades ASSADAS (pós-escala).
  const perClip = [];
  if (clips && clips.length > 0) {
    const framesPer = Math.round(rows / clips.length);
    for (let ci = 0; ci < clips.length; ci++) {
      const start = ci * framesPer * uniqueCount * 3;
      const end = (ci + 1) * framesPer * uniqueCount * 3;
      let yMin = Infinity;
      for (let i = start + 1; i < end; i += 3) if (pos[i] < yMin) yMin = pos[i];
      const manual = (Number(clips[ci]?.yOffsetSrc) || 0) * scale;
      const shift = -yMin + manual;
      if (Math.abs(shift) > 1e-9)
        for (let i = start + 1; i < end; i += 3) pos[i] += shift;
      perClip.push({
        groundOffset: +(-yMin).toFixed(6),
        yOffsetBaked: +manual.toFixed(6),
      });
    }
  }

  // Bounds finais (pós aterramento por clipe)
  const bmin = [Infinity, Infinity, Infinity];
  const bmax = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3)
    for (let c = 0; c < 3; c++) {
      const val = pos[i + c];
      if (val < bmin[c]) bmin[c] = val;
      if (val > bmax[c]) bmax[c] = val;
    }

  return { translate, scale, sourceHeight, bounds: { min: bmin, max: bmax }, perClip };
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
      // Aterramento POR CLIPE (unidades assadas): quanto o clipe foi
      // deslocado em Y para os pés tocarem o y=0 — automático (fontes de
      // rigs distintos aterram diferente); yOffset só aparece quando houve
      // ajuste MANUAL na UI/CLI (já incluído nas posições assadas).
      groundOffset: norm.perClip?.[i]?.groundOffset ?? 0,
      ...(norm.perClip?.[i]?.yOffsetBaked ? { yOffset: norm.perClip[i].yOffsetBaked } : {}),
      // regiões sem movimento detectadas no bake (aviso persistido — o
      // selftest confere e o app pode decidir não usar o clipe)
      ...(e.frozenRegions ? { frozenRegions: e.frozenRegions } : {}),
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

  // Juntas congeladas por clipe (osso core sem track/constante num clipe de
  // movimento — "perna manca"): detectado AQUI (com esqueleto em mãos),
  // gravado no descriptor e cobrado pelo selftest.
  const normMapFrozen = buildNormMap(model);
  for (const e of entries) {
    const frozen = frozenBonesByRegion(e.clip, model, normMapFrozen);
    if (Object.keys(frozen).length === 0) continue;
    e.frozenRegions = frozen;
    warn(
      `clipe "${e.name}": sem movimento em ${Object.entries(frozen)
        .map(([r, b]) => `${r} (${b.join(", ")})`)
        .join(" · ")} — membro congelado no bake (fonte sem esses ossos?)`,
    );
  }

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
  const norm = normalizeBake(
    pos,
    rows,
    model.uniqueCount,
    height,
    entries.map((e) => ({ yOffsetSrc: e.yOffsetSrc ?? 0 })),
  );
  info({
    type: "normalize",
    translate: norm.translate.map((v) => +v.toFixed(4)),
    scale: +norm.scale.toFixed(4),
    sourceHeight: +norm.sourceHeight.toFixed(4),
    grounds: norm.perClip.map((p, i) => ({
      clip: entries[i].name,
      groundOffset: p.groundOffset,
      ...(p.yOffsetBaked ? { yOffset: p.yOffsetBaked } : {}),
    })),
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
// Regiões do corpo (nomenclatura Mixamo e afins) — para os diagnósticos
// falarem "perna esquerda" em vez de listar 12 nomes de osso.

const REGION_PATTERNS = [
  ["mão esq.", /left.*(hand(?!.*(thumb|index|middle|ring|pinky))|thumb|index|middle|ring|pinky)/i],
  ["mão dir.", /right.*(hand(?!.*(thumb|index|middle|ring|pinky))|thumb|index|middle|ring|pinky)/i],
  ["braço esq.", /left.*(shoulder|arm|clavicle|elbow)/i],
  ["braço dir.", /right.*(shoulder|arm|clavicle|elbow)/i],
  ["perna esq.", /left.*(upleg|leg|knee|foot|toe|ankle)/i],
  ["perna dir.", /right.*(upleg|leg|knee|foot|toe|ankle)/i],
  ["cabeça", /head|neck|eye|jaw/i],
  ["coluna", /spine|chest|hips|pelvis|root/i],
];

/** Região do corpo de um osso (pelo nome). null = não classificado. */
export function boneRegion(name) {
  const n = String(name);
  for (const [region, re] of REGION_PATTERNS) if (re.test(n)) return region;
  return null;
}

/** Regiões "core" para avisos de animação (dedos/olhos são ruído). */
const CORE_REGIONS = new Set(["braço esq.", "braço dir.", "perna esq.", "perna dir.", "coluna", "cabeça"]);
const isCoreBone = (name) => {
  const r = boneRegion(name);
  return r !== null && CORE_REGIONS.has(r) && !/eye|jaw|_end$|end\d*$/i.test(name);
};

/** Nome curto (sem prefixo mixamorig/armature) para exibição. */
const shortBoneName = (name) => String(name).replace(/^(mixamorig:?|armature[|_]?)/i, "");

/**
 * Compara a POSE DE DESCANSO de dois rigs pelas DIREÇÕES dos ossos
 * (junta → filho homônimo, em mundo) — invariante à convenção de frames
 * (que difere entre exports) e sensível ao que importa: T-pose vs A-pose,
 * braços em outra posição etc. Um descanso diferente distorce o retarget
 * (o rebase mapeia descanso→descanso): braços cruzam/invertem.
 * Retorna { checked, pairs, worst: [{bone, region, deg}] } ou null.
 */
export function compareRestPose(srcScene, dstScene, resolveDstName) {
  const dirsOf = (scene) => {
    scene.updateMatrixWorld(true);
    const out = new Map();
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    scene.traverse((o) => {
      if (!o.isBone) return;
      for (const c of o.children) {
        if (!c.isBone) continue;
        o.getWorldPosition(a);
        c.getWorldPosition(b);
        const d = b.sub(a);
        if (d.length() > 1e-6) out.set(`${o.name}→${c.name}`, d.normalize().clone());
      }
    });
    return out;
  };
  const src = dirsOf(srcScene);
  const dst = dirsOf(dstScene);
  const deltas = [];
  for (const [key, vSrc] of src) {
    const [pName, cName] = key.split("→");
    if (!isCoreBone(pName)) continue;
    const dp = resolveDstName(pName);
    const dc = resolveDstName(cName);
    if (!dp || !dc) continue;
    const vDst = dst.get(`${dp}→${dc}`);
    if (!vDst) continue;
    const deg = (Math.acos(Math.min(1, Math.max(-1, vSrc.dot(vDst)))) * 180) / Math.PI;
    deltas.push({ bone: shortBoneName(pName), region: boneRegion(pName), deg: +deg.toFixed(1) });
  }
  if (deltas.length < 4) return null;
  deltas.sort((x, y) => y.deg - x.deg);
  return { checked: true, pairs: deltas.length, worst: deltas.slice(0, 6) };
}

/** Limiar: acima disso a pose de descanso é "outra" (T vs A ≈ 30–60°). */
export const REST_POSE_WARN_DEG = 25;

/**
 * Ossos CORE do rig destino sem movimento num clipe DE MOVIMENTO: sem track
 * de rotação, ou com track ~constante enquanto a mediana dos outros ossos se
 * mexe bastante (juntas congeladas = "perna manca" visível antes do bake).
 * Clipes calmos (idle sutil, poses) não disparam — o corte é relativo à
 * mediana de movimento do próprio clipe. Retorna
 * { 'perna esq.': ['LeftLeg', …], … } (nomes curtos) ou {}.
 */
export function frozenBonesByRegion(clip, model, normMap) {
  // amplitude de rotação (graus vs 1º keyframe) por osso do DESTINO
  const motionDeg = new Map();
  for (const track of clip.tracks) {
    const parsed = THREE.PropertyBinding.parseTrackName(track.name);
    if (parsed.propertyName !== "quaternion") continue;
    let dstName = null;
    if (model.boneNames.has(parsed.nodeName)) dstName = parsed.nodeName;
    else {
      const remap = normMap.get(normalizeName(parsed.nodeName));
      if (remap && model.boneNames.has(remap)) dstName = remap;
    }
    if (!dstName || !isCoreBone(dstName)) continue;
    const v = track.values;
    let minDot = 1;
    for (let i = 4; i < v.length; i += 4) {
      const dot = Math.abs(v[0] * v[i] + v[1] * v[i + 1] + v[2] * v[i + 2] + v[3] * v[i + 3]);
      if (dot < minDot) minDot = dot;
    }
    const deg = (2 * Math.acos(Math.min(1, minDot)) * 180) / Math.PI;
    motionDeg.set(dstName, Math.max(motionDeg.get(dstName) ?? 0, deg));
  }
  if (motionDeg.size === 0) return {};

  // O clipe "se move"? Usa o percentil 75 (não a mediana): remover uma perna
  // inteira derruba a mediana e esconderia exatamente o caso que procuramos.
  const degs = [...motionDeg.values()].sort((a, b) => a - b);
  const p75 = degs[Math.floor((degs.length - 1) * 0.75)];
  if (p75 < 12) return {}; // clipe calmo (idle/pose) — nada a acusar

  const thresh = Math.max(2, p75 * 0.06);
  const frozen = {};
  for (const name of model.boneNames) {
    if (!isCoreBone(name)) continue;
    if ((motionDeg.get(name) ?? 0) >= thresh) continue;
    const region = boneRegion(name);
    (frozen[region] ??= []).push(shortBoneName(name));
  }
  return frozen;
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

  // Compatibilidade de esqueleto por clipe: quantas tracks casam com OSSOS
  // do personagem (com a tolerância de nomenclatura do retarget; clipes do
  // próprio arquivo do personagem podem mirar qualquer nó). 0 = esqueleto
  // incompatível — a UI avisa antes de qualquer bake.
  const normMap = buildNormMap(model);
  const countMatched = (clip, foreign) => {
    const allowed = foreign ? model.boneNames : model.nodeNames;
    let n = 0;
    for (const track of clip.tracks) {
      const { nodeName } = THREE.PropertyBinding.parseTrackName(track.name);
      if (!nodeName || allowed.has(nodeName)) {
        n += 1;
        continue;
      }
      const remap = normMap.get(normalizeName(nodeName));
      if (remap && allowed.has(remap)) n += 1;
    }
    return n;
  };

  const resolveDstName = (srcName) =>
    model.nodeNames.has(srcName) ? srcName : normMap.get(normalizeName(srcName)) ?? null;

  const clips = [];
  const fileDiags = [];
  const used = new Set();
  const unitsCache = new Map();
  files.forEach((f, fi) => {
    // escala de mundo do rig FONTE (cm sob nó 0,01 → 0,01): converte o
    // rootTravel medido nas tracks para metros — o limiar do "andar no
    // lugar" compara com a altura (metros) e vale para qualquer fonte
    const worldScale = worldScaleOf(restMapsFor(f.gltf.scene, unitsCache));

    // pose de descanso da fonte vs a do personagem (braços cruzados/invertidos
    // vêm daqui: T-pose vs A-pose → o rebase descanso→descanso distorce)
    let restPose = null;
    if (f.gltf.scene !== model.scene) {
      const cmp = compareRestPose(f.gltf.scene, model.scene, resolveDstName);
      if (cmp) {
        const offenders = cmp.worst.filter((w) => w.deg > REST_POSE_WARN_DEG);
        restPose = {
          pairs: cmp.pairs,
          maxDeg: cmp.worst[0]?.deg ?? 0,
          mismatch: offenders.length > 0,
          worst: offenders.slice(0, 4),
        };
      }
    }
    fileDiags.push({ file: fi, source: basename(f.path), restPose });

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
        matchedTracks: countMatched(clip, f.gltf.scene !== model.scene),
        rootTravel: +(measureRootTravel(clip, model.rootBoneNames) * worldScale).toFixed(4),
        // ossos core do DESTINO sem movimento neste clipe ("perna manca"
        // detectável antes do bake), agrupados por região
        frozen: frozenBonesByRegion(clip, model, normMap),
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
    // diagnósticos por arquivo (restPose: null quando não comparável)
    fileDiags,
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

  // 4c. pé no chão POR CLIPE: o menor Y skinado de CADA clipe deve ficar em
  // ≈0 (ou no yOffset manual) — regressão do bug "base GLB + anim FBX afunda
  // (chão na cintura)": retarget sem rebase de posições deixava um clipe
  // ~0,9 m abaixo dos outros.
  for (const clip of desc.clips) {
    let yMin = Infinity;
    for (let r = clip.rowStart; r < clip.rowEnd; r++) {
      const base = r * w * 3;
      for (let cIdx = 0; cIdx < w; cIdx++) {
        const y = posF[base + cIdx * 3 + 1];
        if (y < yMin) yMin = y;
      }
    }
    const expected = clip.yOffset ?? 0;
    Math.abs(yMin - expected) <= 0.01
      ? ok(
          `pé no chão em "${clip.name}" (ymin=${yMin.toFixed(4)}${expected ? `, offset manual ${expected}` : ""})`,
        )
      : bad(
          `clipe "${clip.name}" fora do chão: ymin=${yMin.toFixed(4)}, esperava ≈${expected} — ` +
            `retarget de fonte com unidades/eixos diferentes? (caso típico: anim FBX sobre rig GLB)`,
        );
  }

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

  // 5b. juntas congeladas: detecção autoritativa acontece no BAKE (variância
  // ~0 na track de um osso core em clipe de movimento — frozenBonesByRegion)
  // e fica persistida em clips[].frozenRegions; aqui o selftest cobra.
  for (const clip of desc.clips) {
    if (!clip.frozenRegions || Object.keys(clip.frozenRegions).length === 0) {
      ok(`sem juntas congeladas em "${clip.name}"`);
      continue;
    }
    bad(
      `"${clip.name}" assado com membro congelado: ${Object.entries(clip.frozenRegions)
        .map(([r, b]) => `${r} (${b.join(", ")})`)
        .join(" · ")} — a fonte não anima esses ossos ("perna manca"); refaça o download/export com o esqueleto completo`,
    );
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
