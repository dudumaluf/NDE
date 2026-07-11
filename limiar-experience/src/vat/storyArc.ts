import { vat } from "./runtime";
import type { VatClipPlayer } from "./VatClipPlayer";

let timers: number[] = [];

export function cancelStoryArc(): void {
  for (const t of timers) window.clearTimeout(t);
  timers = [];
}

/**
 * Demo do arco narrativo completo (doc 01 §4), morfando pelos 6 estados:
 * dormente → testemunho → a morte → o limiar (hold no chão) → o retorno →
 * integração. Preview em miniatura do futuro `director/` dirigido por beats.
 */
export function playStoryArc(player: VatClipPlayer): void {
  if (vat().clipCount < 6) return; // arco pressupõe os 6 estados do asset legado
  cancelStoryArc();
  const clipDur = vat().clipSeconds / Math.max(player.speed, 0.001);
  const at = (s: number, fn: () => void) =>
    timers.push(window.setTimeout(fn, s * 1000));

  player.play(0, { fade: 0.5 }); // dormente (idle)
  at(2.5, () => player.play(1)); // testemunho: caminha
  const death = 2.5 + 4.0;
  at(death, () => player.play(3, { fade: 0.3 })); // a morte: cai
  const rise = death + clipDur + 2.5; // hold no chão — "o limiar"
  at(rise, () => player.play(4, { fade: 0.3 })); // o retorno: levanta
  at(rise + clipDur, () => player.play(5, { fade: 0.4 })); // integração: reza
}
