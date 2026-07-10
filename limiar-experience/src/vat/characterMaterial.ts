/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import { normalize, transformNormalToView, uniform, varying, vec3 } from "three/tsl";
import { createVatSampler, type VatSampler } from "./vatNodes";

type N = any;

export interface CharacterMaterialBundle {
  material: THREE.MeshStandardNodeMaterial;
  sampler: VatSampler;
  setScale(v: number): void;
}

/** Material do personagem único (demo de morph): sampler VAT sem fase. */
export function buildCharacterMaterial(
  posTex: THREE.Texture,
  nrmTex: THREE.Texture,
): CharacterMaterialBundle {
  const sampler = createVatSampler(posTex, nrmTex);
  const uScale: N = uniform(2.5);

  const material = new THREE.MeshStandardNodeMaterial({
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  material.positionNode = sampler.localPosition(sampler.vertexColumn).mul(uScale);

  const vNormal: N = varying(sampler.texNormal());
  material.normalNode = (transformNormalToView as N)(normalize(vNormal));
  material.colorNode = vec3(0.72, 0.66, 0.62);

  return {
    material,
    sampler,
    setScale: (v) => {
      uScale.value = v;
    },
  };
}
