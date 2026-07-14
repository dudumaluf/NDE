/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame } from "@react-three/fiber";
import type { Content } from "../data/types";
import { clusterColor, desaturate } from "../data/palette";
import {
  buildClusterFormationInfos,
  isClusterFormed,
  tickClusterFormation,
  type ClusterFormationInfo,
} from "../data/clusterFormation";
import { positionMirror } from "../sim/positionMirror";
import { heightJS } from "../scene/heightfield";
import { useFocusReading } from "../ui/focusReadingStore";
import { levaVal } from "../lib/levaRead";

/**
 * Contorno/spline dinâmico dos núcleos (2026-07-14, doc 04): para cada núcleo
 * FORMADO desenha um blob suave no chão ao redor dos membros. Hull RADIAL
 * (12 setores: em cada um, o membro mais distante do centroide vivo + folga)
 * suavizado por Catmull-Rom FECHADO e por lerp temporal (amostra ~0,3 s),
 * com leve "respiração". LineLoop com material discreto (alpha baixo, cor do
 * núcleo dessaturada, depthWrite:false, ~2 cm acima do terreno via heightJS).
 *
 * Custo: 13 núcleos × (12×6) pontos ≈ 900 vértices reescritos por frame na
 * CPU — desprezível. As posições vêm do positionMirror (espelho CPU que
 * hover/follow já mantêm vivo) — nenhum readback novo. O sinal de formação é
 * o MESMO do ClusterLabels (módulo compartilhado clusterFormation), sem
 * duplicar leitura de GPU.
 *
 * Montado em App.tsx (dentro do Canvas) para não tocar CrowdMesh (Multidão).
 */

const NO_LENS = "nenhuma";
/** Setores angulares do hull (pontos de controle da spline). */
const HULL = 12;
/** Subdivisões por segmento Catmull-Rom (suavidade da curva). */
const SEG = 6;
/** Raio mínimo do contorno (núcleo de 1 membro ainda vira um anelzinho). */
const MIN_R = 1.1;
/** Folga radial sobre o membro mais distante (multiplicativa + aditiva). */
const PAD_MUL = 1.16;
const PAD_ADD = 0.7;
/** Constante de tempo do lerp do hull (s) — respira, não pula. */
const SMOOTH_TAU = 0.35;
/** Altura sobre o terreno (m). */
const LIFT = 0.02;

interface OutlineEntry {
  info: ClusterFormationInfo;
  line: THREE.Line;
  material: THREE.LineBasicNodeMaterial;
  positions: Float32Array;
  /** Raio suavizado por setor. */
  rSmooth: Float32Array;
  /** Fase da respiração (estável por núcleo). */
  breathePhase: number;
  cx: number;
  cz: number;
  opacity: number;
  seeded: boolean;
}

/** Catmull-Rom fechado: componente de UM eixo em 4 pontos, param t∈[0,1]. */
function catmull(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    0.5 *
    (2 * p1 +
      (-p0 + p2) * t +
      (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
      (-p0 + 3 * p1 - 3 * p2 + p3) * t3)
  );
}

export function ClusterOutlines({ content }: { content: Content }) {
  const infos = useMemo(() => buildClusterFormationInfos(content), [content]);

  const built = useMemo(() => {
    const group = new THREE.Group();
    const entries: OutlineEntry[] = [];
    for (const info of infos) {
      // +1 vértice: fecha o laço repetindo o 1º ponto (WebGPURenderer não
      // suporta LineLoop — usamos Line com o fecho explícito).
      const positions = new Float32Array((HULL * SEG + 1) * 3);
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
      const material = new THREE.LineBasicNodeMaterial({
        transparent: true,
        depthWrite: false,
      });
      const [r, g, b] = desaturate(clusterColor(info.clusterId), 0.55, 0.9);
      material.color.setRGB(r, g, b);
      material.opacity = 0;
      const line = new THREE.Line(geometry, material);
      line.renderOrder = 6;
      line.frustumCulled = false;
      line.visible = false;
      group.add(line);
      entries.push({
        info,
        line,
        material,
        positions,
        rSmooth: new Float32Array(HULL).fill(MIN_R),
        breathePhase: (info.clusterId * 1.7) % (Math.PI * 2),
        cx: info.centroid[0],
        cz: info.centroid[1],
        opacity: 0,
        seeded: false,
      });
    }
    return { group, entries };
  }, [infos]);

  useEffect(() => {
    const { entries } = built;
    return () => {
      for (const e of entries) {
        e.line.geometry.dispose();
        e.material.dispose();
      }
    };
  }, [built]);

  const outlines = useFocusReading((s) => s.outlines);
  const outlineAlpha = useFocusReading((s) => s.outlineAlpha);

  const sampleTimer = useRef(0.1);
  const clock = useRef(0);
  // Buffers de trabalho reusados (sem alocação por frame).
  const rTarget = useMemo(() => new Float32Array(HULL), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    clock.current += dt;
    const { entries } = built;

    // Gate: gravidade on e nenhuma lente (mesma condição dos rótulos).
    const active =
      levaVal("Data (M3).gravidade", false) &&
      levaVal("Data (M3).lente", NO_LENS) === NO_LENS &&
      levaVal("Demographic lens.dlente", NO_LENS) === NO_LENS;
    const mapScale = levaVal("Data (M3).mapScale", 14);
    const formRadius = levaVal("Data (M3).formRaio", 2.4);
    // Tica a formação (idempotente com o ClusterLabels — só a 1ª chamada
    // da janela de 0,6 s faz trabalho).
    tickClusterFormation(infos, active, mapScale, formRadius);

    const doSample = sampleTimer.current <= 0;
    if (doSample) sampleTimer.current = 0.3;
    sampleTimer.current -= dt;

    for (const e of entries) {
      const formed = active && isClusterFormed(e.info.clusterId);
      const targetOp = outlines && formed ? outlineAlpha : 0;
      e.opacity += (targetOp - e.opacity) * (1 - Math.exp(-dt / 0.45));
      e.material.opacity = e.opacity;
      e.line.visible = e.opacity > 0.004;
      if (!e.line.visible && !doSample) continue;

      // --- amostra o hull radial (~0,3 s) das posições vivas dos membros ---
      if (doSample && positionMirror.ready) {
        let cx = 0;
        let cz = 0;
        let n = 0;
        for (const slot of e.info.memberSlots) {
          if (positionMirror.getPos(slot, tmp)) {
            cx += tmp.x;
            cz += tmp.z;
            n += 1;
          }
        }
        if (n > 0) {
          cx /= n;
          cz /= n;
          e.cx = cx;
          e.cz = cz;
          rTarget.fill(MIN_R);
          for (const slot of e.info.memberSlots) {
            if (!positionMirror.getPos(slot, tmp)) continue;
            const dx = tmp.x - cx;
            const dz = tmp.z - cz;
            const dist = Math.hypot(dx, dz) * PAD_MUL + PAD_ADD;
            const ang = (Math.atan2(dz, dx) + Math.PI * 2) % (Math.PI * 2);
            const bin = ang / ((Math.PI * 2) / HULL);
            // espalha para o setor e os vizinhos (blob que engloba o membro)
            for (let o = -1; o <= 1; o++) {
              const b = ((Math.round(bin) + o) % HULL + HULL) % HULL;
              const falloff = o === 0 ? 1 : 0.86;
              if (dist * falloff > rTarget[b]) rTarget[b] = dist * falloff;
            }
          }
          if (!e.seeded) {
            e.rSmooth.set(rTarget);
            e.seeded = true;
          }
        }
      }

      // --- lerp temporal do raio + respiração + Catmull-Rom fechado ---
      const kS = 1 - Math.exp(-dt / SMOOTH_TAU);
      const breathe = 1 + 0.02 * Math.sin(clock.current * 0.8 + e.breathePhase);
      for (let b = 0; b < HULL; b++) {
        e.rSmooth[b] += (rTarget[b] - e.rSmooth[b]) * (doSample ? kS : 0);
      }
      // pontos de controle do polígono radial
      let w = 0;
      for (let b = 0; b < HULL; b++) {
        const a0 = ((b - 1 + HULL) % HULL);
        const a1 = b;
        const a2 = (b + 1) % HULL;
        const a3 = (b + 2) % HULL;
        const ang0 = (a0 / HULL) * Math.PI * 2;
        const ang1 = (a1 / HULL) * Math.PI * 2;
        const ang2 = (a2 / HULL) * Math.PI * 2;
        const ang3 = (a3 / HULL) * Math.PI * 2;
        const r0 = e.rSmooth[a0] * breathe;
        const r1 = e.rSmooth[a1] * breathe;
        const r2 = e.rSmooth[a2] * breathe;
        const r3 = e.rSmooth[a3] * breathe;
        const p0x = e.cx + Math.cos(ang0) * r0;
        const p0z = e.cz + Math.sin(ang0) * r0;
        const p1x = e.cx + Math.cos(ang1) * r1;
        const p1z = e.cz + Math.sin(ang1) * r1;
        const p2x = e.cx + Math.cos(ang2) * r2;
        const p2z = e.cz + Math.sin(ang2) * r2;
        const p3x = e.cx + Math.cos(ang3) * r3;
        const p3z = e.cz + Math.sin(ang3) * r3;
        for (let s = 0; s < SEG; s++) {
          const t = s / SEG;
          const x = catmull(p0x, p1x, p2x, p3x, t);
          const z = catmull(p0z, p1z, p2z, p3z, t);
          e.positions[w * 3 + 0] = x;
          e.positions[w * 3 + 1] = heightJS(x, z) + LIFT;
          e.positions[w * 3 + 2] = z;
          w += 1;
        }
      }
      // fecha o laço: último vértice = primeiro.
      e.positions[w * 3 + 0] = e.positions[0];
      e.positions[w * 3 + 1] = e.positions[1];
      e.positions[w * 3 + 2] = e.positions[2];
      (e.line.geometry.getAttribute("position") as THREE.BufferAttribute).needsUpdate = true;
    }

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__limiarOutlines = {
        active,
        visible: entries.filter((e) => e.line.visible).length,
        opacity: entries.map((e) => Number(e.opacity.toFixed(3))),
      };
    }
  });

  return <primitive object={built.group} />;
}
