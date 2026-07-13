import { create } from "zustand";

/**
 * Ponte da LEGENDA da experiência (src/ui/Legend.tsx) com a cena:
 *  - CrowdMesh publica qual lente de ELEMENTO está ativa (a demográfica já
 *    tem ponte própria em data/demoLensStore.ts — não duplicamos);
 *  - a Legend dispara o "flash": clique num chip destaca aquele grupo —
 *    selecionados mantêm cor PLENA, o resto colapsa num cinza uniforme
 *    (pedido do Dudu, 2026-07-12), com fade-out suave no fim.
 *
 * O flash carrega `start` + `holdMs`: o CrowdMesh calcula o envelope
 * (1 durante o hold → 0 ao longo de LEGEND_FLASH_FADE_S) e re-escreve o
 * iColorScale só enquanto o valor muda — nada por frame fora do fade.
 */

export interface LegendFlash {
  /** cluster = núcleo (id numérico) · demo = categoria demográfica (índice) · side = lado da lente de elemento ("has"/"not"). */
  kind: "cluster" | "demo" | "side";
  id: string;
}

/** Flash vivo: o clique + o relógio do envelope. */
export interface ActiveLegendFlash extends LegendFlash {
  /** performance.now() do clique. */
  start: number;
  /** Quanto tempo segura em intensidade cheia antes do fade-out. */
  holdMs: number;
}

/** Duração do fade-out de volta às cores (s) — o hold vem do leva. */
export const LEGEND_FLASH_FADE_S = 0.7;

interface LegendState {
  /** Key do elemento da lente ativa (null = sem lente de elemento). */
  elementLens: string | null;
  /** Destaque temporário disparado pela legenda (null = nenhum). */
  flash: ActiveLegendFlash | null;
}

export const useLegend = create<LegendState>(() => ({
  elementLens: null,
  flash: null,
}));

let flashTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Destaca um grupo por `holdMs` + fade; re-clicar reinicia o relógio.
 * O timer limpa o estado DEPOIS do fade completar (o envelope já chegou a 0).
 */
export function triggerLegendFlash(flash: LegendFlash, holdMs = 2000): void {
  if (flashTimer) clearTimeout(flashTimer);
  useLegend.setState({
    flash: { ...flash, start: performance.now(), holdMs },
  });
  flashTimer = setTimeout(
    () => {
      useLegend.setState({ flash: null });
      flashTimer = null;
    },
    holdMs + LEGEND_FLASH_FADE_S * 1000 + 120,
  );
}

/** Envelope do flash em t=agora: 1 no hold, smootherstep → 0 no fade. */
export function legendFlashK(flash: ActiveLegendFlash, now: number): number {
  const t = (now - flash.start - flash.holdMs) / (LEGEND_FLASH_FADE_S * 1000);
  if (t <= 0) return 1;
  if (t >= 1) return 0;
  return 1 - t * t * (3 - 2 * t);
}

export function setElementLens(key: string | null): void {
  if (useLegend.getState().elementLens !== key) {
    useLegend.setState({ elementLens: key });
  }
}

// Gancho de dev p/ screenshots headless: dispara o flash sem clique real.
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__limiarFlash = (
    kind: LegendFlash["kind"],
    id: string,
    holdMs?: number,
  ) => triggerLegendFlash({ kind, id }, holdMs);
}
