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
