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
  /** Testemunhas buscam alvo (w=1)? Gravidade OU lente elemento — nunca formação. */
  witnessSeek: boolean;
}

/**
 * Preenche `out` (vec4 por agente: xyz alvo no mundo, w = tem-alvo 0/1).
 * `witnessSeek` false: posições UMAP/lente ficam no buffer mas w=0 — a física
 * ignora (formação dos dormentes pode ligar seekWeight sem puxar testemunhas).
 * Sem lente: alvo = umap3d escalado (x,z no chão — eixos 0 e 2).
 * Com lente: quem TEM o elemento → anel interno (gravita ao centro);
 * quem NÃO tem → anel na borda da contenção. Ângulo preservado do layout
 * UMAP (vizinhanças não embaralham ao trocar de lente).
 */
export function computeTargets(
  content: Content,
  agentCount: number,
  out: Float32Array,
  { mapScale, containRadius, lens, witnessSeek }: AgentTargetParams,
): void {
  out.fill(0);
  const people = content.manifest.people;
  const n = Math.min(people.length, agentCount);
  const w = witnessSeek ? 1 : 0;

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
    out[i * 4 + 3] = w;
  }
}

/** Formações dos dormentes (2026-07-14, doc 04): o que os sem-história
 *  fazem enquanto os ativos migram. */
export type DormantFormation = "wander" | "circle" | "corridor" | "clear";

export const DORMANT_FORMATIONS: readonly DormantFormation[] = [
  "wander",
  "circle",
  "corridor",
  "clear",
];

export interface DormantTargetParams {
  /** Raio de contenção do Campo (círculo/clear ancoram nele). */
  containRadius: number;
  /** Recuo da moldura em relação à costura do wrap (m). Só quando worldWrap. */
  rimInset: number;
  /** Mundo-toro ligado — formações recuam da costura. */
  worldWrap: boolean;
  /** Espaçamento entre dormentes na formação (slider do leva). */
  spacing: number;
  /** Corridor: posição da pessoa seguida (positionMirror) — null cai em wander. */
  followPos: { x: number; z: number } | null;
  /** Corridor: heading estimado (unit XZ) do deslocamento da pessoa. */
  followHeading: { x: number; z: number } | null;
  /** Corridor: comprimento do corredor (~24 default). */
  corridorLength: number;
}

/** rng determinístico barato por slot (jitter estável das formações). */
function slotJitter(slot: number, k: number): number {
  const r = mulberry32(slot * 7 + k * 131071)();
  return r * 2 - 1;
}

/**
 * Escreve alvos nos slots DORMENTES (índices ≥ peopleCount) — as pessoas
 * reais não são tocadas (targets delas pertencem a computeTargets/lentes).
 * Retorna sem escrever nada em modo `wander` além de zerar w (comportamento
 * atual: dormente sem alvo vaga). Os dormentes ASSENTAM ao chegar pela
 * state machine existente (alvo ativo + perto + devagar = estado 3/4).
 *
 *  - `circle`: anel grandão (containRadius×0,92) em 2 fileiras intercaladas
 *    com jitter estável por slot — a multidão vira moldura enquanto os
 *    ativos migram aos núcleos.
 *  - `corridor`: duas fileiras ladeando o CAMINHO da pessoa seguida (final
 *    de maratona) — linhas paralelas ao heading estimado, à frente dela.
 *  - `clear`: recuam à borda máxima da contenção (foco total no cenário).
 */
function formationRimRadius(
  containRadius: number,
  rimInset: number,
  worldWrap: boolean,
): number {
  if (!worldWrap || rimInset <= 0) return containRadius;
  return Math.max(containRadius - rimInset, containRadius * 0.35);
}

export function computeDormantTargets(
  mode: DormantFormation,
  peopleCount: number,
  agentCount: number,
  out: Float32Array,
  {
    containRadius,
    rimInset,
    worldWrap,
    spacing,
    followPos,
    followHeading,
    corridorLength,
  }: DormantTargetParams,
): void {
  const nDormant = agentCount - peopleCount;
  if (nDormant <= 0) return;

  if (
    mode === "wander" ||
    (mode === "corridor" && (!followPos || !followHeading))
  ) {
    // Sem alvo: zera só o w (posição antiga é irrelevante com w=0).
    for (let i = peopleCount; i < agentCount; i++) out[i * 4 + 3] = 0;
    return;
  }

  if (mode === "circle" || mode === "clear") {
    const rim = formationRimRadius(containRadius, rimInset, worldWrap);
    // Anel: circle = moldura interna (0,92×rim); clear = borda do rim (não a costura).
    const baseR = mode === "circle" ? rim * 0.92 : rim;
    const rowGap = Math.max(spacing, 0.4);
    for (let i = peopleCount; i < agentCount; i++) {
      const k = i - peopleCount;
      const row = k % 2;
      const idxInRow = (k - row) / 2;
      const nInRow = Math.ceil(nDormant / 2);
      const angle =
        (idxInRow / Math.max(nInRow, 1)) * Math.PI * 2 +
        row * (Math.PI / Math.max(nInRow, 1)) +
        slotJitter(i, 1) * 0.02;
      const r = baseR - row * rowGap + slotJitter(i, 2) * rowGap * 0.35;
      out[i * 4 + 0] = Math.cos(angle) * r;
      out[i * 4 + 1] = 0;
      out[i * 4 + 2] = Math.sin(angle) * r;
      out[i * 4 + 3] = 1;
    }
    return;
  }

  // corridor: fileiras paralelas à direção de deslocamento da pessoa
  // seguida — 3 CAMADAS por lado (sebe de maratona: uma linha fina de 20
  // sumia no meio da multidão), começando um pouco atrás dela e se
  // estendendo à frente. Excedente espera no anel da borda.
  const hx = followHeading!.x;
  const hz = followHeading!.z;
  const px = followPos!.x;
  const pz = followPos!.z;
  // perpendicular (esquerda da direção de andar)
  const lx = -hz;
  const lz = hx;
  const halfWidth = Math.max(spacing * 1.6, 1.2);
  const step = Math.max(spacing, 0.4);
  const layerGap = Math.max(spacing * 0.8, 0.7);
  const layers = 3;
  const slotsPerRow = Math.max(1, Math.floor(corridorLength / step));
  const capacity = slotsPerRow * 2 * layers;
  const rim = formationRimRadius(containRadius, rimInset, worldWrap);

  for (let i = peopleCount; i < agentCount; i++) {
    const k = i - peopleCount;
    if (k >= capacity) {
      // Excedente: espera no anel (recuado da costura quando wrap ON).
      const angle =
        ((k - capacity) / Math.max(nDormant - capacity, 1)) * Math.PI * 2;
      out[i * 4 + 0] = Math.cos(angle) * rim;
      out[i * 4 + 1] = 0;
      out[i * 4 + 2] = Math.sin(angle) * rim;
      out[i * 4 + 3] = 1;
      continue;
    }
    const sideSign = k % 2 === 0 ? 1 : -1;
    const pairIdx = (k - (k % 2)) / 2;
    const layer = Math.floor(pairIdx / slotsPerRow);
    const idxInRow = pairIdx % slotsPerRow;
    // começa 15% atrás da pessoa — a fileira "abraça" quem passa; camadas
    // externas intercalam meio passo (tijolos, não grade).
    const along =
      (idxInRow + 0.5 + layer * 0.5) * step - corridorLength * 0.15;
    const jA = slotJitter(i, 3) * step * 0.25;
    const jW = slotJitter(i, 4) * 0.3;
    const width = halfWidth + layer * layerGap;
    out[i * 4 + 0] = px + hx * (along + jA) + lx * sideSign * (width + jW);
    out[i * 4 + 1] = 0;
    out[i * 4 + 2] = pz + hz * (along + jA) + lz * sideSign * (width + jW);
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
    out[i * 4 + 0] = person ? 1 : 0;
    out[i * 4 + 1] = gesture;
    out[i * 4 + 2] = 0;
    out[i * 4 + 3] = 0;
  }
}
