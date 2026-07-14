/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import type { CrowdSim } from "../sim/CrowdSim";
import type { Content } from "../data/types";
import { positionMirror } from "../sim/positionMirror";
import { mouseTarget } from "../sim/mouseTarget";
import { setHovered } from "../ui/hoverStore";
import { clusterLabelColor, hexToRgb01 } from "../data/palette";
import { useAppearance } from "../ui/appearanceStore";
import { qpNum } from "../lib/urlParams";

/**
 * Hover com nome (M4c, doc 04 §4.1): a pessoa REAL mais próxima do mouse
 * ganha o nome flutuando sobre a cabeça — quem tem história fala; dormentes
 * não respondem. O clique (M4d) vira follow.
 *
 * Posições vêm do positionMirror (readback contínuo — nenhum raycast novo:
 * o alvo do mouse no chão já existe, `mouseTarget.point`). Billboard =
 * canvas→CanvasTexture num Mesh(Plane) (técnica do ClusterLabels; Sprite e
 * troika quebram no WebGPU/fallback). Textura por pessoa criada na PRIMEIRA
 * vez que ela é hovered e cacheada — custo zero depois.
 */

const HOVER_RADIUS = 1.2;
const LABEL_HEIGHT = 2.4;
const FADE_S = 0.25;
const NAME_FONT =
  '300 56px "Inter", "SF Pro Display", "Helvetica Neue", system-ui, sans-serif';
const PAD = 22;

const PLANE = /* @__PURE__ */ new THREE.PlaneGeometry(1, 1);

function makeNameTexture(name: string): {
  texture: THREE.CanvasTexture;
  aspect: number;
} {
  const text = name.toUpperCase();
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = NAME_FONT;
  (measure as any).letterSpacing = "0.14em";
  const w = Math.ceil(measure.measureText(text).width + PAD * 2);
  const h = Math.ceil(72 + PAD * 2);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.font = NAME_FONT;
  (ctx as any).letterSpacing = "0.14em";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, w / 2, h / 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, aspect: w / h };
}

export function PersonHover({
  sim,
  content,
}: {
  sim: CrowdSim;
  content: Content;
}) {
  const gl = useThree((s) => s.gl) as unknown as THREE.WebGPURenderer;
  const labelsSeguemNucleo = useAppearance((s) => s.labelsSeguemNucleo);
  const labelsCor = useAppearance((s) => s.labelsCor);

  // ?hover=<i> força a pessoa (screenshots determinísticos sem mouse real).
  const forced = useMemo(() => qpNum("hover", -1), []);

  const mesh = useMemo(() => {
    const material = new THREE.MeshBasicNodeMaterial({
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    material.opacity = 0;
    const m = new THREE.Mesh(PLANE, material);
    m.renderOrder = 24;
    m.visible = false;
    return m;
  }, []);
  const textureCache = useRef(
    new Map<number, { texture: THREE.CanvasTexture; aspect: number }>(),
  );

  useEffect(() => positionMirror.acquire(gl, sim), [gl, sim]);
  useEffect(() => {
    const cache = textureCache.current;
    const material = mesh.material as THREE.MeshBasicNodeMaterial;
    return () => {
      for (const { texture } of cache.values()) texture.dispose();
      cache.clear();
      material.dispose();
      setHovered(null);
      document.body.style.cursor = "";
    };
  }, [mesh]);

  /** Pessoa exibida no momento (o fade segue ela até trocar). */
  const shown = useRef(-1);
  const opacity = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const shownPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const people = content.manifest.people;

    // --- pessoa real mais próxima do mouse em XZ (66 distâncias, CPU) ---
    let hovered = -1;
    if (forced >= 0 && forced < people.length) {
      hovered = positionMirror.getPos(forced, tmp) ? forced : -1;
    } else if (positionMirror.ready) {
      let best = HOVER_RADIUS * HOVER_RADIUS;
      const mx = mouseTarget.point.x;
      const mz = mouseTarget.point.z;
      for (let i = 0; i < people.length; i++) {
        if (!positionMirror.getPos(i, tmp)) break;
        const dx = tmp.x - mx;
        const dz = tmp.z - mz;
        const d2 = dx * dx + dz * dz;
        if (d2 < best) {
          best = d2;
          hovered = i;
        }
      }
    }
    setHovered(hovered >= 0 ? hovered : null);
    const cursor = hovered >= 0 ? "pointer" : "";
    if (document.body.style.cursor !== cursor)
      document.body.style.cursor = cursor;

    // --- troca de pessoa: termina o fade-out antes de adotar a nova ---
    const material = mesh.material as THREE.MeshBasicNodeMaterial;
    if (hovered !== shown.current) {
      if (opacity.current < 0.04) {
        shown.current = hovered;
        if (hovered >= 0) {
          let entry = textureCache.current.get(hovered);
          if (!entry) {
            entry = makeNameTexture(people[hovered].display_name);
            textureCache.current.set(hovered, entry);
          }
          material.map = entry.texture;
          material.needsUpdate = true;
          const h = 0.42;
          mesh.scale.set(h * entry.aspect, h, 1);
        }
      }
    }
    const target = shown.current >= 0 && shown.current === hovered ? 0.95 : 0;
    opacity.current +=
      (target - opacity.current) * (1 - Math.exp(-dt / (FADE_S / 3)));
    material.opacity = opacity.current;
    mesh.visible = opacity.current > 0.015;

    if (mesh.visible && shown.current >= 0) {
      if (positionMirror.getPos(shown.current, shownPos)) {
        mesh.position.set(shownPos.x, shownPos.y + LABEL_HEIGHT, shownPos.z);
      }
      mesh.quaternion.copy(state.camera.quaternion);
      const person = people[shown.current];
      const [r, g, b] = labelsSeguemNucleo
        ? clusterLabelColor(person.cluster_id)
        : hexToRgb01(labelsCor);
      material.color.setRGB(r, g, b);
    }

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__limiarHover = {
        hovered,
        shown: shown.current,
        opacity: Number(opacity.current.toFixed(3)),
        mirrorReady: positionMirror.ready,
        mirrorBroken: positionMirror.broken,
      };
    }
  });

  return <primitive object={mesh} />;
}
