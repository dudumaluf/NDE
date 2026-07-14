import { create } from "zustand";

/**
 * Follow em 3ª pessoa (M4d, doc 04 §4.1): clique numa pessoa hovered entra
 * em follow — a câmera viaja até ela e passa a acompanhá-la (OrbitControls
 * segue ligado: órbita/zoom livres ao redor da pessoa em movimento).
 * A timeline da história (M4e) e a Sintonia futura leem daqui.
 */
export type FollowPhase = "transition" | "locked" | null;

export interface FollowState {
  /** Slot da pessoa seguida (= índice no manifest.people) ou null. */
  following: number | null;
  phase: FollowPhase;
}

export const useFollow = create<FollowState>(() => ({
  following: null,
  phase: null,
}));

export function startFollow(i: number): void {
  useFollow.setState({ following: i, phase: "transition" });
}

export function lockFollow(): void {
  if (useFollow.getState().following !== null)
    useFollow.setState({ phase: "locked" });
}

/** Sai do follow SEM teleporte — a câmera fica onde está. */
export function stopFollow(): void {
  useFollow.setState({ following: null, phase: null });
}
