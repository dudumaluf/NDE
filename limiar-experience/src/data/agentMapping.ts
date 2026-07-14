import type { Content } from "./types";

/**
 * Mapeamento pessoa↔slot de agente (doc 03 §4.3): as pessoas reais ocupam os
 * primeiros N slots da multidão (slot i = manifest.people[i]); o resto da
 * multidão é dormente. Aqui ficam as contas de ALVO (gravidade/lentes) — puro
 * CPU, 46 escritas por mudança; a força de seek vive na CrowdSim (GPU).
 */

export interface AgentTargetParams {
  /** Escala do mapa: umap3d [-1,1] → mundo (default ~14). */
  mapScale: number;
  /** Raio de contenção do Campo (borda para onde quem não tem a lente recua). */
  containRadius: number;
  /** Lente ativa (key de elemento da taxonomy) ou null. */
  lens: string | null;
}

/**
 * Preenche `out` (vec4 por agente: xyz alvo no mundo, w = tem-alvo 0/1).
 * Sem lente: alvo = umap3d escalado (x,z no chão — eixos 0 e 2).
 * Com lente: quem TEM o elemento → anel interno (gravita ao centro);
 * quem NÃO tem → anel na borda da contenção. Ângulo preservado do layout
 * UMAP (vizinhanças não embaralham ao trocar de lente).
 */
export function computeTargets(
  content: Content,
  agentCount: number,
  out: Float32Array,
  { mapScale, containRadius, lens }: AgentTargetParams,
): void {
  out.fill(0);
  const people = content.manifest.people;
  const n = Math.min(people.length, agentCount);

  for (let i = 0; i < n; i++) {
    const person = people[i];
    const pos = content.layout[person.id];
    if (!pos) continue;

    const ux = pos.umap3d[0];
    const uz = pos.umap3d[2];
    let x = ux * mapScale;
    let z = uz * mapScale;

    if (lens) {
      const has = person.elements.includes(lens);
      const angle = Math.atan2(uz, ux);
      const radius = has ? 0.25 * mapScale : containRadius * 0.85;
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
    }

    out[i * 4 + 0] = x;
    out[i * 4 + 1] = 0;
    out[i * 4 + 2] = z;
    out[i * 4 + 3] = 1;
  }
}

/** Regra do Vocabulary: quem TEM `element` pode assentar no clipe designado. */
export interface SettleRule {
  /** Key de elemento da taxonomy (dados em PT — ex.: `transformacao`). */
  element: string;
  /** Índice GLOBAL do clipe-gesto (A ++ B — ver src/vat/runtime.ts). */
  clip: number;
  /** Peso no sorteio (0 = regra inerte). */
  weight: number;
}

export interface AgentMetaParams {
  /** Peso do assentamento em idle (sorteio do gesto, doc 04 §5.5). */
  pesoIdle: number;
  /** Peso do assentamento em rezar. */
  pesoRezar: number;
  /** Multiplicador do peso de rezar p/ quem tem `transformacao` no corpus. */
  boostTransformacao: number;
  /** Índice GLOBAL do clipe de rezar efetivo (Vocabulary/clipRoles). */
  prayClip: number;
  /** Regras elemento→clipe do grupo Vocabulary (doc 06). */
  rules: readonly SettleRule[];
}

/** PRNG determinístico (mulberry32): mesmo slot → mesma escolha, sempre. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Preenche o meta por agente (vec4: x = com-história 0/1, y = GESTO de
 * assentamento, z/w reservados p/ Maré/M4). Encoding do y: −1 = assenta no
 * idle próprio (estado 3); ≥0 = índice GLOBAL do clipe-gesto (estado 4).
 *
 * A escolha é um sorteio ponderado ESTÁVEL por slot (mulberry32(slot)):
 * candidatos = idle (pesoIdle) + rezar (pesoRezar, ×boost p/ quem tem
 * `transformacao`) + cada regra cujo elemento a pessoa TEM. O sorteio saiu
 * do shader (M4b): regras novas nunca mais tocam a GPU — o state pass só lê
 * o índice. Dormentes e modo procedural (content=null): idle vs rezar com
 * pesos base. CPU-only; subir com sim.commitAgentMeta().
 */
export function computeAgentMeta(
  content: Content | null,
  agentCount: number,
  out: Float32Array,
  { pesoIdle, pesoRezar, boostTransformacao, prayClip, rules }: AgentMetaParams,
): void {
  /** Sorteia o gesto entre candidatos [peso, clipe] (peso 0 é pulado). */
  const draw = (slot: number, cands: [number, number][]): number => {
    let total = 0;
    for (const [w] of cands) total += Math.max(w, 0);
    if (total <= 0) return -1;
    let r = mulberry32(slot)() * total;
    for (const [w, clip] of cands) {
      r -= Math.max(w, 0);
      if (r <= 0) return clip;
    }
    return cands[cands.length - 1][1];
  };

  const people = content?.manifest.people ?? null;
  const nReal = people ? Math.min(people.length, agentCount) : 0;
  const baseCands: [number, number][] = [
    [pesoIdle, -1],
    [pesoRezar, prayClip],
  ];

  for (let i = 0; i < agentCount; i++) {
    const person = people && i < nReal ? people[i] : null;
    let gesture: number;
    if (person) {
      const cands: [number, number][] = [
        [pesoIdle, -1],
        [
          pesoRezar *
            (person.elements.includes("transformacao") ? boostTransformacao : 1),
          prayClip,
        ],
      ];
      for (const rule of rules) {
        if (person.elements.includes(rule.element))
          cands.push([rule.weight, rule.clip]);
      }
      gesture = draw(i, cands);
    } else {
      // Dormente ou multidão procedural: só idle vs rezar, pesos base.
      gesture = draw(i, baseCands);
    }
    out[i * 4 + 0] = content && !person ? 0 : 1;
    out[i * 4 + 1] = gesture;
    out[i * 4 + 2] = 0;
    out[i * 4 + 3] = 0;
  }
}
