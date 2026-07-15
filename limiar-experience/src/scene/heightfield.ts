/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import {
  Fn,
  clamp,
  float,
  floor,
  mix,
  select,
  smoothstep,
  uniform,
  uint,
  vec2,
} from "three/tsl";

type N = any;

/**
 * Terreno vivo (M4f, doc 04 §1.1): função de altura h(x,z) implementada
 * DUAS vezes com a MESMA matemática — TSL (GPU: chão deslocado + sim dos
 * agentes) e JS (CPU: marker do mouse, palavras dos núcleos, qualquer um
 * que precise do y real sem readback).
 *
 * Paridade GPU↔CPU garantida por construção:
 *  - hash INTEIRO (PCG, o mesmo do hash() do TSL/three) — nada de
 *    fract(sin(...)) que quebra em mediump/float32 no WebGL2;
 *  - a combinação lattice→seed acontece em ARITMÉTICA DE INTEIROS (wrap
 *    mod 2³² dos dois lados: uint na GPU, >>> 0 / Math.imul no JS);
 *  - value-noise bilinear com fade quíntico + fbm de até 5 oitavas
 *    (gate fracionário por oitava — o slider anda suave) + domain warp;
 *  - o "anfiteatro": um flatten suave no centro (smoothstep radial) mantém
 *    o miolo plano onde os núcleos se formam — colinas moram na borda.
 *
 * Os UNIFORMS são compartilhados (module-level): o mesmo nó alimenta o
 * material do chão E os passes de compute da CrowdSim — quem escreve os
 * valores é o grupo "Terrain" (Scene.tsx), uma vez por frame.
 */

export interface TerrainParams {
  enabled: boolean;
  /** Altura máxima das colinas (0 = terreno plano — default de paridade). */
  amplitude: number;
  /** Frequência base (1/unidades do mundo). */
  scale: number;
  /** Oitavas do fbm (2–5; fracionário = fade da última oitava). */
  octaves: number;
  /** Domain warp 0–1 (dobra as formas — dunas viram cristas orgânicas). */
  warp: number;
  seed: number;
  /** Raio do centro PLANO (anfiteatro dos núcleos). */
  flattenRadius: number;
  /** Largura da banda de transição plano→colinas. */
  flattenBand: number;
}

export const TERRAIN_DEFAULTS: TerrainParams = {
  enabled: true,
  amplitude: 0,
  scale: 0.06,
  octaves: 4,
  warp: 0.35,
  seed: 7,
  flattenRadius: 10,
  flattenBand: 12,
};

/** Presets do dropdown — SÓ mudam os params (a matemática é uma só). */
export const TERRAIN_PRESETS: Record<string, Partial<TerrainParams>> = {
  plains: { amplitude: 1.3, scale: 0.045, octaves: 3, warp: 0.2 },
  dunes: { amplitude: 2.4, scale: 0.075, octaves: 2, warp: 0.65 },
  ridged: { amplitude: 3.2, scale: 0.1, octaves: 5, warp: 0.9 },
  valley: {
    amplitude: 4.5,
    scale: 0.04,
    octaves: 4,
    warp: 0.3,
    flattenRadius: 15,
    flattenBand: 20,
  },
};

/** Params atuais para os consumidores JS (marker, labels…). */
export const useTerrain = create<TerrainParams>(() => ({
  ...TERRAIN_DEFAULTS,
}));

// ---------------------------------------------------------------------------
// Uniforms compartilhados (chão + sim leem os MESMOS nós)

export const terrainU = {
  /** Amplitude EFETIVA (0 quando desligado — decidido na CPU). */
  amp: uniform(0),
  scale: uniform(TERRAIN_DEFAULTS.scale),
  octaves: uniform(TERRAIN_DEFAULTS.octaves),
  warp: uniform(TERRAIN_DEFAULTS.warp),
  seed: uniform(TERRAIN_DEFAULTS.seed),
  flatR: uniform(TERRAIN_DEFAULTS.flattenRadius),
  flatBand: uniform(TERRAIN_DEFAULTS.flattenBand),
  /** Scroll do palco (esteira, doc 04): desloca o DOMÍNIO do noise (warp +
   *  fbm) — o flatten (anfiteatro) fica ancorado no mundo. O CrowdMesh
   *  avança por frame na direção do heading do palco; h(x,z) vira
   *  h(x+scroll) nos DOIS lados (TSL e JS — paridade obrigatória). */
  scrollX: uniform(0),
  scrollZ: uniform(0),
  /** Wrap dos AGENTES (mundo-toro sim): 0 = off, contenção radial volta. */
  wrapLen: uniform(0),
  /** Tile do NOISE do chão — independente do wrap dos agentes (doc 03 §14.8b). */
  terrainTileLen: uniform(42),
  /** Grid TSL no chão (Terrain): espaçamento das linhas e raio do disco. */
  gridCell: uniform(0.25),
  gridRadius: uniform(21),
};

/** Espelho JS do scroll (heightJS lê daqui — mesma paridade dos uniforms). */
const scrollJS = { x: 0, z: 0 };

/** Espelho JS do wrap dos agentes (groundToView, FollowCamera…). */
const wrapJS = { len: 0 };

/** Espelho JS do período de tile do noise do terreno (heightJS). */
const tileJS = { len: 42 };

/** Avança/zera o scroll do palco nos DOIS lados (GPU + JS) de uma vez. */
export function setTerrainScroll(x: number, z: number): void {
  terrainU.scrollX.value = x;
  terrainU.scrollZ.value = z;
  scrollJS.x = x;
  scrollJS.z = z;
}

export function getTerrainScroll(): { x: number; z: number } {
  return scrollJS;
}

/** Liga/desliga o wrap dos AGENTES (GPU + JS). 0 = off. */
export function setWorldWrap(len: number): void {
  terrainU.wrapLen.value = len;
  wrapJS.len = len;
}

export function getWorldWrapLen(): number {
  return wrapJS.len;
}

/**
 * Período de tile do value-noise do chão — desacoplado do wrap dos agentes.
 * Default efetivo: 2× contenção (CrowdMesh). 0 = noise contínuo sem tile.
 */
export function setTerrainTileLen(len: number): void {
  terrainU.terrainTileLen.value = len;
  tileJS.len = len;
}

export function getTerrainTileLen(): number {
  return tileJS.len;
}

/** Raio do disco do grid no chão (= contenção quando auto). */
export function setGroundGridRadius(radius: number): void {
  terrainU.gridRadius.value = radius;
}

export function setGroundGridCell(cell: number): void {
  terrainU.gridCell.value = cell;
}

export function getGroundGridRadius(): number {
  return terrainU.gridRadius.value as number;
}

/** Delta toroidal: menor caminho no toro de período L → [−L/2, L/2). */
export function wrapDeltaJS(d: number): number {
  const L = wrapJS.len;
  if (L <= 0) return d;
  return d - L * Math.floor(d / L + 0.5);
}

/**
 * Ground frame → view frame: um ponto ancorado no MUNDO (alvo, centroide de
 * núcleo) aparece na área canônica deslocado pelo scroll da esteira e
 * wrappado. Labels/anéis de debug usam isto para acompanhar o referencial.
 */
export function groundToViewJS(gx: number, gz: number): [number, number] {
  let x = gx - scrollJS.x;
  let z = gz - scrollJS.z;
  if (wrapJS.len > 0) {
    x = wrapDeltaJS(x);
    z = wrapDeltaJS(z);
  }
  return [x, z];
}

/** Escreve params → uniforms + store (chamado pelo grupo Terrain, Scene). */
export function commitTerrain(p: TerrainParams): void {
  terrainU.amp.value = p.enabled ? p.amplitude : 0;
  terrainU.scale.value = p.scale;
  terrainU.octaves.value = p.octaves;
  terrainU.warp.value = p.warp;
  terrainU.seed.value = p.seed;
  terrainU.flatR.value = p.flattenRadius;
  terrainU.flatBand.value = p.flattenBand;
  useTerrain.setState(p);
}

// ---------------------------------------------------------------------------
// A matemática, lado JS (double, mas todo o caminho do hash é uint32)

function pcgJS(n: number): number {
  const state = (Math.imul(n, 747796405) + 2891336453) >>> 0;
  const word =
    Math.imul((state >>> (((state >>> 28) + 4) & 31)) ^ state, 277803737) >>> 0;
  return ((word >>> 22) ^ word) >>> 0;
}

/** Hash 0..1 do ponto inteiro (ix,iz) da lattice + canal k (oitava/warp). */
function hash01JS(ix: number, iz: number, k: number): number {
  const h = pcgJS((ix >>> 0) ^ pcgJS((iz >>> 0) ^ pcgJS(k >>> 0)));
  return h / 4294967296;
}

function fadeJS(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/** Índice de lattice wrappado no período P (P=0 → identidade, sem wrap). */
function wrapIdxJS(i: number, P: number): number {
  return P > 0 ? ((i % P) + P) % P : i;
}

/** Value-noise 2D em [-1,1] no canal k; P>0 tilea a lattice (mundo-toro). */
function vnoiseJS(px: number, pz: number, k: number, P = 0): number {
  const ix = Math.floor(px);
  const iz = Math.floor(pz);
  const fx = px - ix;
  const fz = pz - iz;
  const ux = fadeJS(fx);
  const uz = fadeJS(fz);
  // O wrap acontece no ÍNDICE (ix e ix+1 separadamente): a célula da costura
  // interpola entre a última coluna e a primeira — h(x+L) = h(x) exato.
  const x0 = wrapIdxJS(ix, P);
  const x1 = wrapIdxJS(ix + 1, P);
  const z0 = wrapIdxJS(iz, P);
  const z1 = wrapIdxJS(iz + 1, P);
  const a = hash01JS(x0, z0, k);
  const b = hash01JS(x1, z0, k);
  const c = hash01JS(x0, z1, k);
  const d = hash01JS(x1, z1, k);
  return (a + (b - a) * ux + (c - a) * uz + (a - b - c + d) * ux * uz) * 2 - 1;
}

const MAX_OCTAVES = 5;
/** Deslocamento máximo do domain warp em unidades do mundo. */
const WARP_DIST = 8;

/**
 * Altura do terreno em (x,z) — lado CPU. `p` default = params atuais do
 * store (marker/labels chamam sem se preocupar com o grupo Terrain).
 */
export function heightJS(
  x: number,
  z: number,
  p: TerrainParams = useTerrain.getState(),
): number {
  const amp = p.enabled ? p.amplitude : 0;
  if (amp === 0) return 0;
  const seed = Math.round(p.seed);
  const tileL = tileJS.len;
  const wrapL = wrapJS.len;

  // Scroll do palco: desloca o DOMÍNIO do noise (o flatten usa o x/z do
  // mundo, mais abaixo — o anfiteatro não anda com a esteira).
  const xs = x + scrollJS.x;
  const zs = z + scrollJS.z;

  // Tile do noise (independente do wrap dos agentes).
  const quant = (freq: number): { f: number; P: number } => {
    if (tileL <= 0) return { f: freq, P: 0 };
    const P = Math.max(1, Math.floor(tileL * freq + 0.5));
    return { f: P / tileL, P };
  };

  // domain warp: um vnoise por eixo em meia frequência
  const qw = quant(p.scale * 0.5);
  const wx = vnoiseJS(xs * qw.f, zs * qw.f, seed * 8 + 101, qw.P);
  const wz = vnoiseJS(xs * qw.f, zs * qw.f, seed * 8 + 202, qw.P);
  const xq = xs + wx * p.warp * WARP_DIST;
  const zq = zs + wz * p.warp * WARP_DIST;

  // fbm com gate fracionário por oitava
  let sum = 0;
  let ampSum = 0;
  let a = 1;
  let freq = p.scale;
  for (let o = 0; o < MAX_OCTAVES; o++) {
    const g = Math.min(1, Math.max(0, p.octaves - o));
    const qo = quant(freq);
    sum += vnoiseJS(xq * qo.f, zq * qo.f, seed * 8 + o, qo.P) * a * g;
    ampSum += a * g;
    a *= 0.5;
    freq *= 2;
  }
  const n = sum / Math.max(ampSum, 1e-5);

  // Anfiteatro: com wrap dos AGENTES ligado, flatten viaja no domínio toroidal.
  const dist =
    wrapL > 0 ? Math.hypot(wrapDeltaJS(xs), wrapDeltaJS(zs)) : Math.hypot(x, z);
  const t = Math.min(
    1,
    Math.max(0, (dist - p.flattenRadius) / Math.max(p.flattenBand, 1e-5)),
  );
  const flat = t * t * (3 - 2 * t);

  return n * amp * flat;
}

// ---------------------------------------------------------------------------
// A matemática, lado TSL — MESMOS passos, mesmos números

const pcgTSL = (n: N): N => {
  const state: N = n.mul(uint(747796405)).add(uint(2891336453));
  const word: N = state
    .shiftRight(state.shiftRight(uint(28)).add(uint(4)))
    .bitXor(state)
    .mul(uint(277803737));
  return word.shiftRight(uint(22)).bitXor(word);
};

/** ix/iz: nós INT (floor já aplicado); k: nó UINT. */
const hash01TSL = (ix: N, iz: N, k: N): N =>
  pcgTSL(ix.toUint().bitXor(pcgTSL(iz.toUint().bitXor(pcgTSL(k)))))
    .toFloat()
    .mul(1 / 2 ** 32);

const fadeTSL = (t: N): N =>
  t.mul(t).mul(t).mul(t.mul(t.mul(6).sub(15)).add(10));

/** Índice de lattice wrappado no período P (float floor-mod ≡ JS; P=0 off).
 *  A divisão usa max(P,1) para nunca gerar NaN — o select descarta o ramo. */
const wrapIdxTSL = (i: N, P: N): N =>
  select(
    P.greaterThan(0.5),
    i.sub(P.mul(i.div(P.max(1)).floor())),
    i,
  );

const vnoiseTSL = (px: N, pz: N, k: N, P: N): N => {
  const fx: N = floor(px);
  const fz: N = floor(pz);
  // Wrap no ÍNDICE, cada canto separado (a célula da costura interpola
  // última coluna → primeira — h(x+L)=h(x) exato, paridade com o JS).
  const x0: N = wrapIdxTSL(fx, P).toInt();
  const x1: N = wrapIdxTSL(fx.add(1), P).toInt();
  const z0: N = wrapIdxTSL(fz, P).toInt();
  const z1: N = wrapIdxTSL(fz.add(1), P).toInt();
  const ux: N = fadeTSL(px.sub(fx));
  const uz: N = fadeTSL(pz.sub(fz));
  const a: N = hash01TSL(x0, z0, k);
  const b: N = hash01TSL(x1, z0, k);
  const c: N = hash01TSL(x0, z1, k);
  const d: N = hash01TSL(x1, z1, k);
  return mix(mix(a, b, ux), mix(c, d, ux), uz).mul(2).sub(1);
};

/** Delta toroidal TSL (menor caminho no toro; L=0 → identidade). */
export const wrapDeltaTSL = (d: N, L: N): N =>
  select(
    L.greaterThan(0.5),
    d.sub(L.mul(d.div(L.max(1e-5)).add(0.5).floor())),
    d,
  );

/**
 * Wrap de POSIÇÃO com histerese na costura (2026-07-15): só teleporta quando
 * |coord| > L/2 + h — evita oscilar no limiar. h=0 ≈ wrap imediato em ±L/2.
 */
export const wrapPosTSL = (xz: N, L: N, h: N): N => {
  const half: N = L.mul(0.5);
  const on: N = L.greaterThan(0.5);
  const lim: N = half.add(h);
  const wx: N = select(
    on.and(xz.x.abs().greaterThan(lim)),
    wrapDeltaTSL(xz.x, L),
    xz.x,
  );
  const wz: N = select(
    on.and(xz.y.abs().greaterThan(lim)),
    wrapDeltaTSL(xz.y, L),
    xz.y,
  );
  return vec2(wx, wz);
};

/**
 * Altura do terreno — lado GPU (mesmos uniforms do chão e da sim).
 * Uso: `heightTSL(pos.x, pos.z)` dentro de qualquer Fn/material.
 */
// Gancho dev p/ sondas de paridade GPU↔CPU (scripts/terrain-probe):
// compara heightJS(x,z) com o y real dos agentes lido por readback.
if (import.meta.env?.DEV && typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__limiarHeightJS = (
    x: number,
    z: number,
  ) => heightJS(x, z);
}

export const heightTSL = /* @__PURE__ */ Fn(([x, z]: N[]) => {
  const u = terrainU;
  const seed: N = u.seed.round().toInt().toUint().mul(uint(8));
  const tileL: N = u.terrainTileLen;
  const tileOn: N = tileL.greaterThan(0.5);
  const wrapL: N = u.wrapLen;
  const wrapOn: N = wrapL.greaterThan(0.5);

  // Scroll do palco (paridade com heightJS): noise anda, flatten fica.
  const xs: N = x.add(u.scrollX);
  const zs: N = z.add(u.scrollZ);

  // Tile do noise — período terrainTileLen (desacoplado do wrap dos agentes).
  const quant = (freq: N): { f: N; P: N } => {
    const P: N = tileL.mul(freq).add(0.5).floor().max(1);
    return {
      f: select(tileOn, P.div(tileL.max(1e-5)), freq),
      P: select(tileOn, P, float(0)),
    };
  };

  const qw = quant(u.scale.mul(0.5));
  const wx: N = vnoiseTSL(xs.mul(qw.f), zs.mul(qw.f), seed.add(uint(101)), qw.P);
  const wz: N = vnoiseTSL(xs.mul(qw.f), zs.mul(qw.f), seed.add(uint(202)), qw.P);
  const xq: N = xs.add(wx.mul(u.warp).mul(WARP_DIST));
  const zq: N = zs.add(wz.mul(u.warp).mul(WARP_DIST));

  const sum = float(0).toVar();
  const ampSum = float(0).toVar();
  let a: N = float(1);
  let freq: N = u.scale;
  for (let o = 0; o < MAX_OCTAVES; o++) {
    const g: N = clamp(u.octaves.sub(o), 0, 1);
    const qo = quant(freq);
    sum.addAssign(
      vnoiseTSL(xq.mul(qo.f), zq.mul(qo.f), seed.add(uint(o)), qo.P)
        .mul(a)
        .mul(g),
    );
    ampSum.addAssign(a.mul(g));
    a = a.mul(0.5);
    freq = freq.mul(2);
  }
  const n: N = sum.div(ampSum.max(1e-5));

  // Flatten: anfiteatro segue o wrap dos AGENTES (esteira), não o tile do noise.
  const dist: N = select(
    wrapOn,
    vec2(wrapDeltaTSL(xs, wrapL), wrapDeltaTSL(zs, wrapL)).length(),
    vec2(x, z).length(),
  );
  const flat: N = smoothstep(u.flatR, u.flatR.add(u.flatBand.max(1e-5)), dist);

  return n.mul(u.amp).mul(flat);
});
