import { vat } from "./runtime";

/**
 * Estado de blend entre dois clipes num instante — o contrato entre o player
 * (CPU) e o sampler TSL (GPU). blend 0 = só A, 1 = só B.
 */
export interface VatBlendState {
  clipA: number;
  frameA: number;
  loopA: boolean;
  clipB: number;
  frameB: number;
  loopB: boolean;
  blend: number;
}

interface Slot {
  clip: number;
  time: number;
}

const lastFrame = (): number => vat().framesPerClip - 1;
const clipLoop = (clip: number): boolean => vat().clips[clip]?.loop ?? true;

/**
 * Player de clipes VAT com crossfade seamless.
 *
 * Qualquer estado pode morfar em qualquer outro, fora de sequência: o clipe
 * atual continua tocando no slot A enquanto o novo sobe no slot B; o shader
 * mistura as posições dos vértices. One-shots (morrer, levantar) seguram o
 * último frame ao terminar (hold), como pede o doc 01 §4 ("o limiar").
 *
 * Nota: interromper um fade no meio "promove" o slot dominante — pode dar um
 * micro-pop se interrompido exatamente a 50%; com fades curtos é imperceptível.
 */
export class VatClipPlayer {
  private a: Slot = { clip: 0, time: 0 };
  private b: Slot | null = null;
  private blend = 0;
  private fadeSpeed = 1 / 0.35;
  private staticState: VatBlendState | null = null;

  /** Multiplicador de velocidade de playback (não afeta a duração do fade). */
  speed = 1;
  /** Duração default do crossfade, em segundos. */
  defaultFade = 0.35;

  /** Clipe "alvo" atual (o que está subindo, ou o estável). */
  get currentClip(): number {
    return this.b ? this.b.clip : this.a.clip;
  }

  play(clip: number, opts: { fade?: number } = {}): void {
    if (clip < 0 || clip >= vat().clipCount) return;
    this.staticState = null;
    if (this.currentClip === clip) return;
    if (this.b) {
      if (this.blend > 0.5) this.a = this.b;
    }
    this.b = { clip, time: 0 };
    this.blend = 0;
    const fade = opts.fade ?? this.defaultFade;
    this.fadeSpeed = fade > 0 ? 1 / fade : Number.POSITIVE_INFINITY;
  }

  /** Congela num estado exato (screenshots determinísticos via URL). */
  setStatic(s: {
    clipA?: number;
    frameA?: number;
    clipB?: number;
    frameB?: number;
    blend?: number;
  }): void {
    const clipA = s.clipA ?? 1;
    const clipB = s.clipB ?? clipA;
    this.staticState = {
      clipA,
      frameA: s.frameA ?? 0,
      loopA: clipLoop(clipA),
      clipB,
      frameB: s.frameB ?? s.frameA ?? 0,
      loopB: clipLoop(clipB),
      blend: s.blend ?? 0,
    };
  }

  /** Pula direto para um clipe sem fade (estado inicial). */
  snapTo(clip: number): void {
    this.staticState = null;
    this.a = { clip: Math.min(Math.max(clip, 0), vat().clipCount - 1), time: 0 };
    this.b = null;
    this.blend = 0;
  }

  update(dt: number): void {
    if (this.staticState) return;
    const d = dt * this.speed;
    this.a.time += d;
    if (this.b) {
      this.b.time += d;
      this.blend = Math.min(1, this.blend + dt * this.fadeSpeed);
      if (this.blend >= 1) {
        this.a = this.b;
        this.b = null;
        this.blend = 0;
      }
    }
  }

  /** Progresso [0,1] do clipe alvo (para sequenciar one-shots). */
  progress(): number {
    const slot = this.b ?? this.a;
    return Math.min(1, (slot.time * vat().fps) / lastFrame());
  }

  private frameOf(slot: Slot): number {
    const f = slot.time * vat().fps;
    return clipLoop(slot.clip)
      ? f % vat().framesPerClip
      : Math.min(f, lastFrame());
  }

  getState(): VatBlendState {
    if (this.staticState) return this.staticState;
    const a = this.a;
    const b = this.b ?? this.a;
    return {
      clipA: a.clip,
      frameA: this.frameOf(a),
      loopA: clipLoop(a.clip),
      clipB: b.clip,
      frameB: this.frameOf(b),
      loopB: clipLoop(b.clip),
      blend: this.b ? this.blend : 0,
    };
  }
}

/**
 * Instância compartilhada do protótipo: os botões de estado e as cenas
 * (personagem/multidão) falam com o mesmo player. No M4 isto evolui para o
 * `director/` com estado POR agente (buffers na GPU).
 */
export const vatPlayer = new VatClipPlayer();
