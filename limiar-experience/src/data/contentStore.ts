import { create } from "zustand";
import type { Content, Manifest } from "./types";

/**
 * Loader do content/ (cópia do acervo/export). Fallback silencioso por
 * contrato (doc 03 §4.3): sem content/ o app roda procedural como no M2 —
 * status "absent" e nenhum erro no console além de um aviso informativo.
 */

export type ContentStatus = "loading" | "ready" | "absent";

interface ContentState {
  status: ContentStatus;
  content: Content | null;
}

export const useContent = create<ContentState>(() => ({
  status: "loading",
  content: null,
}));

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${import.meta.env.BASE_URL}content/${path}`);
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

/** Dispara o carregamento (uma vez, no boot). Nunca rejeita. */
export async function loadContent(): Promise<void> {
  try {
    const manifest = await fetchJson<Manifest>("manifest.json");
    const [layout, clusters, graph, taxonomy] = await Promise.all([
      fetchJson<Content["layout"]>("layout.json"),
      fetchJson<Content["clusters"]>("clusters.json"),
      fetchJson<Content["graph"]>("graph.json"),
      fetchJson<Content["taxonomy"]>("taxonomy.json"),
    ]);
    useContent.setState({
      status: "ready",
      content: { manifest, layout, clusters, graph, taxonomy },
    });
    console.info(
      `content: ${manifest.counts.people} pessoas · ` +
        `${clusters.length} núcleos · manifest ${manifest.content_hash}`,
    );
  } catch {
    useContent.setState({ status: "absent", content: null });
    console.info("content/ ausente — multidão procedural (fallback M2).");
  }
}
