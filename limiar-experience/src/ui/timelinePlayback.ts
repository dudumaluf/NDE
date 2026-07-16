import { beatCut, type Cut } from "../audio/cuts";
import type { PersonDetail } from "../data/personStore";
import { computeStations } from "./timelineStations";

/** Um beat tocável na ordem linear da régua (t_norm). */
export interface PlaybackItem {
  beatIndex: number;
  tNorm: number;
  cut: Cut;
}

/**
 * Fila de reprodução em ordem cronológica: todos os beats com corte no
 * bucket, ordenados por `t_norm` (estações e momentos intercalados).
 */
export function buildPlaybackQueue(
  person: PersonDetail,
  audioIndex: Record<string, string[]> | null,
): PlaybackItem[] {
  const beats = [...person.beats].sort(
    (a, b) => a.t_norm - b.t_norm || a.beat_index - b.beat_index,
  );
  const out: PlaybackItem[] = [];
  for (const b of beats) {
    const cut = beatCut(person, b.beat_index, audioIndex);
    if (cut) out.push({ beatIndex: b.beat_index, tNorm: b.t_norm, cut });
  }
  return out;
}

/** Próximo item após `beatIndex` na fila (null = fim ou beat desconhecido). */
export function nextPlaybackAfter(
  queue: PlaybackItem[],
  beatIndex: number,
): PlaybackItem | null {
  const i = queue.findIndex((q) => q.beatIndex === beatIndex);
  if (i < 0 || i >= queue.length - 1) return null;
  return queue[i + 1];
}

/** Beat é estação canônica (bolinha grande) — não sub-zoom de momento. */
export function isStationBeat(person: PersonDetail, beatIndex: number): boolean {
  const stations = computeStations(person);
  return stations.some((s) => s.beat.beat_index === beatIndex);
}
