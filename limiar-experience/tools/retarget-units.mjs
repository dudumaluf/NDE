/**
 * retarget-units — decide se tracks de animação de OUTRO arquivo entram
 * DIRETO no rig do personagem ou precisam de rebase de convenção, e faz o
 * rebase quando (e só quando) ele é necessário. Compartilhado entre o bake
 * (tools/vat-core.mjs) e o preview do Studio (tools/studio/app.js).
 *
 * POLÍTICA (aprendida com uma regressão real):
 *
 * 1. MESMO RIG/CONVENÇÃO → APLICAÇÃO DIRETA (bypass total). Critério
 *    POSE-INVARIANTE: as translações LOCAIS dos ossos homônimos são iguais
 *    dentro de tolerância apertada (≥95% dos ossos casados). Posar um
 *    esqueleto muda quaternions, nunca as translações locais — então o
 *    critério vale mesmo quando o arquivo de animação foi exportado com os
 *    nós "descansando" num frame do clipe (anim-only do Blender), que era
 *    exatamente o caso que gerava correções espúrias (braços cruzados no
 *    fluxo clássico GLB+GLB).
 *
 * 2. CONVENÇÕES DIFEREM (ex.: anim FBX em m/Y-up sobre rig GLB do Blender
 *    com ossos em cm/Z-up sob nó 0,01×R(−90°X)) → rebase MÍNIMO e só com
 *    quantidades confiáveis:
 *    - posições: v' = restDst + Mdst⁻¹·s·Msrc·(v − restSrc), exato para a
 *      raiz (os pais são containers, imunes a pose); tracks internas são
 *      ~constantes e caem em restDst por construção;
 *    - rotações: SÓ os ossos-RAIZ ganham a correção de frame do pai
 *      (q' = Qdst⁻¹·Qsrc·q — containers, também imunes a pose). Ossos
 *      internos passam CRUS: medido em bind real, os frames de junta de
 *      exports GLB (Blender) e FBX (Mixamo) do mesmo esqueleto são
 *      idênticos (Δ 0,00° em 67 ossos) — qualquer "correção" por osso
 *      interno derivada da cena é contaminação de pose, não convenção.
 *    - a proporção s vem de COMPRIMENTOS de osso (invariantes a pose),
 *      não de posições de mundo.
 *
 * 3. "Rest" duvidoso NUNCA vira base de correção — os avisos heurísticos da
 *    UI (pose de descanso, juntas congeladas) informam; transformação é
 *    outra coisa.
 */

import * as THREE from "three";

const EPS = 1e-4;

/**
 * Mapa nome do osso → dados de descanso pose-seguros ou marcados:
 * translação local (pose-invariante), 3×3/rotação do mundo do PAI
 * (confiável só quando o pai NÃO é osso), se o pai é osso, posição de
 * mundo e nome do pai (para comprimentos). Chame com a cena carregada.
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
    map.set(o.name, {
      local: o.position.clone(),
      parentM3: new THREE.Matrix3().setFromMatrix4(parentMW),
      parentQuat: quat.clone(),
      parentIsBone: Boolean(o.parent?.isBone),
      parentName: o.parent?.name ?? null,
      worldPos: world.clone(),
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

/**
 * Proporção fonte→destino pela mediana das razões de COMPRIMENTO de osso
 * (|mundo do osso − mundo do pai|) dos pares homônimos — comprimentos são
 * invariantes a pose (rotação preserva distância), ao contrário das
 * posições de mundo, que uma cena posada contaminaria.
 */
function proportionScale(srcMaps, dstMaps, resolveDstName) {
  const ratios = [];
  for (const [srcName, src] of srcMaps) {
    if (!src.parentName) continue;
    const srcParent = srcMaps.get(src.parentName);
    if (!srcParent) continue;
    const lenSrc = src.worldPos.distanceTo(srcParent.worldPos);
    if (lenSrc < EPS) continue;
    const dstName = resolveDstName(srcName);
    const dst = dstName ? dstMaps.get(dstName) : null;
    if (!dst || !dst.parentName) continue;
    const dstParent = dstMaps.get(dst.parentName);
    if (!dstParent) continue;
    const lenDst = dst.worldPos.distanceTo(dstParent.worldPos);
    if (lenDst < EPS) continue;
    ratios.push(lenDst / lenSrc);
  }
  if (ratios.length === 0) return { s: 1, matched: 0 };
  ratios.sort((a, b) => a - b);
  return { s: ratios[(ratios.length - 1) >> 1], matched: ratios.length };
}

/** Fração de ossos casados com translação LOCAL igual (tolerância apertada). */
function equalLocalShare(srcMaps, dstMaps, resolveDstName) {
  let equal = 0;
  let matched = 0;
  for (const [srcName, src] of srcMaps) {
    const dstName = resolveDstName(srcName);
    const dst = dstName ? dstMaps.get(dstName) : null;
    if (!dst) continue;
    matched += 1;
    if (src.local.distanceTo(dst.local) <= Math.max(1e-4, 1e-3 * dst.local.length())) equal += 1;
  }
  return { share: matched ? equal / matched : 0, matched };
}

/**
 * Aplica a política ao clipe (mutação; tracks já renomeadas para o destino).
 * Retorna { bypass, rebased, s, matched } — bypass true = aplicação direta
 * (nenhum valor tocado, o comportamento clássico).
 */
export function rebaseTracksToRig(clip, srcMaps, dstMaps, resolveDstName) {
  const locals = equalLocalShare(srcMaps, dstMaps, resolveDstName);
  // MESMO rig/convenção → direto (delta 0.0 por definição)
  if (locals.matched >= 4 && locals.share >= 0.95)
    return { bypass: true, rebased: 0, s: 1, matched: locals.matched };

  const { s, matched } = proportionScale(srcMaps, dstMaps, resolveDstName);
  if (matched === 0) return { bypass: true, rebased: 0, s: 1, matched: 0 };

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
      // v' = restDst + Mdst⁻¹·s·Msrc·(v − restSrc): raiz exata (pais são
      // containers); internas ~constantes caem em restDst
      inv.copy(dst.parentM3).invert();
      A3.copy(src.parentM3).multiplyScalar(s).premultiply(inv);
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
      // rotação: SÓ ossos-raiz (pai não é osso — containers são imunes a
      // pose). Internos passam crus: frames de junta são iguais entre
      // exports do mesmo esqueleto (medido: Δ 0,00°); "corrigi-los" a
      // partir de uma cena possivelmente posada inverte braços/pernas.
      if (src.parentIsBone || dst.parentIsBone) continue;
      qa.copy(dst.parentQuat).invert().multiply(src.parentQuat);
      if (Math.abs(1 - Math.abs(qa.w)) < 1e-6) continue; // mesmo frame de pai
      const val = t.values;
      for (let i = 0; i < val.length; i += 4) {
        q.set(val[i], val[i + 1], val[i + 2], val[i + 3]).premultiply(qa);
        val[i] = q.x;
        val[i + 1] = q.y;
        val[i + 2] = q.z;
        val[i + 3] = q.w;
      }
      rebased += 1;
    }
  }
  return { bypass: false, rebased, s, matched };
}
