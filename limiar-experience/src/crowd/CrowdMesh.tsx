import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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
import { fillContentAttributes, fillStaticAttributes } from "./spawn";
import { applyColorEmphasis } from "./colorEmphasis";
import { qpBool, qpNum, qpStr } from "../lib/urlParams";
import { useContent } from "../data/contentStore";
import { computeTargets } from "../data/agentMapping";
import {
  DEMO_LENS_KEYS,
  DEMO_LENS_LABELS,
  classifyDemoLens,
  computeDemoTargets,
  type DemoLensKey,
} from "../data/demoLens";
import { useDemoLens } from "../data/demoLensStore";
import { CrowdWires } from "../render/CrowdWires";
import { ClusterLabels } from "../render/ClusterLabels";
import { setElementLens, useLegend } from "../ui/legendStore";

const NO_LENS = "nenhuma";

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
  const content = useContent((s) => s.content);

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
      value: qpStr<"off" | "velocidade" | "direção" | "alvo">("debug", "off", [
        "off",
        "velocidade",
        "direção",
        "alvo",
      ]),
      options: ["off", "velocidade", "direção", "alvo"],
      label: "debug cor",
    },
  });

  // --- M3: o Campo dirigido pelos dados reais (só aparece com content/) ---
  const lensOptions = useMemo(
    () =>
      content
        ? [NO_LENS, ...content.taxonomy.elementos.map((e) => e.key)]
        : [NO_LENS],
    [content],
  );
  const [d, setD] = useControls(
    "Dados (M3)",
    () => ({
      gravidade: { value: qpBool("gravity", false), label: "gravidade (UMAP)" },
      mapScale: {
        value: qpNum("mapScale", 14),
        min: 4,
        max: 30,
        label: "escala do mapa",
      },
      gravForca: { value: qpNum("gravForca", 2.2), min: 0.3, max: 6, label: "gravidade força" },
      lente: {
        value: qpStr("lens", NO_LENS),
        options: lensOptions,
        label: "lente (elemento)",
      },
      fios: { value: qpBool("wires", true), label: "fios (grafo)" },
      fiosAlpha: {
        value: qpNum("wiresAlpha", 0.22),
        min: 0,
        max: 0.5,
        label: "fios alpha",
      },
      fiosAltura: { value: 1.05, min: 0, max: 2, label: "fios altura" },
      // --- leitura visual (M3.5) ---
      fiosFadePerto: {
        value: qpNum("wiresNear", 6),
        min: 0.5,
        max: 25,
        label: "fios fade: perto",
      },
      fiosFadeLonge: {
        value: qpNum("wiresFar", 14),
        min: 2,
        max: 45,
        label: "fios fade: longe",
      },
      fiosPeso: {
        value: qpNum("wiresGamma", 1.6),
        min: 0.4,
        max: 4,
        label: "fios peso (gama)",
      },
      fiosSoNucleos: {
        value: qpBool("wiresFormed", false),
        label: "fios só núcleos formados",
      },
      palavras: { value: qpBool("labels", true), label: "palavras (núcleos)" },
      formRaio: {
        value: qpNum("formRaio", 2.4),
        min: 0.8,
        max: 8,
        label: "formação raio (coesão)",
      },
    }),
    [lensOptions],
  );

  // --- Lentes demográficas: eixos não-fenomenológicos (sexo, década, …) ---
  const dlensOptions = useMemo(() => {
    const opts: Record<string, string> = { nenhuma: NO_LENS };
    for (const k of DEMO_LENS_KEYS) opts[DEMO_LENS_LABELS[k]] = k;
    return opts;
  }, []);
  const [dl, setDl] = useControls(
    "Lente demográfica",
    () => ({
      dlente: {
        value: qpStr("dlens", NO_LENS, [NO_LENS, ...DEMO_LENS_KEYS]),
        options: dlensOptions,
        label: "lente",
      },
    }),
    [dlensOptions],
  );

  // Exclusão mútua: ativar uma lente desativa a outra (a que MUDOU vence).
  // Na carga com as duas na URL, a demográfica ganha (checada primeiro).
  const prevLens = useRef(NO_LENS);
  const prevDlens = useRef(NO_LENS);
  useEffect(() => {
    const lensChanged = d.lente !== prevLens.current;
    const dlensChanged = dl.dlente !== prevDlens.current;
    prevLens.current = d.lente;
    prevDlens.current = dl.dlente;
    if (dlensChanged && dl.dlente !== NO_LENS && d.lente !== NO_LENS) {
      setD({ lente: NO_LENS });
    } else if (lensChanged && d.lente !== NO_LENS && dl.dlente !== NO_LENS) {
      setDl({ dlente: NO_LENS });
    }
  }, [d.lente, dl.dlente, setD, setDl]);

  // Classificação da lente ativa (46 pessoas, CPU) + legenda para o HUD.
  const demoCls = useMemo(
    () =>
      content && dl.dlente !== NO_LENS
        ? classifyDemoLens(dl.dlente as DemoLensKey, content)
        : null,
    [content, dl.dlente],
  );
  useEffect(() => {
    useDemoLens.setState({ cls: demoCls });
    return () => useDemoLens.setState({ cls: null });
  }, [demoCls]);

  // Publica a lente de ELEMENTO para a Legenda (src/ui/Legend.tsx) e escuta
  // o destaque temporário disparado por clique num chip dela.
  useEffect(() => {
    setElementLens(content && d.lente !== NO_LENS ? d.lente : null);
    return () => setElementLens(null);
  }, [content, d.lente]);
  const legendFlash = useLegend((s) => s.flash);

  const resetRef = useRef(true);
  const initTimeRef = useRef(qpNum("simT", 0));
  const frameCount = useRef(0);

  // Identidade no instanceMatrix (o node de instancing multiplica por ele).
  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    for (let i = 0; i < MAX_GRID * MAX_GRID; i++) mesh.setMatrixAt(i, m);
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  // Cores por instância: núcleo (padrão) ou categoria da lente demográfica
  // ativa — mesma via iColorScale; trocar lente NÃO reseta posições (as
  // pessoas caminham para o novo arranjo) e o rng por seed mantém as escalas.
  // Por cima da cor-base, a ênfase (M3.5): lente de elemento dessatura os
  // não-pertencentes; clique na Legenda dessatura tudo fora do grupo por ~2 s.
  useEffect(() => {
    const count = c.grid * c.grid;
    if (content) {
      fillContentAttributes(attrs, count, c.seed, content, demoCls);
      applyColorEmphasis(attrs, count, content, demoCls, {
        elementLens: d.lente === NO_LENS ? null : d.lente,
        flash: legendFlash,
      });
    } else fillStaticAttributes(attrs, count, c.seed);
  }, [attrs, content, demoCls, c.grid, c.seed, d.lente, legendFlash]);

  // Parâmetros de spawn mudaram → uniforms da sim e agenda reset GPU.
  useEffect(() => {
    const count = c.grid * c.grid;
    sim.u.count.value = count;
    sim.u.gridN.value = c.grid;
    sim.u.spawnArea.value = c.area;
    sim.u.spawnNoise.value = c.ruido;
    sim.u.seed.value = c.seed;
    if (meshRef.current) meshRef.current.count = count;
    resetRef.current = true;
  }, [sim, content, c.grid, c.area, c.ruido, c.seed]);

  // Alvos dos dados (gravidade/lentes) — 46 escritas por mudança, nada por
  // frame. Lente demográfica ativa vence a lente de elemento (exclusão mútua
  // no efeito acima garante que só uma esteja ligada). targetsVersion avisa
  // os fios (modo "só núcleos formados" lê os alvos como atributo).
  const [targetsVersion, setTargetsVersion] = useState(0);
  useEffect(() => {
    if (!content) return;
    if (demoCls) {
      computeDemoTargets(demoCls, MAX_GRID * MAX_GRID, sim.targetsArray, {
        mapScale: d.mapScale,
        containRadius: s.contRaio,
      });
    } else {
      computeTargets(content, MAX_GRID * MAX_GRID, sim.targetsArray, {
        mapScale: d.mapScale,
        containRadius: s.contRaio,
        lens: d.lente === NO_LENS ? null : d.lente,
      });
    }
    sim.commitTargets();
    setTargetsVersion((v) => v + 1);
  }, [content, sim, demoCls, d.mapScale, d.lente, s.contRaio]);

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
    // Gravidade: lente ativa (elemento OU demográfica) força o seek mesmo com
    // o toggle desligado — aplicar uma lente sem gravidade não teria efeito.
    const seekOn = content && (d.gravidade || d.lente !== NO_LENS || demoCls);
    sim.u.seekWeight.value = seekOn ? d.gravForca : 0;
    if (import.meta.env.DEV) {
      const w = window as unknown as Record<string, unknown>;
      w.__limiarSim = {
        seekWeight: sim.u.seekWeight.value,
        lente: d.lente,
        dlente: dl.dlente,
        gravidade: d.gravidade,
        tgt0: Array.from(sim.targetsArray.slice(0, 4)),
        tgt45: Array.from(sim.targetsArray.slice(45 * 4, 45 * 4 + 4)),
        tgtVersion: (sim.targets.value as THREE.BufferAttribute).version,
      };
      w.__limiarReadPositions = async (n: number) => {
        const buf = await gl.getArrayBufferAsync(sim.positions.value);
        const raw = new Float32Array(buf);
        // WebGPU aloca storage vec3 com padding de vec4 (16 B); WebGL2 packed.
        const stride = raw.length >= sim.maxCount * 4 ? 4 : 3;
        const out: number[] = [];
        for (let i = 0; i < n; i++) {
          out.push(raw[i * stride], raw[i * stride + 1], raw[i * stride + 2]);
        }
        return out;
      };
    }

    // O reset (e o pre-roll do ?simT) espera o 2º frame: o leva só entrega os
    // valores reais dos controles após o primeiro commit — no 1º frame um
    // pre-roll rodaria com defaults (ex.: gravidade desligada).
    frameCount.current += 1;
    if (resetRef.current && frameCount.current >= 2) {
      resetRef.current = false;
      sim.reset(gl);
      // simT na URL: pré-roda a simulação (screenshots de estado "assentado")
      const pre = initTimeRef.current;
      initTimeRef.current = 0;
      if (pre > 0) {
        const steps = Math.min(Math.ceil(pre / (1 / 60)), 3600);
        for (let i = 0; i < steps; i++) sim.update(gl, 1 / 60, isWebGPU(gl));
      }
    }
    sim.update(gl, delta, isWebGPU(gl));

    bundle.sampler.applyState(vatPlayer.getState());
    bundle.setScale(c.escala);
    bundle.setPaletteAmount(c.paleta ? 1 : 0);
    bundle.setDebugMode(
      s.debug === "velocidade" ? 1 : s.debug === "direção" ? 2 : s.debug === "alvo" ? 3 : 0,
    );
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
      {content && (
        <CrowdWires
          sim={sim}
          content={content}
          visible={d.fios}
          // No modo "só núcleos formados" sobram poucos fios acesos — o ganho
          // compensa para a estrutura interna dos núcleos continuar legível.
          alpha={d.fiosSoNucleos ? Math.min(d.fiosAlpha * 1.9, 1) : d.fiosAlpha}
          lift={d.fiosAltura}
          fadeNear={d.fiosFadePerto}
          fadeFar={d.fiosFadeLonge}
          weightGamma={d.fiosPeso}
          onlyFormed={d.fiosSoNucleos}
          // 2× o raio de formação: o fio começa a acender ANTES do rótulo
          // aparecer — a chegada se anuncia, a palavra confirma.
          cohesionRadius={d.formRaio * 2}
          targetsVersion={targetsVersion}
        />
      )}
      {content && d.palavras && (
        <ClusterLabels
          sim={sim}
          content={content}
          active={d.gravidade && d.lente === NO_LENS && !demoCls}
          mapScale={d.mapScale}
          formRadius={d.formRaio}
        />
      )}
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </>
  );
}
