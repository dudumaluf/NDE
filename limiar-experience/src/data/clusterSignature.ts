import type { Content } from "./types";

/**
 * Assinatura de um núcleo (2026-07-14): quais elementos o DEFINEM. Não é a
 * simples contagem (aí "inefabilidade" e "missão" — quase universais no
 * corpus — encabeçariam todos os núcleos). Usamos LIFT:
 *
 *   lift(elemento) = (% de membros do núcleo com o elemento)
 *                    ÷ (% do corpus inteiro com o elemento)
 *
 * lift > 1 = o elemento é MAIS comum aqui que no geral (marca o núcleo);
 * lift ≈ 1 = tão comum quanto no corpus (não distingue). Ordenamos por lift
 * desc com um piso de suporte (o elemento tem de aparecer em ≥2 membros, ou
 * em ≥40% se o núcleo for pequeno) para não promover coincidências de 1 voz.
 *
 * Tudo client-side sobre content.manifest.people — nenhuma dependência nova.
 */

export interface SignatureElement {
  key: string;
  label: string;
  /** Lift (≥0). */
  lift: number;
  /** Nº de membros do núcleo com o elemento. */
  inCluster: number;
  /** Fração de membros do núcleo com o elemento (0–1). */
  clusterPct: number;
  /** Fração do corpus com o elemento (0–1). */
  corpusPct: number;
}

export function clusterSignature(
  content: Content,
  clusterId: number,
  topN = 6,
): SignatureElement[] {
  const people = content.manifest.people;
  const total = people.length;
  if (total === 0) return [];

  const members = people.filter((p) => p.cluster_id === clusterId);
  const size = members.length;
  if (size === 0) return [];

  // Contagem no corpus (uma passada) e no núcleo.
  const corpusCount = new Map<string, number>();
  for (const p of people)
    for (const el of p.elements)
      corpusCount.set(el, (corpusCount.get(el) ?? 0) + 1);
  const clusterCount = new Map<string, number>();
  for (const p of members)
    for (const el of p.elements)
      clusterCount.set(el, (clusterCount.get(el) ?? 0) + 1);

  const labelByKey = new Map<string, string>();
  for (const el of content.taxonomy.elementos) labelByKey.set(el.key, el.label);

  // Suporte mínimo: ≥2 membros, ou ≥40% em núcleos pequenos (≤4).
  const minSupport = size <= 4 ? Math.ceil(size * 0.4) : 2;

  const out: SignatureElement[] = [];
  for (const [key, inCluster] of clusterCount) {
    if (inCluster < minSupport) continue;
    const corpusPct = (corpusCount.get(key) ?? 0) / total;
    if (corpusPct <= 0) continue;
    const clusterPct = inCluster / size;
    out.push({
      key,
      label: labelByKey.get(key) ?? key,
      lift: clusterPct / corpusPct,
      inCluster,
      clusterPct,
      corpusPct,
    });
  }

  // Ordena por lift; empate desfeito pela cobertura interna (mais membros).
  out.sort((a, b) => b.lift - a.lift || b.clusterPct - a.clusterPct);
  return out.slice(0, topN);
}
