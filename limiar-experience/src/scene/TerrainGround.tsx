/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three/webgpu";
import { useControls } from "leva";
import {
  color,
  float,
  fwidth,
  length,
  min,
  mix,
  positionLocal,
  positionWorld,
  smoothstep,
  transformNormalToView,
  uniform,
  vec2,
  vec3,
  vertexStage,
} from "three/tsl";
import { mouseTarget } from "../sim/mouseTarget";
import { pref, prefBool, prefNum, prefStr } from "../lib/prefs";
import { qpHas } from "../lib/urlParams";
import { useAppearance } from "../ui/appearanceStore";
import {
  TERRAIN_DEFAULTS,
  TERRAIN_PRESETS,
  commitTerrain,
  heightTSL,
  setGroundGridCell,
  terrainU,
} from "./heightfield";

type N = any;

/**
 * O chão vivo (M4f): UM mesh subdividido substitui o trio antigo
 * (circleGeometry flat + meshStandardMaterial + gridHelper).
 *
 * - `positionNode` desloca y por h(x,z) (heightfield compartilhado — a sim
 *   usa o MESMO nó, então os pés grudam na superfície);
 * - normal por diferenças finitas (2 taps extras) no VERTEX (varying);
 * - o GRID vira TSL no próprio material: linhas anti-aliased por
 *   fract/fwidth, célula e raio via uniforms (raio = contenção em
 *   Field · physics) — o grid ABRAÇA o relevo em vez de boiar.
 * - raycast do mouse continua na malha CPU (flat): quem precisa do y real
 *   soma heightJS (marker no CrowdMesh, labels) — aceitável e barato.
 *
 * Com amplitude 0 (default) o look é IDÊNTICO ao chão antigo — paridade
 * visual até o Dudu ligar o terreno no grupo Terrain.
 */

const GROUND_RADIUS = 80;

const PRESET_OPTIONS = ["custom", ...Object.keys(TERRAIN_PRESETS)] as const;

export function TerrainGround() {
  const chao = useAppearance((s) => s.chao);
  const gridCor = useAppearance((s) => s.gridCor);
  const gridAlpha = useAppearance((s) => s.gridAlpha);

  const [t, setT] = useControls("Terrain", () => ({
    enabled: {
      value: prefBool("terrainOn", "Terrain.enabled", TERRAIN_DEFAULTS.enabled),
      label: "enabled",
    },
    preset: {
      value: prefStr("terrain", "Terrain.preset", "custom", PRESET_OPTIONS),
      options: [...PRESET_OPTIONS],
      label: "preset",
      hint: "picking a preset writes the sliders below (the math is one) — tweak freely after",
    },
    amplitude: {
      value: prefNum("terrainAmp", "Terrain.amplitude", TERRAIN_DEFAULTS.amplitude),
      min: 0,
      max: 6,
      label: "amplitude",
    },
    scale: {
      value: pref("Terrain.scale", TERRAIN_DEFAULTS.scale),
      min: 0.01,
      max: 0.3,
      label: "scale (freq)",
    },
    octaves: {
      value: pref("Terrain.octaves", TERRAIN_DEFAULTS.octaves),
      min: 2,
      max: 5,
      step: 1,
      label: "octaves",
    },
    warp: {
      value: pref("Terrain.warp", TERRAIN_DEFAULTS.warp),
      min: 0,
      max: 1,
      label: "warp",
    },
    seed: {
      value: pref("Terrain.seed", TERRAIN_DEFAULTS.seed),
      min: 1,
      max: 9999,
      step: 1,
      label: "seed",
    },
    flattenRadius: {
      value: pref("Terrain.flattenRadius", TERRAIN_DEFAULTS.flattenRadius),
      min: 0,
      max: 30,
      label: "flatten radius",
    },
    flattenBand: {
      value: pref("Terrain.flattenBand", TERRAIN_DEFAULTS.flattenBand),
      min: 1,
      max: 30,
      label: "flatten band",
    },
    gridCell: {
      value: prefNum("gridCell", "Terrain.gridCell", 0.25),
      min: 0.05,
      max: 2,
      label: "grid cell",
      hint: "spacing between ground grid lines — radius follows containment (Field · physics)",
    },
    gridEdge: {
      value: pref("Terrain.gridEdge", 0.35),
      min: 0,
      max: 3,
      label: "grid edge fade (m)",
      hint: "soft fade at the play disc rim (0 = hard circle)",
    },
    tilePeriod: {
      value: prefNum("terrainTile", "Terrain.tilePeriod", 0),
      min: 0,
      max: 120,
      label: "noise tile period (m)",
      hint: "0 = auto (2× containment). Tiles height noise — independent of world wrap",
    },
  }));

  // Preset escolhido → escreve os sliders (1×; "custom" não faz nada).
  // No boot, só aplica se veio pela URL (?terrain=) — senão o preset salvo
  // sobrescreveria ajustes finos que o Dudu fez DEPOIS de escolhê-lo.
  const bootRef = useRef(true);
  useEffect(() => {
    const boot = bootRef.current;
    bootRef.current = false;
    const params = TERRAIN_PRESETS[t.preset];
    if (!params) return;
    if (boot && !qpHas("terrain")) return;
    const { amplitude, ...rest } = params;
    // ?terrainAmp= na URL vence a amplitude do preset (screenshots).
    setT(boot && qpHas("terrainAmp") ? rest : { amplitude, ...rest });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.preset, setT]);

  // Params → uniforms compartilhados (chão + sim) e store JS.
  useEffect(() => {
    commitTerrain({
      enabled: t.enabled,
      amplitude: t.amplitude,
      scale: t.scale,
      octaves: t.octaves,
      warp: t.warp,
      seed: t.seed,
      flattenRadius: t.flattenRadius,
      flattenBand: t.flattenBand,
    });
  }, [
    t.enabled,
    t.amplitude,
    t.scale,
    t.octaves,
    t.warp,
    t.seed,
    t.flattenRadius,
    t.flattenBand,
    t.gridCell,
  ]);

  useEffect(() => {
    setGroundGridCell(t.gridCell);
  }, [t.gridCell]);

  const built = useMemo(() => {
    // Disco subdividido nas DUAS direções (CircleGeometry só divide o
    // perímetro — deslocar y precisa de vértices no miolo).
    const geometry = new THREE.RingGeometry(0, GROUND_RADIUS, 256, 96);
    geometry.rotateX(-Math.PI / 2);

    const uChao = uniform(color("#616161"));
    const uGrid = uniform(color("#7c7c7c"));
    const uGridAlpha = uniform(1);
    const uGridEdge = uniform(0.35);

    const material = new THREE.MeshStandardNodeMaterial({
      roughness: 0.95,
      metalness: 0,
    });

    const px: N = positionLocal.x;
    const pz: N = positionLocal.z;
    material.positionNode = vec3(px, heightTSL(px, pz), pz);

    // Normal por diferenças finitas (2 taps extras), por VÉRTICE (varying).
    const e = float(0.55);
    const nx: N = heightTSL(px.sub(e), pz).sub(heightTSL(px.add(e), pz));
    const nz: N = heightTSL(px, pz.sub(e)).sub(heightTSL(px, pz.add(e)));
    const nObj: N = vertexStage(vec3(nx, e.mul(2), nz).normalize());
    material.normalNode = transformNormalToView(nObj).normalize();

    // Grid anti-aliased (fract/fwidth) na área do gridHelper antigo.
    // As LINHAS vivem no mesmo domínio scrollado do noise (palco/esteira:
    // o chão desliza sob os pés); a JANELA (inside) fica fixa no mundo —
    // como uma esteira vista por uma moldura parada.
    const xz: N = positionWorld.xz;
    const scrolled: N = xz.add(vec2(terrainU.scrollX, terrainU.scrollZ));
    const coord: N = scrolled.div(terrainU.gridCell);
    const g2: N = coord.sub(0.5).fract().sub(0.5).abs().div(fwidth(coord));
    const line: N = float(1).sub(min(min(g2.x, g2.y), float(1)));
    const dist: N = length(xz);
    const inside: N = float(1).sub(
      smoothstep(
        terrainU.gridRadius.sub(uGridEdge),
        terrainU.gridRadius,
        dist,
      ),
    );
    material.colorNode = mix(
      uChao,
      uGrid,
      line.mul(uGridAlpha).mul(inside),
    );

    return { geometry, material, uChao, uGrid, uGridAlpha, uGridEdge };
  }, []);

  useEffect(() => {
    (built.uChao.value as THREE.Color).set(chao);
    (built.uGrid.value as THREE.Color).set(gridCor);
    built.uGridAlpha.value = gridAlpha;
    built.uGridEdge.value = t.gridEdge;
  }, [built, chao, gridCor, gridAlpha, t.gridEdge]);

  useEffect(() => {
    const { geometry, material } = built;
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [built]);

  return (
    <mesh
      geometry={built.geometry}
      material={built.material}
      onPointerMove={(e) => {
        mouseTarget.point.copy(e.point);
        mouseTarget.moved = true;
      }}
    />
  );
}
