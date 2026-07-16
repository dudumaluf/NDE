/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import type { CrowdSim } from "../sim/CrowdSim";
import type { Content } from "../data/types";
import { clusterLabelColor, hexToRgb01 } from "../data/palette";
import { useAppearance } from "../ui/appearanceStore";
import { useFocusReading } from "../ui/focusReadingStore";
import { heightJS } from "../scene/heightfield";
import {
  buildClusterFormationInfos,
  formationEvaluated,
  isClusterFormed,
  tickClusterFormation,
  type ClusterFormationInfo,
} from "../data/clusterFormation";
import { positionMirror } from "../sim/positionMirror";
import { focusCluster, clearFocus, useFocus } from "../scene/focusStore";

/**
 * Palavras 3D nos núcleos (M3.5 + hierarquia 2026-07-14): quando um núcleo
 * "se forma" sob a gravidade UMAP, o NOME dele flutua no centro — billboard
 * canvas→plane com fade-in lento. Duas alternativas foram DESCARTADAS por
 * incompatibilidade: troika/drei <Text> (injeta GLSL via onBeforeCompile, que
 * o WebGPURenderer não executa) e THREE.Sprite (não desenha no fallback
 * WebGL2 do r185).
 *
 * NOVO (hierarquia visual):
 *  1. Anti-colisão em ESPAÇO DE TELA: os centros são projetados por frame
 *     (≤13), pares sobrepostos (AABB do quad projetado) são resolvidos com
 *     offset VERTICAL suave por prioridade (núcleo MAIOR fica no lugar; o
 *     menor sobe, animado por spring) + leve fade do menor quando a
 *     sobreposição persiste (câmera longe). Prioridade = nº de membros.
 *  2. Escala levemente decrescente com a distância da câmera (clamp) —
 *     hierarquia de leitura.
 *  3. Rótulo CLICÁVEL → modo FOCUS do núcleo (voo de câmera + destaque +
 *     painel). Picking em screen-space (mesma projeção da anti-colisão);
 *     cursor pointer no hover. Clique no vazio sai do foco.
 *
 * O sinal de FORMAÇÃO agora vem do módulo compartilhado clusterFormation
 * (lê o positionMirror — sem readback próprio; o ClusterOutlines usa o mesmo).
 * Posição no mundo: centroide VIVO dos membros via positionMirror (não o
 * alvo UMAP estático) — acompanha quando uma testemunha é arrastada no follow.
 */

const LABEL_FONT = '300 72px "Inter", "SF Pro Display", "Helvetica Neue", system-ui, sans-serif';
const LINE_HEIGHT = 90;
const PAD = 28;
/** Margem entre rótulos empilhados (px). */
const STACK_MARGIN = 5;
/** Escala mínima com a distância (clamp) — legível de longe. */
const MIN_SCALE_MUL = 0.62;
/** Distância (m) de referência p/ o falloff de escala. */
const SCALE_FAR = 60;

/** Um plane 1×1 compartilhado pelos rótulos (escala por sprite). */
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
  /** Nº de membros — prioridade da anti-colisão (maior fica no lugar). */
  size: number;
  /** Altura-base do sprite no mundo (por nº de membros). */
  height: number;
  aspect: number;
  opacity: number;
  /** Offset vertical em PIXELS (anti-colisão) + velocidade da spring. */
  offsetPx: number;
  offsetVel: number;
  /** Fade extra por aglomeração (câmera longe). */
  crowdFade: number;
  /** Estado projetado no frame (px). */
  sx: number;
  sy: number;
  halfW: number;
  halfH: number;
  onScreen: boolean;
  /** Metros por pixel na profundidade do rótulo (offset px→mundo). */
  mpp: number;
  /** Posição-base no mundo (antes do offset da anti-colisão). */
  worldX: number;
  worldY: number;
  worldZ: number;
}

function buildEntries(content: Content): { group: THREE.Group; entries: LabelEntry[] } {
  const group = new THREE.Group();
  const slotByPerson = new Map<string, number>();
  content.manifest.people.forEach((p, i) => slotByPerson.set(p.id, i));

  const entries: LabelEntry[] = [];
  for (const cluster of content.clusters) {
    let cx = 0;
    let cz = 0;
    let n = 0;
    for (const id of cluster.members) {
      const pos = content.layout[id];
      if (slotByPerson.get(id) === undefined || !pos) continue;
      cx += pos.umap3d[0];
      cz += pos.umap3d[2];
      n += 1;
    }
    if (n === 0) continue;
    cx /= n;
    cz /= n;

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
    const height = 0.5 + 0.28 * Math.log(n);
    const sprite = new THREE.Mesh(PLANE, material);
    sprite.scale.set(height * aspect, height, 1);
    sprite.renderOrder = 20;
    sprite.visible = false;
    sprite.userData.clusterId = cluster.id;
    group.add(sprite);

    entries.push({
      sprite,
      material,
      texture,
      clusterId: cluster.id,
      centroid: [cx, cz],
      size: n,
      height,
      aspect,
      opacity: 0,
      offsetPx: 0,
      offsetVel: 0,
      crowdFade: 0,
      sx: 0,
      sy: 0,
      halfW: 0,
      halfH: 0,
      onScreen: false,
      mpp: 1,
      worldX: 0,
      worldY: 0,
      worldZ: 0,
    });
  }
  return { group, entries };
}

export function ClusterLabels({
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
  const infos = useMemo(() => buildClusterFormationInfos(content), [content]);
  const infoById = useMemo(() => {
    const m = new Map<number, ClusterFormationInfo>();
    for (const info of infos) m.set(info.clusterId, info);
    return m;
  }, [infos]);

  useEffect(() => {
    const { entries } = built;
    return () => {
      for (const e of entries) {
        e.texture.dispose();
        e.material.dispose();
      }
    };
  }, [built]);

  // Cor dos rótulos (grupo Appearance): derivada do núcleo (default) ou fixa.
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

  const antiOverlap = useFocusReading((s) => s.labelAntiOverlap);
  const distFalloff = useFocusReading((s) => s.labelDistScale);
  const focusedCluster = useFocus((s) => s.cluster);

  // 1ª avaliação da formação → opacidade "pula" p/ o alvo (screenshots).
  const pendingSnap = useRef(true);
  const hovered = useRef(-1);
  const camUp = useMemo(() => new THREE.Vector3(), []);
  const world = useMemo(() => new THREE.Vector3(), []);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const centroidTmp = useMemo(() => new THREE.Vector3(), []);

  // Cursor do mouse em px do canvas (screen-space picking dos rótulos).
  const cursor = useRef({ x: 0, y: 0, has: false });
  useEffect(() => {
    const el = gl.domElement;
    const onMove = (ev: PointerEvent) => {
      const r = el.getBoundingClientRect();
      cursor.current.x = ev.clientX - r.left;
      cursor.current.y = ev.clientY - r.top;
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

  // Clique (não arrasto): rótulo → foco; vazio → sai do foco.
  useEffect(() => {
    const el = gl.domElement;
    let down: { x: number; y: number; t: number } | null = null;
    const onDown = (ev: PointerEvent) => {
      down = { x: ev.clientX, y: ev.clientY, t: performance.now() };
    };
    const onUp = (ev: PointerEvent) => {
      if (!down) return;
      const moved = Math.hypot(ev.clientX - down.x, ev.clientY - down.y);
      const held = performance.now() - down.t;
      down = null;
      if (moved > 6 || held > 400) return; // arrasto de órbita
      if (hovered.current >= 0) focusCluster(hovered.current);
      else if (useFocus.getState().cluster !== null) clearFocus();
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.1);
    const { entries } = built;
    const camera = state.camera as THREE.PerspectiveCamera;
    const camQ = camera.quaternion;
    const { width, height: vh } = state.size;

    // Formação compartilhada (idempotente com o ClusterOutlines).
    tickClusterFormation(infos, active, mapScale, formRadius);
    const evaluated = formationEvaluated();

    camUp.setFromMatrixColumn(camera.matrixWorld, 1).normalize();
    const tanHalfFov = Math.tan((camera.fov * Math.PI) / 360);
    const focusEl = focusedCluster;

    // --- pass A: opacidade-alvo + projeção + escala por distância ---
    for (const e of entries) {
      const formed = active && isClusterFormed(e.clusterId);
      let target = formed ? 0.92 : 0;
      // O núcleo em foco nunca some (a câmera está enquadrando ele).
      if (focusEl === e.clusterId && formed) target = 1;
      const tau = target > e.opacity ? 1.8 : 0.7;
      if (pendingSnap.current && evaluated) e.opacity = target;
      else e.opacity += (target - e.opacity) * (1 - Math.exp(-dt / tau));

      const lx0 = e.centroid[0] * mapScale;
      const lz0 = e.centroid[1] * mapScale;
      let lx = lx0;
      let lz = lz0;
      const info = infoById.get(e.clusterId);
      if (positionMirror.ready && info) {
        let cx = 0;
        let cz = 0;
        let n = 0;
        for (const slot of info.memberSlots) {
          if (positionMirror.getPosSmooth(slot, centroidTmp)) {
            cx += centroidTmp.x;
            cz += centroidTmp.z;
            n += 1;
          }
        }
        if (n > 0) {
          lx = cx / n;
          lz = cz / n;
        }
      }
      const baseY = 2.85 + e.height * 0.55 + heightJS(lx, lz);
      world.set(lx, baseY, lz);
      const depth = world.distanceTo(camera.position);
      // Escala: encolhe com a distância (clamp) — hierarquia de leitura.
      const scaleMul =
        1 - distFalloff * (1 - Math.max(MIN_SCALE_MUL, 1 - depth / SCALE_FAR));
      const sMul = Math.max(MIN_SCALE_MUL, Math.min(1, scaleMul));
      e.sprite.scale.set(e.height * e.aspect * sMul, e.height * sMul, 1);

      proj.copy(world).project(camera);
      e.onScreen = proj.z > -1 && proj.z < 1;
      e.sx = (proj.x * 0.5 + 0.5) * width;
      e.sy = (-proj.y * 0.5 + 0.5) * vh;
      // meia-extensão do quad projetada (metros→px): px = m / mpp.
      const mpp = (2 * tanHalfFov * depth) / vh; // metros por pixel
      e.halfH = (e.height * sMul * 0.5) / mpp;
      e.halfW = (e.height * e.aspect * sMul * 0.5) / mpp;
      e.mpp = mpp;
      e.worldX = lx;
      e.worldY = baseY;
      e.worldZ = lz;
    }

    // --- pass B: anti-colisão screen-space (offset vertical por prioridade) ---
    const vis = entries.filter((e) => e.opacity > 0.02 && e.onScreen);
    // maior prioridade (mais membros) primeiro — ele fica no lugar.
    vis.sort((a, b) => b.size - a.size);
    const targetOffset = new Map<LabelEntry, number>();
    for (const e of vis) targetOffset.set(e, 0);
    if (antiOverlap) {
      // Algumas passadas de relaxação resolvem CADEIAS (A empurra B empurra
      // C): o menor sempre sobe acima do maior com que colide. X não muda com
      // o offset vertical, então a convergência é rápida (≤13 rótulos).
      for (let pass = 0; pass < 4; pass++) {
        let moved = false;
        for (let a = 0; a < vis.length; a++) {
          for (let b = a + 1; b < vis.length; b++) {
            const i = vis[a]; // maior prioridade (fixo)
            const j = vis[b]; // menor (sobe)
            const dx = Math.abs(i.sx - j.sx);
            if (dx >= i.halfW + j.halfW) continue; // não sobrepõem em X
            const iy = i.sy + (targetOffset.get(i) as number);
            const jy = j.sy + (targetOffset.get(j) as number);
            // quer j ACIMA de i (y de tela cresce p/ baixo → menor y = acima)
            const desiredJy = iy - i.halfH - j.halfH - STACK_MARGIN;
            if (jy > desiredJy - 0.5) {
              targetOffset.set(j, desiredJy - j.sy);
              moved = true;
            }
          }
        }
        if (!moved) break;
      }
    }

    // --- pass C: spring do offset + fade por aglomeração + posição + billboard ---
    let bestHover = -1;
    let bestHoverArea = Infinity;
    for (const e of entries) {
      const tgt = targetOffset.get(e) ?? 0;
      // spring crítica leve (px)
      const k = 1 - Math.exp(-dt / 0.18);
      e.offsetPx += (tgt - e.offsetPx) * k;
      // fade por aglomeração: quanto mais empurrado, mais desvanece (câmera
      // longe empilha muitos rótulos) — sutil (até ~45%).
      const crowd = Math.min(1, Math.abs(e.offsetPx) / (vh * 0.28));
      e.crowdFade += (crowd - e.crowdFade) * k;

      const eff = e.opacity * (1 - 0.45 * e.crowdFade);
      e.material.opacity = eff;
      e.sprite.visible = eff > 0.012;

      // offset de tela (px, negativo = p/ cima) → deslocamento no mundo pelo
      // vetor UP da câmera (billboard): sobe na tela em qualquer ângulo.
      const worldUp = -e.offsetPx * e.mpp;
      e.sprite.position.set(
        e.worldX + camUp.x * worldUp,
        e.worldY + camUp.y * worldUp,
        e.worldZ + camUp.z * worldUp,
      );
      e.sprite.quaternion.copy(camQ);

      // hover screen-space: cursor dentro do rect final (base + offset).
      if (e.sprite.visible && cursor.current.has) {
        const fy = e.sy + e.offsetPx;
        if (
          Math.abs(cursor.current.x - e.sx) <= e.halfW &&
          Math.abs(cursor.current.y - fy) <= e.halfH
        ) {
          const area = e.halfW * e.halfH;
          if (area < bestHoverArea) {
            bestHoverArea = area;
            bestHover = e.clusterId;
          }
        }
      }
    }
    hovered.current = bestHover;
    if (evaluated) pendingSnap.current = false;

    if (import.meta.env.DEV) {
      const w = window as unknown as Record<string, unknown>;
      w.__limiarLabels = {
        active,
        evaluated,
        hovered: bestHover,
        formed: entries.map((e) => isClusterFormed(e.clusterId)),
        opacity: entries.map((e) => Number(e.opacity.toFixed(3))),
        offsetPx: entries.map((e) => Number(e.offsetPx.toFixed(1))),
      };
      w.__limiarLabelsGroup = built.group;
      // Projeção p/ sondas: clusterId → {x,y} de tela (px).
      w.__limiarLabelScreen = () =>
        entries
          .filter((e) => e.sprite.visible)
          .map((e) => ({
            id: e.clusterId,
            x: Math.round(e.sx),
            y: Math.round(e.sy + e.offsetPx),
            hw: Math.round(e.halfW),
            hh: Math.round(e.halfH),
          }));
    }
  });

  // Cursor pointer sobre rótulo — priority 2 roda DEPOIS do PersonHover (que
  // reseta o cursor em priority 0); só força "pointer", nunca limpa (deixa o
  // PersonHover cuidar quando o cursor não está sobre um rótulo).
  useFrame(() => {
    if (hovered.current >= 0 && document.body.style.cursor !== "pointer") {
      document.body.style.cursor = "pointer";
    }
  }, 2);

  return <primitive object={built.group} />;
}
