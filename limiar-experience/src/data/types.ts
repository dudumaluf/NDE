/**
 * Contrato do export do acervo (doc 02 §10) — só os campos que o app usa.
 * Fonte: acervo/export/*.json, copiado para public/content/ pelo
 * scripts/sync-content.mjs (npm run sync-content, automático em dev/build).
 */

export interface ManifestPerson {
  id: string;
  display_name: string;
  tone: "positiva" | "negativa" | "mista" | string;
  cluster_id: number;
  elements: string[];
  n_beats: number;
}

export interface Manifest {
  export_version: number;
  generated_at: string;
  channel: string;
  counts: { people: number; beats: number; elements_distinct: number };
  people: ManifestPerson[];
  content_hash: string;
}

export interface LayoutEntry {
  umap3d: [number, number, number];
  umap2d: [number, number];
  cluster_id: number;
}

export type Layout = Record<string, LayoutEntry>;

export interface Cluster {
  id: number;
  label: string;
  size: number;
  members: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  weight: number;
  similarity: number;
  shared_elements: string[];
}

export interface Graph {
  edges: GraphEdge[];
}

/**
 * Recorte demográfico por pessoa (destilado dos people/*.json pelo
 * sync-content — campos da passada `acervo demographics` + cause_category).
 * Tudo nullable: null = não declarado no vídeo, nunca inventado.
 */
export interface PersonDemographics {
  sexo: string | null;
  religiao_contexto: string | null;
  local_evento: string | null;
  ano_evento: number | null;
  tempo_clinico_declarado: string | null;
  tempo_subjetivo_declarado: string | null;
  cause_category: string | null;
}

export type Demographics = Record<string, PersonDemographics>;

export interface TaxonomyElement {
  key: string;
  label: string;
  dominio: string;
  nota?: string;
  /** Frase curta para o visitante (a "frase do bottom" quando a lente ativa). */
  frase_visitante?: string;
}

/** Metadados das lentes demográficas no taxonomy.json (export ≥ 8016c499). */
export interface DemoLensMeta {
  key: string;
  label: string;
  campo?: string;
  frase_visitante?: string;
}

export interface Taxonomy {
  version: number;
  dominios: Record<string, string>;
  elementos: TaxonomyElement[];
  adjacentes: string[];
  lentes_demograficas?: DemoLensMeta[];
}

/** Tudo que o data layer entrega pronto para a cena. */
export interface Content {
  manifest: Manifest;
  layout: Layout;
  clusters: Cluster[];
  graph: Graph;
  taxonomy: Taxonomy;
  demographics: Demographics;
}
