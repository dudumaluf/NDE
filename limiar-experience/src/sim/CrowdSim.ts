/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import {
  Fn,
  If,
  Loop,
  exp,
  float,
  hash,
  instanceIndex,
  instancedArray,
  int,
  length,
  min,
  mix,
  mx_noise_float,
  normalize,
  smoothstep,
  uniform,
  vec2,
  vec3,
} from "three/tsl";
import { vat } from "../vat/runtime";
import { mouseTarget } from "./mouseTarget";

type N = any;

/**
 * Simulação da multidão em compute (TSL).
 *
 * Estado por agente em storage buffers: posição, velocidade, direção
 * (suavizada) e fase do passo. Forças por frame:
 *   wander     — curl noise 2D (campo sem divergência, evolui no tempo)
 *   separação  — cada agente empurra os vizinhos: ninguém atravessa ninguém
 *                (O(N²) por enquanto; hash grid espacial é o upgrade p/ 16k+.
 *                 No fallback WebGL2 a separação desliga: transform feedback
 *                 não dá acesso aleatório aos buffers — doc 03 §10)
 *   contenção  — banda suave no raio do Campo (o "distance check" do patch)
 *   mouse      — atrai/repele em torno do alvo raycastado no chão
 *
 * A fase do passo integra a velocidade real: quem anda devagar pisa devagar.
 */
export class CrowdSim {
  readonly maxCount: number;

  readonly positions: N;
  readonly velocities: N;
  readonly headings: N;
  readonly phases: N;

  readonly u = {
    count: uniform(1024),
    dt: uniform(0.016),
    time: uniform(0),
    seed: uniform(3),
    gridN: uniform(32),
    spawnArea: uniform(40),
    spawnNoise: uniform(0.6),
    containRadius: uniform(21),
    containBand: uniform(5),
    maxSpeed: uniform(0.8),
    accel: uniform(4),
    drag: uniform(0.8),
    wanderWeight: uniform(1),
    wanderScale: uniform(0.12),
    wanderEvolve: uniform(0.12),
    sepWeight: uniform(1.6),
    sepRadius: uniform(0.7),
    mousePos: uniform(new THREE.Vector3()),
    mouseMode: uniform(0), // -1 repele, 0 off, +1 atrai
    mouseRadius: uniform(7),
    mouseWeight: uniform(1.2),
    turnRate: uniform(6),
    /** Frames de walk cycle por unidade percorrida (acopla passo à velocidade). */
    phasePerUnit: uniform(34),
  };

  private resetPass: N;
  private updateFull: N; // com separação (WebGPU)
  private updateNoSep: N; // sem separação (fallback WebGL2/TF)

  constructor(maxCount: number) {
    this.maxCount = maxCount;
    this.positions = instancedArray(maxCount, "vec3");
    this.velocities = instancedArray(maxCount, "vec3");
    this.headings = instancedArray(maxCount, "vec2");
    this.phases = instancedArray(maxCount, "float");

    this.resetPass = this.buildResetPass();
    this.updateFull = this.buildUpdatePass(true);
    this.updateNoSep = this.buildUpdatePass(false);
  }

  private buildResetPass(): N {
    const u = this.u;
    return Fn(() => {
      const i: N = float(instanceIndex);
      const n: N = u.gridN;
      const ix: N = i.mod(n);
      const iz: N = i.div(n).floor();
      const denom: N = n.sub(1).max(1);
      const spacing: N = u.spawnArea.div(n);

      const rnd = (k: number): N =>
        hash(i.add(u.seed.mul(7919)).add(float(k * 37.77)));

      const gx: N = ix.div(denom).sub(0.5).mul(u.spawnArea);
      const gz: N = iz.div(denom).sub(0.5).mul(u.spawnArea);
      const px: N = gx.add(rnd(1).mul(2).sub(1).mul(u.spawnNoise).mul(spacing));
      const pz: N = gz.add(rnd(2).mul(2).sub(1).mul(u.spawnNoise).mul(spacing));

      this.positions.element(instanceIndex).assign(vec3(px, 0, pz));
      this.velocities.element(instanceIndex).assign(vec3(0, 0, 0));

      const ang: N = rnd(3).mul(Math.PI * 2);
      this.headings.element(instanceIndex).assign(vec2(ang.sin(), ang.cos()));
      this.phases.element(instanceIndex).assign(rnd(4).mul(vat().framesPerClip));
    })().compute(this.maxCount);
  }

  private buildUpdatePass(withSeparation: boolean): N {
    const u = this.u;
    return Fn(() => {
      const selfI: N = int(instanceIndex);
      const p: N = this.positions.element(instanceIndex).toVar();
      const v: N = this.velocities.element(instanceIndex).toVar();

      // --- wander: curl de um potencial de noise (campo sem divergência) ---
      const pot = (xz: N): N =>
        mx_noise_float(
          vec3(
            xz.x.mul(u.wanderScale),
            xz.y.mul(u.wanderScale),
            u.time.mul(u.wanderEvolve),
          ),
        );
      const e = float(0.35);
      const dPdx: N = pot(p.xz.add(vec2(e, 0))).sub(pot(p.xz.sub(vec2(e, 0))));
      const dPdz: N = pot(p.xz.add(vec2(0, e))).sub(pot(p.xz.sub(vec2(0, e))));
      const wander: N = normalize(vec2(dPdz, dPdx.negate()).add(vec2(1e-5, 0)));

      const acc: N = wander.mul(u.wanderWeight).toVar();

      // --- separação: vizinhos empurram (evitação de sobreposição) ---
      if (withSeparation) {
        const sep: N = vec2(0, 0).toVar();
        Loop({ start: int(0), end: int(u.count), type: "int" }, ({ i: j }: any) => {
          If(j.notEqual(selfI), () => {
            const q: N = this.positions.element(j);
            const d: N = p.xz.sub(q.xz);
            const dist: N = length(d).add(1e-5);
            If(dist.lessThan(u.sepRadius), () => {
              const push: N = d
                .div(dist)
                .mul(u.sepRadius.sub(dist).div(u.sepRadius).pow(2));
              sep.addAssign(push);
            });
          });
        });
        const sepLen: N = length(sep).add(1e-5);
        const sepCapped: N = sep.div(sepLen).mul(min(sepLen, float(2.5)));
        acc.addAssign(sepCapped.mul(u.sepWeight));
      }

      // --- contenção: banda suave no limiar do Campo ---
      const centerDist: N = length(p.xz).add(1e-5);
      const inward: N = p.xz.div(centerDist).negate();
      const contain: N = smoothstep(
        u.containRadius.sub(u.containBand),
        u.containRadius,
        centerDist,
      );
      acc.addAssign(inward.mul(contain).mul(3));

      // --- mouse: atrai/repele dentro do raio ---
      const toMouse: N = u.mousePos.xz.sub(p.xz);
      const mDist: N = length(toMouse).add(1e-5);
      const mFall: N = smoothstep(u.mouseRadius, u.mouseRadius.mul(0.15), mDist);
      acc.addAssign(
        toMouse.div(mDist).mul(mFall).mul(u.mouseMode).mul(u.mouseWeight),
      );

      // --- integração com drag e teto de velocidade ---
      const dt: N = u.dt;
      const vel2: N = v.xz
        .add(acc.mul(u.accel).mul(dt))
        .mul(exp(u.drag.negate().mul(dt)))
        .toVar();
      const speed: N = length(vel2).add(1e-6);
      vel2.assign(vel2.mul(min(float(1), u.maxSpeed.div(speed))));

      const newPos: N = p.xz.add(vel2.mul(dt));
      this.positions.element(instanceIndex).assign(vec3(newPos.x, 0, newPos.y));
      this.velocities.element(instanceIndex).assign(vec3(vel2.x, 0, vel2.y));

      // --- direção suavizada (só gira quando há movimento real) ---
      const h: N = this.headings.element(instanceIndex).toVar();
      const spd: N = length(vel2);
      const turnK: N = float(1).sub(exp(u.turnRate.negate().mul(dt)));
      const targetDir: N = vel2.div(spd.add(1e-5));
      const blended: N = normalize(mix(h, targetDir, turnK).add(vec2(1e-6, 0)));
      const gate: N = smoothstep(0.02, 0.08, spd);
      this.headings
        .element(instanceIndex)
        .assign(normalize(mix(h, blended, gate).add(vec2(1e-6, 0))));

      // --- fase do passo integra a velocidade real ---
      const ph: N = this.phases.element(instanceIndex);
      this.phases
        .element(instanceIndex)
        .assign(ph.add(spd.mul(dt).mul(u.phasePerUnit)).mod(vat().framesPerClip));
    })().compute(this.maxCount);
  }

  reset(renderer: THREE.WebGPURenderer): void {
    renderer.compute(this.resetPass);
  }

  /** Avança um passo. `withSeparation=false` no fallback WebGL2. */
  update(
    renderer: THREE.WebGPURenderer,
    dt: number,
    withSeparation: boolean,
  ): void {
    this.u.dt.value = Math.min(dt, 1 / 20);
    this.u.time.value += this.u.dt.value;
    this.u.mousePos.value.copy(mouseTarget.point);
    this.u.mouseMode.value =
      mouseTarget.mode === "atrair" ? 1 : mouseTarget.mode === "repelir" ? -1 : 0;
    renderer.compute(withSeparation ? this.updateFull : this.updateNoSep);
  }
}
