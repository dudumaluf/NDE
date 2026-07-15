/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from "three/webgpu";
import {
  Fn,
  clamp,
  exp,
  float,
  fog,
  max,
  min,
  mix,
  positionView,
  positionWorld,
  smoothstep,
  time,
  uniform,
  vec3,
} from "three/tsl";
import { terrainU } from "../../scene/heightfield";

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
 *
 * RECUO POR ALTURA DA CÂMERA (pedido do Dudu, 2026-07-12 — "vistas de cima
 * engolem tudo em névoa"): acima de uma altura configurável (uRecuo) a
 * câmera "fura" a névoa — curva suave (smoothstep entre recuo e 1.75×recuo):
 *  1. a névoa de DISTÂNCIA desvanece (multiplicada por 1−camK): o god view
 *     enxerga o Campo inteiro em vez de uma poça cinza;
 *  2. o BANCO troca o caminho óptico: de cima, um raio só atravessa ~a
 *     espessura do banco (min(viewZ, 2.5×altura)), não a distância inteira
 *     até o chão — god view limpo, chão ainda enevoado.
 * uCamY é uniform atualizado pela câmera a cada frame (CPU, custo zero).
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
  /** Altura de câmera acima da qual a névoa recua (god view limpo). */
  setRecede(v: number): void;
  /** Altura ATUAL da câmera (chamar por frame — vira uniform). */
  setCamHeight(v: number): void;
  /** Cor da névoa (grupo Aparência — pode divergir do fundo). */
  setColor(hex: string): void;
}

export function buildHeightFog(fogColor: THREE.Color): HeightFogHandle {
  const uDensity: N = uniform(0.55);
  const uHeight: N = uniform(2.2);
  const uNoiseAmt: N = uniform(0.65);
  const uDrift: N = uniform(1);
  const uNear: N = uniform(14);
  const uFar: N = uniform(55);
  const uColor: N = uniform(fogColor);
  const uRecede: N = uniform(16);
  const uCamY: N = uniform(9);

  const viewZ: N = positionView.z.negate();

  // Recuo pela altura da câmera: 0 rente ao chão → 1 no god view, com
  // janela suave de 75% do próprio recuo (curva sem degrau perceptível).
  const camK: N = smoothstep(uRecede, uRecede.mul(1.75), uCamY);

  // 1) Névoa de distância — mesma curva do THREE.Fog(near, far) que ela
  //    troca; desvanece conforme a câmera sobe (god view enxerga o Campo).
  const distFactor: N = smoothstep(uNear, uFar, viewZ).mul(camK.oneMinus());

  // 2) Banco de altura: peso 1 no chão caindo exponencial até uHeight.
  const hNorm: N = clamp(positionWorld.y.div(max(uHeight, 0.001)), 0, 1);
  const heightBand: N = exp(hNorm.mul(-3));

  // Ruído lento em espaço de mundo (xz + deriva temporal) — "nuvens" do banco.
  // O scroll da esteira (terrainU.scroll*) desloca o domínio junto com o
  // chão — sem isso as nuvens ficam paradas enquanto o grid/terreno anda.
  // cheapTriNoise devolve ~[0, 0.9]; recentra para [1-amt, 1+amt].
  const drift: N = time.mul(uDrift);
  const noiseP: N = vec3(
    positionWorld.x.add(terrainU.scrollX).mul(0.09).add(drift.mul(0.05)),
    positionWorld.y.mul(0.22),
    positionWorld.z.add(terrainU.scrollZ).mul(0.09).sub(drift.mul(0.035)),
  );
  const noise: N = cheapTriNoise(noiseP, drift);
  // De cima o tri-noise (anisotrópico, cristas alinhadas aos eixos) viraria
  // listras — no god view as nuvens desligam junto com o recuo (×(1−camK))
  // e o banco vira um véu liso e uniforme sobre o chão.
  const noiseAmtEff: N = uNoiseAmt.mul(camK.oneMinus());
  const densMod: N = noise.mul(2.2).sub(1.1).mul(noiseAmtEff).add(1).max(0);

  // Extinção exponencial-quadrada pela distância percorrida "dentro" do
  // banco. De cima (camK→1) o caminho óptico satura em ~2.5× a altura do
  // banco: o raio de um god view só atravessa a espessura da camada — o
  // chão fica enevoado sem o Campo inteiro afundar no cinza.
  const effZ: N = mix(viewZ, min(viewZ, uHeight.mul(2.5)), camK);
  const sigma: N = uDensity.mul(0.14).mul(densMod).mul(heightBand).mul(effZ);
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
    setRecede: (v) => {
      uRecede.value = v;
    },
    setCamHeight: (v) => {
      uCamY.value = v;
    },
    setColor: (hex) => {
      (uColor.value as THREE.Color).set(hex);
    },
  };
}
