import * as THREE from "three/webgpu";
import type { Content } from "./types";
import { positionMirror } from "../sim/positionMirror";

/**
 * Sinal de FORMAÇÃO dos núcleos, compartilhado (2026-07-14): o ClusterLabels
 * detectava a coesão com um readback GPU próprio; com os contornos
 * (ClusterOutlines) precisando do mesmo sinal, a detecção mudou para cá — e
 * passou a ler o positionMirror (o espelho CPU contínuo que hover/follow já
 * mantêm vivo), eliminando o readback duplicado por completo.
 *
 * Regra igual à original: a cada ~0,6 s, média das distâncias XZ de cada
 * membro ao SEU alvo UMAP; abaixo de `formRadius` o núcleo está coeso, com
 * histerese 1,35× para não piscar na fronteira. Fallback preservado: se o
 * espelho quebrar neste ambiente, "ativo há 8 s" = formado (briefing M3.5).
 *
 * O tick é idempotente entre consumidores: labels E outlines chamam
 * `tickClusterFormation()` por frame — um relógio absoluto interno garante
 * que só a primeira chamada da janela faz o trabalho.
 */

export interface ClusterFormationInfo {
  clusterId: number;
  label: string;
  /** Slot de agente de cada membro (índice no manifest.people). */
  memberSlots: number[];
  /** Alvo UMAP unitário (x, z) de cada membro — multiplicar por mapScale. */
  memberTargets: [number, number][];
  /** Centroide do núcleo no espaço UMAP unitário (x, z). */
  centroid: [number, number];
}

/** Membros + centroides por núcleo (mesma derivação do ClusterLabels). */
export function buildClusterFormationInfos(
  content: Content,
): ClusterFormationInfo[] {
  const slotByPerson = new Map<string, number>();
  content.manifest.people.forEach((p, i) => slotByPerson.set(p.id, i));

  const infos: ClusterFormationInfo[] = [];
  for (const cluster of content.clusters) {
    const memberSlots: number[] = [];
    const memberTargets: [number, number][] = [];
    let cx = 0;
    let cz = 0;
    for (const id of cluster.members) {
      const slot = slotByPerson.get(id);
      const pos = content.layout[id];
      if (slot === undefined || !pos) continue;
      memberSlots.push(slot);
      memberTargets.push([pos.umap3d[0], pos.umap3d[2]]);
      cx += pos.umap3d[0];
      cz += pos.umap3d[2];
    }
    if (memberSlots.length === 0) continue;
    infos.push({
      clusterId: cluster.id,
      label: cluster.label,
      memberSlots,
      memberTargets,
      centroid: [cx / memberSlots.length, cz / memberSlots.length],
    });
  }
  return infos;
}

const SAMPLE_INTERVAL_MS = 600;
/** Histerese: entra em formRadius, só sai em 1,35× — sem piscar. */
const HYSTERESIS = 1.35;
/** Fallback sem espelho: gravidade ativa há N ms = formado. */
const FALLBACK_ACTIVE_MS = 8000;

const state = {
  formedById: new Map<number, boolean>(),
  /** Nº de avaliações completas (0 = ainda sem veredito — snap de opacidade). */
  evalCount: 0,
  nextSampleAt: 0,
  activeSince: 0,
  wasActive: false,
  usingFallback: false,
};

const tmp = new THREE.Vector3();

/**
 * Avalia a formação (amostrado, nunca por frame). Chamar de qualquer
 * useFrame com o `active` do chamador (gravidade ligada, sem lentes) —
 * chamadas redundantes na mesma janela são no-ops.
 */
export function tickClusterFormation(
  infos: ClusterFormationInfo[],
  active: boolean,
  mapScale: number,
  formRadius: number,
  now = performance.now(),
): void {
  if (!state.wasActive && active) state.activeSince = now;
  state.wasActive = active;
  if (!active) {
    // Rótulos/contornos fecham pelo gate do consumidor; os flags podem
    // esfriar até a próxima ativação (paridade com o comportamento antigo).
    return;
  }
  if (now < state.nextSampleAt) return;
  state.nextSampleAt = now + SAMPLE_INTERVAL_MS;

  if (positionMirror.broken || !positionMirror.ready) {
    // Fallback do briefing: sem posições, o tempo decide.
    state.usingFallback = positionMirror.broken;
    if (positionMirror.broken) {
      const formed = now - state.activeSince > FALLBACK_ACTIVE_MS;
      for (const info of infos) state.formedById.set(info.clusterId, formed);
      state.evalCount += 1;
    }
    return;
  }

  state.usingFallback = false;
  for (const info of infos) {
    let acc = 0;
    let n = 0;
    for (let k = 0; k < info.memberSlots.length; k++) {
      if (!positionMirror.getPos(info.memberSlots[k], tmp)) continue;
      const dx = tmp.x - info.memberTargets[k][0] * mapScale;
      const dz = tmp.z - info.memberTargets[k][1] * mapScale;
      acc += Math.hypot(dx, dz);
      n += 1;
    }
    if (n === 0) continue;
    const mean = acc / n;
    const was = state.formedById.get(info.clusterId) ?? false;
    state.formedById.set(
      info.clusterId,
      was ? mean < formRadius * HYSTERESIS : mean < formRadius,
    );
  }
  state.evalCount += 1;

  if (import.meta.env.DEV && typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>).__limiarFormation = {
      formed: Object.fromEntries(state.formedById),
      evalCount: state.evalCount,
      usingFallback: state.usingFallback,
    };
  }
}

export function isClusterFormed(clusterId: number): boolean {
  return state.formedById.get(clusterId) ?? false;
}

/** true após a 1ª avaliação (consumidores usam para o snap de screenshots). */
export function formationEvaluated(): boolean {
  return state.evalCount > 0;
}
