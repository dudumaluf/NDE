import * as THREE from "three/webgpu";

/** Centro do leme: pessoa no chão (atual) ou offset isotrópico no screen-space. */
export type SteerPivotMode = "person" | "screen";

export type SteerSample = {
  /** Direção unitária no plano XZ (0,0 se indefinida). */
  dirX: number;
  dirZ: number;
  /** Comprimento efetivo em metros (chão ou equivalente screen-space). */
  steerLen: number;
  pivotMode: SteerPivotMode;
};

const _view = new THREE.Vector3();
const _right = new THREE.Vector3();
const _forward = new THREE.Vector3();

/** px por metro na profundidade de um ponto do mundo (fov vertical). */
export function pxPerMeterAt(
  camera: THREE.PerspectiveCamera,
  worldX: number,
  worldY: number,
  worldZ: number,
  viewportH: number,
): number {
  _view.set(worldX, worldY, worldZ).applyMatrix4(camera.matrixWorldInverse);
  const depth = Math.max(0.2, -_view.z);
  return (
    viewportH / (2 * Math.tan((camera.fov * Math.PI) / 360)) / depth
  );
}

/**
 * Amostra do leme por frame.
 *
 * **person** — vetor e distância no chão (pessoa → raycast do mouse).
 * **screen** — direção e distância isotrópicas a partir do centro da tela
 * (convertidas para metros na profundidade da pessoa); o raycast no chão
 * continua sendo o alvo visual (`mouseTarget`).
 */
export function computeSteerSample(params: {
  pivotMode: SteerPivotMode;
  mouseMoved: boolean;
  mouseX: number;
  mouseZ: number;
  followX: number;
  followY: number;
  followZ: number;
  pointerNdcX: number;
  pointerNdcY: number;
  camera: THREE.PerspectiveCamera;
  viewportW: number;
  viewportH: number;
}): SteerSample {
  const empty: SteerSample = {
    dirX: 0,
    dirZ: 0,
    steerLen: 0,
    pivotMode: params.pivotMode,
  };
  if (!params.mouseMoved) return empty;

  const {
    pivotMode,
    mouseX,
    mouseZ,
    followX,
    followY,
    followZ,
    pointerNdcX,
    pointerNdcY,
    camera,
    viewportW,
    viewportH,
  } = params;

  if (pivotMode === "person") {
    const vx = mouseX - followX;
    const vz = mouseZ - followZ;
    const steerLen = Math.hypot(vx, vz);
    if (steerLen < 1e-4) return empty;
    return {
      dirX: vx / steerLen,
      dirZ: vz / steerLen,
      steerLen,
      pivotMode,
    };
  }

  const pxPerM = pxPerMeterAt(
    camera,
    followX,
    followY,
    followZ,
    viewportH,
  );
  const pxX = pointerNdcX * (viewportW * 0.5);
  const pxY = pointerNdcY * (viewportH * 0.5);
  const steerLen = Math.hypot(pxX, pxY) / pxPerM;
  if (steerLen < 1e-4) return empty;

  _right.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
  camera.getWorldDirection(_forward);

  let rx = _right.x;
  let rz = _right.z;
  let fx = _forward.x;
  let fz = _forward.z;
  const rLen = Math.hypot(rx, rz);
  const fLen = Math.hypot(fx, fz);
  if (rLen > 1e-4) {
    rx /= rLen;
    rz /= rLen;
  } else {
    rx = 1;
    rz = 0;
  }
  if (fLen > 1e-4) {
    fx /= fLen;
    fz /= fLen;
  } else {
    fx = 0;
    fz = 1;
  }

  let dirX = rx * pointerNdcX + fx * pointerNdcY;
  let dirZ = rz * pointerNdcX + fz * pointerNdcY;
  const dLen = Math.hypot(dirX, dirZ);
  if (dLen < 1e-4) return { ...empty, steerLen };
  dirX /= dLen;
  dirZ /= dLen;

  return { dirX, dirZ, steerLen, pivotMode };
}
