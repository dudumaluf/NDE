/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import type { CrowdSim } from "../sim/CrowdSim";
import type { Content } from "../data/types";
import { clusterLabelColor, hexToRgb01 } from "../data/palette";
import { useAppearance } from "../ui/appearanceStore";
import { heightJS } from "../scene/heightfield";

/**
 * Palavras 3D nos núcleos (M3.5): quando um núcleo "se forma" sob a gravidade
 * UMAP, o NOME dele (clusters.json "label") flutua no centro — billboard com
 * fade-in lento; fade-out quando a gravidade desliga ou uma lente reorganiza.
 *
 * Texto: canvas 2D → CanvasTexture num Mesh(Plane) + MeshBasicNodeMaterial,
 * billboard feito na CPU (quaternion da câmera copiado por frame — 12 quads,
 * custo zero). Duas alternativas foram DESCARTADAS por incompatibilidade:
 * troika/drei <Text> injeta GLSL via onBeforeCompile, que o WebGPURenderer
 * não executa; e THREE.Sprite+SpriteNodeMaterial renderiza no WebGPU mas
 * silenciosamente NÃO desenha no fallback WebGL2 do r185 (testado aqui).
 *
 * Detecção de formação: leitura AMOSTRADA das posições reais (readback GPU
 * via getArrayBufferAsync a cada ~0,6 s, nunca por frame) → média das
 * distâncias de cada membro ao SEU alvo UMAP; abaixo de `formRadius` o
 * núcleo está coeso (histerese 1,35× para não piscar na fronteira). Se o
 * readback falhar em algum ambiente, cai na heurística do briefing:
 * gravidade ativa há 8 s = formado.
 */

const LABEL_FONT = '300 72px "Inter", "SF Pro Display", "Helvetica Neue", system-ui, sans-serif';
const LINE_HEIGHT = 90;
const PAD = 28;

/** Um plane 1×1 compartilhado pelos 12 rótulos (escala por sprite). */
const PLANE = /* @__PURE__ */ new THREE.PlaneGeometry(1, 1);

/** Quebra equilibrada em até 2 linhas (rótulos longos: "Encontros durante…"). */
function wrapLabel(text: string, maxChars = 16): string[] {
  if (text.length <= maxChars) return [text];
  const words = text.split(" ");
  let best = [text];
  let bestScore = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    const score = Math.abs(a.length - b.length) + Math.max(a.length, b.length);
    if (score < bestScore) {
      bestScore = score;
      best = [a, b];
    }
  }
  return best;
}

function makeLabelTexture(label: string): {
  texture: THREE.CanvasTexture;
  aspect: number;
} {
  const lines = wrapLabel(label.toUpperCase());
  const measure = document.createElement("canvas").getContext("2d")!;
  measure.font = LABEL_FONT;
  (measure as any).letterSpacing = "0.16em";
  const w = Math.ceil(
    Math.max(...lines.map((l) => measure.measureText(l).width)) + PAD * 2,
  );
  const h = Math.ceil(lines.length * LINE_HEIGHT + PAD * 2);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.font = LABEL_FONT;
  (ctx as any).letterSpacing = "0.16em";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  lines.forEach((line, i) => {
    ctx.fillText(line, w / 2, PAD + LINE_HEIGHT * (i + 0.5));
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return { texture, aspect: w / h };
}

interface LabelEntry {
  sprite: THREE.Mesh;
  material: THREE.MeshBasicNodeMaterial;
  texture: THREE.CanvasTexture;
  clusterId: number;
  /** Centroide do núcleo no espaço UMAP unitário (x, z). */
  centroid: [number, number];
  /** Slot de agente e alvo UMAP unitário (x, z) de cada membro. */
  memberSlots: number[];
  memberTargets: [number, number][];
  /** Altura do sprite no mundo (por nº de membros). */
  height: number;
  aspect: number;
  opacity: number;
  formed: boolean;
}

function buildEntries(content: Content): { group: THREE.Group; entries: LabelEntry[] } {
  const group = new THREE.Group();
  const slotByPerson = new Map<string, number>();
  content.manifest.people.forEach((p, i) => slotByPerson.set(p.id, i));

  const entries: LabelEntry[] = [];
  for (const cluster of content.clusters) {
    const memberSlots: number[] = [];
    const memberTargets: [number, number][] = [];
    let cx = 0;
    let cz = 0;
    for (const id of cluster.members) {
      const slot = slotByPerson.get(id);
      const pos = content.layout[id];
      if (slot === undefined || !pos) continue;
      memberSlots.push(slot);
      memberTargets.push([pos.umap3d[0], pos.umap3d[2]]);
      cx += pos.umap3d[0];
      cz += pos.umap3d[2];
    }
    if (memberSlots.length === 0) continue;
    cx /= memberSlots.length;
    cz /= memberSlots.length;

    const { texture, aspect } = makeLabelTexture(cluster.label);
    const material = new THREE.MeshBasicNodeMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const [r, g, b] = clusterLabelColor(cluster.id);
    material.color.setRGB(r, g, b);
    material.opacity = 0;

    // Tamanho por nº de membros — crescimento logarítmico, sem gritar.
    const height = 0.5 + 0.28 * Math.log(memberSlots.length);
    const sprite = new THREE.Mesh(PLANE, material);
    sprite.scale.set(height * aspect, height, 1);
    sprite.renderOrder = 20;
    sprite.visible = false;
    group.add(sprite);

    entries.push({
      sprite,
      material,
      texture,
      clusterId: cluster.id,
      centroid: [cx, cz],
      memberSlots,
      memberTargets,
      height,
      aspect,
      opacity: 0,
      formed: false,
    });
  }
  return { group, entries };
}

export function ClusterLabels({
  sim,
  content,
  active,
  mapScale,
  formRadius,
}: {
  sim: CrowdSim;
  content: Content;
  /** Gravidade UMAP ligada e nenhuma lente ativa (senão os rótulos mentem). */
  active: boolean;
  mapScale: number;
  formRadius: number;
}) {
  const gl = useThree((s) => s.gl) as unknown as THREE.WebGPURenderer;
  const built = useMemo(() => buildEntries(content), [content]);

  useEffect(() => {
    const { entries } = built;
    return () => {
      for (const e of entries) {
        e.texture.dispose();
        e.material.dispose();
      }
    };
  }, [built]);

  // Cor dos rótulos (grupo Appearance): derivada do núcleo (default) ou
  // fixa — só o tint muda (material.color), as texturas ficam intactas.
  const labelsSeguemNucleo = useAppearance((s) => s.labelsSeguemNucleo);
  const labelsCor = useAppearance((s) => s.labelsCor);
  useEffect(() => {
    for (const e of built.entries) {
      const [r, g, b] = labelsSeguemNucleo
        ? clusterLabelColor(e.clusterId)
        : hexToRgb01(labelsCor);
      e.material.color.setRGB(r, g, b);
    }
  }, [built, labelsSeguemNucleo, labelsCor]);

  const inflight = useRef(false);
  const readBroken = useRef(false);
  const seekTime = useRef(0);
  const sampleTimer = useRef(0.35);
  // 1ª avaliação concluída → opacidade "pula" para o alvo (sem fade): com
  // ?simT= o mundo chega pré-rolado e o screenshot não esperaria 2 s de fade.
  const pendingSnap = useRef(true);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const { entries } = built;
    const camQ = state.camera.quaternion;

    seekTime.current = active ? seekTime.current + dt : 0;
    sampleTimer.current -= dt;

    // --- amostragem (nunca por frame): readback → dispersão por núcleo ---
    if (
      active &&
      !readBroken.current &&
      !inflight.current &&
      sampleTimer.current <= 0
    ) {
      sampleTimer.current = 0.6;
      inflight.current = true;
      gl
        .getArrayBufferAsync(sim.positions.value)
        .then((buf: ArrayBuffer) => {
          const pos = new Float32Array(buf);
          // Stride do elemento difere por backend: WebGPU aloca storage vec3
          // alinhado a 16 bytes (x,y,z,pad); WebGL2/TF devolve packed (x,y,z).
          const stride = pos.length >= sim.maxCount * 4 ? 4 : 3;
          for (const e of entries) {
            let acc = 0;
            for (let k = 0; k < e.memberSlots.length; k++) {
              const s3 = e.memberSlots[k] * stride;
              const dx = pos[s3 + 0] - e.memberTargets[k][0] * mapScale;
              const dz = pos[s3 + 2] - e.memberTargets[k][1] * mapScale;
              acc += Math.hypot(dx, dz);
            }
            const mean = acc / e.memberSlots.length;
            // histerese: entra em formRadius, só sai em 1,35× — sem piscar.
            e.formed = e.formed ? mean < formRadius * 1.35 : mean < formRadius;
            if (pendingSnap.current) e.opacity = active && e.formed ? 0.92 : 0;
          }
          pendingSnap.current = false;
          inflight.current = false;
        })
        .catch(() => {
          readBroken.current = true;
          inflight.current = false;
        });
    }
    // Fallback (briefing): sem readback, "gravidade ativa há N s" = formado.
    if (readBroken.current) {
      const formed = seekTime.current > 8;
      for (const e of entries) e.formed = formed;
    }

    // --- fades + posição (12 sprites, custo desprezível) ---
    for (const e of entries) {
      const target = active && e.formed ? 0.92 : 0;
      const tau = target > e.opacity ? 1.8 : 0.7; // fade-in lento, out mais curto
      e.opacity += (target - e.opacity) * (1 - Math.exp(-dt / tau));
      e.material.opacity = e.opacity;
      e.sprite.visible = e.opacity > 0.012;
      const lx = e.centroid[0] * mapScale;
      const lz = e.centroid[1] * mapScale;
      // Terreno vivo: a palavra flutua sobre a SUPERFÍCIE do núcleo.
      e.sprite.position.set(lx, 2.85 + e.height * 0.55 + heightJS(lx, lz), lz);
      e.sprite.quaternion.copy(camQ); // billboard na CPU
    }

    if (import.meta.env.DEV) {
      const w = window as unknown as Record<string, unknown>;
      w.__limiarLabels = {
        active,
        readBroken: readBroken.current,
        pendingSnap: pendingSnap.current,
        formed: entries.map((e) => e.formed),
        opacity: entries.map((e) => Number(e.opacity.toFixed(3))),
      };
      w.__limiarLabelsGroup = built.group;
    }
  });

  return <primitive object={built.group} />;
}
