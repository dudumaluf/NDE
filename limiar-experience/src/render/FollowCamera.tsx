import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { CrowdSim } from "../sim/CrowdSim";
import type { Content } from "../data/types";
import { positionMirror } from "../sim/positionMirror";
import { useHover } from "../ui/hoverStore";
import {
  lockFollow,
  startFollow,
  stopFollow,
  useFollow,
} from "../ui/followStore";
import { qpNum } from "../lib/urlParams";

/**
 * Rig de câmera do follow (M4d): clique numa pessoa hovered → transição
 * suave (~1,2 s, smootherstep) da câmera e do controls.target até um enquadre
 * em 3ª pessoa (atrás/acima, mantendo o azimute atual); depois, por frame,
 * o delta do movimento da pessoa é somado em target E câmera — o
 * OrbitControls fica LIGADO o tempo todo do lock (órbita/zoom livres ao
 * redor de alguém que caminha). ESC ou clique no vazio solta o rig SEM
 * teleporte. Posições via positionMirror (readback contínuo do M4c).
 *
 * Clique ≠ arrasto: down→up com <6 px de movimento e <400 ms — arrastos de
 * órbita nunca entram/saem do follow por engano.
 */

const TRANSITION_S = 1.2;
/** Alvo: altura do olhar sobre a posição da pessoa (m). */
const LOOK_HEIGHT = 1.1;
/** Câmera: recuo horizontal e elevação sobre o alvo (≈4,5 m de distância). */
const CAM_BACK = 4.0;
const CAM_UP = 2.1;

function smootherstep(t: number): number {
  const k = Math.min(1, Math.max(0, t));
  return k * k * k * (k * (k * 6 - 15) + 10);
}

export function FollowCamera({
  sim,
  content,
}: {
  sim: CrowdSim;
  content: Content;
}) {
  const gl = useThree((s) => s.gl) as unknown as THREE.WebGPURenderer;
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as OrbitControlsImpl | null;

  useEffect(() => positionMirror.acquire(gl, sim), [gl, sim]);

  // ?follow=<i> entra em follow no boot (screenshot determinístico).
  const nPeople = content.manifest.people.length;
  useEffect(() => {
    const forced = qpNum("follow", -1);
    if (forced >= 0 && forced < nPeople) startFollow(forced);
    return () => stopFollow();
  }, [nPeople]);

  // --- clique real (não arrasto) no canvas: entra/sai do follow ---
  useEffect(() => {
    const el = gl.domElement;
    let down: { x: number; y: number; t: number } | null = null;
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY, t: performance.now() };
    };
    const onUp = (e: PointerEvent) => {
      if (!down) return;
      const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y);
      const held = performance.now() - down.t;
      down = null;
      if (moved > 6 || held > 400) return; // arrasto de órbita, não clique
      const { hovered } = useHover.getState();
      if (hovered !== null) startFollow(hovered);
      else if (useFollow.getState().following !== null) stopFollow();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") stopFollow();
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointerup", onUp);
    window.addEventListener("keydown", onKey);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointerup", onUp);
      window.removeEventListener("keydown", onKey);
    };
  }, [gl]);

  const following = useFollow((s) => s.following);
  const phase = useFollow((s) => s.phase);

  /** Início da transição: pose capturada + relógio (0 = esperando espelho). */
  const t0 = useRef(0);
  const startCam = useMemo(() => new THREE.Vector3(), []);
  const startTarget = useMemo(() => new THREE.Vector3(), []);
  const person = useMemo(() => new THREE.Vector3(), []);
  const endTarget = useMemo(() => new THREE.Vector3(), []);
  const endCam = useMemo(() => new THREE.Vector3(), []);
  const desired = useMemo(() => new THREE.Vector3(), []);

  // Nova transição: zera o relógio (a pose é capturada no 1º frame com
  // posição válida — com ?follow= o espelho ainda está esquentando).
  useEffect(() => {
    t0.current = 0;
    if (controls && phase === null) controls.enabled = true;
  }, [following, phase, controls]);

  useFrame(() => {
    if (!controls || following === null) return;
    if (!positionMirror.getPos(following, person)) return;

    if (phase === "transition") {
      if (t0.current === 0) {
        t0.current = performance.now();
        startCam.copy(camera.position);
        startTarget.copy(controls.target);
        controls.enabled = false; // damping não briga com a animação
      }
      const t = (performance.now() - t0.current) / 1000 / TRANSITION_S;
      const k = smootherstep(t);

      // Destino recalculado POR FRAME (a pessoa continua andando): alvo no
      // olhar dela; câmera atrás/acima mantendo o azimute atual.
      endTarget.set(person.x, person.y + LOOK_HEIGHT, person.z);
      const az = Math.atan2(
        camera.position.x - endTarget.x,
        camera.position.z - endTarget.z,
      );
      endCam.set(
        endTarget.x + Math.sin(az) * CAM_BACK,
        endTarget.y + CAM_UP,
        endTarget.z + Math.cos(az) * CAM_BACK,
      );

      camera.position.lerpVectors(startCam, endCam, k);
      controls.target.lerpVectors(startTarget, endTarget, k);

      if (t >= 1) {
        controls.enabled = true;
        lockFollow();
      }
    } else if (phase === "locked") {
      // A pessoa anda → o mundo do orbit anda junto: mesmo delta no alvo e
      // na câmera preserva o enquadre que o visitante escolheu.
      desired.set(person.x, person.y + LOOK_HEIGHT, person.z);
      desired.sub(controls.target);
      controls.target.add(desired);
      camera.position.add(desired);
    }

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__limiarFollow = {
        following,
        phase,
        cam: camera.position.toArray().map((v) => Number(v.toFixed(2))),
        target: controls.target.toArray().map((v) => Number(v.toFixed(2))),
      };
    }
  });

  // Ao sair do follow, o controls volta a mandar de onde parou (sem salto).
  useEffect(() => {
    if (following === null && controls) controls.enabled = true;
  }, [following, controls]);

  return null;
}
