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
  transformNormalToView,
  uniform,
  varying,
  vec3,
  vertexIndex,
} from "three/tsl";
import { VAT } from "./descriptor";

/**
 * Os tipos de @types/three para TSL ainda não expressam bem o estilo
 * encadeado/dinâmico da API (proxy-based). Mantemos os nós como `any`
 * DENTRO deste módulo e expomos os uniforms com tipo estrutural — o resto
 * do app não toca em TSL (recomendação do docs/03 §2: TSL encapsulado).
 */
type N = any;

export interface VatUniforms {
  /** Frame corrente dentro do clipe, contínuo em [0, framesPerClip). */
  frame: { value: number };
  /** Linha-base do clipe na textura (clipIndex × framesPerClip). */
  clipBase: { value: number };
  /** 1 = inverte a ordem das linhas (calibração da orientação do EXR). */
  rowsFlip: { value: number };
  /** Matriz de conversão de espaço bake → mundo Y-up. */
  basis: { value: THREE.Matrix3 };
  /** Offset de recentralização do bake (subtraído antes da basis). */
  offset: { value: THREE.Vector3 };
  /** Escala uniforme do personagem. */
  scale: { value: number };
  /** 1 = normal flat computada da triangle soup, 0 = normal da textura. */
  useFlatNormal: { value: number };
  /** Decodificação da normal da textura: 0 = raw−offset, 1 = raw×2−1, 2 = raw. */
  normalMode: { value: number };
  /** Multiplicador ±1 para virar normais (calibração de winding). */
  normalFlip: { value: number };
  /** 1 = pinta o mesh com a normal (debug visual). */
  showNormals: { value: number };
}

export interface VatMaterialBundle {
  material: THREE.MeshStandardNodeMaterial;
  uniforms: VatUniforms;
}

/**
 * Material TSL do personagem VAT.
 *
 * Cada vértice puxa sua posição/normal da textura pelo vertexIndex (coluna)
 * e pelo frame do clipe (linha), com interpolação linear entre frames
 * adjacentes (o patch cables não fazia — movimento mais suave de graça).
 */
export function buildVatMaterial(
  posTex: THREE.Texture,
  nrmTex: THREE.Texture,
): VatMaterialBundle {
  const uFrame: N = uniform(0);
  const uClipBase: N = uniform(VAT.framesPerClip * 1);
  const uRowsFlip: N = uniform(0);
  const uBasis: N = uniform(new THREE.Matrix3());
  const uOffset: N = uniform(new THREE.Vector3(...VAT.bakeOffset));
  const uScale: N = uniform(1);
  const uUseFlatNormal: N = uniform(1);
  const uNormalMode: N = uniform(0);
  const uNormalFlip: N = uniform(1);
  const uShowNormals: N = uniform(0);

  /** Linha física na textura para um frame lógico do clipe. */
  const rowOf = (frameNode: N): N =>
    select(
      uRowsFlip.greaterThan(0.5),
      float(VAT.textureHeight - 1).sub(uClipBase.add(frameNode)),
      uClipBase.add(frameNode),
    );

  const loadTexel = (tex: THREE.Texture, columnF: N, frameF: N): N =>
    (textureLoad as N)(tex, ivec2(int(columnF), int(rowOf(frameF)))).xyz;

  // Frames adjacentes para o lerp temporal
  const f0: N = uFrame.floor().mod(VAT.framesPerClip);
  const f1: N = f0.add(1).mod(VAT.framesPerClip);
  const fBlend: N = fract(uFrame);

  /** Posição transformada (bake → local Y-up) de uma coluna (vértice) arbitrária. */
  const localPos = (columnF: N): N => {
    const raw = mix(
      loadTexel(posTex, columnF, f0),
      loadTexel(posTex, columnF, f1),
      fBlend,
    );
    return uBasis.mul(raw.sub(uOffset)).mul(uScale);
  };

  const vidF: N = float(vertexIndex);
  const selfPos = localPos(vidF);

  // --- Normal flat: reconstrói o triângulo da soup (vértices em trincas) ---
  const triBase: N = vidF.div(3).floor().mul(3);
  const pA = localPos(triBase);
  const pB = localPos(triBase.add(1));
  const pC = localPos(triBase.add(2));
  const flatNormal = normalize(cross(pB.sub(pA), pC.sub(pA)));

  // --- Normal da textura, com modos de decodificação alternativos ---
  const nRaw: N = mix(
    loadTexel(nrmTex, vidF, f0),
    loadTexel(nrmTex, vidF, f1),
    fBlend,
  );
  const nDecoded: N = select(
    uNormalMode.lessThan(0.5),
    nRaw.sub(uOffset),
    select(uNormalMode.lessThan(1.5), nRaw.mul(2).sub(1), nRaw),
  );
  const texNormal: N = normalize(uBasis.mul(nDecoded));

  const objectNormal: N = normalize(
    select(uUseFlatNormal.greaterThan(0.5), flatNormal, texNormal).mul(uNormalFlip),
  );

  // varying: computa no vertex stage, interpola para o fragment
  const vNormal: N = varying(objectNormal);
  const vNormalColor: N = varying(objectNormal.mul(0.5).add(0.5));

  const material = new THREE.MeshStandardNodeMaterial({
    roughness: 0.55,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });
  material.positionNode = selfPos;
  material.normalNode = (transformNormalToView as N)(normalize(vNormal));
  material.colorNode = mix(vec3(0.72, 0.66, 0.62), vNormalColor, uShowNormals);

  const uniforms: VatUniforms = {
    frame: uFrame,
    clipBase: uClipBase,
    rowsFlip: uRowsFlip,
    basis: uBasis,
    offset: uOffset,
    scale: uScale,
    useFlatNormal: uUseFlatNormal,
    normalMode: uNormalMode,
    normalFlip: uNormalFlip,
    showNormals: uShowNormals,
  };

  return { material, uniforms };
}

/** Geometria "vazia": só reserva vertexCount vértices — a posição real vem da VAT. */
export function buildSoupGeometry(vertexCount: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3),
  );
  const normals = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) normals[i * 3 + 1] = 1;
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 6);
  return geometry;
}
