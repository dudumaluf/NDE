/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import type { CrowdSim } from "../sim/CrowdSim";
import type { Content } from "../data/types";
import { positionMirror } from "../sim/positionMirror";
import { setHovered } from "../ui/hoverStore";
import { clusterLabelColor, hexToRgb01 } from "../data/palette";
import { useAppearance } from "../ui/appearanceStore";
import { qpNum } from "../lib/urlParams";

/**
 * Hover com nome (M4c, doc 04 §4.1): a pessoa REAL sob o cursor ganha o
 * nome flutuando sobre a cabeça — quem tem história fala; dormentes não
 * respondem. O clique (M4d) vira follow.
 *
 * Picking em SCREEN-SPACE (fix 2026-07-13): a v1 media distância XZ ao
 * ponto do raycast no CHÃO — com o cursor sobre o corpo/cabeça, o raio
 * passa pelo personagem e atinge o chão metros ATRÁS, e o hover falhava
 * ("não tá preciso", Dudu). Agora o torso de cada pessoa (positionMirror,
 * amostra suavizada) é projetado para PIXELS e o acerto é uma elipse na
 * tela do tamanho aparente do corpo (perto = zona maior, naturalmente),
 * com piso em px para gente longe e teto de distância 3D; empate
 * (personagens sobrepostos, câmera baixa) → o mais PRÓXIMO da câmera
 * vence. O cursor vem de pointermove no canvas — o raycast do chão
 * (mouseTarget) continua existindo só para a simulação.
 *
 * Billboard = canvas→CanvasTexture num Mesh(Plane) (técnica do
 * ClusterLabels; Sprite e troika quebram no WebGPU/fallback). Textura por
 * pessoa criada na PRIMEIRA vez que ela é hovered e cacheada.
 */

/** Dimensões do corpo em METROS com person scale 2.5 (default do painel). */
const REF_SCALE = 2.5;
/** Altura real do modelo normalizado ×2,5 (EXRs: 0,7378−0,0448 ≈ 0,70/u). */
const BODY_HEIGHT = 1.75;
/** Centro da elipse de acerto: meio do corpo. */
const TORSO_HEIGHT = BODY_HEIGHT / 2;
/** Semi-eixos da elipse (m): largura generosa, altura pés→acima da cabeça. */
const HIT_HALF_W = 0.55;
const HIT_HALF_H = 1.05;
/** Zona mínima em px (gente longe vira pontinho, mas continua hoverável). */
const MIN_RX_PX = 18;
const MIN_RY_PX = 26;
/** Além disso a pessoa nem entra no picking (do outro lado do mapa). */
const MAX_PICK_DIST = 75;
/** Quase-empate na elipse normalizada → desempata por profundidade. */
const TIE_Q = 0.18;

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
  personScale = REF_SCALE,
}: {
  sim: CrowdSim;
  content: Content;
  personScale?: number;
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

  // Cursor em PIXELS do canvas (coordenadas CSS, as mesmas do state.size).
  const cursor = useRef({ x: 0, y: 0, has: false });
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      cursor.current.x = e.clientX - r.left;
      cursor.current.y = e.clientY - r.top;
      cursor.current.has = true;
    };
    const onLeave = () => {
      cursor.current.has = false;
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, [gl]);

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
  const view = useMemo(() => new THREE.Vector3(), []);
  const shownPos = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const people = content.manifest.people;
    const k = personScale / REF_SCALE;

    // --- picking screen-space: menor distância ao cursor EM PIXELS ---
    let hovered = -1;
    if (forced >= 0 && forced < people.length) {
      hovered = positionMirror.getPosSmooth(forced, tmp) ? forced : -1;
    } else if (positionMirror.ready && cursor.current.has) {
      const camera = state.camera as THREE.PerspectiveCamera;
      const { width, height } = state.size;
      // px por metro a 1 m da câmera (fov vertical) — divide por depth.
      const pxPerM1 = height / (2 * Math.tan((camera.fov * Math.PI) / 360));
      const cx = cursor.current.x;
      const cy = cursor.current.y;
      let bestQ = 1; // 1 = borda da elipse de acerto
      let bestDepth = Infinity;
      for (let i = 0; i < people.length; i++) {
        if (!positionMirror.getPosSmooth(i, tmp)) break;
        tmp.y += TORSO_HEIGHT * k;
        view.copy(tmp).applyMatrix4(camera.matrixWorldInverse);
        const depth = -view.z;
        if (depth < 0.2 || depth > MAX_PICK_DIST) continue; // atrás/longe
        view.applyMatrix4(camera.projectionMatrix); // NDC (divide por w)
        const sx = (view.x * 0.5 + 0.5) * width;
        const sy = (-view.y * 0.5 + 0.5) * height;
        const s = pxPerM1 / depth; // px por metro NA pessoa
        const rx = Math.max(HIT_HALF_W * k * s, MIN_RX_PX);
        const ry = Math.max(HIT_HALF_H * k * s, MIN_RY_PX);
        const qx = (sx - cx) / rx;
        const qy = (sy - cy) / ry;
        const q = Math.sqrt(qx * qx + qy * qy);
        if (q > 1) continue;
        // Menor q vence; quase-empate (sobrepostos na tela, câmera baixa)
        // → quem está mais PERTO da câmera vence.
        if (q < bestQ - TIE_Q || (q < bestQ + TIE_Q && depth < bestDepth)) {
          if (q < bestQ) bestQ = q;
          bestDepth = depth;
          hovered = i;
        }
      }
    }
    setHovered(hovered >= 0 ? hovered : null);
    const cursorStyle = hovered >= 0 ? "pointer" : "";
    if (document.body.style.cursor !== cursorStyle)
      document.body.style.cursor = cursorStyle;

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
      // Amostra suavizada também aqui — o nome flutua sem a escada do
      // readback (mesma fonte do rig de follow).
      if (positionMirror.getPosSmooth(shown.current, shownPos)) {
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
      // Gancho da sonda (follow-probe.mjs): pessoa i → pixel na tela.
      // frac = fração da altura do corpo (0 pés, 0,5 tronco, ~0,88 cabeça).
      // Vetor PRÓPRIO: page.evaluate chega entre frames e não pode sujar os
      // temps do loop de picking.
      const cam = state.camera;
      const el = gl.domElement;
      (window as unknown as Record<string, unknown>).__limiarPersonScreen = (
        i: number,
        frac = 0.5,
      ) => {
        const p = new THREE.Vector3();
        if (!positionMirror.getPosSmooth(i, p)) return null;
        p.y += BODY_HEIGHT * k * frac;
        const dist = p.distanceTo(cam.position);
        p.project(cam);
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + ((p.x + 1) / 2) * rect.width,
          y: rect.top + ((1 - p.y) / 2) * rect.height,
          dist,
          on:
            p.z > -1 &&
            p.z < 1 &&
            Math.abs(p.x) < 0.92 &&
            Math.abs(p.y) < 0.92,
        };
      };
    }
  });

  return <primitive object={mesh} />;
}
