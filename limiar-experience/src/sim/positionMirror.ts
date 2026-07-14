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
 * efetivo, latência de 1–3 frames (invisível com o damping da câmera).
 *
 * Stride por backend (aprendizado do M3.5): WebGPU aloca storage vec3 com
 * padding de vec4 (16 B) → 4 floats; WebGL2/transform feedback devolve
 * packed → 3. Detectado pelo tamanho do buffer.
 *
 * Singleton com refcount: PersonHover e o follow (M4d) chamam acquire() ao
 * montar e soltam ao desmontar — o loop só roda enquanto alguém precisa.
 */
class PositionMirror {
  private data: Float32Array | null = null;
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
        this.data = pos;
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
}

export const positionMirror = new PositionMirror();
