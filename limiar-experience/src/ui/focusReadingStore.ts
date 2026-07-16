import { create } from "zustand";

/**
 * Ponte do grupo "Focus & reading" do leva (src/ui/FocusControls.tsx) com os
 * consumidores da camada de hierarquia/leitura (2026-07-14):
 *  - ClusterLabels: anti-colisão screen-space + escala por distância;
 *  - ClusterOutlines: toggle + alpha dos contornos dos núcleos;
 *  - DataViewDiscs: LOD "vista de dados" (discos por altura da câmera).
 *
 * Vive num arquivo próprio para não tocar CrowdMesh (território da Multidão).
 */

export interface FocusReadingState {
  /** Anti-colisão dos rótulos em screen-space (empurra o menor p/ cima). */
  labelAntiOverlap: boolean;
  /** Quanto o rótulo encolhe com a distância (0 = nada; clamp em 0,65×). */
  labelDistScale: number;
  /** Contornos (círculo) ao redor dos núcleos formados. */
  outlines: boolean;
  /** Alpha máximo do contorno (o núcleo formado modula por cima). */
  outlineAlpha: number;
  /** LOD "vista de dados": crossfade das pessoas para discos no alto. */
  dataView: boolean;
  /** Altura da câmera (m) onde os discos chegam a plena opacidade. */
  dataViewHeight: number;
  /** Banda de crossfade abaixo da altura (m): começo do fade-in. */
  dataViewBand: number;
  /** Tamanho base do disco (× a escala por pessoa). */
  discSize: number;
}

export const FOCUS_READING_DEFAULTS: FocusReadingState = {
  labelAntiOverlap: true,
  labelDistScale: 0.35,
  outlines: true,
  outlineAlpha: 0.16,
  dataView: true,
  dataViewHeight: 55,
  dataViewBand: 18,
  discSize: 1,
};

export const useFocusReading = create<FocusReadingState>(() => ({
  ...FOCUS_READING_DEFAULTS,
}));
