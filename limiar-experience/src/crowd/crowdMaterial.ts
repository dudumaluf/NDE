/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import {
  clamp,
  instanceIndex,
  instancedBufferAttribute,
  length,
  mix,
  normalize,
  select,
  storage,
  transformNormalToView,
  uniform,
  varying,
  vec3,
} from "three/tsl";
import { createVatSampler, type VatSampler } from "../vat/vatNodes";
import { vat } from "../vat/runtime";
import type { CrowdAttributes } from "../vat/vatGeometry";
import type { CrowdSim } from "../sim/CrowdSim";

type N = any;

export interface CrowdMaterialBundle {
  material: THREE.MeshStandardNodeMaterial;
  sampler: VatSampler;
  setScale(v: number): void;
  /** 0 = cinza (dormentes), 1 = paleta por instância (paridade com o patch). */
  setPaletteAmount(v: number): void;
  /** 0=normal, 1=velocidade, 2=direção, 3=alvo, 4=estado (máquina §5.5). */
  setDebugMode(v: number): void;
  /** +1/−1: calibra para onde o modelo "olha" em relação ao movimento. */
  setFaceFlip(v: number): void;
  /** Liga/desliga os estados POR AGENTE (off = uniforms globais do player). */
  setPerAgentStates(on: boolean): void;
  /** Avança o relógio de frame dos estados por agente (dt em segundos). */
  tickAgentClock(dt: number): void;
}

/**
 * Material da multidão dirigido pela simulação: posição, direção e fase do
 * passo vêm dos storage buffers da CrowdSim (via toAttribute, compatível com
 * o fallback WebGL2); cor e variação de escala continuam atributos estáticos.
 *
 * Estados por agente (doc 04 §5.5): clipA/clipB/blend são lidos do buffer
 * `states` da sim como STORAGE no vertex stage — read-only direto no WebGPU,
 * PBO (cópia para DataTexture) no WebGL2, padrão dos fios. Não é atributo:
 * os 7 vertex buffers atuais ficam intactos (limite de 8 do WebGPU).
 */
export function buildCrowdMaterial(
  posTex: THREE.Texture,
  nrmTex: THREE.Texture,
  attrs: CrowdAttributes,
  sim: CrowdSim,
): CrowdMaterialBundle {
  const aColorScale: N = instancedBufferAttribute(attrs.colorScale);
  const aScale: N = aColorScale.w;
  const aColor: N = aColorScale.xyz;

  const iPos: N = (sim.positions as N).toAttribute();
  const iHeading: N = (sim.headings as N).toAttribute();
  const iPhase: N = (sim.phases as N).toAttribute();
  const iVel: N = (sim.velocities as N).toAttribute();
  const iTarget: N = (sim.targets as N).toAttribute();

  // Estado de animação por agente (storage read no vertex — não conta no
  // limite de vertex buffers). setPBO: caminho por textura no WebGL2.
  const iState: N = storage((sim.states as N).value, "vec4", sim.maxCount)
    .setPBO(true)
    .toReadOnly()
    .element(instanceIndex);

  // Nasce em 0 (global): o dono do mesh liga via setPerAgentStates — sem o
  // wiring, o material se comporta exatamente como antes do M3.6.
  const uPerAgent: N = uniform(0);
  const uAgentClock: N = uniform(0);
  let clock = 0;

  const sampler = createVatSampler(posTex, nrmTex, iPhase, {
    enabled: uPerAgent,
    clipA: iState.x,
    clipB: iState.y,
    blend: iState.z,
    clock: uAgentClock,
  });
  const uScale: N = uniform(2.5);
  const uPalette: N = uniform(1);
  const uDebug: N = uniform(0);
  const uFaceFlip: N = uniform(1);

  const dir: N = normalize(iHeading.add(vec3(1e-6, 0, 0).xy));
  const c: N = dir.y.mul(uFaceFlip);
  const s: N = dir.x.mul(uFaceFlip);
  const rotY = (v: N): N =>
    vec3(
      v.x.mul(c).add(v.z.mul(s)),
      v.y,
      v.x.negate().mul(s).add(v.z.mul(c)),
    );

  const material = new THREE.MeshStandardNodeMaterial({
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const local: N = sampler
    .localPosition(sampler.vertexColumn)
    .mul(uScale)
    .mul(aScale);
  material.positionNode = rotY(local).add(iPos);

  const vNormal: N = varying(rotY(sampler.texNormal()));
  material.normalNode = (transformNormalToView as N)(normalize(vNormal));

  const dormant = vec3(0.58, 0.57, 0.56);
  const baseColor: N = mix(dormant, aColor, uPalette);

  const speed: N = length(iVel.xz);
  const speedColor: N = mix(
    vec3(0.15, 0.25, 0.9),
    vec3(0.95, 0.25, 0.15),
    clamp(speed.mul(1.2), 0, 1),
  );
  const headingColor: N = vec3(dir.x.mul(0.5).add(0.5), 0.35, dir.y.mul(0.5).add(0.5));
  // debug 3 (alvo): R = distância ao alvo /20, G = tem-alvo (w), B = 0.
  const tgtColor: N = vec3(
    clamp(length(iTarget.xz.sub(iPos.xz)).div(20), 0, 1),
    iTarget.w,
    0,
  );
  // debug 4 (estado): cinza=parado · verde=andando · laranja=correndo ·
  // azul=assentado-idle · roxo=rezando (stateId vive em floor(states.w)).
  const stId: N = iState.w.floor();
  const stateColor: N = select(
    stId.lessThan(0.5),
    vec3(0.72, 0.72, 0.72),
    select(
      stId.lessThan(1.5),
      vec3(0.2, 0.85, 0.3),
      select(
        stId.lessThan(2.5),
        vec3(1.0, 0.45, 0.08),
        select(stId.lessThan(3.5), vec3(0.25, 0.45, 1.0), vec3(0.85, 0.25, 0.95)),
      ),
    ),
  );

  material.colorNode = select(
    uDebug.lessThan(0.5),
    baseColor,
    select(
      uDebug.lessThan(1.5),
      speedColor,
      select(
        uDebug.lessThan(2.5),
        headingColor,
        select(uDebug.lessThan(3.5), tgtColor, stateColor),
      ),
    ),
  );

  return {
    material,
    sampler,
    setScale: (v) => {
      uScale.value = v;
    },
    setPaletteAmount: (v) => {
      uPalette.value = v;
    },
    setDebugMode: (v) => {
      uDebug.value = v;
    },
    setFaceFlip: (v) => {
      uFaceFlip.value = v;
    },
    setPerAgentStates: (on) => {
      uPerAgent.value = on ? 1 : 0;
    },
    tickAgentClock: (dt) => {
      // relógio compartilhado dos loops por agente: paridade ~18 fps do
      // patch; a fase por instância dessincroniza por cima.
      clock = (clock + dt * vat().fps) % vat().framesPerClip;
      uAgentClock.value = clock;
    },
  };
}
