import type { CrowdAttributes } from "../vat/vatGeometry";

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
 * Preenche os atributos ESTÁTICOS por instância (posições e fases vivem na
 * CrowdSim, em GPU): variação de escala 0.8–1.0 e cor na paleta rosa/roxo/
 * branco do patch (R∈[0.5,1], G∈[0,0.8], B∈[0.1,1]).
 */
export function fillStaticAttributes(
  attrs: CrowdAttributes,
  count: number,
  seed: number,
): void {
  const rng = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    attrs.colorScale.setXYZW(
      i,
      0.5 + rng() * 0.5,
      rng() * 0.8,
      0.1 + rng() * 0.9,
      0.8 + rng() * 0.2,
    );
  }
  attrs.colorScale.needsUpdate = true;
}
