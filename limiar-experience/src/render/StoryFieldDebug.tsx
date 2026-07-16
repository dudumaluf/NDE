import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame } from "@react-three/fiber";
import type { Content } from "../data/types";
import { heightJS } from "../scene/heightfield";
import { positionMirror } from "../sim/positionMirror";
import { levaVal } from "../lib/levaRead";

/**
 * Debug do story field (2026-07-16): anéis no chão em cada testemunha.
 *
 *  social: salmão = repel radius (bolha), ciano = attract radius (coroa)
 *  repel:  salmão = repel radius (halo)
 */

const MAX_WIT = 128;
const SEG = 48;
const LIFT = 0.11;

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
  line.renderOrder = 14;
  return line;
}

export function StoryFieldDebug({
  visible,
  content,
}: {
  visible: boolean;
  content: Content | null;
}) {
  const built = useMemo(() => {
    const group = new THREE.Group();
    const repel: THREE.Line[] = [];
    const attract: THREE.Line[] = [];
    for (let i = 0; i < MAX_WIT; i++) {
      const r = unitCircleLine("#e87868", 0.38);
      const a = unitCircleLine("#5ec8e8", 0.3);
      repel.push(r);
      attract.push(a);
      group.add(r, a);
    }
    return { group, repel, attract };
  }, []);

  useEffect(() => {
    const disposeLine = (line: THREE.Line) => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    };
    return () => {
      for (const line of built.repel) disposeLine(line);
      for (const line of built.attract) disposeLine(line);
    };
  }, [built]);

  const tmp = useRef(new THREE.Vector3());

  useFrame(() => {
    const { group, repel, attract } = built;
    const mode = levaVal("Field · coupling.storyField", "off") as string;
    const on = visible && mode !== "off" && content !== null;
    group.visible = on;
    if (!on) return;

    const social = mode === "social";
    const attractR = levaVal("Field · coupling.storyRadius", 2);
    const innerR = Math.min(
      levaVal("Field · coupling.storyRepelRadius", 0.55),
      attractR - 0.05,
    );
    const haloR = levaVal("Field · coupling.storyRepelHaloRadius", 2);
    const peopleCount = content.manifest.people.length;

    for (let i = 0; i < MAX_WIT; i++) {
      const rLine = repel[i];
      const aLine = attract[i];
      if (i >= peopleCount || !positionMirror.getPosSmooth(i, tmp.current)) {
        rLine.visible = false;
        aLine.visible = false;
        continue;
      }
      const px = tmp.current.x;
      const pz = tmp.current.z;
      const py = heightJS(px, pz) + LIFT;

      if (social) {
        aLine.position.set(px, py, pz);
        aLine.scale.setScalar(attractR);
        aLine.visible = true;
        rLine.position.set(px, py + 0.01, pz);
        rLine.scale.setScalar(innerR);
        rLine.visible = true;
      } else {
        aLine.visible = false;
        rLine.position.set(px, py, pz);
        rLine.scale.setScalar(haloR);
        rLine.visible = true;
      }
    }

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__limiarStoryFieldDbg = {
        mode,
        attractR: social ? attractR : null,
        repelInnerR: social ? innerR : null,
        repelHaloR: social ? null : haloR,
        witnesses: peopleCount,
      };
    }
  });

  return <primitive object={built.group} />;
}
