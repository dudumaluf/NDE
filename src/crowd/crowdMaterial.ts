/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import {
  cos,
  instancedBufferAttribute,
  mix,
  normalize,
  sin,
  transformNormalToView,
  uniform,
  varying,
  vec3,
} from "three/tsl";
import { createVatSampler, type VatSampler } from "../vat/vatNodes";
import type { CrowdAttributes } from "../vat/vatGeometry";

type N = any;

export interface CrowdMaterialBundle {
  material: THREE.MeshStandardNodeMaterial;
  sampler: VatSampler;
  setScale(v: number): void;
  /** 0 = cinza (dormentes), 1 = paleta por instância (paridade com o patch). */
  setPaletteAmount(v: number): void;
}

/**
 * Material da multidão: um draw call, tudo por instância via atributos
 * (posição, yaw, escala, cor, fase de animação). A fase dessincroniza os
 * loops; one-shots ficam síncronos (phaseScale zerado pelo player).
 */
export function buildCrowdMaterial(
  posTex: THREE.Texture,
  nrmTex: THREE.Texture,
  attrs: CrowdAttributes,
): CrowdMaterialBundle {
  const aOffset: N = instancedBufferAttribute(attrs.offset);
  const aYaw: N = instancedBufferAttribute(attrs.yaw);
  const aScale: N = instancedBufferAttribute(attrs.scale);
  const aColor: N = instancedBufferAttribute(attrs.color);
  const aPhase: N = instancedBufferAttribute(attrs.phase);

  const sampler = createVatSampler(posTex, nrmTex, aPhase);
  const uScale: N = uniform(2.5);
  const uPalette: N = uniform(1);

  const rotY = (v: N): N => {
    const c: N = cos(aYaw);
    const s: N = sin(aYaw);
    return vec3(
      v.x.mul(c).add(v.z.mul(s)),
      v.y,
      v.x.negate().mul(s).add(v.z.mul(c)),
    );
  };

  const material = new THREE.MeshStandardNodeMaterial({
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  const local: N = sampler
    .localPosition(sampler.vertexColumn)
    .mul(uScale)
    .mul(aScale);
  material.positionNode = rotY(local).add(aOffset);

  const vNormal: N = varying(rotY(sampler.texNormal()));
  material.normalNode = (transformNormalToView as N)(normalize(vNormal));

  const dormant = vec3(0.58, 0.57, 0.56);
  material.colorNode = mix(dormant, aColor, uPalette);

  return {
    material,
    sampler,
    setScale: (v) => {
      uScale.value = v;
    },
    setPaletteAmount: (v) => {
      uPalette.value = v;
    },
  };
}
