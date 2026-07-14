/**
 * Player de áudio do LIMIAR (Voz v1, doc 04 §4.2): UM <audio> singleton
 * para o app inteiro — a experiência tem uma voz por vez (mesmo princípio
 * da Legend desvanecer no follow).
 *
 * Decisões:
 *  - Fades de ~120 ms em JS puro (rampa de el.volume por rAF) — nada de
 *    WebAudio: o ganho de um crossfade curto não paga um AudioContext.
 *  - "A última chamada vence": todo play()/stop() incrementa um token e os
 *    passos assíncronos (fade, el.play()) conferem o token antes de seguir —
 *    cliques rápidos nunca deixam dois áudios brigando.
 *  - Erros de rede/autoplay são engolidos (sem console.error): quem chama
 *    decide o estado vazio honesto (a UI já não oferece o que não existe).
 */

const FADE_MS = 120;

let el: HTMLAudioElement | null = null;
let token = 0;
let master = 1;
let muted = false;
let fadeRaf = 0;
let fadeDone: (() => void) | null = null;

function ensure(): HTMLAudioElement {
  if (!el) {
    el = new Audio();
    el.preload = "auto";
    el.muted = muted;
  }
  return el;
}

/** Cancela a rampa em curso (resolvendo a promise dela — ninguém pendura). */
function cancelFade(): void {
  if (fadeRaf) cancelAnimationFrame(fadeRaf);
  fadeRaf = 0;
  fadeDone?.();
  fadeDone = null;
}

function fadeTo(a: HTMLAudioElement, target: number, ms: number): Promise<void> {
  cancelFade();
  return new Promise((resolve) => {
    fadeDone = resolve;
    const from = a.volume;
    const t0 = performance.now();
    const step = () => {
      const k = Math.min(1, (performance.now() - t0) / ms);
      a.volume = from + (target - from) * k;
      if (k < 1) {
        fadeRaf = requestAnimationFrame(step);
      } else {
        fadeRaf = 0;
        fadeDone = null;
        resolve();
      }
    };
    fadeRaf = requestAnimationFrame(step);
  });
}

export interface PlayOptions {
  /** Chamado quando o corte termina sozinho (não em stop()/troca). */
  onEnd?: () => void;
}

/**
 * Toca `url` com fade-in curto; se algo estiver tocando, fade-out antes
 * (crossfade sequencial). Resolve true se ESTA chamada ficou tocando.
 */
export async function play(url: string, opts?: PlayOptions): Promise<boolean> {
  const my = ++token;
  const a = ensure();
  if (!a.paused) {
    await fadeTo(a, 0, FADE_MS);
    if (my !== token) return false;
    a.pause();
  }
  a.onended = null;
  a.src = url;
  a.volume = 0;
  try {
    await a.play();
  } catch {
    // autoplay bloqueado ou arquivo indisponível — silêncio honesto.
    return false;
  }
  if (my !== token) return false;
  a.onended = () => {
    if (my === token) opts?.onEnd?.();
  };
  void fadeTo(a, master, FADE_MS);
  return true;
}

/** Para com fade-out (ou imediatamente se nada toca). */
export async function stop(): Promise<void> {
  const my = ++token;
  const a = el;
  if (!a || a.paused) return;
  await fadeTo(a, 0, FADE_MS);
  if (my !== token) return;
  a.pause();
}

export interface PlayerState {
  url: string;
  playing: boolean;
  t: number;
  duration: number;
  /** 0..1 (0 quando a duração ainda não é conhecida). */
  progress: number;
}

/** Estado atual (para o anel de progresso e os ganchos dev) — sem eventos. */
export function state(): PlayerState | null {
  const a = el;
  if (!a || !a.src) return null;
  const duration = Number.isFinite(a.duration) ? a.duration : 0;
  return {
    url: a.src,
    playing: !a.paused && !a.ended,
    t: a.currentTime,
    duration,
    progress: duration > 0 ? Math.min(1, a.currentTime / duration) : 0,
  };
}

export function setMuted(m: boolean): void {
  muted = m;
  if (el) el.muted = m;
}

export function isMuted(): boolean {
  return muted;
}

// Gancho dev (sonda/screenshots e o próximo marco "cair na morte"): pula
// para uma fração do corte sem passar pela UI.
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as unknown as Record<string, unknown>).__limiarAudioSeek = (
    frac: number,
  ) => {
    if (el && Number.isFinite(el.duration) && el.duration > 0)
      el.currentTime = Math.max(0, Math.min(0.999, frac)) * el.duration;
  };
}
