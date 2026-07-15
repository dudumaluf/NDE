/** Geometria compartilhada da timeline (viewBox fixo). */
export const TL_W = 640;
export const TL_PAD_X = 24;

/**
 * Posição no zoom: capítulo focado na esquerda, próximo na direita.
 * overviewX vem do t_norm do beat representativo.
 */
export function stationZoomX(index: number, focus: number, count: number): number {
  const left = TL_PAD_X;
  const right = TL_W - TL_PAD_X;
  if (index === focus) return left;
  if (index === focus + 1) return right;
  if (index < focus) return left - 8;
  if (index > focus + 1 || (focus === count - 1 && index > focus)) return right + 8;
  return left;
}

/** Opacidade alvo de um capítulo durante o zoom (sem peek). Só foco + próximo. */
export function stationZoomOpacity(index: number, focus: number, count: number): number {
  if (index === focus) return 1;
  if (index === focus + 1 && focus < count - 1) return 0.4;
  return 0;
}

/** Mapeia t_norm de momentos para a janela do capítulo em zoom. */
export function momentZoomX(
  tNorm: number,
  focusT: number,
  nextT: number,
): number {
  const span = TL_W - TL_PAD_X * 2;
  const dt = Math.max(0.02, nextT - focusT);
  const k = Math.max(0, Math.min(1, (tNorm - focusT) / dt));
  return TL_PAD_X + k * span;
}

export function lerpX(overview: number, zoom: number, k: number): number {
  return overview + (zoom - overview) * k;
}

/** Easing suave para o zoom overview ↔ capítulo (0..1 → 0..1). */
export function easeInOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export interface ZoomMorphSnap {
  zx: number;
  zo: number;
}

/** Interpola alvo de zoom quando a janela muda com zk ≈ 1 (sub-zoom, troca de capítulo). */
export function morphZoomTarget(
  key: string,
  zxTo: number,
  zoTo: number,
  mk: number,
  snap: Record<string, ZoomMorphSnap>,
): ZoomMorphSnap {
  const from = snap[key];
  if (!from || mk >= 1) return { zx: zxTo, zo: zoTo };
  return {
    zx: from.zx + (zxTo - from.zx) * mk,
    zo: from.zo + (zoTo - from.zo) * mk,
  };
}

export function formatTime(s: number): string {
  if (!Number.isFinite(s) || s < 0) return "0:00";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}
