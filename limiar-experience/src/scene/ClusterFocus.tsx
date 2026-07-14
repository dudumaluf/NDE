import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Content } from "../data/types";
import { buildClusterFormationInfos } from "../data/clusterFormation";
import { positionMirror } from "../sim/positionMirror";
import { useFocus, clearFocus } from "./focusStore";
import { useFollow } from "../ui/followStore";
import { levaVal } from "../lib/levaRead";
import { heightJS } from "./heightfield";

/**
 * Rig de câmera do modo FOCUS (2026-07-14): quando um núcleo entra em foco
 * (clique num rótulo 3D ou no ícone ⌖ da Legend), a câmera VOA suavemente até
 * enquadrá-lo — target = centroide vivo do núcleo, distância = f(raio do
 * núcleo), preservando o azimute atual. ~1,4 s com smootherstep, sem snap.
 *
 * NÃO usa nem edita o FollowCamera (rig totalmente próprio e simples). Fica
 * bloqueado enquanto followStore.following ≠ null (a câmera já tem dono).
 * Durante o voo o OrbitControls é desligado e a pose é escrita à mão (o drei
 * só chama update() com enabled — então religamos ao pousar, e o next update()
 * lê a pose atual, sem costura). Ao SAIR do foco a câmera NÃO volta: só solta.
 */

const NO_LENS = "nenhuma";
/** Duração do voo (s). */
const FLIGHT_S = 1.4;
/** Altura do olhar sobre o chão do núcleo. */
const LOOK_HEIGHT = 0.9;
/** Elevação da câmera no enquadre (rad acima do horizonte). */
const CAM_ELEVATION = 0.52;
/** Distância = raio×MUL + BASE, clamp — enquadra o núcleo com folga. */
const DIST_MUL = 2.3;
const DIST_BASE = 3.2;
const DIST_MIN = 5;
const DIST_MAX = 42;

function smootherstep(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * x * (x * (x * 6 - 15) + 10);
}

export function ClusterFocus({ content }: { content: Content }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;
  const focused = useFocus((s) => s.cluster);
  const following = useFollow((s) => s.following);

  const infos = useMemo(() => buildClusterFormationInfos(content), [content]);
  const infoById = useMemo(() => {
    const m = new Map<number, ReturnType<typeof buildClusterFormationInfos>[number]>();
    for (const info of infos) m.set(info.clusterId, info);
    return m;
  }, [infos]);

  const startPos = useMemo(() => new THREE.Vector3(), []);
  const startTarget = useMemo(() => new THREE.Vector3(), []);
  const goalPos = useMemo(() => new THREE.Vector3(), []);
  const goalTarget = useMemo(() => new THREE.Vector3(), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);
  const centroid = useMemo(() => new THREE.Vector3(), []);

  const flightFor = useRef<number | null>(null);
  const flightStart = useRef(0);
  const flying = useRef(false);
  const disabled = useRef(false);

  /** Centroide vivo + raio do núcleo (fallback: centroide UMAP × mapScale). */
  const measure = (clusterId: number): { ok: boolean; radius: number } => {
    const info = infoById.get(clusterId);
    if (!info) return { ok: false, radius: 6 };
    const mapScale = levaVal("Data (M3).mapScale", 14);
    let cx = 0;
    let cz = 0;
    let n = 0;
    for (const slot of info.memberSlots) {
      if (positionMirror.getPos(slot, tmp)) {
        cx += tmp.x;
        cz += tmp.z;
        n += 1;
      }
    }
    if (n === 0) {
      // Sem posições vivas: usa o centroide UMAP do layout.
      cx = info.centroid[0] * mapScale;
      cz = info.centroid[1] * mapScale;
      centroid.set(cx, heightJS(cx, cz), cz);
      return { ok: true, radius: 6 };
    }
    cx /= n;
    cz /= n;
    let maxR = 1.5;
    for (const slot of info.memberSlots) {
      if (positionMirror.getPos(slot, tmp)) {
        maxR = Math.max(maxR, Math.hypot(tmp.x - cx, tmp.z - cz));
      }
    }
    centroid.set(cx, heightJS(cx, cz), cz);
    return { ok: true, radius: maxR };
  };

  const beginFlight = (clusterId: number) => {
    if (!controls) return;
    const { radius } = measure(clusterId);
    startPos.copy(camera.position);
    startTarget.copy(controls.target);
    goalTarget.set(centroid.x, centroid.y + LOOK_HEIGHT, centroid.z);
    // Preserva o azimute atual câmera→target.
    const az = Math.atan2(
      camera.position.x - controls.target.x,
      camera.position.z - controls.target.z,
    );
    const dist = Math.min(Math.max(radius * DIST_MUL + DIST_BASE, DIST_MIN), DIST_MAX);
    const horiz = dist * Math.cos(CAM_ELEVATION);
    const up = dist * Math.sin(CAM_ELEVATION);
    goalPos.set(
      goalTarget.x + Math.sin(az) * horiz,
      goalTarget.y + up,
      goalTarget.z + Math.cos(az) * horiz,
    );
    flightFor.current = clusterId;
    flightStart.current = performance.now();
    flying.current = true;
    controls.enabled = false;
    disabled.current = true;
  };

  // Foco mudou → (re)inicia voo, ou solta ao limpar. Bloqueado em follow.
  useEffect(() => {
    if (focused === null || following !== null) {
      flying.current = false;
      if (controls && disabled.current) {
        controls.enabled = true;
        controls.update();
        disabled.current = false;
      }
      // following ativo cancela o foco (a câmera tem outro dono).
      if (focused !== null && following !== null) clearFocus();
      return;
    }
    beginFlight(focused);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focused, following]);

  useFrame(() => {
    if (!flying.current || !controls) return;
    // Segue medindo o centroide vivo durante o voo (o núcleo pode assentar).
    if (flightFor.current !== null) {
      const { ok } = measure(flightFor.current);
      if (ok) goalTarget.set(centroid.x, centroid.y + LOOK_HEIGHT, centroid.z);
    }
    const t = (performance.now() - flightStart.current) / (FLIGHT_S * 1000);
    const k = smootherstep(t);
    camera.position.lerpVectors(startPos, goalPos, k);
    controls.target.lerpVectors(startTarget, goalTarget, k);
    camera.lookAt(controls.target);
    if (t >= 1) {
      flying.current = false;
      controls.enabled = true;
      controls.update();
      disabled.current = false;
    }
    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__limiarFocus = {
        cluster: flightFor.current,
        flying: flying.current,
        k: Number(k.toFixed(3)),
        cam: camera.position.toArray().map((v) => Number(v.toFixed(2))),
      };
    }
  });

  // ESC ou clique no vazio (fora de rótulo/pessoa) sai do foco — sem
  // teleporte. O clique-no-vazio é detectado por um pointerup curto no canvas
  // que não caiu sobre um rótulo (os rótulos consomem o clique deles).
  const gl = useThree((s) => s.gl) as unknown as THREE.WebGPURenderer;
  useEffect(() => {
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") clearFocus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gl]);

  // Solta o controls se o componente desmontar no meio de um voo.
  useEffect(() => {
    return () => {
      if (controls && disabled.current) {
        controls.enabled = true;
        disabled.current = false;
      }
    };
  }, [controls]);

  // Gancho dev p/ sondas headless: focar/soltar sem clique real.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as Record<string, unknown>;
    w.__limiarFocusCluster = (id: number) => {
      // usa o fluxo real (respeita bloqueio por follow / lente).
      if (levaVal("Data (M3).lente", NO_LENS) !== NO_LENS) return;
      import("./focusStore").then((m) => m.focusCluster(id));
    };
    w.__limiarClearFocus = () => clearFocus();
    return () => {
      delete w.__limiarFocusCluster;
      delete w.__limiarClearFocus;
    };
  }, []);

  return null;
}
