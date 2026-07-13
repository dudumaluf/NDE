/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import { buildPostPipeline } from "./pipeline";
import { buildHeightFog } from "./heightFog";
import { FxMeter, fmtCost } from "./meter";
import {
  PRESETS,
  PRESET_ORDER,
  isPreset,
  flagsDiff,
  type FxFlags,
  type FxPreset,
} from "./presets";
import { qpHas, qpNum } from "../../lib/urlParams";
import { pref, prefBool, prefNum, prefStr } from "../../lib/prefs";
import { useAppearance } from "../../ui/appearanceStore";

const AUTO_TARGET_FPS = 50;
const AUTO_PROBE_MS = 5000;
const AUTO_DEGRADE_MS = 10000;

type AutoPhase = "probe" | "hold";

interface AutoState {
  phase: AutoPhase;
  candidate: number; // índice em PRESET_ORDER
  phaseStart: number;
  badSince: number | null;
}

function initialPreset(): FxPreset {
  const v = prefStr("fx", "Effects.preset", "leve");
  return isPreset(v) ? v : "leve";
}

/**
 * Pós-processamento + névoa de altura + medição de custo + auto-preset.
 *
 * Monta dentro do Canvas e ASSUME o render (useFrame priority 1 desliga o
 * render automático do R3F): com efeitos de pipeline ativos renderiza pelo
 * RenderPipeline; sem nenhum, chama gl.render direto — bypass de custo zero,
 * idêntico ao comportamento pré-módulo.
 *
 * Cada efeito exibe no leva o custo MEDIDO na máquina (delta da média móvel
 * de ~2s de GPU-time — ou frame-time onde timestamps não existem — capturado
 * no toggle). Presets mudam vários efeitos de uma vez (medição por efeito é
 * cancelada); presets ADJACENTES diferem por um efeito só e medem normal.
 *
 * Auto-preset (?fxauto=1 ou toggle): prova do "alto" para baixo, 5s por
 * degrau, escolhe o mais alto que mantém ≥50fps; depois vigia — 10s
 * contínuos abaixo de 50 degradam um degrau (log [fx-auto] no console).
 * Não re-sobe sozinho (evita oscilação; desligar+ligar o auto re-prova).
 */
export function PostFX() {
  const gl = useThree((s) => s.gl) as unknown as THREE.WebGPURenderer;
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);

  const pipeline = useMemo(
    () => buildPostPipeline(gl, scene, camera),
    [gl, scene, camera],
  );
  const fogHandle = useMemo(() => {
    const h = buildHeightFog(new THREE.Color("#6d6d6d"));
    h.setRange(qpNum("fogNear", 14), qpNum("fogFar", 55));
    return h;
  }, []);
  // Névoa linear clássica — o fallback quando o master está ON mas o efeito
  // de altura está OFF (paridade com o <fog> que morava no Scene.tsx).
  const classicFog = useMemo(
    () =>
      new THREE.Fog("#6d6d6d", qpNum("fogNear", 14), qpNum("fogFar", 55)),
    [],
  );
  // Cor da névoa do grupo Aparência (segue o fundo por default).
  const nevoaCor = useAppearance((s) => s.nevoaCor);
  useEffect(() => {
    fogHandle.setColor(nevoaCor);
    classicFog.color.set(nevoaCor);
  }, [fogHandle, classicFog, nevoaCor]);
  const meter = useMemo(() => new FxMeter(), []);

  // Custos medidos → labels do leva (rebuild do schema via deps).
  const [costsTick, setCostsTick] = useState(0);
  useEffect(() => {
    meter.onCost = (effect, ms) => {
      console.log(`[fx] custo medido de "${effect}": ~${ms.toFixed(2)}ms`);
      setCostsTick((t) => t + 1);
    };
    return () => {
      meter.onCost = null;
    };
  }, [meter]);

  const [autoLabel, setAutoLabel] = useState("");

  const p0 = useMemo(initialPreset, []);
  const f0 = PRESETS[p0];
  // Com ?fx= explícito na URL os flags nascem DO PRESET (screenshot
  // reproduzível ignora o salvo); sem ele, cada flag boota do padrão salvo.
  const fxFromQp = qpHas("fx");
  const flagDefault = (key: keyof FxFlags): boolean =>
    fxFromQp ? f0[key] : pref(`Effects.${key}`, f0[key]);

  const [c, setC] = useControls(
    "Effects",
    () => ({
      preset: {
        value: p0,
        options: [...PRESET_ORDER],
        label: "preset",
      },
      auto: {
        value: prefBool("fxauto", "Effects.auto", false),
        label: `auto (≥${AUTO_TARGET_FPS}fps)${autoLabel}`,
      },
      bloom: {
        value: flagDefault("bloom"),
        label: `bloom${fmtCost(meter.costs.bloom)}`,
      },
      bloomForca: {
        value: pref("Effects.bloomForca", 0.35),
        min: 0,
        max: 1.5,
        label: "bloom força",
      },
      bloomLimiar: {
        value: pref("Effects.bloomLimiar", 0.72),
        min: 0,
        max: 1,
        label: "bloom limiar",
      },
      bloomRaio: {
        value: pref("Effects.bloomRaio", 0.35),
        min: 0,
        max: 1,
        label: "bloom raio",
      },
      ao: {
        value: flagDefault("ao"),
        label: `AO meia-res${fmtCost(meter.costs.ao)}`,
      },
      aoRaio: {
        value: pref("Effects.aoRaio", 0.5),
        min: 0.1,
        max: 2,
        label: "AO raio",
      },
      vinheta: {
        value: flagDefault("vinheta"),
        label: `vinheta${fmtCost(meter.costs.vinheta)}`,
      },
      vinhetaForca: {
        value: pref("Effects.vinhetaForca", 0.55),
        min: 0,
        max: 1,
        label: "vinheta força",
      },
      // Master da névoa: OFF = zero névoa (nem a de altura, nem a linear
      // clássica que existia desde o M0 — "hoje sempre on" resolvido).
      nevoaMaster: {
        value: prefBool("fog", "Effects.nevoaMaster", true),
        label: "névoa (master)",
      },
      nevoa: {
        value: flagDefault("nevoa"),
        label: `névoa altura${fmtCost(meter.costs.nevoa)}`,
      },
      nevoaDensidade: {
        value: pref("Effects.nevoaDensidade", 0.55),
        min: 0,
        max: 2,
        label: "névoa densidade",
      },
      nevoaAltura: {
        value: pref("Effects.nevoaAltura", 2.2),
        min: 0.2,
        max: 8,
        label: "névoa altura (m)",
      },
      nevoaNuvens: {
        value: pref("Effects.nevoaNuvens", 0.65),
        min: 0,
        max: 1,
        label: "névoa nuvens",
      },
      nevoaDeriva: {
        value: pref("Effects.nevoaDeriva", 1),
        min: 0,
        max: 4,
        label: "névoa deriva",
      },
      // Recuo por altura da câmera (god view limpo, chão enevoado): acima
      // desta altura a névoa de distância desvanece e o banco vira camada.
      nevoaRecuo: {
        value: prefNum("fogRecuo", "Effects.nevoaRecuo", 16),
        min: 3,
        max: 80,
        label: "névoa: altura de recuo",
        hint: "altura da câmera (m) a partir da qual a névoa recua — suba além dela e o Campo se revela; 80 ≈ nunca recua",
      },
    }),
    { collapsed: false },
    [costsTick, autoLabel],
  );

  // Snapshot dos controles para o useFrame (leva entrega via re-render).
  const ctrl = useRef(c);
  ctrl.current = c;
  const setCRef = useRef(setC);
  setCRef.current = setC;

  const prevFlags = useRef<FxFlags | null>(null);
  const prevPreset = useRef<FxPreset>(p0);
  const auto = useRef<AutoState | null>(null);
  const lastGpu = useRef<number | null>(null);
  const resolving = useRef(false);
  const fogMode = useRef<"node" | "classic" | "none" | null>(null);

  // Timestamps GPU só no WebGPU: no fallback (ANGLE/Metal) o
  // EXT_disjoint_timer_query devolve durações não confiáveis.
  useEffect(() => {
    const backend = (gl as any).backend as { isWebGPUBackend?: boolean };
    meter.setGpuAllowed(Boolean(backend?.isWebGPUBackend));
  }, [gl, meter]);

  // Mudança vinda de preset/auto chega ao leva com 1+ frames de atraso —
  // suprime a medição por janela para não gravar custo-lixo da transição.
  const suppressMeasureUntil = useRef(0);

  const applyPreset = (p: FxPreset) => {
    suppressMeasureUntil.current = performance.now() + 1500;
    const f = PRESETS[p];
    setCRef.current({
      preset: p,
      bloom: f.bloom,
      ao: f.ao,
      vinheta: f.vinheta,
      nevoa: f.nevoa,
    } as any);
  };

  // Névoa: o PostFX é o dono ÚNICO (Scene.tsx não declara mais <fog>).
  // master OFF → nenhuma névoa; master ON + efeito de altura ON → fogNode
  // TSL; master ON + altura OFF → THREE.Fog linear clássico (paridade com o
  // comportamento pré-2026-07-12). Troca só no toggle (rebuild de shaders).
  const applyFog = (master: boolean, height: boolean) => {
    const mode = !master ? "none" : height ? "node" : "classic";
    if (fogMode.current === mode) return;
    fogMode.current = mode;
    const s = scene as any;
    s.fogNode = mode === "node" ? fogHandle.node : null;
    s.fog = mode === "classic" ? classicFog : null;
  };

  useEffect(() => () => pipeline.dispose(), [pipeline]);

  useFrame((state, delta) => {
    const v = ctrl.current;
    const now = performance.now();

    // --- 1. GPU timestamps (quando o backend suporta) ---
    // Resolve os DOIS pools por frame: RENDER alimenta o medidor; COMPUTE
    // (a sim roda compute passes todo frame) é drenado para o pool não
    // encher — sem isso o three avisa "Maximum number of queries exceeded".
    if (!resolving.current) {
      resolving.current = true;
      const r = gl as any;
      const render = Promise.resolve(
        r.resolveTimestampsAsync?.(THREE.TimestampQuery.RENDER),
      );
      const compute = Promise.resolve(
        r.resolveTimestampsAsync?.(THREE.TimestampQuery.COMPUTE),
      ).catch(() => null);
      render
        .then((d: unknown) => {
          lastGpu.current = typeof d === "number" && d > 0 ? d : null;
        })
        .catch(() => {
          lastGpu.current = null;
        });
      Promise.allSettled([render, compute]).then(() => {
        resolving.current = false;
      });
    }
    meter.update(delta, lastGpu.current);

    // --- 2. preset manual mudou → aplica flags ---
    if (v.preset !== prevPreset.current) {
      prevPreset.current = v.preset as FxPreset;
      if (isPreset(v.preset)) applyPreset(v.preset);
    }

    // --- 3. auto-preset ---
    if (v.auto) {
      if (!auto.current) {
        auto.current = {
          phase: "probe",
          candidate: PRESET_ORDER.length - 1,
          phaseStart: now,
          badSince: null,
        };
        const cand = PRESET_ORDER[auto.current.candidate];
        console.log(`[fx-auto] ligado — provando "${cand}" por 5s…`);
        setAutoLabel(` — provando ${cand}…`);
        applyPreset(cand);
        prevPreset.current = cand;
      } else {
        const a = auto.current;
        const fps = meter.avgFps();
        if (a.phase === "probe" && now - a.phaseStart >= AUTO_PROBE_MS) {
          const cand = PRESET_ORDER[a.candidate];
          if (fps >= AUTO_TARGET_FPS || a.candidate === 0) {
            a.phase = "hold";
            a.badSince = null;
            console.log(
              `[fx-auto] escolhido: "${cand}" (${fps.toFixed(0)}fps)`,
            );
            setAutoLabel(` — ${cand} ✓`);
          } else {
            const next = PRESET_ORDER[a.candidate - 1];
            console.log(
              `[fx-auto] "${cand}" reprova (${fps.toFixed(0)}fps < ${AUTO_TARGET_FPS}) → "${next}"`,
            );
            a.candidate -= 1;
            a.phaseStart = now;
            setAutoLabel(` — provando ${next}…`);
            applyPreset(next);
            prevPreset.current = next;
          }
        } else if (a.phase === "hold") {
          if (fps > 0 && fps < AUTO_TARGET_FPS) {
            if (a.badSince === null) a.badSince = now;
            if (now - a.badSince >= AUTO_DEGRADE_MS && a.candidate > 0) {
              const from = PRESET_ORDER[a.candidate];
              a.candidate -= 1;
              const to = PRESET_ORDER[a.candidate];
              a.badSince = null;
              console.log(
                `[fx-auto] fps < ${AUTO_TARGET_FPS} por 10s — degradando "${from}" → "${to}"`,
              );
              setAutoLabel(` — ${to} (degradado)`);
              applyPreset(to);
              prevPreset.current = to;
            }
          } else {
            a.badSince = null;
          }
        }
      }
    } else if (auto.current) {
      auto.current = null;
      setAutoLabel("");
      console.log("[fx-auto] desligado — controle manual");
    }

    // --- 4. toggles → medição de custo por efeito ---
    const flags: FxFlags = {
      bloom: v.bloom,
      ao: v.ao,
      vinheta: v.vinheta,
      nevoa: v.nevoa,
    };
    if (prevFlags.current) {
      const diff = flagsDiff(prevFlags.current, flags);
      if (diff.length > 0 && now < suppressMeasureUntil.current) {
        meter.cancelToggle();
      } else if (diff.length === 1) {
        meter.beginToggle(diff[0], flags[diff[0]]);
      } else if (diff.length > 1) {
        meter.cancelToggle();
      }
    }
    prevFlags.current = flags;

    // --- 5. aplica estado aos módulos ---
    applyFog(v.nevoaMaster, flags.nevoa);
    fogHandle.setDensity(v.nevoaDensidade);
    fogHandle.setHeight(v.nevoaAltura);
    fogHandle.setNoiseAmount(v.nevoaNuvens);
    fogHandle.setDrift(v.nevoaDeriva);
    fogHandle.setRecede(v.nevoaRecuo);
    // Recuo por altura: a câmera alimenta o uniform (CPU, custo zero).
    fogHandle.setCamHeight(camera.position.y);

    pipeline.setFlags({ bloom: flags.bloom, ao: flags.ao, vinheta: flags.vinheta });
    pipeline.setBloomStrength(v.bloomForca);
    pipeline.setBloomThreshold(v.bloomLimiar);
    pipeline.setBloomRadius(v.bloomRaio);
    pipeline.setVignetteAmount(v.vinhetaForca);
    pipeline.setAoRadius(v.aoRaio);

    // --- 6. render (post ou direto) ---
    if (pipeline.isActive()) {
      pipeline.render();
    } else {
      (state.gl as unknown as THREE.WebGPURenderer).render(scene, camera);
    }

    // --- 7. sonda headless/bench ---
    if (import.meta.env.DEV) {
      const w = window as unknown as Record<string, unknown>;
      w.__limiarFx = {
        preset: v.preset,
        auto: v.auto,
        flags,
        costs: { ...meter.costs },
        avgMs: meter.avgMs(),
        avgFps: meter.avgFps(),
        source: meter.source(),
      };
      w.__limiarFxSet = (partial: Record<string, unknown>) => {
        setCRef.current(partial as any);
      };
    }
  }, 1);

  return null;
}
