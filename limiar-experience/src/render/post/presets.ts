/**
 * Presets de pós-processamento (doc 04: a névoa é personagem; a luz é dado).
 * Ordem de custo crescente — o auto-preset caminha por esta escada.
 *
 * - minimo: nada (bypass total, render direto como antes do módulo)
 * - leve:   vinheta + névoa de altura (quase grátis, roda em qualquer máquina)
 * - medio:  + bloom (realces de cor "respiram" luz)
 * - alto:   + AO (GTAO meia-resolução — só quando o hardware paga)
 */

export type FxPreset = "minimo" | "leve" | "medio" | "alto";

export const PRESET_ORDER: readonly FxPreset[] = [
  "minimo",
  "leve",
  "medio",
  "alto",
] as const;

/** Toggles de cada efeito. `nevoa` é material-level; o resto é pipeline. */
export interface FxFlags {
  bloom: boolean;
  ao: boolean;
  vinheta: boolean;
  nevoa: boolean;
}

export const PRESETS: Record<FxPreset, FxFlags> = {
  minimo: { bloom: false, ao: false, vinheta: false, nevoa: false },
  leve: { bloom: false, ao: false, vinheta: true, nevoa: true },
  medio: { bloom: true, ao: false, vinheta: true, nevoa: true },
  alto: { bloom: true, ao: true, vinheta: true, nevoa: true },
};

export function isPreset(v: string): v is FxPreset {
  return (PRESET_ORDER as readonly string[]).includes(v);
}

/** Quantos flags diferem entre dois estados (guarda da medição por toggle). */
export function flagsDiff(a: FxFlags, b: FxFlags): (keyof FxFlags)[] {
  const keys: (keyof FxFlags)[] = ["bloom", "ao", "vinheta", "nevoa"];
  return keys.filter((k) => a[k] !== b[k]);
}
