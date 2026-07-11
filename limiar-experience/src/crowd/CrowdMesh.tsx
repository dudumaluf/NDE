import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import { vat } from "../vat/runtime";
import { buildCrowdGeometry } from "../vat/vatGeometry";
import { useVatTextures } from "../vat/useVatTextures";
import { vatPlayer } from "../vat/VatClipPlayer";
import { CrowdSim } from "../sim/CrowdSim";
import { mouseTarget, type MouseMode } from "../sim/mouseTarget";
import { buildCrowdMaterial } from "./crowdMaterial";
import { fillStaticAttributes } from "./spawn";
import { qpBool, qpNum, qpStr } from "../lib/urlParams";

const MAX_GRID = 64; // 4096 pessoas — teto do protótipo

function isWebGPU(gl: unknown): boolean {
  return Boolean(
    (gl as { backend?: { isWebGPUBackend?: boolean } }).backend?.isWebGPUBackend,
  );
}

export function CrowdMesh() {
  const [posTex, nrmTex] = useVatTextures();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const markerRef = useRef<THREE.Mesh>(null);
  const gl = useThree((s) => s.gl) as unknown as THREE.WebGPURenderer;

  const sim = useMemo(() => new CrowdSim(MAX_GRID * MAX_GRID), []);
  const { geometry, attrs } = useMemo(
    () => buildCrowdGeometry(vat().vertexCount, MAX_GRID * MAX_GRID, vat().indices),
    [],
  );
  const bundle = useMemo(
    () => buildCrowdMaterial(posTex, nrmTex, attrs, sim),
    [posTex, nrmTex, attrs, sim],
  );

  const c = useControls("Multidão", {
    grid: {
      value: Math.min(qpNum("grid", 32), MAX_GRID),
      min: 4,
      max: MAX_GRID,
      step: 4,
      label: "grade (N×N)",
    },
    area: { value: qpNum("area", 40), min: 10, max: 80, label: "área spawn" },
    ruido: { value: 0.6, min: 0, max: 2, label: "ruído de spawn" },
    seed: { value: 3, min: 1, max: 9999, step: 1 },
    escala: { value: 2.5, min: 0.5, max: 5, label: "escala pessoa" },
    paleta: { value: true, label: "cores (vs. dormentes)" },
    reset: button(() => {
      resetRef.current = true;
    }),
  });

  const s = useControls("Simulação", {
    maxSpeed: { value: qpNum("speed2", 0.8), min: 0, max: 3, label: "velocidade máx" },
    wander: { value: 1, min: 0, max: 3, label: "wander (peso)" },
    wanderScale: { value: 0.12, min: 0.005, max: 0.4, label: "wander escala" },
    wanderEvolve: { value: 0.12, min: 0, max: 0.5, label: "wander evolução" },
    separacao: { value: qpNum("sep", 1.6), min: 0, max: 4, label: "separação (peso)" },
    sepRaio: { value: 0.7, min: 0.1, max: 2.5, label: "separação raio" },
    contRaio: { value: qpNum("contain", 21), min: 5, max: 45, label: "contenção raio" },
    mouseModo: {
      value: qpStr<MouseMode>("mouse", "atrair", ["off", "atrair", "repelir"]),
      options: ["off", "atrair", "repelir"] as MouseMode[],
      label: "mouse",
    },
    mouseRaio: { value: qpNum("mouseR", 7), min: 1, max: 30, label: "mouse raio" },
    mouseForca: { value: 1.2, min: 0, max: 4, label: "mouse força" },
    giro: { value: 6, min: 0.5, max: 20, label: "giro (suavidade)" },
    passo: { value: 34, min: 5, max: 90, label: "passo/unidade" },
    faceFlip: { value: qpBool("faceflip", false), label: "inverter facing" },
    debug: {
      value: qpStr<"off" | "velocidade" | "direção">("debug", "off", [
        "off",
        "velocidade",
        "direção",
      ]),
      options: ["off", "velocidade", "direção"],
      label: "debug cor",
    },
  });

  const resetRef = useRef(true);
  const initTimeRef = useRef(qpNum("simT", 0));

  // Identidade no instanceMatrix (o node de instancing multiplica por ele).
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < MAX_GRID * MAX_GRID; i++) mesh.setMatrixAt(i, m);
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  // Parâmetros de spawn mudaram → re-preenche atributos e agenda reset GPU.
  useEffect(() => {
    const count = c.grid * c.grid;
    fillStaticAttributes(attrs, count, c.seed);
    sim.u.count.value = count;
    sim.u.gridN.value = c.grid;
    sim.u.spawnArea.value = c.area;
    sim.u.spawnNoise.value = c.ruido;
    sim.u.seed.value = c.seed;
    if (meshRef.current) meshRef.current.count = count;
    resetRef.current = true;
  }, [attrs, sim, c.grid, c.area, c.ruido, c.seed]);

  useFrame((_, delta) => {
    mouseTarget.mode = s.mouseModo;

    sim.u.maxSpeed.value = s.maxSpeed;
    sim.u.wanderWeight.value = s.wander;
    sim.u.wanderScale.value = s.wanderScale;
    sim.u.wanderEvolve.value = s.wanderEvolve;
    sim.u.sepWeight.value = s.separacao;
    sim.u.sepRadius.value = s.sepRaio;
    sim.u.containRadius.value = s.contRaio;
    sim.u.mouseRadius.value = s.mouseRaio;
    sim.u.mouseWeight.value = s.mouseForca;
    sim.u.turnRate.value = s.giro;
    sim.u.phasePerUnit.value = s.passo;

    if (resetRef.current) {
      resetRef.current = false;
      sim.reset(gl);
      // simT na URL: pré-roda a simulação (screenshots de estado "assentado")
      const pre = initTimeRef.current;
      initTimeRef.current = 0;
      if (pre > 0) {
        const steps = Math.min(Math.ceil(pre / (1 / 60)), 1200);
        for (let i = 0; i < steps; i++) sim.update(gl, 1 / 60, isWebGPU(gl));
      }
    }
    sim.update(gl, delta, isWebGPU(gl));

    bundle.sampler.applyState(vatPlayer.getState());
    bundle.setScale(c.escala);
    bundle.setPaletteAmount(c.paleta ? 1 : 0);
    bundle.setDebugMode(s.debug === "velocidade" ? 1 : s.debug === "direção" ? 2 : 0);
    bundle.setFaceFlip(s.faceFlip ? -1 : 1);

    if (markerRef.current) {
      markerRef.current.position.copy(mouseTarget.point);
      markerRef.current.position.y = 0.05;
      markerRef.current.visible = s.mouseModo !== "off";
    }
  });

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[geometry, bundle.material, MAX_GRID * MAX_GRID]}
        frustumCulled={false}
      />
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </>
  );
}
