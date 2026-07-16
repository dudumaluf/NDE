/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import {
  float,
  normalize,
  transformNormalToView,
  uniform,
  varying,
  vec3,
} from "three/tsl";
import { createVatSampler, type VatSampler } from "./vatNodes";

type N = any;

export interface CharacterMaterialBundle {
  material: THREE.MeshStandardNodeMaterial;
  sampler: VatSampler;
  setScale(v: number): void;
  /** Pivot em unidades do bake (XZ; alinha pés ao centro antes da escala). */
  setPivot(x: number, z: number): void;
}

/** Material do personagem único (demo de morph): sampler VAT sem fase. */
export function buildCharacterMaterial(
  posTex: THREE.Texture,
  nrmTex: THREE.Texture,
): CharacterMaterialBundle {
  const sampler = createVatSampler(posTex, nrmTex);
  const uScale: N = uniform(2.5);
  const uPivotX: N = uniform(0);
  const uPivotZ: N = uniform(0);

  const material = new THREE.MeshStandardNodeMaterial({
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  const pivot: N = vec3(uPivotX, float(0), uPivotZ);
  material.positionNode = sampler
    .localPosition(sampler.vertexColumn)
    .sub(pivot)
    .mul(uScale);

  const vNormal: N = varying(sampler.texNormal());
  material.normalNode = (transformNormalToView as N)(normalize(vNormal));
  material.colorNode = vec3(0.72, 0.66, 0.62);

  return {
    material,
    sampler,
    setScale: (v) => {
      uScale.value = v;
    },
    setPivot: (x, z) => {
      uPivotX.value = x;
      uPivotZ.value = z;
    },
  };
}
