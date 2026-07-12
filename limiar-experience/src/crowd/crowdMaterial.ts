/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import {
  clamp,
  instancedBufferAttribute,
  length,
  mix,
  normalize,
  select,
  transformNormalToView,
  uniform,
  varying,
  vec3,
} from "three/tsl";
import { createVatSampler, type VatSampler } from "../vat/vatNodes";
import type { CrowdAttributes } from "../vat/vatGeometry";
import type { CrowdSim } from "../sim/CrowdSim";

type N = any;

export interface CrowdMaterialBundle {
  material: THREE.MeshStandardNodeMaterial;
  sampler: VatSampler;
  setScale(v: number): void;
  /** 0 = cinza (dormentes), 1 = paleta por instância (paridade com o patch). */
  setPaletteAmount(v: number): void;
  /** 0 = normal, 1 = cor por velocidade, 2 = cor por direção. */
  setDebugMode(v: number): void;
  /** +1/−1: calibra para onde o modelo "olha" em relação ao movimento. */
  setFaceFlip(v: number): void;
}

/**
 * Material da multidão dirigido pela simulação: posição, direção e fase do
 * passo vêm dos storage buffers da CrowdSim (via toAttribute, compatível com
 * o fallback WebGL2); cor e variação de escala continuam atributos estáticos.
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

  const sampler = createVatSampler(posTex, nrmTex, iPhase);
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

  material.colorNode = select(
    uDebug.lessThan(0.5),
    baseColor,
    select(
      uDebug.lessThan(1.5),
      speedColor,
      select(uDebug.lessThan(2.5), headingColor, tgtColor),
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
  };
}
