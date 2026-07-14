import { create } from "zustand";
import { qpStr } from "../lib/urlParams";
import type { PersonDetail } from "../data/personStore";
import { isMuted, setMuted } from "./player";

/**
 * Resolução de cortes de áudio (Voz v1): mapeia o que o visitante clicou na
 * timeline para a URL do corte no bucket público `audio-cortes` do Supabase.
 *
 * Mapeamento (descoberto do export, doc 03 §14.8): em people/<id>.json o
 * bloco `audio` referencia os arquivos —
 *   audio.beats[i].file  alinha 1:1 POR POSIÇÃO com beats[i]
 *                        (nome = beat_{beat_index:03d}_{type}.mp3);
 *   audio.quotes[key][j] alinha por posição com elements[key].quotes[j]
 *                        (nome = q_{key}_{j}.mp3).
 * No bucket os cortes são os MESMOS caminhos re-encodados em Opus:
 * <pessoa>/<arquivo>.opus.
 *
 * Base da URL (documentada no README): ?audio= > VITE_AUDIO_BASE > bucket.
 *
 * Disponibilidade: o bucket tem um `_index.json` (gerado pelo
 * scripts/audio-sync.mjs) com pessoa → cortes REALMENTE subidos. O app baixa
 * uma vez; ponto sem corte vira estado vazio honesto ("sem áudio ainda") —
 * sem HEAD por arquivo, sem 404 no console.
 */

const DEFAULT_BASE =
  "https://knqseuknuihqwlkfgesi.supabase.co/storage/v1/object/public/audio-cortes";

export function audioBase(): string {
  const qp = qpStr<string>("audio", "");
  if (qp) return qp.replace(/\/$/, "");
  const env = (import.meta.env.VITE_AUDIO_BASE as string | undefined) ?? "";
  if (env) return env.replace(/\/$/, "");
  return DEFAULT_BASE;
}

/** Um corte resolvido e disponível no bucket (pronto para tocar). */
export interface Cut {
  url: string;
  personId: string;
  /** beat da timeline dono do corte (quote usa o beat que a contém). */
  beatIndex: number;
  file: string;
}

export interface AudioIndexState {
  /** pessoa → arquivos .opus no bucket (null = índice ainda carregando). */
  index: Record<string, string[]> | null;
  /** true quando o fetch terminou (com ou sem sucesso). */
  ready: boolean;
  /** Corte tocando agora (a UI pulsa o ponto correspondente). */
  playing: Cut | null;
  muted: boolean;
}

export const useAudioIndex = create<AudioIndexState>(() => ({
  index: null,
  ready: false,
  playing: null,
  muted: isMuted(),
}));

let fetched = false;

/** Baixa o _index.json do bucket (uma vez; falha = sem áudio, sem erro). */
export function ensureAudioIndex(): void {
  if (fetched) return;
  fetched = true;
  fetch(`${audioBase()}/_index.json`)
    .then((res) => (res.ok ? res.json() : null))
    .then((doc: { people?: Record<string, string[]> } | null) => {
      useAudioIndex.setState({ index: doc?.people ?? {}, ready: true });
    })
    .catch(() => {
      useAudioIndex.setState({ index: {}, ready: true });
    });
}

export function setPlaying(cut: Cut | null): void {
  useAudioIndex.setState({ playing: cut });
}

export function toggleMuted(): boolean {
  const m = !useAudioIndex.getState().muted;
  setMuted(m);
  useAudioIndex.setState({ muted: m });
  return m;
}

const toOpus = (mp3: string) => mp3.replace(/\.mp3$/, ".opus");

function available(index: Record<string, string[]> | null, personId: string, opus: string): boolean {
  return Boolean(index?.[personId]?.includes(opus));
}

/** Corte do BEAT beat_index (posição espelhada beats ↔ audio.beats). */
export function beatCut(
  person: PersonDetail,
  beatIndex: number,
  index: Record<string, string[]> | null,
): Cut | null {
  const pos = person.beats.findIndex((b) => b.beat_index === beatIndex);
  const file = person.audio?.beats[pos]?.file;
  if (!file) return null;
  const opus = toOpus(file);
  if (!available(index, person.id, opus)) return null;
  return {
    url: `${audioBase()}/${person.id}/${opus}`,
    personId: person.id,
    beatIndex,
    file: opus,
  };
}

/**
 * Corte da QUOTE j do elemento key (j = posição ORIGINAL no JSON — quem
 * ordena por t_norm para desenhar precisa guardar o índice cru). Sem corte
 * de quote no bucket, cai no corte do beat que a contém (containingBeat).
 */
export function quoteCut(
  person: PersonDetail,
  elementKey: string,
  quoteIndex: number,
  containingBeat: number | null,
  index: Record<string, string[]> | null,
): Cut | null {
  const file = person.audio?.quotes?.[elementKey]?.[quoteIndex];
  if (file) {
    const opus = toOpus(file);
    if (available(index, person.id, opus) && containingBeat !== null) {
      return {
        url: `${audioBase()}/${person.id}/${opus}`,
        personId: person.id,
        beatIndex: containingBeat,
        file: opus,
      };
    }
  }
  return containingBeat !== null ? beatCut(person, containingBeat, index) : null;
}
