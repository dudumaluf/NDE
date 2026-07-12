import type { Content, PersonDemographics } from "./types";
import { DEMO_ND_COLOR, demoCategoryColor, demoRampColor } from "./palette";

/**
 * Lentes demográficas: reorganizam a multidão por eixos NÃO-fenomenológicos
 * (sexo, década do evento, causa, geografia, trajetória religiosa, tempo),
 * estendendo o mecanismo de alvos das lentes v0 do M3. Tudo aqui é CPU pura
 * e determinístico: classificar 46 pessoas + escrever 46 alvos por mudança.
 *
 * Princípio ético (doc 00): campo null = "não declarado", nunca inventado —
 * quem não declarou vai para uma faixa própria na borda (ou atrás, na
 * linha do tempo), visível mas fora do arranjo.
 */

export type DemoLensKey = "sexo" | "decada" | "causa" | "geo" | "religiao" | "tempo";

export const DEMO_LENS_KEYS: readonly DemoLensKey[] = [
  "sexo",
  "decada",
  "causa",
  "geo",
  "religiao",
  "tempo",
];

/** Rótulo do dropdown → key interna (a URL ?dlens= usa a key). */
export const DEMO_LENS_LABELS: Record<DemoLensKey, string> = {
  sexo: "sexo",
  decada: "década do evento",
  causa: "causa",
  geo: "geografia",
  religiao: "trajetória religiosa",
  tempo: "tempo (clínico × subjetivo)",
};

export const ND_KEY = "não declarado";

export interface DemoCategory {
  key: string;
  label: string;
  count: number;
  color: [number, number, number];
  /** true = faixa "não declarado". */
  nd: boolean;
}

/** Posição ordinal (0–1) de uma pessoa em cada arco da lente "tempo". */
interface TempoPlace {
  clin: number | null;
  subj: number | null;
}

export interface DemoClassification {
  lens: DemoLensKey;
  /** Categorias na ordem de layout/legenda ("não declarado" sempre por último). */
  categories: DemoCategory[];
  /** Índice manifest → índice em categories. */
  personCat: number[];
  /** Só na lente "decada": ano do evento por pessoa (null = nd). */
  years: (number | null)[] | null;
  /** Só na lente "tempo": posição nos arcos por pessoa. */
  tempo: TempoPlace[] | null;
}

// ---------------------------------------------------------------------------
// Normalização e parses de texto livre (heurísticas leves, documentadas)
// ---------------------------------------------------------------------------

/** minúsculas + sem acentos ("Espírita" → "espirita"). */
function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Trajetória religiosa — bucketing heurístico do texto livre. Ordem de
 * checagem: matriz africana primeiro (palavras ultra-específicas; senão
 * "…umbanda…, hoje espiritualidade pessoal" cairia no bucket espírita),
 * depois espírita/espiritualidade (inclui "kardec"), católica, evangélica.
 */
function religionBucket(dem: PersonDemographics | undefined): string | null {
  const txt = dem?.religiao_contexto;
  if (!txt || !txt.trim()) return null;
  const t = norm(txt);
  if (t.includes("umbanda") || t.includes("candomble")) return "matriz africana";
  if (t.includes("espirit") || t.includes("kardec")) return "espírita/espiritualidade";
  if (t.includes("catol")) return "católica";
  if (t.includes("evangel") || t.includes("crente")) return "evangélica";
  return "outra";
}

/** Nomes de UF por extenso (normalizados; mais específicos primeiro). */
const UF_NAMES: readonly [string, string][] = [
  ["mato grosso do sul", "MS"],
  ["rio grande do sul", "RS"],
  ["rio grande do norte", "RN"],
  ["mato grosso", "MT"],
  ["minas gerais", "MG"],
  ["sao paulo", "SP"],
  ["rio de janeiro", "RJ"],
  ["santa catarina", "SC"],
  ["espirito santo", "ES"],
  ["distrito federal", "DF"],
  ["brasilia", "DF"],
  ["parana", "PR"],
  ["paraiba", "PB"],
  ["pernambuco", "PE"],
  ["maranhao", "MA"],
  ["sergipe", "SE"],
  ["alagoas", "AL"],
  ["bahia", "BA"],
  ["goias", "GO"],
  ["piaui", "PI"],
  ["ceara", "CE"],
  ["amazonas", "AM"],
  ["rondonia", "RO"],
  ["roraima", "RR"],
  ["tocantins", "TO"],
  ["amapa", "AP"],
  // "para" (Pará) fica de fora: colide com a preposição — só a sigla PA vale.
];

const COUNTRY_NAMES: readonly [string, string][] = [
  ["estados unidos", "EUA"],
  ["eua", "EUA"],
  ["noruega", "Noruega"],
  ["portugal", "Portugal"],
];

/** Siglas de UF: só valem MAIÚSCULAS no texto original ("SE" ≠ "se"). */
const UF_CODE_RE =
  /\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/g;

/**
 * Geografia — extrai UF/país do local_evento (texto livre). Vence o match
 * de MENOR índice no texto (o evento principal costuma vir primeiro:
 * "Ilhéus, Bahia; Ilha Grande, RJ" → BA). Nada resolvido → null (nd).
 */
function geoBucket(dem: PersonDemographics | undefined): string | null {
  const txt = dem?.local_evento;
  if (!txt || !txt.trim()) return null;
  const t = norm(txt);
  const hits: { idx: number; len: number; label: string }[] = [];
  for (const [pat, label] of [...UF_NAMES, ...COUNTRY_NAMES]) {
    const idx = t.indexOf(pat);
    if (idx >= 0) hits.push({ idx, len: pat.length, label });
  }
  UF_CODE_RE.lastIndex = 0;
  for (let m = UF_CODE_RE.exec(txt); m; m = UF_CODE_RE.exec(txt)) {
    hits.push({ idx: m.index, len: m[1].length, label: m[1] });
  }
  if (hits.length === 0) return null;
  hits.sort((a, b) => a.idx - b.idx || b.len - a.len);
  return hits[0].label;
}

const WORD_NUM: Record<string, number> = {
  um: 1, uma: 1, dois: 2, duas: 2, tres: 3, quatro: 4, cinco: 5, seis: 6,
  sete: 7, oito: 8, nove: 9, dez: 10, onze: 11, doze: 12, quinze: 15,
  vinte: 20, trinta: 30, quarenta: 40,
};

const UNIT_MINUTES: readonly [RegExp, number][] = [
  [/^min(uto)?s?$/, 1],
  [/^h(ora)?s?$/, 60],
  [/^dias?$/, 1440],
  [/^semanas?$/, 10080],
  [/^m(es|eses)$/, 43200],
  [/^anos?$/, 525600],
];

/**
 * Duração explícita em texto livre → minutos (a MAIOR encontrada).
 * "número unidade" com a unidade até 2 tokens à frente cobre "15 a 20
 * minutos", "cinco ou seis dias", "uma semana". Sem número → null.
 */
function parseDurationMinutes(text: string): number | null {
  const tokens = norm(text).split(/[^a-z0-9]+/).filter(Boolean);
  let best: number | null = null;
  for (let i = 0; i < tokens.length; i++) {
    const n = /^\d+$/.test(tokens[i]) ? Number(tokens[i]) : WORD_NUM[tokens[i]];
    if (!n) continue;
    for (let j = i + 1; j <= Math.min(i + 2, tokens.length - 1); j++) {
      const unit = UNIT_MINUTES.find(([re]) => re.test(tokens[j]));
      if (unit) {
        best = Math.max(best ?? 0, n * unit[1]);
        break;
      }
    }
  }
  return best;
}

const TEMPO_CLIN_BUCKETS = [
  { key: "clínico: minutos", max: 60 },
  { key: "clínico: horas", max: 2880 }, // até 48 h
  { key: "clínico: dias+", max: Infinity },
] as const;

/**
 * Tempo clínico → minutos (para ordenar o arco) + bucket. Sem número
 * explícito, heurísticas nominais: mês do calendário ("26 de outubro a
 * 27 de novembro") ou "coma"/"UTI" → dias+; "desmai" → minutos.
 * Nada disso → null (a pessoa fica fora do arco clínico).
 */
function parseClinical(txt: string | null): { minutes: number; bucket: string } | null {
  if (!txt || !txt.trim()) return null;
  const t = norm(txt);
  let minutes = parseDurationMinutes(txt);
  if (minutes === null) {
    if (/desmai/.test(t)) {
      minutes = 10; // desmaio: nominal minutos (checar ANTES dos meses: "desmaiou" ⊃ "maio")
    } else if (/\b(janeiro|fevereiro|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\b/.test(t)) {
      minutes = 43200; // intervalo de datas: nominal ~1 mês
    } else if (/\bcoma\b|\buti\b|internad/.test(t)) {
      minutes = 7200; // "em coma na UTI" sem número: nominal ~5 dias
    } else {
      return null;
    }
  }
  const bucket = TEMPO_CLIN_BUCKETS.find((b) => minutes! < b.max)!.key;
  return { minutes, bucket };
}

/**
 * Tempo subjetivo → escala 0–1 (comprimido → eternidade), para ordenar o
 * arco subjetivo. Heurística em camadas: duração com número > expressões
 * idiomáticas > "sem tempo/eternidade" > unidade solta no plural
 * ("pareceram dias"). Qualquer declaração vale; só null fica de fora.
 */
function parseSubjectiveRank(txt: string | null): number | null {
  if (!txt || !txt.trim()) return null;
  const t = norm(txt);
  const rankFromMinutes = (m: number): number =>
    m < 60 ? 0.15 : m < 1440 ? 0.4 : m < 10080 ? 0.5 : m < 43200 ? 0.6 : m < 525600 ? 0.65 : 0.8;
  const explicit = parseDurationMinutes(txt);
  if (explicit !== null) return rankFromMinutes(explicit);
  if (/dia inteiro/.test(t)) return 0.45;
  if (/piscar/.test(t)) return 0;
  if (/camera lenta/.test(t)) return 0.3;
  if (/\bvida\b/.test(t)) return 0.9;
  if (/nao existia|sem tempo|eternidade|nao tem dia|nao conseguiu entender|muito longo|mais longo|nao quantificad|sem concepcao/.test(t)) {
    return 1;
  }
  if (/\banos\b/.test(t)) return 0.8;
  if (/\bmeses\b/.test(t)) return 0.65;
  if (/\bdias\b/.test(t)) return 0.5;
  if (/\bhoras\b/.test(t)) return 0.4;
  if (/\bminutos\b/.test(t)) return 0.15;
  return 1; // declarou algo não-mensurável ("outro tempo") → ponta "sem medida"
}

// ---------------------------------------------------------------------------
// Classificação (pessoa → categoria) por lente
// ---------------------------------------------------------------------------

const CAUSE_LABELS: Record<string, string> = {
  acidente: "acidente",
  doenca: "doença",
  cirurgia: "cirurgia",
  afogamento: "afogamento",
  parada_cardiaca: "parada cardíaca",
  outro: "outro",
};

function nominalBucket(
  lens: DemoLensKey,
  dem: PersonDemographics | undefined,
): string | null {
  switch (lens) {
    case "sexo":
      return dem?.sexo?.trim() ? dem.sexo.trim() : null;
    case "causa": {
      const c = dem?.cause_category;
      if (!c || c === "nao_informado") return null;
      return CAUSE_LABELS[c] ?? c;
    }
    case "geo":
      return geoBucket(dem);
    case "religiao":
      return religionBucket(dem);
    case "decada": {
      const y = dem?.ano_evento;
      return typeof y === "number" ? `anos ${Math.floor(y / 10) * 10}` : null;
    }
    default:
      return null;
  }
}

function classifyTempo(content: Content): DemoClassification {
  const people = content.manifest.people;
  const catKeys = [
    "clínico: minutos",
    "clínico: horas",
    "clínico: dias+",
    "só subjetivo",
  ];
  const catColors: [number, number, number][] = [
    demoRampColor(0.05),
    demoRampColor(0.45),
    demoRampColor(0.9),
    demoCategoryColor(6), // violeta-ardósia: o tempo sem relógio
  ];

  const clinOf: ({ minutes: number; bucket: string } | null)[] = [];
  const subjOf: (number | null)[] = [];
  for (const p of people) {
    const dem = content.demographics[p.id];
    clinOf.push(parseClinical(dem?.tempo_clinico_declarado ?? null));
    subjOf.push(parseSubjectiveRank(dem?.tempo_subjetivo_declarado ?? null));
  }

  // Ordinais em cada arco: ordenar por valor, posição = índice/(n-1).
  const clinIdx = people.map((_, i) => i).filter((i) => clinOf[i] !== null);
  clinIdx.sort((a, b) => clinOf[a]!.minutes - clinOf[b]!.minutes || a - b);
  const subjIdx = people.map((_, i) => i).filter((i) => subjOf[i] !== null);
  subjIdx.sort((a, b) => subjOf[a]! - subjOf[b]! || a - b);

  const tempo: TempoPlace[] = people.map(() => ({ clin: null, subj: null }));
  clinIdx.forEach((pi, k) => {
    tempo[pi].clin = clinIdx.length > 1 ? k / (clinIdx.length - 1) : 0.5;
  });
  subjIdx.forEach((pi, k) => {
    tempo[pi].subj = subjIdx.length > 1 ? k / (subjIdx.length - 1) : 0.5;
  });

  const personCat: number[] = [];
  const counts = [0, 0, 0, 0, 0];
  for (let i = 0; i < people.length; i++) {
    let ci: number;
    if (clinOf[i]) ci = catKeys.indexOf(clinOf[i]!.bucket);
    else if (subjOf[i] !== null) ci = 3;
    else ci = 4; // nd
    personCat.push(ci);
    counts[ci] += 1;
  }

  const categories: DemoCategory[] = catKeys.map((key, i) => ({
    key,
    label: key,
    count: counts[i],
    color: catColors[i],
    nd: false,
  }));
  categories.push({
    key: ND_KEY,
    label: ND_KEY,
    count: counts[4],
    color: DEMO_ND_COLOR,
    nd: true,
  });

  return { lens: "tempo", categories, personCat, years: null, tempo };
}

/** Classifica as 46 pessoas na lente pedida (categorias + índice por pessoa). */
export function classifyDemoLens(
  lens: DemoLensKey,
  content: Content,
): DemoClassification {
  if (lens === "tempo") return classifyTempo(content);

  const people = content.manifest.people;
  const raw: (string | null)[] = people.map((p) =>
    nominalBucket(lens, content.demographics[p.id]),
  );

  const counts = new Map<string, number>();
  for (const k of raw) if (k) counts.set(k, (counts.get(k) ?? 0) + 1);

  const keys = [...counts.keys()];
  if (lens === "decada") {
    keys.sort((a, b) => Number(a.slice(5)) - Number(b.slice(5)));
  } else {
    keys.sort((a, b) => counts.get(b)! - counts.get(a)! || a.localeCompare(b));
  }

  const categories: DemoCategory[] = keys.map((key, i) => ({
    key,
    label: key,
    count: counts.get(key)!,
    color:
      lens === "decada"
        ? demoRampColor(keys.length > 1 ? i / (keys.length - 1) : 0.5)
        : demoCategoryColor(i),
    nd: false,
  }));
  const ndCount = raw.filter((k) => k === null).length;
  categories.push({
    key: ND_KEY,
    label: ND_KEY,
    count: ndCount,
    color: DEMO_ND_COLOR,
    nd: true,
  });

  const ndIndex = categories.length - 1;
  const indexOfKey = new Map(keys.map((k, i) => [k, i]));
  const personCat = raw.map((k) => (k === null ? ndIndex : indexOfKey.get(k)!));

  const years =
    lens === "decada"
      ? people.map((p) => content.demographics[p.id]?.ano_evento ?? null)
      : null;

  return { lens, categories, personCat, years, tempo: null };
}

// ---------------------------------------------------------------------------
// Layout (categoria → alvos no mundo)
// ---------------------------------------------------------------------------

export interface DemoTargetParams {
  mapScale: number;
  containRadius: number;
}

/** "Atrás" visto da câmera inicial (+X+Z): ângulo do raio que foge dela. */
const BACK_ANGLE = Math.atan2(-18, -14);
/** Frente: ângulo em direção à câmera inicial (setor maior de cara pro leitor). */
const FRONT_ANGLE = Math.atan2(18, 14);
/** Ângulo áureo (rad) — espiral de girassol nos aglomerados. */
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
/** Espaçamento-alvo entre pessoas dentro de um aglomerado. */
const PERSON_SPACING = 0.85;

function writeTarget(out: Float32Array, i: number, x: number, z: number): void {
  out[i * 4 + 0] = x;
  out[i * 4 + 1] = 0;
  out[i * 4 + 2] = z;
  out[i * 4 + 3] = 1;
}

/**
 * Faixa "não declarado" na borda da contenção: arco centrado atrás
 * (BACK_ANGLE), 1 ou 2 fileiras radiais conforme a quantidade.
 */
function writeNdBand(
  out: Float32Array,
  indices: number[],
  containRadius: number,
): void {
  const n = indices.length;
  if (n === 0) return;
  const radius = containRadius * 0.85;
  const rows = n > 14 ? 2 : 1;
  const perRow = Math.ceil(n / rows);
  const step = 1.05 / radius; // ~1.05 unidades entre pessoas ao longo do arco
  for (let j = 0; j < n; j++) {
    const row = Math.floor(j / perRow);
    const col = j % perRow;
    const inRow = Math.min(perRow, n - row * perRow);
    const a = BACK_ANGLE + (col - (inRow - 1) / 2) * step;
    const r = radius - row * 1.15;
    writeTarget(out, indices[j], Math.cos(a) * r, Math.sin(a) * r);
  }
}

/** Setores: um aglomerado circular (girassol) por categoria, num anel. */
function sectorTargets(
  cls: DemoClassification,
  out: Float32Array,
  { mapScale, containRadius }: DemoTargetParams,
): void {
  const cats = cls.categories.filter((c) => !c.nd);
  const K = cats.length;
  if (K === 0) return;

  const spreads = cats.map((c) => PERSON_SPACING * Math.sqrt(Math.max(c.count, 1)));
  const perimeter = spreads.reduce((s, r) => s + 2 * r, 0) * 1.25;
  const ringR = Math.min(
    Math.max(mapScale * 0.5, perimeter / (2 * Math.PI)),
    containRadius * 0.68,
  );

  const nd: number[] = [];
  const placed = cats.map(() => 0);
  for (let i = 0; i < cls.personCat.length; i++) {
    const ci = cls.personCat[i];
    if (cls.categories[ci].nd) {
      nd.push(i);
      continue;
    }
    const angle = FRONT_ANGLE + (2 * Math.PI * ci) / K;
    const cx = Math.cos(angle) * ringR;
    const cz = Math.sin(angle) * ringR;
    const j = placed[ci]++;
    const n = cats[ci].count;
    const r = spreads[ci] * Math.sqrt((j + 0.5) / n);
    const a = j * GOLDEN + ci * 1.7;
    writeTarget(out, i, cx + Math.cos(a) * r, cz + Math.sin(a) * r);
  }
  writeNdBand(out, nd, containRadius);
}

/**
 * Linha do tempo física (lente "década"): eixo X = ano real (1969→2025),
 * fileiras por ano ao longo de Z (quem divide o ano divide a fileira);
 * a distância vazia entre décadas É dado (ninguém dos anos 1970).
 * Nulls numa fileira atrás (Z negativo = longe da câmera inicial).
 */
function timelineTargets(
  cls: DemoClassification,
  out: Float32Array,
  { mapScale }: DemoTargetParams,
): void {
  const years = cls.years!;
  const known = years.filter((y): y is number => y !== null);
  const nd: number[] = [];
  if (known.length === 0) {
    writeNdBand(out, years.map((_, i) => i), mapScale);
    return;
  }
  const minY = Math.min(...known);
  const maxY = Math.max(...known);
  const span = Math.max(maxY - minY, 1);
  const half = mapScale * 0.95;

  // Pessoas por ano, na ordem do manifest (estável).
  const byYear = new Map<number, number[]>();
  years.forEach((y, i) => {
    if (y === null) {
      nd.push(i);
      return;
    }
    if (!byYear.has(y)) byYear.set(y, []);
    byYear.get(y)!.push(i);
  });

  // Espaçamento das fileiras > raio de chegada do seek (1.6), senão as
  // pessoas de um mesmo ano se fundem num nó.
  for (const [y, idxs] of byYear) {
    const x = ((y - minY) / span - 0.5) * 2 * half;
    idxs.forEach((pi, j) => {
      const z = (j - (idxs.length - 1) / 2) * 1.7;
      writeTarget(out, pi, x, z);
    });
  }

  // nd: fileira reta atrás da linha do tempo, espaçada e centrada.
  nd.forEach((pi, j) => {
    writeTarget(out, pi, (j - (nd.length - 1) / 2) * 1.7, -mapScale * 0.55);
  });
}

/**
 * Lente "tempo": dois arcos frente a frente. Arco norte = tempo SUBJETIVO
 * (comprimido → eternidade); arco sul = tempo clínico (curto → longo). Quem
 * declarou o subjetivo fica no arco norte NA POSIÇÃO SUBJETIVA mas com a COR
 * do seu bucket clínico — o contraste vira cor fora do lugar: "20 minutos"
 * (azul) parado lá na ponta da eternidade. O arco sul fica com quem só tem a
 * régua médica.
 */
function tempoTargets(
  cls: DemoClassification,
  out: Float32Array,
  { mapScale, containRadius }: DemoTargetParams,
): void {
  const xHalf = mapScale * 0.8;
  const zArc = mapScale * 0.4;
  const bulge = mapScale * 0.22;
  const nd: number[] = [];

  const arcPoint = (t: number, side: 1 | -1): [number, number] => {
    const x = (t - 0.5) * 2 * xHalf;
    const z = side * (zArc + bulge * (1 - (x / xHalf) ** 2));
    return [x, z];
  };

  for (let i = 0; i < cls.personCat.length; i++) {
    const place = cls.tempo![i];
    if (place.clin === null && place.subj === null) {
      nd.push(i);
      continue;
    }
    const [x, z] =
      place.subj !== null ? arcPoint(place.subj, 1) : arcPoint(place.clin!, -1);
    writeTarget(out, i, x, z);
  }
  writeNdBand(out, nd, containRadius);
}

/**
 * Preenche `out` (vec4/agente: xyz alvo, w tem-alvo) para a lente demográfica
 * ativa. Mesmo contrato do computeTargets das lentes v0; dormentes ficam w=0.
 */
export function computeDemoTargets(
  cls: DemoClassification,
  agentCount: number,
  out: Float32Array,
  params: DemoTargetParams,
): void {
  out.fill(0);
  if (cls.personCat.length > agentCount) return; // nunca acontece (46 ≤ 4096)
  if (cls.lens === "decada") timelineTargets(cls, out, params);
  else if (cls.lens === "tempo") tempoTargets(cls, out, params);
  else sectorTargets(cls, out, params);
}
