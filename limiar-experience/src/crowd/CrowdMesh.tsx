import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three/webgpu";
import { useFrame, useThree } from "@react-three/fiber";
import { button, useControls } from "leva";
import { clipInfo, totalClipCount, vat } from "../vat/runtime";
import { buildCrowdGeometry } from "../vat/vatGeometry";
import { useVatTextures } from "../vat/useVatTextures";
import { vatPlayer } from "../vat/VatClipPlayer";
import { CrowdSim } from "../sim/CrowdSim";
import { mouseTarget, type MouseMode } from "../sim/mouseTarget";
import { buildCrowdMaterial } from "./crowdMaterial";
import { fillContentAttributes, fillStaticAttributes } from "./spawn";
import { applyColorEmphasis } from "./colorEmphasis";
import { qpNum } from "../lib/urlParams";
import { pref, prefBool, prefNum, prefStr } from "../lib/prefs";
import { useContent } from "../data/contentStore";
import {
  computeAgentMeta,
  computeTargets,
  type SettleRule,
} from "../data/agentMapping";
import { applyHsbToColorScale, hexToRgb01 } from "../data/palette";
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
import { PersonHover } from "../render/PersonHover";
import { FollowCamera } from "../render/FollowCamera";
import { legendFlashK, setElementLens, useLegend } from "../ui/legendStore";
import { isHsbIdentity, useAppearance } from "../ui/appearanceStore";
import { heightJS } from "../scene/heightfield";

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

  // Defaults dos controles passam por pref(): padrão salvo (grupo
  // Preferences) sobrescreve a fábrica; query param na URL vence os dois.
  // Painel em INGLÊS (pedido do Dudu, 2026-07-13); valores/keys internos e
  // query params ficam como eram — só o que se LÊ muda (ver Docs/06).
  const c = useControls("Crowd", {
    grid: {
      value: Math.min(prefNum("grid", "Crowd.grid", 32), MAX_GRID),
      min: 4,
      max: MAX_GRID,
      step: 4,
      label: "grid (N×N)",
    },
    area: {
      value: prefNum("area", "Crowd.area", 40),
      min: 10,
      max: 80,
      label: "spawn area",
    },
    ruido: { value: pref("Crowd.ruido", 0.6), min: 0, max: 2, label: "spawn noise" },
    seed: { value: pref("Crowd.seed", 3), min: 1, max: 9999, step: 1, label: "seed" },
    escala: { value: pref("Crowd.escala", 2.5), min: 0.5, max: 5, label: "person scale" },
    paleta: { value: pref("Crowd.paleta", true), label: "palette (vs. dormant)" },
    soHistorias: {
      value: prefBool("onlyPeople", "Crowd.soHistorias", false),
      label: "only people with stories",
      hint: "hides the dormant agents: draws only the first slots (the real people in the manifest) — the sim keeps running for everyone, wires and labels stay valid",
    },
    reset: button(() => {
      resetRef.current = true;
    }),
  });

  const s = useControls("Simulation", {
    maxSpeed: {
      value: prefNum("speed2", "Simulation.maxSpeed", 0.8),
      min: 0,
      max: 3,
      label: "max speed",
    },
    wander: { value: pref("Simulation.wander", 1), min: 0, max: 3, label: "wander (weight)" },
    wanderScale: {
      value: pref("Simulation.wanderScale", 0.12),
      min: 0.005,
      max: 0.4,
      label: "wander scale",
    },
    wanderEvolve: {
      value: pref("Simulation.wanderEvolve", 0.12),
      min: 0,
      max: 0.5,
      label: "wander evolution",
    },
    separacao: {
      value: prefNum("sep", "Simulation.separacao", 1.6),
      min: 0,
      max: 4,
      label: "separation (weight)",
    },
    sepRaio: { value: pref("Simulation.sepRaio", 0.7), min: 0.1, max: 2.5, label: "separation radius" },
    contRaio: {
      value: prefNum("contain", "Simulation.contRaio", 21),
      min: 5,
      max: 45,
      label: "containment radius",
    },
    mouseModo: {
      value: prefStr<MouseMode>("mouse", "Simulation.mouseModo", "atrair", [
        "off",
        "atrair",
        "repelir",
      ]),
      // Valores internos (e da URL ?mouse=) seguem PT; só o rótulo é EN.
      options: { off: "off", attract: "atrair", repel: "repelir" } as Record<
        string,
        MouseMode
      >,
      label: "mouse",
    },
    mouseRaio: {
      value: prefNum("mouseR", "Simulation.mouseRaio", 7),
      min: 1,
      max: 30,
      label: "mouse radius",
    },
    mouseForca: { value: pref("Simulation.mouseForca", 1.2), min: 0, max: 4, label: "mouse force" },
    giro: { value: pref("Simulation.giro", 6), min: 0.5, max: 20, label: "turn smoothing" },
    passo: { value: pref("Simulation.passo", 34), min: 5, max: 90, label: "stride/unit" },
    faceFlip: {
      value: prefBool("faceflip", "Simulation.faceFlip", false),
      label: "flip facing",
    },
    debug: {
      value: prefStr<"off" | "velocidade" | "direção" | "alvo" | "estado">(
        "debug",
        "Simulation.debug",
        "off",
        ["off", "velocidade", "direção", "alvo", "estado"],
      ),
      options: {
        off: "off",
        speed: "velocidade",
        direction: "direção",
        target: "alvo",
        state: "estado",
      },
      label: "debug color",
    },
  });

  // --- Estados por agente (doc 04 §5.5): a animação lê a física ---
  // Transições parado⇄andando⇄correndo pela velocidade REAL (histerese);
  // chegada assenta em idle/rezar; onda de chegada; dormentes contemplativos.
  // Master off = modo global antigo (botões "States (seamless morph)").
  // Guia de uso dos parâmetros: Docs/06-guia-estados-animacao.md.
  const e = useControls("States (per agent)", {
    auto: {
      value: prefBool("estados", "States (per agent).auto", true),
      label: "automatic states",
    },
    v0: {
      value: prefNum("v0", "States (per agent).v0", 0.12),
      min: 0.01,
      max: 0.6,
      label: "v0 idle⇄walk",
    },
    v1: {
      value: prefNum("v1", "States (per agent).v1", 1.15),
      min: 0.2,
      max: 3,
      label: "v1 walk⇄run",
    },
    histerese: {
      value: pref("States (per agent).histerese", 0.12),
      min: 0,
      max: 0.3,
      label: "hysteresis (±)",
    },
    fadeEstado: {
      value: pref("States (per agent).fadeEstado", 0.3),
      min: 0.1,
      max: 1,
      label: "crossfade (s)",
    },
    pesoIdle: {
      value: pref("States (per agent).pesoIdle", 1),
      min: 0,
      max: 4,
      label: "settle: idle weight",
    },
    pesoRezar: {
      value: pref("States (per agent).pesoRezar", 0.6),
      min: 0,
      max: 4,
      label: "settle: pray weight",
    },
    onda: {
      value: prefNum("onda", "States (per agent).onda", 0.9),
      min: 0,
      max: 3,
      label: "arrival wave",
    },
    pausas: {
      value: prefNum("pausas", "States (per agent).pausas", 0.45),
      min: 0,
      max: 1,
      label: "wander pauses",
    },
    dormVel: {
      value: pref("States (per agent).dormVel", 0.7),
      min: 0.2,
      max: 1.5,
      label: "dormant: speed ×",
    },
    dormWander: {
      value: pref("States (per agent).dormWander", 0.8),
      min: 0.2,
      max: 1.5,
      label: "dormant: wander ×",
    },
  });

  // --- Vocabulary (M4b, doc 06): guarda-roupa de animações ---
  // Papéis remapeáveis por dropdown (todos os clipes globais A ++ B),
  // playback × por estado e regras elemento→clipe (o dado escolhe o gesto).
  // Precedência dos papéis: painel (≥0) > role do descriptor > nome.
  const clipOptions = useMemo(() => {
    const opts: Record<string, number> = { auto: -1 };
    for (let i = 0; i < totalClipCount(); i++) {
      const info = clipInfo(i);
      if (info) opts[`${info.vatName} · ${info.name}`] = i;
    }
    return opts;
  }, []);
  const clipOptionsNoAuto = useMemo(() => {
    const opts: Record<string, number> = {};
    for (const [k, val] of Object.entries(clipOptions))
      if (val >= 0) opts[k] = val;
    return opts;
  }, [clipOptions]);
  const ruleElementOptions = useMemo(() => {
    const opts: Record<string, string> = { off: "off" };
    if (content) for (const el of content.taxonomy.elementos) opts[el.key] = el.key;
    return opts;
  }, [content]);
  // Valores salvos de outra sessão podem apontar clipes que não existem na
  // VAT atual (?vat= trocada) — `allowed` derruba esses para a fábrica.
  const clipIdxAllowed = useMemo(() => Object.values(clipOptions), [clipOptions]);
  const [v] = useControls(
    "Vocabulary",
    () => ({
      roleIdle: {
        value: pref("Vocabulary.roleIdle", -1, clipIdxAllowed),
        options: clipOptions,
        label: "idle",
      },
      roleIdle2: {
        value: pref("Vocabulary.roleIdle2", -1, clipIdxAllowed),
        options: clipOptions,
        label: "idle 2",
      },
      roleWalk: {
        value: pref("Vocabulary.roleWalk", -1, clipIdxAllowed),
        options: clipOptions,
        label: "walk",
      },
      roleRun: {
        value: pref("Vocabulary.roleRun", -1, clipIdxAllowed),
        options: clipOptions,
        label: "run",
      },
      rolePray: {
        value: pref("Vocabulary.rolePray", -1, clipIdxAllowed),
        options: clipOptions,
        label: "pray",
      },
      idlePlayback: {
        value: pref("Vocabulary.idlePlayback", 1),
        min: 0.3,
        max: 2,
        label: "idle playback ×",
      },
      settlePlayback: {
        value: pref("Vocabulary.settlePlayback", 1),
        min: 0.3,
        max: 2,
        label: "settle playback ×",
      },
      runBoost: {
        value: pref("Vocabulary.runBoost", 1.35),
        min: 1,
        max: 2,
        label: "run boost ×",
      },
      rule1El: {
        value: pref("Vocabulary.rule1El", "off"),
        options: ruleElementOptions,
        label: "rule 1: element",
      },
      rule1Clip: {
        value: pref("Vocabulary.rule1Clip", 0, clipIdxAllowed),
        options: clipOptionsNoAuto,
        label: "rule 1: clip",
      },
      rule1W: {
        value: pref("Vocabulary.rule1W", 0),
        min: 0,
        max: 4,
        label: "rule 1: weight",
      },
      rule2El: {
        value: pref("Vocabulary.rule2El", "off"),
        options: ruleElementOptions,
        label: "rule 2: element",
      },
      rule2Clip: {
        value: pref("Vocabulary.rule2Clip", 0, clipIdxAllowed),
        options: clipOptionsNoAuto,
        label: "rule 2: clip",
      },
      rule2W: {
        value: pref("Vocabulary.rule2W", 0),
        min: 0,
        max: 4,
        label: "rule 2: weight",
      },
    }),
    [clipOptions, clipOptionsNoAuto, ruleElementOptions],
  );

  // Papéis efetivos: override do painel (≥0) senão a detecção (clipRoles).
  const effIdle = v.roleIdle >= 0 ? v.roleIdle : sim.clipRoles.idle;
  const effIdle2 = v.roleIdle2 >= 0 ? v.roleIdle2 : sim.clipRoles.idle2;
  const effWalk = v.roleWalk >= 0 ? v.roleWalk : sim.clipRoles.walk;
  const effRun = v.roleRun >= 0 ? v.roleRun : sim.clipRoles.run;
  const effPray = v.rolePray >= 0 ? v.rolePray : sim.clipRoles.rezar;
  useEffect(() => {
    sim.u.clipIdle.value = effIdle;
    sim.u.clipIdle2.value = effIdle2;
    sim.u.clipWalk.value = effWalk;
    sim.u.clipRun.value = effRun;
    // Run com clipe PRÓPRIO (≠ walk) dispensa o boost de playback do walk.
    sim.u.runBoost.value = effRun !== effWalk ? 1 : v.runBoost;
  }, [sim, effIdle, effIdle2, effWalk, effRun, v.runBoost]);

  // Regras elemento→clipe ativas (element escolhido E peso > 0).
  const vocabRules = useMemo<SettleRule[]>(() => {
    const rules: SettleRule[] = [];
    if (v.rule1El !== "off" && v.rule1W > 0)
      rules.push({ element: v.rule1El, clip: v.rule1Clip, weight: v.rule1W });
    if (v.rule2El !== "off" && v.rule2W > 0)
      rules.push({ element: v.rule2El, clip: v.rule2Clip, weight: v.rule2W });
    return rules;
  }, [v.rule1El, v.rule1Clip, v.rule1W, v.rule2El, v.rule2Clip, v.rule2W]);

  // --- M3: o Campo dirigido pelos dados reais (só aparece com content/) ---
  // Rótulo "none" para NO_LENS; as keys dos elementos são dados (ficam PT).
  const lensOptions = useMemo(() => {
    const opts: Record<string, string> = { none: NO_LENS };
    if (content) for (const el of content.taxonomy.elementos) opts[el.key] = el.key;
    return opts;
  }, [content]);
  const [d, setD] = useControls(
    "Data (M3)",
    () => ({
      gravidade: {
        value: prefBool("gravity", "Data (M3).gravidade", false),
        label: "gravity (UMAP)",
      },
      mapScale: {
        value: prefNum("mapScale", "Data (M3).mapScale", 14),
        min: 4,
        max: 30,
        label: "map scale",
      },
      gravForca: {
        value: prefNum("gravForca", "Data (M3).gravForca", 2.2),
        min: 0.3,
        max: 6,
        label: "gravity force",
      },
      lente: {
        value: prefStr("lens", "Data (M3).lente", NO_LENS),
        options: lensOptions,
        label: "lens (element)",
      },
      fios: { value: prefBool("wires", "Data (M3).fios", true), label: "wires (graph)" },
      fiosAlpha: {
        value: prefNum("wiresAlpha", "Data (M3).fiosAlpha", 0.22),
        min: 0,
        max: 0.5,
        label: "wires alpha",
      },
      fiosAltura: {
        value: pref("Data (M3).fiosAltura", 1.05),
        min: 0,
        max: 2,
        label: "wires height",
      },
      // --- leitura visual (M3.5) ---
      fiosFadePerto: {
        value: prefNum("wiresNear", "Data (M3).fiosFadePerto", 6),
        min: 0.5,
        max: 25,
        label: "wires fade: near",
      },
      fiosFadeLonge: {
        value: prefNum("wiresFar", "Data (M3).fiosFadeLonge", 14),
        min: 2,
        max: 45,
        label: "wires fade: far",
      },
      fiosPeso: {
        value: prefNum("wiresGamma", "Data (M3).fiosPeso", 1.6),
        min: 0.4,
        max: 4,
        label: "wires weight (gamma)",
      },
      fiosSoNucleos: {
        value: prefBool("wiresFormed", "Data (M3).fiosSoNucleos", false),
        label: "wires only formed clusters",
      },
      palavras: {
        value: prefBool("labels", "Data (M3).palavras", true),
        label: "words (clusters)",
      },
      formRaio: {
        value: prefNum("formRaio", "Data (M3).formRaio", 2.4),
        min: 0.8,
        max: 8,
        label: "formation radius (cohesion)",
      },
    }),
    [lensOptions],
  );

  // --- Lentes demográficas: eixos não-fenomenológicos (sexo, década, …) ---
  const dlensOptions = useMemo(() => {
    const opts: Record<string, string> = { none: NO_LENS };
    for (const k of DEMO_LENS_KEYS) opts[DEMO_LENS_LABELS[k]] = k;
    return opts;
  }, []);
  const [dl, setDl] = useControls(
    "Demographic lens",
    () => ({
      dlente: {
        value: prefStr("dlens", "Demographic lens.dlente", NO_LENS, [
          NO_LENS,
          ...DEMO_LENS_KEYS,
        ]),
        options: dlensOptions,
        label: "lens",
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
  // Por cima da cor-base, em ordem: (1) HSB global do grupo Aparência
  // (paleta + dormentes), (2) ênfase — lente dessatura não-pertencentes;
  // clique na Legenda colapsa todos fora do grupo num cinza uniforme, com
  // envelope animado (hold pleno → fade suave; ver legendStore).
  const hsb = useAppearance((st) => st.hsb);
  const destaqueIntensidade = useAppearance((st) => st.destaqueIntensidade);
  const dormentesCor = useAppearance((st) => st.dormentes);
  const cinzaDestaque = useAppearance((st) => st.cinzaDestaque);
  const paintColors = (flashK: number) => {
    const count = c.grid * c.grid;
    if (content) {
      fillContentAttributes(
        attrs,
        count,
        c.seed,
        content,
        demoCls,
        hexToRgb01(dormentesCor),
      );
      if (!isHsbIdentity(hsb)) {
        applyHsbToColorScale(
          attrs.colorScale.array as Float32Array,
          count,
          hsb.hue,
          hsb.sat,
          hsb.bri,
        );
      }
      applyColorEmphasis(attrs, count, content, demoCls, {
        elementLens: d.lente === NO_LENS ? null : d.lente,
        flash: legendFlash,
        flashK,
        flashIntensity: destaqueIntensidade,
        mutedGray: hexToRgb01(cinzaDestaque),
      });
    } else {
      fillStaticAttributes(attrs, count, c.seed);
      if (!isHsbIdentity(hsb)) {
        applyHsbToColorScale(
          attrs.colorScale.array as Float32Array,
          count,
          hsb.hue,
          hsb.sat,
          hsb.bri,
        );
      }
    }
    attrs.colorScale.needsUpdate = true;
  };
  const paintRef = useRef(paintColors);
  paintRef.current = paintColors;
  const lastFlashK = useRef(1);
  useEffect(() => {
    lastFlashK.current = 1;
    paintRef.current(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    attrs,
    content,
    demoCls,
    c.grid,
    c.seed,
    d.lente,
    legendFlash,
    hsb,
    destaqueIntensidade,
    dormentesCor,
    cinzaDestaque,
  ]);

  // Parâmetros de spawn mudaram → uniforms da sim e agenda reset GPU.
  useEffect(() => {
    const count = c.grid * c.grid;
    sim.u.count.value = count;
    sim.u.gridN.value = c.grid;
    sim.u.spawnArea.value = c.area;
    sim.u.spawnNoise.value = c.ruido;
    sim.u.seed.value = c.seed;
    resetRef.current = true;
  }, [sim, content, c.grid, c.area, c.ruido, c.seed]);

  // "Só quem tem história": desenha apenas os primeiros N slots (as pessoas
  // reais — pessoa i = instância i por construção do M3; a permutação de
  // spawn embaralha só a POSIÇÃO inicial, não a identidade do slot). A sim
  // segue simulando todo mundo (dormentes continuam empurrando/ocupando
  // espaço) — é corte de DESENHO, sem tocar na lógica da simulação. Efeito
  // separado do reset: alternar o toggle não respawna ninguém.
  const drawCount =
    c.soHistorias && content
      ? Math.min(content.manifest.people.length, c.grid * c.grid)
      : c.grid * c.grid;
  useEffect(() => {
    if (meshRef.current) meshRef.current.count = drawCount;
  }, [drawCount]);

  // Meta por agente (com-história vs dormente + GESTO de assentamento
  // sorteado na CPU — idle próprio, rezar ou regra elemento→clipe do
  // Vocabulary) — CPU escreve, nada por frame.
  useEffect(() => {
    computeAgentMeta(content, MAX_GRID * MAX_GRID, sim.agentMetaArray, {
      pesoIdle: e.pesoIdle,
      pesoRezar: e.pesoRezar,
      boostTransformacao: 2,
      prayClip: effPray,
      rules: vocabRules,
    });
    sim.commitAgentMeta();
  }, [content, sim, e.pesoIdle, e.pesoRezar, effPray, vocabRules]);

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
    sim.u.perAgentOn.value = e.auto ? 1 : 0;
    sim.u.v0.value = e.v0;
    sim.u.v1.value = e.v1;
    sim.u.hyst.value = e.histerese;
    sim.u.stateFade.value = e.fadeEstado;
    sim.u.idlePlayback.value = v.idlePlayback;
    sim.u.settlePlayback.value = v.settlePlayback;
    sim.u.waveGain.value = e.onda;
    sim.u.pauseAmount.value = e.pausas;
    sim.u.dormantSpeedMul.value = e.dormVel;
    sim.u.dormantWanderMul.value = e.dormWander;
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
      // Estados (vec4 sem padding): [clipA, clipB, blend, stateId+t/1000]×n.
      w.__limiarReadStates = async (n: number) => {
        const buf = await gl.getArrayBufferAsync(sim.states.value);
        const raw = new Float32Array(buf);
        return Array.from(raw.slice(0, n * 4));
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
      s.debug === "velocidade"
        ? 1
        : s.debug === "direção"
          ? 2
          : s.debug === "alvo"
            ? 3
            : s.debug === "estado"
              ? 4
              : 0,
    );
    bundle.setFaceFlip(s.faceFlip ? -1 : 1);
    bundle.setPerAgentStates(e.auto);
    bundle.tickAgentClock(delta);

    // Envelope do destaque da legenda: 1 no hold (nenhum repaint) → fade
    // suave a 0 (repinta o iColorScale enquanto o valor anda — ~40 frames
    // de loop CPU barato, nada fora do fade).
    if (legendFlash) {
      const k = legendFlashK(legendFlash, performance.now());
      if (Math.abs(k - lastFlashK.current) > 0.004) {
        lastFlashK.current = k;
        paintRef.current(k);
      }
    }

    if (markerRef.current) {
      markerRef.current.position.copy(mouseTarget.point);
      // O raycast acontece na malha CPU (flat) — o y real vem do heightfield.
      markerRef.current.position.y =
        0.05 + heightJS(mouseTarget.point.x, mouseTarget.point.z);
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
      {content && (
        <PersonHover sim={sim} content={content} personScale={c.escala} />
      )}
      {content && <FollowCamera sim={sim} content={content} />}
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </>
  );
}
