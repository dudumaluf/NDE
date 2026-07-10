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
  textureLoad,
  uniform,
  vertexIndex,
} from "three/tsl";
import { VAT, basisMatrix } from "./descriptor";
import type { VatBlendState } from "./VatClipPlayer";

/**
 * Os tipos de @types/three ainda não expressam bem a API proxy do TSL;
 * nós ficam como `any` DENTRO dos módulos vat/ (encapsulado, doc 03 §2).
 */
type N = any;

export interface VatSampler {
  /** Posição local Y-up (sem escala) de uma coluna/vértice arbitrária. */
  localPosition(columnF: N): N;
  /** Normal flat do triângulo do vértice corrente (soup: trincas). */
  flatNormal(): N;
  /** Normal da textura irmã (mais barata: 8 loads vs 16 do flat). */
  texNormal(): N;
  /** Coluna (índice de vértice) corrente. */
  vertexColumn: N;
  /** Sincroniza os uniforms com o estado do VatClipPlayer. */
  applyState(s: VatBlendState): void;
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
 */
export function createVatSampler(
  posTex: THREE.Texture,
  nrmTex: THREE.Texture,
  phaseNode?: N,
): VatSampler {
  const uFrameA: N = uniform(0);
  const uClipBaseA: N = uniform(VAT.framesPerClip);
  const uPhaseScaleA: N = uniform(1);
  const uFrameB: N = uniform(0);
  const uClipBaseB: N = uniform(VAT.framesPerClip);
  const uPhaseScaleB: N = uniform(1);
  const uBlend: N = uniform(0);
  const uBasis: N = uniform(basisMatrix("x_negz_y"));
  const uOffset: N = uniform(new THREE.Vector3(...VAT.bakeOffset));

  const phase: N = phaseNode ?? float(0);

  /** Amostra um slot (clipe+frame) para uma coluna, com lerp interframe. */
  const sampleSlot = (
    tex: THREE.Texture,
    columnF: N,
    clipBase: N,
    frame: N,
    phaseScale: N,
  ): N => {
    const fEff: N = frame.add(phase.mul(phaseScale)).mod(VAT.framesPerClip);
    const f0: N = fEff.floor();
    const f1: N = f0.add(1).mod(VAT.framesPerClip);
    const t0 = textureLoad(tex, ivec2(int(columnF), int(clipBase.add(f0)))).xyz;
    const t1 = textureLoad(tex, ivec2(int(columnF), int(clipBase.add(f1)))).xyz;
    return mix(t0, t1, fract(fEff));
  };

  const sampleBlended = (tex: THREE.Texture, columnF: N): N => {
    const a = sampleSlot(tex, columnF, uClipBaseA, uFrameA, uPhaseScaleA);
    const b = sampleSlot(tex, columnF, uClipBaseB, uFrameB, uPhaseScaleB);
    return mix(a, b, uBlend);
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
    uClipBaseA.value = s.clipA * VAT.framesPerClip;
    uPhaseScaleA.value = s.loopA ? 1 : 0;
    uFrameB.value = s.frameB;
    uClipBaseB.value = s.clipB * VAT.framesPerClip;
    uPhaseScaleB.value = s.loopB ? 1 : 0;
    uBlend.value = s.blend;
  };

  return { localPosition, flatNormal, texNormal, vertexColumn, applyState };
}
