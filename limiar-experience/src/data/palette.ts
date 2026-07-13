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

/** Inverso do hslToRgb acima (h em graus 0–360, s/l em 0–1). */
export function rgbToHsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (d < 1e-6) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h: number;
  if (max === r) h = 60 * (((g - b) / d) % 6);
  else if (max === g) h = 60 * ((b - r) / d + 2);
  else h = 60 * ((r - g) / d + 4);
  return [(h + 360) % 360, Math.min(s, 1), l];
}

/**
 * Ajuste GLOBAL de matiz/saturação/brilho das pessoas (grupo "Aparência"):
 * re-escreve o MESMO iColorScale por cima da paleta (núcleos + dormentes),
 * como o colorEmphasis — CPU no evento de mudança, zero custo por frame.
 * hue em graus (−180..180), sat/bri multiplicadores (1 = paleta original).
 */
export function applyHsbToColorScale(
  arr: Float32Array,
  count: number,
  hue: number,
  sat: number,
  bri: number,
): void {
  for (let i = 0; i < count; i++) {
    const o = i * 4;
    const [h, s, l] = rgbToHsl(arr[o], arr[o + 1], arr[o + 2]);
    const [r, g, b] = hslToRgb(
      (h + hue + 360) % 360,
      Math.min(1, Math.max(0, s * sat)),
      Math.min(1, Math.max(0, l * bri)),
    );
    arr[o] = r;
    arr[o + 1] = g;
    arr[o + 2] = b;
  }
}

// --- Leitura visual (M3.5) ---------------------------------------------------

/**
 * Puxa a cor em direção à sua luminância (k=1 → cinza) e escurece por `dim`.
 * É a via barata de "coesão visual": não-pertencentes dessaturam durante uma
 * lente/destaque via re-preenchimento do iColorScale (CPU, 46 escritas).
 */
export function desaturate(
  c: [number, number, number],
  k: number,
  dim = 1,
): [number, number, number] {
  const l = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  return [
    (c[0] + (l - c[0]) * k) * dim,
    (c[1] + (l - c[1]) * k) * dim,
    (c[2] + (l - c[2]) * k) * dim,
  ];
}

/**
 * Cor do RÓTULO 3D de um núcleo: a cor do núcleo dessaturada (~45%) e
 * clareada — legível sobre o cinza do Campo sem virar mais um "dado" colorido.
 */
export function clusterLabelColor(clusterId: number): [number, number, number] {
  const d = desaturate(clusterColor(clusterId), 0.45);
  return [
    Math.min(1, d[0] * 1.16 + 0.08),
    Math.min(1, d[1] * 1.16 + 0.08),
    Math.min(1, d[2] * 1.16 + 0.08),
  ];
}
