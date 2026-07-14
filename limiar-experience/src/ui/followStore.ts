import { create } from "zustand";

/**
 * Follow em 3ª pessoa (M4d, doc 04 §4.1): clique numa pessoa hovered entra
 * em follow — a câmera viaja até ela e passa a acompanhá-la (OrbitControls
 * segue ligado: órbita/zoom livres ao redor da pessoa em movimento).
 * A timeline da história (M4e) e a Sintonia futura leem daqui.
 *
 * Sem fases (2026-07-13): o rig é contínuo — springs criticamente
 * amortecidas convergem no enquadre e o "lock" é a spring convergida. A
 * fase "transition"/"locked" antiga criava uma costura visível (snap) e
 * ninguém fora do rig precisava dela.
 */
export interface FollowState {
  /** Slot da pessoa seguida (= índice no manifest.people) ou null. */
  following: number | null;
}

export const useFollow = create<FollowState>(() => ({
  following: null,
}));

export function startFollow(i: number): void {
  useFollow.setState({ following: i });
}

/** Sai do follow SEM teleporte — a câmera fica onde está. */
export function stopFollow(): void {
  useFollow.setState({ following: null });
}
