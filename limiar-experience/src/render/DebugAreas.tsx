import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame } from "@react-three/fiber";
import type { Content } from "../data/types";
import { groundToViewJS, heightJS } from "../scene/heightfield";

/**
 * Debug de ÁREAS (2026-07-14b, `?debugAreas=1`): overlays wireframe
 * discretos que mostram o PALCO de tudo — a área canônica do wrap como
 * fundamento, e as zonas vivas por cima:
 *
 *  - quadrado do wrap (lado L = 2×contenção, segue o grid) — verde
 *  - círculo de contenção (só com wrap OFF) — âmbar
 *  - anéis dos núcleos (raio de formação nos centroides UMAP×mapScale,
 *    os mesmos alvos dos labels; seguem o ground frame: com a esteira
 *    ligada eles fluem e wrappam como todo agente) — índigo
 *  - campo do ativo (círculo fieldRadius seguindo a pessoa) — rosa
 *  - leme da viagem (seta do heading da esteira a partir da pessoa) — branco
 *
 * CPU-side: <20 objetos Line/LineLoop com LineBasicNodeMaterial, posições
 * atualizadas por frame (barato). Nada disto roda com o toggle off.
 */

const SEG_CIRCLE = 72;
const SEG_SIDE = 12; // pontos por lado do quadrado (acompanha o relevo)

function makeCircle(color: string, opacity = 0.55): THREE.Line {
  const pts = new Float32Array((SEG_CIRCLE + 1) * 3);
  for (let i = 0; i <= SEG_CIRCLE; i++) {
    const a = (i / SEG_CIRCLE) * Math.PI * 2;
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
  line.renderOrder = 15;
  return line;
}

/** Line ABERTA de nPoints (o chamador fecha repetindo o 1º ponto no fim).
 *  three/webgpu NÃO suporta LineLoop — só Line/LineSegments (medido). */
function makeSegments(nPoints: number, color: string, opacity = 0.9): THREE.Line {
  const g = new THREE.BufferGeometry();
  g.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(nPoints * 3), 3),
  );
  const m = new THREE.LineBasicNodeMaterial({
    transparent: true,
    depthWrite: false,
  });
  m.color.set(color);
  m.opacity = opacity;
  const line = new THREE.Line(g, m);
  line.frustumCulled = false;
  line.renderOrder = 16;
  return line;
}

export function DebugAreas({
  visible,
  content,
  mapScale,
  formRadius,
  containRadius,
  worldWrap,
  fieldOn,
  fieldRadius,
  followPos,
  followValid,
  stageHeading,
  stageActive,
}: {
  visible: boolean;
  content: Content | null;
  mapScale: number;
  formRadius: number;
  containRadius: number;
  worldWrap: boolean;
  fieldOn: boolean;
  fieldRadius: number;
  /** Refs vivos do CrowdMesh (posição suavizada da pessoa seguida etc.). */
  followPos: React.MutableRefObject<THREE.Vector3>;
  followValid: React.MutableRefObject<boolean>;
  stageHeading: React.MutableRefObject<THREE.Vector2>;
  stageActive: React.MutableRefObject<boolean>;
}) {
  // Centroides dos núcleos no espaço UMAP unitário (mesma conta dos labels).
  const centroids = useMemo(() => {
    if (!content) return [] as [number, number][];
    const out: [number, number][] = [];
    for (const cluster of content.clusters) {
      let cx = 0;
      let cz = 0;
      let n = 0;
      for (const id of cluster.members) {
        const pos = content.layout[id];
        if (!pos) continue;
        cx += pos.umap3d[0];
        cz += pos.umap3d[2];
        n += 1;
      }
      if (n > 0) out.push([cx / n, cz / n]);
    }
    return out;
  }, [content]);

  const built = useMemo(() => {
    const group = new THREE.Group();
    // Quadrado do wrap: Line fechada (SEG_SIDE×4 + 1 pontos, o último = 1º).
    const square = makeSegments(SEG_SIDE * 4 + 1, "#4ade80", 0.7);
    square.renderOrder = 15;
    const contain = makeCircle("#f59e0b", 0.5);
    const field = makeCircle("#f472b6", 0.7);
    const arrow = makeSegments(2, "#ffffff", 0.9);
    const rings = Array.from({ length: 16 }, () => makeCircle("#818cf8", 0.45));
    group.add(square, contain, field, arrow, ...rings);
    group.visible = false;
    return { group, square, contain, field, arrow, rings };
  }, []);

  useEffect(() => {
    const { group } = built;
    return () => {
      group.traverse((o) => {
        const line = o as THREE.Line;
        if (line.geometry) line.geometry.dispose();
        if (line.material) (line.material as THREE.Material).dispose();
      });
    };
  }, [built]);

  const lastFollow = useRef(new THREE.Vector3());

  useFrame(() => {
    built.group.visible = visible;
    if (!visible) return;
    const L = worldWrap ? containRadius * 2 : 0;

    // Quadrado canônico do wrap (segue o relevo por amostragem).
    built.square.visible = worldWrap;
    if (worldWrap) {
      const attr = built.square.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      const h = L / 2;
      let k = 0;
      const side = (
        x0: number,
        z0: number,
        x1: number,
        z1: number,
      ): void => {
        for (let i = 0; i < SEG_SIDE; i++) {
          const t = i / SEG_SIDE;
          const x = x0 + (x1 - x0) * t;
          const z = z0 + (z1 - z0) * t;
          attr.setXYZ(k++, x, 0.06 + heightJS(x, z), z);
        }
      };
      side(-h, -h, h, -h);
      side(h, -h, h, h);
      side(h, h, -h, h);
      side(-h, h, -h, -h);
      // Fecha a Line repetindo o 1º vértice (LineLoop não existe no WebGPU).
      attr.setXYZ(k, -h, 0.06 + heightJS(-h, -h), -h);
      attr.needsUpdate = true;
    }

    // Círculo de contenção — só faz sentido com o wrap OFF.
    built.contain.visible = !worldWrap;
    if (!worldWrap) {
      built.contain.scale.setScalar(containRadius);
      built.contain.position.y = 0.06;
    }

    // Anéis dos núcleos: ground frame → view (esteira desloca, wrap fecha).
    for (let i = 0; i < built.rings.length; i++) {
      const ring = built.rings[i];
      if (i >= centroids.length) {
        ring.visible = false;
        continue;
      }
      const [vx, vz] = groundToViewJS(
        centroids[i][0] * mapScale,
        centroids[i][1] * mapScale,
      );
      ring.visible = true;
      ring.scale.setScalar(formRadius);
      ring.position.set(vx, 0.08 + heightJS(vx, vz), vz);
    }

    // Campo do ativo + leme da viagem (seguem a pessoa).
    const hasFollow = followValid.current;
    if (hasFollow) lastFollow.current.copy(followPos.current);
    built.field.visible = hasFollow && fieldOn;
    if (built.field.visible) {
      built.field.scale.setScalar(fieldRadius);
      built.field.position.set(
        lastFollow.current.x,
        lastFollow.current.y + 0.1,
        lastFollow.current.z,
      );
    }
    built.arrow.visible = hasFollow && stageActive.current;
    if (built.arrow.visible) {
      const attr = built.arrow.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute;
      const p = lastFollow.current;
      const hd = stageHeading.current;
      attr.setXYZ(0, p.x, p.y + 0.15, p.z);
      attr.setXYZ(1, p.x + hd.x * 2.5, p.y + 0.15, p.z + hd.y * 2.5);
      attr.needsUpdate = true;
    }
  });

  return <primitive object={built.group} />;
}
