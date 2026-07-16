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
 * Contorno circular dos núcleos (2026-07-15, doc 04): para cada núcleo
 * FORMADO desenha um anel no chão ao redor dos membros — raio = membro mais
 * distante do centroide vivo + folga, suavizado por lerp temporal (amostra
 * ~0,3 s) com leve "respiração". Line com material discreto (alpha baixo,
 * cor do núcleo dessaturada, depthWrite:false, ~2 cm acima do terreno).
 *
 * Custo: 13 núcleos × 49 vértices ≈ 650 vértices reescritos por frame na
 * CPU — desprezível. Posições do positionMirror; formação compartilhada com
 * ClusterLabels (clusterFormation).
 */

const NO_LENS = "nenhuma";
/** Segmentos do círculo (stroke fechado). */
const CIRCLE_SEG = 48;
/** Raio mínimo do contorno (núcleo de 1 membro ainda vira um anelzinho). */
const MIN_R = 1.1;
/** Folga radial sobre o membro mais distante (multiplicativa + aditiva). */
const PAD_MUL = 1.16;
const PAD_ADD = 0.7;
/** Constante de tempo do lerp do raio (s) — respira, não pula. */
const SMOOTH_TAU = 0.35;
/** Altura sobre o terreno (m). */
const LIFT = 0.02;

interface OutlineEntry {
  info: ClusterFormationInfo;
  line: THREE.Line;
  material: THREE.LineBasicNodeMaterial;
  positions: Float32Array;
  /** Raio suavizado (m). */
  rSmooth: number;
  /** Raio alvo da última amostra (m). */
  rTarget: number;
  /** Fase da respiração (estável por núcleo). */
  breathePhase: number;
  cx: number;
  cz: number;
  opacity: number;
  seeded: boolean;
}

export function ClusterOutlines({ content }: { content: Content }) {
  const infos = useMemo(() => buildClusterFormationInfos(content), [content]);

  const built = useMemo(() => {
    const group = new THREE.Group();
    const entries: OutlineEntry[] = [];
    for (const info of infos) {
      // +1 vértice: fecha o laço repetindo o 1º ponto (WebGPURenderer não
      // suporta LineLoop — usamos Line com o fecho explícito).
      const positions = new Float32Array((CIRCLE_SEG + 1) * 3);
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
        rSmooth: MIN_R,
        rTarget: MIN_R,
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
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1);
    clock.current += dt;
    const { entries } = built;

    // Gate: gravidade on e nenhuma lente (mesma condição dos rótulos).
    const active =
      levaVal("Witnesses.gravidade", false) &&
      levaVal("Witnesses.lente", NO_LENS) === NO_LENS &&
      levaVal("Witnesses.dlente", NO_LENS) === NO_LENS;
    const mapScale = levaVal("Witnesses.mapScale", 14);
    const formRadius = levaVal("Witnesses.formRaio", 2.4);
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

      // --- centroide vivo (cada frame; raio alvo amostrado ~0,3 s) ---
      if (positionMirror.ready) {
        let cx = 0;
        let cz = 0;
        let n = 0;
        let maxDist = MIN_R;
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
          maxDist = MIN_R;
          for (const slot of e.info.memberSlots) {
            if (!positionMirror.getPos(slot, tmp)) continue;
            const dx = tmp.x - cx;
            const dz = tmp.z - cz;
            const dist = Math.hypot(dx, dz) * PAD_MUL + PAD_ADD;
            if (dist > maxDist) maxDist = dist;
          }
          e.rTarget = maxDist;
          if (!e.seeded) {
            e.rSmooth = maxDist;
            e.seeded = true;
          }
        }
      }

      // --- lerp temporal do raio + respiração + círculo ---
      const kS = 1 - Math.exp(-dt / SMOOTH_TAU);
      e.rSmooth += (e.rTarget - e.rSmooth) * (doSample ? kS : 0);
      const breathe = 1 + 0.02 * Math.sin(clock.current * 0.8 + e.breathePhase);
      const r = e.rSmooth * breathe;
      for (let i = 0; i < CIRCLE_SEG; i++) {
        const ang = (i / CIRCLE_SEG) * Math.PI * 2;
        const x = e.cx + Math.cos(ang) * r;
        const z = e.cz + Math.sin(ang) * r;
        e.positions[i * 3 + 0] = x;
        e.positions[i * 3 + 1] = heightJS(x, z) + LIFT;
        e.positions[i * 3 + 2] = z;
      }
      // fecha o laço: último vértice = primeiro.
      const last = CIRCLE_SEG * 3;
      e.positions[last + 0] = e.positions[0];
      e.positions[last + 1] = e.positions[1];
      e.positions[last + 2] = e.positions[2];
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
