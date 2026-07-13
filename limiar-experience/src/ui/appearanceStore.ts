import { create } from "zustand";

/**
 * Ponte dos controles de APARÊNCIA (grupo "Aparência" no leva, montado em
 * src/ui/AppearanceControls.tsx) com quem consome:
 *  - Scene.tsx: fundo, chão, grid (cor+alpha);
 *  - PostFX.tsx: cor da névoa (independente do fundo desde 2026-07-12);
 *  - CrowdMesh: HSB global das pessoas (re-escrita do iColorScale, zero
 *    custo por frame) e intensidade do destaque da legenda;
 *  - legendStore: duração do destaque (hold) — o fade é fixo (0.7 s).
 *
 * Valores default = look atual (paridade pixel-perfect quando nada muda).
 */

export interface HsbAdjust {
  /** Deslocamento de matiz em graus (−180..180, 0 = paleta original). */
  hue: number;
  /** Multiplicador de saturação (0..2, 1 = original). */
  sat: number;
  /** Multiplicador de brilho/lightness (0..2, 1 = original). */
  bri: number;
}

export interface AppearanceState {
  fundo: string;
  nevoaCor: string;
  chao: string;
  gridCor: string;
  gridAlpha: number;
  hsb: HsbAdjust;
  /** Destaque da legenda: 0 = nada, 1 = não-selecionados colapsam no cinza. */
  destaqueIntensidade: number;
  /** Segundos que o destaque segura antes do fade-out. */
  destaqueDuracao: number;
}

export const APPEARANCE_DEFAULTS: AppearanceState = {
  fundo: "#6d6d6d",
  nevoaCor: "#6d6d6d",
  chao: "#616161",
  gridCor: "#7c7c7c",
  gridAlpha: 1,
  hsb: { hue: 0, sat: 1, bri: 1 },
  destaqueIntensidade: 1,
  destaqueDuracao: 2,
};

export const useAppearance = create<AppearanceState>(() => ({
  ...APPEARANCE_DEFAULTS,
}));

export function isHsbIdentity(h: HsbAdjust): boolean {
  return h.hue === 0 && h.sat === 1 && h.bri === 1;
}
