/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import {
  Fn,
  clamp,
  exp,
  float,
  fog,
  max,
  positionView,
  positionWorld,
  smoothstep,
  time,
  uniform,
  vec3,
} from "three/tsl";

type N = any;

/**
 * Tri-noise de DUAS oitavas (variação enxuta do triNoise3D do three, que fixa
 * 4 iterações): o banco de névoa é baixa-frequência por natureza — as duas
 * oitavas extras do original custavam ~2× e não apareciam no resultado.
 * Medido: derruba o custo da névoa pela metade em GPU fraca.
 */
const tri = (x: N): N => x.fract().sub(0.5).abs();
const tri3 = (p: N): N =>
  vec3(tri(p.z.add(tri(p.y))), tri(p.z.add(tri(p.x))), tri(p.y.add(tri(p.x))));

const cheapTriNoise = /*@__PURE__*/ Fn(([position, t]: N[]) => {
  const p: N = vec3(position).toVar();
  const z: N = float(1.4).toVar();
  const rz: N = float(0.0).toVar();
  const bp: N = vec3(position).toVar();
  for (let i = 0; i < 2; i++) {
    const dg: N = tri3(bp.mul(2.0));
    p.addAssign(dg.add(t.mul(0.035)));
    bp.mulAssign(1.8);
    z.mulAssign(1.5);
    p.mulAssign(1.2);
    rz.addAssign(tri(p.z.add(tri(p.x.add(tri(p.y))))).div(z));
    bp.addAssign(0.14);
  }
  return rz;
});

/**
 * Névoa de altura FAKE-volumétrica (doc 01: a névoa é personagem, não efeito).
 *
 * Substitui o fog linear da cena por um `scene.fogNode` TSL com dois termos:
 *
 * 1. distância — smoothstep(near, far, viewZ), paridade com o THREE.Fog atual
 *    (a cena continua mergulhando no cinza ao longe);
 * 2. altura — banco de névoa exponencial preso ao chão, com a densidade
 *    modulada por tri-noise ANIMADO devagar: o banco "respira" e deriva,
 *    parecendo volumétrico sem nenhum ray-marching (custo: 1 noise de 2
 *    oitavas por fragmento, só no forward pass — nada de pass extra).
 *
 * factor = max(dist, altura) — longe tudo afunda na névoa; perto, só o que
 * está baixo ganha o véu. Funciona idêntico nos dois backends (é só TSL de
 * material; nenhum recurso WebGPU-only).
 */

export interface HeightFogHandle {
  node: unknown;
  /** Densidade do banco de névoa (0 = só a névoa de distância clássica). */
  setDensity(v: number): void;
  /** Altura (em unidades de mundo) até onde o banco de névoa alcança. */
  setHeight(v: number): void;
  /** Quanto o ruído modula a densidade (0 = banco liso, 1 = nuvens fortes). */
  setNoiseAmount(v: number): void;
  /** Velocidade da deriva do ruído (1 = lenta, contemplativa). */
  setDrift(v: number): void;
  setRange(near: number, far: number): void;
}

export function buildHeightFog(fogColor: THREE.Color): HeightFogHandle {
  const uDensity: N = uniform(0.55);
  const uHeight: N = uniform(2.2);
  const uNoiseAmt: N = uniform(0.65);
  const uDrift: N = uniform(1);
  const uNear: N = uniform(14);
  const uFar: N = uniform(55);
  const uColor: N = uniform(fogColor);

  const viewZ: N = positionView.z.negate();

  // 1) Névoa de distância — mesma curva do THREE.Fog(near, far) que ela troca.
  const distFactor: N = smoothstep(uNear, uFar, viewZ);

  // 2) Banco de altura: peso 1 no chão caindo exponencial até uHeight.
  const hNorm: N = clamp(positionWorld.y.div(max(uHeight, 0.001)), 0, 1);
  const heightBand: N = exp(hNorm.mul(-3));

  // Ruído lento em espaço de mundo (xz + deriva temporal) — "nuvens" do banco.
  // cheapTriNoise devolve ~[0, 0.9]; recentra para [1-amt, 1+amt].
  const drift: N = time.mul(uDrift);
  const noiseP: N = vec3(
    positionWorld.x.mul(0.09).add(drift.mul(0.05)),
    positionWorld.y.mul(0.22),
    positionWorld.z.mul(0.09).sub(drift.mul(0.035)),
  );
  const noise: N = cheapTriNoise(noiseP, drift);
  const densMod: N = noise.mul(2.2).sub(1.1).mul(uNoiseAmt).add(1).max(0);

  // Extinção exponencial-quadrada pela distância percorrida "dentro" do banco.
  const sigma: N = uDensity.mul(0.14).mul(densMod).mul(heightBand).mul(viewZ);
  const heightFactor: N = sigma.mul(sigma).negate().exp().oneMinus();

  const factor: N = clamp(max(distFactor, heightFactor), 0, 1);
  const node: N = (fog as N)(uColor, factor);

  return {
    node,
    setDensity: (v) => {
      uDensity.value = v;
    },
    setHeight: (v) => {
      uHeight.value = v;
    },
    setNoiseAmount: (v) => {
      uNoiseAmt.value = v;
    },
    setDrift: (v) => {
      uDrift.value = v;
    },
    setRange: (near, far) => {
      uNear.value = near;
      uFar.value = far;
    },
  };
}
