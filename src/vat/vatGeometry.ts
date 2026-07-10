import * as THREE from "three/webgpu";

/** Geometria "vazia": só reserva vertexCount vértices — a posição real vem da VAT. */
export function buildSoupGeometry(vertexCount: number): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry();
  fillBaseAttributes(geometry, vertexCount);
  return geometry;
}

export interface CrowdAttributes {
  offset: THREE.InstancedBufferAttribute;
  yaw: THREE.InstancedBufferAttribute;
  scale: THREE.InstancedBufferAttribute;
  color: THREE.InstancedBufferAttribute;
  phase: THREE.InstancedBufferAttribute;
}

/**
 * Geometria da multidão: mesma soup + atributos por instância (alocados uma
 * única vez para o máximo; `InstancedMesh.count` controla quantos desenham).
 */
export function buildCrowdGeometry(
  vertexCount: number,
  maxInstances: number,
): { geometry: THREE.BufferGeometry; attrs: CrowdAttributes } {
  const geometry = new THREE.BufferGeometry();
  fillBaseAttributes(geometry, vertexCount);

  const attrs: CrowdAttributes = {
    offset: new THREE.InstancedBufferAttribute(new Float32Array(maxInstances * 3), 3),
    yaw: new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1),
    scale: new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1),
    color: new THREE.InstancedBufferAttribute(new Float32Array(maxInstances * 3), 3),
    phase: new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1),
  };
  geometry.setAttribute("iOffset", attrs.offset);
  geometry.setAttribute("iYaw", attrs.yaw);
  geometry.setAttribute("iScale", attrs.scale);
  geometry.setAttribute("iColor", attrs.color);
  geometry.setAttribute("iPhase", attrs.phase);

  return { geometry, attrs };
}

function fillBaseAttributes(geometry: THREE.BufferGeometry, vertexCount: number): void {
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(vertexCount * 3), 3),
  );
  const normals = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount; i++) normals[i * 3 + 1] = 1;
  geometry.setAttribute("normal", new THREE.BufferAttribute(normals, 3));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 1e5);
}
