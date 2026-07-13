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

export interface AgentMetaParams {
  /** Peso do assentamento em idle (sorteio idle vs rezar, doc 04 §5.5). */
  pesoIdle: number;
  /** Peso do assentamento em rezar. */
  pesoRezar: number;
  /** Multiplicador do peso de rezar p/ quem tem `transformacao` no corpus. */
  boostTransformacao: number;
}

/**
 * Preenche o meta por agente (vec4: x = com-história 0/1, y = probabilidade
 * de rezar ao assentar, z/w reservados p/ Maré/M4). O dado escolhe o gesto:
 * quem carrega o elemento `transformacao` tende a ajoelhar. Sem content/,
 * TODO mundo é "com-história" (multidão procedural do M2 não muda de
 * comportamento). CPU-only; subir com sim.commitAgentMeta().
 */
export function computeAgentMeta(
  content: Content | null,
  agentCount: number,
  out: Float32Array,
  { pesoIdle, pesoRezar, boostTransformacao }: AgentMetaParams,
): void {
  const probBase = pesoRezar / Math.max(pesoIdle + pesoRezar, 1e-6);
  const real = content ? 0 : 1;
  for (let i = 0; i < agentCount; i++) {
    out[i * 4 + 0] = real;
    out[i * 4 + 1] = probBase;
    out[i * 4 + 2] = 0;
    out[i * 4 + 3] = 0;
  }
  if (!content) return;

  const people = content.manifest.people;
  const n = Math.min(people.length, agentCount);
  for (let i = 0; i < n; i++) {
    const wRezar =
      pesoRezar *
      (people[i].elements.includes("transformacao") ? boostTransformacao : 1);
    out[i * 4 + 0] = 1;
    out[i * 4 + 1] = wRezar / Math.max(pesoIdle + wRezar, 1e-6);
  }
}
