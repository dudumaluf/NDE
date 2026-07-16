/**
 * fold-container-tracks — animações Mixamo "Without Skin" (e rigs custom) costumam
 * chavear queda/root motion num container que NÃO é osso (Mixamo: Armature;
 * rigs Blender: low_poly_base_mesh, etc.). O retarget só aplica ossos e
 * descartava essas tracks.
 *
 * Estratégia:
 * 1. Fold (Mixamo): mede pose de mundo do osso-raiz com container + ossos e
 *    reexpressa no espaço local do container do PERSONAGEM.
 * 2. Keep-container (rigs Blender/custom): quando o fold não gera movimento no
 *    osso raiz (a queda vive no container, não no bind local do spine/Hips),
 *    mantém as tracks no nó homônimo do personagem — desde que não seja o
 *    Armature Mixamo com escala 0,01 (animar escala quebraria o rig).
 */

import * as THREE from "three";
import { clone as cloneSkinned } from "three/addons/utils/SkeletonUtils.js";

const EPS = 1e-6;
/** Movimento mínimo nas tracks fundidas no osso raiz para valer o fold. */
const ROOT_FOLD_MIN_POS = 1e-3;
const ROOT_FOLD_MIN_QUAT_DEG = 0.5;

export function rootBoneNamesOf(scene) {
  const names = new Set();
  scene.traverse((o) => {
    if (o.isBone && o.name && !o.parent?.isBone) names.add(o.name);
  });
  return names;
}

function boneNamesOf(scene) {
  const names = new Set();
  scene.traverse((o) => {
    if (o.isBone && o.name) names.add(o.name);
  });
  return names;
}

function findBone(scene, name) {
  let bone = null;
  scene.traverse((o) => {
    if (o.isBone && o.name === name) bone = o;
  });
  return bone;
}

function findNode(scene, name) {
  let node = null;
  scene.traverse((o) => {
    if (o.name === name) node = o;
  });
  return node;
}

function pickRootBone(scene, rootBoneNames) {
  if (!scene) return null;
  for (const name of rootBoneNames) {
    const bone = findBone(scene, name);
    if (bone) return bone;
  }
  for (const name of rootBoneNamesOf(scene)) {
    const bone = findBone(scene, name);
    if (bone) return bone;
  }
  return null;
}

function tracksByNode(clip) {
  const map = new Map();
  for (const track of clip.tracks) {
    const dot = track.name.lastIndexOf(".");
    const node = track.name.slice(0, dot);
    const prop = track.name.slice(dot);
    if (!map.has(node)) map.set(node, new Map());
    map.get(node).set(prop, track);
  }
  return map;
}

function unionTimes(tracks) {
  const set = new Set();
  for (const t of tracks) {
    if (!t?.times) continue;
    for (const time of t.times) set.add(time);
  }
  return [...set].sort((a, b) => a - b);
}

export function trackVaries(track, isQuat) {
  if (!track || track.times.length < 2) return false;
  const v = track.values;
  const stride = isQuat ? 4 : 3;
  for (let i = stride; i < v.length; i += stride) {
    for (let j = 0; j < stride; j++) {
      if (Math.abs(v[i + j] - v[j]) > EPS) return true;
    }
  }
  return false;
}

function valuesVary(values, stride, posThresh, quatMinDot) {
  if (!values?.length || values.length < stride * 2) return false;
  if (stride === 3) {
    for (let i = stride; i < values.length; i += stride) {
      if (
        Math.abs(values[i] - values[0]) > posThresh ||
        Math.abs(values[i + 1] - values[1]) > posThresh ||
        Math.abs(values[i + 2] - values[2]) > posThresh
      )
        return true;
    }
    return false;
  }
  let minDot = 1;
  for (let i = stride; i < values.length; i += stride) {
    const dot = Math.abs(
      values[0] * values[i] +
        values[1] * values[i + 1] +
        values[2] * values[i + 2] +
        values[3] * values[i + 3],
    );
    if (dot < minDot) minDot = dot;
  }
  const deg = (2 * Math.acos(Math.min(1, minDot)) * 180) / Math.PI;
  return deg > quatMinDot;
}

function containerHasMotion(containerTracks) {
  if (!containerTracks) return false;
  return (
    trackVaries(containerTracks.get(".position"), false) ||
    trackVaries(containerTracks.get(".quaternion"), true) ||
    trackVaries(containerTracks.get(".scale"), false)
  );
}

function updateProbeSkeleton(probe) {
  probe.traverse((o) => {
    if (o.isSkinnedMesh) o.skeleton.update();
  });
}

/** Armature Mixamo com escala ~0,01: animar o nó quebra o personagem. */
export function destContainerSafeForTracks(dstScene, containerName) {
  const container = findNode(dstScene, containerName);
  if (!container || container.isBone) return false;
  const scale = new THREE.Vector3();
  container.getWorldScale(scale);
  if (scale.x < 0.05 && scale.y < 0.05 && scale.z < 0.05) return false;
  return true;
}

function countContainerTracks(clip, srcScene, rootBoneNames, dstScene = null) {
  if (!clip?.tracks?.length || !srcScene) return 0;
  const srcRoot = pickRootBone(srcScene, rootBoneNames) ?? pickRootBone(dstScene, rootBoneNames);
  const srcContainer = srcRoot?.parent;
  if (!srcContainer || srcContainer.isBone) return 0;
  const containerTracks = tracksByNode(clip).get(srcContainer.name);
  if (!containerHasMotion(containerTracks)) return 0;
  let n = 0;
  const boneNames = boneNamesOf(srcScene);
  for (const track of clip.tracks) {
    const node = track.name.slice(0, track.name.lastIndexOf("."));
    if (boneNames.has(node)) continue;
    if (node !== srcContainer.name) continue;
    const prop = track.name.slice(track.name.lastIndexOf("."));
    const t = containerTracks.get(prop);
    if (!t) continue;
    if (trackVaries(t, prop === ".quaternion")) n += 1;
  }
  return n;
}

/** Mede tracks fundidas no osso raiz sem alterar o clipe. */
function probeFold(clip, srcScene, rootBoneNames, dstScene = null) {
  if (!clip?.tracks?.length || !srcScene) return null;

  const dst = dstScene ?? srcScene;
  const rootBone = pickRootBone(dst, rootBoneNames) ?? pickRootBone(srcScene, rootBoneNames);
  const container = rootBone?.parent;
  if (!rootBone || !container || container.isBone) return null;

  const srcRoot = pickRootBone(srcScene, rootBoneNames);
  const srcContainer = srcRoot?.parent;
  if (!srcRoot || !srcContainer || srcContainer.isBone) return null;

  const byNode = tracksByNode(clip);
  const containerTracks = byNode.get(srcContainer.name);
  if (!containerHasMotion(containerTracks)) return null;

  const times = unionTimes(clip.tracks);
  if (times.length === 0) return null;

  const probe = cloneSkinned(srcScene);
  const mixer = new THREE.AnimationMixer(probe);
  mixer.clipAction(clip.clone()).play();

  dst.updateMatrixWorld(true);
  const invContainer = container.matrixWorld.clone().invert();

  const posValues = [];
  const quatValues = [];
  const world = new THREE.Matrix4();
  const local = new THREE.Matrix4();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3();
  let probeRoot = null;
  probe.traverse((o) => {
    if (o.isBone && o.name === rootBone.name) probeRoot = o;
  });
  if (!probeRoot) return null;

  for (const time of times) {
    mixer.setTime(time);
    updateProbeSkeleton(probe);
    probeRoot.updateMatrixWorld(true);
    probeRoot.matrixWorld.decompose(pos, quat, scl);
    world.compose(pos, quat, scl);
    local.copy(invContainer).multiply(world);
    local.decompose(pos, quat, scl);
    posValues.push(pos.x, pos.y, pos.z);
    quatValues.push(quat.x, quat.y, quat.z, quat.w);
  }

  const rootTracksVary =
    valuesVary(posValues, 3, ROOT_FOLD_MIN_POS, 0) ||
    valuesVary(quatValues, 4, 0, ROOT_FOLD_MIN_QUAT_DEG);

  let folded = 0;
  if (containerTracks.get(".position")) folded += 1;
  if (containerTracks.get(".quaternion")) folded += 1;
  if (containerTracks.get(".scale")) folded += 1;

  return {
    folded,
    container: srcContainer.name,
    root: rootBone.name,
    rootTracksVary,
    times,
    posValues,
    quatValues,
    boneNames: boneNamesOf(srcScene),
  };
}

/**
 * Decide e aplica como tratar motion de container num clipe estrangeiro.
 * @returns {{ mode: 'none'|'fold'|'keep-container', folded?: number, container?: string, root?: string }}
 */
export function resolveContainerMotion(clip, srcScene, rootBoneNames, dstScene = null) {
  const probe = probeFold(clip, srcScene, rootBoneNames, dstScene);
  if (!probe) return { mode: "none" };

  if (probe.rootTracksVary) {
    foldContainerTracks(clip, srcScene, rootBoneNames, dstScene);
    return {
      mode: "fold",
      folded: probe.folded,
      container: probe.container,
      root: probe.root,
    };
  }

  if (dstScene && destContainerSafeForTracks(dstScene, probe.container)) {
    return {
      mode: "keep-container",
      folded: probe.folded,
      container: probe.container,
      root: probe.root,
    };
  }

  return { mode: "none", container: probe.container, root: probe.root };
}

/**
 * @param {THREE.AnimationClip} clip
 * @param {THREE.Object3D} srcScene cena do arquivo de animação
 * @param {Set<string>} rootBoneNames ossos-raiz do personagem destino
 * @param {THREE.Object3D|null} dstScene cena do personagem (T-pose); bind do container aqui
 */
export function foldContainerTracks(clip, srcScene, rootBoneNames, dstScene = null) {
  const probe = probeFold(clip, srcScene, rootBoneNames, dstScene);
  if (!probe?.rootTracksVary) return { folded: 0, container: probe?.container, root: probe?.root };

  const rootName = probe.root;
  const kept = clip.tracks.filter((t) => {
    const dot = t.name.lastIndexOf(".");
    const node = t.name.slice(0, dot);
    const prop = t.name.slice(dot);
    if (!probe.boneNames.has(node)) return false;
    if (node === rootName && (prop === ".position" || prop === ".quaternion")) return false;
    return true;
  });
  kept.push(
    new THREE.VectorKeyframeTrack(`${rootName}.position`, probe.times, probe.posValues),
    new THREE.QuaternionKeyframeTrack(`${rootName}.quaternion`, probe.times, probe.quatValues),
  );
  clip.tracks = kept;

  return {
    folded: probe.folded,
    container: probe.container,
    root: rootName,
    rootTracksVary: true,
  };
}

export function countFoldableContainerTracks(clip, srcScene, rootBoneNames, dstScene = null) {
  const probe = probeFold(clip, srcScene, rootBoneNames, dstScene);
  if (!probe) return 0;
  if (probe.rootTracksVary) return probe.folded;
  if (dstScene && destContainerSafeForTracks(dstScene, probe.container)) return probe.folded;
  return 0;
}
