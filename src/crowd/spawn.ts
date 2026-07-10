import { VAT } from "../vat/descriptor";
import type { CrowdAttributes } from "../vat/vatGeometry";

export interface SpawnParams {
  grid: number;
  area: number;
  /** Ruído de posição em unidades de espaçamento da grade (paridade com o patch). */
  noise: number;
  seed: number;
}

/** PRNG determinístico (mulberry32) — seed igual, multidão igual. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Preenche os atributos por instância com o spawn do patch cables (§4 da
 * análise): grade N×N sobre a área, deslocada por ruído; cor na paleta
 * rosa/roxo/branco (R∈[0.5,1], G∈[0,0.8], B∈[0.1,1]); fase aleatória.
 * Retorna o número de instâncias ativas.
 */
export function fillSpawn(attrs: CrowdAttributes, p: SpawnParams): number {
  const rng = mulberry32(p.seed);
  const n = Math.max(1, Math.floor(p.grid));
  const count = n * n;
  const spacing = p.area / n;

  for (let iz = 0; iz < n; iz++) {
    for (let ix = 0; ix < n; ix++) {
      const i = iz * n + ix;
      const gx = n > 1 ? ix / (n - 1) - 0.5 : 0;
      const gz = n > 1 ? iz / (n - 1) - 0.5 : 0;
      const x = gx * p.area + (rng() * 2 - 1) * p.noise * spacing;
      const z = gz * p.area + (rng() * 2 - 1) * p.noise * spacing;

      attrs.offset.setXYZ(i, x, 0, z);
      attrs.yaw.setX(i, rng() * Math.PI * 2);
      attrs.scale.setX(i, 0.8 + rng() * 0.2);
      attrs.color.setXYZ(i, 0.5 + rng() * 0.5, rng() * 0.8, 0.1 + rng() * 0.9);
      attrs.phase.setX(i, rng() * VAT.framesPerClip);
    }
  }

  attrs.offset.needsUpdate = true;
  attrs.yaw.needsUpdate = true;
  attrs.scale.needsUpdate = true;
  attrs.color.needsUpdate = true;
  attrs.phase.needsUpdate = true;
  return count;
}
