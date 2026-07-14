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
  /** cluster = núcleo (id numérico) · demo = categoria demográfica (índice) ·
   *  side = lado da lente de elemento ("has"/"not") ·
   *  clusterElement = interseção núcleo ∩ elemento ("<clusterId>:<elementKey>",
   *  a sublente do modo focus — 2026-07-14). */
  kind: "cluster" | "demo" | "side" | "clusterElement";
  id: string;
}

/** Flash vivo: o clique + o relógio do envelope. */
export interface ActiveLegendFlash extends LegendFlash {
  /** performance.now() do clique. */
  start: number;
  /** Quanto tempo segura em intensidade cheia antes do fade-out.
   *  Infinity = segura até clearLegendFlash() (modo focus). */
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
 * holdMs = Infinity (modo focus) não agenda timer — quem limpa é o
 * clearLegendFlash() ao sair do foco.
 */
export function triggerLegendFlash(flash: LegendFlash, holdMs = 2000): void {
  if (flashTimer) clearTimeout(flashTimer);
  flashTimer = null;
  useLegend.setState({
    flash: { ...flash, start: performance.now(), holdMs },
  });
  if (!Number.isFinite(holdMs)) return;
  flashTimer = setTimeout(
    () => {
      useLegend.setState({ flash: null });
      flashTimer = null;
    },
    holdMs + LEGEND_FLASH_FADE_S * 1000 + 120,
  );
}

/**
 * Solta um flash de hold indefinido COM fade: re-baseia o relógio para "o
 * hold acabou de terminar" — o envelope percorre o fade normal e o timer
 * limpa o estado no fim. Sem flash ativo, é no-op.
 */
export function clearLegendFlash(): void {
  const { flash } = useLegend.getState();
  if (!flash) return;
  if (flashTimer) clearTimeout(flashTimer);
  useLegend.setState({
    flash: { ...flash, start: performance.now(), holdMs: 0 },
  });
  flashTimer = setTimeout(
    () => {
      useLegend.setState({ flash: null });
      flashTimer = null;
    },
    LEGEND_FLASH_FADE_S * 1000 + 120,
  );
}

/** Envelope do flash em t=agora: 1 no hold, smootherstep → 0 no fade. */
export function legendFlashK(flash: ActiveLegendFlash, now: number): number {
  if (!Number.isFinite(flash.holdMs)) return 1; // hold indefinido (focus)
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
