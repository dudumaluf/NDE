/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import type { CrowdSim } from "./CrowdSim";

/**
 * Espelho CPU das posições dos agentes (M4c) — o que hover, follow e a
 * timeline precisam para "tocar" pessoas que vivem só na GPU.
 *
 * Mesmo padrão de readback provado no ClusterLabels (getArrayBufferAsync com
 * guarda de inflight), mas CONTÍNUO: ao completar um readback, o próximo é
 * agendado no requestAnimationFrame seguinte — um em voo por vez, ~60 Hz
 * efetivo, latência de 1–3 frames.
 *
 * A latência VARIÁVEL do readback vira "escada" se lida crua (a mesma
 * amostra por 1–3 frames e então um salto com o acumulado) — era metade do
 * jitter do follow em multidão densa (bug M4, 2026-07-13). Por isso o
 * espelho guarda as DUAS últimas amostras com timestamp e `getPosSmooth()`
 * re-fasea entre elas pelo tempo desde o readback (com extrapolação curta):
 * trajetória contínua por ~1 período extra de latência. `sampleAge()` expõe
 * a idade da amostra para quem quiser degradar sozinho.
 *
 * Stride por backend (aprendizado do M3.5): WebGPU aloca storage vec3 com
 * padding de vec4 (16 B) → 4 floats; WebGL2/transform feedback devolve
 * packed → 3. Detectado pelo tamanho do buffer.
 *
 * Singleton com refcount: PersonHover e o follow (M4d) chamam acquire() ao
 * montar e soltam ao desmontar — o loop só roda enquanto alguém precisa.
 */

/** Amostras mais velhas que isso não interpolam (aba/GC segurou o rAF). */
const MAX_PERIOD_MS = 250;
/** Extrapolação curta além da última amostra (fração do período). */
const MAX_ALPHA = 1.25;
/** Salto prev→cur maior que isso (m) = teleporte (reset) — não varrer. */
const TELEPORT_M2 = 4;

class PositionMirror {
  private data: Float32Array | null = null;
  private prev: Float32Array | null = null;
  private dataT = 0;
  private prevT = 0;
  private stride = 4;
  private refs = 0;
  private inflight = false;
  private raf = 0;
  private gl: THREE.WebGPURenderer | null = null;
  private sim: CrowdSim | null = null;
  /** true após o primeiro readback completo (getPos passa a responder). */
  ready = false;
  /** Falha de readback neste ambiente — consumidores degradam sozinhos. */
  broken = false;

  /** Liga o loop (1º acquire) e devolve o release. */
  acquire(gl: THREE.WebGPURenderer, sim: CrowdSim): () => void {
    this.gl = gl;
    this.sim = sim;
    this.refs += 1;
    if (this.refs === 1) {
      this.broken = false;
      this.pump();
    }
    let released = false;
    return () => {
      if (released) return;
      released = true;
      this.refs -= 1;
      if (this.refs <= 0) {
        cancelAnimationFrame(this.raf);
        this.ready = false;
        this.data = null;
        this.prev = null;
      }
    };
  }

  private pump = (): void => {
    if (!this.gl || !this.sim || this.refs <= 0 || this.inflight) return;
    // NUNCA ler antes do primeiro compute da sim: no WebGL2, um
    // getArrayBufferAsync prematuro registra o attribute VAZIO no cache do
    // backend e a criação real do buffer de transform feedback é pulada —
    // o compute quebra ("switchBuffers is not a function") e o renderer
    // trava. u.time só sai de 0 no primeiro update() real.
    if ((this.sim.u.time.value as number) <= 0) {
      this.raf = requestAnimationFrame(this.pump);
      return;
    }
    this.inflight = true;
    const sim = this.sim;
    this.gl
      .getArrayBufferAsync(sim.positions.value)
      .then((buf: ArrayBuffer) => {
        this.inflight = false;
        if (this.refs <= 0) return;
        const pos = new Float32Array(buf);
        if (pos.length === 0) {
          // WebGL2 pode devolver vazio se outro readback está em voo
          // (nota no AGENTS.md) — tenta de novo no próximo frame.
          this.raf = requestAnimationFrame(this.pump);
          return;
        }
        this.stride = pos.length >= sim.maxCount * 4 ? 4 : 3;
        // getArrayBufferAsync devolve buffer NOVO — dá para guardar as duas
        // últimas sem cópia (a penúltima alimenta a interpolação).
        this.prev = this.data;
        this.prevT = this.dataT;
        this.data = pos;
        this.dataT = performance.now();
        this.ready = true;
        this.raf = requestAnimationFrame(this.pump);
      })
      .catch(() => {
        this.inflight = false;
        this.broken = true;
      });
  };

  /** Posição do agente i → out. false enquanto o espelho não está pronto. */
  getPos(i: number, out: THREE.Vector3): boolean {
    const d = this.data;
    if (!d) return false;
    const o = i * this.stride;
    if (o + 2 >= d.length) return false;
    out.set(d[o], d[o + 1], d[o + 2]);
    return true;
  }

  /**
   * Posição CONTÍNUA do agente i → out: interpola penúltima→última amostra
   * re-faseada pelo tempo desde o readback (na chegada da amostra nova
   * mostramos a anterior e varremos até ela ao longo de um período; passa
   * dele, extrapola até 25%). Elimina a "escada" da latência variável —
   * hover/follow leem daqui, nunca a amostra crua.
   */
  getPosSmooth(i: number, out: THREE.Vector3, now = performance.now()): boolean {
    const cur = this.data;
    if (!cur) return false;
    const o = i * this.stride;
    if (o + 2 >= cur.length) return false;
    const prev = this.prev;
    const period = this.dataT - this.prevT;
    if (!prev || o + 2 >= prev.length || period <= 0 || period > MAX_PERIOD_MS) {
      out.set(cur[o], cur[o + 1], cur[o + 2]);
      return true;
    }
    const cx = cur[o];
    const cy = cur[o + 1];
    const cz = cur[o + 2];
    const dx = cx - prev[o];
    const dy = cy - prev[o + 1];
    const dz = cz - prev[o + 2];
    // Teleporte (reset da sim/pre-roll): adota a nova, sem varrer o mapa.
    if (dx * dx + dy * dy + dz * dz > TELEPORT_M2) {
      out.set(cx, cy, cz);
      return true;
    }
    const a = Math.min((now - this.dataT) / period, MAX_ALPHA);
    out.set(cx + dx * (a - 1), cy + dy * (a - 1), cz + dz * (a - 1));
    return true;
  }

  /** Idade da última amostra em ms (Infinity enquanto não há amostra). */
  sampleAge(now = performance.now()): number {
    return this.data ? now - this.dataT : Infinity;
  }
}

export const positionMirror = new PositionMirror();
