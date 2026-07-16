import { useEffect, useMemo } from "react";
import * as THREE from "three/webgpu";
import { useFrame } from "@react-three/fiber";
import {
  STEER_DEADZONE,
  steerOuterRadius,
  steerSpeedFactor,
} from "../crowd/steerConfig";
import { computeSteerSample, type SteerPivotMode } from "../crowd/steerSample";
import { heightJS } from "../scene/heightfield";
import { mouseTarget } from "../sim/mouseTarget";
import { levaVal } from "../lib/levaRead";

/**
 * Debug do leme (2026-07-16): anéis no chão na pessoa seguida.
 *
 *  - anel âmbar = deadzone (parar)
 *  - anel ciano = deadzone + steer speed ramp (velocidade máxima na borda)
 *  - círculo interno = direção + intensidade (modo depende de steer pivot)
 *  - linha magenta = pessoa → centro do knob (direção + velocidade visíveis)
 */

const SEG = 56;
const LIFT = 0.14;

function unitCircleLine(color: string, opacity: number): THREE.Line {
  const pts = new Float32Array((SEG + 1) * 3);
  for (let i = 0; i <= SEG; i++) {
    const a = (i / SEG) * Math.PI * 2;
    pts[i * 3] = Math.cos(a);
    pts[i * 3 + 2] = Math.sin(a);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pts, 3));
  const m = new THREE.LineBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
  });
  m.color.set(color);
  m.opacity = opacity;
  const line = new THREE.Line(g, m);
  line.frustumCulled = false;
  line.renderOrder = 18;
  return line;
}

function segmentLine(color: string, opacity: number): THREE.Line {
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(6), 3));
  const m = new THREE.LineBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
  });
  m.color.set(color);
  m.opacity = opacity;
  const line = new THREE.Line(g, m);
  line.frustumCulled = false;
  line.renderOrder = 19;
  return line;
}

export function SteerWheelDebug({
  visible,
  followPos,
  followValid,
}: {
  visible: boolean;
  followPos: React.MutableRefObject<THREE.Vector3>;
  followValid: React.MutableRefObject<boolean>;
}) {
  const built = useMemo(() => {
    const group = new THREE.Group();
    const dead = unitCircleLine("#e8b84a", 0.42);
    const outer = unitCircleLine("#5ec8e8", 0.34);
    const knob = unitCircleLine("#f2ebe2", 0.78);
    const ray = segmentLine("#d878c8", 0.55);
    group.add(dead, outer, knob, ray);
    return { group, dead, outer, knob, ray };
  }, []);

  useEffect(() => {
    const { dead, outer, knob, ray } = built;
    const disposeLine = (line: THREE.Line) => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    };
    return () => {
      disposeLine(dead);
      disposeLine(outer);
      disposeLine(knob);
      disposeLine(ray);
    };
  }, [built]);

  useFrame((state) => {
    const { group, dead, outer, knob, ray } = built;
    const on =
      visible &&
      followValid.current &&
      levaVal("Stage (treadmill).steerOn", true);
    group.visible = on;
    if (!on) return;

    const ramp = levaVal("Stage (treadmill).steerSpeedRamp", 10);
    const dbgScale = Math.max(
      0.05,
      levaVal("Stage (treadmill).steerDebugScale", 1),
    );
    const pivotMode = levaVal(
      "Stage (treadmill).steerPivot",
      "person",
    ) as SteerPivotMode;
    const outerR = steerOuterRadius(ramp);
    const px = followPos.current.x;
    const pz = followPos.current.z;
    const py = heightJS(px, pz) + LIFT;

    dead.position.set(px, py, pz);
    dead.scale.setScalar(STEER_DEADZONE * dbgScale);

    outer.position.set(px, py, pz);
    outer.scale.setScalar(outerR * dbgScale);

    const sample = computeSteerSample({
      pivotMode,
      mouseMoved: mouseTarget.moved,
      mouseX: mouseTarget.point.x,
      mouseZ: mouseTarget.point.z,
      followX: px,
      followY: followPos.current.y,
      followZ: pz,
      pointerNdcX: state.pointer.x,
      pointerNdcY: state.pointer.y,
      camera: state.camera as THREE.PerspectiveCamera,
      viewportW: state.size.width,
      viewportH: state.size.height,
    });
    const { dirX, dirZ, steerLen } = sample;
    const factor = steerSpeedFactor(steerLen, ramp, true, mouseTarget.moved);

    const rayAttr = ray.geometry.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    rayAttr.setXYZ(0, px, py + 0.02, pz);

    let kx = px;
    let kz = pz;
    if (steerLen > 1e-4 && (dirX !== 0 || dirZ !== 0)) {
      const dist = Math.min(steerLen, outerR) * dbgScale;
      kx = px + dirX * dist;
      kz = pz + dirZ * dist;
      knob.position.set(kx, py + 0.03, kz);
      const knobR = Math.max(
        0.12,
        STEER_DEADZONE * (0.22 + 0.38 * factor),
      );
      knob.scale.setScalar(knobR * dbgScale);
      knob.visible = true;
    } else {
      knob.position.set(px, py + 0.03, pz);
      knob.scale.setScalar(STEER_DEADZONE * 0.18 * dbgScale);
      knob.visible = factor <= 0;
    }

    if (mouseTarget.moved && knob.visible && steerLen > 1e-4) {
      rayAttr.setXYZ(1, kx, py + 0.03, kz);
      ray.visible = true;
    } else {
      ray.visible = false;
    }
    rayAttr.needsUpdate = true;

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__limiarSteerWheel = {
        pivot: [px, pz],
        pivotMode,
        steerLen,
        dir: steerLen > 1e-4 ? [dirX, dirZ] : null,
        deadzone: STEER_DEADZONE,
        outerR,
        dbgScale,
        factor,
        mouse: mouseTarget.moved
          ? [mouseTarget.point.x, mouseTarget.point.z]
          : null,
      };
    }
  });

  return <primitive object={built.group} />;
}
