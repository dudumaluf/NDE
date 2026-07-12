/**
 * VAT Studio — frontend (vanilla ESM, sem build).
 *
 * O browser é responsável por: preview 3D (three.js servido de node_modules),
 * lista de clipes (ordem/nome/modo), presets de intenção e o painel de
 * orçamento com semáforos. Os números autoritativos vêm do servidor
 * (/api/analyze e /api/estimate rodam o MESMO código do bake); o bake em si
 * roda no servidor com progresso via SSE.
 */

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";
// mesmos módulos que o servidor usa no bake — preview e resultado batem
import { mergeClips, mergedDuration, DEFAULT_MERGE_FADE } from "/merge-clips.mjs";
import {
  isFbxBinary,
  normalizeFbxResult,
  neutralizeFbxMaterials,
  translateFbxError,
} from "/fbx-normalize.mjs";

/* ------------------------------------------------------------------------ */
/* Constantes de orçamento (espelham vat-core.mjs e os limites web reais)    */

const MAX_TEXTURE_WIDTH = 8192; // limite duro de colunas (WebGPU default)
const TEX_GREEN = 2048;
const TEX_YELLOW = 4096;
const WEIGHT_GREEN = 8 * 1024 * 1024;
const WEIGHT_YELLOW = 20 * 1024 * 1024;
const PATCH_REFERENCE_VERTS = 1590; // personagem original do patch (colunas)

const PRESETS = {
  multidao: {
    fps: 18,
    frames: 60,
    vertsGreen: 2500,
    vertsYellow: 6000,
    label: "multidão",
  },
  personagem: {
    fps: 30,
    frames: 60,
    vertsGreen: 6000,
    vertsYellow: MAX_TEXTURE_WIDTH,
    label: "personagem próximo",
  },
};

const IN_PLACE_TRAVEL_RATIO = 0.1; // deslocamento XZ > 10% da altura → sugerir "no lugar"

/* ------------------------------------------------------------------------ */
/* Helpers                                                                   */

const $ = (id) => document.getElementById(id);
const esc = (s) =>
  String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmtN = (n) => Number(n).toLocaleString("pt-BR");
const fmtMB = (b) =>
  b >= 1 << 20 ? `${(b / (1 << 20)).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`;
const normName = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const stripExt = (s) => s.replace(/\.(glb|gltf)$/i, "");

async function api(path, opts = {}) {
  const r = await fetch(path, opts);
  const j = await r.json().catch(() => ({ error: `HTTP ${r.status}` }));
  if (!r.ok) throw new Error(j.error ?? `HTTP ${r.status}`);
  return j;
}

/* ------------------------------------------------------------------------ */
/* Estado                                                                    */

const state = {
  session: null,
  files: [], // [{name, size, gltf}] — mesma ordem no servidor (índice = file)
  analysis: null, // resposta do /api/analyze (números autoritativos)
  // Linhas da lista de clipes. Duas formas:
  //  simples:   {kind:"simple", key, baseKey, file, clip, name, mode, enabled, inPlace, duration, rootTravel, source, travels}
  //             (key é única; baseKey = "file:clip" — duplicatas compartilham baseKey)
  //  combinado: {kind:"combo",  key, parts:[{file,clip}], fade, name, mode, enabled, inPlace, travels}
  clips: [],
  deleted: new Set(), // baseKeys sem nenhuma linha restante (não ressuscitar na re-análise)
  selected: new Set(), // keys marcadas para combinar
  comboFade: DEFAULT_MERGE_FADE,
  comboSeq: 0,
  dupSeq: 0,
  assets: [], // exports existentes em public/vat/ (com meshHash p/ morfabilidade)
  preset: "multidao",
  frames: 60,
  fps: 18,
  height: 0.7,
  maxVerts: 0, // 0 = sem decimação
  estimate: null, // resposta do /api/estimate quando maxVerts > 0
  baking: false,
  currentClip: -1,
};

/** Análise do clipe fonte (duration/rootTravel/source) por referência file:clip. */
const sourceInfo = (file, clip) =>
  state.analysis?.clips.find((c) => c.file === file && c.clip === clip) ?? null;

/** Duração exibida de uma linha (combos: soma − overlaps, igual ao bake). */
function rowDuration(row) {
  if (row.kind !== "combo") return row.duration;
  const durs = row.parts.map((p) => sourceInfo(p.file, p.clip)?.duration ?? 0);
  return mergedDuration(durs, row.fade);
}

/* ------------------------------------------------------------------------ */
/* Preview 3D                                                                */

const view = {
  ready: false,
  renderer: null,
  scene: null,
  camera: null,
  controls: null,
  clock: new THREE.Clock(),
  chars: [], // [{root, mixer, kind: "original"|"reduzida"}]
};

function setupView() {
  if (view.ready) return;
  view.ready = true;
  const canvas = $("viewport");
  view.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  view.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  view.scene = new THREE.Scene();
  view.scene.background = new THREE.Color(0x6d6d6d); // eco do app (ClearColor 0.427)
  view.scene.fog = new THREE.Fog(0x6d6d6d, 8, 26);
  view.camera = new THREE.PerspectiveCamera(40, 4 / 3.1, 0.05, 100);
  view.controls = new OrbitControls(view.camera, canvas);
  view.controls.enableDamping = true;

  view.scene.add(new THREE.HemisphereLight(0xd8dde6, 0x46413c, 1.0));
  const key = new THREE.DirectionalLight(0xfff1de, 1.7);
  key.position.set(4, 6, 3);
  view.scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fb4ff, 0.45);
  rim.position.set(-5, 3, -4);
  view.scene.add(rim);

  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(40, 64).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x616161, roughness: 0.95 }),
  );
  view.scene.add(ground);
  const grid = new THREE.GridHelper(30, 60, 0x7c7c7c, 0x686868);
  grid.position.y = 0.002;
  view.scene.add(grid);

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w && h) {
      view.renderer.setSize(w, h, false);
      view.camera.aspect = w / h;
      view.camera.updateProjectionMatrix();
    }
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  (function loop() {
    requestAnimationFrame(loop);
    const dt = view.clock.getDelta();
    for (const c of view.chars) c.mixer?.update(dt);
    view.controls.update();
    view.renderer.render(view.scene, view.camera);
  })();
}

function clearChars() {
  for (const c of view.chars) view.scene.remove(c.root);
  view.chars = [];
  $("viewlabels").classList.add("hidden");
}

/** Índices reduzidos (do /api/estimate) aplicados nos SkinnedMesh do clone. */
function applyReducedIndices(root, meshesFromServer) {
  const skinned = [];
  root.traverse((o) => {
    if (o.isSkinnedMesh) skinned.push(o);
  });
  meshesFromServer.forEach((m, i) => {
    const target = skinned[m.order] ?? skinned[i];
    if (!target) return;
    const g = target.geometry.clone();
    g.setIndex(new THREE.BufferAttribute(new Uint32Array(m.indices), 1));
    target.geometry = g;
  });
}

const charFile = () => state.files[state.analysis?.charIndex ?? 0] ?? null;

/** Recria os personagens do preview (original e, se houver, o reduzido ao lado). */
function rebuildPreview() {
  setupView();
  clearChars();
  const char = charFile();
  if (!char) return;

  const compare = Boolean(state.estimate?.meshes) && $("decimToggle").checked;
  const variants = compare
    ? [
        { kind: "original", label: `original · ${fmtN(state.analysis.triangles)} tris` },
        {
          kind: "reduzida",
          label: `reduzida · ${fmtN(state.estimate.after.triangles)} tris`,
          meshes: state.estimate.meshes,
        },
      ]
    : [{ kind: "original", label: null }];

  const srcBox = new THREE.Box3().setFromObject(char.gltf.scene);
  const size = srcBox.getSize(new THREE.Vector3());
  const h = Math.max(size.y, 1e-3);
  const spacing = Math.max(size.x, h * 0.6) * 1.2;

  variants.forEach((variant, i) => {
    const root = cloneSkinned(char.gltf.scene);
    const box = new THREE.Box3().setFromObject(root);
    const center = box.getCenter(new THREE.Vector3());
    root.position.set(-center.x, -box.min.y, -center.z);
    if (variants.length === 2) root.position.x += (i === 0 ? -1 : 1) * (spacing / 2);
    if (variant.meshes) applyReducedIndices(root, variant.meshes);
    root.traverse((o) => {
      if (o.isMesh && o.material) {
        o.material = Array.isArray(o.material) ? o.material.map((m) => m.clone()) : o.material.clone();
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          m.wireframe = $("wire").checked;
          m.side = THREE.DoubleSide;
        }
      }
    });
    view.scene.add(root);
    view.chars.push({ root, mixer: new THREE.AnimationMixer(root), kind: variant.kind });
  });

  // rótulos "original / reduzida" sobre o canvas
  const labels = $("viewlabels");
  labels.classList.toggle("hidden", variants.length < 2);
  if (variants.length === 2)
    labels.innerHTML = variants
      .map(
        (v) =>
          `<span style="background:rgba(16,17,20,.75);border:1px solid #2a2c33;color:#8b8d95;` +
          `border-radius:99px;padding:2px 12px;font-size:11px">${esc(v.label)}</span>`,
      )
      .join("");

  view.controls.target.set(0, h * 0.52, 0);
  const dist = Math.max(h * 2.1, variants.length === 2 ? spacing * 1.9 : h * 1.6, 1.4);
  view.camera.position.set(dist * 0.62, h * 0.72, dist);

  const first = state.clips.findIndex((c) => c.enabled && c.preview);
  playClip(state.currentClip >= 0 && state.clips[state.currentClip]?.preview ? state.currentClip : first);
}

/** Retarget leve no browser (mesma regra do vat-core): tracks → nós do personagem. */
function buildPartClip(fileIdx, clipIdx, inPlace, name) {
  const charScene = charFile()?.gltf.scene;
  const raw = state.files[fileIdx]?.gltf.animations?.[clipIdx];
  if (!charScene || !raw) return null;

  const nodeNames = new Set();
  charScene.traverse((o) => {
    if (o.name) nodeNames.add(o.name);
  });
  const normMap = new Map();
  for (const n of nodeNames) {
    const k = normName(n);
    normMap.set(k, normMap.has(k) ? null : n);
  }

  const rootBones = new Set();
  charScene.traverse((o) => {
    if (o.isBone && !o.parent?.isBone) rootBones.add(o.name);
  });

  const kept = [];
  for (const track of raw.tracks) {
    const dot = track.name.lastIndexOf(".");
    const nodeName = track.name.slice(0, dot);
    let finalName = null;
    if (nodeNames.has(nodeName)) finalName = nodeName;
    else {
      const remap = normMap.get(normName(nodeName));
      if (remap) finalName = remap;
    }
    if (!finalName) continue;
    const t = track.clone();
    t.name = finalName + track.name.slice(dot);
    // preview do "anda no lugar": congela XZ da raiz, como o bake fará
    if (inPlace && t.name.endsWith(".position") && rootBones.has(finalName)) {
      const v = t.values;
      for (let i = 0; i < v.length; i += 3) {
        v[i] = v[0] ?? 0;
        v[i + 2] = v[2] ?? 0;
      }
    }
    kept.push(t);
  }
  if (kept.length === 0) return null;
  return new THREE.AnimationClip(name, raw.duration, kept);
}

/** "Anda no lugar" num clipe pronto (combos: depois do merge, como no bake). */
function stripRootXZ(clip) {
  const charScene = charFile()?.gltf.scene;
  if (!charScene) return;
  const rootBones = new Set();
  charScene.traverse((o) => {
    if (o.isBone && !o.parent?.isBone) rootBones.add(o.name);
  });
  for (const t of clip.tracks) {
    const dot = t.name.lastIndexOf(".");
    if (t.name.slice(dot) !== ".position" || !rootBones.has(t.name.slice(0, dot))) continue;
    const v = t.values;
    for (let i = 0; i < v.length; i += 3) {
      v[i] = v[0] ?? 0;
      v[i + 2] = v[2] ?? 0;
    }
  }
}

/** Clipe de preview de uma linha: simples direto; combo = mergeClips (mesmo motor do bake). */
function buildPreviewClip(entry) {
  if (entry.kind !== "combo")
    return buildPartClip(entry.file, entry.clip, entry.inPlace, entry.name);
  const parts = entry.parts
    .map((p, i) => buildPartClip(p.file, p.clip, false, `${entry.name}_${i}`))
    .filter(Boolean);
  let merged = null;
  if (parts.length >= 2) {
    try {
      merged = mergeClips(parts, { name: entry.name, fade: entry.fade });
    } catch {
      merged = parts[0];
    }
  } else merged = parts[0] ?? null;
  if (merged && entry.inPlace) stripRootXZ(merged);
  return merged;
}

function playClip(idx) {
  const entry = state.clips[idx];
  if (!entry) return;
  state.currentClip = idx;
  const clip = buildPreviewClip(entry);
  for (const c of view.chars) {
    c.mixer.stopAllAction();
    if (!clip) continue;
    const action = c.mixer.clipAction(clip.clone());
    action.setLoop(entry.mode === "loop" ? THREE.LoopRepeat : THREE.LoopOnce, Infinity);
    action.clampWhenFinished = true;
    action.play();
  }
  renderClips();
}

/* ------------------------------------------------------------------------ */
/* Upload + análise                                                          */

const loader = new GLTFLoader();
const fbxLoader = new FBXLoader();
// materiais/texturas não entram no bake — nenhum handler tenta baixar
// texturas referenciadas pelo FBX (arquivos que não existem aqui)
fbxLoader.manager.addHandler(/.*/i, {
  path: "",
  setPath() {
    return this;
  },
  load: () => new THREE.Texture(),
});

/** Parse de um arquivo para o preview (mesma normalização do bake no servidor). */
async function parsePreviewFile(name, buf) {
  if (/\.fbx$/i.test(name)) {
    if (!isFbxBinary(buf))
      console.warn(`${name}: não é FBX binário — tentando como ASCII (só FBX 7.x ASCII funciona)`);
    let group;
    try {
      group = fbxLoader.parse(buf, "");
    } catch (e) {
      throw new Error(
        isFbxBinary(buf)
          ? translateFbxError(e, name)
          : `${name}: FBX ASCII não suportado — re-exporte como FBX binário (padrão do Mixamo atual) ou converta para GLB`,
      );
    }
    const norm = normalizeFbxResult(group, (m) => console.warn(`${name}: ${m}`));
    neutralizeFbxMaterials(norm.scene);
    return { scene: norm.scene, animations: norm.animations };
  }
  return new Promise((res, rej) => loader.parse(buf.slice(0), "", res, rej));
}

async function addFiles(fileList) {
  const files = [...fileList].filter((f) => /\.(glb|gltf|fbx)$/i.test(f.name));
  const rejected = [...fileList].filter((f) => !/\.(glb|gltf|fbx)$/i.test(f.name));
  if (rejected.length)
    alert(
      `Ignorado(s): ${rejected.map((f) => f.name).join(", ")}\n` +
        `Formatos aceitos: GLB/GLTF e FBX binário (Mixamo direto — guia no rodapé da página).`,
    );
  if (files.length === 0) return;

  for (const f of files) {
    try {
      const buf = await f.arrayBuffer();
      // parse local PRIMEIRO: arquivo que o preview rejeita não sobe para a
      // sessão (um upload inválido envenenaria o /api/analyze de todos)
      const gltf = await parsePreviewFile(f.name, buf);
      await api(`/api/upload?session=${state.session}&name=${encodeURIComponent(f.name)}`, {
        method: "PUT",
        body: buf,
      });
      state.files.push({ name: f.name, size: f.size, gltf });
    } catch (e) {
      const msg = String(e.message ?? e);
      alert(
        (msg.startsWith(f.name) ? msg : `${f.name}: ${msg}`) +
          "\n" +
          (/\.fbx$/i.test(f.name)
            ? "(FBX: o Mixamo atual exporta binário 7.x, suportado; ASCII/6.x não)"
            : "(dica: re-exporte sem compressão Draco/Meshopt)"),
      );
    }
  }
  if (state.files.length === 0) return;

  $("drop").classList.add("hidden");
  $("work").classList.remove("hidden");

  await analyze();
}

async function analyze() {
  try {
    state.analysis = await api(`/api/analyze?session=${state.session}`, { method: "POST" });
  } catch (e) {
    alert(`Análise falhou: ${e.message}`);
    return;
  }
  // Reconstrói a lista preservando edições (nome/modo/ordem), combos e
  // deleções — chaves: simples = "file:clip", combo = "combo<N>".
  const prev = new Map(state.clips.map((c) => [c.key, c]));
  const height = state.analysis.bindHeight || 1;
  const fresh = state.analysis.clips
    .filter((c) => !state.deleted.has(`${c.file}:${c.clip}`))
    .map((c) => {
      const key = `${c.file}:${c.clip}`;
      const old = prev.get(key);
      const travels = c.rootTravel > height * IN_PLACE_TRAVEL_RATIO;
      return {
        ...c,
        kind: "simple",
        key,
        baseKey: key,
        name: old?.name ?? c.name,
        mode: old?.mode ?? "loop",
        // esqueleto incompatível (0 tracks casam) nasce desmarcado
        enabled: old?.enabled ?? c.matchedTracks > 0,
        inPlace: old?.inPlace ?? travels,
        travels,
        preview: true,
      };
    });
  // duplicatas e combos sobrevivem se o(s) clipe(s) fonte ainda existem
  const clipExists = (p) =>
    state.analysis.clips.some((a) => a.file === p.file && a.clip === p.clip);
  const dups = state.clips.filter(
    (c) => c.kind === "simple" && c.key !== c.baseKey && clipExists(c),
  );
  const combos = state.clips.filter(
    (c) => c.kind === "combo" && c.parts.every(clipExists),
  );
  state.clips = [...fresh, ...dups, ...combos];
  const order = new Map([...prev.keys()].map((k, i) => [k, i]));
  state.clips.sort((a, b) => (order.get(a.key) ?? 1e9) - (order.get(b.key) ?? 1e9));
  state.selected.clear();

  if (!$("assetName").value && charFile())
    $("assetName").value = stripExt(charFile().name)
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);

  state.estimate = null;
  state.maxVerts = 0;
  $("maxverts").value = 0;
  $("decimToggleWrap").style.display = "none";

  renderAll();
  rebuildPreview();
  loadAssets(); // re-render com o badge "morfável" (depende do meshHash da análise)
}

/* ------------------------------------------------------------------------ */
/* Decimação (estimativa exata via servidor)                                 */

let estimateBusy = false;

async function requestEstimate(maxVerts) {
  if (estimateBusy) return;
  estimateBusy = true;
  $("meshinfo").textContent = "reduzindo malha…";
  try {
    state.maxVerts = maxVerts;
    $("maxverts").value = maxVerts;
    state.estimate =
      maxVerts > 0
        ? await api(`/api/estimate?session=${state.session}`, {
            method: "POST",
            body: JSON.stringify({ maxVerts }),
          })
        : null;
    const has = Boolean(state.estimate?.decimation);
    $("decimToggleWrap").style.display = has ? "" : "none";
    if (has) $("decimToggle").checked = true;
  } catch (e) {
    alert(`Redução falhou: ${e.message}`);
    state.maxVerts = 0;
    state.estimate = null;
    $("maxverts").value = 0;
  } finally {
    estimateBusy = false;
    renderAll();
    rebuildPreview();
    loadAssets(); // meshHash muda com a decimação — badge "morfável" acompanha
  }
}

/* ------------------------------------------------------------------------ */
/* Orçamento                                                                 */

function effectiveCounts() {
  const a = state.analysis;
  if (!a) return null;
  const unique = state.estimate?.after.uniqueVerts ?? a.uniqueVerts;
  const soup = (state.estimate?.after.triangles ?? a.triangles) * 3;
  // paridade com decideTopology: indexed sempre que compartilha vértices
  const topology = unique < soup ? "indexed" : "soup";
  const width = topology === "indexed" ? unique : soup;
  const clipCount = state.clips.filter((c) => c.enabled).length;
  const rows = clipCount * state.frames;
  const bytes = rows * width * 3 * 2 * 2 + (topology === "indexed" ? soup * 4 : 0);
  return { unique, soup, triangles: soup / 3, topology, width, clipCount, rows, bytes };
}

const grade = (v, green, yellow) => (v <= green ? "g" : v <= yellow ? "y" : "r");
const worst = (grades) => (grades.includes("r") ? "r" : grades.includes("y") ? "y" : "g");

function renderBudget() {
  const c = effectiveCounts();
  const statsEl = $("budgetStats");
  const lightsEl = $("lights");
  const verdictEl = $("verdict");
  if (!c) {
    statsEl.innerHTML = "";
    lightsEl.innerHTML = "";
    verdictEl.textContent = "carregue um GLB com personagem para ver o orçamento";
    $("bakeBtn").disabled = true;
    return;
  }
  const p = PRESETS[state.preset];

  statsEl.innerHTML = [
    [fmtN(c.width), "vértices (colunas)"],
    [fmtN(c.rows), `frames (${c.clipCount || "0"} clipes × ${state.frames})`],
    [`${fmtN(c.width)}×${fmtN(c.rows)}`, "textura resultante"],
    [fmtMB(c.bytes), "download estimado"],
  ]
    .map(([b, s]) => `<div class="stat"><b>${b}</b><span>${esc(s)}</span></div>`)
    .join("");

  const gVerts = grade(c.width, p.vertsGreen, p.vertsYellow);
  const gTex = c.width > MAX_TEXTURE_WIDTH ? "r" : grade(Math.max(c.width, c.rows), TEX_GREEN, TEX_YELLOW);
  const gPeso = grade(c.bytes, WEIGHT_GREEN, WEIGHT_YELLOW);

  const lights = [];
  lights.push(
    light(
      gVerts,
      `Malha: <b>${fmtN(c.width)}</b> vértices desenhados por pessoa (${fmtN(c.triangles)} triângulos)`,
      gVerts === "g"
        ? `Leve o bastante para milhares de instâncias — o personagem original do patch usa ${fmtN(PATCH_REFERENCE_VERTS)}.`
        : gVerts === "y"
          ? `Funciona, mas limita o tamanho da multidão (referência: o personagem original usa ${fmtN(PATCH_REFERENCE_VERTS)}).`
          : `Pesado demais para ${p.label} — cada cópia custa isso por frame (original: ${fmtN(PATCH_REFERENCE_VERTS)}).`,
      gVerts !== "g" && !state.estimate
        ? { label: `reduzir malha para ~${fmtN(p.vertsGreen)} vértices (1 clique)`, action: "decimate" }
        : null,
    ),
  );
  lights.push(
    light(
      gTex,
      `Textura: <b>${fmtN(c.width)} × ${fmtN(c.rows)}</b> px (${c.topology === "indexed" ? "indexada" : "soup"}, float16)`,
      c.width > MAX_TEXTURE_WIDTH
        ? `Estoura o limite absoluto de ${fmtN(MAX_TEXTURE_WIDTH)} colunas — o bake vai recusar. Reduza a malha.`
        : gTex === "g"
          ? "Dimensões confortáveis para qualquer GPU (inclusive celular)."
          : gTex === "y"
            ? "Acima de 2.048 px: ainda ok em desktop, mas não cresça mais."
            : "Acima de 4.096 px: GPUs modestas e celulares começam a sofrer.",
      null,
    ),
  );
  lights.push(
    light(
      gPeso,
      `Download: <b>${fmtMB(c.bytes)}</b> (posições + normais${c.topology === "indexed" ? " + índices" : ""})`,
      gPeso === "g"
        ? "Leve — carrega rápido até em conexão mediana."
        : gPeso === "y"
          ? "Aceitável, mas perceptível em conexões lentas."
          : "Pesado para web — corte frames por clipe ou reduza a malha.",
      gPeso !== "g" && state.frames > 30
        ? { label: `usar 30 frames por clipe (hoje: ${state.frames})`, action: "frames30" }
        : null,
    ),
  );
  if (state.estimate?.decimation) {
    const d = state.estimate.decimation;
    lights.push(
      light(
        "g",
        `Redução aplicada: <b>${fmtN(d.from)} → ${fmtN(d.to)}</b> vértices (desvio geométrico ${(d.error * 100).toFixed(1)}%)`,
        "Compare no preview (lado a lado). O bake usará a malha reduzida.",
        { label: "desfazer redução", action: "undo" },
      ),
    );
  }
  lightsEl.innerHTML = lights.join("");
  lightsEl.querySelectorAll("button[data-action]").forEach((b) =>
    b.addEventListener("click", () => {
      if (b.dataset.action === "decimate") requestEstimate(PRESETS[state.preset].vertsGreen);
      if (b.dataset.action === "undo") requestEstimate(0);
      if (b.dataset.action === "frames30") {
        state.frames = 30;
        $("frames").value = 30;
        renderBudget();
      }
    }),
  );

  const overall = worst([gVerts, gTex, gPeso]);
  const summary = `${fmtN(c.width)}×${fmtN(c.rows)} px · ${fmtMB(c.bytes)} · ${c.clipCount} clipe(s) @ ${state.fps} fps`;
  verdictEl.style.borderColor = overall === "g" ? "#34493a" : overall === "y" ? "#4a4436" : "#4a3636";
  verdictEl.style.color = overall === "g" ? "var(--pos)" : overall === "y" ? "var(--warn)" : "var(--bad)";
  verdictEl.textContent =
    (overall === "g"
      ? "Tudo verde — pode gerar. "
      : overall === "y"
        ? "Dá para gerar, com as ressalvas acima. "
        : "Vai funcionar mal (ou falhar) — use as correções de 1 clique acima. ") + summary;

  $("bakeBtn").disabled =
    state.baking || c.clipCount === 0 || c.width > MAX_TEXTURE_WIDTH || c.unique > MAX_TEXTURE_WIDTH;
}

function light(g, title, desc, fix) {
  return (
    `<div class="light"><span class="dot ${g}"></span><div>` +
    `<div class="t">${title}</div><div class="d">${esc(desc)}</div>` +
    (fix ? `<div class="fix"><button data-action="${fix.action}">${esc(fix.label)}</button></div>` : "") +
    `</div></div>`
  );
}

/* ------------------------------------------------------------------------ */
/* Arquivos e clipes                                                         */

function renderFiles() {
  const ci = state.analysis?.charIndex ?? 0;
  $("files").innerHTML =
    state.files
      .map(
        (f, i) =>
          `<div class="file"><span class="tag">${i === ci ? "personagem" : "animação"}</span>` +
          `<span class="n">${esc(f.name)}</span><span class="s">${fmtMB(f.size)}</span></div>`,
      )
      .join("") || `<span class="empty">nenhum arquivo</span>`;
  const warns = state.analysis?.warnings ?? [];
  if (warns.length)
    $("files").insertAdjacentHTML(
      "beforeend",
      warns.map((w) => `<div class="file"><span class="s" style="color:var(--warn)">⚠ ${esc(w)}</span></div>`).join(""),
    );
}

let dragFrom = null;

/** Remove uma linha (fonte é lembrada em deleted quando nenhuma linha sobra). */
function deleteRow(i) {
  const row = state.clips[i];
  if (!row) return;
  state.selected.delete(row.key);
  const cur = state.clips[state.currentClip];
  state.clips.splice(i, 1);
  if (row.kind === "simple" && !state.clips.some((c) => c.baseKey === row.baseKey))
    state.deleted.add(row.baseKey);
  state.currentClip = state.clips.indexOf(cur);
  if (state.currentClip < 0 && state.clips.length) playClip(0);
  renderAll();
}

/** Duplica uma linha simples (ex.: idle 2× para um combo idle+olhar+idle). */
function duplicateRow(i) {
  const row = state.clips[i];
  if (row?.kind !== "simple") return;
  const usedNames = new Set(state.clips.map((c) => c.name.toLowerCase()));
  let name = `${row.name}_2`;
  for (let n = 3; usedNames.has(name.toLowerCase()); n++) name = `${row.name}_${n}`;
  state.clips.splice(i + 1, 0, {
    ...row,
    key: `${row.baseKey}#d${state.dupSeq++}`,
    name,
  });
  renderAll();
}

/** Combina as linhas selecionadas em UM clipe contínuo (ordem = ordem de marcação). */
function combineSelected() {
  const rows = [...state.selected]
    .map((key) => state.clips.find((c) => c.key === key))
    .filter(Boolean);
  if (rows.length < 2) return;
  const fade = state.comboFade;
  const parts = rows.flatMap((r) => (r.kind === "combo" ? r.parts : [{ file: r.file, clip: r.clip }]));
  const first = state.clips.findIndex((c) => state.selected.has(c.key));
  const usedNames = new Set(state.clips.map((c) => c.name.toLowerCase()));
  let name = rows.map((r) => r.name).join("+").slice(0, 40);
  for (let n = 2; usedNames.has(name.toLowerCase()); n++) name = `combo_${n}`;
  const combo = {
    kind: "combo",
    key: `combo${state.comboSeq++}`,
    parts,
    fade,
    name,
    mode: "loop",
    enabled: true,
    inPlace: rows.some((r) => r.travels && r.inPlace),
    travels: rows.some((r) => r.travels),
    preview: true,
  };
  state.clips = state.clips.filter((c) => !state.selected.has(c.key));
  state.clips.splice(first, 0, combo);
  state.selected.clear();
  renderAll();
  playClip(state.clips.indexOf(combo));
}

/** Desfaz um combo: restaura as partes como linhas simples na mesma posição. */
function splitCombo(i) {
  const row = state.clips[i];
  if (row?.kind !== "combo") return;
  const height = state.analysis?.bindHeight || 1;
  const taken = new Set(state.clips.map((c) => c.key));
  const usedNames = new Set(state.clips.map((c) => c.name.toLowerCase()));
  const restored = [];
  for (const p of row.parts) {
    const baseKey = `${p.file}:${p.clip}`;
    if (taken.has(baseKey)) continue; // a fonte já está na lista — não duplica
    const src = sourceInfo(p.file, p.clip);
    const travels = (src?.rootTravel ?? 0) > height * IN_PLACE_TRAVEL_RATIO;
    let name = src?.name ?? "clipe";
    for (let n = 2; usedNames.has(name.toLowerCase()); n++) name = `${src?.name ?? "clipe"}_${n}`;
    usedNames.add(name.toLowerCase());
    taken.add(baseKey);
    restored.push({
      ...(src ?? {}),
      kind: "simple",
      key: baseKey,
      baseKey,
      name,
      mode: "loop",
      enabled: true,
      inPlace: travels,
      travels,
      preview: true,
    });
    state.deleted.delete(baseKey);
  }
  state.clips.splice(i, 1, ...restored);
  renderAll();
}

function renderComboBar() {
  const bar = $("comboBar");
  const n = state.selected.size;
  bar.classList.toggle("hidden", n < 2);
  if (n < 2) return;
  bar.innerHTML =
    `<span><b>${n} clipes</b> marcados — mesclar em um track contínuo, na ordem em que você marcou.
       Para o loop fechar, comece e termine com o mesmo clipe cíclico (⧉ duplica).</span>` +
    `<span class="fadefield">crossfade <input type="number" id="comboFade" value="${state.comboFade}" min="0" max="2" step="0.05" /> s</span>` +
    `<button id="comboGo">combinar</button>`;
  $("comboFade").addEventListener("change", (e) => {
    state.comboFade = Math.min(2, Math.max(0, +e.target.value || 0));
    e.target.value = state.comboFade;
  });
  $("comboGo").addEventListener("click", combineSelected);
}

function renderClips() {
  const el = $("clips");
  $("clipsEmpty").classList.toggle("hidden", state.clips.length > 0);
  renderComboBar();
  el.innerHTML = state.clips
    .map((c, i) => {
      const playing = i === state.currentClip;
      const isCombo = c.kind === "combo";
      const dur = rowDuration(c);
      const partNames = isCombo
        ? c.parts.map((p) => sourceInfo(p.file, p.clip)?.name ?? "?").join(" → ")
        : null;
      return `<div class="clip ${c.enabled ? "" : "off"}" draggable="true" data-i="${i}">
        <div class="row1">
          <span class="grip" title="arraste para reordenar">⋮⋮</span>
          <input type="checkbox" data-k="enabled" data-i="${i}" ${c.enabled ? "checked" : ""} title="incluir no bake" />
          <input class="name" data-k="name" data-i="${i}" value="${esc(c.name)}" spellcheck="false" />
          ${isCombo ? `<span class="combadge" title="${esc(partNames)}">combinado ×${c.parts.length}</span>` : ""}
          <span class="mode">
            <button data-k="mode" data-v="loop" data-i="${i}" class="${c.mode === "loop" ? "on" : ""}"
              title="anda em círculo contínuo (idle, walk…)">loop</button>
            <button data-k="mode" data-v="oneshot" data-i="${i}" class="${c.mode === "oneshot" ? "on" : ""}"
              title="toca uma vez e congela no último frame (morrer, levantar…)">única</button>
          </span>
          <button class="playbtn ${playing ? "on" : ""}" data-k="play" data-i="${i}">${playing ? "▶ tocando" : "▶"}</button>
          ${isCombo ? "" : `<button class="delbtn" data-k="dup" data-i="${i}" title="duplicar a linha — para usar o mesmo clipe 2× num combinado (ex.: idle+olhar+idle)">⧉</button>`}
          <button class="delbtn" data-k="del" data-i="${i}" title="${isCombo ? "remover o combinado da lista" : "remover este clipe da lista (o arquivo fonte não é alterado)"}">×</button>
        </div>
        <div class="meta">
          <span>${dur.toFixed(1)}s ${isCombo ? "combinado" : "na fonte"}</span>
          ${isCombo ? `<span title="${esc(partNames)}">${esc(partNames)}</span>` : `<span>${esc(c.source)}</span>`}
          ${
            !isCombo && c.matchedTracks === 0
              ? `<span style="color:var(--bad)" title="nenhuma track deste clipe casa com os ossos do personagem carregado — foi exportado para outro esqueleto?">✗ esqueleto incompatível</span>`
              : !isCombo && c.matchedTracks < c.tracks
                ? `<span style="color:var(--warn)" title="parte das tracks não casa com os ossos do personagem (nós extras da fonte são ignorados)">${c.matchedTracks}/${c.tracks} tracks casam</span>`
                : ""
          }
          ${
            isCombo
              ? `<span class="fadefield" title="crossfade entre as partes">fade
                   <input type="number" data-k="fade" data-i="${i}" value="${c.fade}" min="0" max="2" step="0.05" /> s</span>
                 <button class="playbtn" data-k="split" data-i="${i}" title="desfazer: volta a ser clipes separados">separar</button>`
              : ""
          }
          ${
            c.travels
              ? `<label class="toggle" title="o clipe desloca a raiz no XZ — o skinning fica no lugar e a trajetória vai para rootMotion no vat.json (a experiência decide aplicá-la)">
                   <input type="checkbox" data-k="inplace" data-i="${i}" ${c.inPlace ? "checked" : ""} /> andar no lugar</label>`
              : ""
          }
          <label class="toggle" title="marcar para combinar com outros clipes">
            <input type="checkbox" data-k="sel" data-i="${i}" ${state.selected.has(c.key) ? "checked" : ""} /> comb.</label>
        </div>
      </div>`;
    })
    .join("");

  el.querySelectorAll("[data-k=enabled]").forEach((x) =>
    x.addEventListener("change", () => {
      state.clips[+x.dataset.i].enabled = x.checked;
      renderAll();
    }),
  );
  el.querySelectorAll("[data-k=name]").forEach((x) => {
    x.addEventListener("change", () => {
      const c = state.clips[+x.dataset.i];
      c.name = x.value.trim() || c.name;
      x.value = c.name;
    });
    x.addEventListener("keydown", (e) => e.key === "Enter" && x.blur());
    x.addEventListener("dragstart", (e) => e.preventDefault());
  });
  el.querySelectorAll("[data-k=mode]").forEach((x) =>
    x.addEventListener("click", () => {
      const c = state.clips[+x.dataset.i];
      c.mode = x.dataset.v;
      if (+x.dataset.i === state.currentClip) playClip(+x.dataset.i);
      renderClips();
    }),
  );
  el.querySelectorAll("[data-k=play]").forEach((x) =>
    x.addEventListener("click", () => playClip(+x.dataset.i)),
  );
  el.querySelectorAll("[data-k=del]").forEach((x) =>
    x.addEventListener("click", () => deleteRow(+x.dataset.i)),
  );
  el.querySelectorAll("[data-k=dup]").forEach((x) =>
    x.addEventListener("click", () => duplicateRow(+x.dataset.i)),
  );
  el.querySelectorAll("[data-k=split]").forEach((x) =>
    x.addEventListener("click", () => splitCombo(+x.dataset.i)),
  );
  el.querySelectorAll("[data-k=fade]").forEach((x) =>
    x.addEventListener("change", () => {
      const c = state.clips[+x.dataset.i];
      c.fade = Math.min(2, Math.max(0, +x.value || 0));
      x.value = c.fade;
      if (+x.dataset.i === state.currentClip) playClip(+x.dataset.i);
      renderBudget();
    }),
  );
  el.querySelectorAll("[data-k=inplace]").forEach((x) =>
    x.addEventListener("change", () => {
      state.clips[+x.dataset.i].inPlace = x.checked;
      if (+x.dataset.i === state.currentClip) playClip(+x.dataset.i);
    }),
  );
  el.querySelectorAll("[data-k=sel]").forEach((x) =>
    x.addEventListener("change", () => {
      const key = state.clips[+x.dataset.i].key;
      if (x.checked) state.selected.add(key);
      else state.selected.delete(key);
      renderComboBar();
    }),
  );
  el.querySelectorAll(".clip[draggable]").forEach((row) => {
    row.addEventListener("dragstart", () => {
      dragFrom = +row.dataset.i;
      row.classList.add("dragging");
    });
    row.addEventListener("dragend", () => {
      dragFrom = null;
      row.classList.remove("dragging");
    });
    row.addEventListener("dragover", (e) => e.preventDefault());
    row.addEventListener("drop", (e) => {
      e.preventDefault();
      const to = +row.dataset.i;
      if (dragFrom === null || dragFrom === to) return;
      const cur = state.clips[state.currentClip];
      const [moved] = state.clips.splice(dragFrom, 1);
      state.clips.splice(to, 0, moved);
      state.currentClip = state.clips.indexOf(cur);
      renderAll();
    });
  });
}

function renderAll() {
  renderFiles();
  renderClips();
  renderBudget();
  const a = state.analysis;
  $("meshinfo").textContent = a
    ? `${a.meshes} malha(s) · ${fmtN(a.uniqueVerts)} vértices · ${fmtN(a.triangles)} tris · ${a.bones} ossos · altura ${a.bindHeight.toFixed(2)}`
    : "";
}

/* ------------------------------------------------------------------------ */
/* Bake                                                                      */

function logLine(text, cls = "") {
  const el = $("log");
  el.classList.remove("hidden");
  el.insertAdjacentHTML("beforeend", `<div class="${cls}">${esc(text)}</div>`);
  el.scrollTop = el.scrollHeight;
}

async function bake() {
  if (state.baking) return;
  const name = $("assetName").value.trim();
  if (!/^[a-z0-9][a-z0-9_-]{0,40}$/i.test(name)) {
    alert("Nome do export inválido — use letras/números/hífen (ex.: meu-heroi). Ele vira a pasta public/vat/<nome>/ e o ?vat=<nome> da URL.");
    return;
  }
  const selection = state.clips
    .filter((c) => c.enabled)
    .map((c) =>
      c.kind === "combo"
        ? { parts: c.parts, fade: c.fade, name: c.name, mode: c.mode, inPlace: c.inPlace }
        : { file: c.file, clip: c.clip, name: c.name, mode: c.mode, inPlace: c.inPlace },
    );
  if (selection.length === 0) return;
  const dupes = selection.map((s) => s.name.toLowerCase());
  if (new Set(dupes).size !== dupes.length) {
    alert("Dois clipes com o mesmo nome — renomeie antes de gerar.");
    return;
  }

  state.baking = true;
  renderBudget();
  $("log").innerHTML = "";
  $("result").classList.add("hidden");
  $("prog").classList.remove("hidden");
  $("prog").value = 0;

  try {
    const { job } = await api(`/api/bake?session=${state.session}`, {
      method: "POST",
      body: JSON.stringify({
        name,
        frames: state.frames,
        fps: state.fps,
        height: state.height,
        maxVerts: state.maxVerts,
        selection,
      }),
    });
    watchJob(job);
  } catch (e) {
    state.baking = false;
    logLine(`erro: ${e.message}`, "err");
    renderBudget();
  }
}

function watchJob(jobId) {
  const es = new EventSource(`/api/events?job=${jobId}`);
  es.onmessage = (m) => {
    const ev = JSON.parse(m.data);
    switch (ev.type) {
      case "start":
        logLine(`assando "${ev.name}" → ${ev.out}/ …`);
        break;
      case "decimate":
        logLine(`malha reduzida: ${fmtN(ev.from)} → ${fmtN(ev.to)} vértices (desvio ${(ev.error * 100).toFixed(1)}%)`);
        break;
      case "plan":
        logLine(`textura ${fmtN(ev.width)}×${fmtN(ev.rows)} (${ev.topology}) · ${ev.entries.length} clipe(s)`);
        for (const e of ev.entries) logLine(`  · ${e.name} (${e.mode === "loop" ? "loop" : "única"}) — ${e.duration.toFixed(2)}s`);
        break;
      case "progress":
        $("prog").value = ev.done / ev.total;
        break;
      case "normalize":
        logLine(`normalizado: pés no chão, altura ${(ev.sourceHeight * ev.scale).toFixed(2)} (escala ${ev.scale.toFixed(3)})`);
        break;
      case "warn":
        logLine(`aviso: ${ev.message}`, "warn");
        break;
      case "done":
        es.close();
        state.baking = false;
        $("prog").value = 1;
        logLine(`pronto em ${ev.seconds}s`, "ok");
        showResult(ev);
        renderBudget();
        loadAssets();
        break;
      case "error":
        es.close();
        state.baking = false;
        logLine(`FALHOU: ${ev.message}`, "err");
        renderBudget();
        break;
    }
  };
}

function showResult(ev) {
  const d = ev.descriptor;
  const total = ev.bytes.positions + ev.bytes.normals + (ev.bytes.indices || 0);
  const okAll = ev.selftest.ok;

  // Morfabilidade entre VATs: exports com o MESMO meshHash endereçam os
  // mesmos vértices — o app pode cruzar crossfade (?vat=a&vatB=b).
  const twins = state.assets.filter((a) => a.meshHash && a.meshHash === d.meshHash && a.name !== ev.name);
  const morphNote = d.meshHash
    ? twins.length
      ? `<div style="font-size:12px;color:var(--pos);margin-top:8px">⇄ Morfável com ${twins
          .map((t) => `<b>${esc(t.name)}</b>`)
          .join(", ")} — mesma malha (meshHash <code style="font-size:10px">${esc(d.meshHash)}</code>): o app pode
          cruzar crossfade entre clipes das duas texturas.</div>`
      : `<div style="font-size:12px;color:var(--dim);margin-top:8px">⇄ Não-morfável com os exports existentes
          (malha diferente — esperado entre personagens diferentes). Outra VAT gerada deste MESMO personagem,
          com a MESMA redução de malha, sai morfável (meshHash <code style="font-size:10px">${esc(d.meshHash)}</code>).</div>`
    : "";
  const rmClips = (d.rootMotion ?? []).map((r) => r.clip);
  const rmNote = rmClips.length
    ? `<div style="font-size:12px;color:var(--dim);margin-top:4px">⇢ Root motion exportado no vat.json
        (${rmClips.map(esc).join(", ")}): o skinning ficou no lugar; a trajetória vai em <b>rootMotion</b>
        para a experiência aplicar como translate quando fizer sentido (one-shots dirigidos).</div>`
    : "";
  const morphUrl = twins.length
    ? `${ev.appUrl}&vatB=${encodeURIComponent(twins[0].name)}`
    : null;

  const el = $("result");
  el.classList.remove("hidden");
  el.classList.toggle("fail", !okAll);
  el.innerHTML = `
    <div class="big">${okAll ? "✓ Texturas geradas e validadas" : "✗ Gerou, mas a validação apontou problemas"}</div>
    <div style="font-size:12.5px;color:var(--dim)">
      ${esc(ev.out)}/ · ${fmtN(d.textureWidth)}×${fmtN(d.textureHeight)} px (${esc(d.topology)}) · ${fmtMB(total)} ·
      clipes: ${d.clips.map((c) => `${esc(c.name)}${c.mode === "oneshot" ? " (única)" : ""}`).join(" · ")}
    </div>
    ${morphNote}${rmNote}
    <ul>${ev.selftest.checks.map((c) => `<li class="${c.ok ? "ok" : "bad"}">${esc(c.label)}</li>`).join("")}</ul>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px">
      <button class="primary" data-open="${esc(ev.appUrl)}">testar na experiência ↗</button>
      <button class="ghost" data-open="${esc(ev.appUrl.replace("&scene=personagem", ""))}">ver na multidão ↗</button>
      ${morphUrl ? `<button class="ghost" data-open="${esc(morphUrl)}">testar morph com ${esc(twins[0].name)} ↗</button>` : ""}
    </div>
    <div style="font-size:11.5px;color:var(--faint);margin-top:10px">
      Como usar: com o app rodando (npm run dev), adicione <b>?vat=${esc(ev.name)}</b> à URL —
      os botões de estado mostram estes clipes. Sem o parâmetro, o app segue com o personagem original do patch.
      ${twins.length ? `Para o morph entre texturas: <b>?vat=${esc(ev.name)}&vatB=${esc(twins[0].name)}</b>.` : ""}
    </div>`;
  el.querySelectorAll("[data-open]").forEach((b) =>
    b.addEventListener("click", () => window.open(b.dataset.open, "_blank")),
  );
}

/* ------------------------------------------------------------------------ */
/* Exports existentes + status do app                                        */

async function loadAssets() {
  try {
    const { assets } = await api("/api/assets");
    state.assets = assets;
    const hash = currentMeshHash();
    $("assets").innerHTML = assets.length
      ? assets
          .map(
            (a) =>
              `<div class="a"><b>${esc(a.name)}</b>` +
              `<span>${fmtN(a.width)}×${fmtN(a.height)} · ${a.clips.map(esc).join(", ")}</span>` +
              (hash && a.meshHash === hash
                ? `<span class="combadge" title="mesma malha (meshHash ${esc(a.meshHash)}) — o app pode cruzar crossfade entre esta VAT e a que você vai gerar">morfável</span>`
                : "") +
              `<span class="sp"></span>` +
              `<a href="http://localhost:5199/?vat=${encodeURIComponent(a.name)}&scene=personagem" target="_blank">abrir ↗</a></div>`,
          )
          .join("")
      : `<span class="empty">nenhum ainda — o primeiro sai em public/vat/&lt;nome&gt;/</span>`;
  } catch {
    $("assets").innerHTML = `<span class="empty">não deu para listar</span>`;
  }
}

/** meshHash que o bake atual gravaria (decimação muda o hash). */
function currentMeshHash() {
  return state.estimate?.meshHash ?? (state.maxVerts > 0 ? null : state.analysis?.meshHash) ?? null;
}

/** Exports existentes que compartilham a malha do bake atual (morfáveis). */
function morphableAssets(excludeName = null) {
  const hash = currentMeshHash();
  if (!hash) return [];
  return state.assets.filter((a) => a.meshHash === hash && a.name !== excludeName);
}

async function pollDev() {
  try {
    const { up, url } = await api("/api/devserver");
    const el = $("dev");
    el.classList.toggle("up", up);
    el.innerHTML = up
      ? `<i></i>app no ar — <a href="${esc(url)}" target="_blank" style="color:inherit">${esc(url.replace("http://", ""))}</a>`
      : `<i></i>app parado (npm run dev)`;
  } catch {
    /* studio caiu — o próximo poll tenta de novo */
  }
}

/* ------------------------------------------------------------------------ */
/* Wire-up                                                                   */

function bindDrop(el) {
  el.addEventListener("click", () => $("filepick").click());
  el.addEventListener("dragover", (e) => {
    e.preventDefault();
    el.classList.add("over");
  });
  el.addEventListener("dragleave", () => el.classList.remove("over"));
  el.addEventListener("drop", (e) => {
    e.preventDefault();
    el.classList.remove("over");
    if (e.dataTransfer?.files?.length) addFiles(e.dataTransfer.files);
  });
}

bindDrop($("drop"));
bindDrop($("dropMore"));
$("filepick").addEventListener("change", (e) => {
  addFiles(e.target.files);
  e.target.value = "";
});

document.querySelectorAll(".preset").forEach((p) =>
  p.addEventListener("click", () => {
    document.querySelectorAll(".preset").forEach((x) => x.classList.toggle("on", x === p));
    state.preset = p.dataset.preset;
    state.fps = PRESETS[state.preset].fps;
    state.frames = PRESETS[state.preset].frames;
    $("fps").value = state.fps;
    $("frames").value = state.frames;
    renderBudget();
  }),
);

$("frames").addEventListener("change", (e) => {
  state.frames = Math.min(512, Math.max(2, Math.round(+e.target.value || 60)));
  e.target.value = state.frames;
  renderBudget();
});
$("fps").addEventListener("change", (e) => {
  state.fps = Math.min(120, Math.max(1, +e.target.value || 18));
  e.target.value = state.fps;
  renderBudget();
});
$("height").addEventListener("change", (e) => {
  state.height = Math.max(0, +e.target.value || 0.7);
  e.target.value = state.height;
});
$("maxverts").addEventListener("change", (e) => {
  const v = Math.max(0, Math.round(+e.target.value || 0));
  requestEstimate(v);
});
$("wire").addEventListener("change", rebuildPreview);
$("decimToggle").addEventListener("change", rebuildPreview);
$("bakeBtn").addEventListener("click", bake);

(async function init() {
  const { session } = await api("/api/session", { method: "POST" });
  state.session = session;
  loadAssets();
  pollDev();
  setInterval(pollDev, 5000);
})();
