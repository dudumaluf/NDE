import * as THREE from "three/webgpu";

/** Geometria "vazia": só reserva vertexCount vértices — a posição real vem da VAT. */
export function buildSoupGeometry(vertexCount: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  fillBaseAttributes(geometry, vertexCount);
  return geometry;
}

export interface CrowdAttributes {
  /** rgb = cor da pessoa, w = variação de escala (um só buffer: WebGPU limita a 8). */
  colorScale: THREE.InstancedBufferAttribute;
}

/**
 * Geometria da multidão: mesma soup + atributo estático por instância
 * (cor+escala num vec4). Posição/direção/fase vêm da CrowdSim (GPU).
 * `InstancedMesh.count` controla quantas instâncias desenham.
 */
export function buildCrowdGeometry(
  vertexCount: number,
  maxInstances: number,
): { geometry: THREE.BufferGeometry; attrs: CrowdAttributes } {
  const geometry = new THREE.BufferGeometry();
  fillBaseAttributes(geometry, vertexCount);

  const attrs: CrowdAttributes = {
    colorScale: new THREE.InstancedBufferAttribute(
      new Float32Array(maxInstances * 4),
      4,
    ),
  };
  geometry.setAttribute("iColorScale", attrs.colorScale);

  return { geometry, attrs };
}

/**
 * Só o atributo de posição (zeros) — serve para o draw count; a posição real
 * vem da VAT. Sem atributo de normal: a normal vem da textura irmã, e cada
 * vertex buffer conta no limite de 8 do WebGPU.
 */
function fillBaseAttributes(geometry: THREE.BufferGeometry, vertexCount: number): void {
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3),
  );
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 1e5);
}
