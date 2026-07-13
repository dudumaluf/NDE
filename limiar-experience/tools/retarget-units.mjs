/**
 * retarget-units — rebaseia tracks de POSIÇÃO e ROTAÇÃO à convenção do rig
 * de destino no retarget entre arquivos. Compartilhado entre o bake
 * (tools/vat-core.mjs) e o preview do Studio (tools/studio/app.js).
 *
 * O problema que resolve (bug real: base GLB + animação FBX do Mixamo, "o
 * chão ficou na cintura"): rotações e posições de track são expressas no
 * ESPAÇO LOCAL DO PAI de cada osso — e esse espaço difere entre exports do
 * mesmo esqueleto. Rig Mixamo→Blender→GLB típico: ossos em CENTÍMETROS num
 * espaço Z-up, sob um nó com rotação −90°X e escala 0,01; anim FBX
 * normalizada: metros, Y-up, pai identidade. Copiar valores crus afunda o
 * corpo (posição ~1% do esperado) e/ou tomba o personagem de lado (rotação
 * da raiz aplicada no espaço errado).
 *
 * Rebase relativo à pose de descanso (retarget clássico): o DELTA de cada
 * osso em relação ao próprio descanso viaja em espaço de mundo e é aplicado
 * sobre o descanso do rig de destino —
 *
 *   posição:  v' = restDst + Mdst⁻¹ · s · Msrc · (v − restSrc)
 *   rotação:  q' = A · q · B,  A = Qdst⁻¹·Qsrc,  B = Wsrc⁻¹·Wdst
 *
 * onde M e Q = matrixWorld (3×3 e rotação) do PAI em descanso, W = rotação
 * de MUNDO do PRÓPRIO osso em descanso e s = proporção entre os personagens
 * (mediana das razões de |posição de mundo| dos ossos homônimos). Por
 * construção, o descanso da fonte mapeia exatamente no descanso do destino;
 * rigs com a MESMA convenção de frames dão A=B=I (no-op). É o que faz uma
 * anim FBX crua do Mixamo funcionar sobre um rig GLB do Blender, que
 * reorienta os ossos (Y ao longo do osso) e guarda cm/Z-up sob nó 0,01.
 */

import * as THREE from "three";

const EPS = 1e-4;

/**
 * Mapa nome do osso → dados de descanso: translação local, 3×3 e rotação do
 * mundo do PAI, rotação de mundo do PRÓPRIO osso e posição de mundo. Chame
 * com a cena EM POSE DE DESCANSO.
 */
export function restPoseMaps(scene) {
  scene.updateMatrixWorld(true);
  const map = new Map();
  const world = new THREE.Vector3();
  const pos = new THREE.Vector3();
  const quat = new THREE.Quaternion();
  const scl = new THREE.Vector3();
  const collect = (o) => {
    if (!o.name || map.has(o.name)) return;
    o.getWorldPosition(world);
    const parentMW = o.parent ? o.parent.matrixWorld : new THREE.Matrix4();
    parentMW.decompose(pos, quat, scl);
    const worldQuat = new THREE.Quaternion();
    o.getWorldQuaternion(worldQuat);
    map.set(o.name, {
      local: o.position.clone(),
      parentM3: new THREE.Matrix3().setFromMatrix4(parentMW),
      parentQuat: quat.clone(),
      worldQuat,
      worldMag: world.length(),
    });
  };
  scene.traverse((o) => {
    if (o.isBone) collect(o);
  });
  // cenas sem .isBone marcado (raro): todos os nós nomeados
  if (map.size === 0)
    scene.traverse((o) => {
      collect(o);
    });
  return map;
}

/**
 * Escala de mundo do rig (mediana da escala das matrizes de pai): 0,01 para
 * rigs GLB com ossos em cm sob nó 0,01; 1 para rigs em metros. Converte
 * medidas feitas em unidades de track (ex.: rootTravel) para metros.
 */
export function worldScaleOf(maps) {
  const vals = [];
  for (const d of maps.values()) {
    const e = d.parentM3.elements;
    const s = Math.hypot(e[0], e[1], e[2]);
    if (s > EPS) vals.push(s);
  }
  if (vals.length === 0) return 1;
  vals.sort((a, b) => a - b);
  return vals[(vals.length - 1) >> 1];
}

/** Proporção fonte→destino: mediana das razões de |posição de mundo| dos ossos homônimos. */
function proportionScale(srcMaps, dstMaps, resolveDstName) {
  const ratios = [];
  for (const [srcName, src] of srcMaps) {
    if (src.worldMag < EPS) continue;
    const dstName = resolveDstName(srcName);
    const dst = dstName ? dstMaps.get(dstName) : null;
    if (!dst || dst.worldMag < EPS) continue;
    ratios.push(dst.worldMag / src.worldMag);
  }
  if (ratios.length === 0) return { s: 1, matched: 0 };
  ratios.sort((a, b) => a - b);
  return { s: ratios[(ratios.length - 1) >> 1], matched: ratios.length };
}

/** ‖A − I‖∞ — para pular a transformação quando fonte e destino coincidem. */
const I3 = new THREE.Matrix3();
function deviationFromIdentity(A) {
  let worst = 0;
  for (let i = 0; i < 9; i++) {
    const d = Math.abs(A.elements[i] - I3.elements[i]);
    if (d > worst) worst = d;
  }
  return worst;
}

/**
 * Rebaseia as tracks `.position` e `.quaternion` de um clipe da convenção da
 * FONTE para a do DESTINO (mutação). Tracks de nós sem dados em um dos lados
 * ficam intactas. Pressupõe que o retarget já renomeou as tracks para os
 * nomes do DESTINO. Retorna { rebased, s, matched }.
 */
export function rebaseTracksToRig(clip, srcMaps, dstMaps, resolveDstName) {
  const { s, matched } = proportionScale(srcMaps, dstMaps, resolveDstName);
  if (matched === 0) return { rebased: 0, s, matched };

  // nome no destino → dados da fonte (o nome pode ter sido normalizado)
  const srcByDst = new Map();
  for (const [srcName, data] of srcMaps) {
    const dstName = resolveDstName(srcName);
    if (dstName && !srcByDst.has(dstName)) srcByDst.set(dstName, data);
  }

  const A3 = new THREE.Matrix3();
  const inv = new THREE.Matrix3();
  const v = new THREE.Vector3();
  const qa = new THREE.Quaternion();
  const qb = new THREE.Quaternion();
  const q = new THREE.Quaternion();
  let rebased = 0;

  for (const t of clip.tracks) {
    const dot = t.name.lastIndexOf(".");
    const prop = t.name.slice(dot);
    if (prop !== ".position" && prop !== ".quaternion") continue;
    const dstName = t.name.slice(0, dot);
    const dst = dstMaps.get(dstName);
    const src = srcByDst.get(dstName) ?? srcMaps.get(dstName);
    if (!src || !dst) continue;

    if (prop === ".position") {
      // A = Mdst⁻¹ · s · Msrc (constante por osso: pais em pose de descanso —
      // exato para a raiz; ossos internos têm tracks ~constantes = descanso,
      // que caem exatamente em restDst)
      inv.copy(dst.parentM3).invert();
      A3.copy(src.parentM3).multiplyScalar(s).premultiply(inv);
      const restsMatch =
        src.local.distanceTo(dst.local) < 1e-3 * Math.max(1, dst.local.length());
      if (restsMatch && deviationFromIdentity(A3) < 1e-3) continue; // mesmo rig
      const val = t.values;
      for (let i = 0; i < val.length; i += 3) {
        v.set(val[i] - src.local.x, val[i + 1] - src.local.y, val[i + 2] - src.local.z);
        v.applyMatrix3(A3).add(dst.local);
        val[i] = v.x;
        val[i + 1] = v.y;
        val[i + 2] = v.z;
      }
      rebased += 1;
    } else {
      // q' = A·q·B — A corrige o espaço do PAI, B corrige o frame do PRÓPRIO
      // osso (rigs do Blender reorientam juntas: sem o B, pernas/braços
      // dobram para o lado errado). Descanso mapeia em descanso.
      qa.copy(dst.parentQuat).invert().multiply(src.parentQuat);
      qb.copy(src.worldQuat).invert().multiply(dst.worldQuat);
      if (Math.abs(1 - Math.abs(qa.w)) < 1e-6 && Math.abs(1 - Math.abs(qb.w)) < 1e-6)
        continue; // mesma convenção de frames
      const val = t.values;
      for (let i = 0; i < val.length; i += 4) {
        q.set(val[i], val[i + 1], val[i + 2], val[i + 3]).premultiply(qa).multiply(qb);
        val[i] = q.x;
        val[i + 1] = q.y;
        val[i + 2] = q.z;
        val[i + 3] = q.w;
      }
      rebased += 1;
    }
  }
  return { rebased, s, matched };
}
