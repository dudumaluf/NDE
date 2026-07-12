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

export interface TaxonomyElement {
  key: string;
  label: string;
  dominio: string;
  nota?: string;
}

export interface Taxonomy {
  version: number;
  dominios: Record<string, string>;
  elementos: TaxonomyElement[];
  adjacentes: string[];
}

/** Tudo que o data layer entrega pronto para a cena. */
export interface Content {
  manifest: Manifest;
  layout: Layout;
  clusters: Cluster[];
  graph: Graph;
  taxonomy: Taxonomy;
}
