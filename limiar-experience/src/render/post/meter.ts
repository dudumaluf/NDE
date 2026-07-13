/**
 * Medidor de custo dos efeitos (pedido do Dudu: cada efeito mostra o que
 * custa NA MÁQUINA DELE, não num benchmark de outro mundo).
 *
 * Duas fontes, na ordem de preferência:
 * 1. GPU timestamps do renderer (trackTimestamp + resolveTimestampsAsync) —
 *    mede o tempo REAL de GPU do frame, imune ao vsync. SÓ no backend WebGPU
 *    ('timestamp-query'): o EXT_disjoint_timer_query do WebGL2 devolve
 *    valores instáveis no Chrome/ANGLE-Metal (medido: "mínimo" mais caro
 *    que "alto") — no fallback fica desabilitado via setGpuAllowed(false).
 * 2. Delta do rAF (frame time de parede) — sempre existe, mas só "vê" custo
 *    quando o frame estoura o orçamento do vsync.
 *
 * Custo por efeito = delta da média móvel (~2s) entre antes/depois do
 * toggle, com ~0.5s de settle para engolir a recompilação de shaders.
 * Aproximado por natureza — e suficiente (o objetivo é orçamento, não
 * profiling).
 */

const WINDOW_MS = 2000;
const SETTLE_MS = 600;
const COLLECT_MS = 2000;

interface Sample {
  t: number;
  cpu: number;
  gpu: number | null;
}

interface Pending {
  effect: string;
  sign: 1 | -1;
  before: number;
  settleUntil: number;
  collectUntil: number;
  sum: number;
  n: number;
}

export class FxMeter {
  private samples: Sample[] = [];
  private pending: Pending | null = null;
  private gpuSeen = false;
  private gpuAllowed = true;

  /** Custos medidos por efeito (ms). Null = ainda não medido. */
  readonly costs: Record<string, number> = {};
  /** Notifica a UI quando um custo novo chega. */
  onCost: ((effect: string, ms: number) => void) | null = null;

  /** false = ignora timestamps GPU (fallback WebGL2, valores não confiáveis). */
  setGpuAllowed(allowed: boolean): void {
    this.gpuAllowed = allowed;
    if (!allowed) this.gpuSeen = false;
  }

  /** Alimentar por frame: dt de parede (s) e timestamp GPU (ms) se houver. */
  update(dt: number, gpuMs: number | null): void {
    if (!this.gpuAllowed) gpuMs = null;
    const now = performance.now();
    if (gpuMs !== null && gpuMs > 0) this.gpuSeen = true;
    this.samples.push({ t: now, cpu: dt * 1000, gpu: gpuMs });
    const cutoff = now - WINDOW_MS;
    while (this.samples.length > 0 && this.samples[0].t < cutoff) {
      this.samples.shift();
    }

    const p = this.pending;
    if (p && now >= p.settleUntil) {
      const v = this.frameMs(gpuMs, dt * 1000);
      if (v !== null) {
        p.sum += v;
        p.n += 1;
      }
      if (now >= p.collectUntil && p.n > 8) {
        const after = p.sum / p.n;
        const cost = Math.max(0, (after - p.before) * p.sign);
        this.costs[p.effect] = cost;
        this.pending = null;
        this.onCost?.(p.effect, cost);
      }
    }
  }

  private frameMs(gpu: number | null, cpu: number): number | null {
    if (this.gpuSeen) return gpu !== null && gpu > 0 ? gpu : null;
    return cpu;
  }

  /** Média móvel do custo de frame (ms) — GPU se disponível, senão parede. */
  avgMs(): number {
    const vals = this.samples
      .map((s) => (this.gpuSeen ? s.gpu : s.cpu))
      .filter((v): v is number => v !== null && v > 0);
    if (vals.length === 0) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }

  /** FPS médio de parede na janela (para o auto-preset). */
  avgFps(): number {
    if (this.samples.length < 2) return 0;
    const cpuAvg =
      this.samples.reduce((a, s) => a + s.cpu, 0) / this.samples.length;
    return cpuAvg > 0 ? 1000 / cpuAvg : 0;
  }

  /** Fonte ativa da medição (para transparência na UI). */
  source(): "gpu" | "frame" {
    return this.gpuSeen ? "gpu" : "frame";
  }

  /**
   * Um efeito togglou: captura a média atual e agenda a coleta do "depois".
   * Toggle novo durante medição pendente descarta a anterior (contaminada).
   */
  beginToggle(effect: string, turnedOn: boolean): void {
    const now = performance.now();
    this.pending = {
      effect,
      sign: turnedOn ? 1 : -1,
      before: this.avgMs(),
      settleUntil: now + SETTLE_MS,
      collectUntil: now + SETTLE_MS + COLLECT_MS,
      sum: 0,
      n: 0,
    };
  }

  /** Mudanças em lote (presets) invalidam medição por efeito. */
  cancelToggle(): void {
    this.pending = null;
  }
}

/** "~0.8ms" para o label do leva; vazio enquanto não medido. */
export function fmtCost(ms: number | undefined): string {
  if (ms === undefined) return "";
  if (ms < 0.05) return " (~0ms)";
  return ` (~${ms.toFixed(1)}ms)`;
}
