/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import {
  cross,
  float,
  fract,
  int,
  ivec2,
  mix,
  normalize,
  select,
  textureLoad,
  uniform,
  vertexIndex,
} from "three/tsl";
import { basisMatrix } from "./descriptor";
import { vat } from "./runtime";
import type { VatBlendState } from "./VatClipPlayer";

/**
 * Os tipos de @types/three ainda não expressam bem a API proxy do TSL;
 * nós ficam como `any` DENTRO dos módulos vat/ (encapsulado, doc 03 §2).
 */
type N = any;

export interface VatSampler {
  /** Posição local Y-up (sem escala) de uma coluna/vértice arbitrária. */
  localPosition(columnF: N): N;
  /** Normal flat do triângulo do vértice corrente (só topologia soup: trincas). */
  flatNormal(): N;
  /** Normal da textura irmã (mais barata: 8 loads vs 16 do flat). */
  texNormal(): N;
  /** Coluna (índice de vértice) corrente. */
  vertexColumn: N;
  /** Sincroniza os uniforms com o estado do VatClipPlayer. */
  applyState(s: VatBlendState): void;
}

/**
 * Estado de animação POR INSTÂNCIA (doc 04 §5.5): nós que substituem os
 * uniforms globais quando `enabled` > 0.5 — clipA/clipB/blend vêm do storage
 * buffer `states` da sim e `clock` é o relógio de frame compartilhado
 * (uniform, avança a vat().fps). A fase por agente continua dessincronizando
 * os loops por cima do clock. Só clipes em LOOP passam por aqui (one-shots
 * por agente ficam para o director/M4).
 */
export interface VatPerAgentNodes {
  /** uniform 0/1 — o toggle master "estados automáticos". */
  enabled: N;
  /** Índice GLOBAL do clipe no slot A (float, por instância). */
  clipA: N;
  clipB: N;
  /** Progresso do crossfade A→B [0,1] (por instância). */
  blend: N;
  /** Frame clock global [0, framesPerClip) — uniform do dono do material. */
  clock: N;
}

/**
 * Cria o sampler TSL da VAT com crossfade entre dois clipes (A → B).
 *
 * Cada slot tem frame próprio (com lerp entre frames adjacentes) e o
 * resultado é misturado por `blend` — é isso que permite morfar qualquer
 * animação em qualquer outra de forma seamless, fora de sequência.
 *
 * `phaseNode` (opcional, por instância) dessincroniza a multidão; a fase
 * só se aplica a clipes em loop (phaseScale zerado pelo player em one-shots,
 * para quedas/levantadas dispararem em sincronia exata com o beat).
 *
 * `perAgent` (opcional): estados POR INSTÂNCIA vindos da sim — quando o
 * gate está ligado, clipe/blend deixam de ser os uniforms globais e passam
 * a ser lidos do storage buffer (select por uniform: os dois caminhos
 * convivem no shader e o modo global segue como fallback de debug).
 */
export function createVatSampler(
  posTex: THREE.Texture,
  nrmTex: THREE.Texture,
  phaseNode?: N,
  perAgent?: VatPerAgentNodes,
): VatSampler {
  const v = vat();
  const uFrameA: N = uniform(0);
  const uClipBaseA: N = uniform(v.framesPerClip);
  const uPhaseScaleA: N = uniform(1);
  const uFrameB: N = uniform(0);
  const uClipBaseB: N = uniform(v.framesPerClip);
  const uPhaseScaleB: N = uniform(1);
  const uBlend: N = uniform(0);
  const uBasis: N = uniform(basisMatrix(v.basis));
  const uOffset: N = uniform(new THREE.Vector3(...v.bakeOffset));

  const phase: N = phaseNode ?? float(0);

  // Parâmetros efetivos dos dois slots: globais (player) ou por agente.
  // No modo por agente todos os clipes são loops → phaseScale 1.
  const gate: N = perAgent ? perAgent.enabled.greaterThan(0.5) : null;
  const pick = (agentN: N, globalN: N): N =>
    perAgent ? select(gate, agentN, globalN) : globalN;
  const baseA: N = pick(
    perAgent ? perAgent.clipA.mul(v.framesPerClip) : null,
    uClipBaseA,
  );
  const baseB: N = pick(
    perAgent ? perAgent.clipB.mul(v.framesPerClip) : null,
    uClipBaseB,
  );
  const frameA: N = pick(perAgent ? perAgent.clock : null, uFrameA);
  const frameB: N = pick(perAgent ? perAgent.clock : null, uFrameB);
  const scaleA: N = pick(float(1), uPhaseScaleA);
  const scaleB: N = pick(float(1), uPhaseScaleB);
  const blend: N = pick(perAgent ? perAgent.blend : null, uBlend);

  /** Amostra um slot (clipe+frame) para uma coluna, com lerp interframe. */
  const sampleSlot = (
    tex: THREE.Texture,
    columnF: N,
    clipBase: N,
    frame: N,
    phaseScale: N,
  ): N => {
    const fEff: N = frame.add(phase.mul(phaseScale)).mod(v.framesPerClip);
    const f0: N = fEff.floor();
    const f1: N = f0.add(1).mod(v.framesPerClip);
    const t0 = textureLoad(tex, ivec2(int(columnF), int(clipBase.add(f0)))).xyz;
    const t1 = textureLoad(tex, ivec2(int(columnF), int(clipBase.add(f1)))).xyz;
    return mix(t0, t1, fract(fEff));
  };

  const sampleBlended = (tex: THREE.Texture, columnF: N): N => {
    const a = sampleSlot(tex, columnF, baseA, frameA, scaleA);
    const b = sampleSlot(tex, columnF, baseB, frameB, scaleB);
    return mix(a, b, blend);
  };

  const localPosition = (columnF: N): N =>
    uBasis.mul(sampleBlended(posTex, columnF).sub(uOffset));

  const vertexColumn: N = float(vertexIndex);

  const flatNormal = (): N => {
    const triBase: N = vertexColumn.div(3).floor().mul(3);
    const pA = localPosition(triBase);
    const pB = localPosition(triBase.add(1));
    const pC = localPosition(triBase.add(2));
    return normalize(cross(pB.sub(pA), pC.sub(pA)));
  };

  const texNormal = (): N =>
    normalize(uBasis.mul(sampleBlended(nrmTex, vertexColumn)));

  const applyState = (s: VatBlendState): void => {
    uFrameA.value = s.frameA;
    uClipBaseA.value = s.clipA * v.framesPerClip;
    uPhaseScaleA.value = s.loopA ? 1 : 0;
    uFrameB.value = s.frameB;
    uClipBaseB.value = s.clipB * v.framesPerClip;
    uPhaseScaleB.value = s.loopB ? 1 : 0;
    uBlend.value = s.blend;
  };

  return { localPosition, flatNormal, texNormal, vertexColumn, applyState };
}
