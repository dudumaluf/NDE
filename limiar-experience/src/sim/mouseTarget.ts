import * as THREE from "three/webgpu";

export type MouseMode = "off" | "atrair" | "repelir";

/**
 * Alvo do mouse no chão (raycast CPU do R3F), compartilhado entre a cena
 * (que escreve no pointer-move) e a simulação (que lê a cada frame).
 */
export const mouseTarget = {
  point: new THREE.Vector3(0, 0, 0),
  mode: "atrair" as MouseMode,
};
