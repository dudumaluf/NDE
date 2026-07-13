import { create } from "zustand";

/**
 * Ponte da LEGENDA da experiência (src/ui/Legend.tsx) com a cena:
 *  - CrowdMesh publica qual lente de ELEMENTO está ativa (a demográfica já
 *    tem ponte própria em data/demoLensStore.ts — não duplicamos);
 *  - a Legend dispara o "flash": clique num chip destaca aquele grupo por
 *    ~2s (os demais dessaturam via re-preenchimento do iColorScale — CPU,
 *    46 escritas, nada por frame).
 */

export interface LegendFlash {
  /** cluster = núcleo (id numérico) · demo = categoria demográfica (índice) · side = lado da lente de elemento ("has"/"not"). */
  kind: "cluster" | "demo" | "side";
  id: string;
}

interface LegendState {
  /** Key do elemento da lente ativa (null = sem lente de elemento). */
  elementLens: string | null;
  /** Destaque temporário disparado pela legenda (null = nenhum). */
  flash: LegendFlash | null;
}

export const useLegend = create<LegendState>(() => ({
  elementLens: null,
  flash: null,
}));

let flashTimer: ReturnType<typeof setTimeout> | null = null;

/** Destaca um grupo por `ms` (default 2s); re-clicar reinicia o relógio. */
export function triggerLegendFlash(flash: LegendFlash, ms = 2000): void {
  if (flashTimer) clearTimeout(flashTimer);
  useLegend.setState({ flash });
  flashTimer = setTimeout(() => {
    useLegend.setState({ flash: null });
    flashTimer = null;
  }, ms);
}

export function setElementLens(key: string | null): void {
  if (useLegend.getState().elementLens !== key) {
    useLegend.setState({ elementLens: key });
  }
}
