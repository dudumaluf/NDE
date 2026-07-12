/**
 * Paleta por núcleo (cluster_id): matizes espaçados pelo ângulo áureo —
 * núcleos vizinhos no índice nunca ficam com cores vizinhas no círculo.
 * Saturação sóbria de propósito: o Campo vive em cinzas quentes e a cor
 * é dado conquistado (doc 01); aqui ela marca pertencimento, não grita.
 */

const GOLDEN_ANGLE = 137.508;

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [f(0), f(8), f(4)];
}

/** Cor de um núcleo (sRGB 0–1). Estável para qualquer quantidade de núcleos. */
export function clusterColor(clusterId: number): [number, number, number] {
  const hue = (clusterId * GOLDEN_ANGLE + 24) % 360;
  return hslToRgb(hue, 0.52, 0.62);
}

/** Cinza quente dos dormentes — mais escuro que o chão, some na névoa. */
export const DORMANT_COLOR: [number, number, number] = [0.33, 0.32, 0.31];

/** Variação sutil para dormentes não virarem um bloco uniforme. */
export function dormantColor(rand: number): [number, number, number] {
  const v = 0.85 + rand * 0.3;
  return [DORMANT_COLOR[0] * v, DORMANT_COLOR[1] * v, DORMANT_COLOR[2] * v];
}

// --- Paleta das lentes demográficas -----------------------------------------

/**
 * "Não declarado" nas lentes demográficas: cinza um pouco mais claro que o
 * dormente — ainda é uma pessoa real, só não respondeu a essa pergunta.
 */
export const DEMO_ND_COLOR: [number, number, number] = [0.46, 0.45, 0.44];

/** Matizes espaçados à mão (não sequenciais no círculo) — sóbrios de propósito. */
const DEMO_HUES = [18, 205, 95, 315, 45, 175, 260, 350, 130, 225, 70, 290];

/**
 * Cor categórica sóbria para a i-ésima categoria de uma lente demográfica.
 * Depois de 12 categorias os matizes repetem mais escuros (geo tem ~20).
 */
export function demoCategoryColor(i: number): [number, number, number] {
  const hue = DEMO_HUES[i % DEMO_HUES.length];
  const l = i < DEMO_HUES.length ? 0.62 : 0.45;
  return hslToRgb(hue, 0.5, l);
}

/**
 * Rampa ordinal (0→1) para lentes com ordem natural (décadas, tempo):
 * passado frio e escuro (ardósia) → presente quente e claro (terracota),
 * dando a volta pelo violeta (215°→390°≡30°) — sem passar pelo verde.
 */
export function demoRampColor(t: number): [number, number, number] {
  const k = Math.min(1, Math.max(0, t));
  const hue = (215 + 175 * k) % 360;
  return hslToRgb(hue, 0.42 + 0.16 * k, 0.46 + 0.2 * k);
}

/** [r,g,b] 0–1 → "rgb(...)" para os chips da legenda no HUD. */
export function cssColor([r, g, b]: [number, number, number]): string {
  const c = (v: number) => Math.round(v * 255);
  return `rgb(${c(r)}, ${c(g)}, ${c(b)})`;
}
