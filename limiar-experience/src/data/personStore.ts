import { create } from "zustand";

/**
 * Detalhe de UMA pessoa (M4e): o app só carrega `/content/people/<id>.json`
 * quando o visitante entra em follow — 46 arquivos nunca são baixados de
 * uma vez. Cache em memória (voltar à mesma pessoa é instantâneo).
 *
 * Campos tipados = só o que a timeline usa (o JSON tem muito mais).
 */

export interface PersonBeat {
  beat_index: number;
  type: string;
  summary: string;
  /** Posição normalizada [0,1] no tempo total da entrevista. */
  t_norm: number;
  t_norm_end: number;
  start: number;
  end: number;
  video_id: string;
}

export interface PersonBeatEmotion {
  beat_index: number;
  /** Valência emocional −2 (terror) .. +2 (êxtase). */
  valence: number;
  label: string;
}

export interface PersonArcEnd {
  resumo: string;
  valence: number;
}

export interface PersonSummary {
  one_liner: string;
  short?: string;
}

/** Quote literal de um elemento (só o que o modo "elemento" da timeline usa). */
export interface PersonElementQuote {
  text: string;
  /** Posição normalizada [0,1] no tempo total da entrevista. */
  t_norm: number;
}

export interface PersonElement {
  key: string;
  quotes: PersonElementQuote[];
}

/**
 * Bloco `audio` do export (Voz v1): nomes dos arquivos de corte.
 * `beats[i]` alinha 1:1 POR POSIÇÃO com o array `beats` da pessoa;
 * `quotes[key][j]` alinha por posição com `elements[key].quotes[j]`.
 */
export interface PersonAudio {
  beats: { file: string; skip_in?: number }[];
  quotes?: Record<string, string[]>;
  whisper?: string;
}

export interface PersonDetail {
  id: string;
  display_name: string;
  summary?: PersonSummary;
  arc: {
    beats_emotion: PersonBeatEmotion[];
    entrada?: PersonArcEnd;
    saida?: PersonArcEnd;
    /** beat_index da virada do arco (ou null). */
    virada: number | null;
  };
  beats: PersonBeat[];
  /** Elementos com quotes (t_norm) — o modo "elemento" da timeline lê daqui. */
  elements?: PersonElement[];
  /** Arquivos de corte de áudio (ver src/audio/cuts.ts). */
  audio?: PersonAudio;
  timeline_norm: { total_s: number };
}

export interface PersonStoreState {
  /** Pessoa carregada (null = nenhuma/carregando). */
  person: PersonDetail | null;
  /** id em exibição (para descartar respostas atrasadas de outra pessoa). */
  personId: string | null;
  /** beat_index selecionado na timeline (Voz v1: clique também toca o corte). */
  activeBeat: number | null;
}

export const usePerson = create<PersonStoreState>(() => ({
  person: null,
  personId: null,
  activeBeat: null,
}));

const cache = new Map<string, PersonDetail>();

export async function loadPerson(id: string): Promise<void> {
  usePerson.setState({ personId: id, person: cache.get(id) ?? null, activeBeat: null });
  if (cache.has(id)) return;
  try {
    const res = await fetch(`/content/people/${id}.json`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const detail = (await res.json()) as PersonDetail;
    cache.set(id, detail);
    // Só publica se o visitante ainda está NESTA pessoa (troca rápida).
    if (usePerson.getState().personId === id)
      usePerson.setState({ person: detail });
  } catch (e) {
    console.warn(`[person] falha ao carregar people/${id}.json`, e);
  }
}

export function clearPerson(): void {
  usePerson.setState({ person: null, personId: null, activeBeat: null });
}

export function setActiveBeat(beatIndex: number | null): void {
  usePerson.setState({ activeBeat: beatIndex });
}
