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
import { qpHas, qpNum } from "../lib/urlParams";
import { pref, prefBool, prefNum, prefStr } from "../lib/prefs";
import { levaVal } from "../lib/levaRead";
import { useContent } from "../data/contentStore";
import {
  DORMANT_FORMATIONS,
  computeAgentMeta,
  computeDormantTargets,
  computeTargets,
  type DormantFormation,
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
import {
  getTerrainScroll,
  heightJS,
  setTerrainScroll,
  setGroundGridRadius,
  setTerrainTileLen,
  setWorldWrap,
} from "../scene/heightfield";
import { DebugAreas } from "../render/DebugAreas";
import { useFollow } from "../ui/followStore";
import { useHover } from "../ui/hoverStore";
import { positionMirror } from "../sim/positionMirror";

const NO_LENS = "nenhuma";

/** Diâmetro do disco de jogo: 2×contenção; `?area=` ainda vence p/ screenshots. */
function playDiameter(contRaio: number): number {
  return qpHas("area") ? qpNum("area", contRaio * 2) : contRaio * 2;
}

const MAX_GRID = 64; // 4096 pessoas — teto do protótipo

/** Comprimento do corredor de dormentes (formação corridor, doc 04). */
const CORRIDOR_LENGTH = 24;

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

  // Painel reorganizado (2026-07-15): física · testemunhas · dormentes · acoplamento.
  const phy = useControls("Field · physics", {
    grid: {
      value: Math.min(prefNum("grid", "Field · physics.grid", 32), MAX_GRID),
      min: 4,
      max: MAX_GRID,
      step: 4,
      label: "grid (N×N)",
      hint: "agent count = N² — spacing follows containment radius (spawn fills the play disc)",
    },
    ruido: {
      value: pref("Field · physics.ruido", 0.6),
      min: 0,
      max: 2,
      label: "spawn noise",
    },
    seed: {
      value: pref("Field · physics.seed", 3),
      min: 1,
      max: 9999,
      step: 1,
      label: "seed",
    },
    escala: {
      value: pref("Field · physics.escala", 2.5),
      min: 0.5,
      max: 5,
      label: "person scale",
    },
    paleta: {
      value: pref("Field · physics.paleta", true),
      label: "palette (vs. dormant)",
    },
    maxSpeed: {
      value: prefNum("speed2", "Field · physics.maxSpeed", 0.8),
      min: 0,
      max: 3,
      label: "max speed",
      hint: "speed cap for everyone — multiply per group with speed × in Witnesses / Dormants",
    },
    separacao: {
      value: prefNum("sep", "Field · physics.separacao", 1.6),
      min: 0,
      max: 4,
      label: "separation (weight)",
    },
    sepRaio: {
      value: pref("Field · physics.sepRaio", 0.7),
      min: 0.1,
      max: 2.5,
      label: "separation radius",
    },
    contRaio: {
      value: prefNum("contain", "Field · physics.contRaio", 21),
      min: 5,
      max: 45,
      label: "containment radius",
      hint: "play disc radius — spawn, ground grid and wrap square (side = 2×) all follow this",
    },
    worldWrap: {
      value: prefBool("wrap", "Field · physics.worldWrap", true),
      label: "world wrap",
      hint: "the world is a torus: a canonical square area (side = 2× containment radius) where anyone crossing an edge reappears on the opposite side — the containment force turns off. The foundation of the infinite-space illusion",
    },
    wrapToroidalSep: {
      value: prefBool("wrapSep", "Field · physics.wrapToroidalSep", true),
      label: "toroidal separation",
      hint: "when wrap is on: neighbors across the seam push each other (fixes edge pile-up). Off = legacy euclidean separation",
    },
    wrapHysteresis: {
      value: prefNum("wrapHyst", "Field · physics.wrapHysteresis", 0.8),
      min: 0,
      max: 3,
      label: "wrap seam margin (m)",
      hint: "extra meters past L/2 before teleport — kills threshold flicker. 0 = immediate wrap at the edge",
    },
    debugAreas: {
      value: prefBool("debugAreas", "Field · physics.debugAreas", false),
      label: "debug areas",
      hint: "wireframe overlays: canonical wrap square, containment circle (wrap off), cluster-core rings, active field circle and the travel heading",
    },
    mouseModo: {
      value: prefStr<MouseMode>("mouse", "Field · physics.mouseModo", "atrair", [
        "off",
        "atrair",
        "repelir",
      ]),
      options: { off: "off", attract: "atrair", repel: "repelir" } as Record<
        string,
        MouseMode
      >,
      label: "mouse",
    },
    mouseRaio: {
      value: prefNum("mouseR", "Field · physics.mouseRaio", 7),
      min: 1,
      max: 30,
      label: "mouse radius",
    },
    mouseForca: {
      value: pref("Field · physics.mouseForca", 1.2),
      min: 0,
      max: 4,
      label: "mouse force",
    },
    giro: {
      value: pref("Field · physics.giro", 6),
      min: 0.5,
      max: 20,
      label: "turn smoothing",
    },
    passo: {
      value: pref("Field · physics.passo", 34),
      min: 5,
      max: 90,
      label: "stride/unit",
    },
    faceFlip: {
      value: prefBool("faceflip", "Field · physics.faceFlip", false),
      label: "flip facing",
    },
    debug: {
      value: prefStr<"off" | "velocidade" | "direção" | "alvo" | "estado">(
        "debug",
        "Field · physics.debug",
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
    reset: button(() => {
      resetRef.current = true;
    }),
  });

  const dorm = useControls("Dormants", {
    formation: {
      value: prefStr<DormantFormation>(
        "formation",
        "Dormants.formation",
        "wander",
        DORMANT_FORMATIONS,
      ),
      options: {
        wander: "wander",
        circle: "circle",
        corridor: "corridor",
        clear: "clear",
      } as Record<string, DormantFormation>,
      label: "formation",
      hint: "wander (loose) · circle (ring) · corridor (rows flanking follow — needs active follow) · clear (rim)",
    },
    spacing: {
      value: prefNum("formSpacing", "Dormants.spacing", 1.2),
      min: 0.4,
      max: 4,
      label: "formation spacing",
    },
    rimInset: {
      value: prefNum("rimInset", "Dormants.rimInset", 1.5),
      min: 0,
      max: 6,
      label: "rim inset (wrap)",
      hint: "pull formation ring inward from the wrap seam — only when world wrap is on",
    },
    wanderWhileForm: {
      value: pref("Dormants.wanderWhileForm", 0.35),
      min: 0,
      max: 1,
      label: "wander while forming",
      hint: "curl strength en route to formation slots — 0 = march, 1 = full wind",
    },
    lockAtForm: {
      value: prefBool("formLock", "Dormants.lockAtForm", true),
      label: "lock at formation",
      hint: "near the ring/corridor slot, curl off — clean moldura",
    },
    wanderW: {
      value: pref("Dormants.wanderW", 0.8),
      min: 0,
      max: 3,
      label: "wander weight",
      hint: "curl force (dormentes only)",
    },
    wanderScale: {
      value: pref("Dormants.wanderScale", 0.12),
      min: 0.005,
      max: 0.8,
      label: "wander scale",
      hint: "noise frequency — low = wide lazy curves; high = tight restless eddies",
    },
    wanderEvolve: {
      value: pref("Dormants.wanderEvolve", 0.12),
      min: 0,
      max: 0.5,
      label: "wander evolution",
      hint: "how fast the wind field changes over time",
    },
    wanderVariance: {
      value: pref("Dormants.wanderVariance", 0.25),
      min: 0,
      max: 1,
      label: "wander variance",
      hint: "per-agent curl spread — 0 = uniform; 1 = ±100% of wander weight",
    },
    pausas: {
      value: prefNum("pausas", "Dormants.pausas", 0.45),
      min: 0,
      max: 1,
      label: "wander pauses",
      hint: "organic stop/go per agent — off while seeking a formation slot",
    },
    speedVariance: {
      value: pref("Dormants.speedVariance", 0.25),
      min: 0,
      max: 1,
      label: "speed variance",
      hint: "per-agent walk speed spread — 0 = uniform; 1 = ±100% of speed ×",
    },
    dormVel: {
      value: pref("Dormants.dormVel", 0.7),
      min: 0,
      max: 1.5,
      label: "speed ×",
      hint: "× max speed cap for dormants only",
    },
    soHistorias: {
      value: prefBool("onlyPeople", "Dormants.soHistorias", false),
      label: "hide (draw only witnesses)",
      hint: "sim keeps running for everyone — wires and labels stay valid",
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

  // --- Testemunhas (com história): dados, lentes, estados de chegada ---
  const lensOptions = useMemo(() => {
    const opts: Record<string, string> = { none: NO_LENS };
    if (content) for (const el of content.taxonomy.elementos) opts[el.key] = el.key;
    return opts;
  }, [content]);
  const dlensOptions = useMemo(() => {
    const opts: Record<string, string> = { none: NO_LENS };
    for (const k of DEMO_LENS_KEYS) opts[DEMO_LENS_LABELS[k]] = k;
    return opts;
  }, []);
  const [wit, setWit] = useControls(
    "Witnesses",
    () => ({
      auto: {
        value: prefBool("estados", "Witnesses.auto", true),
        label: "automatic states",
      },
      v0: {
        value: prefNum("v0", "Witnesses.v0", 0.12),
        min: 0.01,
        max: 0.6,
        label: "v0 idle⇄walk",
      },
      v1: {
        value: prefNum("v1", "Witnesses.v1", 1.15),
        min: 0.2,
        max: 3,
        label: "v1 walk⇄run",
      },
      histerese: {
        value: pref("Witnesses.histerese", 0.12),
        min: 0,
        max: 0.3,
        label: "hysteresis (±)",
      },
      fadeEstado: {
        value: pref("Witnesses.fadeEstado", 0.3),
        min: 0.1,
        max: 1,
        label: "crossfade (s)",
      },
      pesoIdle: {
        value: pref("Witnesses.pesoIdle", 1),
        min: 0,
        max: 4,
        label: "settle: idle weight",
      },
      pesoRezar: {
        value: pref("Witnesses.pesoRezar", 0.6),
        min: 0,
        max: 4,
        label: "settle: pray weight",
      },
      onda: {
        value: prefNum("onda", "Witnesses.onda", 0.9),
        min: 0,
        max: 3,
        label: "arrival wave",
      },
      wanderWhileSeek: {
        value: pref("Witnesses.wanderWhileSeek", 0.35),
        min: 0,
        max: 1,
        label: "wander while seeking",
        hint: "curl en route to UMAP/lens target — 0 = direct migration",
      },
      lockAtCluster: {
        value: prefBool("clusterLock", "Witnesses.lockAtCluster", true),
        label: "lock at cluster",
        hint: "near nucleus/lens slot, curl off — they settle still",
      },
      wanderW: {
        value: pref("Witnesses.wanderW", 1),
        min: 0,
        max: 3,
        label: "wander weight",
        hint: "curl force (witnesses only)",
      },
      wanderScale: {
        value: pref("Witnesses.wanderScale", 0.12),
        min: 0.005,
        max: 0.4,
        label: "wander scale",
      },
      wanderEvolve: {
        value: pref("Witnesses.wanderEvolve", 0.12),
        min: 0,
        max: 0.5,
        label: "wander evolution",
      },
      wanderVariance: {
        value: pref("Witnesses.wanderVariance", 0.15),
        min: 0,
        max: 1,
        label: "wander variance",
        hint: "per-agent curl spread — 0 = uniform; 1 = ±100% of wander weight",
      },
      pausas: {
        value: prefNum("witPausas", "Witnesses.pausas", 0.2),
        min: 0,
        max: 1,
        label: "wander pauses",
        hint: "organic stop/go per agent — off while migrating to a target",
      },
      speedVariance: {
        value: pref("Witnesses.speedVariance", 0.2),
        min: 0,
        max: 1,
        label: "speed variance",
        hint: "per-agent walk speed spread — 0 = uniform; 1 = ±100% of speed ×",
      },
      speedMul: {
        value: pref("Witnesses.speedMul", 1),
        min: 0,
        max: 1.5,
        label: "speed ×",
        hint: "× max speed cap for witnesses only",
      },
      hoverFreeze: {
        value: prefBool("hoverFreeze", "Witnesses.hoverFreeze", true),
        label: "pause on hover",
        hint: "stops own movement on hover — still rides the follow treadmill",
      },
      gravidade: {
        value: prefBool("gravity", "Witnesses.gravidade", false),
        label: "gravity (UMAP)",
      },
      mapScale: {
        value: prefNum("mapScale", "Witnesses.mapScale", 14),
        min: 4,
        max: 30,
        label: "map scale",
      },
      gravForca: {
        value: prefNum("gravForca", "Witnesses.gravForca", 2.2),
        min: 0.3,
        max: 6,
        label: "gravity force",
      },
      lente: {
        value: prefStr("lens", "Witnesses.lente", NO_LENS),
        options: lensOptions,
        label: "lens (element)",
      },
      dlente: {
        value: prefStr("dlens", "Witnesses.dlente", NO_LENS, [
          NO_LENS,
          ...DEMO_LENS_KEYS,
        ]),
        options: dlensOptions,
        label: "lens (demographic)",
      },
      fios: {
        value: prefBool("wires", "Witnesses.fios", true),
        label: "wires (graph)",
      },
      fiosAlpha: {
        value: prefNum("wiresAlpha", "Witnesses.fiosAlpha", 0.22),
        min: 0,
        max: 0.5,
        label: "wires alpha",
      },
      fiosAltura: {
        value: pref("Witnesses.fiosAltura", 1.05),
        min: 0,
        max: 2,
        label: "wires height",
      },
      fiosFadePerto: {
        value: prefNum("wiresNear", "Witnesses.fiosFadePerto", 6),
        min: 0.5,
        max: 25,
        label: "wires fade: near",
      },
      fiosFadeLonge: {
        value: prefNum("wiresFar", "Witnesses.fiosFadeLonge", 14),
        min: 2,
        max: 45,
        label: "wires fade: far",
      },
      fiosPeso: {
        value: prefNum("wiresGamma", "Witnesses.fiosPeso", 1.6),
        min: 0.4,
        max: 4,
        label: "wires weight (gamma)",
      },
      fiosSoNucleos: {
        value: prefBool("wiresFormed", "Witnesses.fiosSoNucleos", false),
        label: "wires only formed clusters",
      },
      palavras: {
        value: prefBool("labels", "Witnesses.palavras", true),
        label: "words (clusters)",
      },
      formRaio: {
        value: prefNum("formRaio", "Witnesses.formRaio", 2.4),
        min: 0.8,
        max: 8,
        label: "formation radius (cohesion)",
      },
    }),
    [lensOptions, dlensOptions],
  );

  const couple = useControls("Field · coupling", {
    fieldOn: {
      value: prefBool("field", "Field · coupling.fieldOn", false),
      label: "field (follow)",
      hint: "the followed witness radiates soft repulsion — others step aside",
    },
    fieldRadius: {
      value: prefNum("fieldR", "Field · coupling.fieldRadius", 2.5),
      min: 0.5,
      max: 8,
      label: "field radius",
      render: (get) => Boolean(get("Field · coupling.fieldOn")),
    },
    fieldStrength: {
      value: prefNum("fieldF", "Field · coupling.fieldStrength", 1.2),
      min: 0,
      max: 4,
      label: "field strength",
      render: (get) => Boolean(get("Field · coupling.fieldOn")),
    },
    yieldW: {
      value: prefNum("yield", "Field · coupling.yieldW", 2),
      min: 1,
      max: 3,
      label: "yield to travelers",
      hint: "witnesses WITH a target push dormants harder — WebGPU only",
    },
    selInertia: {
      value: prefNum("selInertia", "Field · coupling.selInertia", 0.15),
      min: 0,
      max: 1,
      label: "selected inertia",
      hint: "how much separation/containment the FOLLOWED person receives — fixes stutter",
    },
    storyField: {
      value: prefStr("storyField", "Field · coupling.storyField", "off", [
        "off",
        "social",
        "repel",
      ]),
      options: {
        off: "off",
        social: "social (attract + bubble)",
        repel: "repel",
      },
      label: "story field",
      hint: "social = dormentes orbitam testemunhas com bolha interna — WebGPU only",
    },
    storyRadius: {
      value: prefNum("storyR", "Field · coupling.storyRadius", 2),
      min: 0.5,
      max: 6,
      label: "story attract radius",
      hint: "outer pull toward witnesses (social mode)",
      render: (get) => get("Field · coupling.storyField") !== "off",
    },
    storyRepelRadius: {
      value: prefNum("storyBubble", "Field · coupling.storyRepelRadius", 0.55),
      min: 0.2,
      max: 2,
      label: "story bubble radius",
      hint: "inner repulsion — keeps dormants from tunneling through witnesses",
      render: (get) => get("Field · coupling.storyField") === "social",
    },
    storyStrength: {
      value: prefNum("storyF", "Field · coupling.storyStrength", 0.6),
      min: 0,
      max: 2,
      label: "story field strength",
      render: (get) => get("Field · coupling.storyField") !== "off",
    },
  });

  // --- Esteira do follow (2026-07-14b — o comportamento PADRÃO): pino + ---
  // mundo em movimento (agentes deslocados + chão scrollando + wrap).
  // OFF = kill-switch (follow antigo que desloca a pessoa, para comparação).
  const st = useControls("Stage (treadmill)", {
    stage: {
      value: prefBool("stage", "Stage (treadmill).stage", true),
      label: "follow treadmill (pin)",
      hint: "THE follow behavior: the followed person walks in place while the WORLD moves — every other agent is displaced against the journey heading (wrapping around), terrain scrolls underfoot, mouse steers. OFF = legacy follow that displaces the person (debug/compare). Needs automatic states",
    },
    stageSpeed: {
      value: prefNum("stageSpeed", "Stage (treadmill).stageSpeed", 0.9),
      min: 0,
      max: 2,
      label: "treadmill speed",
      hint: "journey speed — also the steer speed cap in legacy (no-pin) mode",
    },
    steerOn: {
      value: prefBool("steer", "Stage (treadmill).steerOn", true),
      label: "mouse steering",
      hint: "during follow the mouse is the rudder: the pointer's direction (ground ray, relative to the person) sets where the journey goes. Point AT the person (deadzone ~1.5 m) to stop",
    },
    steerStrength: {
      value: prefNum("steerK", "Stage (treadmill).steerStrength", 1),
      min: 0,
      max: 2,
      label: "steer strength",
      hint: "how sharply the rudder turns the journey heading (treadmill mode) or pushes the person (legacy mode)",
    },
  });

  // Exclusão mútua: ativar uma lente desativa a outra (a que MUDOU vence).
  // Na carga com as duas na URL, a demográfica ganha (checada primeiro).
  const prevLens = useRef(NO_LENS);
  const prevDlens = useRef(NO_LENS);
  useEffect(() => {
    const lensChanged = wit.lente !== prevLens.current;
    const dlensChanged = wit.dlente !== prevDlens.current;
    prevLens.current = wit.lente;
    prevDlens.current = wit.dlente;
    if (dlensChanged && wit.dlente !== NO_LENS && wit.lente !== NO_LENS) {
      setWit({ lente: NO_LENS });
    } else if (lensChanged && wit.lente !== NO_LENS && wit.dlente !== NO_LENS) {
      setWit({ dlente: NO_LENS });
    }
  }, [wit.lente, wit.dlente, setWit]);

  // Classificação da lente ativa (46 pessoas, CPU) + legenda para o HUD.
  const demoCls = useMemo(
    () =>
      content && wit.dlente !== NO_LENS
        ? classifyDemoLens(wit.dlente as DemoLensKey, content)
        : null,
    [content, wit.dlente],
  );
  useEffect(() => {
    useDemoLens.setState({ cls: demoCls });
    return () => useDemoLens.setState({ cls: null });
  }, [demoCls]);

  // Publica a lente de ELEMENTO para a Legenda (src/ui/Legend.tsx) e escuta
  // o destaque temporário disparado por clique num chip dela.
  useEffect(() => {
    setElementLens(content && wit.lente !== NO_LENS ? wit.lente : null);
    return () => setElementLens(null);
  }, [content, wit.lente]);
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
    const count = phy.grid * phy.grid;
    if (content) {
      fillContentAttributes(
        attrs,
        count,
        phy.seed,
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
        elementLens: wit.lente === NO_LENS ? null : wit.lente,
        flash: legendFlash,
        flashK,
        flashIntensity: destaqueIntensidade,
        mutedGray: hexToRgb01(cinzaDestaque),
      });
    } else {
      fillStaticAttributes(attrs, count, phy.seed);
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
    phy.grid,
    phy.seed,
    wit.lente,
    legendFlash,
    hsb,
    destaqueIntensidade,
    dormentesCor,
    cinzaDestaque,
  ]);

  // Parâmetros de spawn mudaram → uniforms da sim e agenda reset GPU.
  useEffect(() => {
    const count = phy.grid * phy.grid;
    const diam = playDiameter(phy.contRaio);
    sim.u.count.value = count;
    sim.u.gridN.value = phy.grid;
    sim.u.spawnArea.value = diam;
    sim.u.spawnRadius.value = diam * 0.5;
    sim.u.spawnNoise.value = phy.ruido;
    sim.u.seed.value = phy.seed;
    resetRef.current = true;
  }, [sim, content, phy.grid, phy.contRaio, phy.ruido, phy.seed]);

  // "Só quem tem história": desenha apenas os primeiros N slots (as pessoas
  // reais — pessoa i = instância i por construção do M3; a permutação de
  // spawn embaralha só a POSIÇÃO inicial, não a identidade do slot). A sim
  // segue simulando todo mundo (dormentes continuam empurrando/ocupando
  // espaço) — é corte de DESENHO, sem tocar na lógica da simulação. Efeito
  // separado do reset: alternar o toggle não respawna ninguém.
  const drawCount =
    dorm.soHistorias && content
      ? Math.min(content.manifest.people.length, phy.grid * phy.grid)
      : phy.grid * phy.grid;
  useEffect(() => {
    if (meshRef.current) meshRef.current.count = drawCount;
  }, [drawCount]);

  // Meta por agente (com-história vs dormente + GESTO de assentamento
  // sorteado na CPU — idle próprio, rezar ou regra elemento→clipe do
  // Vocabulary) — CPU escreve, nada por frame.
  useEffect(() => {
    computeAgentMeta(content, MAX_GRID * MAX_GRID, sim.agentMetaArray, {
      pesoIdle: wit.pesoIdle,
      pesoRezar: wit.pesoRezar,
      boostTransformacao: 2,
      prayClip: effPray,
      rules: vocabRules,
    });
    sim.commitAgentMeta();
  }, [content, sim, wit.pesoIdle, wit.pesoRezar, effPray, vocabRules]);

  // --- follow: pessoa seguida + heading estimado (campo/corredor/palco) ---
  const following = useFollow((fs) => fs.following);
  const followPos = useRef(new THREE.Vector3());
  const followValid = useRef(false);
  /** Trilha da pessoa seguida (~1 amostra/250 ms, janela 2 s): o heading é
   *  o DESLOCAMENTO na janela — jitter de separação/readback não acumula
   *  deslocamento (random walk), caminhada real acumula. (Um EMA de deltas
   *  por frame girava com o jitter da pessoa ASSENTADA e o corredor
   *  re-ancorava em loop — bug pego na sonda, 2026-07-14.) */
  const headTrail = useRef<{ t: number; x: number; z: number }[]>([]);
  const trailFor = useRef<number | null>(null);
  const corridorClock = useRef(0);
  /** Âncora do corredor: os alvos NÃO seguem a pessoa por frame (alvo que
   *  foge vira perseguição — turba, não corredor; bug pego na sonda). O
   *  corredor fica PARADO no mundo e só re-ancora quando a pessoa
   *  atravessou ~35% dele, saiu pela lateral ou mudou de rumo. */
  const corridorAnchor = useRef({ x: 0, z: 0, hx: 0, hz: 1, valid: false });
  /** Heading da viagem: nasce do rumo da pessoa na ENTRADA do modo e daí
   *  em diante o MOUSE é o leme (steering) — suavizado por steerStrength. */
  const stageHeading = useRef(new THREE.Vector2(0, 1));
  const stageWasOn = useRef(false);
  const scrollAccum = useRef(new THREE.Vector2(0, 0));
  /** Velocidade ATUAL da esteira (rampa suave; 0 no deadzone do leme). */
  const stageSpeedCur = useRef(0);
  const camera = useThree((state) => state.camera);

  /** Direção efetiva do deslocamento: trilha (se a pessoa ANDOU ≥1,2 m na
   *  janela de ~2 s — o empurra-empurra da multidão desloca <1 m e NÃO pode
   *  contar: heading de deriva re-ancorava o corredor em loop, sonda
   *  2026-07-14) senão câmera→pessoa (parada/assentada ganha corredor à
   *  frente do olhar). */
  const effectiveHeading = (out: THREE.Vector2): void => {
    const trail = headTrail.current;
    if (trail.length >= 2) {
      const dx = trail[trail.length - 1].x - trail[0].x;
      const dz = trail[trail.length - 1].z - trail[0].z;
      const len = Math.hypot(dx, dz);
      if (len > 1.2) {
        out.set(dx / len, dz / len);
        return;
      }
    }
    const dx = followPos.current.x - camera.position.x;
    const dz = followPos.current.z - camera.position.z;
    const len = Math.hypot(dx, dz);
    if (len > 1e-3) out.set(dx / len, dz / len);
    else out.set(0, 1);
  };

  // Alvos dos dados (gravidade/lentes) — 46 escritas por mudança, nada por
  // frame. Lente demográfica ativa vence a lente de elemento (exclusão mútua
  // no efeito acima garante que só uma esteja ligada). targetsVersion avisa
  // os fios (modo "só núcleos formados" lê os alvos como atributo).
  // Por cima dos alvos das PESSOAS, a formação dos DORMENTES (slots ≥
  // people.length até o grid visível): computeDormantTargets escreve só
  // esses slots. Corridor é dinâmico (recomputado a ~0,8 s no useFrame).
  const headingTmp = useMemo(() => new THREE.Vector2(), []);
  const applyDormantTargets = () => {
    if (!content) return;
    const agentCount = phy.grid * phy.grid;
    const peopleCount = Math.min(content.manifest.people.length, agentCount);
    const corridorReady = following !== null && followValid.current;
    const mode: DormantFormation =
      dorm.formation === "corridor" && !corridorReady ? "wander" : dorm.formation;
    const a = corridorAnchor.current;
    if (mode === "corridor" && !a.valid) {
      // (Re-)ancora o corredor AQUI: alvos fixos no MUNDO (ground frame —
      // posição da pessoa + scroll da esteira) a partir do rumo atual.
      // Durante a viagem o corredor flui para trás como cenário e re-ancora
      // à frente quando atravessado (a checagem no useFrame compara no
      // ground frame) — a sebe "se renova" ao longo da jornada.
      if (stageWasOn.current) {
        headingTmp.set(stageHeading.current.x, stageHeading.current.y);
      } else {
        effectiveHeading(headingTmp);
      }
      a.x = followPos.current.x + scrollAccum.current.x;
      a.z = followPos.current.z + scrollAccum.current.y;
      a.hx = headingTmp.x;
      a.hz = headingTmp.y;
      a.valid = true;
    }
    computeDormantTargets(mode, peopleCount, agentCount, sim.targetsArray, {
      containRadius: phy.contRaio,
      rimInset: dorm.rimInset,
      worldWrap: phy.worldWrap,
      spacing: dorm.spacing,
      followPos: mode === "corridor" ? { x: a.x, z: a.z } : null,
      followHeading: mode === "corridor" ? { x: a.hx, z: a.hz } : null,
      corridorLength: CORRIDOR_LENGTH,
    });
  };
  const applyDormantRef = useRef(applyDormantTargets);
  applyDormantRef.current = applyDormantTargets;

  const [targetsVersion, setTargetsVersion] = useState(0);
  useEffect(() => {
    if (!content) return;
    const witnessSeek = wit.gravidade || wit.lente !== NO_LENS;
    if (demoCls) {
      computeDemoTargets(demoCls, MAX_GRID * MAX_GRID, sim.targetsArray, {
        mapScale: wit.mapScale,
        containRadius: phy.contRaio,
      });
    } else {
      computeTargets(content, MAX_GRID * MAX_GRID, sim.targetsArray, {
        mapScale: wit.mapScale,
        containRadius: phy.contRaio,
        lens: wit.lente === NO_LENS ? null : wit.lente,
        witnessSeek,
      });
    }
    corridorAnchor.current.valid = false; // formação/follow mudou → re-ancora
    applyDormantRef.current();
    sim.commitTargets();
    setTargetsVersion((v) => v + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    content,
    sim,
    demoCls,
    wit.mapScale,
    wit.lente,
    wit.gravidade,
    phy.contRaio,
    phy.grid,
    phy.worldWrap,
    dorm.formation,
    dorm.spacing,
    dorm.rimInset,
    following,
  ]);

  useFrame((_, delta) => {
    mouseTarget.mode = phy.mouseModo;

    sim.u.maxSpeed.value = phy.maxSpeed;
    sim.u.witWanderWeight.value = wit.wanderW;
    sim.u.witWanderScale.value = wit.wanderScale;
    sim.u.witWanderEvolve.value = wit.wanderEvolve;
    sim.u.witWanderVariance.value = wit.wanderVariance;
    sim.u.witSpeedMul.value = wit.speedMul;
    sim.u.witSpeedVariance.value = wit.speedVariance;
    sim.u.witPauseAmount.value = wit.pausas;
    const hovered = useHover.getState().hovered;
    sim.u.hoverFreezeOn.value = wit.hoverFreeze ? 1 : 0;
    sim.u.hoverFreezeAgent.value =
      wit.hoverFreeze && hovered !== null ? hovered : -1;
    sim.u.wanderWhileSeek.value = wit.wanderWhileSeek;
    sim.u.lockAtCluster.value = wit.lockAtCluster ? 1 : 0;
    sim.u.dormWanderWeight.value = dorm.wanderW;
    sim.u.dormWanderScale.value = dorm.wanderScale;
    sim.u.dormWanderEvolve.value = dorm.wanderEvolve;
    sim.u.dormWanderVariance.value = dorm.wanderVariance;
    sim.u.dormSpeedVariance.value = dorm.speedVariance;
    sim.u.dormPauseAmount.value = dorm.pausas;
    sim.u.wanderWhileForm.value = dorm.wanderWhileForm;
    sim.u.lockAtForm.value = dorm.lockAtForm ? 1 : 0;
    sim.u.sepWeight.value = phy.separacao;
    sim.u.sepRadius.value = phy.sepRaio;
    sim.u.containRadius.value = phy.contRaio;
    sim.u.wrapToroidalSep.value =
      phy.worldWrap && phy.wrapToroidalSep ? 1 : 0;
    sim.u.wrapHysteresis.value = phy.wrapHysteresis;
    sim.u.mouseRadius.value = phy.mouseRaio;
    sim.u.mouseWeight.value = phy.mouseForca;
    sim.u.turnRate.value = phy.giro;
    sim.u.phasePerUnit.value = phy.passo;
    sim.u.perAgentOn.value = wit.auto ? 1 : 0;
    sim.u.v0.value = wit.v0;
    sim.u.v1.value = wit.v1;
    sim.u.hyst.value = wit.histerese;
    sim.u.stateFade.value = wit.fadeEstado;
    sim.u.idlePlayback.value = v.idlePlayback;
    sim.u.settlePlayback.value = v.settlePlayback;
    sim.u.waveGain.value = wit.onda;
    sim.u.dormantSpeedMul.value = dorm.dormVel;
    // Gravidade/lente/demográfica: testemunhas com w=1 no buffer (efeito).
    // Formação ativa liga seekWeight só para os DORMENTES (w=1 nos slots ≥
    // peopleCount — witnessSeek false zera w das testemunhas no commit).
    const formationSeek =
      dorm.formation !== "wander" &&
      !(dorm.formation === "corridor" && following === null);
    const seekOn =
      content && (wit.gravidade || wit.lente !== NO_LENS || demoCls || formationSeek);
    sim.u.seekWeight.value = seekOn ? wit.gravForca : 0;

    // --- pessoa seguida: posição do espelho + trilha p/ heading ---
    const dtc = Math.min(delta, 1 / 20); // mesmo clamp do dt da sim
    followValid.current =
      following !== null &&
      positionMirror.getPosSmooth(following, followPos.current);
    if (following !== trailFor.current) {
      // Troca de pessoa: a trilha da anterior não é rumo da nova.
      trailFor.current = following;
      headTrail.current.length = 0;
    }
    if (followValid.current) {
      const trail = headTrail.current;
      const now = performance.now();
      if (trail.length === 0 || now - trail[trail.length - 1].t >= 250) {
        trail.push({ t: now, x: followPos.current.x, z: followPos.current.z });
        while (trail.length > 0 && now - trail[0].t > 2000) trail.shift();
      }
    } else {
      headTrail.current.length = 0;
    }

    // --- wrap universal (mundo-toro): L = 2×contenção, um só lugar ---
    // (heightfield + sim leem o mesmo uniform via setWorldWrap).
    setWorldWrap(phy.worldWrap ? phy.contRaio * 2 : 0);
    const tileOverride = levaVal("Terrain.tilePeriod", 0);
    setTerrainTileLen(
      tileOverride > 0 ? tileOverride : phy.contRaio * 2,
    );
    setGroundGridRadius(phy.contRaio);

    // --- campo do ativo: uniforms por frame (zero custo de buffer) ---
    const fieldActive = couple.fieldOn && followValid.current;
    sim.u.fieldOn.value = fieldActive ? 1 : 0;
    sim.u.fieldAgent.value = fieldActive ? (following as number) : -1;
    if (fieldActive) sim.u.fieldPos.value.copy(followPos.current);
    sim.u.fieldRadius.value = couple.fieldRadius;
    sim.u.fieldStrength.value = couple.fieldStrength;
    sim.u.yieldWeight.value = couple.yieldW;
    // Inércia do selecionado vale SEMPRE que há follow (campo on ou off).
    sim.u.selAgent.value = followValid.current ? (following as number) : -1;
    sim.u.selInertia.value = couple.selInertia;
    // Story field (modo livre): com-história atraem/repelem dormentes.
    sim.u.storyMode.value =
      couple.storyField === "social"
        ? 1
        : couple.storyField === "repel"
          ? -1
          : 0;
    sim.u.storyRadius.value = couple.storyRadius;
    sim.u.storyRepelRadius.value = Math.min(
      couple.storyRepelRadius,
      couple.storyRadius - 0.05,
    );
    sim.u.storyStrength.value = couple.storyStrength;

    // --- corridor dinâmico: checa a cada ~0,8 s se precisa RE-ANCORAR ---
    // (nunca por frame: alvo que persegue a pessoa vira turba). Re-ancora
    // quando ela atravessou ~35% do corredor, saiu pela lateral ou o rumo
    // virou de verdade (>~70°).
    corridorClock.current += delta;
    if (
      dorm.formation === "corridor" &&
      followValid.current &&
      content &&
      corridorClock.current >= 0.8
    ) {
      corridorClock.current = 0;
      const a = corridorAnchor.current;
      let stale = !a.valid;
      if (a.valid) {
        // Comparação no GROUND frame: com a esteira, a pessoa "anda" pelo
        // mundo via scroll (a posição view fica parada no pino).
        const rx = followPos.current.x + scrollAccum.current.x - a.x;
        const rz = followPos.current.z + scrollAccum.current.y - a.z;
        const along = rx * a.hx + rz * a.hz;
        const side = Math.abs(rx * -a.hz + rz * a.hx);
        // Rumo NOVO só conta se a pessoa está de fato ANDANDO (trilha ≥
        // 1,2 m/2 s) — o fallback câmera→pessoa gira com a órbita e não
        // pode re-ancorar sozinho um corredor já de pé.
        const trail = headTrail.current;
        let turned = false;
        if (trail.length >= 2) {
          const tx = trail[trail.length - 1].x - trail[0].x;
          const tz = trail[trail.length - 1].z - trail[0].z;
          const tl = Math.hypot(tx, tz);
          turned = tl > 1.2 && (tx / tl) * a.hx + (tz / tl) * a.hz < 0.35;
        }
        stale =
          Math.abs(along) > CORRIDOR_LENGTH * 0.35 ||
          side > CORRIDOR_LENGTH * 0.3 ||
          turned;
      }
      if (stale) {
        a.valid = false;
        applyDormantRef.current();
        sim.commitTargets();
        setTargetsVersion((tv) => tv + 1);
      }
    }

    // --- esteira do follow (PADRÃO desde 2026-07-14b): pino + mundo ---
    // Exige follow ativo E estados automáticos (o walking do pino é forçado
    // pela state machine). O heading nasce do rumo da pessoa na entrada e o
    // MOUSE vira o leme (steering): apontar para longe = viajar para lá;
    // apontar NELA (deadzone ~1,5 m) = parar. O mundo responde: todos os
    // outros agentes recuam (update pass), o chão scrolla no mesmo passo e
    // o wrap fecha a ilusão (quem sai por trás reaparece na frente).
    const stageActive = st.stage && followValid.current && wit.auto;
    if (stageActive && !stageWasOn.current) {
      effectiveHeading(stageHeading.current);
      stageSpeedCur.current = 0; // a viagem ACELERA do zero — sem tranco
    }
    stageWasOn.current = stageActive;
    sim.u.stageOn.value = stageActive ? 1 : 0;
    sim.u.stageAgent.value = stageActive ? (following as number) : -1;
    // Steering: direção pessoa→mouse no chão (view frame), com deadzone.
    let steerLen = 0;
    let steerX = 0;
    let steerZ = 0;
    if (st.steerOn && followValid.current && mouseTarget.moved) {
      steerX = mouseTarget.point.x - followPos.current.x;
      steerZ = mouseTarget.point.z - followPos.current.z;
      steerLen = Math.hypot(steerX, steerZ);
    }
    const STEER_DEADZONE = 1.5;
    if (stageActive) {
      // Leme → heading da esteira (giro suavizado por steer strength).
      if (steerLen > STEER_DEADZONE) {
        const k = 1 - Math.exp(-2 * st.steerStrength * dtc);
        stageHeading.current.x += (steerX / steerLen - stageHeading.current.x) * k;
        stageHeading.current.y += (steerZ / steerLen - stageHeading.current.y) * k;
        stageHeading.current.normalize();
      }
      // Rampa de velocidade: deadzone (ou leme off sem rumo) → 0 suave.
      const wantSpeed =
        st.steerOn && mouseTarget.moved && steerLen <= STEER_DEADZONE
          ? 0
          : st.stageSpeed;
      stageSpeedCur.current +=
        (wantSpeed - stageSpeedCur.current) * (1 - Math.exp(-dtc / 0.45));
      sim.u.stageSpeed.value = stageSpeedCur.current;
      (sim.u.stageHeading.value as THREE.Vector2).set(
        stageHeading.current.x,
        stageHeading.current.y,
      );
      // O chão anda para TRÁS do heading: scroll do domínio do noise (e do
      // grid TSL) avança junto — agentes carregados e relevo recuam juntos;
      // os ALVOS (ground frame) são subtraídos do scroll na GPU.
      scrollAccum.current.x += stageHeading.current.x * stageSpeedCur.current * dtc;
      scrollAccum.current.y += stageHeading.current.y * stageSpeedCur.current * dtc;
      setTerrainScroll(scrollAccum.current.x, scrollAccum.current.y);
    } else {
      sim.u.stageSpeed.value = st.stageSpeed;
    }
    // Steering DIRETO (kill-switch: treadmill OFF durante o follow) — o
    // leme empurra a própria pessoa (modo legado, para comparação).
    const legacySteer =
      !stageActive && st.steerOn && followValid.current && steerLen > 0;
    sim.u.steerOn.value = legacySteer ? 1 : 0;
    sim.u.steerStrength.value = st.steerStrength;
    (sim.u.steerDir.value as THREE.Vector2).set(
      legacySteer && steerLen > STEER_DEADZONE ? steerX / steerLen : 0,
      legacySteer && steerLen > STEER_DEADZONE ? steerZ / steerLen : 0,
    );
    if (import.meta.env.DEV) {
      const w = window as unknown as Record<string, unknown>;
      w.__limiarSim = {
        seekWeight: sim.u.seekWeight.value,
        lente: wit.lente,
        dlente: wit.dlente,
        gravidade: wit.gravidade,
        tgt0: Array.from(sim.targetsArray.slice(0, 4)),
        tgt45: Array.from(sim.targetsArray.slice(45 * 4, 45 * 4 + 4)),
        tgtVersion: (sim.targets.value as THREE.BufferAttribute).version,
      };
      // Sondas das mecânicas de 2026-07-14 (campo/formações/palco).
      w.__limiarReadTargets = (i0: number, n: number) =>
        Array.from(sim.targetsArray.slice(i0 * 4, (i0 + n) * 4));
      w.__limiarStageState = {
        formation: dorm.formation,
        fieldOn: fieldActive ? 1 : 0,
        stageOn: stageActive ? 1 : 0,
        scroll: { ...getTerrainScroll() },
        heading: [stageHeading.current.x, stageHeading.current.y],
        followPos: followValid.current ? followPos.current.toArray() : null,
        wrapLen: phy.worldWrap ? phy.contRaio * 2 : 0,
        stageSpeed: stageActive ? stageSpeedCur.current : 0,
        steerOn: st.steerOn ? 1 : 0,
        storyMode: sim.u.storyMode.value,
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
    bundle.setScale(phy.escala);
    bundle.setPaletteAmount(phy.paleta ? 1 : 0);
    bundle.setDebugMode(
      phy.debug === "velocidade"
        ? 1
        : phy.debug === "direção"
          ? 2
          : phy.debug === "alvo"
            ? 3
            : phy.debug === "estado"
              ? 4
              : 0,
    );
    bundle.setFaceFlip(phy.faceFlip ? -1 : 1);
    bundle.setPerAgentStates(wit.auto);
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
      markerRef.current.visible = phy.mouseModo !== "off";
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
          visible={wit.fios}
          // No modo "só núcleos formados" sobram poucos fios acesos — o ganho
          // compensa para a estrutura interna dos núcleos continuar legível.
          alpha={wit.fiosSoNucleos ? Math.min(wit.fiosAlpha * 1.9, 1) : wit.fiosAlpha}
          lift={wit.fiosAltura}
          fadeNear={wit.fiosFadePerto}
          fadeFar={wit.fiosFadeLonge}
          weightGamma={wit.fiosPeso}
          onlyFormed={wit.fiosSoNucleos}
          // 2× o raio de formação: o fio começa a acender ANTES do rótulo
          // aparecer — a chegada se anuncia, a palavra confirma.
          cohesionRadius={wit.formRaio * 2}
          targetsVersion={targetsVersion}
        />
      )}
      {content && wit.palavras && (
        <ClusterLabels
          sim={sim}
          content={content}
          active={wit.gravidade && wit.lente === NO_LENS && !demoCls}
          mapScale={wit.mapScale}
          formRadius={wit.formRaio}
        />
      )}
      {content && (
        <PersonHover sim={sim} content={content} personScale={phy.escala} />
      )}
      {content && <FollowCamera sim={sim} content={content} />}
      <DebugAreas
        visible={phy.debugAreas}
        content={content}
        mapScale={wit.mapScale}
        formRadius={wit.formRaio}
        containRadius={phy.contRaio}
        worldWrap={phy.worldWrap}
        fieldOn={couple.fieldOn}
        fieldRadius={couple.fieldRadius}
        followPos={followPos}
        followValid={followValid}
        stageHeading={stageHeading}
        stageActive={stageWasOn}
      />
      <mesh ref={markerRef}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </>
  );
}
