import * as THREE from "three/webgpu";
import { clipInfo, vat, vatB } from "./runtime";
import type { VatBlendState } from "./VatClipPlayer";

/**
 * Root motion opcional (doc do descriptor: `rootMotion` no vat.json).
 *
 * Clipes assados "no lugar" exportam a trajetória removida da raiz — uma
 * amostra [x,y,z] por frame, na escala do bake. Este helper devolve o
 * deslocamento correspondente a um VatBlendState (lerp interframe + mix
 * pelo blend, como o shader faz com as posições), para a experiência aplicar
 * como TRANSLATE do mesh quando fizer sentido:
 *
 * - one-shots dirigidos/cinemáticos (um personagem atravessa a cena): some
 *   `rootMotionOffset(state) × escala` à posição do mesh;
 * - multidão simulada: NÃO use — o deslocamento vem da simulação (o clipe
 *   in-place é o correto, e é por isso que ele é o default no Studio).
 *
 * Em loops o offset volta ao início a cada volta (a amostra é por frame do
 * clipe, não acumulada) — para locomoção contínua, acumule o delta por volta
 * no chamador ou prefira a simulação.
 */

const sampled = new THREE.Vector3();
const a = new THREE.Vector3();
const b = new THREE.Vector3();

function sampleClip(clip: number, frame: number, out: THREE.Vector3): THREE.Vector3 {
  const rm = clipInfo(clip)?.rootMotion;
  if (!rm || rm.samples.length === 0) return out.set(0, 0, 0);
  const n = vat().framesPerClip;
  const f0 = Math.floor(frame) % n;
  const f1 = (f0 + 1) % n;
  const t = frame - Math.floor(frame);
  const s0 = rm.samples[Math.min(f0, rm.samples.length - 1)];
  const s1 = rm.samples[Math.min(f1, rm.samples.length - 1)];
  out.set(
    s0[0] + (s1[0] - s0[0]) * t,
    s0[1] + (s1[1] - s0[1]) * t,
    s0[2] + (s1[2] - s0[2]) * t,
  );
  // Clipes da VAT B: amostras estão na escala do bake de B — converte para o
  // espaço de A (deslocamentos: só a razão de escala; o translate cancela).
  const b = vatB();
  if (b && clip >= b.clipOffset) out.multiplyScalar(vat().normScale / b.normScale);
  return out;
}

/** True se algum clipe carregado (A ou B) exporta root motion. */
export function hasRootMotion(): boolean {
  return vat().rootMotion.length > 0 || (vatB()?.rootMotion.length ?? 0) > 0;
}

/**
 * Deslocamento da raiz para o estado de blend corrente, em unidades do bake
 * (multiplique pela mesma escala aplicada às posições da VAT). Escreve e
 * retorna `out` (default: vetor interno reutilizado — copie se for guardar).
 */
export function rootMotionOffset(s: VatBlendState, out: THREE.Vector3 = sampled): THREE.Vector3 {
  sampleClip(s.clipA, s.frameA, a);
  sampleClip(s.clipB, s.frameB, b);
  return out.copy(a).lerp(b, s.blend);
}
