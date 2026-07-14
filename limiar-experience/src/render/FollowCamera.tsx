import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { CrowdSim } from "../sim/CrowdSim";
import type { Content } from "../data/types";
import { positionMirror } from "../sim/positionMirror";
import { useHover } from "../ui/hoverStore";
import { startFollow, stopFollow, useFollow } from "../ui/followStore";
import { pref } from "../lib/prefs";
import { qpNum } from "../lib/urlParams";

/** Entrada do trace de continuidade (dev): deltas por frame da câmera. */
interface CamTraceEntry {
  /** |Δposição| (m). */
  d: number;
  /** Δorientação (rad) — o snap do M4d era ROTAÇÃO, não posição. */
  a: number;
  /** Δt real do frame (ms) — sondas normalizam para velocidade (hitch ≠ snap). */
  ms: number;
  /** Pessoa seguida no frame (null = fora do follow). */
  f: number | null;
  /** Fase derivada no frame (transition/locked/null) — só para sondas. */
  ph: "transition" | "locked" | null;
}

/**
 * Rig de câmera do follow (M4d; re-arquitetado 2026-07-13 — fix do snap e
 * do jitter): SEM fases. O rig mantém estados próprios — âncora do olhar,
 * offset câmera−âncora e posição SUAVIZADA da pessoa — todos levados ao
 * destino por springs criticamente amortecidas (smooth damp) por frame,
 * com o destino recalculado enquanto a pessoa anda. A "transição" é a
 * spring convergindo e o lock É a spring convergida: não existe costura.
 *
 * Por que a v1 dava snap: a transição desligava controls.enabled (o drei só
 * chama controls.update() com enabled), então NADA girava o quaternion da
 * câmera durante a viagem — a posição andava, o olhar ficava congelado; ao
 * travar, o primeiro update() aplicava o lookAt acumulado (~8°) num frame
 * só. E o easing usava t ABSOLUTO de wall-clock sobre pontos de partida
 * congelados: qualquer hitch (pre-roll do ?simT, GC) saltava k para 1.
 *
 * OrbitControls fica LIGADO o tempo todo, mas o rig é a fonte única de
 * verdade: depois do update() do drei (prioridade -1), qualquer diferença
 * entre o offset atual e o que o rig escreveu no frame anterior é input
 * REAL (órbita/zoom, incluindo a cauda do damping interno) e re-escreve o
 * offset desejado da spring. Pan fica off durante o follow (brigaria com a
 * âncora); ESC/clique no vazio solta sem teleporte; clicar em OUTRA pessoa
 * re-alveja as MESMAS springs — transição contínua A→B.
 *
 * Anti-jitter (multidão densa, separação alta): a câmera nunca lê a
 * amostra crua do espelho — segue getPosSmooth (interpolação entre
 * readbacks, mata a latência variável) filtrada por MAIS uma spring
 * ("follow smoothing"), que engole o ruído de alta frequência da colisão.
 *
 * Clique ≠ arrasto: down→up com <6 px de movimento e <400 ms — arrastos de
 * órbita nunca entram/saem do follow por engano.
 */

/** Alvo: altura do olhar sobre a posição da pessoa (m). */
const LOOK_HEIGHT = 1.1;
/** Enquadre: recuo horizontal e elevação sobre o alvo (≈4,5 m). */
const CAM_BACK = 4.0;
const CAM_UP = 2.1;
/** Input do usuário = offset pós-update() difere do escrito pelo rig. */
const INPUT_EPS2 = 1e-8;

/**
 * Spring criticamente amortecida (SmoothDamp de Game Programming Gems 4, o
 * mesmo do Unity): leva cur→target sem overshoot, estável com dt variável.
 * `tau` é a constante de tempo (meia-vida ≈ 0,84·tau; convergida ~3·tau).
 */
function smoothDampV3(
  cur: THREE.Vector3,
  target: THREE.Vector3,
  vel: THREE.Vector3,
  tau: number,
  dt: number,
): void {
  const omega = 2 / Math.max(tau, 1e-4);
  const x = omega * dt;
  const decay = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
  const cx = cur.x - target.x;
  const cy = cur.y - target.y;
  const cz = cur.z - target.z;
  const tx = (vel.x + omega * cx) * dt;
  const ty = (vel.y + omega * cy) * dt;
  const tz = (vel.z + omega * cz) * dt;
  vel.x = (vel.x - omega * tx) * decay;
  vel.y = (vel.y - omega * ty) * decay;
  vel.z = (vel.z - omega * tz) * decay;
  cur.x = target.x + (cx + tx) * decay;
  cur.y = target.y + (cy + ty) * decay;
  cur.z = target.z + (cz + tz) * decay;
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

  // Suavização exposta no painel (labels EN; defaults via pref()).
  const f = useControls("Scene", {
    followSmoothing: {
      value: pref("Scene.followSmoothing", 0.25),
      min: 0.05,
      max: 0.8,
      label: "follow smoothing (s)",
      hint: "spring time constant over the person's position — higher absorbs more collision jitter, lower tracks tighter",
    },
    followEase: {
      value: pref("Scene.followEase", 0.35),
      min: 0.1,
      max: 1.2,
      label: "follow ease (s)",
      hint: "spring time constant of the camera travel (enter/switch follow)",
    },
  });

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

  // Estados do rig (câmera = anchor + offset; springs por frame).
  const sample = useMemo(() => new THREE.Vector3(), []);
  const personSmooth = useMemo(() => new THREE.Vector3(), []);
  const personVel = useMemo(() => new THREE.Vector3(), []);
  const anchor = useMemo(() => new THREE.Vector3(), []);
  const anchorVel = useMemo(() => new THREE.Vector3(), []);
  const anchorGoal = useMemo(() => new THREE.Vector3(), []);
  const offset = useMemo(() => new THREE.Vector3(), []);
  const offsetVel = useMemo(() => new THREE.Vector3(), []);
  const offsetGoal = useMemo(() => new THREE.Vector3(), []);
  const writtenOffset = useMemo(() => new THREE.Vector3(), []);
  const userOffset = useMemo(() => new THREE.Vector3(), []);

  /** Pessoa que o rig está servindo (null = rig dormindo). */
  const activeFor = useRef<number | null>(null);
  const seeded = useRef(false);
  const retarget = useRef(false);
  /** Último retarget (ms) — alimenta o `settled` do estado dev. */
  const retargetAt = useRef(0);
  /**
   * Fase DERIVADA para sondas/debug — NÃO dirige nada: o rig é um contínuo
   * ("transition" = springs ainda viajando; "locked" = convergidas).
   */
  const phaseRef = useRef<"transition" | "locked" | null>(null);

  useFrame((_, delta) => {
    if (!controls || following === null) {
      activeFor.current = null;
      phaseRef.current = null;
      if (import.meta.env.DEV) {
        (window as unknown as Record<string, unknown>).__limiarFollowState = {
          following: null,
          phase: null,
          settled: false,
        };
      }
      return;
    }
    const dt = Math.min(delta, 0.1);

    if (following !== activeFor.current) {
      if (activeFor.current === null) seeded.current = false;
      activeFor.current = following;
      retarget.current = true;
      phaseRef.current = "transition";
    }
    // Espelho ainda esquentando (boot com ?follow=): controls segue dono.
    if (!positionMirror.getPosSmooth(following, sample)) return;

    if (!seeded.current || retarget.current) {
      // Consome num frame só o resíduo de damping de um arrasto anterior
      // (dampingFactor=1 aplica o delta inteiro E o zera) — senão a cauda
      // do drag contaria como "input" e cancelaria a viagem da spring.
      const df = controls.dampingFactor;
      controls.dampingFactor = 1;
      controls.update();
      controls.dampingFactor = df;
      // O delta do flush NÃO é input do usuário: re-baseia a referência do
      // detector abaixo, senão num retarget pessoa→pessoa ele sobrescreveria
      // o offsetGoal do enquadre recém-calculado.
      writtenOffset.copy(camera.position).sub(controls.target);
    }
    if (!seeded.current) {
      // O rig NASCE do estado atual da câmera — zero descontinuidade.
      seeded.current = true;
      personSmooth.copy(sample);
      personVel.set(0, 0, 0);
      anchor.copy(controls.target);
      anchorVel.set(0, 0, 0);
      offset.copy(camera.position).sub(controls.target);
      offsetVel.set(0, 0, 0);
      writtenOffset.copy(offset);
      controls.enablePan = false;
    }
    if (retarget.current) {
      // Enquadre desejado: atrás/acima, mantendo o azimute câmera→pessoa
      // do momento do clique (vale para entrar E para trocar de pessoa).
      retarget.current = false;
      retargetAt.current = performance.now();
      // P0 = pose corrente REAL (pós-flush): a spring parte de onde a
      // câmera está — as velocidades ficam, a viagem A→B é contínua.
      offset.copy(camera.position).sub(controls.target);
      anchor.copy(controls.target);
      const az = Math.atan2(
        camera.position.x - sample.x,
        camera.position.z - sample.z,
      );
      offsetGoal.set(Math.sin(az) * CAM_BACK, CAM_UP, Math.cos(az) * CAM_BACK);
    }

    // Órbita/zoom do usuário: o update() do drei (prio -1) já rodou; o que
    // difere do que o rig escreveu no frame anterior é input real e vira o
    // novo offset desejado (o damping interno do controls vive dentro).
    userOffset.copy(camera.position).sub(controls.target);
    if (userOffset.distanceToSquared(writtenOffset) > INPUT_EPS2) {
      offset.copy(userOffset);
      offsetGoal.copy(userOffset);
      offsetVel.set(0, 0, 0);
    }

    // As três springs: pessoa suavizada → âncora do olhar → offset.
    smoothDampV3(personSmooth, sample, personVel, f.followSmoothing, dt);
    anchorGoal.set(
      personSmooth.x,
      personSmooth.y + LOOK_HEIGHT,
      personSmooth.z,
    );
    smoothDampV3(anchor, anchorGoal, anchorVel, f.followEase, dt);
    smoothDampV3(offset, offsetGoal, offsetVel, f.followEase, dt);

    // Fonte única de verdade: rig escreve câmera + target e olha JUNTO com
    // a posição (era o snap da v1: posição andava, olhar congelado).
    controls.target.copy(anchor);
    camera.position.copy(anchor).add(offset);
    camera.lookAt(anchor);
    writtenOffset.copy(offset);

    if (import.meta.env.DEV) {
      // Fase derivada: convergiu quando passou ≥3,5×tau do retarget (98%+ da
      // spring; critério por distância travaria com a pessoa ANDANDO).
      const tauMs = 3500 * Math.max(f.followEase, f.followSmoothing);
      if (performance.now() - retargetAt.current > tauMs)
        phaseRef.current = "locked";
      (window as unknown as Record<string, unknown>).__limiarFollowState = {
        following,
        phase: phaseRef.current,
        settled: phaseRef.current === "locked",
        cam: camera.position.toArray(),
        target: controls.target.toArray(),
        quat: camera.quaternion.toArray(),
        sampleAge: Math.round(positionMirror.sampleAge()),
      };
    }
  });

  // Ganchos dev (scripts/follow-probe.mjs): disparar/soltar o follow pelo
  // fluxo REAL — ?follow= no boot não parte da pose de overview do clique.
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const w = window as unknown as Record<string, unknown>;
    w.__limiarFollow = (i: number) => startFollow(i);
    w.__limiarStopFollow = () => stopFollow();
    return () => {
      delete w.__limiarFollow;
      delete w.__limiarStopFollow;
    };
  }, []);

  // Trace de continuidade (dev): deltas de POSIÇÃO e ÂNGULO da câmera por
  // frame, amostrados em priority 0.5 — depois do controls (-1) e do rig
  // (0), antes do render do PostFX (1): é a pose que vai para a tela.
  const tracePrev = useRef<{
    pos: THREE.Vector3;
    quat: THREE.Quaternion;
    t: number;
    init: boolean;
  }>({
    pos: new THREE.Vector3(),
    quat: new THREE.Quaternion(),
    t: 0,
    init: false,
  });
  useFrame(() => {
    if (!import.meta.env.DEV) return;
    const prev = tracePrev.current;
    const now = performance.now();
    const w = window as unknown as Record<string, unknown>;
    let trace = w.__limiarCamTrace as CamTraceEntry[] | undefined;
    if (!Array.isArray(trace)) {
      trace = [];
      w.__limiarCamTrace = trace;
    }
    if (prev.init) {
      const dot = Math.min(1, Math.abs(camera.quaternion.dot(prev.quat)));
      trace.push({
        d: Number(camera.position.distanceTo(prev.pos).toFixed(5)),
        a: Number((2 * Math.acos(dot)).toFixed(5)),
        ms: Number((now - prev.t).toFixed(2)),
        f: useFollow.getState().following,
        ph: phaseRef.current,
      });
      if (trace.length > 900) trace.splice(0, trace.length - 900);
    }
    prev.pos.copy(camera.position);
    prev.quat.copy(camera.quaternion);
    prev.t = now;
    prev.init = true;
  }, 0.5);

  // Ao sair do follow (ou desmontar), o controls volta a mandar de onde
  // parou — sem salto — e recupera o pan.
  useEffect(() => {
    if (following === null && controls) controls.enablePan = true;
  }, [following, controls]);
  useEffect(() => {
    return () => {
      if (controls) controls.enablePan = true;
    };
  }, [controls]);

  return null;
}
