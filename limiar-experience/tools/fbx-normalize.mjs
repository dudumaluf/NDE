/**
 * fbx-normalize — pós-processamento do FBXLoader para o fluxo Mixamo,
 * compartilhado entre o Node (tools/vat-core.mjs) e o browser
 * (tools/studio/app.js): o preview do Studio e o bake veem o MESMO modelo.
 *
 * O que normaliza (diferenças FBX → GLB que o resto do pipeline assume):
 * - unidades: FBX do Mixamo vem em centímetros (UnitScaleFactor=1);
 *   convertemos para METROS (fator unitScaleFactor/100) assando o fator na
 *   geometria, ossos, bind matrices e tracks de posição — sem group.scale,
 *   para o skinning (applyBoneTransform) e o root motion saírem coerentes.
 * - clipes vazios: o Mixamo exporta um "Take 001" sem tracks junto do clipe
 *   real ("mixamo.com") — descartado.
 * - nomes de osso "mixamorig:Hips": o próprio FBXLoader já remove o ':'
 *   (nomes seguros p/ PropertyBinding) — igual ao GLB do Blender, então o
 *   retarget cruzado FBX↔GLB casa por nome.
 */

import * as THREE from "three";

const FBX_BINARY_MAGIC = "Kaydara FBX Binary  \0";

/** True se o buffer é FBX binário (o único formato que o loader lê de forma confiável). */
export function isFbxBinary(buf) {
  const bytes =
    buf instanceof ArrayBuffer ? new Uint8Array(buf) : new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  if (bytes.length < FBX_BINARY_MAGIC.length) return false;
  for (let i = 0; i < FBX_BINARY_MAGIC.length; i++)
    if (bytes[i] !== FBX_BINARY_MAGIC.charCodeAt(i)) return false;
  return true;
}

/** Mensagens de erro do FBXLoader → linguagem de usuário (casos reais). */
export function translateFbxError(e, name) {
  const msg = String(e?.message ?? e);
  if (/FBX version not supported/i.test(msg) || /Cannot find the version number/i.test(msg))
    return (
      `${name}: FBX antigo demais (${msg.match(/FileVersion: ?(\d+)/)?.[1] ?? "versão < 7.0"}) — ` +
      `re-exporte como FBX 2011+ ou converta para GLB (o Mixamo atual exporta 7.x, suportado)`
    );
  if (/Unknown format/i.test(msg))
    return `${name}: FBX ASCII não suportado — re-exporte como FBX binário ou converta para GLB (guia no tools/README.md)`;
  return `${name}: falha ao ler o FBX (${msg}) — converta para GLB como plano B (tools/README.md)`;
}

const scaleTranslation = (m, f) => {
  m.elements[12] *= f;
  m.elements[13] *= f;
  m.elements[14] *= f;
};

/**
 * Assa um fator de escala uniforme no rig inteiro (transformação de
 * similaridade): posições locais dos nós, geometria, bind/boneInverses e
 * tracks de posição. Mantém rotações/escalas — equivalente a re-exportar o
 * arquivo já em metros.
 */
function bakeUnitFactor(group, animations, factor) {
  const geometries = new Set();
  const skeletons = new Set();
  const doneMatrices = new Set();

  group.traverse((o) => {
    o.position.multiplyScalar(factor);
    if (o.isMesh) geometries.add(o.geometry);
    if (o.isSkinnedMesh) {
      if (!doneMatrices.has(o.bindMatrix)) {
        doneMatrices.add(o.bindMatrix);
        scaleTranslation(o.bindMatrix, factor);
      }
      o.bindMatrixInverse.copy(o.bindMatrix).invert();
      if (o.skeleton && !skeletons.has(o.skeleton)) {
        skeletons.add(o.skeleton);
        for (const inv of o.skeleton.boneInverses) {
          if (doneMatrices.has(inv)) continue;
          doneMatrices.add(inv);
          scaleTranslation(inv, factor);
        }
      }
    }
  });

  for (const g of geometries) {
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count * pos.itemSize; i++) pos.array[i] *= factor;
    pos.needsUpdate = true;
    g.boundingBox = null;
    g.boundingSphere = null;
  }

  for (const clip of animations)
    for (const t of clip.tracks)
      if (t.name.endsWith(".position")) for (let i = 0; i < t.values.length; i++) t.values[i] *= factor;

  group.updateMatrixWorld(true);
}

/**
 * Extensão da pose de descanso em unidades cruas (ossos em espaço de mundo +
 * bounding box das malhas): humanos em cm medem 150–200, em metros 1,5–2.
 * Serve de heurística de unidade quando o FBX não traz UnitScaleFactor
 * legível (ex.: FBX de animação re-exportado por outras ferramentas).
 */
function restExtent(group) {
  group.updateMatrixWorld(true);
  const v = new THREE.Vector3();
  let extent = 0;
  group.traverse((o) => {
    if (o.isBone) {
      o.getWorldPosition(v);
      extent = Math.max(extent, Math.abs(v.x), Math.abs(v.y), Math.abs(v.z));
    }
    if (o.isMesh && o.geometry?.attributes?.position) {
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      const b = o.geometry.boundingBox;
      extent = Math.max(
        extent,
        ...[b.min.x, b.min.y, b.min.z, b.max.x, b.max.y, b.max.z].map(Math.abs),
      );
    }
  });
  return extent;
}

/** Extensão acima da qual assumimos centímetros (humano em cm ≈ 90–200). */
const CM_EXTENT_THRESHOLD = 20;

/**
 * Normaliza o resultado do FBXLoader para a forma que o pipeline consome
 * (igual ao GLTFLoader: `{ scene, animations }`). Retorna também metadados
 * para logging na UI/CLI.
 */
export function normalizeFbxResult(group, warn = () => {}) {
  // clipes vazios ("Take 001" do Mixamo) fora
  const animations = (group.animations ?? []).filter(
    (c) => c.tracks.length > 0 && c.duration > 1e-6,
  );
  const dropped = (group.animations ?? []).length - animations.length;
  if (dropped > 0) warn(`${dropped} take(s) vazio(s) descartado(s) (ex.: "Take 001" do Mixamo)`);

  // Unidades → metros. Fonte 1: GlobalSettings.UnitScaleFactor (Mixamo: 1 =
  // centímetros → fator 0.01). Fonte 2 (arquivos sem o campo legível, ex.:
  // FBX de animação re-exportado): heurística pela pose de descanso.
  const rawUsf = group.userData?.unitScaleFactor;
  let unitScaleFactor = Number(rawUsf);
  let how = "UnitScaleFactor";
  if (rawUsf === undefined || !Number.isFinite(unitScaleFactor) || unitScaleFactor <= 0) {
    const extent = restExtent(group);
    unitScaleFactor = extent > CM_EXTENT_THRESHOLD ? 1 : 100;
    how = `sem UnitScaleFactor legível — estimado pela pose de descanso (extensão ${extent.toFixed(1)})`;
  }
  const factor = unitScaleFactor / 100;
  let scaledToMeters = false;
  if (Number.isFinite(factor) && factor > 0 && Math.abs(factor - 1) > 1e-6) {
    bakeUnitFactor(group, animations, factor);
    scaledToMeters = true;
    warn(`unidades convertidas para metros (fator ${factor}; ${how})`);
  }

  group.updateMatrixWorld(true);
  return { scene: group, animations, unitScaleFactor, scaledToMeters, factor };
}

/**
 * Material neutro para o preview no browser: FBX costuma referenciar
 * texturas externas que não existem aqui (o bake ignora materiais de toda
 * forma — mesma regra do GLB, que tem os visuais removidos antes do parse).
 */
export function neutralizeFbxMaterials(group) {
  const neutral = new THREE.MeshStandardMaterial({
    color: 0xb8b0a8,
    roughness: 0.65,
    metalness: 0.05,
  });
  group.traverse((o) => {
    if (o.isMesh) o.material = neutral;
  });
}
